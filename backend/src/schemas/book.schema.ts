import { z } from 'zod'

const yearSchema = z
  .union([z.number().int().positive(), z.string().regex(/^\d+$/).transform(Number)])
  .optional()
  .nullable()

export const createBookSchema = z.object({
  title:         z.string().min(1, 'Título é obrigatório').max(255),
  author:        z.string().min(1, 'Autor é obrigatório').max(255),
  category:      z.string().min(1, 'Categoria é obrigatória').max(100),
  url:           z.string()
                  .min(1, 'URL/caminho do arquivo é obrigatório')
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
                  }, { message: 'URL ou caminho do arquivo inválido. Deve começar com http/https ou indicar caminho local seguro.' }),
  publishedYear: yearSchema,
  coverImage:    z.string().optional().nullable(),
  description:   z.string().optional().nullable(),
})

export const updateBookSchema = createBookSchema

export type CreateBookInput = z.infer<typeof createBookSchema>
export type UpdateBookInput = z.infer<typeof updateBookSchema>
