'use client'

import React from 'react'
import { useTeamOverview } from '@/lib/hooks/useTeamOverview'
import TimeRangeSelector from '@/components/ui/TimeRangeSelector'
import MetricCard from '@/components/ui/MetricCard'

export default function OverviewTab() {
  const { 
    stats, 
    progressData, 
    loading, 
    error, 
    timeRange, 
    setTimeRange, 
    refreshData 
  } = useTeamOverview()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg mb-2"></div>
            <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="h-10 w-40 bg-muted animate-pulse rounded-lg"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse rounded-xl phoenix-shadow"></div>
          ))}
        </div>
        
        <div className="h-96 bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse rounded-xl phoenix-shadow"></div>
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

  if (!stats) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-phoenix-red/10 to-phoenix-orange/10 flex items-center justify-center">
          <span className="text-6xl">📊</span>
        </div>
        <h3 className="text-2xl font-bold mb-3">No hay datos disponibles</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          No se encontraron registros para el período seleccionado
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header con selector de período */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="animate-in slide-in-from-left duration-500">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
            Overview del Equipo
          </h2>
          <p className="text-muted-foreground mt-1">
            Estadísticas generales y progresión del equipo
          </p>
        </div>
        <div className="animate-in slide-in-from-right duration-500">
          <TimeRangeSelector 
            value={timeRange} 
            onChange={setTimeRange}
            className="w-full sm:w-auto"
          />
        </div>
      </div>

      {/* Métricas clave con animación escalonada */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-in slide-in-from-bottom duration-500 delay-100">
          <MetricCard
            title="Nadadores Totales"
            value={stats.totalSwimmers}
            icon="🏊‍♂️"
            subtitle="registrados"
            gradient="from-phoenix-blue to-phoenix-purple"
          />
        </div>
        
        <div className="animate-in slide-in-from-bottom duration-500 delay-200">
          <MetricCard
            title="Nadadores Activos"
            value={stats.activeSwimmers}
            icon="⚡"
            subtitle={`en ${timeRange}`}
            gradient="from-phoenix-red to-phoenix-orange"
          />
        </div>
        
        <div className="animate-in slide-in-from-bottom duration-500 delay-300">
          <MetricCard
            title="Registros de Entrenamientos"
            value={stats.totalRecords}
            icon="📊"
            subtitle={`en ${timeRange}`}
            gradient="from-phoenix-orange to-phoenix-yellow"
          />
        </div>
        
        <div className="animate-in slide-in-from-bottom duration-500 delay-400">
          <MetricCard
            title="Tiempo Promedio"
            value={stats.averageTime > 0 ? `${stats.averageTime.toFixed(2)}s` : 'N/A'}
            icon="⏱️"
            trend={{
              value: stats.improvementPercentage,
              label: 'vs período anterior',
              isPositive: stats.improvementPercentage > 0
            }}
            gradient="from-phoenix-yellow to-phoenix-amber"
          />
        </div>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="animate-in slide-in-from-left duration-500 delay-500">
          <MetricCard
            title="Velocidad Promedio"
            value={stats.averageVelocity > 0 ? `${stats.averageVelocity.toFixed(2)} m/s` : 'N/A'}
            icon="🏃‍♂️"
            subtitle="del equipo"
            gradient="from-phoenix-coral to-phoenix-sunset"
          />
        </div>
        
        <div className="animate-in slide-in-from-right duration-500 delay-500">
          <MetricCard
            title="Competencias"
            value={stats.totalCompetitions}
            icon="🏆"
            subtitle="registradas"
            gradient="from-phoenix-ember to-phoenix-gold"
          />
        </div>
      </div>

      {/* Gráfico de progresión mejorado */}
      {progressData.length > 0 ? (
        <div className="space-y-4 animate-in fade-in-50 duration-700 delay-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Progresión del Equipo</h3>
              <p className="text-sm text-muted-foreground">
                Evolución de métricas clave en el período seleccionado
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-phoenix-red animate-pulse"></div>
              <span>Datos en vivo</span>
            </div>
          </div>
          
          <div className="phoenix-card bg-gradient-to-br from-card to-card/80">
            {/* TODO: Implementar ProgressChart con props correctas */}
            <div className="h-80 flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-phoenix-red/20 to-phoenix-orange/20 flex items-center justify-center animate-pulse">
                  <span className="text-4xl">📈</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Gráfico en desarrollo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {progressData.length} puntos de datos disponibles
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-muted/30 to-muted/20 rounded-2xl border-2 border-dashed animate-in fade-in-50 duration-700 delay-600">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
            <span className="text-5xl">📈</span>
          </div>
          <h3 className="text-xl font-bold mb-3">Datos insuficientes para gráfico</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Se necesitan más registros en el período seleccionado para mostrar la progresión
          </p>
        </div>
      )}

      {/* Información adicional con mejor diseño */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground border-t pt-6 animate-in fade-in-50 duration-700 delay-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>
            Última actualización: {new Date(stats.lastUpdated).toLocaleString('es-ES')}
          </span>
        </div>
        <button 
          onClick={refreshData}
          className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-phoenix-red/30 hover:bg-muted/50 transition-all duration-300"
          title="Actualizar datos"
        >
          <span className="group-hover:rotate-180 transition-transform duration-500">🔄</span>
          <span>Actualizar datos</span>
        </button>
      </div>
    </div>
  )
} 