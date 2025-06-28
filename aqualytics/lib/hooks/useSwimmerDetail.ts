'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { METRICS_DEFINITIONS } from '@/lib/utils/metrics-mapping'

interface SwimmerInfo {
  id_nadador: number
  nombre: string
}

interface PersonalBest {
  estilo: string
  distancia: number
  metrica: string
  valor: number
  unit: string
  fecha: string
}

interface ProgressionData {
  fecha: string
  [metricKey: string]: string | number
}

interface TeamComparison {
  metrica: string
  label: string
  swimmerValue: number
  teamAverage: number
  percentDiff: number
  unit: string
}

interface UseSwimmerDetailReturn {
  swimmerInfo: SwimmerInfo | null
  personalBests: PersonalBest[]
  progressionData: ProgressionData[]
  teamComparisons: TeamComparison[]
  loading: boolean
  error: string | null
  filters: {
    estilo: string | null
    distancia: number | null
    periodo: string
  }
  setFilters: (updates: Partial<{ estilo: string | null; distancia: number | null; periodo: string }>) => void
  availableEstilos: string[]
  availableDistancias: number[]
  refreshData: () => void
}

export function useSwimmerDetail(swimmerId: string): UseSwimmerDetailReturn {
  const [swimmerInfo, setSwimmerInfo] = useState<SwimmerInfo | null>(null)
  const [personalBests, setPersonalBests] = useState<PersonalBest[]>([])
  const [progressionData, setProgressionData] = useState<ProgressionData[]>([])
  const [teamComparisons, setTeamComparisons] = useState<TeamComparison[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableEstilos, setAvailableEstilos] = useState<string[]>([])
  const [availableDistancias, setAvailableDistancias] = useState<number[]>([])
  
  const [filters, setFiltersState] = useState({
    estilo: null as string | null,
    distancia: null as number | null,
    periodo: '30d'
  })

  const setFilters = useCallback((updates: Partial<typeof filters>) => {
    setFiltersState(prev => ({ ...prev, ...updates }))
  }, [])

  const fetchSwimmerData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Obtener información del nadador
      const { data: nadador, error: nadadorError } = await supabase
        .from('nadadores')
        .select('*')
        .eq('id_nadador', parseInt(swimmerId))
        .single()

      if (nadadorError) throw nadadorError
      setSwimmerInfo(nadador)

      // 2. Obtener todos los registros del nadador
      const { data: registros, error: registrosError } = await supabase
        .from('registros')
        .select(`
          *,
          parametros!inner(parametro),
          distancias!inner(distancia),
          estilos!inner(estilo)
        `)
        .eq('id_nadador', parseInt(swimmerId))
        .order('fecha', { ascending: false })

      if (registrosError) throw registrosError

      // Procesar estilos y distancias únicas
      const estilos = [...new Set(registros?.map(r => 
        r.estilos && !Array.isArray(r.estilos) ? r.estilos.estilo : null
      ).filter(Boolean) as string[])]
      const distancias = [...new Set(registros?.map(r => 
        r.distancias && !Array.isArray(r.distancias) ? r.distancias.distancia : null
      ).filter(Boolean) as number[])]
      
      setAvailableEstilos(estilos.sort())
      setAvailableDistancias(distancias.sort((a, b) => a - b))

      // 3. Calcular mejores marcas personales
      const bestsMap = new Map<string, PersonalBest>()
      
      registros?.forEach(registro => {
        if (!registro.parametros || Array.isArray(registro.parametros)) return
        if (!registro.distancias || Array.isArray(registro.distancias)) return
        if (!registro.estilos || Array.isArray(registro.estilos)) return
        if (registro.valor === null) return

        const metrica = registro.parametros.parametro
        const distancia = registro.distancias.distancia
        const estilo = registro.estilos.estilo
        const valor = typeof registro.valor === 'string' ? parseFloat(registro.valor) : registro.valor
        
        const metricDef = METRICS_DEFINITIONS.find(m => m.parametro === metrica)
        if (!metricDef) return

        const key = `${estilo}-${distancia}-${metrica}`
        const current = bestsMap.get(key)
        
        // Para tiempo, menor es mejor. Para el resto, mayor es mejor
        const isBetter = metrica.includes('T ') || metrica.includes('T15') || metrica.includes('T25') || metrica === 'T TOTAL'
          ? !current || valor < current.valor
          : !current || valor > current.valor

        if (isBetter) {
          bestsMap.set(key, {
            estilo,
            distancia,
            metrica,
            valor,
            unit: metricDef.unit,
            fecha: registro.fecha || ''
          })
        }
      })

      setPersonalBests(Array.from(bestsMap.values()))

      // 4. Calcular datos de progresión (filtrados por período)
      const now = new Date()
      let startDate = new Date()
      
      switch (filters.periodo) {
        case '7d':
          startDate.setDate(now.getDate() - 7)
          break
        case '30d':
          startDate.setDate(now.getDate() - 30)
          break
        case '3m':
          startDate.setMonth(now.getMonth() - 3)
          break
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      const filteredRegistros = registros?.filter(r => {
        const matchDate = r.fecha && new Date(r.fecha) >= startDate
        const matchEstilo = !filters.estilo || (r.estilos && !Array.isArray(r.estilos) && r.estilos.estilo === filters.estilo)
        const matchDistancia = !filters.distancia || (r.distancias && !Array.isArray(r.distancias) && r.distancias.distancia === filters.distancia)
        
        return matchDate && matchEstilo && matchDistancia
      }) || []

      // Agrupar por fecha
      const progressionMap = new Map<string, ProgressionData>()
      
      filteredRegistros.forEach(registro => {
        if (!registro.fecha || !registro.parametros || Array.isArray(registro.parametros)) return
        
        const fecha = registro.fecha
        if (!progressionMap.has(fecha)) {
          progressionMap.set(fecha, { fecha })
        }
        
        const entry = progressionMap.get(fecha)!
        const metrica = registro.parametros.parametro
        
        if (registro.valor !== null) {
          entry[metrica] = typeof registro.valor === 'string' ? parseFloat(registro.valor) : registro.valor
        }
      })

      setProgressionData(
        Array.from(progressionMap.values())
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      )

      // 5. Comparación con el equipo
      const { data: allRegistros } = await supabase
        .from('registros')
        .select(`
          *,
          parametros!inner(parametro),
          distancias!inner(distancia),
          estilos!inner(estilo)
        `)
        .gte('fecha', startDate.toISOString())

      // Calcular promedios del equipo y del nadador
      const teamStats = new Map<string, { total: number, count: number }>()
      const swimmerStats = new Map<string, { total: number, count: number }>()
      
      allRegistros?.forEach(registro => {
        if (!registro.parametros || Array.isArray(registro.parametros)) return
        if (registro.valor === null) return
        
        const metrica = registro.parametros.parametro
        const valor = typeof registro.valor === 'string' ? parseFloat(registro.valor) : registro.valor
        
        if (!teamStats.has(metrica)) {
          teamStats.set(metrica, { total: 0, count: 0 })
        }
        
        const teamStat = teamStats.get(metrica)!
        teamStat.total += valor
        teamStat.count++
        
        if (registro.id_nadador === parseInt(swimmerId)) {
          if (!swimmerStats.has(metrica)) {
            swimmerStats.set(metrica, { total: 0, count: 0 })
          }
          
          const swimmerStat = swimmerStats.get(metrica)!
          swimmerStat.total += valor
          swimmerStat.count++
        }
      })

      // Generar comparaciones
      const comparisons: TeamComparison[] = []
      
      swimmerStats.forEach((swimmerStat, metrica) => {
        const teamStat = teamStats.get(metrica)
        if (!teamStat || teamStat.count === 0) return
        
        const metricDef = METRICS_DEFINITIONS.find(m => m.parametro === metrica)
        if (!metricDef) return
        
        const swimmerAvg = swimmerStat.total / swimmerStat.count
        const teamAvg = teamStat.total / teamStat.count
        
        // Para tiempo, menor es mejor (diferencia negativa es buena)
        // Para el resto, mayor es mejor (diferencia positiva es buena)
        const isTimeBased = metrica.includes('T ') || metrica.includes('T15') || metrica.includes('T25') || metrica === 'T TOTAL'
        const percentDiff = isTimeBased
          ? ((teamAvg - swimmerAvg) / teamAvg) * 100
          : ((swimmerAvg - teamAvg) / teamAvg) * 100
        
        comparisons.push({
          metrica,
          label: metricDef.label,
          swimmerValue: swimmerAvg,
          teamAverage: teamAvg,
          percentDiff,
          unit: metricDef.unit
        })
      })

      // Ordenar por diferencia (mejores primero)
      comparisons.sort((a, b) => b.percentDiff - a.percentDiff)
      setTeamComparisons(comparisons)

    } catch (err) {
      console.error('Error fetching swimmer data:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar datos del nadador')
    } finally {
      setLoading(false)
    }
  }, [swimmerId, filters])

  useEffect(() => {
    fetchSwimmerData()
  }, [fetchSwimmerData])

  return {
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
    refreshData: fetchSwimmerData
  }
} 