import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../services/api'
import { User } from '../types'

interface AuthContextData {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (login: string, password: string, role: string) => Promise<{ mustChangePassword: boolean }>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restaura sessão ao carregar
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        // Valida token com o backend
        api.get('/auth/me').then(({ data }) => {
          setUser(data.data)
          localStorage.setItem('user', JSON.stringify(data.data))
        }).catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        }).finally(() => setIsLoading(false))
      } catch {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  async function login(loginStr: string, password: string, role: string) {
    const { data } = await api.post('/auth/login', { login: loginStr, password, role })

    const { token, user: userData } = data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)

    return { mustChangePassword: userData.mustChangePassword }
  }

  function logout() {
    api.post('/auth/logout').catch(() => {})
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  function updateUser(data: Partial<User>) {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...data }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
