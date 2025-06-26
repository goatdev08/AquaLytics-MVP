'use client'

import React, { useRef, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { ChartData, ChartOptions } from 'chart.js'
import { 
  lineChartOptions, 
  datasetColorSchemes, 
  phoenixColors,
  applyDarkMode,
  createGradient
} from '@/lib/utils/chart-configs'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface SwimmerProgress {
  nombre: string
  data: {
    fecha: string
    valor: number
    competencia?: string
  }[]
}

interface ProgressChartProps {
  title: string
  swimmers: SwimmerProgress[]
  metricName: string
  unit?: string
  colorScheme?: 'warm' | 'gradient' | 'monochrome'
  showLegend?: boolean
  height?: number
  className?: string
  isDarkMode?: boolean
}

export default function ProgressChart({
  title,
  swimmers,
  metricName,
  unit = '',
  colorScheme = 'warm',
  showLegend = true,
  height = 350,
  className = '',
  isDarkMode = false
}: ProgressChartProps) {
  const chartRef = useRef<any>(null)
  
  // Obtener todas las fechas únicas y ordenarlas
  const allDates = new Set<string>()
  swimmers.forEach(swimmer => {
    swimmer.data.forEach(point => allDates.add(point.fecha))
  })
  
  const sortedDates = Array.from(allDates).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  )
  
  // Formatear etiquetas de fecha
  const labels = sortedDates.map(date => {
    const d = new Date(date)
    return d.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: '2-digit'
    })
  })
  
  // Obtener colores según el esquema seleccionado
  const colors = datasetColorSchemes[colorScheme]
  
  // Preparar datasets para cada nadador
  const datasets = swimmers.map((swimmer, index) => {
    // Crear un mapa de fecha->valor para este nadador
    const valueMap = new Map(
      swimmer.data.map(point => [point.fecha, point.valor])
    )
    
    // Crear array de valores alineados con todas las fechas
    const values = sortedDates.map(date => valueMap.get(date) || null)
    
    const color = colors[index % colors.length]
    
    return {
      label: swimmer.nombre,
      data: values,
      borderColor: color,
      backgroundColor: color,
      pointBackgroundColor: phoenixColors.background,
      pointBorderColor: color,
      pointHoverBackgroundColor: color,
      pointHoverBorderColor: phoenixColors.background,
      borderWidth: 2,
      tension: 0.3,
      spanGaps: true, // Conectar puntos aunque haya valores null
      fill: false,
    }
  })
  
  const chartData: ChartData<'line'> = {
    labels,
    datasets
  }
  
  // Configurar opciones del gráfico
  const options: ChartOptions<'line'> = {
    ...lineChartOptions,
    plugins: {
      ...lineChartOptions.plugins,
      legend: {
        ...lineChartOptions.plugins?.legend,
        display: showLegend,
        position: 'bottom' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        ...lineChartOptions.plugins?.tooltip,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
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
            const swimmerData = swimmers.find(s => s.nombre === context.dataset.label)
            if (swimmerData) {
              const point = swimmerData.data.find(p => 
                new Date(p.fecha).getTime() === new Date(sortedDates[context.dataIndex]).getTime()
              )
              if (point?.competencia) {
                return `Competencia: ${point.competencia}`
              }
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
          text: unit || metricName,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    }
  }
  
  // Aplicar tema oscuro si es necesario
  const finalOptions = isDarkMode ? applyDarkMode(options) : options
  
  // Función para exportar el gráfico
  const exportChart = () => {
    if (chartRef.current) {
      const link = document.createElement('a')
      link.download = `progreso-${metricName}-${new Date().toISOString().split('T')[0]}.png`
      link.href = chartRef.current.toBase64Image()
      link.click()
    }
  }
  
  // Calcular estadísticas comparativas
  const calculateStats = () => {
    return swimmers.map(swimmer => {
      const values = swimmer.data.map(d => d.valor)
      const latest = values[values.length - 1]
      const first = values[0]
      const improvement = ((latest - first) / first * 100)
      
      return {
        nombre: swimmer.nombre,
        inicio: first,
        actual: latest,
        mejora: improvement,
        mejor: Math.max(...values),
        promedio: values.reduce((a, b) => a + b, 0) / values.length
      }
    })
  }
  
  const stats = calculateStats()
  const bestImprovement = Math.max(...stats.map(s => s.mejora))
  
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
      
      {/* Tabla de comparación */}
      <div className="mb-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-1">Nadador</th>
              <th className="text-center py-2 px-1">Inicio</th>
              <th className="text-center py-2 px-1">Actual</th>
              <th className="text-center py-2 px-1">Mejora</th>
              <th className="text-center py-2 px-1">Mejor</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, index) => (
              <tr key={stat.nombre} className="border-b border-border/50">
                <td className="py-2 px-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="font-medium">{stat.nombre}</span>
                  </div>
                </td>
                <td className="text-center py-2 px-1">{stat.inicio.toFixed(2)}</td>
                <td className="text-center py-2 px-1 font-medium">{stat.actual.toFixed(2)}</td>
                <td className="text-center py-2 px-1">
                  <span className={`font-medium ${
                    stat.mejora > 0 ? 'text-green-600' : 
                    stat.mejora < 0 ? 'text-red-600' : ''
                  } ${stat.mejora === bestImprovement ? 'font-bold' : ''}`}>
                    {stat.mejora > 0 ? '+' : ''}{stat.mejora.toFixed(1)}%
                    {stat.mejora === bestImprovement && ' 🏆'}
                  </span>
                </td>
                <td className="text-center py-2 px-1">{stat.mejor.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Gráfico */}
      <div style={{ height: `${height}px` }}>
        <Line
          ref={chartRef}
          data={chartData}
          options={finalOptions}
        />
      </div>
      
      {/* Información adicional */}
      {swimmers.length === 1 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 Agrega más nadadores para comparar su progreso.
          </p>
        </div>
      )}
    </Card>
  )
} 