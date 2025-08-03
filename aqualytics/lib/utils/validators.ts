/**
 * Validadores Frontend UX - AquaLytics
 * Validaciones básicas para UX inmediata. La validación real se hace en backend.
 */

import { z } from 'zod'

// ===== VALIDACIONES UX BÁSICAS =====

export const SwimmerSchema = z.object({
  id_nadador: z.number().min(1, 'ID de nadador inválido').optional(),
  nombre: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'Nombre muy largo'),
  edad: z.number()
    .min(1, 'Edad inválida')
    .max(150, 'Edad inválida')
    .optional(),
  peso: z.number()
    .min(1, 'Peso inválido')
    .max(500, 'Peso inválido')
    .optional()
})

export const CompetitionSchema = z.object({
  competencia_id: z.number().min(1, 'ID de competencia inválido').optional(),
  competencia: z.string()
    .min(1, 'El nombre es requerido')
    .max(200, 'Nombre muy largo'),
  periodo: z.string().min(1, "El periodo es requerido"),
})

// ===== VALIDACIONES UX PARA MÉTRICAS =====

// Validación básica para números positivos
const PositiveNumberSchema = z.number()
  .min(0, 'El valor debe ser positivo')
  .max(9999, 'Valor muy alto')

// Schema para un único segmento de métricas (solo UX básica)
export const SegmentSchema = z.object({
  t15: PositiveNumberSchema.optional(),
  t25_split: PositiveNumberSchema.optional(),
  brz: z.number().min(0, "Brazadas debe ser positivo").int("Debe ser entero").optional(),
  segment_time: PositiveNumberSchema.optional(),
  f: PositiveNumberSchema.optional(),
});

// ===== CAMPOS LEGACY PARA COMPATIBILIDAD TEMPORAL =====
// TODO: Remover una vez que se complete la refactorización

export const LegacyMetricSchema = z.object({
  t25_1: PositiveNumberSchema.optional(),
  t25_2: PositiveNumberSchema.optional(),
  t15_1: PositiveNumberSchema.optional(),
  t15_2: PositiveNumberSchema.optional(),
  brz_1: z.number().int().optional(),
  brz_2: z.number().int().optional(),
  f1: PositiveNumberSchema.optional(),
  f2: PositiveNumberSchema.optional(),
});

// Schema principal para el formulario de métricas (solo campos requeridos UX)
export const MetricFormSchema = z.object({
  id_nadador: z.number().min(1, "Debe seleccionar un nadador").optional(),
  competition_id: z.number().min(1, "Debe seleccionar una competencia").optional(),
  fecha: z.string().min(1, "La fecha es requerida"),
  prueba_id: z.number().min(1, "Debe seleccionar una prueba").optional(),
  phase_id: z.number().min(1, "Debe seleccionar una fase").optional(),
  
  // Array dinámico de segmentos
  segments: z.array(SegmentSchema).optional().default([]),
  
  // Métricas globales
  t_total: z.number().min(0, "Tiempo total debe ser positivo").default(0),
  brz_total: z.number().min(0, "Brazadas totales debe ser positivo").int().default(0),
}).merge(LegacyMetricSchema); // Incluir campos legacy temporalmente

export type MetricFormData = z.infer<typeof MetricFormSchema>;

// ===== TIPOS INFERIDOS (mantenidos para compatibilidad) =====

export type SwimmerFormData = z.infer<typeof SwimmerSchema>
export type CompetitionFormData = z.infer<typeof CompetitionSchema>

// ===== FUNCIONES DE VALIDACIÓN UX =====

export function validateSwimmer(data: unknown): { success: true; data: SwimmerFormData } | { success: false; error: z.ZodError } {
  const result = SwimmerSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

export function validateMetricForm(data: unknown): { success: true; data: MetricFormData } | { success: false; error: z.ZodError } {
  const result = MetricFormSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

// ===== UTILIDADES DE VALIDACIÓN UX =====

export function getFieldError(error: z.ZodError, fieldName: string): string | undefined {
  const fieldError = error.errors.find(err => 
    err.path.includes(fieldName)
  )
  return fieldError?.message
}

export function getAllFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  error.errors.forEach(err => {
    if (err.path.length > 0) {
      const fieldName = err.path[0] as string
      if (!errors[fieldName]) {
        errors[fieldName] = err.message
      }
    }
  })
  return errors
}

export function formatValidationErrors(error: z.ZodError): string[] {
  return error.errors.map(err => {
    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
    return `${path}${err.message}`
  })
}

// ===== MENSAJES DE ERROR UX =====

export const ValidationMessages = {
  REQUIRED: 'Este campo es requerido',
  INVALID_EMAIL: 'Formato de email inválido',
  INVALID_DATE: 'Formato de fecha inválido (YYYY-MM-DD)',
  INVALID_NUMBER: 'Debe ser un número válido',
  INVALID_INTEGER: 'Debe ser un número entero',
  SERVER_VALIDATION: 'Validando en servidor...',
  SWIMMER_NOT_FOUND: 'Nadador no encontrado',
  COMPETITION_NOT_FOUND: 'Competencia no encontrada',
} as const 