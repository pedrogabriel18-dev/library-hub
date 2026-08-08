import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { registerEvent } from '../utils/eventFeed'

export const listTCCs = asyncHandler(async (req: Request, res: Response) => {
  const { search, year, category, course, advisor, sort, page = '1', limit = '12' } = req.query

  const pageNum = Math.max(1, parseInt(page as string))
  const limitNum = Math.min(50, parseInt(limit as string))
  const skip = (pageNum - 1) * limitNum

  const where: Record<string, unknown> = { isPublished: true }

  if (year) where.year = parseInt(year as string)
  if (category) where.category = { slug: category }
  if (course) where.course = { contains: course as string }

  // Filtro por orientador (nome parcial via advisor profile)
  if (advisor) {
    where.advisorUser = { name: { contains: advisor as string } }
  }

  // Filtro por autor (nome parcial)
  if (req.query.author) {
    where.author = { name: { contains: req.query.author as string } }
  }

  if (search) {
    where.OR = [
      { title: { contains: search as string } },
      { abstract: { contains: search as string } },
      { keywords: { contains: search as string } },
      { author: { name: { contains: search as string } } },
      { advisorUser: { name: { contains: search as string } } },
      { course: { contains: search as string } },
    ]
  }

  // Ordenação: trending (viewCount) ou mais recentes (createdAt)
  const orderBy: any = sort === 'trending'
    ? [{ viewCount: 'desc' }, { year: 'desc' }]
    : sort === 'year'
    ? { year: 'desc' }
    : { createdAt: 'desc' }

  const [tccs, total, topTccs] = await Promise.all([
    prisma.tCC.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
      include: { author: true, category: true, advisorUser: true },
    }),
    prisma.tCC.count({ where }),
    prisma.tCC.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: { id: true },
    }),
  ])

  const topTccIds = topTccs.map((t) => t.id)
  const tccsWithTrending = tccs.map((t) => ({
    ...t,
    isTrending: topTccIds.includes(t.id),
  }))

  return res.json({
    success: true,
    data: tccsWithTrending,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  })
})

export const getTCC = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params

  const tcc = await prisma.tCC.findUnique({
    where: { slug, isPublished: true },
    include: { author: true, category: true, advisorUser: true },
  })

  if (!tcc) {
    return res.status(404).json({ success: false, message: 'TCC não encontrado.' })
  }

  // Incrementa visualizações
  const updatedTcc = await prisma.tCC.update({
    where: { id: tcc.id },
    data: { viewCount: { increment: 1 } },
  })
  tcc.viewCount = updatedTcc.viewCount

  // Verifica se o TCC está no Top 5 para registrar o evento TRENDING_TCC
  try {
    const top5Tccs = await prisma.tCC.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: { id: true }
    })
    const isNowTop5 = top5Tccs.some(t => t.id === tcc.id)
    if (isNowTop5) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentTrendingEvent = await prisma.eventFeed.findFirst({
        where: {
          type: 'TRENDING_TCC',
          url: `/tccs/${tcc.slug}`,
          createdAt: { gte: oneDayAgo }
        }
      })
      if (!recentTrendingEvent) {
        await registerEvent('TRENDING_TCC', {
          title: tcc.title,
          slug: tcc.slug,
          coverImage: tcc.coverImage
        })
      }
    }
  } catch (err) {
    console.error('[getTCC.trendingCheck] Erro:', err)
  }

  // Registra o acesso no Log com debounce de 1 hora por usuário
  const userId = req.user?.userId
  if (userId) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentLog = await prisma.log.findFirst({
      where: {
        userId,
        action: 'TCC_ACCESSED',
        createdAt: { gte: oneHourAgo },
        metadata: { contains: tcc.id },
      },
    })

    if (!recentLog) {
      await prisma.log.create({
        data: {
          userId,
          action: 'TCC_ACCESSED',
          description: `Acessou o TCC: ${tcc.title}`,
          metadata: JSON.stringify({ tccId: tcc.id, slug: tcc.slug }),
        },
      })
    }
  }

  // TCCs relacionados (mesma categoria, excluindo o atual)
  const related = await prisma.tCC.findMany({
    where: {
      isPublished: true,
      id: { not: tcc.id },
      categoryId: tcc.categoryId ?? undefined,
    },
    orderBy: { viewCount: 'desc' },
    take: 4,
    include: { author: true, category: true },
  })

  // Verifica se está no Top 5 (Trending)
  const topTccs = await prisma.tCC.findMany({
    where: { isPublished: true },
    orderBy: { viewCount: 'desc' },
    take: 5,
    select: { id: true },
  })
  const isTrending = topTccs.some((t) => t.id === tcc.id)

  return res.json({ success: true, data: { ...tcc, isTrending, related } })
})
