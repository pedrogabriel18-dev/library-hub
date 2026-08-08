import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { asyncHandler } from '../utils/asyncHandler'

/**
 * Retorna as atividades em tempo real a partir da tabela event_feed.
 * Ordena por prioridade (maior primeiro) e por data de criação (FIFO - mais antigos primeiro).
 * Filtra eventos expirados.
 */
export const getActivities = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date()

  const events = await prisma.eventFeed.findMany({
    where: {
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: now } }
      ]
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' } // FIFO - First In, First Out
    ],
    take: 30
  })

  // Converte a estrutura do EventFeed para a estrutura esperada pelo Toaster do Frontend
  const activities = events.map(event => {
    // Mapeia os tipos de banco de dados (NEW_BOOK, NEW_TCC) para o case esperado no frontend (new_book, new_tcc)
    let mappedType = event.type.toLowerCase()
    if (event.type === 'NEW_BOOK') mappedType = 'new_book'
    if (event.type === 'NEW_TCC') mappedType = 'new_tcc'

    return {
      id: event.id,
      userName: event.title, // Fallback do header do Toast para tipos genéricos
      type: mappedType,
      title: event.title,
      description: event.description,
      coverImage: event.image,
      link: event.url,
      createdAt: event.createdAt
    }
  })

  return res.json({
    success: true,
    data: activities
  })
})
