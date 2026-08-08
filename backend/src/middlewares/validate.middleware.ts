import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

/**
 * Middleware de validação de corpo da requisição com Zod.
 * Em caso de falha, retorna 400 com a lista de erros detalhados.
 * Ao passar, substitui req.body pelo valor transformado/coercido pelo schema.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.errors.map(
        (e) => `${e.path.join('.') || 'body'}: ${e.message}`
      )
      res.status(400).json({
        success: false,
        message: 'Dados inválidos.',
        errors,
      })
      return
    }

    req.body = result.data
    next()
  }
}
