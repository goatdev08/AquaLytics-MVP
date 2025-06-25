/**
 * Formulario de Competencias
 * Crear y editar competencias con validación de fechas
 */

'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import type { Competencia } from '@/lib/types/database'

// Tipo para el formulario
interface CompetitionFormData {
  competencia: string
  fecha_inicio: string
  fecha_fin: string
}

// Schema de validación
const CompetitionFormSchema = z.object({
  competencia: z.string().min(1, 'Nombre de competencia requerido').max(255, 'Máximo 255 caracteres'),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  fecha_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
}).refine((data) => {
  const inicio = new Date(data.fecha_inicio)
  const fin = new Date(data.fecha_fin)
  return inicio <= fin
}, {
  message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin',
  path: ['fecha_fin']
})

// Extender Competencia con fechas procesadas
interface CompetenciaConFechas extends Competencia {
  fecha_inicio?: string
  fecha_fin?: string
}

interface CompetitionFormProps {
  competition?: CompetenciaConFechas // Para edición
  onSubmit: (data: CompetitionFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function CompetitionForm({ 
  competition, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: CompetitionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<CompetitionFormData>({
    resolver: zodResolver(CompetitionFormSchema),
    defaultValues: {
      competencia: competition?.competencia || '',
      fecha_inicio: competition?.fecha_inicio || '',
      fecha_fin: competition?.fecha_fin || ''
    },
    mode: 'onChange'
  })

  const watchedValues = watch()

  const handleFormSubmit = async (data: CompetitionFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting competition form:', error)
    }
  }

  // Calcular duración de la competencia
  const calcularDuracion = () => {
    if (watchedValues.fecha_inicio && watchedValues.fecha_fin) {
      try {
        const inicio = new Date(watchedValues.fecha_inicio)
        const fin = new Date(watchedValues.fecha_fin)
        const diffTime = Math.abs(fin.getTime() - inicio.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        return diffDays
      } catch {
        return null
      }
    }
    return null
  }

  const duracion = calcularDuracion()

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Nombre de competencia */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nombre de la Competencia *
          </label>
          <Input
            {...register('competencia')}
            placeholder="Ej: Campeonato Nacional Junior 2024"
            error={errors.competencia?.message}
            disabled={isSubmitting}
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Fecha de Inicio *
            </label>
            <Input
              {...register('fecha_inicio')}
              type="date"
              error={errors.fecha_inicio?.message}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Fecha de Fin *
            </label>
            <Input
              {...register('fecha_fin')}
              type="date"
              error={errors.fecha_fin?.message}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Vista previa de competencia */}
        {watchedValues.competencia && (
          <CompetitionPreview 
            competencia={watchedValues.competencia}
            fecha_inicio={watchedValues.fecha_inicio}
            fecha_fin={watchedValues.fecha_fin}
            duracion={duracion}
          />
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
          >
            {competition ? 'Actualizar' : 'Crear'} Competencia
          </Button>
        </div>
      </form>
    </div>
  )
}

/**
 * Componente de vista previa de competencia
 */
interface CompetitionPreviewProps {
  competencia: string
  fecha_inicio: string
  fecha_fin: string
  duracion: number | null
}

function CompetitionPreview({ 
  competencia, 
  fecha_inicio, 
  fecha_fin, 
  duracion 
}: CompetitionPreviewProps) {
  const formatearFecha = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return fecha
    }
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-phoenix-blue/5 to-phoenix-purple/5 border-phoenix-blue/20">
      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <span className="text-phoenix-blue">🏆</span>
        Vista Previa de Competencia
      </h4>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-foreground">Nombre: </span>
          <span className="text-muted-foreground">{competencia}</span>
        </div>
        
        {fecha_inicio && (
          <div>
            <span className="font-medium text-foreground">Inicio: </span>
            <span className="text-muted-foreground">{formatearFecha(fecha_inicio)}</span>
          </div>
        )}
        
        {fecha_fin && (
          <div>
            <span className="font-medium text-foreground">Fin: </span>
            <span className="text-muted-foreground">{formatearFecha(fecha_fin)}</span>
          </div>
        )}
        
        {duracion && (
          <div>
            <span className="font-medium text-foreground">Duración: </span>
            <span className="text-phoenix-blue font-medium">
              {duracion} {duracion === 1 ? 'día' : 'días'}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
} 