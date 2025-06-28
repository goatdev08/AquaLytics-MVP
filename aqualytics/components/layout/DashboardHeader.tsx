/**
 * DashboardHeader - Encabezado del dashboard con métricas clave
 * Muestra: Nadadores activos, Competencias activas, Último análisis
 */

'use client'

import { useEffect, useMemo } from 'react'
import MetricCard from '@/components/ui/MetricCard'
import { useSwimmersStore } from '@/lib/store'

// Iconos SVG para las métricas
const SwimmersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CompetitionsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 22h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const AnalysisIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export function DashboardHeader() {
  const { swimmers, loading, fetchSwimmers } = useSwimmersStore()

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchSwimmers()
  }, [fetchSwimmers])

  // Calcular métricas derivadas
  const metrics = useMemo(() => {
    const totalSwimmers = swimmers.length
    
    // TODO: Para MVP usamos datos simulados para competencias y análisis
    // En futuras versiones se conectará con datos reales
    const activeCompetitions = 3 // Dato simulado por ahora
    const lastAnalysisHours = 2 // Dato simulado por ahora
    
    return {
      swimmers: {
        value: totalSwimmers,
        description: totalSwimmers === 1 ? 'nadador registrado' : 'nadadores registrados',
        trend: totalSwimmers > 0 ? {
          value: 12,
          isPositive: true,
          label: 'vs mes anterior'
        } : undefined
      },
      competitions: {
        value: activeCompetitions,
        description: 'competencias en progreso',
        trend: {
          value: 25,
          isPositive: true,
          label: 'vs período anterior'
        }
      },
      analysis: {
        value: `${lastAnalysisHours}h`,
        description: 'desde último análisis',
        trend: undefined // Sin tendencia para tiempo
      }
    }
  }, [swimmers])

  return (
    <div className="space-y-6">
      {/* Título del Dashboard */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold phoenix-text-gradient">
          Dashboard AquaLytics
        </h1>
        <p className="text-lg text-muted-foreground">
          Análisis de rendimiento en tiempo real
        </p>
      </div>

      {/* Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Nadadores Activos"
          value={metrics.swimmers.value}
          icon={<SwimmersIcon />}
          description={metrics.swimmers.description}
          trend={metrics.swimmers.trend}
          loading={loading}
        />
        
        <MetricCard
          title="Competencias"
          value={metrics.competitions.value}
          icon={<CompetitionsIcon />}
          description={metrics.competitions.description}
          trend={metrics.competitions.trend}
          loading={loading}
        />
        
        <MetricCard
          title="Último Análisis"
          value={metrics.analysis.value}
          icon={<AnalysisIcon />}
          description={metrics.analysis.description}
          trend={metrics.analysis.trend}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default DashboardHeader 