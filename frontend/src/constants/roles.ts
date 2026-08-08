import { UserRole } from '../types'

export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: 'Aluno',
  LIBRARIAN: 'Bibliotecária',
  DEVELOPER: 'Desenvolvedor',
  ADVISOR: 'Professor Orientador',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  STUDENT: '#1D4ED8',
  LIBRARIAN: '#16a34a',
  DEVELOPER: '#7c3aed',
  ADVISOR: '#d97706',
}

export const ADMIN_ROLES: UserRole[] = ['LIBRARIAN', 'DEVELOPER', 'ADVISOR']
export const USER_MANAGEMENT_ROLES: UserRole[] = ['DEVELOPER', 'ADVISOR']
export const MODERATION_ROLES: UserRole[] = ['LIBRARIAN', 'DEVELOPER', 'ADVISOR']
