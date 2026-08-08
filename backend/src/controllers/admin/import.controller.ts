import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { prisma } from '../../utils/prisma'
import { resolveAppPath } from '../../utils/paths'
import { generateSlug } from '../../utils/slug'
import { extractPDFMetadata } from '../../utils/pdf'

/**
 * Importação automática: baixa um PDF da URL, extrai metadados e faz fuzzy-match
 * com o catálogo de livros/TCCs para pré-preencher o formulário de cadastro.
 */
export async function autoImport(req: Request, res: Response) {
  const { url, type } = req.body
  if (!url) {
    return res.status(400).json({ success: false, message: 'A URL do PDF é obrigatória.' })
  }

  try {
    let fetchUrl = url
    const docMatch = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)
    if (docMatch && docMatch[1]) {
      fetchUrl = `https://docs.google.com/document/d/${docMatch[1]}/export?format=pdf`
    }

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: `Falha ao baixar o PDF. Status HTTP: ${response.status}`,
      })
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    const tempDir = resolveAppPath('storage/temp')
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

    const tempFileId = `temp-${Date.now()}`
    const tempFilePath = path.join(tempDir, `${tempFileId}.pdf`)
    fs.writeFileSync(tempFilePath, buffer)

    const pdfMetadata = await extractPDFMetadata(tempFilePath)

    let urlFilename = ''
    try {
      const parsedUrl = new URL(url)
      const basename = path.basename(parsedUrl.pathname, '.pdf')
      urlFilename = decodeURIComponent(basename).replace(/[-_]/g, ' ').trim()
    } catch { /* ignore */ }

    let suggestedTitle = pdfMetadata.title || ''
    const genericTerms = ['microsoft word', 'template', 'document', 'untitled', 'sem titulo', 'pdf', 'layout', 'print', 'abnt']
    const isGeneric = !suggestedTitle.trim() || genericTerms.some((t) => suggestedTitle.toLowerCase().includes(t))
    if (isGeneric && urlFilename) suggestedTitle = urlFilename

    let matchedMetadata: Record<string, unknown> | null = null
    const slug = generateSlug(suggestedTitle)

    const catalogFile = type === 'tcc' ? 'tccs-catalog.json' : 'books-catalog.json'
    const catalogPath = resolveAppPath(`public/data/${catalogFile}`)
    if (fs.existsSync(catalogPath)) {
      const catalog: Record<string, unknown>[] = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'))
      matchedMetadata = catalog.find((item) => {
        const itemSlug = generateSlug(item.titulo as string)
        return itemSlug === slug || itemSlug.includes(slug) || slug.includes(itemSlug)
      }) ?? null
    }

    let responseData: Record<string, unknown>
    if (type === 'tcc') {
      responseData = {
        title: (matchedMetadata?.titulo as string) || suggestedTitle || '',
        authors: (matchedMetadata?.autores as string[]) || (pdfMetadata.author ? [pdfMetadata.author] : []),
        advisor: (matchedMetadata?.orientador as string) || '',
        year: (matchedMetadata?.ano as number) || new Date().getFullYear(),
        course: (matchedMetadata?.curso as string) || '',
        classGroup: (matchedMetadata?.turma as string) || '',
        keywords: (matchedMetadata?.keywords as string[]) || pdfMetadata.keywords || [],
      }
    } else {
      responseData = {
        title: (matchedMetadata?.titulo as string) || suggestedTitle || '',
        author: (matchedMetadata?.autor as string) || pdfMetadata.author || '',
        category: (matchedMetadata?.categoria as string) || '',
        publishedYear: (matchedMetadata?.ano as number) || null,
        description: (matchedMetadata?.descricao as string) || pdfMetadata.subject || '',
        keywords: (matchedMetadata?.keywords as string[]) || pdfMetadata.keywords || [],
      }
    }

    return res.json({ success: true, data: { tempFileId, metadata: responseData } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('[import.autoImport] Erro:', error)
    return res.status(500).json({ success: false, message: `Erro ao importar: ${message}` })
  }
}

/**
 * Salva uma imagem de capa (base64) e remove o arquivo temporário associado.
 */
export async function saveCover(req: Request, res: Response) {
  const { tempFileId, base64Image, slug } = req.body

  if (!base64Image || !slug) {
    return res.status(400).json({ success: false, message: 'Dados da imagem (base64) e slug são obrigatórios.' })
  }

  try {
    const matches = base64Image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'Formato de imagem inválido.' })
    }

    const imageBuffer = Buffer.from(matches[2], 'base64')
    const coversDir = resolveAppPath('public/covers')
    if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true })

    const normalizedSlug = generateSlug(slug)
    const fileName = `${normalizedSlug}.jpg`
    const filePath = path.join(coversDir, fileName)
    fs.writeFileSync(filePath, imageBuffer)

    // Remove arquivo temporário após salvar a capa
    if (tempFileId) {
      const sanitizedFileId = path.basename(tempFileId)
      const tempFilePath = resolveAppPath(`storage/temp/${sanitizedFileId}.pdf`)
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath)
        console.log(`[import] Arquivo temporário removido: ${tempFilePath}`)
      }
    }

    return res.json({ success: true, data: { coverPath: `/covers/${fileName}` } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('[import.saveCover] Erro:', error)
    return res.status(500).json({ success: false, message: `Erro ao salvar capa: ${message}` })
  }
}

/**
 * Serve um arquivo temporário para preview no leitor PDF do frontend.
 */
export async function serveTempFile(req: Request, res: Response) {
  const { fileId } = req.params

  if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return res.status(400).json({ success: false, message: 'ID de arquivo inválido.' })
  }

  const tempFilePath = resolveAppPath(`storage/temp/${fileId}.pdf`)

  if (!fs.existsSync(tempFilePath)) {
    return res.status(404).json({ success: false, message: 'Arquivo temporário não encontrado.' })
  }

  res.setHeader('Content-Type', 'application/pdf')
  return res.sendFile(tempFilePath)
}
