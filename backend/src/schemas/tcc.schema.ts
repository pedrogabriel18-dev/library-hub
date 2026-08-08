import { z } from 'zod'

/**
 * Normaliza URLs do Google Docs/Drive para o formato /preview.
 * Garante que o documento abra em modo leitura, nunca em edição.
 *
 * Exemplos suportados:
 *   docs.google.com/document/d/ID/edit  → .../ID/preview
 *   drive.google.com/file/d/ID/view     → .../ID/preview
 *   drive.google.com/open?id=ID         → drive.google.com/file/d/ID/preview
 */
export function normalizeDocUrl(url: string): string {
  if (!url) return url

  // Já está no formato correto
  if (url.endsWith('/preview')) return url

  // Google Docs: /edit, /view, /pub → /preview
  const docsMatch = url.match(/^(https:\/\/docs\.google\.com\/[^?]+?)\/(edit|view|pub|export[^?]*)(\?.*)?$/)
  if (docsMatch) return `${docsMatch[1]}/preview`

  // Google Drive file: /view → /preview
  const driveFileMatch = url.match(/^(https:\/\/drive\.google\.com\/file\/d\/[^/?]+)\/(view|edit)(\?.*)?$/)
  if (driveFileMatch) return `${driveFileMatch[1]}/preview`

  // Google Drive open?id=ID → /file/d/ID/preview
  const driveOpenMatch = url.match(/^https:\/\/drive\.google\.com\/open\?id=([^&]+)/)
  if (driveOpenMatch) return `https://drive.google.com/file/d/${driveOpenMatch[1]}/preview`

  return url
}

const authorsSchema = z
  .union([
    z.array(z.string().min(1)).min(1, 'Pelo menos um autor é obrigatório'),
    z.string().min(1, 'Autor(es) é obrigatório'),
  ])
  .transform((v) =>
    typeof v === 'string'
      ? v.split(',').map((a) => a.trim()).filter(Boolean)
      : v
  )

const yearSchema = z
  .union([z.number().int().positive(), z.string().regex(/^\d+$/).transform(Number)])
  .optional()
  .nullable()

export const createTCCSchema = z.object({
  title:      z.string().min(1, 'Título é obrigatório').max(255),
  authors:    authorsSchema,
  url:        z.string()
              .min(1, 'URL do documento é obrigatória')
              .refine(val => {
                if (val.startsWith('http://') || val.startsWith('https://')) {
                  try {
                    const parsed = new URL(val)
                    return ['http:', 'https:'].includes(parsed.protocol)
                  } catch {
                    return false
                  }
                }
                return val.startsWith('storage/')
              }, { message: 'URL ou caminho do arquivo inválido. Deve começar com http/https ou indicar caminho local seguro.' })
              .transform(normalizeDocUrl),
  coverImage: z.string().optional().nullable(),
  keywords:   z.union([z.string(), z.array(z.string())]).optional().nullable()
              .transform(v => {
                if (!v) return null
                if (Array.isArray(v)) return JSON.stringify(v)
                // já é string JSON ou string simples separada por vírgulas
                try { JSON.parse(v); return v } catch { return JSON.stringify(v.split(',').map(s => s.trim()).filter(Boolean)) }
              }),
  advisor:    z.string().optional().nullable(),
  year:       yearSchema,
  description:z.string().optional().nullable(),
  abstract:   z.string().optional().nullable(),
  course:     z.string().optional().nullable(),
  classGroup: z.string().optional().nullable(),
  category:   z.string().optional().nullable(),
})

export const updateTCCSchema = createTCCSchema

export type CreateTCCInput = z.infer<typeof createTCCSchema>
export type UpdateTCCInput = z.infer<typeof updateTCCSchema>
