'use client'

import React, { useRef } from 'react'
import { Radar } from 'react-chartjs-2'
import { ChartData, ChartOptions } from 'chart.js'
import { 
  radarChartOptions, 
  datasetColorSchemes, 
  phoenixColors,
  applyDarkMode 
} from '@/lib/utils/chart-configs'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface MetricValue {
  metric: string
  value: number
  displayName?: string
  unit?: string
}

interface SwimmerComparison {
  nombre: string
  metrics: MetricValue[]
}

interface ComparisonChartProps {
  title: string
  swimmers: SwimmerComparison[]
  colorScheme?: 'warm' | 'gradient' | 'monochrome'
  showLegend?: boolean
  height?: number
  className?: string
  isDarkMode?: boolean
}

export default function ComparisonChart({
  title,
  swimmers,
  colorScheme = 'warm',
  showLegend = true,
  height = 400,
  className = '',
  isDarkMode = false
}: ComparisonChartProps) {
  const chartRef = useRef<any>(null)
  
  // Obtener todas las métricas únicas
  const allMetrics = new Set<string>()
  swimmers.forEach(swimmer => {
    swimmer.metrics.forEach(m => allMetrics.add(m.metric))
  })
  
  // Crear labels para el radar
  const metricOrder = Array.from(allMetrics)
  const labels = metricOrder.map(metric => {
    // Buscar el displayName de la primera ocurrencia
    for (const swimmer of swimmers) {
      const m = swimmer.metrics.find(met => met.metric === metric)
      if (m?.displayName) return m.displayName
    }
    return metric
  })
  
  // Normalizar valores (0-100) para mejor visualización
  const normalizeValues = (metrics: MetricValue[]): number[] => {
    // Encontrar min y max para cada métrica
    const metricRanges = new Map<string, { min: number, max: number }>()
    
    swimmers.forEach(swimmer => {
      swimmer.metrics.forEach(m => {
        const current = metricRanges.get(m.metric) || { min: m.value, max: m.value }
        metricRanges.set(m.metric, {
          min: Math.min(current.min, m.value),
          max: Math.max(current.max, m.value)
        })
      })
    })
    
    // Normalizar valores del nadador actual
    return metricOrder.map(metric => {
      const m = metrics.find(met => met.metric === metric)
      if (!m) return 0
      
      const range = metricRanges.get(metric)!
      if (range.max === range.min) return 50 // Si todos tienen el mismo valor
      
      // Normalizar a escala 0-100
      return ((m.value - range.min) / (range.max - range.min)) * 100
    })
  }
  
  // Obtener colores según el esquema
  const colors = datasetColorSchemes[colorScheme]
  
  // Preparar datasets
  const datasets = swimmers.map((swimmer, index) => {
    const color = colors[index % colors.length]
    const normalizedValues = normalizeValues(swimmer.metrics)
    
    return {
      label: swimmer.nombre,
      data: normalizedValues,
      borderColor: color,
      backgroundColor: `${color}33`, // 20% opacity
      pointBackgroundColor: color,
      pointBorderColor: phoenixColors.background,
      pointHoverBackgroundColor: phoenixColors.background,
      pointHoverBorderColor: color,
      borderWidth: 2,
    }
  })
  
  const chartData: ChartData<'radar'> = {
    labels,
    datasets
  }
  
  // Configurar opciones
  const options: ChartOptions<'radar'> = {
    ...radarChartOptions,
    plugins: {
      ...radarChartOptions.plugins,
      legend: {
        ...radarChartOptions.plugins?.legend,
        display: showLegend,
        position: 'bottom' as const,
      },
      tooltip: {
        ...radarChartOptions.plugins?.tooltip,
        callbacks: {
          label: (context) => {
            const swimmer = swimmers[context.datasetIndex]
            const metric = swimmer.metrics.find(m => 
              (m.displayName || m.metric) === labels[context.dataIndex]
            )
            
            if (metric) {
              let label = `${context.dataset.label}: ${metric.value.toFixed(2)}`
              if (metric.unit) {
                label += ` ${metric.unit}`
              }
              label += ` (${context.parsed.r.toFixed(0)}%)`
              return label
            }
            
            return `${context.dataset.label}: ${context.parsed.r.toFixed(0)}%`
          }
        }
      }
    },
    scales: {
      r: {
        ...radarChartOptions.scales?.r,
        min: 0,
        max: 100,
        ticks: {
          ...radarChartOptions.scales?.r?.ticks,
          stepSize: 20,
          callback: function(value) {
            return value + '%'
          }
        }
      }
    }
  }
  
  // Aplicar tema oscuro si es necesario
  const finalOptions = isDarkMode ? applyDarkMode(options) : options
  
  // Función para exportar
  const exportChart = () => {
    if (chartRef.current) {
      const link = document.createElement('a')
      link.download = `comparacion-${new Date().toISOString().split('T')[0]}.png`
      link.href = chartRef.current.toBase64Image()
      link.click()
    }
  }
  
  // Calcular puntuación general (promedio de porcentajes normalizados)
  const calculateOverallScore = (swimmer: SwimmerComparison): number => {
    const normalized = normalizeValues(swimmer.metrics)
    return normalized.reduce((a, b) => a + b, 0) / normalized.length
  }
  
  const scores = swimmers.map(s => ({
    nombre: s.nombre,
    score: calculateOverallScore(s)
  })).sort((a, b) => b.score - a.score)
  
  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={exportChart}
          className="text-xs"
        >
          Exportar
        </Button>
      </div>
      
      {/* Puntuaciones generales */}
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Puntuación General</h4>
        <div className="space-y-2">
          {scores.map((score, index) => (
            <div key={score.nombre} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors[swimmers.findIndex(s => s.nombre === score.nombre) % colors.length] }}
                />
                <span className="text-sm font-medium">
                  {score.nombre}
                  {index === 0 && ' 🥇'}
                  {index === 1 && ' 🥈'}
                  {index === 2 && ' 🥉'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${score.score}%`,
                      backgroundColor: colors[swimmers.findIndex(s => s.nombre === score.nombre) % colors.length]
                    }}
                  />
                </div>
                <span className="text-sm font-medium">{score.score.toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Gráfico de radar */}
      <div style={{ height: `${height}px` }}>
        <Radar
          ref={chartRef}
          data={chartData}
          options={finalOptions}
        />
      </div>
      
      {/* Leyenda de métricas */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
          <strong>Nota:</strong> Los valores están normalizados (0-100%) para facilitar la comparación visual.
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          100% = Mejor valor entre todos los nadadores | 0% = Peor valor
        </p>
      </div>
    </Card>
  )
} 