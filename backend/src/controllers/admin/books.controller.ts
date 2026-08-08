import { Request, Response } from 'express'
import { prisma } from '../../utils/prisma'
import { asyncHandler } from '../../utils/asyncHandler'
import { generateSlug } from '../../utils/slug'
import { registerEvent } from '../../utils/eventFeed'

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getOrCreateCategory(name: string) {
  const slug = generateSlug(name)
  return prisma.category.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  })
}

async function getOrCreateAuthor(name: string) {
  const existing = await prisma.author.findFirst({ where: { name } })
  if (existing) return existing
  return prisma.author.create({ data: { name } })
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * Cria um livro diretamente no banco de dados. (#1, #3)
 * Não usa mais arquivo JSON como intermediário.
 */
export const createBook = asyncHandler(async (req: Request, res: Response) => {
  const { title, author, category, url, publishedYear, coverImage, description } = req.body
  const userId = req.user!.userId

  const slug = generateSlug(title)
  const slugConflict = await prisma.book.findUnique({ where: { slug } })
  if (slugConflict) {
    return res.status(409).json({ success: false, message: 'Já existe um livro com este título.' })
  }

  const [cat, auth] = await Promise.all([
    getOrCreateCategory(category),
    getOrCreateAuthor(author),
  ])

  const book = await prisma.book.create({
    data: {
      title,
      slug,
      synopsis: description ?? null,
      coverImage: coverImage ?? null,
      filePath: url,
      publishedYear: publishedYear ? Number(publishedYear) : null,
      categoryId: cat.id,
      isPublished: true,
      authors: { create: { authorId: auth.id } },
    },
    include: {
      category: true,
      authors: { include: { author: true } },
    },
  })

  // Notificar todos os usuários ativos sobre o novo livro
  const activeUsers = await prisma.user.findMany({ where: { isActive: true }, select: { id: true } })
  if (activeUsers.length > 0) {
    await prisma.notification.createMany({
      data: activeUsers.map((u) => ({
        userId: u.id,
        type: 'NEW_BOOK',
        title: 'Novo Livro no Acervo!',
        message: `O livro "${title}" foi adicionado à biblioteca.`,
        link: `/livros/${slug}`,
        bookId: book.id,
      })),
    })
  }

  await prisma.log.create({
    data: {
      userId,
      action: 'BOOK_CREATED',
      description: `Livro cadastrado: ${title}`,
      metadata: JSON.stringify({ bookId: book.id }),
    },
  })

  // Registra no Event Feed
  await registerEvent('NEW_BOOK', {
    title: book.title,
    slug: book.slug,
    authorName: author,
    coverImage: book.coverImage,
  })

  return res.status(201).json({ success: true, data: book })
})

/**
 * Atualiza um livro diretamente no banco de dados. (#1, #3)
 */
export const updateBook = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.params
  const { title, author, category, url, publishedYear, coverImage, description } = req.body
  const userId = req.user!.userId

  const existing = await prisma.book.findUnique({ where: { id: bookId } })
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Livro não encontrado.' })
  }

  const newSlug = generateSlug(title)
  if (newSlug !== existing.slug) {
    const slugConflict = await prisma.book.findUnique({ where: { slug: newSlug } })
    if (slugConflict) {
      return res.status(409).json({ success: false, message: 'Já existe outro livro com este título.' })
    }
  }

  const [cat, auth] = await Promise.all([
    getOrCreateCategory(category),
    getOrCreateAuthor(author),
  ])

  // Recria o relacionamento autor-livro
  await prisma.bookAuthor.deleteMany({ where: { bookId } })

  const book = await prisma.book.update({
    where: { id: bookId },
    data: {
      title,
      slug: newSlug,
      synopsis: description ?? null,
      coverImage: coverImage ?? null,
      filePath: url,
      publishedYear: publishedYear ? Number(publishedYear) : null,
      categoryId: cat.id,
      authors: { create: { authorId: auth.id } },
    },
    include: {
      category: true,
      authors: { include: { author: true } },
    },
  })

  await prisma.log.create({
    data: {
      userId,
      action: 'BOOK_UPDATED',
      description: `Livro atualizado: ${title}`,
      metadata: JSON.stringify({ bookId }),
    },
  })

  // Registra no Event Feed
  await registerEvent('ACERVO_UPDATE', {
    categoryName: category || 'Geral',
  })

  return res.json({ success: true, data: book })
})

/**
 * Remove um livro do banco de dados. (#1)
 * As relações (favoritos, histórico, downloads, avaliações) são removidas em cascata pelo Prisma.
 */
export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.params
  const userId = req.user!.userId

  const book = await prisma.book.findUnique({ where: { id: bookId } })
  if (!book) {
    return res.status(404).json({ success: false, message: 'Livro não encontrado.' })
  }

  await prisma.book.delete({ where: { id: bookId } })

  await prisma.log.create({
    data: {
      userId,
      action: 'BOOK_DELETED',
      description: `Livro removido: ${book.title}`,
      metadata: JSON.stringify({ bookId }),
    },
  })

  return res.json({ success: true, message: 'Livro removido com sucesso.' })
})
