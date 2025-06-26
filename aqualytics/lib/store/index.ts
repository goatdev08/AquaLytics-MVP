/**
 * Store Index - Exportaciones centralizadas y configuración
 * Punto de entrada único para todos los stores de Zustand
 */

// ===== EXPORTACIONES DE STORES =====

// Swimmers Store
export { useSwimmersStore } from './swimmers-store'

// Metrics Store  
export { useMetricsStore } from './metrics-store'

// UI Store
export { useUIStore } from './ui-store'

// ===== CONFIGURACIÓN DE STORES =====

/**
 * Configuración global de persistencia para todos los stores
 */
export const STORE_CONFIG = {
  // Configuración de cache
  CACHE_EXPIRY: {
    SWIMMERS: 5 * 60 * 1000, // 5 minutos
    METRICS: 3 * 60 * 1000,  // 3 minutos
    UI: 24 * 60 * 60 * 1000, // 24 horas (preferencias)
  },
  
  // Configuración de storage
  STORAGE: {
    SWIMMERS: 'sessionStorage', // Datos de sesión
    METRICS: 'sessionStorage',  // Datos de sesión
    UI: 'localStorage',         // Preferencias persistentes
  },
  
  // Configuración de devtools
  DEVTOOLS: {
    ENABLED: process.env.NODE_ENV === 'development',
    LOGGING: process.env.NODE_ENV === 'development',
  },
} as const 