'use client'

import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { METRICS_DEFINITIONS } from '@/lib/utils/metrics-mapping'

// Registrar componentes de Chart.js
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface ComparisonDataPoint {
  key: string
  metric: string
  unit: string
  [nadadorNombre: string]: string | number
}

interface SwimmerData {
  id_nadador: number
  nombre: string
}

interface ComparisonChartProps {
  swimmers: SwimmerData[]
  metricGroup: string
  comparisonData: ComparisonDataPoint[]
  loading?: boolean
}

// Paleta de colores Phoenix para nadadores
const PHOENIX_COLORS = [
  { border: 'rgb(220, 38, 38)', background: 'rgba(220, 38, 38, 0.2)' }, // phoenix-red
  { border: 'rgb(234, 88, 12)', background: 'rgba(234, 88, 12, 0.2)' }, // phoenix-orange
  { border: 'rgb(217, 119, 6)', background: 'rgba(217, 119, 6, 0.2)' }, // phoenix-yellow
  { border: 'rgb(245, 158, 11)', background: 'rgba(245, 158, 11, 0.2)' }, // phoenix-amber
  { border: 'rgb(225, 29, 72)', background: 'rgba(225, 29, 72, 0.2)' }  // phoenix-rose
]

export default function ComparisonChart({ 
  swimmers, 
  metricGroup, 
  comparisonData,
  loading = false 
}: ComparisonChartProps) {
  
  const chartData = useMemo(() => {
    if (!comparisonData || comparisonData.length === 0) return null

    // Extraer labels de métricas
    const labels = comparisonData.map(item => {
      const metricDef = METRICS_DEFINITIONS.find(m => m.parametro === item.key)
      return metricDef?.label || item.metric
    })

    // Crear datasets para cada nadador
    const datasets = swimmers.map((swimmer, index) => {
      const colorScheme = PHOENIX_COLORS[index % PHOENIX_COLORS.length]
      
      // Extraer valores para este nadador
      const data = comparisonData.map(item => {
        const value = item[swimmer.nombre]
        return typeof value === 'number' ? value : parseFloat(value as string) || 0
      })

      return {
        label: swimmer.nombre,
        data,
        borderColor: colorScheme.border,
        backgroundColor: colorScheme.background,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colorScheme.border,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colorScheme.border
      }
    })

    return { labels, datasets }
  }, [swimmers, comparisonData])

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 600
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(220, 38, 38, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: TooltipItem<'radar'>) {
            const label = context.dataset.label || ''
            const value = context.parsed.r
            const metricData = comparisonData[context.dataIndex]
            const unit = metricData?.unit || ''
            return `${label}: ${value.toFixed(2)} ${unit}`
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        },
        pointLabels: {
          font: {
            size: 11,
            weight: 500
          },
          color: '#64748b'
        },
        ticks: {
          backdropColor: 'transparent',
          color: '#64748b',
          font: {
            size: 10
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.3
      }
    }
  }

  // Estado de loading
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl animate-pulse">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-phoenix-red/20 to-phoenix-orange/20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-phoenix-red/30 border-t-phoenix-red animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Cargando gráfico de comparación...
          </p>
        </div>
      </div>
    )
  }

  // Estado sin datos
  if (!chartData) {
    return (
      <div className="h-80 flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-phoenix-red/10 to-phoenix-orange/10 flex items-center justify-center">
            <span className="text-4xl">📊</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            No hay datos de comparación disponibles
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Selecciona nadadores y métricas para comenzar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-80 p-4">
      {/* Indicador de métricas */}
      <div className="absolute top-2 right-2 z-10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border">
          <div className="w-2 h-2 rounded-full bg-phoenix-red animate-pulse"></div>
          <span>Métricas de {metricGroup}</span>
        </div>
      </div>
      
      {/* Gráfico Radar */}
      <Radar data={chartData} options={options} />
      
      {/* Leyenda adicional con información */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {swimmers.map((swimmer, index) => {
          const colorScheme = PHOENIX_COLORS[index % PHOENIX_COLORS.length]
          return (
            <div 
              key={swimmer.id_nadador}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-xs"
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colorScheme.border }}
              />
              <span className="font-medium">{swimmer.nombre}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
} 