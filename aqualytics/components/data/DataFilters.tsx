'use client'

import React from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  CalendarIcon, 
  UserGroupIcon, 
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

export interface FilterState {
  // Filtros temporales
  dateRange: {
    start: string | null
    end: string | null
  }
  
  // Filtros de contexto
  swimmers: string[]
  competitions: string[]
  distances: string[]
  strokes: string[]
  phases: string[]
  
  // Filtros de métricas
  metrics: string[]
  metricType: 'all' | 'automatic' | 'manual'
  
  // Filtros de rendimiento
  timeRange: {
    min: number | null
    max: number | null
  }
  velocityRange: {
    min: number | null
    max: number | null
  }
}

interface DataFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  
  // Opciones disponibles
  availableSwimmers?: { id: string; nombre: string }[]
  availableCompetitions?: { id: string; nombre: string; fecha: string }[]
  availableDistances?: string[]
  availableStrokes?: string[]
  availablePhases?: string[]
  availableMetrics?: { id: string; nombre: string; tipo: 'automatic' | 'manual' }[]
  
  // Configuración
  showAllFilters?: boolean
  collapsible?: boolean
  className?: string
}

export default function DataFilters({
  filters,
  onFiltersChange,
  availableSwimmers = [],
  availableCompetitions = [],
  availableDistances = ['25m', '50m', '100m', '200m', '400m', '800m', '1500m'],
  availableStrokes = ['Libre', 'Espalda', 'Pecho', 'Mariposa', 'Combinado'],
  availablePhases = ['Salida', 'Nado', 'Viraje', 'Llegada'],
  availableMetrics = [],
  showAllFilters = true,
  collapsible = true,
  className = ''
}: DataFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(true)
  
  // Actualizar un filtro específico
  const updateFilter = <K extends keyof FilterState>(
    key: K, 
    value: FilterState[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }
  
  // Resetear todos los filtros
  const resetFilters = () => {
    onFiltersChange({
      dateRange: { start: null, end: null },
      swimmers: [],
      competitions: [],
      distances: [],
      strokes: [],
      phases: [],
      metrics: [],
      metricType: 'all',
      timeRange: { min: null, max: null },
      velocityRange: { min: null, max: null }
    })
  }
  
  // Contar filtros activos
  const activeFilterCount = React.useMemo(() => {
    let count = 0
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.swimmers.length > 0) count++
    if (filters.competitions.length > 0) count++
    if (filters.distances.length > 0) count++
    if (filters.strokes.length > 0) count++
    if (filters.phases.length > 0) count++
    if (filters.metrics.length > 0) count++
    if (filters.metricType !== 'all') count++
    if (filters.timeRange.min !== null || filters.timeRange.max !== null) count++
    if (filters.velocityRange.min !== null || filters.velocityRange.max !== null) count++
    return count
  }, [filters])
  
  return (
    <Card className={`p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Filtros</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {activeFilterCount} activos
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={activeFilterCount === 0}
            className="text-xs"
          >
            <ArrowPathIcon className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
          
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronDownIcon 
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
              />
            </Button>
          )}
        </div>
      </div>
      
      {/* Filtros */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Filtros temporales */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarIcon className="w-4 h-4" />
              Rango de Fechas
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.dateRange.start || ''}
                onChange={(e) => updateFilter('dateRange', {
                  ...filters.dateRange,
                  start: e.target.value || null
                })}
                className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Fecha inicio"
              />
              <input
                type="date"
                value={filters.dateRange.end || ''}
                onChange={(e) => updateFilter('dateRange', {
                  ...filters.dateRange,
                  end: e.target.value || null
                })}
                className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Fecha fin"
              />
            </div>
          </div>
          
          {/* Filtros de nadadores */}
          {availableSwimmers.length > 0 && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <UserGroupIcon className="w-4 h-4" />
                Nadadores
              </label>
              <div className="relative">
                <select
                  multiple
                  value={filters.swimmers}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value)
                    updateFilter('swimmers', selected)
                  }}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  size={Math.min(availableSwimmers.length, 4)}
                >
                  {availableSwimmers.map(swimmer => (
                    <option key={swimmer.id} value={swimmer.id}>
                      {swimmer.nombre}
                    </option>
                  ))}
                </select>
                {filters.swimmers.length > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {filters.swimmers.length} seleccionados
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Filtros de distancia y estilo */}
          {showAllFilters && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* Distancias */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Distancias
                  </label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {availableDistances.map(distance => (
                      <label key={distance} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.distances.includes(distance)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFilter('distances', [...filters.distances, distance])
                            } else {
                              updateFilter('distances', filters.distances.filter(d => d !== distance))
                            }
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        {distance}
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Estilos */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Estilos
                  </label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {availableStrokes.map(stroke => (
                      <label key={stroke} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.strokes.includes(stroke)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFilter('strokes', [...filters.strokes, stroke])
                            } else {
                              updateFilter('strokes', filters.strokes.filter(s => s !== stroke))
                            }
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        {stroke}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Tipo de métricas */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Tipo de Métricas
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="metricType"
                      checked={filters.metricType === 'all'}
                      onChange={() => updateFilter('metricType', 'all')}
                      className="text-primary focus:ring-primary"
                    />
                    Todas
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="metricType"
                      checked={filters.metricType === 'automatic'}
                      onChange={() => updateFilter('metricType', 'automatic')}
                      className="text-primary focus:ring-primary"
                    />
                    Automáticas
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="metricType"
                      checked={filters.metricType === 'manual'}
                      onChange={() => updateFilter('metricType', 'manual')}
                      className="text-primary focus:ring-primary"
                    />
                    Manuales
                  </label>
                </div>
              </div>
              
              {/* Rangos de rendimiento */}
              <div className="grid grid-cols-2 gap-4">
                {/* Rango de tiempo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Rango de Tiempo (s)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.timeRange.min || ''}
                      onChange={(e) => updateFilter('timeRange', {
                        ...filters.timeRange,
                        min: e.target.value ? parseFloat(e.target.value) : null
                      })}
                      className="w-20 px-2 py-1 text-sm border rounded bg-background"
                      step="0.01"
                    />
                    <span className="text-xs text-muted-foreground">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.timeRange.max || ''}
                      onChange={(e) => updateFilter('timeRange', {
                        ...filters.timeRange,
                        max: e.target.value ? parseFloat(e.target.value) : null
                      })}
                      className="w-20 px-2 py-1 text-sm border rounded bg-background"
                      step="0.01"
                    />
                  </div>
                </div>
                
                {/* Rango de velocidad */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Rango de Velocidad (m/s)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.velocityRange.min || ''}
                      onChange={(e) => updateFilter('velocityRange', {
                        ...filters.velocityRange,
                        min: e.target.value ? parseFloat(e.target.value) : null
                      })}
                      className="w-20 px-2 py-1 text-sm border rounded bg-background"
                      step="0.01"
                    />
                    <span className="text-xs text-muted-foreground">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.velocityRange.max || ''}
                      onChange={(e) => updateFilter('velocityRange', {
                        ...filters.velocityRange,
                        max: e.target.value ? parseFloat(e.target.value) : null
                      })}
                      className="w-20 px-2 py-1 text-sm border rounded bg-background"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Resumen cuando está colapsado */}
      {!isExpanded && activeFilterCount > 0 && (
        <div className="text-sm text-muted-foreground">
          <span>{activeFilterCount} filtros activos</span>
          {filters.swimmers.length > 0 && (
            <span className="ml-2">• {filters.swimmers.length} nadadores</span>
          )}
          {filters.dateRange.start && (
            <span className="ml-2">• Desde {filters.dateRange.start}</span>
          )}
        </div>
      )}
    </Card>
  )
} 