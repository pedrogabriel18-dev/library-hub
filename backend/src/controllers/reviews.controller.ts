import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { registerEvent } from '../utils/eventFeed'

export const submitReview = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.params
  const { rating, comment } = req.body
  const userId = req.user!.userId

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'A nota deve ser entre 1 e 5 estrelas.' })
  }

  const book = await prisma.book.findUnique({ where: { id: bookId, isPublished: true } })
  if (!book) {
    return res.status(404).json({ success: false, message: 'Livro não encontrado.' })
  }

  const existing = await prisma.review.findUnique({
    where: { userId_bookId: { userId, bookId } },
  })
  if (existing) {
    return res.status(409).json({ success: false, message: 'Você já avaliou este livro.' })
  }

  const review = await prisma.review.create({
    data: { userId, bookId, rating, comment, status: 'PENDING' },
  })

  return res.status(201).json({
    success: true,
    message: 'Avaliação enviada! Aguardando aprovação da bibliotecária.',
    data: review,
  })
})

export const getPendingReviews = asyncHandler(async (_req: Request, res: Response) => {
  const reviews = await prisma.review.findMany({
    where: { status: 'PENDING' },
    include: {
      user: { select: { name: true, avatarId: true, turma: true } },
      book: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return res.json({ success: true, data: reviews })
})

export const moderateReview = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params
  const { action, rejectionReason } = req.body // 'approve' | 'reject'
  const moderatorId = req.user!.userId

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Ação inválida.' })
  }

  if (action === 'reject' && !rejectionReason) {
    return res.status(400).json({ success: false, message: 'O motivo da recusa é obrigatório.' })
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { book: true }
  })
  if (!review) {
    return res.status(404).json({ success: false, message: 'Avaliação não encontrada.' })
  }

  const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'

  await prisma.review.update({
    where: { id: reviewId },
    data: {
      status: newStatus,
      rejectionReason: action === 'reject' ? rejectionReason : null,
      reviewedBy: moderatorId,
      reviewedAt: new Date()
    },
  })

  // Recalcula média se aprovado
  if (newStatus === 'APPROVED') {
    const approved = await prisma.review.findMany({
      where: { bookId: review.bookId, status: 'APPROVED' },
      select: { rating: true },
    })
    const avg = approved.reduce((sum, r) => sum + r.rating, 0) / approved.length
    await prisma.book.update({
      where: { id: review.bookId },
      data: { avgRating: avg, ratingCount: approved.length },
    })
  }

  // Envia notificação in-app ao estudante
  await prisma.notification.create({
    data: {
      userId: review.userId,
      type: newStatus === 'APPROVED' ? 'REVIEW_APPROVED' : 'REVIEW_REJECTED',
      title: newStatus === 'APPROVED' ? 'Resenha Aprovada!' : 'Resenha Recusada',
      message: newStatus === 'APPROVED'
        ? `Sua resenha para o livro "${review.book.title}" foi aprovada.`
        : `Sua resenha para o livro "${review.book.title}" foi recusada. Motivo: ${rejectionReason}`,
      link: `/livros/${review.book.slug}`,
      bookId: review.bookId
    }
  })

  await prisma.log.create({
    data: {
      userId: moderatorId,
      action: `REVIEW_${newStatus}`,
      description: `Avaliação ${action === 'approve' ? 'aprovada' : 'rejeitada'}.`,
      metadata: JSON.stringify({ reviewId }),
    },
  })

  // Registra no Event Feed se foi aprovada
  if (newStatus === 'APPROVED') {
    await registerEvent('REVIEW_APPROVED', {
      bookTitle: review.book.title,
      bookSlug: review.book.slug,
      authorName: '', // não obrigatório para resenhas nos templates
      coverImage: review.book.coverImage,
    })
  }

  return res.json({
    success: true,
    message: `Avaliação ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso.`,
  })
})

export const getReviewsFiltered = asyncHandler(async (req: Request, res: Response) => {
  const { status, bookId, studentSearch, date } = req.query

  const where: any = {}

  if (status) {
    where.status = status as string
  }

  if (bookId) {
    where.bookId = bookId as string
  }

  if (studentSearch) {
    where.user = {
      name: { contains: studentSearch as string }
    }
  }

  if (date) {
    const parsedDate = new Date(date as string)
    if (!isNaN(parsedDate.getTime())) {
      const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0))
      const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999))
      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  }

  const reviews = await prisma.review.findMany({
    where,
    include: {
      user: { select: { name: true, avatarId: true, turma: true } },
      book: { select: { title: true, slug: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return res.json({ success: true, data: reviews })
})

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params
  const moderatorId = req.user!.userId

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: { select: { name: true } },
      book: { select: { id: true, title: true } }
    }
  })

  if (!review) {
    return res.status(404).json({ success: false, message: 'Avaliação não encontrada.' })
  }

  // Deleta a resenha
  await prisma.review.delete({
    where: { id: reviewId }
  })

  // Remove notificações relacionadas (aprovação ou rejeição)
  await prisma.notification.deleteMany({
    where: {
      userId: review.userId,
      bookId: review.bookId,
      type: { in: ['REVIEW_APPROVED', 'REVIEW_REJECTED'] }
    }
  })

  // Recalcula média de avaliações do livro se a resenha deletada estava aprovada
  if (review.status === 'APPROVED') {
    const approved = await prisma.review.findMany({
      where: { bookId: review.bookId, status: 'APPROVED' },
      select: { rating: true }
    })
    const count = approved.length
    const avg = count > 0 ? approved.reduce((sum, r) => sum + r.rating, 0) / count : 0

    await prisma.book.update({
      where: { id: review.bookId },
      data: {
        avgRating: avg,
        ratingCount: count
      }
    })
  }

  // Registra log administrativo
  await prisma.log.create({
    data: {
      userId: moderatorId,
      action: 'REVIEW_DELETED',
      description: `Resenha excluída permanentemente por moderador.`,
      metadata: JSON.stringify({
        deletedByUserId: moderatorId,
        reviewId: review.id,
        bookId: review.bookId,
        bookTitle: review.book.title,
        reviewAuthorName: review.user?.name || 'Estudante',
        reviewAuthorId: review.userId,
        deletedAt: new Date().toISOString()
      })
    }
  })

  return res.json({ success: true, message: 'Avaliação excluída permanentemente com sucesso.' })
})

