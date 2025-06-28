/**
 * Main Layout Component - AquaLytics
 * Layout principal que integra Header, Footer y maneja la estructura de la aplicación
 */

import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import { ModalManager } from './ModalManager'

interface MainLayoutProps {
  children: ReactNode
  className?: string
  showFooter?: boolean
}

export default function MainLayout({ 
  children, 
  className = '',
  showFooter = true 
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Contenido principal */}
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      
      {/* Footer */}
      {showFooter && <Footer />}
      
      {/* Sistema de modales global */}
      <ModalManager />
    </div>
  )
}

// Layout específico para páginas de autenticación
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 relative">
      {/* Patrón de fondo Phoenix */}
      <div className="absolute inset-0 phoenix-pattern opacity-5" />
      
      {/* Contenido */}
      <div className="relative z-10 w-full max-w-md p-6">
        {children}
      </div>
    </div>
  )
}

// Layout para páginas de dashboard con sidebar
export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        {/* Sidebar placeholder - se implementará en subtarea posterior */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-border">
          <div className="flex-1 p-6">
            <div className="space-y-4">
              <div className="text-sm font-medium text-muted-foreground">
                Panel lateral pendiente
              </div>
            </div>
          </div>
        </aside>
        
        {/* Contenido principal */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  )
}

// Layout para páginas de análisis con toolbar
export function AnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Toolbar de análisis */}
      <div className="border-b border-border bg-muted/30 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">Análisis de Rendimiento</h1>
            <div className="h-4 w-px bg-border" />
            <div className="text-sm text-muted-foreground">
              Métricas y visualizaciones avanzadas
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 text-xs font-medium bg-background border border-border rounded-md hover:bg-accent transition-colors">
              Exportar
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-phoenix-red text-white rounded-md hover:bg-phoenix-red-dark transition-colors">
              Compartir
            </button>
          </div>
        </div>
      </div>
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  )
} 