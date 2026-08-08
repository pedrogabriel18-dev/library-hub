import { prisma } from './prisma'

export interface EventDataMap {
  NEW_BOOK: {
    title: string
    slug: string
    authorName: string
    coverImage?: string | null
  }
  NEW_TCC: {
    title: string
    slug: string
    authorName: string
    coverImage?: string | null
  }
  REVIEW_APPROVED: {
    bookTitle: string
    bookSlug: string
    authorName: string
    coverImage?: string | null
  }
  TRENDING_BOOK: {
    title: string
    slug: string
    coverImage?: string | null
  }
  TRENDING_TCC: {
    title: string
    slug: string
    coverImage?: string | null
  }
  NEW_USER: {
    name: string
    role?: string
  }
  PROFILE_UPDATE: {
    name: string
    action?: string
  }
  ACERVO_UPDATE: {
    categoryName: string
    count?: number
  }
}

export async function registerEvent<T extends keyof EventDataMap>(
  type: T,
  data: EventDataMap[T]
) {
  let title = ''
  let description = ''
  let image: string | null = null
  let url: string | null = null
  let priority = 1
  let category = 'Sistema'

  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + 7) // expira em 7 dias

  switch (type) {
    case 'NEW_BOOK': {
      const d = data as EventDataMap['NEW_BOOK']
      category = 'Livro'
      title = '📘 Novo livro disponível'
      description = `"${d.title}" por ${d.authorName}`
      image = d.coverImage || null
      url = `/livros/${d.slug}`
      priority = 3
      break
    }
    case 'NEW_TCC': {
      const d = data as EventDataMap['NEW_TCC']
      category = 'TCC'
      title = '🎓 Novo TCC disponível'
      description = `"${d.title}"`
      image = d.coverImage || null
      url = `/tccs/${d.slug}`
      priority = 3
      break
    }
    case 'REVIEW_APPROVED': {
      const d = data as EventDataMap['REVIEW_APPROVED']
      category = 'Resenha'
      title = '⭐ Nova resenha aprovada'
      description = `Uma nova resenha foi publicada para "${d.bookTitle}"`
      image = d.coverImage || null
      url = `/livros/${d.bookSlug}`
      priority = 3
      break
    }
    case 'TRENDING_BOOK': {
      const d = data as EventDataMap['TRENDING_BOOK']
      category = 'Livro'
      title = '🔥 Livro em Destaque'
      description = `"${d.title}" entrou nos livros mais acessados!`
      image = d.coverImage || null
      url = `/livros/${d.slug}`
      priority = 2
      break
    }
    case 'TRENDING_TCC': {
      const d = data as EventDataMap['TRENDING_TCC']
      category = 'TCC'
      title = '🔥 TCC em Destaque'
      description = `"${d.title}" entrou nos TCCs mais acessados!`
      image = d.coverImage || null
      url = `/tccs/${d.slug}`
      priority = 2
      break
    }
    case 'NEW_USER': {
      const d = data as EventDataMap['NEW_USER']
      category = 'Usuário'
      title = '👤 Novo aluno cadastrado'
      description = `${d.name} entrou na plataforma`
      priority = 1
      break
    }
    case 'PROFILE_UPDATE': {
      const d = data as EventDataMap['PROFILE_UPDATE']
      category = 'Usuário'
      title = '✏️ Perfil atualizado'
      description = `${d.name} atualizou seu ${d.action || 'perfil'}`
      priority = 1
      break
    }
    case 'ACERVO_UPDATE': {
      const d = data as EventDataMap['ACERVO_UPDATE']
      category = 'Biblioteca'
      title = '📚 Atualização do acervo'
      description = `A categoria "${d.categoryName}" recebeu novos materiais`
      priority = 2
      break
    }
  }

  try {
    return await prisma.eventFeed.create({
      data: {
        type,
        category,
        title,
        description,
        image,
        url,
        priority,
        expiresAt: expirationDate,
      },
    })
  } catch (err) {
    console.error(`[eventFeed.registerEvent] Falha ao salvar evento ${type}:`, err)
    return null
  }
}

/**
 * Popula eventos iniciais caso a tabela esteja totalmente vazia.
 * Extrai dados reais já salvos para dar dinamismo imediato.
 */
export async function seedInitialEvents() {
  try {
    const count = await prisma.eventFeed.count()
    if (count > 0) return

    console.log('[eventFeed] Fila de eventos vazia. Semeando eventos a partir dos dados existentes...')

    const [books, tccs, reviews] = await Promise.all([
      prisma.book.findMany({
        where: { isPublished: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { authors: { include: { author: true } } }
      }),
      prisma.tCC.findMany({
        where: { isPublished: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { author: true }
      }),
      prisma.review.findMany({
        where: { status: 'APPROVED' },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { book: true, user: true }
      })
    ])

    for (const book of books) {
      const authorName = book.authors[0]?.author.name || 'Autor Desconhecido'
      await registerEvent('NEW_BOOK', {
        title: book.title,
        slug: book.slug,
        authorName,
        coverImage: book.coverImage
      })
    }

    for (const tcc of tccs) {
      await registerEvent('NEW_TCC', {
        title: tcc.title,
        slug: tcc.slug,
        authorName: tcc.author?.name || 'Autor Desconhecido',
        coverImage: tcc.coverImage
      })
    }

    for (const review of reviews) {
      if (review.book) {
        await registerEvent('REVIEW_APPROVED', {
          bookTitle: review.book.title,
          bookSlug: review.book.slug,
          authorName: review.user?.name || 'Estudante',
          coverImage: review.book.coverImage
        })
      }
    }

    console.log('[eventFeed] Eventos iniciais semeados com sucesso.')
  } catch (err) {
    console.error('[eventFeed.seedInitialEvents] Erro ao semear:', err)
  }
}
