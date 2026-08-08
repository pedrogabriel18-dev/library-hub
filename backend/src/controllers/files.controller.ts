import { Request, Response } from 'express'
import fs from 'fs'
import { Readable } from 'stream'
import { prisma } from '../utils/prisma'
import { resolveAppPath, resolveSafeAppPath } from '../utils/paths'
import { asyncHandler } from '../utils/asyncHandler'

/**
 * Faz stream de um PDF remoto sem carregar o arquivo inteiro na memória. (#4)
 * Usa Node.js Readable.fromWeb para piped streaming.
 */
async function streamRemotePDF(url: string, res: Response): Promise<void> {
  const response = await fetch(url)
  if (!response.ok || !response.body) {
    res.status(502).json({ success: false, message: 'Não foi possível obter o arquivo externo.' })
    return
  }

  const contentType = response.headers.get('content-type') || 'application/pdf'
  const contentLength = response.headers.get('content-length')

  res.setHeader('Content-Type', contentType)
  res.setHeader('Content-Disposition', 'inline')
  if (contentLength) res.setHeader('Content-Length', contentLength)

  // Converte o Web ReadableStream para Node.js Readable e faz pipe (#4)
  Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res)
}

/**
 * Serve um arquivo PDF local com suporte a HTTP Range requests.
 * Permite que o PDF.js carregue páginas específicas sem baixar o arquivo inteiro. (#14)
 */
function streamLocalPDF(filePath: string, req: Request, res: Response): void {
  const stat = fs.statSync(filePath)
  const fileSize = stat.size
  const range = req.headers.range

  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'inline')

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const chunkSize = end - start + 1

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'application/pdf',
    })
    fs.createReadStream(filePath, { start, end }).pipe(res)
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'application/pdf',
      'Accept-Ranges': 'bytes',
    })
    fs.createReadStream(filePath).pipe(res)
  }
}

export const streamBookFile = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params

  const book = await prisma.book.findUnique({ where: { slug, isPublished: true } })
  if (!book) {
    return res.status(404).json({ success: false, message: 'Livro não encontrado.' })
  }

  if (book.filePath.startsWith('http://') || book.filePath.startsWith('https://')) {
    return streamRemotePDF(book.filePath, res)
  }

  const filePath = resolveSafeAppPath(book.filePath)
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Arquivo não encontrado no servidor.' })
  }

  return streamLocalPDF(filePath, req, res)
})

export const streamTCCFile = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params

  const tcc = await prisma.tCC.findUnique({ where: { slug, isPublished: true } })
  if (!tcc) {
    return res.status(404).json({ success: false, message: 'TCC não encontrado.' })
  }

  if (tcc.filePath.startsWith('http://') || tcc.filePath.startsWith('https://')) {
    return streamRemotePDF(tcc.filePath, res)
  }

  const filePath = resolveSafeAppPath(tcc.filePath)
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Arquivo não encontrado no servidor.' })
  }

  return streamLocalPDF(filePath, req, res)
})
