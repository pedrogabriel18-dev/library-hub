import { Request, Response, NextFunction } from 'express'

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

/**
 * Envolve um controller assíncrono em try/catch e repassa qualquer erro
 * para o middleware global de erros do Express via next(err).
 * Elimina a necessidade de try/catch repetitivo em cada controller.
 */
export function asyncHandler(fn: AsyncController) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next)
  }
}
