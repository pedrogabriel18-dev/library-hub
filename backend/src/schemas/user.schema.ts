import { z } from 'zod'

const validRoles = ['STUDENT', 'LIBRARIAN', 'DEVELOPER', 'ADVISOR'] as const

export const createUserSchema = z.object({
  login:    z.string().min(1, 'Login é obrigatório').max(100),
  name:     z.string().min(1, 'Nome é obrigatório').max(255),
  role:     z.enum(validRoles).default('STUDENT'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').optional(),
})

export const updateUserSchema = z.object({
  login: z.string().min(1, 'Login é obrigatório').max(100),
  name:  z.string().min(1, 'Nome é obrigatório').max(255),
  role:  z.enum(validRoles).optional(),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
