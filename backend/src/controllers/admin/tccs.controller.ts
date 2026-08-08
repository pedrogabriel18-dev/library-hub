import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { prisma } from '../../utils/prisma'
import { asyncHandler } from '../../utils/asyncHandler'
import { generateSlug } from '../../utils/slug'
import { normalizeDocUrl } from '../../schemas/tcc.schema'
import { registerEvent } from '../../utils/eventFeed'
import { resolveAppPath } from '../../utils/paths'

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getOrCreateAuthor(name: string) {
  const existing = await prisma.author.findFirst({ where: { name } })
  if (existing) return existing
  return prisma.author.create({ data: { name } })
}

async function getOrCreateCategory(name: string) {
  const slug = generateSlug(name)
  return prisma.category.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  })
}

async function resolveAdvisorId(advisorName: string | null | undefined): Promise<string | null> {
  if (!advisorName) return null
  const advisorUser = await prisma.user.findFirst({
    where: { name: { contains: advisorName }, role: 'ADVISOR' },
  })
  if (!advisorUser) return null

  const profile = await prisma.advisorProfile.upsert({
    where: { userId: advisorUser.id },
    update: {},
    create: { userId: advisorUser.id, name: advisorUser.name },
  })
  return profile.id
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * Cria um TCC no banco de dados com URL normalizada para /preview.
 * Suporta coverImage e keywords.
 */
export const createTCC = asyncHandler(async (req: Request, res: Response) => {
  const { title, authors, url, advisor, year, description, abstract, course, category, coverImage, keywords } = req.body
  const userId = req.user!.userId

  // URL já foi normalizada pelo Zod schema, mas normalizamos novamente como segurança
  const normalizedUrl = normalizeDocUrl(url)

  const authorName = (authors as string[]).join(' e ')
  const slug = generateSlug(title)
  const slugConflict = await prisma.tCC.findUnique({ where: { slug } })
  if (slugConflict) {
    return res.status(409).json({ success: false, message: 'Já existe um TCC com este título.' })
  }

  const [auth, cat, advisorId] = await Promise.all([
    getOrCreateAuthor(authorName),
    getOrCreateCategory(category || 'Tecnologia'),
    resolveAdvisorId(advisor),
  ])

  // Gerar capa automática caso não seja enviada
  let finalCoverImage = coverImage || null
  if (!finalCoverImage) {
    try {
      finalCoverImage = await generateAndSaveTccCover(
        title,
        authorName,
        advisor,
        year ? Number(year) : new Date().getFullYear(),
        course,
        slug
      )
    } catch (err) {
      console.error('[createTCC] Erro ao gerar capa SVG:', err)
    }
  }

  const tcc = await prisma.tCC.create({
    data: {
      title,
      slug,
      abstract: abstract || description || null,
      filePath: normalizedUrl,
      coverImage: finalCoverImage,
      keywords: keywords || null,
      year: year ? Number(year) : new Date().getFullYear(),
      course: course || null,
      isPublished: true,
      authorId: auth.id,
      categoryId: cat.id,
      advisorId,
    },
    include: { author: true, category: true, advisorUser: true },
  })


  // Notificar todos os usuários ativos sobre o novo TCC
  const activeUsers = await prisma.user.findMany({ where: { isActive: true }, select: { id: true } })
  if (activeUsers.length > 0) {
    await prisma.notification.createMany({
      data: activeUsers.map((u) => ({
        userId: u.id,
        type: 'NEW_TCC',
        title: '📘 Novo TCC disponível!',
        message: `"${title}" foi adicionado à plataforma.`,
        link: `/tccs/${slug}`,
        tccId: tcc.id,
      })),
    })
  }

  await prisma.log.create({
    data: {
      userId,
      action: 'TCC_CREATED',
      description: `TCC cadastrado: ${title}`,
      metadata: JSON.stringify({ tccId: tcc.id }),
    },
  })

  // Registra no Event Feed
  await registerEvent('NEW_TCC', {
    title: tcc.title,
    slug: tcc.slug,
    authorName: authorName,
    coverImage: tcc.coverImage,
  })

  return res.status(201).json({ success: true, data: tcc })
})

/**
 * Atualiza um TCC. URL é re-normalizada para /preview.
 */
export const updateTCC = asyncHandler(async (req: Request, res: Response) => {
  const { tccId } = req.params
  const { title, authors, url, advisor, year, description, abstract, course, category, coverImage, keywords } = req.body
  const userId = req.user!.userId

  const existing = await prisma.tCC.findUnique({ where: { id: tccId } })
  if (!existing) {
    return res.status(404).json({ success: false, message: 'TCC não encontrado.' })
  }

  const normalizedUrl = normalizeDocUrl(url)

  const newSlug = generateSlug(title)
  if (newSlug !== existing.slug) {
    const slugConflict = await prisma.tCC.findUnique({ where: { slug: newSlug } })
    if (slugConflict) {
      return res.status(409).json({ success: false, message: 'Já existe outro TCC com este título.' })
    }
  }

  const authorName = (authors as string[]).join(' e ')

  const [auth, cat, advisorId] = await Promise.all([
    getOrCreateAuthor(authorName),
    getOrCreateCategory(category || 'Tecnologia'),
    resolveAdvisorId(advisor),
  ])

  // Gerar/regenerar capa se for atualizado ou se coverImage for nula/gerada
  let finalCoverImage = coverImage
  const isGeneratedCover = (img: string | null) => !!img && img.startsWith('/covers/tcc-') && img.endsWith('.svg')

  if (coverImage === undefined) {
    if (isGeneratedCover(existing.coverImage)) {
      finalCoverImage = await generateAndSaveTccCover(
        title,
        authorName,
        advisor,
        year ? Number(year) : existing.year,
        course,
        newSlug
      )
    } else {
      finalCoverImage = existing.coverImage
    }
  } else if (!coverImage || isGeneratedCover(coverImage)) {
    finalCoverImage = await generateAndSaveTccCover(
      title,
      authorName,
      advisor,
      year ? Number(year) : existing.year,
      course,
      newSlug
    )
  }

  const tcc = await prisma.tCC.update({
    where: { id: tccId },
    data: {
      title,
      slug: newSlug,
      abstract: abstract || description || null,
      filePath: normalizedUrl,
      coverImage: finalCoverImage,
      keywords: keywords !== undefined ? keywords || null : existing.keywords,
      year: year ? Number(year) : existing.year,
      course: course || null,
      authorId: auth.id,
      categoryId: cat.id,
      advisorId,
    },
    include: { author: true, category: true, advisorUser: true },
  })

  await prisma.log.create({
    data: {
      userId,
      action: 'TCC_UPDATED',
      description: `TCC atualizado: ${title}`,
      metadata: JSON.stringify({ tccId }),
    },
  })

  // Registra no Event Feed
  await registerEvent('ACERVO_UPDATE', {
    categoryName: category || 'Tecnologia',
  })

  return res.json({ success: true, data: tcc })

})

/**
 * Remove um TCC do banco de dados.
 */
export const deleteTCC = asyncHandler(async (req: Request, res: Response) => {
  const { tccId } = req.params
  const userId = req.user!.userId

  const tcc = await prisma.tCC.findUnique({ where: { id: tccId } })
  if (!tcc) {
    return res.status(404).json({ success: false, message: 'TCC não encontrado.' })
  }

  // Se tiver capa SVG local, deleta o arquivo físico
  if (tcc.coverImage && tcc.coverImage.startsWith('/covers/tcc-') && tcc.coverImage.endsWith('.svg')) {
    const filePath = resolveAppPath(`public${tcc.coverImage}`)
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath)
      } catch (err) {
        console.error('[deleteTCC] Erro ao excluir arquivo de capa SVG local:', err)
      }
    }
  }

  await prisma.tCC.delete({ where: { id: tccId } })

  await prisma.log.create({
    data: {
      userId,
      action: 'TCC_DELETED',
      description: `TCC removido: ${tcc.title}`,
      metadata: JSON.stringify({ tccId }),
    },
  })

  return res.json({ success: true, message: 'TCC removido com sucesso.' })
})

// ── Capas Procedurais em SVG para TCCs ──────────────────────────────────────────

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = currentLine ? currentLine + ' ' + word : word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}

function generateTccCoverSvg(
  title: string,
  author: string,
  advisor: string | undefined,
  year: number,
  course: string | undefined
): string {
  const displayTitle = title ? title.trim() : 'Documento Acadêmico'
  const upperTitle = displayTitle.toUpperCase()
  
  let fontSize = 18
  let lineHeight = 24
  let maxChars = 24
  
  if (upperTitle.length > 90) {
    fontSize = 12
    lineHeight = 16
    maxChars = 36
  } else if (upperTitle.length > 50) {
    fontSize = 14
    lineHeight = 19
    maxChars = 30
  }
  
  const titleLines = wrapText(upperTitle, maxChars)
  const displayLines = titleLines.slice(0, 5)
  if (titleLines.length > 5) {
    displayLines[4] = displayLines[4].slice(0, -3) + '...'
  }
  
  const titleBoxCenterY = 190
  const totalTextHeight = displayLines.length * lineHeight
  const startY = titleBoxCenterY - (totalTextHeight / 2) + (lineHeight / 2)
  
  let titleGroupText = ''
  displayLines.forEach((line, index) => {
    const y = startY + (index * lineHeight)
    titleGroupText += `<text x="200" y="${y}" font-family="'Inter', 'Manrope', sans-serif" font-size="${fontSize}" font-weight="700" fill="#1e3a8a" text-anchor="middle">${escapeXml(line)}</text>\n`
  })

  const isFallback = !title || displayTitle === 'Documento Acadêmico'
  
  const escapedAuthor = isFallback ? 'Documento Acadêmico' : escapeXml(author || 'Autor não informado')
  const escapedAdvisor = isFallback ? 'Não informado' : escapeXml(advisor || 'Não informado')
  const escapedCourse = isFallback ? '' : (course ? escapeXml(course) : '')
  const escapedYear = String(year || new Date().getFullYear())

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 580" width="100%" height="100%">
  <!-- Background -->
  <rect x="0" y="0" width="400" height="580" fill="#f8fafc" />
  
  <!-- Decorative border -->
  <rect x="15" y="15" width="370" height="550" rx="10" ry="10" fill="none" stroke="#1e3a8a" stroke-width="3" />
  <rect x="20" y="20" width="360" height="540" rx="8" ry="8" fill="none" stroke="#e2e8f0" stroke-width="1" />

  <!-- Badge TCC -->
  <rect x="160" y="40" width="80" height="26" rx="5" fill="#1e3a8a" />
  <text x="200" y="57" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">TCC</text>

  <!-- Title Section -->
  ${titleGroupText}

  <!-- Divider -->
  <line x1="120" y1="280" x2="280" y2="280" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" />

  <!-- Author Section -->
  <text x="200" y="315" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#64748b" text-anchor="middle" letter-spacing="1">AUTOR(ES)</text>
  <text x="200" y="335" font-family="'Inter', 'Manrope', sans-serif" font-size="14" font-weight="500" fill="#0f172a" text-anchor="middle">${escapedAuthor}</text>

  <!-- Advisor Section -->
  <text x="200" y="380" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#64748b" text-anchor="middle" letter-spacing="1">ORIENTADOR(A)</text>
  <text x="200" y="400" font-family="'Inter', 'Manrope', sans-serif" font-size="13" font-weight="500" fill="#0f172a" text-anchor="middle">${escapedAdvisor}</text>

  <!-- Course and Year Section -->
  <text x="200" y="450" font-family="'Inter', 'Manrope', sans-serif" font-size="11" font-weight="400" fill="#475569" text-anchor="middle">ANO: ${escapedYear}</text>
  ${escapedCourse ? `<text x="200" y="470" font-family="'Inter', 'Manrope', sans-serif" font-size="11" font-weight="500" fill="#475569" text-anchor="middle">${escapedCourse}</text>` : ''}

  <!-- Footer -->
  <line x1="40" y1="520" x2="360" y2="520" stroke="#e2e8f0" stroke-width="1" />
  <text x="200" y="542" font-family="'Inter', sans-serif" font-size="9" font-weight="600" fill="#2563eb" text-anchor="middle" letter-spacing="0.5">LibraryHub — Academic Repository</text>
</svg>`
}

export async function generateAndSaveTccCover(
  title: string,
  author: string,
  advisor: string | undefined,
  year: number,
  course: string | undefined,
  slug: string
): Promise<string> {
  const svg = generateTccCoverSvg(title, author, advisor, year, course)
  const coversDir = resolveAppPath('public/covers')
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true })
  }
  const fileName = `tcc-${slug}.svg`
  fs.writeFileSync(path.join(coversDir, fileName), svg)
  return `/covers/${fileName}`
}

