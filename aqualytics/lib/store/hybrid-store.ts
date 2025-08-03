/**
 * Hybrid Store - Gestión de sincronización entre registros individuales y completos
 * Maneja la estructura híbrida de datos para el MVP
 */

import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { 
  RegistroCompleto, 
  RegistroCompletoTabla,
  Prueba 
} from '@/lib/types/database'
import type { MetricFormData } from '@/lib/types/metrics'

// ===== TIPOS DEL STORE =====

interface HybridStore {
  // Estado de sincronización
  syncStatus: 'idle' | 'syncing' | 'success' | 'error'
  syncError: string | null
  lastSync: number | null
  
  // Estado de modo de registro
  registrationMode: 'individual' | 'complete'
  
  // Datos de pruebas disponibles
  pruebas: Prueba[]
  pruebasLoading: boolean
  
  // ===== OPERACIONES DE SINCRONIZACIÓN =====
  
  // Convertir registros individuales a registro completo
  convertToRegistroCompleto: (
    registros: RegistroCompleto[],
    pruebaId: number
  ) => RegistroCompletoTabla | null
  
  // Convertir registro completo a registros individuales
  convertToRegistrosIndividuales: (
    registroCompleto: RegistroCompletoTabla
  ) => Partial<RegistroCompleto>[]
  
  // Sincronizar cambios entre tablas (manualmente)
  syncRegistros: (
    nadadorId: number,
    fecha: string,
    competenciaId?: number
  ) => Promise<void>
  
  // ===== OPERACIONES DE PRUEBAS =====
  
  // Cargar todas las pruebas disponibles
  fetchPruebas: (filters?: {
    curso?: 'largo' | 'corto'
    estiloId?: number
    distanciaId?: number
  }) => Promise<void>
  
  // ===== MODO DE REGISTRO =====
  
  // Cambiar modo de registro
  setRegistrationMode: (mode: 'individual' | 'complete') => void
  
  // Determinar mejor modo según contexto
  suggestRegistrationMode: (
    tieneMultiplesMetricas: boolean,
    esCompetencia: boolean
  ) => 'individual' | 'complete'
  
  // ===== UTILIDADES =====
  
  // Validar si un conjunto de registros está completo
  isRegistroSetComplete: (registros: RegistroCompleto[]) => boolean
  
  // Agrupar registros por contexto
  groupRegistrosByContext: (
    registros: RegistroCompleto[]
  ) => Map<string, RegistroCompleto[]>
  
  // Reset store
  reset: () => void
}

// ===== ESTADO INICIAL =====

const initialState = {
  syncStatus: 'idle' as const,
  syncError: null,
  lastSync: null,
  registrationMode: 'complete' as const, // Por defecto usar modo completo
  pruebas: [],
  pruebasLoading: false,
}

// ===== FUNCIONES HELPERS =====

// Mapeo de nombres de parámetros a campos de registro completo
const PARAM_TO_FIELD_MAP: Record<string, keyof RegistroCompletoTabla> = {
  'T15_1': 't15_1',
  'BRZ_1': 'brz_1',
  'T25_1': 't25_1',
  'F1': 'f1',
  'T15_2': 't15_2',
  'BRZ_2': 'brz_2',
  'T25_2': 't25_2',
  'F2': 'f2',
  'T_TOTAL': 't_total',
  'BRZ_TOTAL': 'brz_total',
}

// ===== STORE PRINCIPAL =====

export const useHybridStore = create<HybridStore>((set, get) => ({
  ...initialState,
  
  // ===== OPERACIONES DE SINCRONIZACIÓN =====
  
  convertToRegistroCompleto: (registros, pruebaId) => {
    try {
      // Agrupar registros por parámetro
      const metricas: Partial<RegistroCompletoTabla> = {
        prueba_id: pruebaId,
      }
      
      // Tomar valores comunes del primer registro
      if (registros.length > 0) {
        const firstReg = registros[0]
        metricas.id_nadador = firstReg.id_nadador ?? 0
        metricas.fecha = firstReg.fecha ?? ''
        metricas.competencia_id = firstReg.competencia_id || null
        metricas.fase_id = firstReg.fase_id || null
      }
      
      // Mapear cada registro a su campo correspondiente
      registros.forEach(reg => {
        if (reg.parametro && reg.parametro.parametro) {
          const fieldName = PARAM_TO_FIELD_MAP[reg.parametro.parametro]
          if (fieldName && fieldName !== 'prueba_id') {
            (metricas as any)[fieldName] = reg.valor
          }
        }
      })
      
      return metricas as RegistroCompletoTabla
      
    } catch (error) {
      console.error('Error converting to registro completo:', error)
      return null
    }
  },
  
  convertToRegistrosIndividuales: (registroCompleto) => {
    const registros: Partial<RegistroCompleto>[] = []
    
    // Campos comunes para todos los registros
    const commonFields = {
      id_nadador: registroCompleto.id_nadador,
      fecha: registroCompleto.fecha,
      competencia_id: registroCompleto.competencia_id,
      fase_id: registroCompleto.fase_id,
    }
    
    // Crear un registro individual por cada métrica presente
    Object.entries(PARAM_TO_FIELD_MAP).forEach(([paramName, fieldName]) => {
      const valor = (registroCompleto as any)[fieldName]
      if (valor !== null && valor !== undefined) {
        registros.push({
          ...commonFields,
          valor,
          // Nota: parametro_id y segmento deberían ser determinados
          // basándose en el mapeo de parámetros de la BD
        })
      }
    })
    
    return registros
  },
  
  syncRegistros: async (nadadorId, fecha, competenciaId) => {
    set({ syncStatus: 'syncing', syncError: null })
    
    try {
      // Esta función activaría la sincronización manual si es necesaria
      // En el MVP, los triggers de PostgreSQL manejan la sincronización automática
      
      // Marcar como exitoso después de un pequeño delay (simulando proceso)
      setTimeout(() => {
        set({ 
          syncStatus: 'success',
          lastSync: Date.now() 
        })
      }, 500)
      
    } catch (error) {
      set({
        syncStatus: 'error',
        syncError: error instanceof Error ? error.message : 'Error de sincronización'
      })
    }
  },
  
  // ===== OPERACIONES DE PRUEBAS =====
  
  fetchPruebas: async (filters) => {
    set({ pruebasLoading: true })
    
    try {
      let query = supabase
        .from('pruebas')
        .select('*, distancias(*), estilos(*)')
        .order('nombre')
      
      if (filters) {
        if (filters.curso) {
          query = query.eq('curso', filters.curso)
        }
        if (filters.estiloId) {
          query = query.eq('estilo_id', filters.estiloId)
        }
        if (filters.distanciaId) {
          query = query.eq('distancia_id', filters.distanciaId)
        }
      }
      
      const { data, error } = await query
      
      if (error) {
        throw new Error(error.message)
      }
      
      set({
        pruebas: data || [],
        pruebasLoading: false
      })
      
    } catch (error) {
      set({ pruebasLoading: false })
      console.error('Error fetching pruebas:', error)
    }
  },
  
  // ===== MODO DE REGISTRO =====
  
  setRegistrationMode: (mode) => {
    set({ registrationMode: mode })
  },
  
  suggestRegistrationMode: (tieneMultiplesMetricas, esCompetencia) => {
    // Para el MVP, sugerir modo completo para competencias
    // y modo individual para entrenamientos con pocas métricas
    if (esCompetencia || tieneMultiplesMetricas) {
      return 'complete'
    }
    return 'individual'
  },
  
  // ===== UTILIDADES =====
  
  isRegistroSetComplete: (registros) => {
    // Verificar si tenemos al menos las métricas esenciales
    const metricasEsenciales = ['T_TOTAL', 'BRZ_TOTAL']
    const metricasPresentes = new Set(
      registros
        .filter(r => r.parametro?.parametro)
        .map(r => r.parametro!.parametro!)
    )
    
    return metricasEsenciales.every(m => metricasPresentes.has(m))
  },
  
  groupRegistrosByContext: (registros) => {
    const groups = new Map<string, RegistroCompleto[]>()
    
    registros.forEach(reg => {
      const key = `${reg.id_nadador}-${reg.fecha}-${reg.competencia_id || 'null'}-${reg.fase_id || 'null'}`
      const group = groups.get(key) || []
      group.push(reg)
      groups.set(key, group)
    })
    
    return groups
  },
  
  reset: () => {
    set(initialState)
  },
})) 