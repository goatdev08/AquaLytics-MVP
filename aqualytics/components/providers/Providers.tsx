'use client'

/**
 * Client-side Providers Component
 * Agrupa todos los providers que necesitan ejecutarse en el cliente
 */

import { ReactNode } from 'react'
import { ThemeProvider } from '@/lib/context/ThemeContext'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="aqualytics-theme">
      {children}
    </ThemeProvider>
  )
} 