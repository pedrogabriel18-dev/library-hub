import { Request, Response } from 'express'
import { prisma } from '../../utils/prisma'
import { asyncHandler } from '../../utils/asyncHandler'
import { generateSlug } from '../../utils/slug'

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { books: true, tccs: true } } },
  })
  return res.json({ success: true, data: categories })
})

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body
  const userId = req.user!.userId

  const slug = generateSlug(name)
  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) {
    return res.status(409).json({ success: false, message: 'Esta categoria já existe.' })
  }

  const category = await prisma.category.create({ data: { name, slug } })

  await prisma.log.create({
    data: {
      userId,
      action: 'CATEGORY_CREATED',
      description: `Categoria criada: ${name}`,
      metadata: JSON.stringify({ categoryId: category.id }),
    },
  })

  return res.status(201).json({ success: true, data: category })
})

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params
  const { name } = req.body
  const userId = req.user!.userId

  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) {
    return res.status(404).json({ success: false, message: 'Categoria não encontrada.' })
  }

  const newSlug = generateSlug(name)
  const slugConflict = await prisma.category.findFirst({
    where: { slug: newSlug, id: { not: categoryId } },
  })
  if (slugConflict) {
    return res.status(409).json({ success: false, message: 'Já existe outra categoria com este nome.' })
  }

  const oldName = category.name
  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: { name, slug: newSlug },
  })

  await prisma.log.create({
    data: {
      userId,
      action: 'CATEGORY_UPDATED',
      description: `Categoria atualizada de "${oldName}" para "${name}"`,
      metadata: JSON.stringify({ categoryId }),
    },
  })

  return res.json({ success: true, data: updatedCategory })
})

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params
  const userId = req.user!.userId

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { books: true, tccs: true } } },
  })

  if (!category) {
    return res.status(404).json({ success: false, message: 'Categoria não encontrada.' })
  }

  if (category._count.books > 0 || category._count.tccs > 0) {
    return res.status(400).json({
      success: false,
      message: 'Não é possível excluir esta categoria pois ela possui livros ou TCCs associados.',
    })
  }

  await prisma.category.delete({ where: { id: categoryId } })

  await prisma.log.create({
    data: {
      userId,
      action: 'CATEGORY_DELETED',
      description: `Categoria excluída: ${category.name}`,
      metadata: JSON.stringify({ categoryId }),
    },
  })

  return res.json({ success: true, message: 'Categoria excluída com sucesso.' })
})
