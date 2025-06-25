'use client'

/**
 * Formulario de Métricas Manuales - AquaLytics
 * Entrada de métricas de natación con validación en tiempo real
 */

import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { MetricFormSchema, type MetricFormData } from '@/lib/utils/validators'
import { 
  type Nadador,
  type Competencia
} from '@/lib/types/database'

// ===== TIPOS =====

interface MetricsFormProps {
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

// ===== ICONOS =====

const MetricsIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const SwimmerIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const DistanceIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const StyleIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const PhaseIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

export function MetricsForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  title = 'Registrar Métricas de Natación',
  showCancel = true,
  className = ''
}: MetricsFormProps) {
  
  // Estados para datos de referencia
  const [swimmers, setSwimmers] = useState<Nadador[]>([])
  const [competitions, setCompetitions] = useState<Competencia[]>([])
  const [distances, setDistances] = useState<Array<{ distancia_id: number; distancia: number }>>([])
  const [strokes, setStrokes] = useState<Array<{ estilo_id: number; estilo: string }>>([])
  const [phases, setPhases] = useState<Array<{ fase_id: number; fase: string }>>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Estados para persistencia y feedback
  const [isInternalSubmitting, setIsInternalSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  
  // Clave para localStorage
  const FORM_STORAGE_KEY = 'aqualytics_metrics_form_draft'

  // Configuración del formulario
  const form = useForm<MetricFormData>({
    resolver: zodResolver(MetricFormSchema),
    defaultValues: {
      swimmer_id: 0,
      competition_id: 0,
      date: new Date().toISOString().split('T')[0], // Fecha actual
      distance_id: 0,
      stroke_id: 0,
      phase_id: 0,
      // Valores por defecto para métricas (se completarán en las siguientes subtareas)
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
    },
    mode: 'onChange' // Validación en tiempo real
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    control
  } = form

  // Observar valores para mostrar feedback
  const currentValues = watch()

  // ===== FUNCIONES DE PERSISTENCIA =====
  
  // Guardar estado del formulario en localStorage
  const saveFormState = (data: Partial<MetricFormData>) => {
    try {
      const formState = {
        ...data,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formState))
      setAutoSaveStatus('saved')
      
      // Limpiar estado después de 2 segundos
      setTimeout(() => setAutoSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Error saving form state:', error)
    }
  }

  // Cargar estado del formulario desde localStorage
  const loadFormState = () => {
    try {
      const savedState = localStorage.getItem(FORM_STORAGE_KEY)
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        
        // Verificar que no sea muy antiguo (más de 24 horas)
        const timestamp = new Date(parsedState.timestamp)
        const now = new Date()
        const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)
        
        if (hoursDiff < 24) {
          // Restaurar valores del formulario
          Object.keys(parsedState).forEach(key => {
            if (key !== 'timestamp') {
              setValue(key as keyof MetricFormData, parsedState[key])
            }
          })
          
          console.log('✅ Formulario restaurado desde borrador guardado')
          return true
        } else {
          // Limpiar estado antiguo
          localStorage.removeItem(FORM_STORAGE_KEY)
        }
      }
    } catch (error) {
      console.error('Error loading form state:', error)
      localStorage.removeItem(FORM_STORAGE_KEY)
    }
    return false
  }

  // Limpiar estado guardado
  const clearFormState = () => {
    try {
      localStorage.removeItem(FORM_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing form state:', error)
    }
  }

  // Auto-save cuando cambian los valores del formulario
  useEffect(() => {
    // Debounce para evitar guardar en cada tecla
    const timeoutId = setTimeout(() => {
      // Solo auto-guardar si hay algún valor significativo
      const hasSignificantData = Object.values(currentValues).some(value => 
        value !== 0 && value !== '' && value !== null && value !== undefined
      )
      
      if (hasSignificantData && autoSaveStatus !== 'saving') {
        setAutoSaveStatus('saving')
        saveFormState(currentValues)
      }
    }, 1000) // Guardar 1 segundo después del último cambio

    return () => clearTimeout(timeoutId)
  }, [currentValues, autoSaveStatus])

  // Cargar datos de referencia y restaurar estado del formulario
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setIsLoadingData(true)
        
        // Cargar nadadores desde Supabase
        const swimmersResponse = await fetch('/api/swimmers')
        if (swimmersResponse.ok) {
          const swimmersData = await swimmersResponse.json()
          if (swimmersData.success && swimmersData.data) {
            setSwimmers(swimmersData.data)
          }
        } else {
          console.error('Error loading swimmers:', swimmersResponse.statusText)
        }
        
        // Cargar competencias desde Supabase
        const competitionsResponse = await fetch('/api/competitions')
        if (competitionsResponse.ok) {
          const competitionsData = await competitionsResponse.json()
          if (competitionsData.data) {
            // Adaptar formato de competencias para el formulario
            const formattedCompetitions = competitionsData.data.map((comp: { competencia_id: number; competencia: string; fecha_inicio?: string; fecha_fin?: string }) => ({
              competencia_id: comp.competencia_id,
              competencia: comp.competencia,
              periodo: comp.fecha_inicio && comp.fecha_fin 
                ? `${comp.fecha_inicio} - ${comp.fecha_fin}` 
                : null
            }))
            setCompetitions(formattedCompetitions)
          }
        } else {
          console.error('Error loading competitions:', competitionsResponse.statusText)
        }

        // Cargar distancias desde Supabase
        const distancesResponse = await fetch('/api/reference?type=distancias')
        if (distancesResponse.ok) {
          const distancesData = await distancesResponse.json()
          if (distancesData.data) {
            setDistances(distancesData.data)
          }
        } else {
          console.error('Error loading distances:', distancesResponse.statusText)
        }

        // Cargar estilos desde Supabase
        const strokesResponse = await fetch('/api/reference?type=estilos')
        if (strokesResponse.ok) {
          const strokesData = await strokesResponse.json()
          if (strokesData.data) {
            setStrokes(strokesData.data)
          }
        } else {
          console.error('Error loading strokes:', strokesResponse.statusText)
        }

        // Cargar fases desde Supabase
        const phasesResponse = await fetch('/api/reference?type=fases')
        if (phasesResponse.ok) {
          const phasesData = await phasesResponse.json()
          if (phasesData.data) {
            setPhases(phasesData.data)
          }
        } else {
          console.error('Error loading phases:', phasesResponse.statusText)
        }
        
        // Intentar restaurar estado del formulario después de cargar los datos
        setTimeout(() => {
          const restored = loadFormState()
          if (restored) {
            setSubmitMessage('Borrador restaurado automáticamente')
            setSubmitStatus('success')
            setTimeout(() => setSubmitStatus('idle'), 3000)
          }
        }, 100)
        
      } catch (error) {
        console.error('Error loading reference data:', error)
        setSubmitStatus('error')
        setSubmitMessage('Error al cargar datos de referencia')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadReferenceData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ===== MANEJO AVANZADO DE ENVÍO =====
  
  // Validaciones adicionales antes del envío
  const performAdditionalValidations = (data: MetricFormData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    // Validación de consistencia de tiempos
    const totalSegments = (data.t25_1 || 0) + (data.t25_2 || 0)
    const totalTime = data.t_total || 0
    if (totalTime > 0 && Math.abs(totalSegments - totalTime) > 2) {
      errors.push('Los tiempos de segmentos no son consistentes con el tiempo total')
    }
    
    // Validación de consistencia de brazadas
    const totalSegmentStrokes = (data.brz_1 || 0) + (data.brz_2 || 0)
    const totalStrokes = data.brz_total || 0
    if (totalStrokes > 0 && Math.abs(totalSegmentStrokes - totalStrokes) > 2) {
      errors.push('Las brazadas de segmentos no son consistentes con el total')
    }
    
    // Validación de tiempos T15 vs T25
    if (data.t15_1 > 0 && data.t25_1 > 0 && data.t15_1 >= data.t25_1) {
      errors.push('T15 del primer segmento debe ser menor que T25')
    }
    if (data.t15_2 > 0 && data.t25_2 > 0 && data.t15_2 >= data.t25_2) {
      errors.push('T15 del segundo segmento debe ser menor que T25')
    }
    
    // Validación de campos obligatorios
    if (!data.swimmer_id || data.swimmer_id === 0) {
      errors.push('Debe seleccionar un nadador')
    }
    if (!data.competition_id || data.competition_id === 0) {
      errors.push('Debe seleccionar una competencia')
    }
    
    return { isValid: errors.length === 0, errors }
  }
  
  // Manejar envío del formulario con validación avanzada
  const handleFormSubmit = async (data: MetricFormData) => {
    try {
      setIsInternalSubmitting(true)
      setSubmitStatus('idle')
      setSubmitMessage('')
      
      // Realizar validaciones adicionales
      const validation = performAdditionalValidations(data)
      if (!validation.isValid) {
        setSubmitStatus('error')
        setSubmitMessage(`Errores de validación: ${validation.errors.join(', ')}`)
        return
      }
      
      // Intentar envío
      await onSubmit(data)
      
      // Éxito: limpiar formulario y estado guardado
      setSubmitStatus('success')
      setSubmitMessage('Métricas guardadas exitosamente')
      clearFormState()
      
      // Reset del formulario después de un breve delay
      setTimeout(() => {
        form.reset({
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
        })
        setSubmitStatus('idle')
        setSubmitMessage('')
      }, 2000)
      
    } catch (error) {
      console.error('Error submitting metrics form:', error)
      setSubmitStatus('error')
      setSubmitMessage(
        error instanceof Error 
          ? `Error al guardar: ${error.message}` 
          : 'Error desconocido al guardar las métricas'
      )
    } finally {
      setIsInternalSubmitting(false)
    }
  }
  
  // Función para cancelar y limpiar borrador
  const handleCancel = () => {
    if (window.confirm('¿Estás seguro? Se perderán todos los cambios no guardados.')) {
      clearFormState()
      form.reset()
      setSubmitStatus('idle')
      setSubmitMessage('')
      onCancel?.()
    }
  }

  // Opciones para los selects
  const swimmerOptions = swimmers.map(swimmer => ({
    value: swimmer.id_nadador.toString(),
    label: swimmer.nombre
  }))

  const competitionOptions = competitions.map(competition => ({
    value: competition.competencia_id.toString(),
    label: competition.competencia
  }))

  const distanceOptions = distances.map(distance => ({
    value: distance.distancia_id.toString(),
    label: `${distance.distancia}m`
  }))

  const strokeOptions = strokes.map(stroke => ({
    value: stroke.estilo_id.toString(),
    label: stroke.estilo
  }))

  const phaseOptions = phases.map(phase => ({
    value: phase.fase_id.toString(),
    label: phase.fase
  }))

  if (isLoadingData) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-muted-foreground">Cargando datos...</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MetricsIcon />
          {title}
        </h2>
        <p className="text-muted-foreground mt-1">
          Ingresa las métricas de rendimiento de natación con validación en tiempo real
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        
        {/* Sección: Información Básica */}
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
                name="swimmer_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() || ''}
                    onChange={(value) => field.onChange(Number(value))}
                    placeholder="Seleccionar nadador..."
                    options={swimmerOptions}
                    variant="phoenix"
                    size="md"
                    fullWidth
                    error={errors.swimmer_id?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            {/* Competencia */}
            <div>
              <Controller
                name="competition_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() || ''}
                    onChange={(value) => field.onChange(Number(value))}
                    label="Competencia"
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
                {...register('date')}
                type="date"
                label="Fecha"
                variant="default"
                size="md"
                fullWidth
                required
                startIcon={<CalendarIcon />}
                error={errors.date?.message}
                disabled={isSubmitting}
                helperText="Fecha del registro"
              />
            </div>

            {/* Distancia */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                <DistanceIcon />
                Distancia <span className="text-red-500">*</span>
              </label>
              <Controller
                name="distance_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() || ''}
                    onChange={(value) => field.onChange(Number(value))}
                    placeholder="Seleccionar distancia..."
                    options={distanceOptions}
                    variant="phoenix"
                    size="md"
                    fullWidth
                    error={errors.distance_id?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            {/* Estilo */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                <StyleIcon />
                Estilo <span className="text-red-500">*</span>
              </label>
              <Controller
                name="stroke_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() || ''}
                    onChange={(value) => field.onChange(Number(value))}
                    placeholder="Seleccionar estilo..."
                    options={strokeOptions}
                    variant="warm"
                    size="md"
                    fullWidth
                    error={errors.stroke_id?.message}
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
                    value={field.value?.toString() || ''}
                    onChange={(value) => field.onChange(Number(value))}
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

        {/* Sección: Métricas del Primer Segmento (25m) */}
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Primer Segmento (0-25m)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* T15_1 - Tiempo 15m */}
            <div>
              <Input
                {...register('t15_1', { 
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? 0 : Number(value)
                })}
                type="number"
                step="0.01"
                min="3.00"
                max="30.00"
                label="T15 (1)"
                placeholder="15.25"
                variant="phoenix"
                size="md"
                fullWidth
                required
                startIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                error={errors.t15_1?.message}
                disabled={isSubmitting}
                helperText="Tiempo 15m (seg)"
              />
            </div>

            {/* BRZ_1 - Brazadas */}
            <div>
              <Input
                {...register('brz_1', { 
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? 0 : Number(value)
                })}
                type="number"
                min="1"
                max="100"
                label="BRZ (1)"
                placeholder="12"
                variant="warm"
                size="md"
                fullWidth
                required
                startIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                }
                error={errors.brz_1?.message}
                disabled={isSubmitting}
                helperText="Brazadas (#)"
              />
            </div>

            {/* T25_1 - Tiempo 25m */}
            <div>
              <Input
                {...register('t25_1', { 
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? 0 : Number(value)
                })}
                type="number"
                step="0.01"
                min="5.00"
                max="180.00"
                label="T25 (1)"
                placeholder="28.50"
                variant="phoenix"
                size="md"
                fullWidth
                required
                startIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                error={errors.t25_1?.message}
                disabled={isSubmitting}
                helperText="Tiempo 25m (seg)"
              />
            </div>

            {/* F1 - Flecha/Distancia submarina */}
            <div>
              <Input
                {...register('f1', { 
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? 0 : Number(value)
                })}
                type="number"
                step="0.01"
                min="0.00"
                max="15.00"
                label="F1"
                placeholder="8.50"
                variant="sunset"
                size="md"
                fullWidth
                required
                startIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
                error={errors.f1?.message}
                disabled={isSubmitting}
                helperText="Flecha (metros)"
              />
            </div>
          </div>

          {/* Preview de cálculos en tiempo real para el primer segmento */}
          {currentValues.t25_1 > 0 && (
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">
                📊 Cálculos en Tiempo Real - Segmento 1
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Velocidad:</span>
                  <span className="font-mono text-foreground">
                    {currentValues.t25_1 > 0 ? (25 / currentValues.t25_1).toFixed(2) : '0.00'} m/s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dist. por brazada:</span>
                  <span className="font-mono text-foreground">
                    {currentValues.brz_1 > 0 ? ((25 - (currentValues.f1 || 0)) / currentValues.brz_1).toFixed(2) : '0.00'} m/brz
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">T15 vs T25:</span>
                  <span className={`font-mono ${currentValues.t15_1 < currentValues.t25_1 ? 'text-green-600' : 'text-red-500'}`}>
                    {currentValues.t15_1 > 0 && currentValues.t25_1 > 0 
                      ? (currentValues.t15_1 < currentValues.t25_1 ? '✓ Válido' : '⚠ T15 ≥ T25')
                      : '--'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sección: Métricas del Segundo Segmento (25-50m) */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Segundo Segmento (25-50m)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* T15_2 - Tiempo 15m */}
            <div>
              <Input
                {...register('t15_2', { 
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? 0 : Number(value)
                })}
                type="number"
                step="0.01"
                min="3.00"
                max="30.00"
                label="T15 (2)"
                placeholder="16.75"
                variant="phoenix"
                size="md"
                fullWidth
                required
                startIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                error={errors.t15_2?.message}
                disabled={isSubmitting}
                helperText="Tiempo 15m (seg)"
              />
            </div>

            {/* BRZ_2 - Brazadas */}
            <div>
              <Input
                {...register('brz_2', { 
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? 0 : Number(value)
                })}
                type="number"
                min="1"
                max="100"
                label="BRZ (2)"
                placeholder="14"
                variant="warm"
                size="md"
                fullWidth
                required
                startIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                }
                error={errors.brz_2?.message}
                disabled={isSubmitting}
                helperText="Brazadas (#)"
              />
            </div>

            {/* T25_2 - Tiempo 25m */}
            <div>
              <Input
                {...register('t25_2', { 
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? 0 : Number(value)
                })}
                type="number"
                step="0.01"
                min="5.00"
                max="180.00"
                label="T25 (2)"
                placeholder="30.25"
                variant="phoenix"
                size="md"
                fullWidth
                required
                startIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                error={errors.t25_2?.message}
                disabled={isSubmitting}
                helperText="Tiempo 25m (seg)"
              />
            </div>

            {/* F2 - Flecha/Distancia submarina */}
            <div>
              <Input
                {...register('f2', { 
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? 0 : Number(value)
                })}
                type="number"
                step="0.01"
                min="0.00"
                max="15.00"
                label="F2"
                placeholder="7.25"
                variant="sunset"
                size="md"
                fullWidth
                required
                startIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
                error={errors.f2?.message}
                disabled={isSubmitting}
                helperText="Flecha (metros)"
              />
            </div>
          </div>

          {/* Preview de cálculos en tiempo real para el segundo segmento */}
          {currentValues.t25_2 > 0 && (
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                📊 Cálculos en Tiempo Real - Segmento 2
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Velocidad:</span>
                  <span className="font-mono text-foreground">
                    {currentValues.t25_2 > 0 ? (25 / currentValues.t25_2).toFixed(2) : '0.00'} m/s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dist. por brazada:</span>
                  <span className="font-mono text-foreground">
                    {currentValues.brz_2 > 0 ? ((25 - (currentValues.f2 || 0)) / currentValues.brz_2).toFixed(2) : '0.00'} m/brz
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">T15 vs T25:</span>
                  <span className={`font-mono ${currentValues.t15_2 < currentValues.t25_2 ? 'text-green-600' : 'text-red-500'}`}>
                    {currentValues.t15_2 > 0 && currentValues.t25_2 > 0 
                      ? (currentValues.t15_2 < currentValues.t25_2 ? '✓ Válido' : '⚠ T15 ≥ T25')
                      : '--'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comparación entre Segmentos */}
        {currentValues.t25_1 > 0 && currentValues.t25_2 > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Comparación entre Segmentos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              
              {/* Comparación de Velocidades */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Velocidades</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seg 1:</span>
                    <span className="font-mono">{(25 / currentValues.t25_1).toFixed(2)} m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seg 2:</span>
                    <span className="font-mono">{(25 / currentValues.t25_2).toFixed(2)} m/s</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-muted-foreground">Diferencia:</span>
                    <span className={`font-mono ${(25 / currentValues.t25_2) > (25 / currentValues.t25_1) ? 'text-green-600' : 'text-red-500'}`}>
                      {((25 / currentValues.t25_2) - (25 / currentValues.t25_1) > 0 ? '+' : '')}{((25 / currentValues.t25_2) - (25 / currentValues.t25_1)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparación de Brazadas */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Brazadas</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seg 1:</span>
                    <span className="font-mono">{currentValues.brz_1} brz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seg 2:</span>
                    <span className="font-mono">{currentValues.brz_2} brz</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-muted-foreground">Diferencia:</span>
                    <span className={`font-mono ${currentValues.brz_2 < currentValues.brz_1 ? 'text-green-600' : 'text-red-500'}`}>
                      {currentValues.brz_2 - currentValues.brz_1 > 0 ? '+' : ''}{currentValues.brz_2 - currentValues.brz_1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparación de Flechas */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Flechas</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">F1:</span>
                    <span className="font-mono">{currentValues.f1.toFixed(2)}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">F2:</span>
                    <span className="font-mono">{currentValues.f2.toFixed(2)}m</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-muted-foreground">Promedio:</span>
                    <span className="font-mono text-purple-600">
                      {((currentValues.f1 + currentValues.f2) / 2).toFixed(2)}m
                    </span>
                  </div>
                </div>
              </div>

              {/* Consistencia General */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Consistencia</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Velocidad:</span>
                    <span className={`font-mono ${Math.abs((25 / currentValues.t25_2) - (25 / currentValues.t25_1)) < 0.3 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {Math.abs((25 / currentValues.t25_2) - (25 / currentValues.t25_1)) < 0.3 ? '✓ Buena' : '⚠ Variable'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brazadas:</span>
                    <span className={`font-mono ${Math.abs(currentValues.brz_2 - currentValues.brz_1) <= 2 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {Math.abs(currentValues.brz_2 - currentValues.brz_1) <= 2 ? '✓ Estable' : '⚠ Variable'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <span className="font-mono text-purple-600">
                      {currentValues.t25_2 > currentValues.t25_1 ? '📈 Fatiga' : '⚡ Mejora'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sección: Métricas Globales y Validación */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Métricas Globales y Validación
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* T_TOTAL - Tiempo Total */}
            <div>
              <Input
                {...register('t_total', { 
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? 0 : Number(value)
                })}
                type="number"
                step="0.01"
                min="10.00"
                max="300.00"
                label="Tiempo Total"
                placeholder="57.25"
                variant="phoenix"
                size="md"
                fullWidth
                required
                startIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                error={errors.t_total?.message}
                disabled={isSubmitting}
                helperText="Tiempo total de la prueba (seg)"
              />
            </div>

            {/* BRZ_TOTAL - Brazadas Totales */}
            <div>
              <Input
                {...register('brz_total', { 
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? 0 : Number(value)
                })}
                type="number"
                min="2"
                max="200"
                label="Brazadas Totales"
                placeholder="24"
                variant="warm"
                size="md"
                fullWidth
                required
                startIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                }
                error={errors.brz_total?.message}
                disabled={isSubmitting}
                helperText="Total de brazadas en la prueba"
              />
            </div>
          </div>

          {/* Validaciones y Cálculos Globales */}
          {(currentValues.t_total > 0 || currentValues.brz_total > 0) && (
            <div className="mt-4 space-y-4">
              
              {/* Panel de Validación Cruzada */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Validación Cruzada de Consistencia
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  
                  {/* Validación de Tiempos */}
                  {currentValues.t_total > 0 && currentValues.t25_1 > 0 && currentValues.t25_2 > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-foreground">Consistencia de Tiempos</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Suma segmentos:</span>
                          <span className="font-mono">{(currentValues.t25_1 + currentValues.t25_2).toFixed(2)}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tiempo total:</span>
                          <span className="font-mono">{currentValues.t_total.toFixed(2)}s</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="text-muted-foreground">Diferencia:</span>
                          <span className={`font-mono ${Math.abs(currentValues.t_total - (currentValues.t25_1 + currentValues.t25_2)) <= 2 ? 'text-green-600' : 'text-red-500'}`}>
                            {Math.abs(currentValues.t_total - (currentValues.t25_1 + currentValues.t25_2)) <= 2 
                              ? '✓ Consistente' 
                              : `⚠ ±${Math.abs(currentValues.t_total - (currentValues.t25_1 + currentValues.t25_2)).toFixed(2)}s`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Validación de Brazadas */}
                  {currentValues.brz_total > 0 && currentValues.brz_1 > 0 && currentValues.brz_2 > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-foreground">Consistencia de Brazadas</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Suma segmentos:</span>
                          <span className="font-mono">{currentValues.brz_1 + currentValues.brz_2} brz</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total registrado:</span>
                          <span className="font-mono">{currentValues.brz_total} brz</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="text-muted-foreground">Diferencia:</span>
                          <span className={`font-mono ${Math.abs(currentValues.brz_total - (currentValues.brz_1 + currentValues.brz_2)) <= 2 ? 'text-green-600' : 'text-red-500'}`}>
                            {Math.abs(currentValues.brz_total - (currentValues.brz_1 + currentValues.brz_2)) <= 2 
                              ? '✓ Consistente' 
                              : `⚠ ±${Math.abs(currentValues.brz_total - (currentValues.brz_1 + currentValues.brz_2))}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Panel de Métricas de Rendimiento Global */}
              {currentValues.t_total > 0 && currentValues.brz_total > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Análisis de Rendimiento Global
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    
                    {/* Velocidad Global */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-foreground">Velocidad Global</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Velocidad media:</span>
                          <span className="font-mono text-green-600 font-semibold">
                            {(50 / currentValues.t_total).toFixed(2)} m/s
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ritmo/100m:</span>
                          <span className="font-mono text-foreground">
                            {(currentValues.t_total * 2).toFixed(2)}s
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Eficiencia de Brazada Global */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-foreground">Eficiencia Global</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dist./brazada:</span>
                          <span className="font-mono text-green-600 font-semibold">
                            {((50 - (currentValues.f1 || 0) - (currentValues.f2 || 0)) / currentValues.brz_total).toFixed(2)} m/brz
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Freq. brazada:</span>
                          <span className="font-mono text-foreground">
                            {(currentValues.brz_total / currentValues.t_total).toFixed(2)} brz/s
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Índices de Rendimiento */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-foreground">Índices</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Índice SWOLF:</span>
                          <span className="font-mono text-green-600 font-semibold">
                            {(currentValues.t_total + currentValues.brz_total).toFixed(0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Eficiencia %:</span>
                          <span className="font-mono text-foreground">
                            {(((50 - (currentValues.f1 || 0) - (currentValues.f2 || 0)) / currentValues.brz_total) * 100 / 50).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advertencias de Inconsistencia */}
              {((currentValues.t_total > 0 && currentValues.t25_1 > 0 && currentValues.t25_2 > 0 && 
                 Math.abs(currentValues.t_total - (currentValues.t25_1 + currentValues.t25_2)) > 2) ||
                (currentValues.brz_total > 0 && currentValues.brz_1 > 0 && currentValues.brz_2 > 0 && 
                 Math.abs(currentValues.brz_total - (currentValues.brz_1 + currentValues.brz_2)) > 2)) && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <h5 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    ⚠ Advertencias de Inconsistencia
                  </h5>
                  <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                    {currentValues.t_total > 0 && currentValues.t25_1 > 0 && currentValues.t25_2 > 0 && 
                     Math.abs(currentValues.t_total - (currentValues.t25_1 + currentValues.t25_2)) > 2 && (
                      <li>• Los tiempos de segmentos no coinciden con el tiempo total (diferencia: {Math.abs(currentValues.t_total - (currentValues.t25_1 + currentValues.t25_2)).toFixed(2)}s)</li>
                    )}
                    {currentValues.brz_total > 0 && currentValues.brz_1 > 0 && currentValues.brz_2 > 0 && 
                     Math.abs(currentValues.brz_total - (currentValues.brz_1 + currentValues.brz_2)) > 2 && (
                      <li>• Las brazadas de segmentos no coinciden con el total (diferencia: {Math.abs(currentValues.brz_total - (currentValues.brz_1 + currentValues.brz_2))} brazadas)</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sección de Feedback y Estado */}
        <div className="space-y-3">
          
          {/* Indicador de Auto-Save */}
          {autoSaveStatus !== 'idle' && (
            <div className="flex items-center justify-center gap-2 text-sm">
              {autoSaveStatus === 'saving' && (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-blue-600 dark:text-blue-400">Guardando borrador...</span>
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-600 dark:text-green-400">Borrador guardado automáticamente</span>
                </>
              )}
            </div>
          )}
          
          {/* Feedback de Envío */}
          {submitStatus !== 'idle' && (
            <div className={`p-3 rounded-lg border ${
              submitStatus === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {submitStatus === 'success' ? (
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
                <span className={`text-sm font-medium ${
                  submitStatus === 'success' 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {submitMessage}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="submit"
            variant="phoenix"
            size="lg"
            fullWidth
            startIcon={<SaveIcon />}
            loading={isInternalSubmitting || isSubmitting}
            disabled={!isValid || isInternalSubmitting || isSubmitting}
          >
            {(isInternalSubmitting || isSubmitting) ? 'Guardando...' : 'Guardar Métricas'}
          </Button>
          
          {showCancel && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              disabled={isInternalSubmitting || isSubmitting}
              className="sm:w-auto w-full"
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
} 