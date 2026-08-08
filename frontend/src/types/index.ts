// ─────────────────────────────────────────────
// Tipos do LibraryHub — Frontend
// ─────────────────────────────────────────────

export type UserRole = 'STUDENT' | 'LIBRARIAN' | 'DEVELOPER' | 'ADVISOR'
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type Theme = 'light' | 'dark' | 'high-contrast'

export interface User {
  id: string
  login: string
  name: string
  role: UserRole
  avatarId: string | null
  bannerType: string
  bannerValue: string | null
  turma: string | null
  curso: string | null
  mustChangePassword: boolean
  isActive?: boolean
  createdAt?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  iconPath: string | null
}

export interface Author {
  id: string
  name: string
}

export interface Book {
  id: string
  title: string
  slug: string
  synopsis: string | null
  coverImage: string | null
  filePath: string
  publishedYear: number | null
  pageCount: number | null
  isPublished: boolean
  downloadCount: number
  viewCount: number
  avgRating: number
  ratingCount: number
  createdAt: string
  category: Category
  authors: { author: Author }[]
  // Campos adicionais ao buscar livro específico
  reviews?: Review[]
  progress?: ReadingProgress | null
  isFavorited?: boolean
}

export interface TCC {
  id: string
  title: string
  slug: string
  abstract: string | null
  filePath: string
  coverImage: string | null
  keywords: string | null
  year: number
  course: string | null
  isPublished: boolean
  viewCount: number
  createdAt: string
  author: Author
  category: Category | null
  advisorUser: { name: string } | null
}

export interface Review {
  id: string
  userId: string
  bookId: string
  rating: number
  comment: string | null
  status: ReviewStatus
  rejectionReason?: string | null
  createdAt: string
  user?: { name: string; avatarId: string | null; turma?: string | null }
  book?: { title: string; slug: string }
}

export interface ReadingProgress {
  id: string
  userId: string
  bookId: string
  currentPage: number
  totalPages: number | null
  isFinished: boolean
  lastReadAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination: Pagination
}

export interface DashboardStats {
  totals: {
    totalUsers: number
    totalBooks: number
    totalTCCs: number
    totalDownloads: number
    pendingReviews: number
    approvedReviews?: number
    rejectedReviews?: number
    readingsToday?: number
  }
  recentLogs: LogEntry[]
  mostAccessedBooks: Book[]
  mostDownloadedBooks: Book[]
  highestRatedBooks: Book[]
  mostAccessedTccs?: any[]
  recentBooks?: any[]
  recentTccs?: any[]
}

export interface LogEntry {
  id: string
  userId: string | null
  action: string
  description: string | null
  ipAddress: string | null
  createdAt: string
  user?: { name: string; role: UserRole } | null
}
