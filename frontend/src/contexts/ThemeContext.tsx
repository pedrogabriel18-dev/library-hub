import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Theme } from '../types'

interface ThemeContextData {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isHighContrast: boolean
  toggleHighContrast: () => void
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme
    return stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })

  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    const stored = localStorage.getItem('highContrast')
    return stored === 'true'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true')
    } else {
      document.documentElement.removeAttribute('data-high-contrast')
    }
    localStorage.setItem('highContrast', String(isHighContrast))
  }, [isHighContrast])

  function setTheme(newTheme: Theme) {
    setThemeState(newTheme)
    if (newTheme === 'high-contrast') {
      setIsHighContrast(true)
    } else {
      setIsHighContrast(false)
    }
  }

  function toggleTheme() {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  function toggleHighContrast() {
    setIsHighContrast((prev) => !prev)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isHighContrast, toggleHighContrast }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
