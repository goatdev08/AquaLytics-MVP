/**
 * Swimmers Store - Zustand State Management
 * Gestión centralizada de nadadores con CRUD operations y cache
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type {
  Nadador,
  NuevoNadador,
  NadadorConRegistros,
  ResultadoBusqueda,
} from '@/lib/types/database'

// ===== TIPOS DEL STORE =====

interface SwimmerFilters {
  search?: string
  ageMin?: number
  ageMax?: number
  weightMin?: number
  weightMax?: number
  hasRecords?: boolean
  sortBy?: 'nombre' | 'edad' | 'peso' | 'registros'
  sortDirection?: 'asc' | 'desc'
  page?: number
  limit?: number
}

interface SwimmerOperations {
  loading: boolean
  error: string | null
  lastOperation: string | null
}

interface SwimmerCache {
  swimmers: Nadador[]
  swimmersWithRecords: Map<number, NadadorConRegistros>
  searchResults: ResultadoBusqueda<Nadador> | null
  lastFetch: number | null
  cacheExpiry: number // 5 minutos en ms
}

interface SwimmerSelection {
  selectedSwimmer: Nadador | null
  selectedSwimmerDetails: NadadorConRegistros | null
}

interface SwimmersStore extends SwimmerOperations, SwimmerCache, SwimmerSelection {
  // ===== OPERACIONES CRUD =====
  
  // Listar nadadores
  fetchSwimmers: (filters?: SwimmerFilters) => Promise<void>
  
  // Obtener nadador específico
  fetchSwimmerById: (id: number, withRecords?: boolean) => Promise<void>
  
  // Crear nadador
  createSwimmer: (data: NuevoNadador) => Promise<Nadador | null>
  
  // Actualizar nadador
  updateSwimmer: (id: number, data: Partial<NuevoNadador>) => Promise<void>
  
  // Eliminar nadador
  deleteSwimmer: (id: number) => Promise<void>
  
  // ===== BÚSQUEDA Y FILTROS =====
  
  // Búsqueda con filtros
  searchSwimmers: (filters: SwimmerFilters) => Promise<void>
  
  // Limpiar resultados de búsqueda
  clearSearchResults: () => void
  
  // ===== SELECCIÓN Y NAVEGACIÓN =====
  
  // Seleccionar nadador actual
  selectSwimmer: (swimmer: Nadador | null) => void
  
  // ===== CACHE Y LIMPIEZA =====
  
  // Verificar si cache es válido
  isCacheValid: () => boolean
  
  // Limpiar cache
  clearCache: () => void
  
  // Invalidar cache específico
  invalidateSwimmer: (id: number) => void
  
  // ===== UTILIDADES =====
  
  // Obtener estadísticas rápidas
  getSwimmerStats: () => {
    total: number
    withRecords: number
    avgAge: number
    ageRange: { min: number; max: number }
  }
  
  // Resetear estado
  reset: () => void
}

// ===== ESTADO INICIAL =====

const initialState: Pick<
  SwimmersStore,
  keyof SwimmerOperations | keyof SwimmerCache | keyof SwimmerSelection
> = {
  // Operaciones
  loading: false,
  error: null,
  lastOperation: null,
  
  // Cache
  swimmers: [],
  swimmersWithRecords: new Map(),
  searchResults: null,
  lastFetch: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutos
  
  // Selección
  selectedSwimmer: null,
  selectedSwimmerDetails: null,
}

// ===== STORE PRINCIPAL =====

export const useSwimmersStore = create<SwimmersStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // ===== IMPLEMENTACIÓN CRUD =====
      
      fetchSwimmers: async (filters?: SwimmerFilters) => {
        set({ loading: true, error: null, lastOperation: 'fetchSwimmers' })
        
        try {
          // Verificar cache válido sin filtros
          if (!filters && get().isCacheValid()) {
            set({ loading: false })
            return
          }
          
          let query = supabase
            .from('nadadores')
            .select('*')
          
          // Aplicar filtros
          if (filters?.search) {
            query = query.ilike('nombre', `%${filters.search}%`)
          }
          
          if (filters?.ageMin) {
            query = query.gte('edad', filters.ageMin)
          }
          
          if (filters?.ageMax) {
            query = query.lte('edad', filters.ageMax)
          }
          
          if (filters?.weightMin) {
            query = query.gte('peso', filters.weightMin)
          }
          
          if (filters?.weightMax) {
            query = query.lte('peso', filters.weightMax)
          }
          
          // Ordenamiento
          const sortBy = filters?.sortBy || 'nombre'
          const direction = filters?.sortDirection || 'asc'
          query = query.order(sortBy, { ascending: direction === 'asc' })
          
          // Paginación
          if (filters?.limit) {
            const offset = ((filters.page || 1) - 1) * filters.limit
            query = query.range(offset, offset + filters.limit - 1)
          }
          
          const { data, error } = await query
          
          if (error) {
            throw new Error(error.message)
          }
          
          set({
            swimmers: data || [],
            lastFetch: Date.now(),
            loading: false,
            error: null,
          })
          
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Error al cargar nadadores',
          })
        }
      },
      
      fetchSwimmerById: async (id: number, withRecords = false) => {
        set({ loading: true, error: null, lastOperation: 'fetchSwimmerById' })
        
        try {
          // Verificar cache primero
          const cached = get().swimmersWithRecords.get(id)
          if (cached && !withRecords) {
            set({
              selectedSwimmer: cached,
              selectedSwimmerDetails: withRecords ? cached : null,
              loading: false,
            })
            return
          }
          
          const query = supabase
            .from('nadadores')
            .select('*')
            .eq('id_nadador', id)
            .single()
          
          const { data: swimmer, error } = await query
          
          if (error) {
            throw new Error(error.message)
          }
          
          let swimmerDetails: NadadorConRegistros | null = null
          
          if (withRecords && swimmer) {
            // Obtener registros del nadador
            const { data: registros, error: registrosError } = await supabase
              .from('registros')
              .select(`
                *,
                competencia:competencias(*),
                distancia:distancias(*),
                estilo:estilos(*),
                fase:fases(*),
                parametro:parametros(*)
              `)
              .eq('id_nadador', id)
              .order('fecha', { ascending: false })
            
            if (!registrosError) {
              swimmerDetails = {
                ...swimmer,
                registros: registros || [],
                totalRegistros: registros?.length || 0,
                ultimaParticipacion: registros?.[0]?.fecha || undefined,
              }
              
              // Actualizar cache
              const newCache = new Map(get().swimmersWithRecords)
              newCache.set(id, swimmerDetails)
              set({ swimmersWithRecords: newCache })
            }
          }
          
          set({
            selectedSwimmer: swimmer,
            selectedSwimmerDetails: swimmerDetails,
            loading: false,
          })
          
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Error al cargar nadador',
          })
        }
      },
      
      createSwimmer: async (data: NuevoNadador) => {
        set({ loading: true, error: null, lastOperation: 'createSwimmer' })
        
        try {
          const { data: newSwimmer, error } = await supabase
            .from('nadadores')
            .insert(data)
            .select()
            .single()
          
          if (error) {
            throw new Error(error.message)
          }
          
          // Optimistic update
          set(state => ({
            swimmers: [newSwimmer, ...state.swimmers],
            loading: false,
            selectedSwimmer: newSwimmer,
          }))
          
          return newSwimmer
          
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Error al crear nadador',
          })
          return null
        }
      },
      
      updateSwimmer: async (id: number, data: Partial<NuevoNadador>) => {
        set({ loading: true, error: null, lastOperation: 'updateSwimmer' })
        
        try {
          const { data: updatedSwimmer, error } = await supabase
            .from('nadadores')
            .update(data)
            .eq('id_nadador', id)
            .select()
            .single()
          
          if (error) {
            throw new Error(error.message)
          }
          
          // Optimistic update
          set(state => ({
            swimmers: state.swimmers.map(s => 
              s.id_nadador === id ? updatedSwimmer : s
            ),
            selectedSwimmer: state.selectedSwimmer?.id_nadador === id 
              ? updatedSwimmer 
              : state.selectedSwimmer,
            loading: false,
          }))
          
          // Invalidar cache de detalles
          get().invalidateSwimmer(id)
          
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Error al actualizar nadador',
          })
        }
      },
      
      deleteSwimmer: async (id: number) => {
        set({ loading: true, error: null, lastOperation: 'deleteSwimmer' })
        
        try {
          const { error } = await supabase
            .from('nadadores')
            .delete()
            .eq('id_nadador', id)
          
          if (error) {
            throw new Error(error.message)
          }
          
          // Optimistic update
          set(state => ({
            swimmers: state.swimmers.filter(s => s.id_nadador !== id),
            selectedSwimmer: state.selectedSwimmer?.id_nadador === id 
              ? null 
              : state.selectedSwimmer,
            selectedSwimmerDetails: state.selectedSwimmerDetails?.id_nadador === id 
              ? null 
              : state.selectedSwimmerDetails,
            loading: false,
          }))
          
          // Limpiar cache
          get().invalidateSwimmer(id)
          
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Error al eliminar nadador',
          })
        }
      },
      
      // ===== BÚSQUEDA =====
      
      searchSwimmers: async (filters: SwimmerFilters) => {
        set({ loading: true, error: null, lastOperation: 'searchSwimmers' })
        
        try {
          let query = supabase
            .from('nadadores')
            .select('*', { count: 'exact' })
          
          // Aplicar todos los filtros...
          if (filters.search) {
            query = query.ilike('nombre', `%${filters.search}%`)
          }
          
          if (filters.ageMin) query = query.gte('edad', filters.ageMin)
          if (filters.ageMax) query = query.lte('edad', filters.ageMax)
          if (filters.weightMin) query = query.gte('peso', filters.weightMin)
          if (filters.weightMax) query = query.lte('peso', filters.weightMax)
          
          // Ordenamiento y paginación
          const sortBy = filters.sortBy || 'nombre'
          const direction = filters.sortDirection || 'asc'
          query = query.order(sortBy, { ascending: direction === 'asc' })
          
          const page = filters.page || 1
          const limit = filters.limit || 20
          const offset = (page - 1) * limit
          query = query.range(offset, offset + limit - 1)
          
          const { data, error, count } = await query
          
          if (error) {
            throw new Error(error.message)
          }
          
          const searchResults: ResultadoBusqueda<Nadador> = {
            data: data || [],
            total: count || 0,
            pagina: page,
            limite: limit,
            totalPaginas: Math.ceil((count || 0) / limit),
          }
          
          set({
            searchResults,
            loading: false,
          })
          
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Error en búsqueda',
          })
        }
      },
      
      clearSearchResults: () => {
        set({ searchResults: null })
      },
      
      // ===== SELECCIÓN =====
      
      selectSwimmer: (swimmer: Nadador | null) => {
        set({ 
          selectedSwimmer: swimmer,
          selectedSwimmerDetails: null, // Limpiar detalles al cambiar selección
        })
      },
      
      // ===== CACHE =====
      
      isCacheValid: () => {
        const { lastFetch, cacheExpiry } = get()
        if (!lastFetch) return false
        return Date.now() - lastFetch < cacheExpiry
      },
      
      clearCache: () => {
        set({
          swimmers: [],
          swimmersWithRecords: new Map(),
          searchResults: null,
          lastFetch: null,
        })
      },
      
      invalidateSwimmer: (id: number) => {
        set(state => {
          const newCache = new Map(state.swimmersWithRecords)
          newCache.delete(id)
          return { swimmersWithRecords: newCache }
        })
      },
      
      // ===== UTILIDADES =====
      
      getSwimmerStats: () => {
        const { swimmers, swimmersWithRecords } = get()
        
        const withRecords = swimmersWithRecords.size
        const ages = swimmers.filter(s => s.edad).map(s => s.edad!)
        const avgAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0
        const ageRange = ages.length > 0 
          ? { min: Math.min(...ages), max: Math.max(...ages) }
          : { min: 0, max: 0 }
        
        return {
          total: swimmers.length,
          withRecords,
          avgAge: Math.round(avgAge * 10) / 10,
          ageRange,
        }
      },
      
      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'aqualytics-swimmers-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // Solo persistir datos esenciales, no operaciones temporales
        selectedSwimmer: state.selectedSwimmer,
        swimmersWithRecords: state.swimmersWithRecords,
        lastFetch: state.lastFetch,
      }),
    }
  )
)

// ===== HOOKS AUXILIARES =====

// Hook para operaciones comunes
export const useSwimmerOperations = () => {
  const store = useSwimmersStore()
  return {
    loading: store.loading,
    error: store.error,
    createSwimmer: store.createSwimmer,
    updateSwimmer: store.updateSwimmer,
    deleteSwimmer: store.deleteSwimmer,
    clearError: () => useSwimmersStore.setState({ error: null }),
  }
}

// Hook para selección actual
export const useSelectedSwimmer = () => {
  const store = useSwimmersStore()
  return {
    swimmer: store.selectedSwimmer,
    details: store.selectedSwimmerDetails,
    selectSwimmer: store.selectSwimmer,
    fetchDetails: (withRecords = true) => 
      store.selectedSwimmer 
        ? store.fetchSwimmerById(store.selectedSwimmer.id_nadador, withRecords)
        : Promise.resolve(),
  }
}

// Hook para listado y búsqueda
export const useSwimmersList = () => {
  const store = useSwimmersStore()
  return {
    swimmers: store.swimmers,
    searchResults: store.searchResults,
    loading: store.loading,
    stats: store.getSwimmerStats(),
    fetchSwimmers: store.fetchSwimmers,
    searchSwimmers: store.searchSwimmers,
    clearSearchResults: store.clearSearchResults,
  }
} 