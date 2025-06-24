/**
 * Validadores Frontend - AquaLytics
 * Esquemas Zod para validación de formularios y datos
 */

import { z } from 'zod'

// ===== ESQUEMAS BASE =====

export const SwimmerSchema = z.object({
  id_nadador: z.number().min(1, 'ID de nadador inválido').optional(),
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  edad: z.number()
    .min(5, 'La edad mínima es 5 años')
    .max(80, 'La edad máxima es 80 años')
    .optional(),
  peso: z.number()
    .min(20, 'El peso mínimo es 20 kg')
    .max(200, 'El peso máximo es 200 kg')
    .optional()
})

export const CompetitionSchema = z.object({
  competencia_id: z.number().min(1, 'ID de competencia inválido').optional(),
  competencia: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  periodo: z.string()
    .min(1, 'El periodo es requerido')
})

// ===== ESQUEMAS DE MÉTRICAS =====

const TimeSchema = z.number()
  .min(5.00, 'El tiempo mínimo es 5.00 segundos')
  .max(180.00, 'El tiempo máximo es 180.00 segundos')
  .multipleOf(0.01, 'Use máximo 2 decimales')

const Time15Schema = z.number()
  .min(3.00, 'El tiempo de 15m mínimo es 3.00 segundos')
  .max(30.00, 'El tiempo de 15m máximo es 30.00 segundos')
  .multipleOf(0.01, 'Use máximo 2 decimales')

const StrokeCountSchema = z.number()
  .int('El número de brazadas debe ser entero')
  .min(1, 'Mínimo 1 brazada')
  .max(100, 'Máximo 100 brazadas')

const UnderwaterDistanceSchema = z.number()
  .min(0.00, 'La distancia mínima es 0.00 metros')
  .max(15.00, 'La distancia máxima es 15.00 metros')
  .multipleOf(0.01, 'Use máximo 2 decimales')

export const MetricFormSchema = z.object({
  // Información básica del registro
  swimmer_id: z.number().min(1, 'Seleccione un nadador'),
  competition_id: z.number().min(1, 'Seleccione una competencia'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  distance_id: z.number().min(1, 'Seleccione una distancia'),
  stroke_id: z.number().min(1, 'Seleccione un estilo'),
  phase_id: z.number().min(1, 'Seleccione una fase'),
  
  // Métricas manuales del primer segmento (25m)
  t15_1: Time15Schema,
  brz_1: StrokeCountSchema,
  t25_1: TimeSchema,
  f1: UnderwaterDistanceSchema,
  
  // Métricas manuales del segundo segmento (25m)
  t15_2: Time15Schema,
  brz_2: StrokeCountSchema,
  t25_2: TimeSchema,
  f2: UnderwaterDistanceSchema,
  
  // Métricas globales manuales
  t_total: TimeSchema,
  brz_total: StrokeCountSchema
}).superRefine((data, ctx) => {
  // Validaciones de consistencia

  // 1. El tiempo total debe ser mayor o igual a la suma de los tiempos por segmento
  const sumTimes = data.t25_1 + data.t25_2
  if (data.t_total < sumTimes) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `El tiempo total (${data.t_total}s) debe ser mayor o igual a la suma de T25(1) + T25(2) (${sumTimes.toFixed(2)}s)`,
      path: ['t_total']
    })
  }

  // 2. El tiempo total no debe exceder significativamente la suma (máximo 10% más)
  const maxAllowedTotal = sumTimes * 1.1
  if (data.t_total > maxAllowedTotal) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `El tiempo total (${data.t_total}s) es excesivamente mayor a la suma de segmentos (${sumTimes.toFixed(2)}s)`,
      path: ['t_total']
    })
  }

  // 3. El total de brazadas debe ser mayor o igual a la suma de brazadas por segmento
  const sumStrokes = data.brz_1 + data.brz_2
  if (data.brz_total < sumStrokes) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `El total de brazadas (${data.brz_total}) debe ser mayor o igual a la suma de BRZ(1) + BRZ(2) (${sumStrokes})`,
      path: ['brz_total']
    })
  }

  // 4. Validar que T15 no sea mayor que T25 en cada segmento
  if (data.t15_1 >= data.t25_1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `T15(1) (${data.t15_1}s) debe ser menor que T25(1) (${data.t25_1}s)`,
      path: ['t15_1']
    })
  }

  if (data.t15_2 >= data.t25_2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `T15(2) (${data.t15_2}s) debe ser menor que T25(2) (${data.t25_2}s)`,
      path: ['t15_2']
    })
  }

  // 5. Validar coherencia de velocidades (segundo segmento no debería ser 50% más rápido)
  const speed1 = 25 / data.t25_1
  const speed2 = 25 / data.t25_2
  const speedDiff = Math.abs(speed2 - speed1) / speed1

  if (speedDiff > 0.5) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Diferencia de velocidad entre segmentos excesiva (${(speedDiff * 100).toFixed(1)}%). Verifique los tiempos.`,
      path: ['t25_2']
    })
  }
})

// ===== ESQUEMAS PARA CSV =====

export const CSVRowSchema = z.object({
  nadador: z.string().min(1, 'Nombre de nadador requerido'),
  competencia: z.string().min(1, 'Competencia requerida'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  distancia: z.number().positive('Distancia debe ser positiva'),
  estilo: z.string().min(1, 'Estilo requerido'),
  fase: z.string().min(1, 'Fase requerida'),
  t15_1: Time15Schema,
  brz_1: StrokeCountSchema,
  t25_1: TimeSchema,
  f1: UnderwaterDistanceSchema,
  t15_2: Time15Schema,
  brz_2: StrokeCountSchema,
  t25_2: TimeSchema,
  f2: UnderwaterDistanceSchema,
  t_total: TimeSchema,
  brz_total: StrokeCountSchema
})

export const CSVDataSchema = z.array(CSVRowSchema).min(1, 'El archivo debe contener al menos un registro')

// ===== ESQUEMAS AUXILIARES =====

export const DateFilterSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido').optional(),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido').optional()
}).refine((data) => {
  if (data.start && data.end) {
    return new Date(data.start) <= new Date(data.end)
  }
  return true
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha final'
})

export const FilterSchema = z.object({
  swimmers: z.array(z.number().positive()).optional(),
  competitions: z.array(z.number().positive()).optional(),
  distances: z.array(z.number().positive()).optional(),
  strokes: z.array(z.number().positive()).optional(),
  phases: z.array(z.number().positive()).optional(),
  dateRange: DateFilterSchema.optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional()
})

// ===== TIPOS INFERIDOS =====

export type SwimmerFormData = z.infer<typeof SwimmerSchema>
export type CompetitionFormData = z.infer<typeof CompetitionSchema>
export type MetricFormData = z.infer<typeof MetricFormSchema>
export type CSVRowData = z.infer<typeof CSVRowSchema>
export type CSVData = z.infer<typeof CSVDataSchema>
export type FilterData = z.infer<typeof FilterSchema>

// ===== FUNCIONES DE VALIDACIÓN =====

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

export function validateCSVData(data: unknown): { success: true; data: CSVData } | { success: false; error: z.ZodError } {
  const result = CSVDataSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

// ===== UTILIDADES DE VALIDACIÓN =====

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

// ===== MENSAJES DE ERROR PERSONALIZADOS =====

export const ValidationMessages = {
  REQUIRED: 'Este campo es requerido',
  INVALID_EMAIL: 'Formato de email inválido',
  INVALID_DATE: 'Formato de fecha inválido (YYYY-MM-DD)',
  INVALID_NUMBER: 'Debe ser un número válido',
  INVALID_INTEGER: 'Debe ser un número entero',
  OUT_OF_RANGE: 'Valor fuera del rango permitido',
  INCONSISTENT_DATA: 'Los datos no son consistentes',
  SWIMMER_NOT_FOUND: 'Nadador no encontrado',
  COMPETITION_NOT_FOUND: 'Competencia no encontrada',
  DUPLICATE_ENTRY: 'Ya existe un registro con estos datos'
} as const 