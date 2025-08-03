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

 