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
  prueba_id: number
  prueba_nombre: string
  curso: string
  distancia: number
  estilo: string
  metricas_registradas: number
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

      // 2. OBTENER MAPAS DE REFERENCIA (con nombres de prueba)
      const { data: metricasMapData, error: metricasError } = await supabase.from('metricas').select('metrica_id, nombre')
      const { data: distanciasMapData, error: distanciasError } = await supabase.from('distancias').select('distancia_id, distancia')
      const { data: estilosMapData, error: estilosError } = await supabase.from('estilos').select('estilo_id, nombre')
      const { data: pruebasMapData, error: pruebasError } = await supabase.from('pruebas').select('id, nombre, distancia_id, estilo_id, curso')

      if (metricasError || distanciasError || estilosError || pruebasError) {
        throw new Error('Error al cargar datos de referencia')
      }
      
      const metricasMap = new Map(metricasMapData.map(m => [m.metrica_id, m.nombre]))
      const distanciasMap = new Map(distanciasMapData.map(d => [d.distancia_id, d.distancia]))
      const estilosMap = new Map(estilosMapData.map(e => [e.estilo_id, e.nombre]))
      const pruebasMap = new Map(pruebasMapData.map(p => [p.id, p]))

      // 3. OBTENER REGISTROS CRUDOS (sin JOINS)
      const { data: registros, error: registrosError } = await supabase
        .from('registros')
        .select('*') // Seleccionamos todo para tener los IDs
        .eq('id_nadador', parseInt(swimmerId))
        .order('fecha', { ascending: false })

      if (registrosError) throw registrosError;
      
      // Enriquecer registros con los nombres de los mapas
      const enrichedRegistros = registros.map(r => {
        const pruebaInfo = pruebasMap.get(r.prueba_id)
        const distanciaInfo = pruebaInfo ? distanciasMap.get(pruebaInfo.distancia_id) : 0
        const estiloInfo = pruebaInfo ? estilosMap.get(pruebaInfo.estilo_id) : 'Desconocido'
        
        return {
          ...r,
          metrica_nombre: metricasMap.get(r.metrica_id) || 'Desconocida',
          distancia_valor: distanciaInfo,
          estilo_nombre: estiloInfo,
          prueba_nombre: pruebaInfo?.nombre || 'Prueba Desconocida'
        }
      });
      console.log('🕵️‍♂️ Registros Enriquecidos:', enrichedRegistros);

      // Procesar estilos y distancias únicas
      const estilos = [...new Set(enrichedRegistros.map(r => r.estilo_nombre).filter((e): e is string => !!e && e !== 'Desconocido'))]
      const distancias = [...new Set(enrichedRegistros.map(r => r.distancia_valor).filter((d): d is number => !!d && d > 0))]
      
      setAvailableEstilos(estilos.sort())
      setAvailableDistancias(distancias.sort((a, b) => a - b))

      // 4. Calcular mejores marcas personales
      const bestsMap = new Map<string, PersonalBest>()
      
      enrichedRegistros.forEach(registro => {
        if (!registro.metrica_nombre || registro.metrica_nombre === 'Desconocida' || !registro.distancia_valor || !registro.estilo_nombre || registro.estilo_nombre === 'Desconocido') {
          return;
        }
        
        const metrica = registro.metrica_nombre
        const distancia = registro.distancia_valor
        const estilo = registro.estilo_nombre
        const valor = typeof registro.valor === 'string' ? parseFloat(registro.valor) : registro.valor
        
        const metricDef = METRICS_DEFINITIONS.find(m => m.parametro === metrica)
        if (!metricDef) return

        const key = `${estilo}-${distancia}-${metrica}`
        const current = bestsMap.get(key)
        
        const isTimeBased = metrica.includes('Tiempo') || metrica.startsWith('T')
        const isBetter = isTimeBased
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

      const personalBestsResult = Array.from(bestsMap.values());
      console.log('🏆 Mejores Marcas Personales Calculadas:', personalBestsResult);
      setPersonalBests(personalBestsResult)

      // 5. Calcular datos de progresión (REFACTORIZADO)
      const now = new Date()
      let startDate = new Date()
      
      switch (filters.periodo) {
        case '7d': startDate.setDate(now.getDate() - 7); break;
        case '30d': startDate.setDate(now.getDate() - 30); break;
        case '3m': startDate.setMonth(now.getMonth() - 3); break;
        case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
      }

      const filteredRegistros = enrichedRegistros.filter(r => {
        const matchDate = r.fecha && new Date(r.fecha) >= startDate
        const matchEstilo = !filters.estilo || r.estilo_nombre === filters.estilo
        const matchDistancia = !filters.distancia || r.distancia_valor === filters.distancia
        return matchDate && matchEstilo && matchDistancia
      }) || []

      const progressionMap = new Map<string, ProgressionData>()
      
      filteredRegistros.forEach(registro => {
        const key = `${registro.fecha}-${registro.prueba_id}`
        
        if (!progressionMap.has(key)) {
          progressionMap.set(key, {
            fecha: registro.fecha,
            prueba_id: registro.prueba_id,
            prueba_nombre: registro.prueba_nombre,
            curso: pruebasMap.get(registro.prueba_id)?.curso || 'largo',
            distancia: registro.distancia_valor || 0,
            estilo: registro.estilo_nombre || 'Desconocido',
            metricas_registradas: 0,
          })
        }
        
        const entry = progressionMap.get(key)!
        entry.metricas_registradas += 1
        
        const metrica = registro.metrica_nombre
        if (registro.valor !== null) {
          entry[metrica] = typeof registro.valor === 'string' ? parseFloat(registro.valor) : registro.valor
        }
      })

      const progressionDataResult = Array.from(progressionMap.values())
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      console.log('📈 Datos de Progresión (Pruebas Completas):', progressionDataResult);
      setProgressionData(progressionDataResult)

      // 6. Comparación con el equipo (REFACTORIZADO CON FILTROS)
      const { data: allRegistros, error: allRegistrosError } = await supabase
        .from('registros')
        .select('*') // Consulta cruda sin JOINS
        .gte('fecha', startDate.toISOString())

      if (allRegistrosError) throw allRegistrosError;

      const enrichedAllRegistros = allRegistros.map(r => {
        const pruebaInfo = pruebasMap.get(r.prueba_id);
        return {
          ...r,
          metrica_nombre: metricasMap.get(r.metrica_id) || 'Desconocida',
          distancia_valor: pruebaInfo ? distanciasMap.get(pruebaInfo.distancia_id) || 0 : 0,
          estilo_nombre: pruebaInfo ? estilosMap.get(pruebaInfo.estilo_id) || 'Desconocido' : 'Desconocido'
        };
      });

      // Calcular promedios del equipo y del nadador
      const teamStats = new Map<string, { total: number, count: number }>()
      const swimmerStats = new Map<string, { total: number, count: number }>()
      
      enrichedAllRegistros.forEach(registro => {
        if (!registro.metrica_nombre || registro.metrica_nombre === 'Desconocida' || registro.valor === null) return;
        
        const metrica = registro.metrica_nombre
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

      const teamComparisonsResult = Array.from(swimmerStats.entries()).map(([metrica, swimmerStat]) => {
        const teamStat = teamStats.get(metrica);
        if (!teamStat || teamStat.count <= 1) return null;

        const teamAverage = teamStat.total / teamStat.count;
        const swimmerAverage = swimmerStat.total / swimmerStat.count;
        
        const isTimeBased = metrica.toLowerCase().includes('tiempo') || metrica.startsWith('T');
        const percentDiff = isTimeBased
          ? ((teamAverage - swimmerAverage) / teamAverage) * 100
          : ((swimmerAverage - teamAverage) / teamAverage) * 100;

        const metricDef = METRICS_DEFINITIONS.find(m => m.parametro === metrica);

        return {
          metrica,
          label: metricDef?.label || metrica,
          swimmerValue: swimmerAverage,
          teamAverage: teamAverage,
          percentDiff,
          unit: metricDef?.unit || ''
        };
      }).filter((c): c is TeamComparison => c !== null);

      // Ordenar por la magnitud de la diferencia y tomar el top 5
      teamComparisonsResult.sort((a, b) => Math.abs(b.percentDiff) - Math.abs(a.percentDiff));
      setTeamComparisons(teamComparisonsResult.slice(0, 5));

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