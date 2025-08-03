'use client'

/**
 * Gráfico de Comparación - AquaLytics
 * Visualización de comparación entre nadadores usando Chart.js
 */

import React, { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/Card'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  RadarController,
  RadialLinearScale
} from 'chart.js'
import { Chart } from 'react-chartjs-2'

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  RadarController,
  RadialLinearScale
)

interface ComparisonData {
  swimmer_id: number
  swimmer_name: string
  fecha: string
  fase: string
  metricas: {
    [key: string]: number
  }
}

interface ComparisonChartProps {
  data: ComparisonData[]
  chartType?: 'bar' | 'radar'
}

// Paleta de colores Phoenix para los nadadores - optimizada para mejor distinción visual
const PHOENIX_COLORS = [
  {
    background: 'rgba(220, 38, 38, 0.8)',
    border: 'rgb(220, 38, 38)',
    accent: '#DC2626'
  },
  {
    background: 'rgba(234, 88, 12, 0.8)',
    border: 'rgb(234, 88, 12)',
    accent: '#EA580C'
  },
  {
    background: 'rgba(245, 158, 11, 0.8)',
    border: 'rgb(245, 158, 11)',
    accent: '#F59E0B'
  },
  {
    background: 'rgba(234, 179, 8, 0.8)',
    border: 'rgb(234, 179, 8)',
    accent: '#EAB308'
  }
]

export function ComparisonChart({ data, chartType = 'bar' }: ComparisonChartProps) {
  const chartRef = useRef<ChartJS>(null)

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <svg className="h-12 w-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012-2z" />
          </svg>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Sin datos para mostrar
          </h3>
          <p className="text-sm text-muted-foreground">
            Selecciona nadadores y una prueba para generar la comparación
          </p>
        </div>
      </Card>
    )
  }

  // Filtrar nadadores que tienen métricas válidas
  const validData = data.filter(swimmer => 
    swimmer.metricas && Object.keys(swimmer.metricas).length > 0
  )

  // Identificar nadadores sin datos para mostrar advertencia
  const nadoresSinDatos = data.filter(swimmer => 
    !swimmer.metricas || Object.keys(swimmer.metricas).length === 0
  )

  // Obtener todas las métricas únicas de los nadadores válidos
  const allMetrics = Array.from(
    new Set(
      validData.flatMap(swimmer => Object.keys(swimmer.metricas))
    )
  )

  // Preparar datasets para Chart.js solo con nadadores válidos
  const datasets = validData.map((swimmer, index) => {
    const color = PHOENIX_COLORS[index % PHOENIX_COLORS.length]
    
    return {
      label: `${swimmer.swimmer_name || 'Nadador Desconocido'} (${swimmer.fecha || 'Fecha N/A'} - ${swimmer.fase || 'Fase N/A'})`,
      data: allMetrics.map(metric => swimmer.metricas[metric] || 0),
      backgroundColor: color.background,
      borderColor: color.border,
      borderWidth: 2,
      pointBackgroundColor: color.border,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: color.border,
      swimmer_name: swimmer.swimmer_name || 'Nadador Desconocido', // Agregar datos adicionales para el tooltip
      fecha: swimmer.fecha || 'Fecha N/A',
      fase: swimmer.fase || 'Fase N/A'
    }
  })

  const chartData = {
    labels: allMetrics,
    datasets
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Comparación de Rendimiento',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        color: document.documentElement.classList.contains('dark') ? '#F9FAFB' : '#374151'
      },
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#DC2626',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: function(context: any) {
            const metricName = context[0]?.label || ''
            // Mapear nombres técnicos a nombres amigables para entrenadores
            const friendlyNames: { [key: string]: string } = {
              't_total': 'Tiempo Total',
              'v_promedio': 'Velocidad Promedio',
              'f_promedio': 'Frecuencia Promedio',
              'l_promedio': 'Largo de Brazada Promedio',
              'ef_nado': 'Eficiencia de Nado',
              'i_nado': 'Índice de Nado',
              'brz_total': 'Brazadas Totales',
              'v_max': 'Velocidad Máxima',
              'f_max': 'Frecuencia Máxima',
              'l_max': 'Largo de Brazada Máximo'
            }
            return friendlyNames[metricName] || metricName || 'Métrica'
          },
          label: function(context: any) {
            const dataset = context.dataset
            const swimmerName = dataset.swimmer_name || 'Nadador Desconocido'
            const fecha = dataset.fecha || 'Fecha N/A'  
            const fase = dataset.fase || 'Fase N/A'
            const value = context.parsed.y || context.parsed.r || 0
            const metricName = context.label || ''
            
            // Determinar unidad de medida según la métrica
            let unit = ''
            if (metricName.includes('t_') || metricName.includes('Tiempo')) {
              unit = ' seg'
            } else if (metricName.includes('v_') || metricName.includes('Velocidad')) {
              unit = ' m/s'
            } else if (metricName.includes('f_') || metricName.includes('Frecuencia')) {
              unit = ' Hz'
            } else if (metricName.includes('l_') || metricName.includes('Largo')) {
              unit = ' m'
            } else if (metricName.includes('brz_') || metricName.includes('Brazadas')) {
              unit = ' brazadas'
            } else if (metricName.includes('ef_') || metricName.includes('Eficiencia')) {
              unit = '%'
            }
            
            return `${swimmerName} (${fecha} - ${fase}): ${value.toFixed(2)}${unit}`
          },
          afterBody: function(context: any) {
            if (context.length > 1) {
              return ['', '💡 Comparando rendimiento entre nadadores']
            }
            return []
          }
        }
      }
    },
    scales: chartType === 'bar' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: document.documentElement.classList.contains('dark') ? 'rgba(156, 163, 175, 0.2)' : 'rgba(156, 163, 175, 0.3)'
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#6B7280'
        }
      },
      x: {
        grid: {
          color: document.documentElement.classList.contains('dark') ? 'rgba(156, 163, 175, 0.2)' : 'rgba(156, 163, 175, 0.3)'
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#6B7280'
        }
      }
    } : {
      r: {
        beginAtZero: true,
        grid: {
          color: document.documentElement.classList.contains('dark') ? 'rgba(156, 163, 175, 0.2)' : 'rgba(156, 163, 175, 0.3)'
        },
        angleLines: {
          color: document.documentElement.classList.contains('dark') ? 'rgba(156, 163, 175, 0.2)' : 'rgba(156, 163, 175, 0.3)'
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#6B7280',
          backdropColor: document.documentElement.classList.contains('dark') ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)'
        }
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Advertencia para nadadores sin datos */}
      {nadoresSinDatos.length > 0 && (
        <Card className="p-4 border-amber-200 bg-amber-50 dark:bg-amber-950/50 dark:border-amber-800">
          <div className="flex items-start gap-3 text-amber-800 dark:text-amber-400">
            <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-medium mb-1">Nadadores sin registros en esta prueba</h4>
              <div className="text-sm opacity-90">
                Los siguientes nadadores no tienen registros para la prueba seleccionada:
                <ul className="mt-2 space-y-1">
                  {nadoresSinDatos.map((nadador, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full"></span>
                      <span className="font-medium">{nadador.swimmer_name || 'Nadador Desconocido'}</span>
                      <span className="text-xs opacity-75">({nadador.fecha || 'Fecha N/A'} - {nadador.fase || 'Fase N/A'})</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs mt-2 opacity-75">
                💡 Esto puede ocurrir si el nadador no participó en esta prueba específica durante la fecha/fase seleccionada.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
            Comparación de Rendimiento
          </h3>
          <div className="text-sm text-muted-foreground">
            {validData.length} nadador{validData.length !== 1 ? 'es' : ''} • {allMetrics.length} métricas
          </div>
        </div>

        {/* Gráfico */}
        {validData.length > 0 ? (
          <div className="h-96 w-full">
            <Chart
              ref={chartRef}
              type={chartType}
              data={chartData}
              options={options}
            />
          </div>
        ) : (
          <div className="h-96 w-full flex items-center justify-center">
            <div className="text-center">
              <svg className="h-12 w-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012-2z" />
              </svg>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No hay datos válidos para mostrar
              </h3>
              <p className="text-sm text-muted-foreground">
                Ninguno de los nadadores seleccionados tiene registros en esta prueba
              </p>
            </div>
          </div>
        )}

        {/* Insights para entrenadores - Solo mejores rendimientos y análisis técnico */}
        {validData.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mejores rendimientos */}
            <div className="p-4 bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 dark:border-green-500/40 rounded-lg">
              <h4 className="font-medium text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                🏆 Mejores Rendimientos
              </h4>
              <div className="space-y-2 text-sm">
                {allMetrics.slice(0, 4).map(metric => {
                  const values = validData.map(swimmer => ({
                    name: swimmer.swimmer_name || 'Nadador Desconocido',
                    value: swimmer.metricas[metric] || 0
                  }))
                  // Para tiempo total, el mejor es el menor. Para otras métricas, el mejor es el mayor
                  const best = metric.includes('t_total') 
                    ? values.reduce((prev, curr) => curr.value < prev.value && curr.value > 0 ? curr : prev)
                    : values.reduce((prev, curr) => curr.value > prev.value ? curr : prev)
                  
                  const friendlyNames: { [key: string]: string } = {
                    't_total': 'Tiempo Total',
                    'v_promedio': 'Velocidad Promedio',
                    'f_promedio': 'Frecuencia Promedio',
                    'l_promedio': 'Largo de Brazada',
                    'ef_nado': 'Eficiencia de Nado',
                    'i_nado': 'Índice de Nado'
                  }
                  
                  return (
                    <div key={metric} className="text-green-700 dark:text-green-300 flex justify-between">
                      <span className="font-medium">{friendlyNames[metric] || metric}:</span>
                      <span>{best.name} ({best.value.toFixed(2)})</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Análisis técnico */}
            <div className="p-4 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 dark:border-blue-500/40 rounded-lg">
              <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                📊 Análisis Técnico
              </h4>
              <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex justify-between">
                  <span>Nadadores con datos:</span>
                  <span className="font-medium">{validData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Métricas disponibles:</span>
                  <span className="font-medium">{allMetrics.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fechas:</span>
                  <span className="font-medium">{Array.from(new Set(validData.map(d => d.fecha))).join(', ')}</span>
                </div>
                <div className="text-xs mt-2 pt-2 border-t border-blue-500/20">
                  <strong>Fases:</strong> {Array.from(new Set(validData.map(d => d.fase))).join(', ')}
                </div>
                {nadoresSinDatos.length > 0 && (
                  <div className="text-xs mt-2 pt-2 border-t border-blue-500/20">
                    <strong>Sin datos:</strong> {nadoresSinDatos.length} nadador{nadoresSinDatos.length !== 1 ? 'es' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
} 