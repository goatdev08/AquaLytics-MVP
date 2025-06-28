'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { FilterState } from '@/components/data/DataFilters'

const DEFAULT_FILTER_STATE: FilterState = {
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
}

export function useFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Parsear filtros desde URL
  const filters = useMemo((): FilterState => {
    const params = new URLSearchParams(searchParams.toString())
    
    return {
      dateRange: {
        start: params.get('dateStart') || null,
        end: params.get('dateEnd') || null
      },
      swimmers: params.get('swimmers')?.split(',').filter(Boolean) || [],
      competitions: params.get('competitions')?.split(',').filter(Boolean) || [],
      distances: params.get('distances')?.split(',').filter(Boolean) || [],
      strokes: params.get('strokes')?.split(',').filter(Boolean) || [],
      phases: params.get('phases')?.split(',').filter(Boolean) || [],
      metrics: params.get('metrics')?.split(',').filter(Boolean) || [],
      metricType: (params.get('metricType') as FilterState['metricType']) || 'all',
      timeRange: {
        min: params.get('timeMin') ? parseFloat(params.get('timeMin')!) : null,
        max: params.get('timeMax') ? parseFloat(params.get('timeMax')!) : null
      },
      velocityRange: {
        min: params.get('velocityMin') ? parseFloat(params.get('velocityMin')!) : null,
        max: params.get('velocityMax') ? parseFloat(params.get('velocityMax')!) : null
      }
    }
  }, [searchParams])

  // Actualizar filtros en la URL
  const setFilters = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams()
    
    // Serializar filtros a URL params
    if (newFilters.dateRange.start) {
      params.set('dateStart', newFilters.dateRange.start)
    }
    if (newFilters.dateRange.end) {
      params.set('dateEnd', newFilters.dateRange.end)
    }
    
    if (newFilters.swimmers.length > 0) {
      params.set('swimmers', newFilters.swimmers.join(','))
    }
    if (newFilters.competitions.length > 0) {
      params.set('competitions', newFilters.competitions.join(','))
    }
    if (newFilters.distances.length > 0) {
      params.set('distances', newFilters.distances.join(','))
    }
    if (newFilters.strokes.length > 0) {
      params.set('strokes', newFilters.strokes.join(','))
    }
    if (newFilters.phases.length > 0) {
      params.set('phases', newFilters.phases.join(','))
    }
    if (newFilters.metrics.length > 0) {
      params.set('metrics', newFilters.metrics.join(','))
    }
    
    if (newFilters.metricType !== 'all') {
      params.set('metricType', newFilters.metricType)
    }
    
    if (newFilters.timeRange.min !== null) {
      params.set('timeMin', newFilters.timeRange.min.toString())
    }
    if (newFilters.timeRange.max !== null) {
      params.set('timeMax', newFilters.timeRange.max.toString())
    }
    
    if (newFilters.velocityRange.min !== null) {
      params.set('velocityMin', newFilters.velocityRange.min.toString())
    }
    if (newFilters.velocityRange.max !== null) {
      params.set('velocityMax', newFilters.velocityRange.max.toString())
    }
    
    // Actualizar URL
    const queryString = params.toString()
    const url = queryString ? `${pathname}?${queryString}` : pathname
    
    router.push(url, { scroll: false })
  }, [pathname, router])

  // Resetear filtros
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE)
  }, [setFilters])

  // Función para aplicar filtros a un conjunto de datos
  const applyFilters = useCallback(<T extends Record<string, unknown>>(
    data: T[],
    options?: {
      dateField?: keyof T
      swimmerField?: keyof T
      competitionField?: keyof T
      distanceField?: keyof T
      strokeField?: keyof T
      phaseField?: keyof T
      metricsField?: keyof T
      timeField?: keyof T
      velocityField?: keyof T
    }
  ): T[] => {
    let filtered = [...data]
    
    // Aplicar filtro de fecha
    if ((filters.dateRange.start || filters.dateRange.end) && options?.dateField) {
      const dateField = options.dateField
      filtered = filtered.filter(item => {
        const itemDate = item[dateField] as string
        if (!itemDate) return false
        
        if (filters.dateRange.start && itemDate < filters.dateRange.start) return false
        if (filters.dateRange.end && itemDate > filters.dateRange.end) return false
        
        return true
      })
    }
    
    // Aplicar filtro de nadadores
    if (filters.swimmers.length > 0 && options?.swimmerField) {
      const swimmerField = options.swimmerField
      filtered = filtered.filter(item => 
        filters.swimmers.includes(item[swimmerField] as string)
      )
    }
    
    // Aplicar filtro de competiciones
    if (filters.competitions.length > 0 && options?.competitionField) {
      const competitionField = options.competitionField
      filtered = filtered.filter(item => 
        filters.competitions.includes(item[competitionField] as string)
      )
    }
    
    // Aplicar filtro de distancias
    if (filters.distances.length > 0 && options?.distanceField) {
      const distanceField = options.distanceField
      filtered = filtered.filter(item => 
        filters.distances.includes(item[distanceField] as string)
      )
    }
    
    // Aplicar filtro de estilos
    if (filters.strokes.length > 0 && options?.strokeField) {
      const strokeField = options.strokeField
      filtered = filtered.filter(item => 
        filters.strokes.includes(item[strokeField] as string)
      )
    }
    
    // Aplicar filtro de fases
    if (filters.phases.length > 0 && options?.phaseField) {
      const phaseField = options.phaseField
      filtered = filtered.filter(item => 
        filters.phases.includes(item[phaseField] as string)
      )
    }
    
    // Aplicar filtro de rango de tiempo
    if ((filters.timeRange.min !== null || filters.timeRange.max !== null) && options?.timeField) {
      const timeField = options.timeField
      filtered = filtered.filter(item => {
        const itemTime = item[timeField] as number
        if (typeof itemTime !== 'number') return false
        
        if (filters.timeRange.min !== null && itemTime < filters.timeRange.min) return false
        if (filters.timeRange.max !== null && itemTime > filters.timeRange.max) return false
        
        return true
      })
    }
    
    // Aplicar filtro de rango de velocidad
    if ((filters.velocityRange.min !== null || filters.velocityRange.max !== null) && options?.velocityField) {
      const velocityField = options.velocityField
      filtered = filtered.filter(item => {
        const itemVelocity = item[velocityField] as number
        if (typeof itemVelocity !== 'number') return false
        
        if (filters.velocityRange.min !== null && itemVelocity < filters.velocityRange.min) return false
        if (filters.velocityRange.max !== null && itemVelocity > filters.velocityRange.max) return false
        
        return true
      })
    }
    
    return filtered
  }, [filters])

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return (
      filters.dateRange.start !== null ||
      filters.dateRange.end !== null ||
      filters.swimmers.length > 0 ||
      filters.competitions.length > 0 ||
      filters.distances.length > 0 ||
      filters.strokes.length > 0 ||
      filters.phases.length > 0 ||
      filters.metrics.length > 0 ||
      filters.metricType !== 'all' ||
      filters.timeRange.min !== null ||
      filters.timeRange.max !== null ||
      filters.velocityRange.min !== null ||
      filters.velocityRange.max !== null
    )
  }, [filters])

  // Generar resumen de filtros activos
  const filterSummary = useMemo(() => {
    const summary: string[] = []
    
    if (filters.dateRange.start || filters.dateRange.end) {
      if (filters.dateRange.start && filters.dateRange.end) {
        summary.push(`Fechas: ${filters.dateRange.start} - ${filters.dateRange.end}`)
      } else if (filters.dateRange.start) {
        summary.push(`Desde: ${filters.dateRange.start}`)
      } else {
        summary.push(`Hasta: ${filters.dateRange.end}`)
      }
    }
    
    if (filters.swimmers.length > 0) {
      summary.push(`${filters.swimmers.length} nadador(es)`)
    }
    
    if (filters.competitions.length > 0) {
      summary.push(`${filters.competitions.length} competición(es)`)
    }
    
    if (filters.distances.length > 0) {
      summary.push(`Distancias: ${filters.distances.join(', ')}`)
    }
    
    if (filters.strokes.length > 0) {
      summary.push(`Estilos: ${filters.strokes.join(', ')}`)
    }
    
    if (filters.metricType !== 'all') {
      summary.push(`Métricas ${filters.metricType === 'automatic' ? 'automáticas' : 'manuales'}`)
    }
    
    if (filters.timeRange.min !== null || filters.timeRange.max !== null) {
      const min = filters.timeRange.min ?? '∞'
      const max = filters.timeRange.max ?? '∞'
      summary.push(`Tiempo: ${min}s - ${max}s`)
    }
    
    if (filters.velocityRange.min !== null || filters.velocityRange.max !== null) {
      const min = filters.velocityRange.min ?? '∞'
      const max = filters.velocityRange.max ?? '∞'
      summary.push(`Velocidad: ${min} - ${max} m/s`)
    }
    
    return summary
  }, [filters])

  return {
    filters,
    setFilters,
    resetFilters,
    applyFilters,
    hasActiveFilters,
    filterSummary
  }
} 