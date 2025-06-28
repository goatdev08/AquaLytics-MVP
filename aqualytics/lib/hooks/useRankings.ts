'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { METRICS_DEFINITIONS, MetricDefinition, METRIC_GROUPS } from '@/lib/utils/metrics-mapping'

type MetricGroup = keyof typeof METRIC_GROUPS

interface RankingData {
  id: string
  nadador: string
  estilo: string
  distancia: number
  fecha: string
  [metricKey: string]: string | number // Para métricas dinámicas
}

interface UseRankingsReturn {
  data: RankingData[]
  loading: boolean
  error: string | null
  filters: {
    estilo: string | null
    distancia: number | null
    metricGroup: MetricGroup
  }
  setFilters: (updates: Partial<{ estilo: string | null; distancia: number | null; metricGroup: MetricGroup }>) => void
  sortConfig: {
    key: string
    direction: 'asc' | 'desc'
  }
  setSortConfig: (config: { key: string; direction: 'asc' | 'desc' }) => void
  refreshData: () => void
  availableEstilos: string[]
  availableDistancias: number[]
  currentMetrics: MetricDefinition[]
  // Paginación
  currentPage: number
  totalPages: number
  pageSize: number
  setCurrentPage: (page: number) => void
  // Exportación
  exportToCSV: () => void
}

const PAGE_SIZE = 20

export function useRankings(): UseRankingsReturn {
  const [rawData, setRawData] = useState<RankingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableEstilos, setAvailableEstilos] = useState<string[]>([])
  const [availableDistancias, setAvailableDistancias] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  
  const [filters, setFiltersState] = useState({
    estilo: null as string | null,
    distancia: null as number | null,
    metricGroup: 'tiempo' as MetricGroup
  })
  
  const [sortConfig, setSortConfig] = useState({
    key: 'T TOTAL',
    direction: 'asc' as 'asc' | 'desc'
  })

  const setFilters = useCallback((updates: Partial<typeof filters>) => {
    setFiltersState(prev => ({ ...prev, ...updates }))
    setCurrentPage(1) // Reset página al cambiar filtros
  }, [])

  // Obtener métricas actuales basadas en el grupo seleccionado
  const currentMetrics = useMemo(() => {
    return METRICS_DEFINITIONS.filter(m => m.grupo === filters.metricGroup)
  }, [filters.metricGroup])

  const fetchRankingsData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Query para obtener los últimos registros de cada nadador
      let query = supabase
        .from('registros')
        .select(`
          *,
          nadadores!inner(nombre),
          parametros!inner(parametro),
          distancias!inner(distancia),
          estilos!inner(estilo)
        `)
        .order('fecha', { ascending: false })

      const { data: registros, error: registrosError } = await query

      if (registrosError) throw registrosError

      // Procesar y agrupar datos por nadador/estilo/distancia
      const rankingsMap = new Map<string, RankingData>()
      
      registros?.forEach(registro => {
        if (!registro.nadadores || Array.isArray(registro.nadadores)) return
        if (!registro.distancias || Array.isArray(registro.distancias)) return
        if (!registro.estilos || Array.isArray(registro.estilos)) return
        if (!registro.parametros || Array.isArray(registro.parametros)) return

        const nadador = registro.nadadores.nombre
        const distancia = registro.distancias.distancia
        const estilo = registro.estilos.estilo
        const parametro = registro.parametros.parametro
        const valor = registro.valor

        // Clave única por nadador/estilo/distancia
        const key = `${nadador}-${estilo}-${distancia}`
        
        if (!rankingsMap.has(key)) {
          rankingsMap.set(key, {
            id: key,
            nadador,
            estilo,
            distancia,
            fecha: registro.fecha || ''
          })
        }

        // Agregar valor de la métrica
        const entry = rankingsMap.get(key)!
        if (valor !== null) {
          entry[parametro] = typeof valor === 'string' ? parseFloat(valor) : valor
        }
      })

      // Convertir a array y filtrar entradas con datos válidos
      const rankingsData = Array.from(rankingsMap.values()).filter(entry => {
        // Verificar que tenga al menos una métrica del grupo actual
        return currentMetrics.some(metric => entry[metric.parametro] !== undefined)
      })

      // Obtener valores únicos para filtros
      const estilos = [...new Set(rankingsData.map(r => r.estilo))].sort()
      const distancias = [...new Set(rankingsData.map(r => r.distancia))].sort((a, b) => a - b)
      
      setAvailableEstilos(estilos)
      setAvailableDistancias(distancias)
      setRawData(rankingsData)

    } catch (err) {
      console.error('Error fetching rankings data:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar rankings')
    } finally {
      setLoading(false)
    }
  }, [currentMetrics])

  // Filtrar y ordenar datos
  const processedData = useMemo(() => {
    let filtered = [...rawData]

    // Aplicar filtros
    if (filters.estilo) {
      filtered = filtered.filter(r => r.estilo === filters.estilo)
    }
    if (filters.distancia) {
      filtered = filtered.filter(r => r.distancia === filters.distancia)
    }

    // Ordenar
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key] as number || 0
      const bValue = b[sortConfig.key] as number || 0
      
      if (sortConfig.direction === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    return filtered
  }, [rawData, filters, sortConfig])

  // Paginación
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    return processedData.slice(start, end)
  }, [processedData, currentPage])

  const totalPages = Math.ceil(processedData.length / PAGE_SIZE)

  // Función para exportar a CSV
  const exportToCSV = useCallback(() => {
    const headers = ['Posición', 'Nadador', 'Estilo', 'Distancia', ...currentMetrics.map(m => m.label)]
    const rows = processedData.map((row, index) => {
      return [
        index + 1,
        row.nadador,
        row.estilo,
        `${row.distancia}m`,
        ...currentMetrics.map(m => {
          const value = row[m.parametro]
          if (value === undefined) return 'N/A'
          return `${value} ${m.unit}`
        })
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `rankings_${filters.metricGroup}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [processedData, currentMetrics, filters.metricGroup])

  useEffect(() => {
    fetchRankingsData()
  }, [fetchRankingsData])

  return {
    data: paginatedData,
    loading,
    error,
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
    refreshData: fetchRankingsData,
    availableEstilos,
    availableDistancias,
    currentMetrics,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    setCurrentPage,
    exportToCSV
  }
} 