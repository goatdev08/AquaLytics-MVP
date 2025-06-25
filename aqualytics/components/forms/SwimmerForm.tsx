'use client'

/**
 * Formulario de Nadadores - AquaLytics
 * Crear y editar nadadores con validación en tiempo real
 */

import React, { useEffect } from 'react'
import { useSwimmerFormValidation } from '@/lib/hooks/useValidation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Nadador } from '@/lib/types/database'
import type { SwimmerFormData } from '@/lib/utils/validators'

// ===== TIPOS =====

interface SwimmerFormProps {
  /**
   * Nadador a editar (undefined para crear nuevo)
   */
  swimmer?: Nadador
  
  /**
   * Callback cuando el formulario se envía exitosamente
   */
  onSubmit: (data: SwimmerFormData) => Promise<void>
  
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

// ===== ICONOS =====

const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const AgeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const WeightIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
)

const SaveIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
)

const CancelIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// ===== COMPONENTE PRINCIPAL =====

export function SwimmerForm({
  swimmer,
  onSubmit,
  onCancel,
  isSubmitting = false,
  title,
  showCancel = true,
  className = ''
}: SwimmerFormProps) {
  
  const {
    form,
    isFormValid,
    isLoading
  } = useSwimmerFormValidation()

  const isEditing = !!swimmer
  const formTitle = title || (isEditing ? 'Editar Nadador' : 'Crear Nadador')

  // Cargar datos del nadador si estamos editando
  useEffect(() => {
    if (swimmer) {
      form.reset({
        nombre: swimmer.nombre,
        edad: swimmer.edad || undefined,
        peso: swimmer.peso || undefined
      })
    } else {
      form.reset({
        nombre: '',
        edad: undefined,
        peso: undefined
      })
    }
  }, [swimmer, form])

  // Manejar envío del formulario
  const handleSubmit = async (data: SwimmerFormData) => {
    try {
      await onSubmit(data)
      if (!isEditing) {
        // Limpiar formulario solo si estamos creando un nuevo nadador
        form.reset()
      }
    } catch (error) {
      // El error se maneja en el componente padre
      console.error('Error submitting swimmer form:', error)
    }
  }

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    watch
  } = form

  // Observar valores para mostrar información en tiempo real
  const watchedValues = watch()

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <UserIcon />
          {formTitle}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isEditing 
            ? 'Actualiza la información del nadador' 
            : 'Completa los datos para crear un nuevo nadador'
          }
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={hookFormSubmit(handleSubmit)} className="space-y-6">
        
        {/* Nombre (Requerido) */}
        <div>
          <Input
            {...register('nombre')}
            label="Nombre completo"
            placeholder="Ej: María González Rodríguez"
            variant="phoenix"
            size="md"
            fullWidth
            required
            startIcon={<UserIcon />}
            error={errors.nombre?.message}
            disabled={isSubmitting}
            helperText="Nombre completo del nadador"
          />
        </div>

        {/* Edad (Opcional) */}
        <div>
          <Input
            {...register('edad', { 
              valueAsNumber: true,
              setValueAs: (value) => value === '' ? undefined : Number(value)
            })}
            type="number"
            label="Edad"
            placeholder="Ej: 25"
            variant="warm"
            size="md"
            fullWidth
            startIcon={<AgeIcon />}
            error={errors.edad?.message}
            disabled={isSubmitting}
            helperText="Edad del nadador (opcional)"
            min="5"
            max="80"
          />
        </div>

        {/* Peso (Opcional) */}
        <div>
          <Input
            {...register('peso', { 
              valueAsNumber: true,
              setValueAs: (value) => value === '' ? undefined : Number(value)
            })}
            type="number"
            label="Peso (kg)"
            placeholder="Ej: 70"
            variant="sunset"
            size="md"
            fullWidth
            startIcon={<WeightIcon />}
            error={errors.peso?.message}
            disabled={isSubmitting}
            helperText="Peso del nadador en kilogramos (opcional)"
            min="20"
            max="200"
            step="0.1"
          />
        </div>

        {/* Vista previa de datos */}
        {watchedValues.nombre && (
          <Card className="p-4 bg-gradient-to-r from-phoenix-orange/5 to-phoenix-yellow/5 border-phoenix-orange/20">
            <h3 className="font-semibold text-foreground mb-2">Vista previa:</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="font-medium">Nombre:</span> {watchedValues.nombre}</p>
              {watchedValues.edad && (
                <p><span className="font-medium">Edad:</span> {watchedValues.edad} años</p>
              )}
              {watchedValues.peso && (
                <p><span className="font-medium">Peso:</span> {watchedValues.peso} kg</p>
              )}
            </div>
          </Card>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            variant="phoenix"
            size="lg"
            fullWidth
            disabled={!isFormValid || isSubmitting}
            loading={isSubmitting}
            startIcon={!isSubmitting ? <SaveIcon /> : undefined}
          >
            {isSubmitting 
              ? 'Guardando...' 
              : isEditing 
                ? 'Actualizar Nadador' 
                : 'Crear Nadador'
            }
          </Button>
          
          {showCancel && onCancel && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              onClick={onCancel}
              disabled={isSubmitting}
              startIcon={<CancelIcon />}
            >
              Cancelar
            </Button>
          )}
        </div>

        {/* Estado de carga del formulario */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner />
            <span className="ml-2 text-muted-foreground">Validando formulario...</span>
          </div>
        )}
      </form>
    </Card>
  )
}

// ===== COMPONENTE DE RESUMEN =====

interface SwimmerSummaryProps {
  swimmer: Nadador
  className?: string
}

/**
 * Componente para mostrar un resumen de la información del nadador
 */
export function SwimmerSummary({ swimmer, className = '' }: SwimmerSummaryProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-r from-phoenix-red to-phoenix-orange rounded-full flex items-center justify-center">
            <UserIcon />
          </div>
        </div>
        
        <div className="flex-grow min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {swimmer.nombre}
          </h3>
          
          <div className="mt-1 space-y-1">
            {swimmer.edad && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <AgeIcon />
                {swimmer.edad} años
              </p>
            )}
            
            {swimmer.peso && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <WeightIcon />
                {swimmer.peso} kg
              </p>
            )}
          </div>
          
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-phoenix-orange/10 text-phoenix-orange">
              ID: {swimmer.id_nadador}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
} 