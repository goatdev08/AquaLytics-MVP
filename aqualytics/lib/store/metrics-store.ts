/**
 * Metrics Store - Zustand State Management (MVP Version)
 * Gestión básica de métricas y registros
 */

import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { RegistroCompleto, Parametro, RegistroCompletoTabla, NuevoRegistroCompletoTabla } from '@/lib/types/database'
import type { MetricFormData, AutomaticMetrics } from '@/lib/types/metrics'

// ===== TIPOS DEL STORE =====

interface MetricsStore {
  // Estado
  records: RegistroCompleto[]
  registrosCompletos: RegistroCompletoTabla[]
  parametros: Parametro[]
  loading: boolean
  error: string | null
  
  // Filtros simples
  selectedSwimmerId: number | null
  dateRange: { start: string | null; end: string | null }
  
  // Cache simple
  lastFetch: number | null
  calculations: Map<string, AutomaticMetrics>
  
  // ===== OPERACIONES BÁSICAS =====
  
  // Obtener registros
  fetchRecords: (swimmerId?: number) => Promise<void>
  
  // Obtener registros completos
  fetchRegistrosCompletos: (filters?: {
    nadadorId?: number
    competenciaId?: number
    fechaDesde?: string
    fechaHasta?: string
  }) => Promise<void>
  
  // Crear nuevo registro
  createRecord: (data: MetricFormData) => Promise<RegistroCompleto | null>
  
  // Crear nuevo registro completo
  createRegistroCompleto: (data: Partial<NuevoRegistroCompletoTabla>) => Promise<RegistroCompletoTabla | null>
  
  // Actualizar registro completo
  updateRegistroCompleto: (id: number, data: Partial<NuevoRegistroCompletoTabla>) => Promise<void>
  
  // Eliminar registro
  deleteRecord: (id: number) => Promise<void>
  
  // Eliminar registro completo
  deleteRegistroCompleto: (id: number) => Promise<void>
  
  // ===== CÁLCULOS =====
  
  // Calcular métricas automáticas
  calculateAutomaticMetrics: (data: MetricFormData) => AutomaticMetrics
  
  // ===== PARÁMETROS =====
  
  // Cargar parámetros
  fetchParametros: () => Promise<void>
  
  // ===== FILTROS =====
  
  // Establecer filtros
  setFilters: (swimmerId: number | null, dateRange?: { start: string | null; end: string | null }) => void
  
  // ===== UTILIDADES =====
  
  // Resetear store
  reset: () => void
}

// ===== ESTADO INICIAL =====

const initialState = {
  records: [],
  registrosCompletos: [],
  parametros: [],
  loading: false,
  error: null,
  selectedSwimmerId: null,
  dateRange: { start: null, end: null },
  lastFetch: null,
  calculations: new Map(),
}

// ===== FUNCIONES DE CÁLCULO =====

const calculateMetrics = (data: MetricFormData): AutomaticMetrics => {
  return {
    v1: 25 / data.t25_1,
    v2: 25 / data.t25_2,
    v_promedio: 50 / data.t_total,
    dist_por_brz: 50 / data.brz_total,
    dist_sin_f: 50 - (data.f1 + data.f2),
    f_promedio: (data.f1 + data.f2) / 2,
  }
}

// ===== STORE PRINCIPAL =====

export const useMetricsStore = create<MetricsStore>((set, get) => ({
  ...initialState,
  
  // ===== OPERACIONES BÁSICAS =====
  
  fetchRecords: async (swimmerId?: number) => {
    set({ loading: true, error: null })
    
    try {
      // Cache simple: si ya cargamos en los últimos 3 minutos, no recargar
      const { lastFetch } = get()
      if (lastFetch && Date.now() - lastFetch < 3 * 60 * 1000) {
        set({ loading: false })
        return
      }
      
      let query = supabase
        .from('registros')
        .select(`
          *,
          nadador:nadadores(*),
          competencia:competencias(*),
          distancia:distancias(*),
          estilo:estilos(*),
          fase:fases(*),
          parametro:parametros(*)
        `)
      
      // Filtrar por nadador si se especifica
      const filterSwimmerId = swimmerId || get().selectedSwimmerId
      if (filterSwimmerId) {
        query = query.eq('id_nadador', filterSwimmerId)
      }
      
      // Filtrar por rango de fechas
      const { dateRange } = get()
      if (dateRange.start) {
        query = query.gte('fecha', dateRange.start)
      }
      if (dateRange.end) {
        query = query.lte('fecha', dateRange.end)
      }
      
      // Ordenar por fecha descendente
      query = query.order('fecha', { ascending: false })
      
      const { data, error } = await query
      
      if (error) {
        throw new Error(error.message)
      }
      
      set({
        records: (data || []) as RegistroCompleto[],
        lastFetch: Date.now(),
        loading: false,
      })
      
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar registros',
      })
    }
  },
  
  fetchRegistrosCompletos: async (filters?: {
    nadadorId?: number
    competenciaId?: number
    fechaDesde?: string
    fechaHasta?: string
  }) => {
    set({ loading: true, error: null })
    
    try {
      let query = supabase
        .from('registros_completos')
        .select('*')
      
      if (filters) {
        if (filters.nadadorId) {
          query = query.eq('id_nadador', filters.nadadorId)
        }
        if (filters.competenciaId) {
          query = query.eq('competencia_id', filters.competenciaId)
        }
        if (filters.fechaDesde) {
          query = query.gte('fecha', filters.fechaDesde)
        }
        if (filters.fechaHasta) {
          query = query.lte('fecha', filters.fechaHasta)
        }
      }
      
      const { data, error } = await query
      
      if (error) {
        throw new Error(error.message)
      }
      
      set({
        registrosCompletos: data || [],
        loading: false,
      })
      
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar registros completos',
      })
    }
  },
  
  createRecord: async (data: MetricFormData) => {
    set({ loading: true, error: null })
    
    try {
      // Calcular métricas automáticas
      const automaticMetrics = get().calculateAutomaticMetrics(data)
      
      // Preparar todos los registros
      const records = [
        // Métricas manuales
        { parametro_id: 1, valor: data.t15_1, segmento: 1 },
        { parametro_id: 2, valor: data.brz_1, segmento: 1 },
        { parametro_id: 3, valor: data.t25_1, segmento: 1 },
        { parametro_id: 4, valor: data.f1, segmento: 1 },
        { parametro_id: 5, valor: data.t15_2, segmento: 2 },
        { parametro_id: 6, valor: data.brz_2, segmento: 2 },
        { parametro_id: 7, valor: data.t25_2, segmento: 2 },
        { parametro_id: 8, valor: data.f2, segmento: 2 },
        { parametro_id: 9, valor: data.t_total, segmento: null },
        { parametro_id: 10, valor: data.brz_total, segmento: null },
        
        // Métricas automáticas
        { parametro_id: 11, valor: automaticMetrics.v1, segmento: 1 },
        { parametro_id: 12, valor: automaticMetrics.v2, segmento: 2 },
        { parametro_id: 13, valor: automaticMetrics.v_promedio, segmento: null },
        { parametro_id: 14, valor: automaticMetrics.dist_por_brz, segmento: null },
        { parametro_id: 15, valor: automaticMetrics.dist_sin_f, segmento: null },
        { parametro_id: 16, valor: automaticMetrics.f_promedio, segmento: null },
      ].map(record => ({
        ...record,
        id_nadador: data.swimmer_id,
        competencia_id: data.competition_id,
        fecha: data.date,
        distancia_id: data.distance_id,
        estilo_id: data.stroke_id,
        fase_id: data.phase_id,
      }))
      
      // Insertar en base de datos
      const { data: insertedRecords, error } = await supabase
        .from('registros')
        .insert(records)
        .select(`
          *,
          nadador:nadadores(*),
          competencia:competencias(*),
          distancia:distancias(*),
          estilo:estilos(*),
          fase:fases(*),
          parametro:parametros(*)
        `)
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Actualizar lista local
      const newRecords = insertedRecords as RegistroCompleto[]
      set(state => ({
        records: [...newRecords, ...state.records],
        loading: false,
      }))
      
      // Guardar cálculo en cache
      const cacheKey = `${data.swimmer_id}-${data.competition_id}-${data.date}`
      set(state => {
        const newCalculations = new Map(state.calculations)
        newCalculations.set(cacheKey, automaticMetrics)
        return { calculations: newCalculations }
      })
      
      return newRecords[0]
      
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al crear registro',
      })
      return null
    }
  },
  
  createRegistroCompleto: async (data: Partial<NuevoRegistroCompletoTabla>) => {
    set({ loading: true, error: null })
    
    try {
      // Validar campos requeridos
      if (!data.id_nadador || !data.prueba_id || !data.fecha) {
        throw new Error('Faltan campos requeridos: id_nadador, prueba_id, fecha')
      }
      
      const { data: insertedData, error } = await supabase
        .from('registros_completos')
        .insert({
          id_nadador: data.id_nadador,
          prueba_id: data.prueba_id,
          fecha: data.fecha,
          competencia_id: data.competencia_id || null,
          fase_id: data.fase_id || null,
          t15_1: data.t15_1 || null,
          brz_1: data.brz_1 || null,
          t25_1: data.t25_1 || null,
          f1: data.f1 || null,
          t15_2: data.t15_2 || null,
          brz_2: data.brz_2 || null,
          t25_2: data.t25_2 || null,
          f2: data.f2 || null,
          t_total: data.t_total || null,
          brz_total: data.brz_total || null,
          metodo_registro: data.metodo_registro || 'manual'
        })
        .select('*')
        .single()
      
      if (error) {
        throw new Error(error.message)
      }
      
      set(state => ({
        registrosCompletos: [...state.registrosCompletos, insertedData],
        loading: false,
      }))
      
      return insertedData
      
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al crear registro completo',
      })
      return null
    }
  },
  
  updateRegistroCompleto: async (id: number, data: Partial<NuevoRegistroCompletoTabla>) => {
    set({ loading: true, error: null })
    
    try {
          const { data: updatedData, error } = await supabase
      .from('registros_completos')
      .update(data)
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) {
      throw new Error(error.message)
    }
    
    set(state => ({
      registrosCompletos: state.registrosCompletos.map(r =>
        r.id === id ? updatedData : r
      ),
      loading: false,
    }))
      
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar registro completo',
      })
    }
  },
  
  deleteRecord: async (id: number) => {
    set({ loading: true, error: null })
    
    try {
      const { error } = await supabase
        .from('registros')
        .delete()
        .eq('registro_id', id)
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Actualizar lista local
      set(state => ({
        records: state.records.filter(r => r.registro_id !== id),
        loading: false,
      }))
      
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al eliminar registro',
      })
    }
  },
  
  deleteRegistroCompleto: async (id: number) => {
    set({ loading: true, error: null })
    
    try {
          const { error } = await supabase
      .from('registros_completos')
      .delete()
      .eq('id', id)
    
    if (error) {
      throw new Error(error.message)
    }
    
    set(state => ({
      registrosCompletos: state.registrosCompletos.filter(r => r.id !== id),
      loading: false,
    }))
      
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al eliminar registro completo',
      })
    }
  },
  
  // ===== CÁLCULOS =====
  
  calculateAutomaticMetrics: calculateMetrics,
  
  // ===== PARÁMETROS =====
  
  fetchParametros: async () => {
    try {
      const { data, error } = await supabase
        .from('parametros')
        .select('*')
        .order('parametro_id')
      
      if (error) {
        throw new Error(error.message)
      }
      
      set({ parametros: data || [] })
      
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al cargar parámetros',
      })
    }
  },
  
  // ===== FILTROS =====
  
  setFilters: (swimmerId: number | null, dateRange?: { start: string | null; end: string | null }) => {
    set({
      selectedSwimmerId: swimmerId,
      dateRange: dateRange || get().dateRange,
    })
  },
  
  // ===== UTILIDADES =====
  
  reset: () => {
    set(initialState)
  },
})) 