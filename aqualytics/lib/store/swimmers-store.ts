/**
 * Swimmers Store - Zustand State Management (MVP Version)
 * Gestión básica de nadadores con operaciones CRUD esenciales
 */

import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Nadador, NuevoNadador, Prueba } from '@/lib/types/database'

// ===== TIPOS DEL STORE =====

interface SwimmersStore {
  // Estado
  swimmers: Nadador[]
  selectedSwimmer: Nadador | null
  selectedPrueba: Prueba | null
  loading: boolean
  error: string | null
  
  // Cache simple
  lastFetch: number | null
  
  // ===== OPERACIONES CRUD =====
  
  // Listar nadadores
  fetchSwimmers: () => Promise<void>
  
  // Obtener nadador específico
  fetchSwimmerById: (id: number) => Promise<void>
  
  // Crear nadador
  createSwimmer: (data: NuevoNadador) => Promise<Nadador | null>
  
  // Actualizar nadador
  updateSwimmer: (id: number, data: Partial<NuevoNadador>) => Promise<void>
  
  // Eliminar nadador
  deleteSwimmer: (id: number) => Promise<void>
  
  // ===== SELECCIÓN =====
  
  // Seleccionar nadador actual
  selectSwimmer: (swimmer: Nadador | null) => void
  
  // Seleccionar prueba actual
  setSelectedPrueba: (prueba: Prueba | null) => void
  
  // Limpiar prueba seleccionada
  clearSelectedPrueba: () => void
  
  // ===== UTILIDADES =====
  
  // Resetear estado
  reset: () => void
}

// ===== ESTADO INICIAL =====

const initialState = {
  swimmers: [],
  selectedSwimmer: null,
  selectedPrueba: null,
  loading: false,
  error: null,
  lastFetch: null,
}

// ===== STORE PRINCIPAL =====

export const useSwimmersStore = create<SwimmersStore>((set, get) => ({
  ...initialState,
  
  // ===== IMPLEMENTACIÓN CRUD =====
  
  fetchSwimmers: async () => {
    set({ loading: true, error: null })
    
    try {
      // Cache simple: si ya cargamos en los últimos 5 minutos, no recargar
      const { lastFetch } = get()
      if (lastFetch && Date.now() - lastFetch < 5 * 60 * 1000) {
        set({ loading: false })
        return
      }
      
      const { data, error } = await supabase
        .from('nadadores')
        .select('*')
        .order('nombre', { ascending: true })
      
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
  
  fetchSwimmerById: async (id: number) => {
    set({ loading: true, error: null })
    
    try {
      const { data: swimmer, error } = await supabase
        .from('nadadores')
        .select('*')
        .eq('id_nadador', id)
        .single()
      
      if (error) {
        throw new Error(error.message)
      }
      
      set({
        selectedSwimmer: swimmer,
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
    set({ loading: true, error: null })
    
    try {
      const { data: newSwimmer, error } = await supabase
        .from('nadadores')
        .insert(data)
        .select()
        .single()
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Actualizar lista local
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
    set({ loading: true, error: null })
    
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
      
      // Actualizar lista local
      set(state => ({
        swimmers: state.swimmers.map(s => 
          s.id_nadador === id ? updatedSwimmer : s
        ),
        selectedSwimmer: state.selectedSwimmer?.id_nadador === id 
          ? updatedSwimmer 
          : state.selectedSwimmer,
        loading: false,
      }))
      
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar nadador',
      })
    }
  },
  
  deleteSwimmer: async (id: number) => {
    set({ loading: true, error: null })
    
    try {
      const { error } = await supabase
        .from('nadadores')
        .delete()
        .eq('id_nadador', id)
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Actualizar lista local
      set(state => ({
        swimmers: state.swimmers.filter(s => s.id_nadador !== id),
        selectedSwimmer: state.selectedSwimmer?.id_nadador === id 
          ? null 
          : state.selectedSwimmer,
        loading: false,
      }))
      
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al eliminar nadador',
      })
    }
  },
  
  // ===== SELECCIÓN =====
  
  selectSwimmer: (swimmer: Nadador | null) => {
    set({ selectedSwimmer: swimmer })
  },
  
  setSelectedPrueba: (prueba: Prueba | null) => {
    set({ selectedPrueba: prueba })
  },
  
  clearSelectedPrueba: () => {
    set({ selectedPrueba: null })
  },
  
  // ===== UTILIDADES =====
  
  reset: () => {
    set(initialState)
  },
})) 