'use client'

import React, { useRef, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { ChartData, ChartOptions } from 'chart.js'
import { 
  lineChartOptions, 
  phoenixColors, 
  createGradient, 
  applyDarkMode 
} from '@/lib/utils/chart-configs'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface MetricDataPoint {
  fecha: string
  valor: number
  competencia?: string
}

interface MetricsChartProps {
  title: string
  data: MetricDataPoint[]
  metricName: string
  unit?: string
  showGradient?: boolean
  height?: number
  className?: string
  isDarkMode?: boolean
}

export default function MetricsChart({
  title,
  data,
  metricName,
  unit = '',
  showGradient = true,
  height = 300,
  className = '',
  isDarkMode = false
}: MetricsChartProps) {
  const chartRef = useRef<any>(null)

  // Ordenar datos por fecha
  const sortedData = [...data].sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  )

  // Preparar datos para el gráfico
  const labels = sortedData.map(d => {
    const date = new Date(d.fecha)
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: '2-digit'
    })
  })

  const values = sortedData.map(d => d.valor)

  // Determinar color según la métrica
  const getMetricColor = (metric: string): string => {
    const metricColors: Record<string, string> = {
      'v1': phoenixColors.red,
      'v2': phoenixColors.orange,
      'v_promedio': phoenixColors.flame,
      'dist_por_brz': phoenixColors.coral,
      'dist_sin_f': phoenixColors.amber,
      'f_promedio': phoenixColors.gold,
      // Métricas manuales
      't25_1': phoenixColors.crimson,
      't25_2': phoenixColors.rose,
      't_total': phoenixColors.redDark,
      'brz_total': phoenixColors.sunset,
    }
    return metricColors[metric.toLowerCase()] || phoenixColors.red
  }

  const mainColor = getMetricColor(metricName)

  // Configurar datos del gráfico
  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: `${metricName}${unit ? ` (${unit})` : ''}`,
        data: values,
        borderColor: mainColor,
        backgroundColor: mainColor,
        pointBackgroundColor: phoenixColors.background,
        pointBorderColor: mainColor,
        pointHoverBackgroundColor: mainColor,
        pointHoverBorderColor: phoenixColors.background,
        fill: showGradient,
      },
    ],
  }

  // Aplicar gradiente si está habilitado
  useEffect(() => {
    if (showGradient && chartRef.current) {
      const chart = chartRef.current
      const ctx = chart.ctx
      const gradient = createGradient(ctx, mainColor, 0.15)
      chart.data.datasets[0].backgroundColor = gradient
      chart.update()
    }
  }, [showGradient, mainColor])

  // Configurar opciones del gráfico
  const options: ChartOptions<'line'> = {
    ...lineChartOptions,
    plugins: {
      ...lineChartOptions.plugins,
      title: {
        display: false, // Usaremos nuestro propio título
      },
      tooltip: {
        ...lineChartOptions.plugins?.tooltip,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || ''
            if (label) {
              label = label.split(' ')[0] + ': '
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('es-ES', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              }).format(context.parsed.y)
            }
            if (unit) {
              label += ` ${unit}`
            }
            return label
          },
          afterLabel: (context) => {
            const point = sortedData[context.dataIndex]
            if (point.competencia) {
              return `Competencia: ${point.competencia}`
            }
            return ''
          }
        }
      }
    },
    scales: {
      ...lineChartOptions.scales,
      y: {
        ...lineChartOptions.scales?.y,
        title: {
          display: true,
          text: unit || 'Valor',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          }
        }
      }
    }
  }

  // Aplicar tema oscuro si es necesario
  const finalOptions = isDarkMode ? applyDarkMode(options) : options

  // Función para exportar el gráfico
  const exportChart = () => {
    if (chartRef.current) {
      const link = document.createElement('a')
      link.download = `${metricName}-${new Date().toISOString().split('T')[0]}.png`
      link.href = chartRef.current.toBase64Image()
      link.click()
    }
  }

  // Calcular estadísticas básicas
  const stats = {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    latest: values[values.length - 1],
    trend: values.length > 1 ? 
      ((values[values.length - 1] - values[0]) / values[0] * 100) : 0
  }

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header con título y botón de exportar */}
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

      {/* Estadísticas resumidas */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
        <div className="text-center">
          <div className="text-muted-foreground">Mín</div>
          <div className="font-medium">{stats.min.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">Máx</div>
          <div className="font-medium">{stats.max.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">Prom</div>
          <div className="font-medium">{stats.avg.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">Actual</div>
          <div className={`font-medium ${
            stats.trend > 0 ? 'text-green-600' : stats.trend < 0 ? 'text-red-600' : ''
          }`}>
            {stats.latest.toFixed(2)}
            {stats.trend !== 0 && (
              <span className="text-xs ml-1">
                ({stats.trend > 0 ? '+' : ''}{stats.trend.toFixed(1)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div style={{ height: `${height}px` }}>
        <Line
          ref={chartRef}
          data={chartData}
          options={finalOptions}
        />
      </div>

      {/* Leyenda adicional si hay pocas muestras */}
      {data.length < 3 && (
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            ⚠️ Pocas muestras disponibles. Se necesitan más datos para análisis de tendencia significativo.
          </p>
        </div>
      )}
    </Card>
  )
} 