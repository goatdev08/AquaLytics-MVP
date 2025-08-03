/**
 * Hook personalizado para gestión de nadadores
 * Incluye operaciones CRUD con manejo de estados básico
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Nadador, SwimmerPerformanceSummary } from '@/lib/types'
import type { SwimmerFormData } from '@/lib/utils/validators'
import toast from 'react-hot-toast'

// ===== TIPOS =====

interface SwimmerListParams {
  search?: string
  limit?: number
  offset?: number
  includeStats?: boolean
}

// El tipo para un nadador con sus estadísticas ahora combina el tipo base y el de la vista.
export type SwimmerWithStats = Nadador & Partial<SwimmerPerformanceSummary>;

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  total?: number
}

interface UseSwimmersOptions {
  includeStats?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

interface SwimmerState {
  swimmers: SwimmerWithStats[]
  isLoading: boolean
  error: string | null
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
}

// ===== FUNCIONES DE API =====

async function fetchSwimmers(params: SwimmerListParams = {}): Promise<SwimmerWithStats[]> {
  const searchParams = new URLSearchParams()
  
  if (params.search) searchParams.append('search', params.search)
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.offset) searchParams.append('offset', params.offset.toString())
  if (params.includeStats) searchParams.append('includeStats', 'true')

  const response = await fetch(`/api/swimmers?${searchParams.toString()}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al obtener nadadores')
  }

  const result: ApiResponse<SwimmerWithStats[]> = await response.json()
  return result.data
}

async function createSwimmer(swimmer: SwimmerFormData): Promise<Nadador> {
  const response = await fetch('/api/swimmers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(swimmer),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al crear nadador')
  }

  const result: ApiResponse<Nadador> = await response.json()
  return result.data
}

async function updateSwimmer(swimmer: Partial<SwimmerFormData> & { id_nadador: number }): Promise<Nadador> {
  const response = await fetch('/api/swimmers', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(swimmer),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al actualizar nadador')
  }

  const result: ApiResponse<Nadador> = await response.json()
  return result.data
}

async function deleteSwimmer(id: number): Promise<void> {
  const response = await fetch(`/api/swimmers?id=${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    // Pasar el status code en el error para un manejo más inteligente
    const err = new Error(error.error || 'Error al eliminar nadador')
    ;(err as any).status = response.status
    throw err
  }
}

// Función para refrescar las vistas materializadas
async function refreshViews() {
  try {
    await fetch('/api/system/refresh-views', { method: 'POST' });
  } catch (error) {
    console.error("Failed to refresh materialized views:", error);
    // No bloqueamos al usuario por esto, pero lo registramos.
  }
}

// ===== HOOK PRINCIPAL =====

export function useSwimmers(options: UseSwimmersOptions = {}) {
  const { includeStats = false, autoRefresh = false, refreshInterval = 30000 } = options
  
  const [state, setState] = useState<SwimmerState>({
    swimmers: [],
    isLoading: true,
    error: null,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  })

  const [revalidationKey, setRevalidationKey] = useState(0);

  // Función para cargar nadadores
  const loadSwimmers = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const swimmers = await fetchSwimmers({ includeStats })
      setState(prev => ({ ...prev, swimmers, isLoading: false }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }))
    }
  }, [includeStats])

  // Cargar nadadores al montar el componente
  useEffect(() => {
    loadSwimmers()
  }, [loadSwimmers, revalidationKey])

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(loadSwimmers, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, loadSwimmers])

  const forceRevalidation = () => {
    setRevalidationKey(prev => prev + 1);
  };

  // Función para crear nadador
  const createSwimmerAsync = useCallback(async (swimmer: SwimmerFormData) => {
    const toastId = toast.loading('Creando nadador...')
    try {
      setState(prev => ({ ...prev, isCreating: true, error: null }))
      
      // Optimistic update
      const optimisticSwimmer: SwimmerWithStats = {
        id_nadador: Date.now(), // ID temporal
        nombre: swimmer.nombre,
        edad: swimmer.edad ?? null,
        peso: swimmer.peso ?? null,
        total_registros: includeStats ? 0 : undefined,
        ultima_competencia: includeStats ? new Date().toISOString() : undefined
      }
      
      setState(prev => ({
        ...prev,
        swimmers: [optimisticSwimmer, ...prev.swimmers]
      }))

      const newSwimmer = await createSwimmer(swimmer)
      
      // Actualizar con datos reales
      setState(prev => ({
        ...prev,
        swimmers: prev.swimmers.map(s => 
          s.id_nadador === optimisticSwimmer.id_nadador ? newSwimmer : s
        ),
        isCreating: false
      }))

      toast.success('Nadador creado exitosamente', { id: toastId })
      forceRevalidation()
      return newSwimmer
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear nadador'
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isCreating: false,
        // Revertir optimistic update
        swimmers: prev.swimmers.filter(s => s.id_nadador !== Date.now())
      }))
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  }, [includeStats, forceRevalidation])

  // Función para actualizar nadador
  const updateSwimmerAsync = useCallback(async (swimmer: Partial<SwimmerFormData> & { id_nadador: number }) => {
    const toastId = toast.loading('Actualizando nadador...')
    try {
      setState(prev => ({ ...prev, isUpdating: true, error: null }))
      
      // Optimistic update
      setState(prev => ({
        ...prev,
        swimmers: prev.swimmers.map(s =>
          s.id_nadador === swimmer.id_nadador
            ? { ...s, ...swimmer }
            : s
        )
      }))

      const updatedSwimmer = await updateSwimmer(swimmer)
      
      setState(prev => ({
        ...prev,
        swimmers: prev.swimmers.map(s =>
          s.id_nadador === swimmer.id_nadador ? updatedSwimmer : s
        ),
        isUpdating: false
      }))

      toast.success('Nadador actualizado exitosamente', { id: toastId })
      forceRevalidation()
      return updatedSwimmer
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar nadador'
      setState(prev => ({ ...prev, error: errorMessage, isUpdating: false }))
      // Recargar datos para revertir optimistic update
      loadSwimmers()
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  }, [includeStats, forceRevalidation])

  // Función para eliminar nadador (con manejo de error 409)
  const deleteSwimmerAsync = useCallback(async (id: number) => {
    const toastId = toast.loading('Eliminando nadador...');
    const originalSwimmers = state.swimmers;

    // Optimistic update
    setState(prev => ({
      ...prev,
      swimmers: prev.swimmers.filter(s => s.id_nadador !== id)
    }));

    try {
      await deleteSwimmer(id);
      toast.success('Nadador eliminado exitosamente', { id: toastId });
      forceRevalidation();

    } catch (error) {
      // Revertir optimistic update
      setState(prev => ({ ...prev, swimmers: originalSwimmers }));

      const err = error as any;
      if (err.status === 409) {
        // Error de conflicto (nadador con registros)
        toast.error(err.message, { id: toastId, duration: 6000 });
      } else {
        // Otro tipo de error
        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar nadador';
        toast.error(errorMessage, { id: toastId });
      }
      throw error;
    }
  }, [state.swimmers, forceRevalidation]);

  // Estados computados
  const isOperating = state.isCreating || state.isUpdating || state.isDeleting
  const hasError = !!state.error

  return {
    // Datos
    swimmers: state.swimmers,
    isLoading: state.isLoading,
    error: state.error,
    hasError,
    
    // Estados de operaciones
    isCreating: state.isCreating,
    isUpdating: state.isUpdating,
    isDeleting: state.isDeleting,
    isOperating,
    
    // Funciones de operación
    createSwimmer: createSwimmerAsync,
    updateSwimmer: updateSwimmerAsync,
    deleteSwimmer: deleteSwimmerAsync,
    refreshSwimmers: loadSwimmers,
    
    // Función para limpiar errores
    clearError: useCallback(() => {
      setState(prev => ({ ...prev, error: null }))
    }, [])
  }
}

// ===== HOOK PARA BÚSQUEDA DE NADADORES =====

export function useSwimmerSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SwimmerWithStats[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Debounce del término de búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  // Realizar búsqueda cuando cambie el término
  useEffect(() => {
    if (debouncedSearchTerm.length < 2) {
      setSearchResults([])
      return
    }

    const searchSwimmers = async () => {
      try {
        setIsSearching(true)
        const results = await fetchSwimmers({ 
          search: debouncedSearchTerm, 
          limit: 20 
        })
        setSearchResults(results)
          } catch (_error) {
      console.error('Error searching swimmers:', _error)
      setSearchResults([])
    } finally {
        setIsSearching(false)
      }
    }

    searchSwimmers()
  }, [debouncedSearchTerm])

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    hasSearchTerm: debouncedSearchTerm.length >= 2
  }
}

// ===== HOOK PARA SELECTOR DE NADADOR =====

export function useSwimmerSelector(initialId?: number) {
  const [selectedSwimmerId, setSelectedSwimmerId] = useState<number | null>(initialId || null)
  const { swimmers } = useSwimmers()

  const selectedSwimmer = useMemo(() => 
    swimmers.find(s => s.id_nadador === selectedSwimmerId) || null,
    [swimmers, selectedSwimmerId]
  )

  const selectSwimmer = useCallback((id: number) => {
    setSelectedSwimmerId(id)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedSwimmerId(null)
  }, [])

  return {
    swimmers,
    selectedSwimmer,
    selectedSwimmerId,
    selectSwimmer,
    clearSelection,
    hasSelection: selectedSwimmerId !== null
  }
} 