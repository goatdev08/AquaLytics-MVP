'use client'

/**
 * Insights de Rendimiento - AquaLytics
 * Análisis avanzados y recomendaciones basadas en datos de rendimiento
 */

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface TeamStats {
  total_swimmers: number
  total_records: number
  average_performance: {
    tiempo_promedio: number
    velocidad_promedio: number
    eficiencia_brazadas: number
  }
  top_performers: {
    swimmer_name: string
    metric: string
    value: number
    prueba: string
  }[]
  improvement_trends: {
    metric: string
    trend: 'improving' | 'declining' | 'stable'
    percentage: number
  }[]
}

interface MetricInsight {
  metric_name: string
  team_average: number
  best_value: number
  worst_value: number
  swimmers_analyzed: number
  recommendations: string[]
}

export function PerformanceInsights() {
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [metricInsights, setMetricInsights] = useState<MetricInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '3m' | '1y'>('30d')

  // Cargar insights automáticamente al montar el componente
  useEffect(() => {
    loadInsights()
  }, [selectedTimeframe])

  const loadInsights = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/analytics/insights?timeframe=${selectedTimeframe}`)
      const result = await response.json()
      
      if (result.success) {
        setTeamStats(result.data.team_stats)
        setMetricInsights(result.data.metric_insights)
      } else {
        setError(result.error || 'Error cargando insights de rendimiento')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTimeframeLabel = (timeframe: string) => {
    const labels = {
      '7d': 'Últimos 7 días',
      '30d': 'Últimos 30 días',
      '3m': 'Últimos 3 meses',
      '1y': 'Último año'
    }
    return labels[timeframe as keyof typeof labels] || timeframe
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return (
          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      case 'declining':
        return (
          <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        )
      default:
        return (
          <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
          </svg>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-muted-foreground">Analizando datos de rendimiento...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector de período */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <svg className="h-5 w-5 text-phoenix-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Período de Análisis
          </h3>
          
          <div className="flex gap-2">
            {(['7d', '30d', '3m', '1y'] as const).map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? 'phoenix' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {getTimeframeLabel(timeframe)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </Card>
      )}

      {/* Estadísticas generales del equipo */}
      {teamStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Resumen del equipo */}
          <Card className="p-6 bg-gradient-to-br from-phoenix-red/5 to-phoenix-orange/5 border-phoenix-orange/30">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-phoenix-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Resumen del Equipo
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nadadores:</span>
                <span className="font-medium">{teamStats.total_swimmers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registros:</span>
                <span className="font-medium">{teamStats.total_records}</span>
              </div>
            </div>
          </Card>

          {/* Rendimiento promedio */}
          <Card className="p-6 bg-gradient-to-br from-blue-500/5 to-blue-600/5 border-blue-500/30">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012-2z" />
              </svg>
              Rendimiento Promedio
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tiempo:</span>
                <span className="font-medium">{teamStats.average_performance.tiempo_promedio.toFixed(2)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Velocidad:</span>
                <span className="font-medium">{teamStats.average_performance.velocidad_promedio.toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Eficiencia:</span>
                <span className="font-medium">{teamStats.average_performance.eficiencia_brazadas.toFixed(2)} m/brz</span>
              </div>
            </div>
          </Card>

          {/* Tendencias de mejora */}
          <Card className="p-6 bg-gradient-to-br from-green-500/5 to-green-600/5 border-green-500/30">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Tendencias
            </h4>
            <div className="space-y-3">
              {teamStats.improvement_trends.slice(0, 3).map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(trend.trend)}
                    <span className="text-sm text-muted-foreground">{trend.metric}</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    trend.trend === 'improving' ? 'text-green-600' : 
                    trend.trend === 'declining' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {trend.percentage > 0 ? '+' : ''}{trend.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Top performers */}
      {teamStats?.top_performers && teamStats.top_performers.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
            🏆 Mejores Rendimientos del Período
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamStats.top_performers.map((performer, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border border-yellow-500/30 rounded-lg">
                <div className="font-semibold text-foreground">{performer.swimmer_name}</div>
                <div className="text-sm text-muted-foreground">{performer.prueba}</div>
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">{performer.metric}: </span>
                  <span className="font-medium text-phoenix-red">{performer.value.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Insights por métrica */}
      {metricInsights.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
            📊 Análisis Detallado por Métricas
          </h3>
          
          <div className="space-y-6">
            {metricInsights.map((insight, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground">{insight.metric_name}</h4>
                  <span className="text-sm text-muted-foreground">
                    {insight.swimmers_analyzed} nadadores analizados
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Promedio Equipo</div>
                    <div className="text-lg font-semibold text-blue-600">{insight.team_average.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Mejor Valor</div>
                    <div className="text-lg font-semibold text-green-600">{insight.best_value.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Valor a Mejorar</div>
                    <div className="text-lg font-semibold text-red-600">{insight.worst_value.toFixed(2)}</div>
                  </div>
                </div>
                
                {insight.recommendations.length > 0 && (
                  <div>
                    <h5 className="font-medium text-foreground mb-2">💡 Recomendaciones:</h5>
                    <ul className="space-y-1">
                      {insight.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-phoenix-orange">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Estado sin datos */}
      {!loading && !teamStats && !error && (
        <Card className="p-12 text-center">
          <svg className="h-16 w-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Insights de Rendimiento
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Los insights se generarán automáticamente cuando tengas suficientes datos de registros
          </p>
          <Button onClick={loadInsights} variant="phoenix">
            Actualizar Insights
          </Button>
        </Card>
      )}
    </div>
  )
} 