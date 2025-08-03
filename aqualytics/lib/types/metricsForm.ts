/**
 * Tipos específicos para el formulario de métricas de natación
 * Extraídos de MetricsForm.tsx para mejor organización
 */

import { type MetricFormData } from '@/lib/utils/validators'

// ===== INTERFACES DE CÁLCULO =====

export interface CalculationOutput {
  globalMetrics: Partial<GlobalMetrics>;
  perSegmentMetrics: PerSegmentMetrics[];
}

export interface ManualMetricsData {
  tiempo_total?: number;
  brazadas_totales?: number;
  segments: unknown[]; // Simplified for preview payload
}

export interface PerSegmentMetrics {
  segmentLabel: string;
  velocity?: number;
}

export interface GlobalMetrics {
  v_promedio?: number;
  dist_x_brz?: number;
  dist_sin_f?: number;
  f_promedio?: number;
}

// ===== PROPS DEL COMPONENTE PRINCIPAL =====

export interface MetricsFormProps {
  /**
   * Callback cuando el formulario se envía exitosamente
   */
  onSubmit: (data: MetricFormData) => Promise<void>
  
  /**
   * Callback cuando se cancela la operación
   */
  onCancel?: () => void
  
  /**
   * Estado de carga del envío
   */
  isSubmitting?: boolean
  
  /**
   * Título personalizado del formulario
   */
  title?: string
  
  /**
   * Mostrar botón de cancelar
   */
  showCancel?: boolean
  
  /**
   * Clase CSS adicional
   */
  className?: string
}

// ===== PROPS DEL COMPONENTE DE PREVISUALIZACIÓN =====

export interface PreviewProps {
  calculation: CalculationOutput;
  totalTime: number;
  totalStrokes: number;
  segments: import('@/lib/utils/segmentCalculator').Segment[];
}

// ===== TIPOS DE ESTADO =====

export type SubmitStatus = 'idle' | 'success' | 'error'
export type AutoSaveStatus = 'idle' | 'saving' | 'saved'