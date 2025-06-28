/**
 * Dashboard Principal de AquaLytics
 * Página principal con métricas clave y visualizaciones
 */

import MainLayout from '@/components/layout/MainLayout'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { VisualizationArea } from '@/components/layout/VisualizationArea'
import { QuickActions } from '@/components/layout/QuickActions'

export default function HomePage() {
  return (
    <MainLayout>
      <div className="space-y-8 p-6">
        {/* Encabezado con métricas clave */}
        <DashboardHeader />
        
        {/* Área de visualización principal */}
        <VisualizationArea />
        
        {/* Acciones rápidas - Subtarea 18.3 ✅ */}
        <QuickActions />
      </div>
    </MainLayout>
  )
}
