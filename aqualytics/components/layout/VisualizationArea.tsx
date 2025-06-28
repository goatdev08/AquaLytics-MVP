/**
 * VisualizationArea - Área principal de visualización del dashboard
 * Contiene: Progresión 30 días, Distribución de estilos, Top 5 nadadores
 */

'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useSwimmersStore } from '@/lib/store'

// Importar componentes Chart.js dinámicamente para evitar problemas de SSR
const MetricsChart = dynamic(() => import('@/components/charts/MetricsChart'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-4 bg-muted rounded w-48 mb-4"></div>
      <div className="h-64 bg-muted/30 rounded"></div>
    </div>
  )
})

const ComparisonChart = dynamic(() => import('@/components/charts/ComparisonChart'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-4 bg-muted rounded w-48 mb-4"></div>
      <div className="h-64 bg-muted/30 rounded"></div>
    </div>
  )
})

const RankingTable = dynamic(() => import('@/components/charts/RankingTable'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-4 bg-muted rounded w-48 mb-4"></div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted/30 rounded"></div>
        ))}
      </div>
    </div>
  )
})

export function VisualizationArea() {
  const { swimmers, loading } = useSwimmersStore()
  
  // Estado para el selector de rango de fechas
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '3m' | '1y'>('30d')

  // Función para obtener fechas según el rango seleccionado
  const getDateRange = (range: '7d' | '30d' | '3m' | '1y') => {
    const today = new Date()
    const start = new Date(today)
    
    switch (range) {
      case '7d':
        start.setDate(today.getDate() - 7)
        break
      case '30d':
        start.setDate(today.getDate() - 30)
        break
      case '3m':
        start.setMonth(today.getMonth() - 3)
        break
      case '1y':
        start.setFullYear(today.getFullYear() - 1)
        break
    }
    
    return { start, end: today }
  }

  // Datos simulados para gráfico de progresión (MetricsChart)
  const progressionData = useMemo(() => {
    const today = new Date()
    const data = []
    
    // Generar últimos 30 días
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Simulamos velocidad promedio con variación realista
      const baseSpeed = 1.8 // m/s
      const variation = (Math.random() - 0.5) * 0.3
      
      data.push({
        fecha: date.toISOString().split('T')[0],
        valor: Number((baseSpeed + variation).toFixed(2)),
        competencia: i % 7 === 0 ? 'Regional' : undefined // Simular algunas competencias
      })
    }
    
    return data
  }, [])

  // Datos mejorados para distribución de estilos (ComparisonChart)
  const strokeDistributionData = useMemo(() => {
    return [
      {
        nombre: 'Participación por Estilo',
        metrics: [
          { metric: 'crol', value: 45, displayName: 'Estilo Libre', unit: '%' },
          { metric: 'dorso', value: 20, displayName: 'Espalda', unit: '%' },
          { metric: 'pecho', value: 15, displayName: 'Pecho', unit: '%' },
          { metric: 'mariposa', value: 12, displayName: 'Mariposa', unit: '%' },
          { metric: 'combinado', value: 8, displayName: 'Medley', unit: '%' }
        ]
      }
    ]
  }, [])

  // Datos mejorados para Top 5 nadadores (RankingTable con rango de fechas)
  const topSwimmersData = useMemo(() => {
    const { start, end } = getDateRange(dateRange)
    
    // Generar datos simulados basados en nadadores reales si existen
    if (swimmers.length === 0) {
      return [
        { 
          id: '1', 
          nombre: 'Ana García', 
          prueba: '50m Estilo Libre',
          fecha: '2024-06-20',
          scores: [
            { metric: 'improvement', value: 12.5, displayName: 'Mejora', unit: '%' },
            { metric: 'avgSpeed', value: 1.85, displayName: 'Velocidad Promedio', unit: 'm/s' },
            { metric: 'bestTime', value: 26.8, displayName: 'Mejor Tiempo', unit: 'seg' }
          ]
        },
        { 
          id: '2', 
          nombre: 'Carlos López', 
          prueba: '50m Espalda',
          fecha: '2024-06-19',
          scores: [
            { metric: 'improvement', value: 8.3, displayName: 'Mejora', unit: '%' },
            { metric: 'avgSpeed', value: 1.78, displayName: 'Velocidad Promedio', unit: 'm/s' },
            { metric: 'bestTime', value: 28.1, displayName: 'Mejor Tiempo', unit: 'seg' }
          ]
        },
        { 
          id: '3', 
          nombre: 'María Rodríguez', 
          prueba: '50m Pecho',
          fecha: '2024-06-18',
          scores: [
            { metric: 'improvement', value: 7.9, displayName: 'Mejora', unit: '%' },
            { metric: 'avgSpeed', value: 1.65, displayName: 'Velocidad Promedio', unit: 'm/s' },
            { metric: 'bestTime', value: 30.3, displayName: 'Mejor Tiempo', unit: 'seg' }
          ]
        },
        { 
          id: '4', 
          nombre: 'Diego Martínez', 
          prueba: '50m Mariposa',
          fecha: '2024-06-17',
          scores: [
            { metric: 'improvement', value: 6.2, displayName: 'Mejora', unit: '%' },
            { metric: 'avgSpeed', value: 1.72, displayName: 'Velocidad Promedio', unit: 'm/s' },
            { metric: 'bestTime', value: 29.1, displayName: 'Mejor Tiempo', unit: 'seg' }
          ]
        },
        { 
          id: '5', 
          nombre: 'Laura Fernández', 
          prueba: '50m Medley Individual',
          fecha: '2024-06-16',
          scores: [
            { metric: 'improvement', value: 5.8, displayName: 'Mejora', unit: '%' },
            { metric: 'avgSpeed', value: 1.58, displayName: 'Velocidad Promedio', unit: 'm/s' },
            { metric: 'bestTime', value: 31.6, displayName: 'Mejor Tiempo', unit: 'seg' }
          ]
        }
      ]
    }
    
    // Usar nadadores reales con datos simulados de mejora
    return swimmers.slice(0, 5).map((swimmer, index) => {
      // Simular fecha dentro del rango seleccionado
      const randomDaysBack = Math.floor(Math.random() * Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)))
      const simulatedDate = new Date(end.getTime() - randomDaysBack * 24 * 60 * 60 * 1000)
      
      return {
        id: swimmer.id_nadador.toString(),
        nombre: swimmer.nombre,
        prueba: '50m Estilo Libre', // Simulado para MVP
        fecha: simulatedDate.toISOString().split('T')[0],
        scores: [
          { 
            metric: 'improvement', 
            value: Number((15 - index * 2 + Math.random() * 3).toFixed(1)), 
            displayName: 'Mejora', 
            unit: '%' 
          },
          { 
            metric: 'avgSpeed', 
            value: Number((1.9 - index * 0.05 + Math.random() * 0.1).toFixed(2)), 
            displayName: 'Velocidad Promedio', 
            unit: 'm/s' 
          },
          { 
            metric: 'bestTime', 
            value: Number((25 + index * 0.5 + Math.random() * 2).toFixed(1)), 
            displayName: 'Mejor Tiempo', 
            unit: 'seg' 
          }
        ]
      }
    })
  }, [swimmers, dateRange])

  // Función para obtener el label del rango de fechas
  const getDateRangeLabel = (range: '7d' | '30d' | '3m' | '1y') => {
    switch (range) {
      case '7d': return 'Últimos 7 días'
      case '30d': return 'Últimos 30 días'
      case '3m': return 'Últimos 3 meses'
      case '1y': return 'Último año'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold phoenix-title">
          Análisis de Rendimiento
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loading skeleton para gráficos */}
          <div className="phoenix-card p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-48 mb-4"></div>
              <div className="h-64 bg-muted/30 rounded"></div>
            </div>
          </div>
          
          <div className="phoenix-card p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-48 mb-4"></div>
              <div className="h-64 bg-muted/30 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="phoenix-card p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-48 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted/30 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold phoenix-title">
        Análisis de Rendimiento
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de progresión temporal */}
        <MetricsChart
          title="Progresión de Velocidad Promedio"
          data={progressionData}
          metricName="v_promedio"
          unit="m/s"
          showGradient={true}
          height={280}
        />

        {/* Distribución por estilos mejorada */}
        <ComparisonChart
          title="Participación por Estilo de Natación"
          swimmers={strokeDistributionData}
          colorScheme="warm"
          showLegend={true}
          height={320}
        />
      </div>

      {/* Top 5 nadadores por mejora con selector de fechas */}
      <div className="phoenix-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Top 5 Nadadores por Mejora</h3>
          
          {/* Selector de rango de fechas */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Período:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '3m' | '1y')}
              className="px-3 py-1 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary border-border"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="3m">Últimos 3 meses</option>
              <option value="1y">Último año</option>
            </select>
          </div>
        </div>
        
        <RankingTable
          title=""
          swimmers={topSwimmersData}
          primaryMetric="improvement"
          showOverallScore={false}
          showFilters={false}
          highlightTop={3}
        />
        
        <p className="text-sm text-muted-foreground mt-2">
          Clasificación basada en mejora de rendimiento para el período: {getDateRangeLabel(dateRange)}
        </p>
      </div>
    </div>
  )
}

export default VisualizationArea 