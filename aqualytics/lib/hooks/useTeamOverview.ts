'use client'

import { useState, useEffect, useMemo } from 'react'
import { getRegistrosCompletos, getNadadores, getCompetencias } from '@/lib/supabase'

// Tipos para los datos de Supabase
type RegistroCompleto = {
  fecha?: string
  id_nadador?: number
  valor?: number
  parametro?: {
    parametro?: string
  }
}

type Nadador = {
  id_nadador: number
  nombre: string
}

type Competencia = {
  competencia_id: number
  competencia: string
}

export type TimeRange = '7d' | '30d' | '3m' | '1y'

interface TeamStats {
  totalSwimmers: number
  activeSwimmers: number
  totalCompetitions: number
  totalRecords: number
  averageTime: number
  averageVelocity: number
  improvementPercentage: number
  lastUpdated: string
}

interface ProgressData {
  date: string
  avgTime: number
  avgVelocity: number
  recordCount: number
}

interface UseTeamOverviewResult {
  stats: TeamStats | null
  progressData: ProgressData[]
  loading: boolean
  error: string | null
  timeRange: TimeRange
  setTimeRange: (range: TimeRange) => void
  refreshData: () => void
}

const TIME_RANGE_DAYS = {
  '7d': 7,
  '30d': 30, 
  '3m': 90,
  '1y': 365
}

export function useTeamOverview(): UseTeamOverviewResult {
  const [stats, setStats] = useState<TeamStats | null>(null)
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  // Calcular fechas basadas en el rango seleccionado
  const dateRange = useMemo(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - TIME_RANGE_DAYS[timeRange])
    
    const prevEnd = new Date(start)
    const prevStart = new Date(start)
    prevStart.setDate(prevEnd.getDate() - TIME_RANGE_DAYS[timeRange])
    
    return {
      current: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] },
      previous: { start: prevStart.toISOString().split('T')[0], end: prevEnd.toISOString().split('T')[0] }
    }
  }, [timeRange])

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener datos básicos
      const [nadadores, competencias, registrosAll] = await Promise.all([
        getNadadores(),
        getCompetencias(),
        getRegistrosCompletos()
      ])

      // Filtrar registros por período actual
      const registrosCurrent = (registrosAll as RegistroCompleto[])?.filter((r: RegistroCompleto) => 
        r.fecha && r.fecha >= dateRange.current.start && r.fecha <= dateRange.current.end
      ) || []

      // Filtrar registros por período anterior (para comparación)
      const registrosPrevious = (registrosAll as RegistroCompleto[])?.filter((r: RegistroCompleto) => 
        r.fecha && r.fecha >= dateRange.previous.start && r.fecha <= dateRange.previous.end
      ) || []

      // Calcular estadísticas actuales
      const totalRecords = registrosCurrent.length
      const activeSwimmers = new Set(registrosCurrent.map((r: RegistroCompleto) => r.id_nadador)).size

      // Obtener métricas de tiempo total y velocidad promedio
      const tiempoTotalRecords = registrosCurrent.filter((r: RegistroCompleto) => 
        r.parametro?.parametro === 'T TOTAL'
      )
      const velocidadRecords = registrosCurrent.filter((r: RegistroCompleto) => 
        r.parametro?.parametro === 'V promedio'
      )

      const avgTime = tiempoTotalRecords.length > 0 
        ? tiempoTotalRecords.reduce((sum: number, r: RegistroCompleto) => sum + (r.valor || 0), 0) / tiempoTotalRecords.length
        : 0

      const avgVelocity = velocidadRecords.length > 0
        ? velocidadRecords.reduce((sum: number, r: RegistroCompleto) => sum + (r.valor || 0), 0) / velocidadRecords.length
        : 0

      // Calcular métricas del período anterior para comparación
      const tiempoTotalPrevious = registrosPrevious.filter((r: RegistroCompleto) => 
        r.parametro?.parametro === 'T TOTAL'
      )
      const avgTimePrevious = tiempoTotalPrevious.length > 0
        ? tiempoTotalPrevious.reduce((sum, r) => sum + (r.valor || 0), 0) / tiempoTotalPrevious.length
        : avgTime

      // Calcular % de mejora (mejora = tiempo menor)
      const improvementPercentage = avgTimePrevious > 0 
        ? ((avgTimePrevious - avgTime) / avgTimePrevious) * 100
        : 0

      // Generar datos de progresión diaria
      const progressMap = new Map<string, { totalTime: number, totalVelocity: number, count: number }>()
      
      registrosCurrent.forEach(record => {
        const date = record.fecha
        if (!date) return
        
        if (!progressMap.has(date)) {
          progressMap.set(date, { totalTime: 0, totalVelocity: 0, count: 0 })
        }
        
        const dayData = progressMap.get(date)!
        
        if (record.parametro?.parametro === 'T TOTAL' && record.valor) {
          dayData.totalTime += record.valor
          dayData.count++
        }
        if (record.parametro?.parametro === 'V promedio' && record.valor) {
          dayData.totalVelocity += record.valor
        }
      })

      const progressData: ProgressData[] = Array.from(progressMap.entries())
        .map(([date, data]) => ({
          date,
          avgTime: data.count > 0 ? data.totalTime / data.count : 0,
          avgVelocity: data.count > 0 ? data.totalVelocity / data.count : 0,
          recordCount: data.count
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Establecer estadísticas finales
      setStats({
        totalSwimmers: nadadores?.length || 0,
        activeSwimmers,
        totalCompetitions: competencias?.length || 0,
        totalRecords,
        averageTime: avgTime,
        averageVelocity: avgVelocity,
        improvementPercentage,
        lastUpdated: new Date().toISOString()
      })

      setProgressData(progressData)

    } catch (err) {
      console.error('Error fetching team data:', err)
      setError(err instanceof Error ? err.message : 'Error loading team data')
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos cuando cambia el rango de tiempo
  useEffect(() => {
    fetchTeamData()
  }, [timeRange, dateRange.current.start, dateRange.current.end])

  return {
    stats,
    progressData,
    loading,
    error,
    timeRange,
    setTimeRange,
    refreshData: fetchTeamData
  }
} 