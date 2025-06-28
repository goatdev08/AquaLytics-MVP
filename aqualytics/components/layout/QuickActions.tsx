/**
 * QuickActions - Componente de acciones rápidas del dashboard
 * Implementa funcionalidades para nuevo registro, carga CSV y rankings
 */

'use client'

import { useRouter } from 'next/navigation'
import { useUIStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'

// ===== CONFIGURACIÓN DE ACCIONES =====

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  color?: 'phoenix' | 'default'
}

// ===== COMPONENTE PRINCIPAL =====

export function QuickActions() {
  const router = useRouter()
  const { openModal } = useUIStore()

  // Definir acciones disponibles
  const actions: QuickAction[] = [
    {
      id: 'new-record',
      title: 'Nuevo Registro',
      description: 'Agregar tiempo de entrenamiento',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      action: () => openModal('createMetric'),
      variant: 'primary',
      color: 'phoenix'
    },
    {
      id: 'upload-csv',
      title: 'Cargar CSV',
      description: 'Importar datos masivos',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      action: () => openModal('uploadCSV'),
      variant: 'secondary'
    },
    {
      id: 'view-rankings',
      title: 'Ver Rankings',
      description: 'Consultar clasificaciones',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      action: () => router.push('/metrics'),
      variant: 'ghost'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold phoenix-title">
          Acciones Rápidas
        </h2>
        <p className="text-sm text-muted-foreground">
          Funciones principales del sistema
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <Button
            key={action.id}
            onClick={action.action}
            variant={action.variant || 'secondary'}
            className={`
              p-6 h-auto text-left justify-start space-x-3
              ${action.color === 'phoenix' ? 'phoenix-button' : ''}
              hover:scale-105 transition-all duration-200
              group
            `}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className={`
                flex-shrink-0 transition-colors duration-200
                ${action.color === 'phoenix' ? 'text-white' : 'text-current group-hover:text-primary'}
              `}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`
                  font-medium text-base mb-1
                  ${action.color === 'phoenix' ? 'text-white' : 'text-foreground'}
                `}>
                  {action.title}
                </h3>
                <p className={`
                  text-sm 
                  ${action.color === 'phoenix' ? 'text-white/80' : 'text-muted-foreground'}
                `}>
                  {action.description}
                </p>
              </div>
            </div>
          </Button>
        ))}
      </div>
      
      {/* Indicador de tiempo real */}
      <div className="flex items-center justify-center pt-4 border-t border-border/50">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Sistema en tiempo real activo</span>
        </div>
      </div>
    </div>
  )
} 