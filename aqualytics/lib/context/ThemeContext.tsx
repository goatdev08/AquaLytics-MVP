'use client'

/**
 * Phoenix Theme Context Provider
 * Maneja el estado global del tema (light/dark) y provee utilidades de tema
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  systemTheme: ResolvedTheme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'aqualytics-theme'
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light')

  // Detectar tema del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Cargar tema guardado
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(storageKey) as Theme
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme)
      }
    } catch (error) {
      console.warn('Error loading saved theme:', error)
    }
    setMounted(true)
  }, [storageKey])

  // Aplicar tema al DOM
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    const resolvedTheme = theme === 'system' ? systemTheme : theme

    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
    root.style.colorScheme = resolvedTheme

    // Actualizar meta theme-color para mobile
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolvedTheme === 'dark' ? '#0a0a0a' : '#ffffff'
      )
    }
  }, [theme, systemTheme, mounted])

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme)
      setThemeState(newTheme)
    } catch (error) {
      console.warn('Error saving theme:', error)
      setThemeState(newTheme)
    }
  }

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(systemTheme === 'dark' ? 'light' : 'dark')
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme

  // Prevenir hydration mismatch
  if (!mounted) {
    return (
      <div className="opacity-0">
        {children}
      </div>
    )
  }

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    systemTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook para usar el contexto de tema
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Hook para detectar tema del sistema
export function useSystemTheme() {
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return systemTheme
}

// Componente de toggle de tema simplificado y seguro
export function ThemeToggle({ className = '' }: { className?: string }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mostrar un placeholder antes del montaje para evitar hydration mismatch
  if (!mounted) {
    return (
      <button
        className={`
          p-2 rounded-lg transition-all duration-200
          hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring
          ${className}
        `}
        disabled
        aria-label="Cargando tema..."
      >
        <svg
          className="h-5 w-5 text-muted-foreground"
          fill="none"
          strokeWidth={2}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="13" r="8" />
        </svg>
      </button>
    )
  }

  // Ahora renderizar el componente interno que usa el contexto
  return <ThemeToggleButton className={className} />
}

// Componente separado que maneja el contexto del tema
function ThemeToggleButton({ className = '' }: { className?: string }) {
  // Este hook debe estar en un componente que siempre esté dentro del ThemeProvider
  const context = useContext(ThemeContext)
  
  // Si no hay contexto, no renderizar nada
  if (!context) {
    return null
  }

  const { theme, toggleTheme, resolvedTheme } = context

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-all duration-200
        hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring
        ${className}
      `}
      aria-label={`Cambiar a modo ${resolvedTheme === 'dark' ? 'claro' : 'oscuro'}`}
      title={`Tema actual: ${theme === 'system' ? 'sistema' : theme === 'dark' ? 'oscuro' : 'claro'}`}
    >
      {resolvedTheme === 'dark' ? (
        <svg
          className="h-5 w-5 text-phoenix-yellow"
          fill="none"
          strokeWidth={2}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5 text-phoenix-ash"
          fill="none"
          strokeWidth={2}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  )
} 