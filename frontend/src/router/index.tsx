import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { UserRole } from '../types'
import MainLayout from '../components/layout/MainLayout'
import { ScrollToTop } from '../components/common/ScrollToTop'

// Carregamento Preguiçoso de Páginas (Code Splitting / Lazy Loading)
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const ChangePasswordPage = lazy(() => import('../pages/auth/ChangePasswordPage'))
const HomePage = lazy(() => import('../pages/HomePage'))
const BooksPage = lazy(() => import('../pages/books/BooksPage'))
const BookDetailPage = lazy(() => import('../pages/books/BookDetailPage'))
const TCCsPage = lazy(() => import('../pages/tccs/TCCsPage'))
const TCCDetailPage = lazy(() => import('../pages/tccs/TCCDetailPage'))
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'))
const AboutPage = lazy(() => import('../pages/AboutPage'))
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'))
const AdminModerationPage = lazy(() => import('../pages/admin/AdminModerationPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))
const BookReaderPage = lazy(() => import('../pages/books/BookReaderPage'))
const PrivacyPolicyPage = lazy(() => import('../pages/institutional/PrivacyPolicyPage'))
const TermsOfUsePage = lazy(() => import('../pages/institutional/TermsOfUsePage'))
const CookiesPolicyPage = lazy(() => import('../pages/institutional/CookiesPolicyPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-body)',
      fontSize: '0.95rem',
      fontWeight: 500
    }}>
      Carregando módulos...
    </div>
  )
}

function RequireAuth({ allowedRoles }: { allowedRoles?: UserRole[] }) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <LoadingFallback />

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (user?.mustChangePassword) return <Navigate to="/alterar-senha" replace />

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/alterar-senha" element={<ChangePasswordPage />} />

          {/* Rotas protegidas */}
          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/livros" element={<BooksPage />} />
              <Route path="/livros/:slug" element={<BookDetailPage />} />
              <Route path="/tccs" element={<TCCsPage />} />
              <Route path="/tccs/:slug" element={<TCCDetailPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/configuracoes" element={<SettingsPage />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
              <Route path="/termos-de-uso" element={<TermsOfUsePage />} />
              <Route path="/politica-de-cookies" element={<CookiesPolicyPage />} />

              {/* Painel administrativo */}
              <Route
                path="/admin"
                element={<RequireAuth allowedRoles={['LIBRARIAN', 'DEVELOPER', 'ADVISOR']} />}
              >
                <Route index element={<AdminDashboardPage />} />
                <Route
                  path="usuarios"
                  element={<RequireAuth allowedRoles={['DEVELOPER', 'ADVISOR']} />}
                >
                  <Route index element={<AdminUsersPage />} />
                </Route>
                <Route
                  path="moderacao"
                  element={<RequireAuth allowedRoles={['LIBRARIAN', 'DEVELOPER']} />}
                >
                  <Route index element={<AdminModerationPage />} />
                </Route>
              </Route>
            </Route>

            {/* Leitor imersivo */}
            <Route path="/livros/:slug/ler" element={<BookReaderPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
