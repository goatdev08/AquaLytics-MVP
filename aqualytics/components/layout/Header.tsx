'use client'

/**
 * Header Component - AquaLytics
 * Navegación principal con tema Phoenix y comportamiento responsive
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/lib/context/ThemeContext'

interface NavItem {
  name: string
  href: string
  icon?: React.ReactNode
  description?: string
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    description: 'Vista general y métricas principales',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
      </svg>
    )
  },
  {
    name: 'Métricas',
    href: '/metrics',
    description: 'Entrada manual de métricas de natación',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    name: 'Nadadores',
    href: '/swimmers',
    description: 'Gestión de nadadores',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    name: 'Análisis',
    href: '/analytics',
    description: 'Visualización y comparaciones',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  }
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Logo y título */}
        <div className="mr-4 hidden md:flex">
          <Link 
            href="/" 
            className="mr-6 flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-phoenix-red via-phoenix-orange to-phoenix-yellow">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.54 0 3-.35 4.3-.97-.63-.9-1.3-1.93-1.3-3.03 0-.79.35-1.51.9-2 .35-.31.57-.76.57-1.26 0-.83-.67-1.5-1.5-1.5S13.5 13.91 13.5 14.74c0 .38-.31.69-.69.69s-.69-.31-.69-.69c0-1.01.82-1.83 1.83-1.83 1.01 0 1.83.82 1.83 1.83 0 .18-.03.35-.08.52.35.5.56 1.11.56 1.78 0 .83-.33 1.58-.87 2.13C17.65 19.91 20 16.21 20 12c0-4.41-3.59-8-8-8z"/>
              </svg>
            </div>
            <span className="hidden font-bold phoenix-text-gradient lg:inline-block text-xl">
              AquaLytics
            </span>
          </Link>
        </div>

        {/* Navegación desktop */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                transition-colors hover:text-foreground/80 relative group
                ${isActiveRoute(item.href) 
                  ? 'text-foreground' 
                  : 'text-foreground/60'
                }
              `}
            >
              <span className="flex items-center space-x-2">
                {item.icon}
                <span>{item.name}</span>
              </span>
              
              {/* Indicador activo con gradient Phoenix */}
              {isActiveRoute(item.href) && (
                <div className="absolute -bottom-2 left-0 right-0 h-0.5 phoenix-gradient rounded-full" />
              )}
              
              {/* Hover tooltip */}
              {item.description && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                  {item.description}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-popover rotate-45" />
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Espaciador */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Logo móvil */}
          <div className="flex md:hidden">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-phoenix-red via-phoenix-orange to-phoenix-yellow">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.54 0 3-.35 4.3-.97-.63-.9-1.3-1.93-1.3-3.03 0-.79.35-1.51.9-2 .35-.31.57-.76.57-1.26 0-.83-.67-1.5-1.5-1.5S13.5 13.91 13.5 14.74c0 .38-.31.69-.69.69s-.69-.31-.69-.69c0-1.01.82-1.83 1.83-1.83 1.01 0 1.83.82 1.83 1.83 0 .18-.03.35-.08.52.35.5.56 1.11.56 1.78 0 .83-.33 1.58-.87 2.13C17.65 19.91 20 16.21 20 12c0-4.41-3.59-8-8-8z"/>
                </svg>
              </div>
              <span className="font-bold phoenix-text-gradient text-lg">
                AquaLytics
              </span>
            </Link>
          </div>

          {/* Acciones de la derecha */}
          <div className="flex items-center space-x-2">
            {/* Toggle de tema */}
            <ThemeToggle />

            {/* Usuario/Acciones adicionales */}
            <div className="hidden md:flex items-center space-x-2">
              <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5c-1.38 0-2.5-1.12-2.5-2.5S13.62 14.5 15 14.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6c1.38 0 2.5 1.12 2.5 2.5S16.38 10 15 10H9c-1.38 0-2.5-1.12-2.5-2.5S7.62 5 9 5z" />
                </svg>
              </button>
            </div>

            {/* Botón menú móvil */}
            <button
              className="inline-flex items-center justify-center rounded-md text-base font-medium md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Abrir menú principal</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="border-t border-border px-2 pb-3 pt-2 space-y-1 bg-background/95 backdrop-blur">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block px-3 py-2 rounded-md text-base font-medium transition-colors
                  ${isActiveRoute(item.href)
                    ? 'bg-accent text-accent-foreground phoenix-shadow'
                    : 'text-foreground/70 hover:bg-accent/50 hover:text-accent-foreground'
                  }
                `}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <div>
                    <div>{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
} 