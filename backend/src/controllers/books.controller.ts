import { Request, Response } from 'express'
import fs from 'fs'
import { Readable } from 'stream'
import { prisma } from '../utils/prisma'
import { resolveAppPath, resolveSafeAppPath } from '../utils/paths'
import { asyncHandler } from '../utils/asyncHandler'
import { registerEvent } from '../utils/eventFeed'

export const listBooks = asyncHandler(async (req: Request, res: Response) => {
  const { category, search, sort, page = '1', limit = '12' } = req.query

  const pageNum = Math.max(1, parseInt(page as string))
  const limitNum = Math.min(50, parseInt(limit as string))
  const skip = (pageNum - 1) * limitNum

  const where: Record<string, unknown> = { isPublished: true }

  if (category) where.category = { slug: category }

  if (search) {
    where.OR = [
      { title: { contains: search as string } },
      { synopsis: { contains: search as string } },
      { authors: { some: { author: { name: { contains: search as string } } } } },
    ]
  }

  // Define ordenação: viewCount (em alta) ou data de criação
  const orderBy: any = sort === 'trending'
    ? [{ viewCount: 'desc' }, { createdAt: 'desc' }]
    : { createdAt: 'desc' }

  const [books, total, topBooks] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
      include: {
        category: true,
        authors: { include: { author: true } },
      },
    }),
    prisma.book.count({ where }),
    prisma.book.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: { id: true },
    }),
  ])

  const topBookIds = topBooks.map((b) => b.id)
  const booksWithTrending = books.map((b) => ({
    ...b,
    isTrending: topBookIds.includes(b.id),
  }))

  return res.json({
    success: true,
    data: booksWithTrending,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  })
})

export const getBook = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params
  const userId = req.user?.userId

  const book = await prisma.book.findUnique({
    where: { slug, isPublished: true },
    include: {
      category: true,
      authors: { include: { author: true } },
      reviews: {
        where: { status: 'APPROVED' },
        include: { user: { select: { name: true, avatarId: true, turma: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!book) {
    return res.status(404).json({ success: false, message: 'Livro não encontrado.' })
  }

  // Incrementa contador de visualizações
  const updatedBook = await prisma.book.update({
    where: { id: book.id },
    data: { viewCount: { increment: 1 } },
  })
  book.viewCount = updatedBook.viewCount

  // Verifica se o livro está no Top 5 para registrar o evento TRENDING_BOOK
  try {
    const top5Books = await prisma.book.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: { id: true }
    })
    const isNowTop5 = top5Books.some(b => b.id === book.id)
    if (isNowTop5) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentTrendingEvent = await prisma.eventFeed.findFirst({
        where: {
          type: 'TRENDING_BOOK',
          url: `/livros/${book.slug}`,
          createdAt: { gte: oneDayAgo }
        }
      })
      if (!recentTrendingEvent) {
        await registerEvent('TRENDING_BOOK', {
          title: book.title,
          slug: book.slug,
          coverImage: book.coverImage
        })
      }
    }
  } catch (err) {
    console.error('[getBook.trendingCheck] Erro:', err)
  }

  // Registra no histórico de leitura — o ReadingHistory já serve como log de acesso (#13)
  if (userId) {
    await prisma.readingHistory.create({
      data: { userId, bookId: book.id },
    })
    // Log de BOOK_OPENED removido: era redundante com ReadingHistory (#13)
  }

  let progress = null
  let isFavorited = false

  if (userId) {
    [progress, { isFavorited }] = await Promise.all([
      prisma.readingProgress.findUnique({
        where: { userId_bookId: { userId, bookId: book.id } },
      }),
      prisma.favorite
        .findUnique({ where: { userId_bookId: { userId, bookId: book.id } } })
        .then((f) => ({ isFavorited: !!f })),
    ])
  }

  // Verifica se está no Top 5 (Trending)
  const topBooks = await prisma.book.findMany({
    where: { isPublished: true },
    orderBy: { viewCount: 'desc' },
    take: 5,
    select: { id: true },
  })
  const isTrending = topBooks.some((b) => b.id === book.id)

  return res.json({ success: true, data: { ...book, progress, isFavorited, isTrending } })
})

export const saveProgress = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.params
  const { currentPage, totalPages, isFinished } = req.body
  const userId = req.user!.userId

  const progress = await prisma.readingProgress.upsert({
    where: { userId_bookId: { userId, bookId } },
    update: { currentPage, totalPages, isFinished, lastReadAt: new Date() },
    create: { userId, bookId, currentPage, totalPages, isFinished },
  })

  return res.json({ success: true, data: progress })
})

export const downloadBook = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params
  const userId = req.user!.userId

  const book = await prisma.book.findUnique({ where: { slug, isPublished: true } })
  if (!book) {
    return res.status(404).json({ success: false, message: 'Livro não encontrado.' })
  }

  // Registra download
  await Promise.all([
    prisma.download.create({ data: { userId, bookId: book.id } }),
    prisma.book.update({ where: { id: book.id }, data: { downloadCount: { increment: 1 } } }),
    prisma.log.create({
      data: {
        userId,
        action: 'BOOK_DOWNLOADED',
        description: `Download: ${book.title}`,
        metadata: JSON.stringify({ bookId: book.id }),
      },
    }),
  ])

  if (book.filePath.startsWith('http://') || book.filePath.startsWith('https://')) {
    // Streaming remoto sem carregar o arquivo inteiro na memória (#4)
    const response = await fetch(book.filePath)
    if (!response.ok || !response.body) {
      return res.status(502).json({ success: false, message: 'Não foi possível obter o arquivo remoto.' })
    }
    const contentLength = response.headers.get('content-length')
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${book.slug}.pdf"`)
    if (contentLength) res.setHeader('Content-Length', contentLength)
    Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res)
    return
  }

  const filePath = resolveSafeAppPath(book.filePath)
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Arquivo não encontrado.' })
  }

  return res.download(filePath, `${book.slug}.pdf`)
})

export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.params
  const userId = req.user!.userId

  const existing = await prisma.favorite.findUnique({
    where: { userId_bookId: { userId, bookId } },
  })

  if (existing) {
    await prisma.favorite.delete({ where: { userId_bookId: { userId, bookId } } })
    return res.json({ success: true, data: { isFavorited: false } })
  }

  await prisma.favorite.create({ data: { userId, bookId } })

  const book = await prisma.book.findUnique({ where: { id: bookId } })
  if (book) {
    await prisma.notification.create({
      data: {
        userId,
        type: 'BOOK_FAVORITED',
        title: 'Livro Favoritado',
        message: `Você adicionou "${book.title}" aos seus favoritos.`,
        link: `/livros/${book.slug}`,
        bookId: book.id,
      },
    })
  }

  return res.json({ success: true, data: { isFavorited: true } })
})

export const getFavorites = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      book: {
        include: {
          category: true,
          authors: { include: { author: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return res.json({ success: true, data: favorites.map((f) => f.book) })
})

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId

  const history = await prisma.readingHistory.findMany({
    where: { userId },
    include: {
      book: {
        include: { category: true, authors: { include: { author: true } } },
      },
    },
    orderBy: { accessedAt: 'desc' },
    take: 50,
    distinct: ['bookId'],
  })

  return res.json({
    success: true,
    data: history.map((h) => ({ ...h.book, accessedAt: h.accessedAt })),
  })
})
