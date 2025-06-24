/**
 * Tipos específicos para métricas de natación - AquaLytics
 * Incluye formularios, validaciones y cálculos automáticos
 */

import { TipoParametro, MetricaDefinicion } from './database'

// ===== TIPOS PARA FORMULARIOS DE MÉTRICAS =====

export interface MetricFormData {
  // Información básica del registro
  swimmer_id: number
  competition_id: number
  date: string
  distance_id: number
  stroke_id: number
  phase_id: number
  
  // Métricas manuales del primer segmento (25m)
  t15_1: number    // Tiempo 15m primer segmento
  brz_1: number    // Brazadas primer segmento  
  t25_1: number    // Tiempo 25m primer segmento
  f1: number       // Flecha primer segmento
  
  // Métricas manuales del segundo segmento (25m)
  t15_2: number    // Tiempo 15m segundo segmento
  brz_2: number    // Brazadas segundo segmento
  t25_2: number    // Tiempo 25m segundo segmento
  f2: number       // Flecha segundo segmento
  
  // Métricas globales manuales
  t_total: number     // Tiempo total (50m)
  brz_total: number   // Total de brazadas
}

export interface MetricFormErrors {
  swimmer_id?: string
  competition_id?: string
  date?: string
  distance_id?: string
  stroke_id?: string
  phase_id?: string
  
  // Errores de métricas del primer segmento
  t15_1?: string
  brz_1?: string
  t25_1?: string
  f1?: string
  
  // Errores de métricas del segundo segmento
  t15_2?: string
  brz_2?: string
  t25_2?: string
  f2?: string
  
  // Errores de métricas globales
  t_total?: string
  brz_total?: string
  
  // Errores de consistencia
  consistency?: string[]
}

// ===== TIPOS PARA CÁLCULOS AUTOMÁTICOS =====

export interface MetricCalculationInput {
  // Métricas manuales requeridas para cálculos
  t25_1: number
  t25_2: number
  t_total: number
  brz_total: number
  f1: number
  f2: number
  
  // Información adicional
  distance: number  // Distancia total (ej: 50m)
}

export interface AutomaticMetrics {
  v1: number          // Velocidad primer segmento (m/s)
  v2: number          // Velocidad segundo segmento (m/s)
  v_promedio: number  // Velocidad promedio (m/s)
  dist_por_brz: number // Distancia por brazada (m/brazada)
  dist_sin_f: number   // Distancia sin flecha (m)
  f_promedio: number   // Promedio de flecha (m)
}

export interface CalculationResult {
  success: boolean
  automaticMetrics?: AutomaticMetrics
  errors?: string[]
}

// ===== TIPOS PARA VALIDACIONES =====

export interface MetricValidationRule {
  field: keyof MetricFormData
  min: number
  max: number
  decimals?: number
  type: 'number' | 'integer'
  required: boolean
}

export interface ConsistencyRule {
  name: string
  description: string
  validate: (data: Partial<MetricFormData>) => boolean
  errorMessage: string
}

// ===== TIPOS PARA ANÁLISIS DE MÉTRICAS =====

export interface MetricAnalysis {
  metric: MetricaDefinicion
  value: number
  percentile?: number
  rank?: number
  comparison?: {
    personal_best: number
    improvement: number
    trend: 'improving' | 'declining' | 'stable'
  }
}

export interface PerformanceAnalysis {
  swimmer_name: string
  competition: string
  date: string
  distance: number
  stroke: string
  phase: string
  
  // Métricas analizadas
  manual_metrics: MetricAnalysis[]
  automatic_metrics: MetricAnalysis[]
  
  // Análisis general
  overall_score: number
  strengths: string[]
  areas_for_improvement: string[]
}

// ===== TIPOS PARA COMPARACIONES =====

export interface MetricComparison {
  metric_name: string
  swimmer1: {
    name: string
    value: number
    rank?: number
  }
  swimmer2: {
    name: string
    value: number
    rank?: number
  }
  difference: number
  percentage_difference: number
  winner: 'swimmer1' | 'swimmer2' | 'tie'
}

export interface ComparisonResult {
  swimmers: {
    swimmer1: string
    swimmer2: string
  }
  competition: string
  distance: number
  stroke: string
  
  comparisons: MetricComparison[]
  overall_winner: 'swimmer1' | 'swimmer2' | 'tie'
  summary: string
}

// ===== TIPOS PARA PROGRESIÓN TEMPORAL =====

export interface ProgressPoint {
  date: string
  value: number
  competition?: string
  improvement?: number
}

export interface ProgressAnalysis {
  swimmer_name: string
  metric_name: string
  timeframe: {
    start: string
    end: string
  }
  
  data_points: ProgressPoint[]
  trend: 'improving' | 'declining' | 'stable'
  improvement_rate: number // Por día/semana/mes
  best_performance: ProgressPoint
  worst_performance: ProgressPoint
  
  statistics: {
    mean: number
    median: number
    std_deviation: number
    improvement_percentage: number
  }
}

// ===== TIPOS PARA RANKINGS =====

export interface RankingEntry {
  rank: number
  swimmer_name: string
  swimmer_id: number
  value: number
  competition: string
  date: string
  gap_to_leader?: number
  improvement_from_previous?: number
}

export interface RankingResult {
  metric_name: string
  distance: number
  stroke: string
  phase?: string
  timeframe: {
    start: string
    end: string
  }
  
  rankings: RankingEntry[]
  total_swimmers: number
  competition_count: number
}

// ===== TIPOS PARA FILTROS DE MÉTRICAS =====

export interface MetricFilter {
  // Filtros básicos
  swimmers?: number[]
  competitions?: number[]
  distances?: number[]
  strokes?: number[]
  phases?: number[]
  
  // Filtros temporales
  date_from?: string
  date_to?: string
  
  // Filtros de métricas
  metric_types?: TipoParametro[]
  metric_ids?: number[]
  
  // Filtros de valores
  min_value?: number
  max_value?: number
  
  // Opciones de resultado
  limit?: number
  offset?: number
  sort_by?: string
  sort_direction?: 'asc' | 'desc'
}

export interface MetricFilterResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
  filters_applied: MetricFilter
}

// ===== CONSTANTES DE VALIDACIÓN =====

export const METRIC_VALIDATION_RULES: Record<string, MetricValidationRule> = {
  t15_1: { field: 't15_1', min: 3.0, max: 30.0, decimals: 2, type: 'number', required: true },
  t15_2: { field: 't15_2', min: 3.0, max: 30.0, decimals: 2, type: 'number', required: true },
  t25_1: { field: 't25_1', min: 5.0, max: 60.0, decimals: 2, type: 'number', required: true },
  t25_2: { field: 't25_2', min: 5.0, max: 60.0, decimals: 2, type: 'number', required: true },
  t_total: { field: 't_total', min: 10.0, max: 120.0, decimals: 2, type: 'number', required: true },
  brz_1: { field: 'brz_1', min: 1, max: 50, type: 'integer', required: true },
  brz_2: { field: 'brz_2', min: 1, max: 50, type: 'integer', required: true },
  brz_total: { field: 'brz_total', min: 2, max: 100, type: 'integer', required: true },
  f1: { field: 'f1', min: 0.0, max: 15.0, decimals: 2, type: 'number', required: true },
  f2: { field: 'f2', min: 0.0, max: 15.0, decimals: 2, type: 'number', required: true }
} as const

export const CONSISTENCY_RULES: ConsistencyRule[] = [
  {
    name: 'T25_GREATER_THAN_T15_SEGMENT1',
    description: 'T25(1) debe ser mayor que T15(1)',
    validate: (data) => !data.t25_1 || !data.t15_1 || data.t25_1 > data.t15_1,
    errorMessage: 'El tiempo de 25m debe ser mayor que el tiempo de 15m en el primer segmento'
  },
  {
    name: 'T25_GREATER_THAN_T15_SEGMENT2',
    description: 'T25(2) debe ser mayor que T15(2)',
    validate: (data) => !data.t25_2 || !data.t15_2 || data.t25_2 > data.t15_2,
    errorMessage: 'El tiempo de 25m debe ser mayor que el tiempo de 15m en el segundo segmento'
  },
  {
    name: 'TOTAL_TIME_CONSISTENCY',
    description: 'Tiempo total debe ser mayor o igual a la suma de segmentos',
    validate: (data) => {
      if (!data.t_total || !data.t25_1 || !data.t25_2) return true
      return data.t_total >= (data.t25_1 + data.t25_2)
    },
    errorMessage: 'El tiempo total debe ser mayor o igual a la suma de los tiempos de segmentos'
  },
  {
    name: 'TOTAL_STROKES_CONSISTENCY',
    description: 'Brazadas totales debe ser mayor o igual a la suma de segmentos',
    validate: (data) => {
      if (!data.brz_total || !data.brz_1 || !data.brz_2) return true
      return data.brz_total >= (data.brz_1 + data.brz_2)
    },
    errorMessage: 'Las brazadas totales deben ser mayores o iguales a la suma de brazadas por segmento'
  }
] as const

// ===== TIPOS PARA EXPORTACIÓN =====

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel'
  include_metadata: boolean
  include_calculations: boolean
  date_range?: {
    start: string
    end: string
  }
  filters?: MetricFilter
}

export interface ExportResult {
  success: boolean
  file_url?: string
  file_name?: string
  record_count?: number
  error?: string
} 