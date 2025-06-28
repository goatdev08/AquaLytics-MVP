'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { useSwimmerDetail } from '@/lib/hooks/useSwimmerDetail'
import TimeRangeSelector from '@/components/ui/TimeRangeSelector'
import { TimeRange } from '@/lib/hooks/useTeamOverview'
import ProgressChart from '@/components/charts/ProgressChart'

export default function SwimmerDetailPage() {
  const params = useParams()
  const swimmerId = params.id as string
  
  const {
    swimmerInfo,
    personalBests,
    progressionData,
    teamComparisons,
    loading,
    error,
    filters,
    setFilters,
    availableEstilos,
    availableDistancias,
    refreshData
  } = useSwimmerDetail(swimmerId)

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-8 p-8">
          {/* Header skeleton */}
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gradient-to-r from-muted to-muted/50 rounded-lg mb-4"></div>
            <div className="h-4 w-96 bg-muted rounded mb-2"></div>
            <div className="h-4 w-48 bg-muted rounded"></div>
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl animate-pulse"></div>
            ))}
          </div>
          
          {/* Chart skeleton */}
          <div className="h-96 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl animate-pulse"></div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center animate-bounce">
              <span className="text-5xl">⚠️</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-destructive">Error al cargar perfil</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={refreshData}
                className="phoenix-button inline-flex items-center gap-2"
              >
                <span>🔄</span>
                <span>Intentar de nuevo</span>
              </button>
              <Link href="/swimmers" className="phoenix-button-secondary">
                Volver a nadadores
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!swimmerInfo) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="text-6xl mb-4 block">🏊‍♂️</span>
            <h3 className="text-2xl font-bold mb-3">Nadador no encontrado</h3>
            <Link href="/swimmers" className="phoenix-button">
              Volver a nadadores
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Agrupar mejores marcas por estilo
  const bestsByStyle = personalBests.reduce((acc, best) => {
    if (!acc[best.estilo]) acc[best.estilo] = []
    acc[best.estilo].push(best)
    return acc
  }, {} as Record<string, typeof personalBests>)

  return (
    <MainLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-start justify-between animate-in slide-in-from-top duration-500">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link 
                href="/swimmers" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Volver
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">Perfil de nadador</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
              {swimmerInfo.nombre}
            </h1>
            <p className="text-muted-foreground mt-2">
              ID: #{swimmerInfo.id_nadador} • Miembro activo del equipo
            </p>
          </div>
          
          <div className="flex gap-3">
            <button className="phoenix-button-secondary inline-flex items-center gap-2">
              <span>📊</span>
              <span>Exportar reporte</span>
            </button>
            <Link 
              href="/analytics?tab=comparisons" 
              className="phoenix-button inline-flex items-center gap-2"
            >
              <span>⚡</span>
              <span>Comparar</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group phoenix-card relative overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-in slide-in-from-bottom duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-5xl">🏊‍♂️</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">{personalBests.length}</div>
                  <div className="text-xs text-muted-foreground">Mejores marcas</div>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">Registros Totales</h3>
              <p className="text-sm text-muted-foreground">En {availableEstilos.length} estilos</p>
            </div>
          </div>

          <div className="group phoenix-card relative overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-in slide-in-from-bottom duration-500 delay-100">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-5xl">📈</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {teamComparisons.filter(c => c.percentDiff > 0).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Métricas destacadas</div>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">Sobre el promedio</h3>
              <p className="text-sm text-muted-foreground">vs equipo completo</p>
            </div>
          </div>

          <div className="group phoenix-card relative overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-in slide-in-from-bottom duration-500 delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-5xl">🎯</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">{Object.keys(bestsByStyle).length}</div>
                  <div className="text-xs text-muted-foreground">Estilos activos</div>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">Versatilidad</h3>
              <p className="text-sm text-muted-foreground">Múltiples especialidades</p>
            </div>
          </div>

          <div className="group phoenix-card relative overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-in slide-in-from-bottom duration-500 delay-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-5xl">⏱️</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">{progressionData.length}</div>
                  <div className="text-xs text-muted-foreground">Registros recientes</div>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">Actividad</h3>
              <p className="text-sm text-muted-foreground">En {filters.periodo}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 animate-in slide-in-from-left duration-500 delay-400">
          <TimeRangeSelector 
            value={filters.periodo as TimeRange} 
            onChange={(periodo) => setFilters({ periodo })}
          />
          
          <select
            value={filters.estilo || ''}
            onChange={(e) => setFilters({ estilo: e.target.value || null })}
            className="px-4 py-2 border rounded-xl bg-background hover:border-phoenix-red/30 focus:border-phoenix-red focus:ring-2 focus:ring-phoenix-red/20 transition-all duration-300"
          >
            <option value="">Todos los estilos</option>
            {availableEstilos.map(estilo => (
              <option key={estilo} value={estilo}>{estilo}</option>
            ))}
          </select>
          
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
        </div>

        {/* Progress Chart */}
        {progressionData.length > 0 && (
          <div className="phoenix-card bg-gradient-to-br from-card to-card/80 animate-in slide-in-from-bottom duration-500 delay-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Progresión Temporal</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-phoenix-red animate-pulse"></div>
                <span>Datos en vivo</span>
              </div>
            </div>
            
            {/* TODO: Implementar ProgressChart con estructura correcta */}
            <div className="h-80 flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl">
              <div className="text-center">
                <span className="text-6xl">📈</span>
                <p className="text-sm text-muted-foreground mt-4">
                  {progressionData.length} puntos de datos disponibles
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Personal Bests */}
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500 delay-600">
          <h2 className="text-2xl font-bold">Mejores Marcas Personales</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(bestsByStyle).map(([estilo, bests]) => (
              <div key={estilo} className="phoenix-card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏊</span>
                  {estilo}
                </h3>
                
                <div className="space-y-3">
                  {bests.sort((a, b) => a.distancia - b.distancia).map((best, idx) => (
                    <div 
                      key={`${best.distancia}-${best.metrica}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium">{best.distancia}m</div>
                        <div className="text-sm text-muted-foreground">{best.metrica}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {best.valor.toFixed(2)} {best.unit}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(best.fecha).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Comparison */}
        <div className="phoenix-card bg-gradient-to-br from-card to-card/80 animate-in slide-in-from-bottom duration-500 delay-700">
          <h2 className="text-2xl font-bold mb-6">Comparación con el Equipo</h2>
          
          <div className="space-y-3">
            {teamComparisons.slice(0, 10).map((comparison) => {
              const isPositive = comparison.percentDiff > 0
              
              return (
                <div 
                  key={comparison.metrica}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{comparison.label}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Nadador: {comparison.swimmerValue.toFixed(2)} {comparison.unit} • 
                      Equipo: {comparison.teamAverage.toFixed(2)} {comparison.unit}
                    </div>
                  </div>
                  
                  <div className={`text-right ml-4 ${isPositive ? 'text-green-600' : 'text-orange-600'}`}>
                    <div className="font-bold text-lg">
                      {isPositive ? '+' : ''}{comparison.percentDiff.toFixed(1)}%
                    </div>
                    <div className="text-xs">
                      {isPositive ? 'Mejor' : 'A mejorar'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 