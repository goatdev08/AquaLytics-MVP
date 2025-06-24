/**
 * Metrics Store - Zustand State Management
 * Gestión centralizada de métricas, cálculos automáticos y análisis
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type {
  RegistroCompleto,
  Parametro,
  FiltroRegistros,
} from '@/lib/types/database'
import type {
  MetricFormData,
  AutomaticMetrics,
  PerformanceAnalysis,
  MetricFilter,
  ProgressAnalysis,
  RankingResult,
} from '@/lib/types/metrics'

// ===== TIPOS DEL STORE =====

interface MetricsCache {
  records: RegistroCompleto[]
  calculations: Map<string, AutomaticMetrics>
  parametros: Parametro[]
  lastFetch: number | null
  cacheExpiry: number // 3 minutos para métricas (más dinámico)
}

interface MetricsOperations {
  loading: boolean
  calculating: boolean
  error: string | null
  lastOperation: string | null
}

interface MetricsFilters {
  currentFilter: MetricFilter | null
  activeRanking: RankingResult | null
  activeAnalysis: PerformanceAnalysis | null
  progressData: Map<string, ProgressAnalysis>
}

interface MetricsStore extends MetricsCache, MetricsOperations, MetricsFilters {
  // ===== OPERACIONES DE REGISTROS =====
  
  // Obtener registros con filtros
  fetchRecords: (filter?: FiltroRegistros) => Promise<void>
  
  // Crear nuevo registro con métricas manuales
  createRecord: (data: MetricFormData) => Promise<RegistroCompleto | null>
  
  // Actualizar registro existente
  updateRecord: (id: number, data: Partial<MetricFormData>) => Promise<void>
  
  // Eliminar registro
  deleteRecord: (id: number) => Promise<void>
  
  // ===== CÁLCULOS AUTOMÁTICOS =====
  
  // Calcular métricas automáticas
  calculateAutomaticMetrics: (manualData: MetricFormData) => AutomaticMetrics
  
  // Recalcular todas las métricas de un registro
  recalculateRecord: (recordId: number) => Promise<void>
  
  // Validar consistencia de datos
  validateMetrics: (data: MetricFormData) => { valid: boolean; errors: string[] }
  
  // ===== ANÁLISIS Y COMPARACIONES =====
  
  // Generar análisis de rendimiento
  generatePerformanceAnalysis: (
    swimmerId: number,
    competitionId?: number,
    filters?: MetricFilter
  ) => Promise<void>
  
  // Generar ranking por métrica
  generateRanking: (
    parametroId: number,
    filters?: MetricFilter
  ) => Promise<void>
  
  // Análisis de progresión temporal
  generateProgressAnalysis: (
    swimmerId: number,
    parametroId: number,
    timeframe?: { start: string; end: string }
  ) => Promise<void>
  
  // ===== FILTROS Y BÚSQUEDA =====
  
  // Aplicar filtro global
  applyFilter: (filter: MetricFilter) => Promise<void>
  
  // Limpiar filtros
  clearFilters: () => void
  
  // Buscar registros específicos
  searchRecords: (searchParams: {
    swimmer?: string
    competition?: string
    metric?: string
    dateRange?: { start: string; end: string }
  }) => Promise<void>
  
  // ===== GESTIÓN DE PARÁMETROS =====
  
  // Cargar definiciones de parámetros
  fetchParametros: () => Promise<void>
  
  // Obtener parámetro por ID
  getParametroById: (id: number) => Parametro | undefined
  
  // Obtener parámetros por tipo
  getParametrosByTipo: (tipo: 'M' | 'A') => Parametro[]
  
  // ===== CACHE Y OPTIMIZACIÓN =====
  
  // Verificar validez del cache
  isCacheValid: () => boolean
  
  // Limpiar cache
  clearCache: () => void
  
  // Invalidar cálculos específicos
  invalidateCalculations: (recordId?: number) => void
  
  // ===== UTILIDADES =====
  
  // Obtener estadísticas generales
  getMetricsStats: () => {
    totalRecords: number
    recordsByType: Record<string, number>
    calculationsCount: number
    cacheHitRate: number
  }
  
  // Exportar datos
  exportData: (format: 'csv' | 'json', filters?: MetricFilter) => Promise<Blob>
  
  // Reset completo
  reset: () => void
}

// ===== ESTADO INICIAL =====

const initialState: Pick<
  MetricsStore,
  keyof MetricsCache | keyof MetricsOperations | keyof MetricsFilters
> = {
  // Cache
  records: [],
  calculations: new Map(),
  parametros: [],
  lastFetch: null,
  cacheExpiry: 3 * 60 * 1000, // 3 minutos
  
  // Operaciones
  loading: false,
  calculating: false,
  error: null,
  lastOperation: null,
  
  // Filtros
  currentFilter: null,
  activeRanking: null,
  activeAnalysis: null,
  progressData: new Map(),
}

// ===== FUNCIONES DE CÁLCULO =====

const calculateAutomaticMetricsInternal = (data: MetricFormData): AutomaticMetrics => {
  const {
    t25_1,
    t25_2,
    t_total,
    brz_total,
    f1,
    f2,
  } = data
  
  return {
    v1: 25 / t25_1, // Velocidad primer segmento
    v2: 25 / t25_2, // Velocidad segundo segmento
    v_promedio: 50 / t_total, // Velocidad promedio
    dist_por_brz: 50 / brz_total, // Distancia por brazada
    dist_sin_f: 50 - (f1 + f2), // Distancia sin flecha
    f_promedio: (f1 + f2) / 2, // Promedio de flecha
  }
}

const validateMetricsInternal = (data: MetricFormData): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Validaciones básicas
  if (data.t15_1 >= data.t25_1) {
    errors.push('El tiempo de 15m debe ser menor al tiempo de 25m (primer segmento)')
  }
  
  if (data.t15_2 >= data.t25_2) {
    errors.push('El tiempo de 15m debe ser menor al tiempo de 25m (segundo segmento)')
  }
  
  if (Math.abs((data.t25_1 + data.t25_2) - data.t_total) > 0.1) {
    errors.push('El tiempo total debe ser aproximadamente igual a la suma de los tiempos por segmento')
  }
  
  if (data.brz_1 + data.brz_2 !== data.brz_total) {
    errors.push('El total de brazadas debe ser igual a la suma de brazadas por segmento')
  }
  
  // Validaciones de rangos lógicos
  if (data.t_total < 15 || data.t_total > 300) {
    errors.push('El tiempo total debe estar entre 15 y 300 segundos')
  }
  
  if (data.brz_total < 5 || data.brz_total > 100) {
    errors.push('El total de brazadas debe estar entre 5 y 100')
  }
  
  if (data.f1 < 0 || data.f1 > 15 || data.f2 < 0 || data.f2 > 15) {
    errors.push('Las flechas deben estar entre 0 y 15 metros')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// ===== STORE PRINCIPAL =====

export const useMetricsStore = create<MetricsStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // ===== OPERACIONES DE REGISTROS =====
      
      fetchRecords: async (filter?: FiltroRegistros) => {
        set({ loading: true, error: null, lastOperation: 'fetchRecords' })
        
        try {
          // Verificar cache válido sin filtros
          if (!filter && get().isCacheValid()) {
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
          
          // Aplicar filtros
          if (filter?.nadador_id) {
            query = query.eq('id_nadador', filter.nadador_id)
          }
          
          if (filter?.competencia_id) {
            query = query.eq('competencia_id', filter.competencia_id)
          }
          
          if (filter?.distancia_id) {
            query = query.eq('distancia_id', filter.distancia_id)
          }
          
          if (filter?.estilo_id) {
            query = query.eq('estilo_id', filter.estilo_id)
          }
          
          if (filter?.fase_id) {
            query = query.eq('fase_id', filter.fase_id)
          }
          
          if (filter?.fecha_desde) {
            query = query.gte('fecha', filter.fecha_desde)
          }
          
          if (filter?.fecha_hasta) {
            query = query.lte('fecha', filter.fecha_hasta)
          }
          
          if (filter?.parametros && filter.parametros.length > 0) {
            query = query.in('parametro_id', filter.parametros)
          }
          
          if (filter?.tipo_parametro && filter.tipo_parametro !== 'all') {
            // Necesitamos hacer join o filtro adicional para tipo de parámetro
            // Por ahora usamos el campo parametro.tipo
          }
          
          // Ordenamiento por fecha (más reciente primero)
          query = query.order('fecha', { ascending: false })
          query = query.order('registro_id', { ascending: false })
          
          // Límites
          if (filter?.limite) {
            const offset = filter.offset || 0
            query = query.range(offset, offset + filter.limite - 1)
          }
          
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
      
      createRecord: async (data: MetricFormData) => {
        set({ loading: true, calculating: true, error: null, lastOperation: 'createRecord' })
        
        try {
          // Validar datos primero
          const validation = get().validateMetrics(data)
          if (!validation.valid) {
            throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`)
          }
          
          // Calcular métricas automáticas
          const automaticMetrics = get().calculateAutomaticMetrics(data)
          
          // Preparar registros manuales
          const manualRecords = [
            // Primer segmento
            { parametro_id: 1, valor: data.t15_1, segmento: 1 }, // T15 (1)
            { parametro_id: 2, valor: data.brz_1, segmento: 1 }, // # de BRZ 1
            { parametro_id: 3, valor: data.t25_1, segmento: 1 }, // T25 (1)
            { parametro_id: 4, valor: data.f1, segmento: 1 }, // F1
            
            // Segundo segmento
            { parametro_id: 5, valor: data.t15_2, segmento: 2 }, // T15 (2)
            { parametro_id: 6, valor: data.brz_2, segmento: 2 }, // # de BRZ 2
            { parametro_id: 7, valor: data.t25_2, segmento: 2 }, // T25 (2)
            { parametro_id: 8, valor: data.f2, segmento: 2 }, // F2
            
            // Globales manuales
            { parametro_id: 9, valor: data.t_total, segmento: null }, // T TOTAL
            { parametro_id: 10, valor: data.brz_total, segmento: null }, // # de BRZ TOTAL
          ]
          
          // Preparar registros automáticos
          const automaticRecords = [
            { parametro_id: 11, valor: automaticMetrics.v1, segmento: 1 }, // V1
            { parametro_id: 12, valor: automaticMetrics.v2, segmento: 2 }, // V2
            { parametro_id: 13, valor: automaticMetrics.v_promedio, segmento: null }, // V promedio
            { parametro_id: 14, valor: automaticMetrics.dist_por_brz, segmento: null }, // DIST x BRZ
            { parametro_id: 15, valor: automaticMetrics.dist_sin_f, segmento: null }, // DIST sin F
            { parametro_id: 16, valor: automaticMetrics.f_promedio, segmento: null }, // F promedio
          ]
          
          // Combinar todos los registros
          const allRecords = [...manualRecords, ...automaticRecords].map(record => ({
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
            .insert(allRecords)
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
          
          // Actualizar store con optimistic update
          const newRecords = insertedRecords as RegistroCompleto[]
          set(state => ({
            records: [...newRecords, ...state.records],
            loading: false,
            calculating: false,
          }))
          
          // Guardar cálculos en cache
          const recordKey = `${data.swimmer_id}-${data.competition_id}-${data.date}`
          set(state => {
            const newCalculations = new Map(state.calculations)
            newCalculations.set(recordKey, automaticMetrics)
            return { calculations: newCalculations }
          })
          
          return newRecords[0] // Retornar primer registro como referencia
          
        } catch (error) {
          set({
            loading: false,
            calculating: false,
            error: error instanceof Error ? error.message : 'Error al crear registro',
          })
          return null
        }
      },
      
      updateRecord: async (id: number, _data: Partial<MetricFormData>) => {
        set({ loading: true, error: null, lastOperation: 'updateRecord' })
        
        try {
          // Obtener registro actual
          const currentRecord = get().records.find(r => r.registro_id === id)
          if (!currentRecord) {
            throw new Error('Registro no encontrado')
          }
          
          // TODO: Implementar lógica de actualización compleja
          // Necesitaría recalcular métricas automáticas si se modifican las manuales
          
          set({ loading: false })
          
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Error al actualizar registro',
          })
        }
      },
      
      deleteRecord: async (id: number) => {
        set({ loading: true, error: null, lastOperation: 'deleteRecord' })
        
        try {
          const { error } = await supabase
            .from('registros')
            .delete()
            .eq('registro_id', id)
          
          if (error) {
            throw new Error(error.message)
          }
          
          // Optimistic update
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
      
      // ===== CÁLCULOS =====
      
      calculateAutomaticMetrics: calculateAutomaticMetricsInternal,
      
      recalculateRecord: async (_recordId: number) => {
        set({ calculating: true, error: null, lastOperation: 'recalculateRecord' })
        
        try {
          // TODO: Implementar recálculo específico
          set({ calculating: false })
        } catch (error) {
          set({
            calculating: false,
            error: error instanceof Error ? error.message : 'Error en recálculo',
          })
        }
      },
      
      validateMetrics: validateMetricsInternal,
      
      // ===== ANÁLISIS =====
      
      generatePerformanceAnalysis: async (
        _swimmerId: number,
        _competitionId?: number,
        _filters?: MetricFilter
      ) => {
        set({ loading: true, error: null, lastOperation: 'generatePerformanceAnalysis' })
        
        try {
          // TODO: Implementar análisis de rendimiento
          set({ loading: false })
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Error en análisis de rendimiento',
          })
        }
      },
      
      generateRanking: async (_parametroId: number, _filters?: MetricFilter) => {
        set({ loading: true, error: null, lastOperation: 'generateRanking' })
        
        try {
          // TODO: Implementar generación de ranking
          set({ loading: false })
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Error en generación de ranking',
          })
        }
      },
      
      generateProgressAnalysis: async (
        _swimmerId: number,
        _parametroId: number,
        _timeframe?: { start: string; end: string }
      ) => {
        set({ loading: true, error: null, lastOperation: 'generateProgressAnalysis' })
        
        try {
          // TODO: Implementar análisis de progresión
          set({ loading: false })
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Error en análisis de progresión',
          })
        }
      },
      
      // ===== FILTROS =====
      
      applyFilter: async (filter: MetricFilter) => {
        set({ currentFilter: filter })
        // Aplicar filtro convirtiendo a FiltroRegistros
        const dbFilter: FiltroRegistros = {
          nadador_id: filter.swimmers?.[0],
          competencia_id: filter.competitions?.[0],
          distancia_id: filter.distances?.[0],
          estilo_id: filter.strokes?.[0],
          fase_id: filter.phases?.[0],
          fecha_desde: filter.date_from,
          fecha_hasta: filter.date_to,
          parametros: filter.metric_ids,
          limite: filter.limit,
          offset: filter.offset,
        }
        
        await get().fetchRecords(dbFilter)
      },
      
      clearFilters: () => {
        set({ currentFilter: null, activeRanking: null, activeAnalysis: null })
      },
      
      searchRecords: async (_searchParams) => {
        set({ loading: true, error: null, lastOperation: 'searchRecords' })
        
        try {
          // TODO: Implementar búsqueda avanzada
          set({ loading: false })
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Error en búsqueda',
          })
        }
      },
      
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
      
      getParametroById: (id: number) => {
        return get().parametros.find(p => p.parametro_id === id)
      },
      
      getParametrosByTipo: (tipo: 'M' | 'A') => {
        return get().parametros.filter(p => p.tipo === tipo)
      },
      
      // ===== CACHE =====
      
      isCacheValid: () => {
        const { lastFetch, cacheExpiry } = get()
        if (!lastFetch) return false
        return Date.now() - lastFetch < cacheExpiry
      },
      
      clearCache: () => {
        set({
          records: [],
          calculations: new Map(),
          lastFetch: null,
        })
      },
      
      invalidateCalculations: (recordId?: number) => {
        if (recordId) {
          // TODO: Invalidar cálculo específico
        } else {
          set({ calculations: new Map() })
        }
      },
      
      // ===== UTILIDADES =====
      
      getMetricsStats: () => {
        const { records, calculations, parametros } = get()
        
        const recordsByType = parametros.reduce((acc, param) => {
          const count = records.filter(r => r.parametro_id === param.parametro_id).length
          acc[param.tipo] = (acc[param.tipo] || 0) + count
          return acc
        }, {} as Record<string, number>)
        
        return {
          totalRecords: records.length,
          recordsByType,
          calculationsCount: calculations.size,
          cacheHitRate: calculations.size > 0 ? calculations.size / records.length : 0,
        }
      },
      
      exportData: async (_format: 'csv' | 'json', _filters?: MetricFilter) => {
        // TODO: Implementar exportación
        return new Blob([''], { type: 'text/plain' })
      },
      
      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'aqualytics-metrics-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // Persistir datos críticos pero no operaciones temporales
        parametros: state.parametros,
        calculations: state.calculations,
        lastFetch: state.lastFetch,
        currentFilter: state.currentFilter,
      }),
    }
  )
)

// ===== HOOKS AUXILIARES =====

// Hook para operaciones CRUD
export const useMetricsOperations = () => {
  const store = useMetricsStore()
  return {
    loading: store.loading,
    calculating: store.calculating,
    error: store.error,
    createRecord: store.createRecord,
    updateRecord: store.updateRecord,
    deleteRecord: store.deleteRecord,
    calculateAutomaticMetrics: store.calculateAutomaticMetrics,
    validateMetrics: store.validateMetrics,
    clearError: () => useMetricsStore.setState({ error: null }),
  }
}

// Hook para análisis y visualización
export const useMetricsAnalysis = () => {
  const store = useMetricsStore()
  return {
    activeAnalysis: store.activeAnalysis,
    activeRanking: store.activeRanking,
    progressData: store.progressData,
    generatePerformanceAnalysis: store.generatePerformanceAnalysis,
    generateRanking: store.generateRanking,
    generateProgressAnalysis: store.generateProgressAnalysis,
  }
}

// Hook para datos y filtros
export const useMetricsData = () => {
  const store = useMetricsStore()
  return {
    records: store.records,
    parametros: store.parametros,
    currentFilter: store.currentFilter,
    stats: store.getMetricsStats(),
    fetchRecords: store.fetchRecords,
    fetchParametros: store.fetchParametros,
    applyFilter: store.applyFilter,
    clearFilters: store.clearFilters,
  }
} 