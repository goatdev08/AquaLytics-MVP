'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface EfficiencyData {
  estilo: string
  distancia: number
  avgDistPorBrazada: number
  avgBrazadasTotal: number
  eficiencia: number // Ratio distancia/brazadas normalizado
  totalRegistros: number
  mejorRegistro: {
    nadador: string
    valor: number
  }
}

interface UseEfficiencyAnalysisReturn {
  data: EfficiencyData[]
  loading: boolean
  error: string | null
  filters: {
    distancia: number | null
    periodo: string
  }
  setFilters: (updates: Partial<{ distancia: number | null; periodo: string }>) => void
  refreshData: () => void
  availableDistancias: number[]
}

export function useEfficiencyAnalysis(): UseEfficiencyAnalysisReturn {
  const [data, setData] = useState<EfficiencyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableDistancias, setAvailableDistancias] = useState<number[]>([])
  const [filters, setFiltersState] = useState({
    distancia: null as number | null,
    periodo: '30d'
  })

  const setFilters = useCallback((updates: Partial<typeof filters>) => {
    setFiltersState(prev => ({ ...prev, ...updates }))
  }, [])

  const fetchEfficiencyData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Calcular fecha inicial según período
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

      // Query base para obtener datos de registros
      let query = supabase
        .from('registros')
        .select(`
          *,
          nadadores!inner(nombre),
          parametros!inner(parametro),
          distancias!inner(distancia),
          estilos!inner(estilo)
        `)
        .gte('fecha_registro', startDate.toISOString())

      if (filters.distancia) {
        query = query.eq('distancias.distancia', filters.distancia)
      }

      const { data: registros, error: registrosError } = await query

      if (registrosError) throw registrosError

      // Obtener distancias únicas
      const distancias = [...new Set((registros || [])
        .filter(r => r.distancias && !Array.isArray(r.distancias))
        .map(r => (r.distancias as any).distancia as number)
      )]
      setAvailableDistancias(distancias.sort((a, b) => a - b))

      // Procesar datos por estilo
      const estilos = ['Libre', 'Pecho', 'Espalda', 'Mariposa']
      const efficiencyByStyle: EfficiencyData[] = []

      for (const estilo of estilos) {
        const registrosEstilo = (registros || []).filter(r => {
          return r.estilos && !Array.isArray(r.estilos) && (r.estilos as any).estilo === estilo
        })
        
        if (registrosEstilo.length === 0) continue

        // Calcular métricas de brazada
        const distPorBrazada = registrosEstilo
          .filter(r => r.parametros && !Array.isArray(r.parametros) && r.parametros.parametro === 'DIST x BRZ')
          .map(r => ({ 
            nadador: r.nadadores && !Array.isArray(r.nadadores) ? r.nadadores.nombre : 'Desconocido',
            valor: r.valor !== null ? (typeof r.valor === 'string' ? parseFloat(r.valor) : r.valor) : 0
          }))
          .filter(r => !isNaN(r.valor) && r.valor > 0)

        const brazadasTotal = registrosEstilo
          .filter(r => r.parametros && !Array.isArray(r.parametros) && r.parametros.parametro === '# de BRZ TOTAL')
          .map(r => ({ 
            nadador: r.nadadores && !Array.isArray(r.nadadores) ? r.nadadores.nombre : 'Desconocido',
            valor: r.valor !== null ? (typeof r.valor === 'string' ? parseFloat(r.valor) : r.valor) : 0
          }))
          .filter(r => !isNaN(r.valor) && r.valor > 0)

        if (distPorBrazada.length === 0 || brazadasTotal.length === 0) continue

        // Calcular promedios
        const avgDistPorBrazada = distPorBrazada.reduce((acc, r) => acc + r.valor, 0) / distPorBrazada.length
        const avgBrazadasTotal = brazadasTotal.reduce((acc, r) => acc + r.valor, 0) / brazadasTotal.length

        // Calcular eficiencia (mayor distancia por brazada = más eficiente)
        // Normalizado: 100% = 3m por brazada (excelente), 0% = 1m por brazada (pobre)
        const eficiencia = Math.min(100, Math.max(0, ((avgDistPorBrazada - 1) / 2) * 100))

        // Encontrar mejor registro
        const mejorRegistro = distPorBrazada.reduce((best, current) => 
          current.valor > best.valor ? current : best
        )

        efficiencyByStyle.push({
          estilo,
          distancia: filters.distancia || 50,
          avgDistPorBrazada,
          avgBrazadasTotal,
          eficiencia,
          totalRegistros: registrosEstilo.length,
          mejorRegistro
        })
      }

      // Ordenar por eficiencia descendente
      efficiencyByStyle.sort((a, b) => b.eficiencia - a.eficiencia)

      setData(efficiencyByStyle)
    } catch (err) {
      console.error('Error fetching efficiency data:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar datos de eficiencia')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchEfficiencyData()
  }, [fetchEfficiencyData])

  return {
    data,
    loading,
    error,
    filters,
    setFilters,
    refreshData: fetchEfficiencyData,
    availableDistancias
  }
} 