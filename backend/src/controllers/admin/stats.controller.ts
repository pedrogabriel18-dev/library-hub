import { Request, Response } from 'express'
import { prisma } from '../../utils/prisma'
import { asyncHandler } from '../../utils/asyncHandler'
import { statsCache } from '../../utils/cache'

const LOG_PAGE_SIZE = 20
const CACHE_TTL = 120000 // 2 minutos em milissegundos

/**
 * Retorna estatísticas do dashboard administrativo.
 * Suporta paginação de logs via query param `?logPage=N`. (#11)
 */
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const logPage = Math.max(1, parseInt((req.query.logPage as string) || '1'))
  const cacheKey = `admin_stats_page_${logPage}`

  const cachedData = statsCache.get<any>(cacheKey)
  if (cachedData) {
    return res.json({
      success: true,
      data: cachedData,
    })
  }

  const logSkip = (logPage - 1) * LOG_PAGE_SIZE

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    totalBooks,
    totalTCCs,
    totalDownloads,
    pendingReviews,
    approvedReviews,
    rejectedReviews,
    readingsToday,
    totalLogs,
    recentLogs,
    mostAccessedBooks,
    mostDownloadedBooks,
    highestRatedBooks,
    mostAccessedTccs,
    recentBooks,
    recentTccs,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.book.count({ where: { isPublished: true } }),
    prisma.tCC.count({ where: { isPublished: true } }),
    prisma.download.count(),
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.review.count({ where: { status: 'APPROVED' } }),
    prisma.review.count({ where: { status: 'REJECTED' } }),
    prisma.readingHistory.count({
      where: {
        accessedAt: {
          gte: startOfToday,
        },
      },
    }),
    prisma.log.count(),
    prisma.log.findMany({
      orderBy: { createdAt: 'desc' },
      skip: logSkip,
      take: LOG_PAGE_SIZE,
      include: { user: { select: { name: true, role: true } } },
    }),
    prisma.book.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
      include: { authors: { include: { author: true } } },
    }),
    prisma.book.findMany({
      where: { isPublished: true },
      orderBy: { downloadCount: 'desc' },
      take: 5,
      include: { authors: { include: { author: true } } },
    }),
    prisma.book.findMany({
      where: { isPublished: true },
      orderBy: { avgRating: 'desc' },
      take: 5,
      include: { authors: { include: { author: true } } },
    }),
    prisma.tCC.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
      include: { author: true, category: true },
    }),
    prisma.book.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { authors: { include: { author: true } }, category: true },
    }),
    prisma.tCC.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { author: true, category: true },
    }),
  ])

  const responseData = {
    totals: {
      totalUsers,
      totalBooks,
      totalTCCs,
      totalDownloads,
      pendingReviews,
      approvedReviews,
      rejectedReviews,
      readingsToday,
    },
    recentLogs,
    logsPagination: {
      page: logPage,
      total: totalLogs,
      totalPages: Math.ceil(totalLogs / LOG_PAGE_SIZE),
    },
    mostAccessedBooks,
    mostDownloadedBooks,
    highestRatedBooks,
    mostAccessedTccs,
    recentBooks,
    recentTccs,
  }

  // Grava no cache
  statsCache.set(cacheKey, responseData, CACHE_TTL)

  return res.json({
    success: true,
    data: responseData,
  })
})

export const getTrendingByTurma = asyncHandler(async (req: Request, res: Response) => {
  const { turma } = req.query

  if (!turma) {
    return res.status(400).json({ success: false, message: 'A turma é obrigatória.' })
  }

  const turmaName = turma as string
  const cacheKey = `trending_turma_${turmaName}`

  const cachedData = statsCache.get<any>(cacheKey)
  if (cachedData) {
    return res.json({
      success: true,
      data: cachedData,
    })
  }

  // 1. Livros mais acessados pela turma
  const historyGroup = await prisma.readingHistory.groupBy({
    by: ['bookId'],
    where: {
      user: { turma: { equals: turmaName } }
    },
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 5
  })

  let books: any[] = []
  if (historyGroup.length > 0) {
    const topBookIds = historyGroup.map(g => g.bookId)
    const dbBooks = await prisma.book.findMany({
      where: {
        id: { in: topBookIds },
        isPublished: true
      },
      include: {
        category: true,
        authors: { include: { author: true } }
      }
    })
    books = topBookIds
      .map(id => dbBooks.find(b => b.id === id))
      .filter((b): b is NonNullable<typeof b> => !!b)
  }

  // Se não houver histórico para esta turma, pega os livros mais lidos globais
  if (books.length === 0) {
    books = await prisma.book.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
      include: {
        category: true,
        authors: { include: { author: true } }
      }
    })
  }

  // 2. TCCs mais acessados pela turma
  const logs = await prisma.log.findMany({
    where: {
      action: 'TCC_ACCESSED',
      user: { turma: { equals: turmaName } }
    },
    select: {
      metadata: true
    }
  })

  const tccCounts: Record<string, number> = {}
  for (const log of logs) {
    try {
      const meta = JSON.parse(log.metadata || '{}')
      const tccId = meta.tccId
      if (tccId) {
        tccCounts[tccId] = (tccCounts[tccId] || 0) + 1
      }
    } catch {}
  }

  const topTccIds = Object.entries(tccCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0])

  let tccs: any[] = []
  if (topTccIds.length > 0) {
    const dbTccs = await prisma.tCC.findMany({
      where: {
        id: { in: topTccIds },
        isPublished: true
      },
      include: {
        author: true,
        category: true
      }
    })
    tccs = topTccIds
      .map(id => dbTccs.find(t => t.id === id))
      .filter((t): t is NonNullable<typeof t> => !!t)
  }

  // Se não houver acessos de TCC para esta turma, pega os mais acessados globais
  if (tccs.length === 0) {
    tccs = await prisma.tCC.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
      include: {
        author: true,
        category: true
      }
    })
  }

  const responseData = {
    books,
    tccs
  }

  statsCache.set(cacheKey, responseData, CACHE_TTL)

  return res.json({
    success: true,
    data: responseData
  })
})
