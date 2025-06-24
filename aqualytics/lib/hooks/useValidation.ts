/**
 * Hook personalizado para validación en tiempo real
 * Integra Zod schemas con React Hook Form
 */

import { useCallback, useMemo, useState, useEffect } from 'react'
import { useForm, FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MetricFormSchema,
  SwimmerSchema,
  CompetitionSchema,
  MetricFormData,
  SwimmerFormData,
  CompetitionFormData,
  getAllFieldErrors,
  formatValidationErrors
} from '@/lib/utils/validators'

// ===== TIPOS =====

export interface ValidationState {
  isValid: boolean
  errors: string[]
  fieldErrors: Record<string, string>
  isValidating: boolean
}

export interface UseValidationOptions<T> {
  schema: z.ZodSchema<T>
  onValidationSuccess?: (data: T) => void
  onValidationError?: (errors: z.ZodError) => void
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

// ===== HOOK PRINCIPAL =====

export function useValidation<T>(options: UseValidationOptions<T>) {
  const { schema, onValidationSuccess, onValidationError } = options

  const validateData = useCallback(async (data: unknown): Promise<ValidationState> => {
    try {
      const validatedData = await schema.parseAsync(data)
      onValidationSuccess?.(validatedData)
      
      return {
        isValid: true,
        errors: [],
        fieldErrors: {},
        isValidating: false
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        onValidationError?.(error)
        
        return {
          isValid: false,
          errors: formatValidationErrors(error),
          fieldErrors: getAllFieldErrors(error),
          isValidating: false
        }
      }
      
      return {
        isValid: false,
        errors: ['Error de validación desconocido'],
        fieldErrors: {},
        isValidating: false
      }
    }
  }, [schema, onValidationSuccess, onValidationError])

  const validateField = useCallback(async (fieldName: string, value: unknown): Promise<string | undefined> => {
    try {
      // Validar solo el campo específico usando pick
      if (schema instanceof z.ZodObject) {
        const fieldSchema = schema.pick({ [fieldName]: true } as Record<string, true>)
        await fieldSchema.parseAsync({ [fieldName]: value })
        return undefined
      }
      return undefined
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => err.path.includes(fieldName))
        return fieldError?.message
      }
      return 'Error de validación'
    }
  }, [schema])

  return {
    validateData,
    validateField
  }
}

// ===== HOOKS ESPECÍFICOS PARA FORMULARIOS =====

export function useMetricFormValidation() {
  const form = useForm<MetricFormData>({
    resolver: zodResolver(MetricFormSchema),
    mode: 'onChange',
    defaultValues: {
      swimmer_id: 0,
      competition_id: 0,
      date: new Date().toISOString().split('T')[0],
      distance_id: 0,
      stroke_id: 0,
      phase_id: 0,
      t15_1: 0,
      brz_1: 0,
      t25_1: 0,
      f1: 0,
      t15_2: 0,
      brz_2: 0,
      t25_2: 0,
      f2: 0,
      t_total: 0,
      brz_total: 0
    }
  })

  const { validateField } = useValidation({
    schema: MetricFormSchema,
    validateOnChange: true
  })

  // Validación en tiempo real de consistencia
  const validateConsistency = useCallback((data: Partial<MetricFormData>) => {
    const errors: string[] = []

    // Validar tiempos
    if (data.t25_1 && data.t25_2 && data.t_total) {
      const sumTimes = data.t25_1 + data.t25_2
      if (data.t_total < sumTimes) {
        errors.push(`Tiempo total debe ser ≥ ${sumTimes.toFixed(2)}s`)
      }
    }

    // Validar brazadas
    if (data.brz_1 && data.brz_2 && data.brz_total) {
      const sumStrokes = data.brz_1 + data.brz_2
      if (data.brz_total < sumStrokes) {
        errors.push(`Total brazadas debe ser ≥ ${sumStrokes}`)
      }
    }

    // Validar T15 vs T25
    if (data.t15_1 && data.t25_1 && data.t15_1 >= data.t25_1) {
      errors.push('T15(1) debe ser < T25(1)')
    }
    if (data.t15_2 && data.t25_2 && data.t15_2 >= data.t25_2) {
      errors.push('T15(2) debe ser < T25(2)')
    }

    return errors
  }, [])

  // Estado de validación en tiempo real
  const currentValues = form.watch()
  const consistencyErrors = useMemo(() => 
    validateConsistency(currentValues), 
    [currentValues, validateConsistency]
  )

  const isFormValid = form.formState.isValid && consistencyErrors.length === 0

  return {
    form,
    validateField,
    consistencyErrors,
    isFormValid,
    isLoading: form.formState.isSubmitting,
    isDirty: form.formState.isDirty
  }
}

export function useSwimmerFormValidation() {
  const form = useForm<SwimmerFormData>({
    resolver: zodResolver(SwimmerSchema),
    mode: 'onChange',
    defaultValues: {
      nombre: '',
      edad: undefined,
      peso: undefined
    }
  })

  const { validateField } = useValidation({
    schema: SwimmerSchema,
    validateOnChange: true
  })

  return {
    form,
    validateField,
    isFormValid: form.formState.isValid,
    isLoading: form.formState.isSubmitting,
    isDirty: form.formState.isDirty
  }
}

export function useCompetitionFormValidation() {
  const form = useForm<CompetitionFormData>({
    resolver: zodResolver(CompetitionSchema),
    mode: 'onChange',
    defaultValues: {
      competencia: '',
      periodo: ''
    }
  })

  const { validateField } = useValidation({
    schema: CompetitionSchema,
    validateOnChange: true
  })

  return {
    form,
    validateField,
    isFormValid: form.formState.isValid,
    isLoading: form.formState.isSubmitting,
    isDirty: form.formState.isDirty
  }
}

// ===== UTILIDADES DE VALIDACIÓN =====

export function useFieldError(errors: FieldErrors, fieldName: string): string | undefined {
  const error = errors[fieldName]
  return error?.message as string | undefined
}

export function useFormErrors(errors: FieldErrors): string[] {
  return Object.values(errors)
    .map(error => error?.message)
    .filter(Boolean) as string[]
}

// ===== HOOK PARA VALIDACIÓN ASINCRONA =====

export function useAsyncValidation<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  dependencies: unknown[] = []
) {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: false,
    errors: [],
    fieldErrors: {},
    isValidating: false
  })

  const validate = useCallback(async () => {
    setValidationState((prev: ValidationState) => ({ ...prev, isValidating: true }))
    
    try {
      await schema.parseAsync(data)
      setValidationState({
        isValid: true,
        errors: [],
        fieldErrors: {},
        isValidating: false
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationState({
          isValid: false,
          errors: formatValidationErrors(error),
          fieldErrors: getAllFieldErrors(error),
          isValidating: false
        })
      }
    }
  }, [schema, data])

  useEffect(() => {
    if (data) {
      validate()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validate, data, ...dependencies])

  return validationState
}

// ===== HOOK PARA VALIDACIÓN BATCH (CSV) =====

export function useBatchValidation<T>(schema: z.ZodArray<z.ZodSchema<T>>) {
  const [validationResults, setValidationResults] = useState<{
    validRecords: T[]
    invalidRecords: Array<{ index: number; data: unknown; errors: string[] }>
    summary: {
      total: number
      valid: number
      invalid: number
      validationRate: number
    }
  } | null>(null)

  const validateBatch = useCallback(async (dataArray: unknown[]) => {
    const validRecords: T[] = []
    const invalidRecords: Array<{ index: number; data: unknown; errors: string[] }> = []

    for (let i = 0; i < dataArray.length; i++) {
      try {
        const validated = await schema.element.parseAsync(dataArray[i])
        validRecords.push(validated)
      } catch (error) {
        if (error instanceof z.ZodError) {
          invalidRecords.push({
            index: i,
            data: dataArray[i],
            errors: formatValidationErrors(error)
          })
        }
      }
    }

    const results = {
      validRecords,
      invalidRecords,
      summary: {
        total: dataArray.length,
        valid: validRecords.length,
        invalid: invalidRecords.length,
        validationRate: (validRecords.length / dataArray.length) * 100
      }
    }

    setValidationResults(results)
    return results
  }, [schema])

  return {
    validateBatch,
    validationResults,
    clearResults: () => setValidationResults(null)
  }
} 