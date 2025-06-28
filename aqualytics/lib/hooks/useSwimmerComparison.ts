'use client'

import { useState, useEffect, useMemo } from 'react'
import { getRegistrosCompletos, getNadadores } from '@/lib/supabase'
import { METRIC_GROUPS } from '@/lib/utils/metrics-mapping'

type MetricGroup = keyof typeof METRIC_GROUPS

type RegistroCompleto = {
  distancia?: number
  estilo?: string
  id_nadador?: number
  parametro?: {
    parametro?: string
  }
  valor?: number
}

export interface SwimmerData {
  id_nadador: number
  nombre: string
  registros: any[]
  metricas: Record<string, number>
}

export interface ComparisonFilters {
  swimmers: number[]
  distancia: number | null
  estilo: string | null
  metricGroup: MetricGroup
}

export interface UseSwimmerComparisonResult {
  swimmers: SwimmerData[]
  availableSwimmers: any[]
  availableDistancias: number[]
  availableEstilos: string[]
  filters: ComparisonFilters
  setFilters: (filters: Partial<ComparisonFilters>) => void
  loading: boolean
  error: string | null
  refreshData: () => void
  comparisonData: any[]
}

const DEFAULT_FILTERS: ComparisonFilters = {
  swimmers: [],
  distancia: null,
  estilo: null,
  metricGroup: 'brazadas'
}

export function useSwimmerComparison(): UseSwimmerComparisonResult {
  const [swimmers, setSwimmers] = useState<SwimmerData[]>([])
  const [availableSwimmers, setAvailableSwimmers] = useState<any[]>([])
  const [availableDistancias, setAvailableDistancias] = useState<number[]>([])
  const [availableEstilos, setAvailableEstilos] = useState<string[]>([])
  const [filters, setFiltersState] = useState<ComparisonFilters>(DEFAULT_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setFilters = (newFilters: Partial<ComparisonFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener datos básicos
      const [nadadores, registrosAll] = await Promise.all([
        getNadadores(),
        getRegistrosCompletos()
      ])

      if (!nadadores || !registrosAll) {
        throw new Error('No se pudieron cargar los datos')
      }

      setAvailableSwimmers(nadadores)

             // Extraer distancias y estilos únicos de los registros con filtros robustos
       const distanciasRaw = registrosAll
         .map((r: any) => r.distancia?.distancia)
         .filter((dist): dist is number => typeof dist === 'number' && dist > 0)
       
       const estilosRaw = registrosAll
         .map((r: any) => r.estilo?.estilo)
         .filter((estilo): estilo is string => typeof estilo === 'string' && estilo.trim().length > 0)
       
       const distancias = [...new Set(distanciasRaw)]
       const estilos = [...new Set(estilosRaw)]
       
       setAvailableDistancias(distancias.sort((a: number, b: number) => a - b))
       setAvailableEstilos(estilos.sort())

    } catch (err) {
      console.error('Error fetching comparison data:', err)
      setError(err instanceof Error ? err.message : 'Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const processSwimmerData = async () => {
    if (filters.swimmers.length === 0 || !filters.distancia || !filters.estilo) {
      setSwimmers([])
      return
    }

    try {
      setLoading(true)
      const registrosAll = await getRegistrosCompletos()

      if (!registrosAll) return

             // Filtrar registros por distancia y estilo
       const registrosFiltrados = registrosAll.filter((r: any) => 
         r.distancia?.distancia === filters.distancia && 
         r.estilo?.estilo === filters.estilo &&
         r.id_nadador && filters.swimmers.includes(r.id_nadador)
       )

       // Agrupar por nadador
       const swimmerMap = new Map<number, any[]>()
       registrosFiltrados.forEach((registro: any) => {
         const swimmerId = registro.id_nadador
         if (swimmerId && !swimmerMap.has(swimmerId)) {
           swimmerMap.set(swimmerId, [])
         }
         if (swimmerId) {
           swimmerMap.get(swimmerId)!.push(registro)
         }
       })

       // Procesar datos de cada nadador
       const processedSwimmers: SwimmerData[] = filters.swimmers.map(swimmerId => {
         const nadador = availableSwimmers.find(n => n.id_nadador === swimmerId)
         const registros = swimmerMap.get(swimmerId) || []
         
         // Calcular métricas promedio para el grupo seleccionado
         const metricas: Record<string, number> = {}
         const metricasGrupo = METRIC_GROUPS[filters.metricGroup].metrics

         metricasGrupo.forEach(metricDef => {
           const registrosMetrica = registros.filter((r: any) => 
             r.parametro?.parametro === metricDef.parametro
           )
           
           if (registrosMetrica.length > 0) {
             const promedio = registrosMetrica.reduce((sum, r) => sum + (r.valor || 0), 0) / registrosMetrica.length
             metricas[metricDef.parametro] = promedio
           } else {
             metricas[metricDef.parametro] = 0
           }
         })

        return {
          id_nadador: swimmerId,
          nombre: nadador?.nombre || `Nadador ${swimmerId}`,
          registros,
          metricas
        }
      })

      setSwimmers(processedSwimmers)

    } catch (err) {
      console.error('Error processing swimmer data:', err)
      setError(err instanceof Error ? err.message : 'Error processing data')
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    fetchData()
  }, [])

  // Procesar datos cuando cambien los filtros
  useEffect(() => {
    if (availableSwimmers.length > 0) {
      processSwimmerData()
    }
  }, [filters, availableSwimmers])

     // Preparar datos para gráfico de comparación
   const comparisonData = useMemo(() => {
     if (swimmers.length === 0) return []

     const metricasGrupo = METRIC_GROUPS[filters.metricGroup].metrics
     
     return metricasGrupo.map(metricDef => ({
       key: metricDef.parametro, // Key única para evitar warnings de React
       metric: metricDef.shortLabel,
       unit: metricDef.unit,
       ...swimmers.reduce((acc, swimmer) => ({
         ...acc,
         [swimmer.nombre]: swimmer.metricas[metricDef.parametro] || 0
       }), {})
     }))
   }, [swimmers, filters.metricGroup])

  return {
    swimmers,
    availableSwimmers,
    availableDistancias,
    availableEstilos,
    filters,
    setFilters,
    loading,
    error,
    refreshData: fetchData,
    comparisonData
  }
} 