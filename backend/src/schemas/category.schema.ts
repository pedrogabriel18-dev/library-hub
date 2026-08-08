import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório').max(100),
})

export type CategoryInput = z.infer<typeof categorySchema>
