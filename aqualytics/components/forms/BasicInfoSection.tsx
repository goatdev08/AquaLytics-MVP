/**
 * Sección de información básica del formulario de métricas
 * Extraída de MetricsForm.tsx para mejor organización
 */

import React from 'react'
import { Controller, Control, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { type MetricFormData } from '@/lib/utils/validators'
import { 
  SwimmerIcon,
  CalendarIcon, 
  DistanceIcon,
  PhaseIcon
} from '@/components/icons/MetricsIcons'

interface BasicInfoSectionProps {
  control: Control<MetricFormData>
  errors: FieldErrors<MetricFormData>
  isSubmitting: boolean
  swimmerOptions: Array<{ value: string; label: string }>
  competitionOptions: Array<{ value: string; label: string }>
  pruebaOptions: Array<{ value: string; label: string }>
  phaseOptions: Array<{ value: string; label: string }>
  register: ReturnType<typeof import('react-hook-form').useForm<MetricFormData>>['register']
}

export function BasicInfoSection({
  control,
  errors,
  isSubmitting,
  swimmerOptions,
  competitionOptions,
  pruebaOptions,
  phaseOptions,
  register
}: BasicInfoSectionProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <SwimmerIcon />
        Información Básica
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Nadador */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
            <SwimmerIcon />
            Nadador <span className="text-red-500">*</span>
          </label>
          <Controller
            name="id_nadador"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? field.value.toString() : ''}
                onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                placeholder="Seleccionar nadador..."
                options={swimmerOptions}
                variant="phoenix"
                size="md"
                fullWidth
                error={errors.id_nadador?.message}
                disabled={isSubmitting}
              />
            )}
          />
        </div>

        {/* Competencia */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Competencia <span className="text-red-500">*</span>
          </label>
          <Controller
            name="competition_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? field.value.toString() : ''}
                onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                placeholder="Seleccionar competencia..."
                options={competitionOptions}
                variant="warm"
                size="md"
                fullWidth
                error={errors.competition_id?.message}
                disabled={isSubmitting}
              />
            )}
          />
        </div>

        {/* Fecha */}
        <div>
          <Input
            {...register('fecha')}
            type="date"
            label="Fecha"
            variant="default"
            size="md"
            fullWidth
            required
            startIcon={<CalendarIcon />}
            error={errors.fecha?.message}
            disabled={isSubmitting}
            helperText="Fecha del registro"
          />
        </div>

        {/* Prueba */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
            <DistanceIcon />
            Prueba <span className="text-red-500">*</span>
          </label>
          <Controller
            name="prueba_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? field.value.toString() : ''}
                onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                placeholder="Seleccionar prueba..."
                options={pruebaOptions}
                variant="phoenix"
                size="md"
                fullWidth
                error={errors.prueba_id?.message}
                disabled={isSubmitting}
              />
            )}
          />
        </div>

        {/* Fase */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
            <PhaseIcon />
            Fase <span className="text-red-500">*</span>
          </label>
          <Controller
            name="phase_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? field.value.toString() : ''}
                onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                placeholder="Seleccionar fase..."
                options={phaseOptions}
                variant="default"
                size="md"
                fullWidth
                error={errors.phase_id?.message}
                disabled={isSubmitting}
              />
            )}
          />
        </div>
      </div>
    </div>
  )
}