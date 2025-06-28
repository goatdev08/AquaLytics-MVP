'use client'

import React from 'react'
import { useEfficiencyAnalysis } from '@/lib/hooks/useEfficiencyAnalysis'
import TimeRangeSelector from '@/components/ui/TimeRangeSelector'
import { TimeRange } from '@/lib/hooks/useTeamOverview'
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
  ChartOptions
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

// Colores por estilo de nado
const STYLE_COLORS = {
  'Libre': { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgb(59, 130, 246)' },     // blue
  'Pecho': { bg: 'rgba(168, 85, 247, 0.8)', border: 'rgb(168, 85, 247)' },    // purple
  'Espalda': { bg: 'rgba(34, 197, 94, 0.8)', border: 'rgb(34, 197, 94)' },    // green
  'Mariposa': { bg: 'rgba(251, 146, 60, 0.8)', border: 'rgb(251, 146, 60)' }  // orange
}

export default function EfficiencyTab() {
  const { 
    data, 
    loading, 
    error, 
    filters, 
    setFilters, 
    refreshData,
    availableDistancias 
  } = useEfficiencyAnalysis()

  const chartData: any = {
    labels: data.map(d => d.estilo),
    datasets: [
      {
        label: 'Distancia por Brazada (m)',
        data: data.map(d => d.avgDistPorBrazada),
        backgroundColor: data.map(d => STYLE_COLORS[d.estilo as keyof typeof STYLE_COLORS]?.bg || 'rgba(156, 163, 175, 0.8)'),
        borderColor: data.map(d => STYLE_COLORS[d.estilo as keyof typeof STYLE_COLORS]?.border || 'rgb(156, 163, 175)'),
        borderWidth: 2,
        borderRadius: 8,
        yAxisID: 'y1'
      },
      {
        label: 'Eficiencia (%)',
        data: data.map(d => d.eficiencia),
        backgroundColor: 'rgba(220, 38, 38, 0.2)',
        borderColor: 'rgb(220, 38, 38)',
        borderWidth: 3,
        type: 'line' as const,
        yAxisID: 'y2',
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  }

  const options: ChartOptions<'bar'> = {
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
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(220, 38, 38, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          afterLabel: function(context) {
            if (context.datasetIndex === 0) {
              const index = context.dataIndex
              const registro = data[index]
              return [
                `Brazadas promedio: ${registro.avgBrazadasTotal.toFixed(0)}`,
                `Mejor: ${registro.mejorRegistro.valor.toFixed(2)}m (${registro.mejorRegistro.nadador})`
              ]
            }
            return []
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            weight: 600
          }
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Distancia por Brazada (m)',
          font: {
            size: 12,
            weight: 600
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y2: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Eficiencia (%)',
          font: {
            size: 12,
            weight: 600
          }
        },
        grid: {
          display: false
        },
        min: 0,
        max: 100
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-56 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg mb-2"></div>
            <div className="h-4 w-72 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-muted animate-pulse rounded-lg"></div>
            <div className="h-10 w-40 bg-muted animate-pulse rounded-lg"></div>
          </div>
        </div>
        
        <div className="h-96 bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse rounded-xl phoenix-shadow"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-2xl border-2 border-dashed border-destructive/30 phoenix-shadow">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center animate-bounce">
            <span className="text-5xl">⚠️</span>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-destructive">Error al cargar datos</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
          <button 
            onClick={refreshData}
            className="phoenix-button inline-flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Intentar de nuevo</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header con filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in slide-in-from-left duration-500">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
            Análisis de Eficiencia
          </h2>
          <p className="text-muted-foreground mt-1">
            Eficiencia de brazada por estilo de nado
          </p>
        </div>
        <div className="flex flex-wrap gap-3 animate-in slide-in-from-right duration-500">
          <select
            value={filters.distancia || ''}
            onChange={(e) => setFilters({ distancia: e.target.value ? Number(e.target.value) : null })}
            className="px-4 py-2 border rounded-xl bg-background hover:border-phoenix-red/30 focus:border-phoenix-red focus:ring-2 focus:ring-phoenix-red/20 transition-all duration-300"
          >
            <option value="">Todas las distancias</option>
            {availableDistancias.map(dist => (
              <option key={dist} value={dist}>{dist}m</option>
            ))}
          </select>
          <TimeRangeSelector 
            value={filters.periodo as TimeRange} 
            onChange={(periodo) => setFilters({ periodo })}
          />
        </div>
      </div>

      {/* Gráfico principal */}
      {data.length > 0 ? (
        <div className="phoenix-card bg-gradient-to-br from-card to-card/80 animate-in slide-in-from-bottom duration-500 delay-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Comparación de Eficiencia por Estilo</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-phoenix-red animate-pulse"></div>
              <span>Datos en vivo</span>
            </div>
          </div>
          
          <div className="h-96">
            <Bar data={chartData} options={options} />
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-phoenix-red/10 to-phoenix-orange/10 rounded-xl">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">💡 Tip:</span> Una mayor distancia por brazada indica mejor eficiencia técnica. 
              Los valores ideales varían por estilo: Libre (2.0-2.5m), Espalda (1.8-2.3m), Pecho (2.5-3.0m), Mariposa (1.8-2.2m).
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-gradient-to-br from-muted/10 to-transparent rounded-2xl animate-in fade-in-50 duration-500">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-phoenix-red/10 to-phoenix-orange/10 flex items-center justify-center">
            <span className="text-6xl">🏊‍♂️</span>
          </div>
          <h3 className="text-2xl font-bold mb-3">No hay datos de eficiencia</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            No se encontraron registros con métricas de brazada para el período seleccionado
          </p>
        </div>
      )}

      {/* Cards de métricas por estilo */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((styleData, index) => (
            <div 
              key={styleData.estilo}
              className="group phoenix-card relative overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
                style={{ 
                  backgroundImage: `linear-gradient(135deg, ${STYLE_COLORS[styleData.estilo as keyof typeof STYLE_COLORS]?.border || '#9CA3AF'} 0%, transparent 100%)` 
                }}
              />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                    style={{ backgroundColor: STYLE_COLORS[styleData.estilo as keyof typeof STYLE_COLORS]?.bg || 'rgba(156, 163, 175, 0.8)' }}
                  >
                    <span className="text-2xl text-white">🏊</span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold">{styleData.eficiencia.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">eficiencia</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-lg">{styleData.estilo}</h4>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dist/Brazada:</span>
                      <span className="font-semibold">{styleData.avgDistPorBrazada.toFixed(2)}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brazadas avg:</span>
                      <span className="font-semibold">{styleData.avgBrazadasTotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registros:</span>
                      <span className="font-semibold">{styleData.totalRegistros}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 mt-2 border-t">
                    <div className="text-xs text-muted-foreground">Mejor registro</div>
                    <div className="text-sm font-medium">
                      {styleData.mejorRegistro.valor.toFixed(2)}m - {styleData.mejorRegistro.nadador}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 