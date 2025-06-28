'use client'

import React from 'react'
import { useRankings } from '@/lib/hooks/useRankings'
import MetricGroupSelector from '@/components/ui/MetricGroupSelector'

// Iconos para posiciones
const POSITION_BADGES = {
  1: { icon: '🥇', bg: 'bg-yellow-500/20', text: 'text-yellow-700' },
  2: { icon: '🥈', bg: 'bg-gray-400/20', text: 'text-gray-700' },
  3: { icon: '🥉', bg: 'bg-orange-700/20', text: 'text-orange-700' }
}

export default function RankingsTab() {
  const {
    data,
    loading,
    error,
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
    refreshData,
    availableEstilos,
    availableDistancias,
    currentMetrics,
    currentPage,
    totalPages,
    setCurrentPage,
    exportToCSV
  } = useRankings()

  const handleSort = (key: string) => {
    if (sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      })
    } else {
      setSortConfig({ key, direction: 'asc' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg mb-2"></div>
            <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-40 bg-muted animate-pulse rounded-lg"></div>
            <div className="h-10 w-32 bg-muted animate-pulse rounded-lg"></div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 animate-pulse">
          <div className="space-y-3">
            <div className="h-12 bg-muted/50 rounded"></div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-muted/30 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-2xl border-2 border-dashed border-destructive/30">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center animate-bounce">
          <span className="text-5xl">⚠️</span>
        </div>
        <h3 className="text-2xl font-bold mb-3 text-destructive">Error al cargar rankings</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
        <button 
          onClick={refreshData}
          className="phoenix-button inline-flex items-center gap-2"
        >
          <span>🔄</span>
          <span>Intentar de nuevo</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 animate-in slide-in-from-left duration-500">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
            Rankings de Nadadores
          </h2>
          <p className="text-muted-foreground mt-1">
            Top performers por métricas de {filters.metricGroup}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 animate-in slide-in-from-right duration-500">
          <MetricGroupSelector
            value={filters.metricGroup}
            onChange={(group) => setFilters({ metricGroup: group })}
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
          
          <button
            onClick={exportToCSV}
            className="phoenix-button-secondary inline-flex items-center gap-2"
          >
            <span>📥</span>
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Tabla de rankings */}
      {data.length > 0 ? (
        <div className="phoenix-card bg-gradient-to-br from-card to-card/80 overflow-hidden animate-in slide-in-from-bottom duration-500 delay-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gradient-to-r from-phoenix-red/5 to-phoenix-orange/5">
                  <th className="text-left p-4 font-bold text-sm">Pos.</th>
                  <th className="text-left p-4 font-bold text-sm">Nadador</th>
                  <th className="text-left p-4 font-bold text-sm">Estilo</th>
                  <th className="text-left p-4 font-bold text-sm">Dist.</th>
                  {currentMetrics.map(metric => (
                    <th 
                      key={metric.parametro}
                      className="text-left p-4 font-bold text-sm cursor-pointer hover:text-phoenix-red transition-colors group"
                      onClick={() => handleSort(metric.parametro)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{metric.shortLabel}</span>
                        <span className="text-xs text-muted-foreground group-hover:text-phoenix-red/60">
                          {sortConfig.key === metric.parametro && (
                            sortConfig.direction === 'asc' ? '↑' : '↓'
                          )}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => {
                  const globalIndex = (currentPage - 1) * 20 + index + 1
                  const badge = POSITION_BADGES[globalIndex as keyof typeof POSITION_BADGES]
                  
                  return (
                    <tr 
                      key={row.id}
                      className="border-b hover:bg-muted/50 transition-colors group animate-in slide-in-from-left duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-4">
                        {badge ? (
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                            <span>{badge.icon}</span>
                            <span className="font-bold text-sm">{globalIndex}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground font-medium">{globalIndex}</span>
                        )}
                      </td>
                      <td className="p-4 font-medium group-hover:text-phoenix-red transition-colors">
                        {row.nadador}
                      </td>
                      <td className="p-4 text-muted-foreground">{row.estilo}</td>
                      <td className="p-4 text-muted-foreground">{row.distancia}m</td>
                      {currentMetrics.map(metric => {
                        const value = row[metric.parametro]
                        const isSortedColumn = sortConfig.key === metric.parametro
                        
                        return (
                          <td 
                            key={metric.parametro}
                            className={`p-4 ${isSortedColumn ? 'font-bold text-phoenix-red' : ''}`}
                          >
                            {value !== undefined ? (
                              <span className="flex items-center gap-1">
                                <span>{typeof value === 'number' ? value.toFixed(2) : value}</span>
                                <span className="text-xs text-muted-foreground">{metric.unit}</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="p-4 border-t bg-gradient-to-r from-muted/30 to-muted/10">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * 20 + 1} - {Math.min(currentPage * 20, data.length)} de {data.length} registros
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                  >
                    Anterior
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 text-sm rounded-lg transition-all duration-200 ${
                            currentPage === page 
                              ? 'bg-gradient-to-br from-phoenix-red to-phoenix-orange text-white font-bold' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                    {totalPages > 5 && <span className="px-2">...</span>}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-gradient-to-br from-muted/10 to-transparent rounded-2xl animate-in fade-in-50 duration-500">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-phoenix-red/10 to-phoenix-orange/10 flex items-center justify-center">
            <span className="text-6xl">🏅</span>
          </div>
          <h3 className="text-2xl font-bold mb-3">No hay datos de rankings</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            No se encontraron registros que coincidan con los filtros seleccionados
          </p>
        </div>
      )}
    </div>
  )
} 