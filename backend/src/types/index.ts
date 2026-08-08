// Tipos compartilhados do sistema

export type UserRole = 'STUDENT' | 'LIBRARIAN' | 'DEVELOPER' | 'ADVISOR'
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface JwtPayload {
  userId: string
  login: string
  role: UserRole
  name: string
}

export interface AuthenticatedRequest extends Express.Request {
  user?: JwtPayload
}

// Respostas padronizadas da API
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
