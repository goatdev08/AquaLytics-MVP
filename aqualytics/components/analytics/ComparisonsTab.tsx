'use client'

import React from 'react'
import { useSwimmerComparison } from '@/lib/hooks/useSwimmerComparison'
import MultiSelect from '@/components/ui/MultiSelect'
import MetricGroupSelector from '@/components/ui/MetricGroupSelector'
import ComparisonChart from '@/components/charts/ComparisonChart'

export default function ComparisonsTab() {
  const {
    swimmers,
    availableSwimmers,
    availableDistancias,
    availableEstilos,
    filters,
    setFilters,
    loading,
    error,
    refreshData,
    comparisonData
  } = useSwimmerComparison()

  if (loading && availableSwimmers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-phoenix-red/20 to-phoenix-orange/20 flex items-center justify-center animate-pulse">
            <span className="text-5xl animate-spin">⏳</span>
          </div>
          <h3 className="text-2xl font-bold mb-3">Cargando datos...</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Obteniendo información de nadadores y registros
          </p>
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

  const swimmerOptions = availableSwimmers.map(nadador => ({
    value: nadador.id_nadador,
    label: nadador.nombre
  }))

  const distanciaOptions = availableDistancias.map(dist => ({
    value: dist,
    label: `${dist}m`
  }))

  const estiloOptions = availableEstilos.map(estilo => ({
    value: estilo,
    label: estilo
  }))

  const canShowComparison = swimmers.length >= 2 && comparisonData.length > 0

  return (
    <div className="space-y-8">
      {/* Header mejorado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in slide-in-from-left duration-500">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
            Comparaciones entre Nadadores
          </h2>
          <p className="text-muted-foreground mt-1">
            Compara el rendimiento de múltiples nadadores en la misma distancia y estilo
          </p>
        </div>
        <button 
          onClick={refreshData}
          className="group px-4 py-2 rounded-lg border border-border hover:border-phoenix-red/30 hover:bg-muted/50 transition-all duration-300 flex items-center gap-2"
          disabled={loading}
        >
          <span className={`${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`}>🔄</span>
          <span>Actualizar</span>
        </button>
      </div>

      {/* Filtros de Comparación con diseño mejorado */}
      <div className="phoenix-card bg-gradient-to-br from-card to-card/80 animate-in slide-in-from-bottom duration-500 delay-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl phoenix-gradient flex items-center justify-center shadow-lg">
            <span className="text-2xl text-white">⚙️</span>
          </div>
          <h3 className="text-xl font-bold">Configurar Comparación</h3>
        </div>
        
        <div className="space-y-6">
          {/* Fila 1: Nadadores */}
          <div className="animate-in slide-in-from-right duration-500 delay-200">
            <label className="block text-sm font-semibold mb-3 text-foreground">
              Nadadores a Comparar
              <span className="font-normal text-muted-foreground ml-2">(máximo 5)</span>
            </label>
            <MultiSelect
              options={swimmerOptions}
              selectedValues={filters.swimmers}
              onChange={(swimmers) => setFilters({ swimmers: swimmers as number[] })}
              placeholder="Selecciona nadadores para comparar..."
              maxSelections={5}
            />
            {filters.swimmers.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {filters.swimmers.slice(0, 3).map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-phoenix-red to-phoenix-orange flex items-center justify-center text-xs text-white font-bold border-2 border-background">
                      {i + 1}
                    </div>
                  ))}
                  {filters.swimmers.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-phoenix-orange to-phoenix-yellow flex items-center justify-center text-xs text-white font-bold border-2 border-background">
                      +{filters.swimmers.length - 3}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {filters.swimmers.length} nadador{filters.swimmers.length > 1 ? 'es' : ''} seleccionado{filters.swimmers.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Fila 2: Distancia y Estilo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="animate-in slide-in-from-left duration-500 delay-300">
              <label className="block text-sm font-semibold mb-3">Distancia</label>
              <select
                value={filters.distancia || ''}
                onChange={(e) => setFilters({ distancia: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-4 py-3 border rounded-xl bg-background hover:border-phoenix-red/30 focus:border-phoenix-red focus:ring-2 focus:ring-phoenix-red/20 transition-all duration-300"
              >
                <option value="">Seleccionar distancia...</option>
                {distanciaOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="animate-in slide-in-from-right duration-500 delay-300">
              <label className="block text-sm font-semibold mb-3">Estilo</label>
              <select
                value={filters.estilo || ''}
                onChange={(e) => setFilters({ estilo: e.target.value || null })}
                className="w-full px-4 py-3 border rounded-xl bg-background hover:border-phoenix-red/30 focus:border-phoenix-red focus:ring-2 focus:ring-phoenix-red/20 transition-all duration-300"
              >
                <option value="">Seleccionar estilo...</option>
                {estiloOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Restricción de comparación mejorada */}
          {filters.swimmers.length > 0 && (!filters.distancia || !filters.estilo) && (
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 animate-in fade-in-50 duration-500">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-600 dark:text-yellow-400 text-lg">⚠️</span>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    Selecciona distancia y estilo
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Para comparar nadadores de forma justa, deben competir en la misma distancia y estilo.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selector de Métricas mejorado */}
      {filters.swimmers.length > 0 && filters.distancia && filters.estilo && (
        <div className="space-y-4 animate-in slide-in-from-bottom duration-500 delay-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg phoenix-gradient flex items-center justify-center">
              <span className="text-xl text-white">📊</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">Tipo de Métricas a Comparar</h3>
              <p className="text-sm text-muted-foreground">
                Selecciona el grupo de métricas que quieres analizar en la comparación
              </p>
            </div>
          </div>
          
          <MetricGroupSelector
            value={filters.metricGroup}
            onChange={(group) => setFilters({ metricGroup: group })}
          />
        </div>
      )}

      {/* Gráfico de Comparación mejorado */}
      {canShowComparison ? (
        <div className="space-y-4 animate-in fade-in-50 duration-500 delay-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Comparación Visual</h3>
              <p className="text-sm text-muted-foreground">
                Rendimiento de {swimmers.length} nadadores en {filters.distancia}m {filters.estilo} - Métricas de {filters.metricGroup}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-phoenix-red animate-pulse"></div>
              <span>Datos en vivo</span>
            </div>
          </div>
          
          <div className="phoenix-card bg-gradient-to-br from-card to-card/80">
            <ComparisonChart 
              swimmers={swimmers}
              metricGroup={filters.metricGroup}
              comparisonData={comparisonData}
              loading={loading}
            />
          </div>
        </div>
      ) : filters.swimmers.length > 0 && filters.distancia && filters.estilo ? (
        <div className="text-center py-16 bg-gradient-to-br from-muted/30 to-muted/20 rounded-2xl border-2 border-dashed animate-in fade-in-50 duration-500 delay-500">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center animate-pulse">
            <span className="text-5xl">📊</span>
          </div>
          <h3 className="text-xl font-bold mb-3">Procesando datos...</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {loading ? 'Cargando métricas de comparación...' : 'Selecciona al menos 2 nadadores para comparar'}
          </p>
        </div>
      ) : (
        <div className="text-center py-20 bg-gradient-to-br from-muted/10 to-transparent rounded-2xl animate-in fade-in-50 duration-500 delay-500">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-phoenix-red/10 to-phoenix-orange/10 flex items-center justify-center">
            <span className="text-6xl">⚔️</span>
          </div>
          <h3 className="text-2xl font-bold mb-4">Comparaciones entre Nadadores</h3>
          <div className="space-y-3 text-muted-foreground max-w-md mx-auto">
            <p className="font-medium">Para comenzar:</p>
            <ol className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-phoenix-red/20 text-phoenix-red font-bold text-xs flex items-center justify-center">1</span>
                Selecciona 2 o más nadadores
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-phoenix-orange/20 text-phoenix-orange font-bold text-xs flex items-center justify-center">2</span>
                Elige la distancia y estilo
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-phoenix-yellow/20 text-phoenix-yellow font-bold text-xs flex items-center justify-center">3</span>
                Selecciona el tipo de métricas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-phoenix-amber/20 text-phoenix-amber font-bold text-xs flex items-center justify-center">4</span>
                ¡Analiza las comparaciones!
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Información de nadadores seleccionados mejorada */}
      {swimmers.length > 0 && (
        <div className="phoenix-card animate-in slide-in-from-bottom duration-500 delay-600">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <span>👥</span>
            Nadadores en Comparación
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {swimmers.map((swimmer, index) => (
              <div 
                key={swimmer.id_nadador} 
                className="group flex items-center justify-between p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl hover:from-phoenix-red/10 hover:to-phoenix-orange/10 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-phoenix-red to-phoenix-orange flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <span className="font-medium">{swimmer.nombre}</span>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {swimmer.registros.length} registro{swimmer.registros.length !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 