import fs from 'fs'
import pdfParse = require('pdf-parse')

export interface ExtractedPDFMetadata {
  title?: string
  author?: string
  subject?: string
  keywords?: string[]
}

export async function extractPDFMetadata(filePath: string): Promise<ExtractedPDFMetadata> {
  try {
    if (!fs.existsSync(filePath)) {
      return {}
    }
    const dataBuffer = fs.readFileSync(filePath)
    const parser = new pdfParse.PDFParse({ data: new Uint8Array(dataBuffer) })
    const pdfInfo = await parser.getInfo()
    const info = pdfInfo.info || {}

    let keywords: string[] = []
    const rawKeywords = info.Keywords || info.keywords || info.Subject || info.subject || ''
    if (typeof rawKeywords === 'string' && rawKeywords.trim()) {
      keywords = rawKeywords.split(/[,;]/).map((k: string) => k.trim()).filter(Boolean)
    }

    return {
      title: info.Title || info.title || undefined,
      author: info.Author || info.author || undefined,
      subject: info.Subject || info.subject || undefined,
      keywords: keywords.length > 0 ? keywords : undefined
    }
  } catch (error) {
    console.error('[pdf] Erro ao extrair metadados do PDF:', error)
    return {}
  }
}
