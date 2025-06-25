/**
 * Página de Gestión de Nadadores
 * Sistema completo CRUD para nadadores con interfaz moderna
 */

import React from 'react'
import { SwimmerList } from '@/components/swimmers/SwimmerList'
import MainLayout from '@/components/layout/MainLayout'

export default function SwimmersPage() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-screen-2xl px-6 py-8">
        <SwimmerList showStats={true} />
      </div>
    </MainLayout>
  )
}

export const metadata = {
  title: 'Gestión de Nadadores - AquaLytics',
  description: 'Sistema de gestión completo para nadadores. Crear, editar, visualizar y administrar información de nadadores con estadísticas de rendimiento.',
  keywords: 'nadadores, gestión, CRUD, natación, administración'
} 