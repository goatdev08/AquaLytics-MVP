'use client'

/**
 * Formulario de Métricas Manuales - AquaLytics
 * Entrada de métricas de natación con validación en tiempo real
 */

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useForm, useFieldArray, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { MetricFormSchema, type MetricFormData } from '@/lib/utils/validators'
import { getSplitConfiguration, type CourseType, type Segment } from '@/lib/utils/segmentCalculator'
import { SegmentInputGroup } from './SegmentInputGroup'
import { createLogger } from '@/lib/utils/logger'
import { 
  type MetricsFormProps, 
  type CalculationOutput,
  type SubmitStatus,
  type AutoSaveStatus,
  type ManualMetricsData
} from '@/lib/types/metricsForm'
import { 
  MetricsIcon,
  SaveIcon,
  CancelIcon
} from '@/components/icons/MetricsIcons'
import { CalculationPreview } from '@/components/forms/CalculationPreview'
import { useFormPersistence } from '@/lib/hooks/useFormPersistence'
import { useReferenceData } from '@/lib/hooks/useReferenceData'
import { useFormSubmission } from '@/lib/hooks/useFormSubmission'
import { FormFeedback } from '@/components/forms/FormFeedback'
import { BasicInfoSection } from '@/components/forms/BasicInfoSection'

const logger = createLogger('MetricsForm')





// ===== COMPONENTE PRINCIPAL =====

export function MetricsForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  title = 'Registrar Métricas de Natación',
  showCancel = true,
  className = ''
}: MetricsFormProps) {
  
  // Estados locales del formulario
  const [dynamicSegments, setDynamicSegments] = useState<Segment[]>([])
  const [isInternalSubmitting, setIsInternalSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle')
  const [isHidingAutoSave, setIsHidingAutoSave] = useState(false)
  const hasInteractedRef = useRef(false)

  // Configuración del formulario
  const form = useForm<MetricFormData>({
    resolver: zodResolver(MetricFormSchema),
    defaultValues: {
      id_nadador: undefined as any,
      competition_id: undefined as any,
      fecha: new Date().toISOString().split('T')[0],
      prueba_id: undefined as any,
      phase_id: undefined as any,
      t_total: 0,
      brz_total: 0,
      segments: [],
    },
    mode: 'onChange'
  })

  const {
    register,
    formState: { errors, isValid },
    setValue,
    watch,
    control
  } = form

  // Configurar el array de campos dinámicos para los segmentos
  const { fields, append, remove } = useFieldArray({
    control,
    name: "segments",
  });

  // Observar valores para mostrar feedback y para lógica dinámica (MEMOIZADO para evitar loops)
  const currentValues = useMemo(() => watch(), [watch])

  // Hook de persistencia
  const { loadFormState: loadFormStateRaw, clearFormState } = useFormPersistence({
    currentValues,
    setValue,
    setAutoSaveStatus,
    setIsHidingAutoSave,
    hasInteractedRef
  })

  // Memoizar loadFormState para evitar re-renders en useReferenceData
  const loadFormState = useCallback(() => {
    return loadFormStateRaw()
  }, [loadFormStateRaw])

  // Hook de datos de referencia
  const { 
    swimmers, 
    competitions, 
    pruebas, 
    phases, 
    distancias, 
    metricas, 
    isLoadingData 
  } = useReferenceData({
    setValue,
    setSubmitStatus,
    setSubmitMessage,
    loadFormState
  })

  // Hook de envío del formulario
  const { handleFormSubmit, handleCancel } = useFormSubmission({
    metricas,
    setSubmitStatus,
    setSubmitMessage,
    setIsInternalSubmitting,
    clearFormState,
    onSubmit,
    onCancel,
    form
  })
  const selectedPruebaId = watch('prueba_id')
  const watchedSegments = watch('segments')
  const watchedTTotal = watch('t_total') 
  const watchedBrzTotal = watch('brz_total')

  const selectedPrueba = pruebas.find(p => p.id === selectedPruebaId);
  const selectedDistancia = distancias.find(d => d.distancia_id === (selectedPrueba as any)?.distancias?.distancia_id);

  // Estado para la previsualización de métricas automáticas
  const [calculationResult, setCalculationResult] = useState<CalculationOutput>({ globalMetrics: {}, perSegmentMetrics: [] });

  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lógica para actualizar los segmentos dinámicamente
  useEffect(() => {


    // No procesar si no hay una prueba seleccionada válida o los datos de referencia no han cargado
    if (!selectedPruebaId || pruebas.length === 0 || distancias.length === 0) {

      if (fields.length > 0) remove();
      return;
    }



    const currentPrueba = pruebas.find(p => p.id === selectedPruebaId);
    const currentDistancia = distancias.find(d => d.distancia_id === (currentPrueba as any)?.distancias?.distancia_id);





    if (currentPrueba && currentDistancia && currentDistancia.distancia && currentPrueba.curso) {

      const splitConfig = getSplitConfiguration(currentDistancia.distancia, currentPrueba.curso as CourseType);
      

      
      setDynamicSegments(splitConfig.segments);
      
      const currentSegmentCount = fields.length;
      const newSegmentCount = splitConfig.segments.length;



      if (currentSegmentCount !== newSegmentCount) {

        // Reemplazar todos los segmentos para evitar inconsistencias
        remove();
        const segmentsToAdd = Array.from({ length: newSegmentCount }, () => ({
          t15: 0,
          brz: 0,
          segment_time: 0,
          f: 0,
          t25_split: 0
        }));

        append(segmentsToAdd, { shouldFocus: false });

      } else {

      }
    } else {

    }
  }, [selectedPruebaId, pruebas, distancias, append, remove, fields.length]);

  // Auto-rellenar, calcular t_total, brz_total Y previsualizar métricas automáticas
  useEffect(() => {
    
    const segments = currentValues.segments || [];
    if (selectedPrueba && selectedDistancia) {
      const is50mCL = selectedDistancia.distancia === 50 && selectedPrueba.curso === 'largo';
      
      let totalTime = 0;
      let totalStrokes = 0;
      
      if (segments.length > 0) {
        if (is50mCL) {
          totalTime = segments[0]?.segment_time || 0;
          totalStrokes = segments[0]?.brz || 0;
        } else {
          totalTime = segments.reduce((acc, seg) => acc + (seg?.segment_time || 0), 0);
          totalStrokes = segments.reduce((acc, seg) => acc + (seg?.brz || 0), 0);
        }
      }
      setValue('t_total', totalTime);
      setValue('brz_total', totalStrokes);

      // Clear previous timeout
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }

      // Debounce the API call
      previewTimeoutRef.current = setTimeout(async () => {
        // Recolectar datos para cálculo de preview
        const manualMetricsPayload: ManualMetricsData = {
          tiempo_total: totalTime,
          brazadas_totales: totalStrokes,
          segments: dynamicSegments.map((seg, i) => ({
            ...(currentValues.segments?.[i] || {}),
            length: seg.length,
          }))
        };
        

        
        try {
          const response = await fetch('/api/preview/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              manual_metrics: manualMetricsPayload,
              distancia_total: selectedDistancia?.distancia || 50
            })
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setCalculationResult(result.data);
            } else {
              setCalculationResult({ globalMetrics: {}, perSegmentMetrics: [] });
            }
          } else {
            logger.error("Error fetching preview calculations");
            setCalculationResult({ globalMetrics: {}, perSegmentMetrics: [] });
          }
        } catch (error) {
          logger.error("Failed to fetch preview:", error);
          setCalculationResult({ globalMetrics: {}, perSegmentMetrics: [] });
        }
      }, 500); // 500ms debounce
    }

    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    }
  }, [JSON.stringify(watchedSegments), watchedTTotal, watchedBrzTotal, selectedPrueba?.id, selectedDistancia?.distancia_id, dynamicSegments.length]);

  // Limpiar previsualización cuando cambien los campos básicos del formulario
  useEffect(() => {
    // Solo limpiar si había una previsualización previa
    if (calculationResult.globalMetrics && Object.keys(calculationResult.globalMetrics).length > 0) {
      setCalculationResult({ globalMetrics: {}, perSegmentMetrics: [] });
    }
  }, [currentValues.id_nadador, currentValues.competition_id, currentValues.prueba_id, currentValues.phase_id]);







  // Opciones para los selects
  const swimmerOptions = swimmers.map(swimmer => ({
    value: swimmer.id_nadador.toString(),
    label: swimmer.nombre
  }))

  const competitionOptions = competitions.map(competition => ({
    value: competition.competencia_id.toString(),
    label: competition.competencia
  }))

  const pruebaOptions = pruebas.map(prueba => ({
    value: prueba.id.toString(),
    label: `${prueba.nombre} (${prueba.curso === 'largo' ? 'CL' : 'CC'})`
  }))

  const phaseOptions = phases.map(phase => ({
    value: phase.fase_id.toString(),
    label: phase.nombre
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
    <FormProvider {...form}>
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
        <form 
          onBlur={() => { if (!hasInteractedRef.current) hasInteractedRef.current = true; }}
          onSubmit={form.handleSubmit(handleFormSubmit)} 
          className="space-y-6"
        >
          
          {/* Sección: Información Básica */}
          <BasicInfoSection 
            control={control}
            errors={errors}
            isSubmitting={isSubmitting}
            swimmerOptions={swimmerOptions}
            competitionOptions={competitionOptions}
            pruebaOptions={pruebaOptions}
            phaseOptions={phaseOptions}
            register={register}
          />

          {/* Sección de Métricas por Segmento (Ahora Dinámica y Real) */}
          <div className="space-y-4">

            
            {fields.length === 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Selecciona una prueba para ver las opciones de métricas por segmento
                </p>
              </div>
            )}
            
            {fields.map((field, index) => (
              <SegmentInputGroup
                key={field.id}
                segmentIndex={index}
                segment={dynamicSegments[index]}
                distancia={selectedDistancia}
                prueba={selectedPrueba}
              />
            ))}
          </div>

          {/* Sección de Previsualización de Cálculos (Unificada) */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Previsualización de Cálculos
            </h3>
            <CalculationPreview 
              calculation={calculationResult}
              totalTime={watch('t_total')} 
              totalStrokes={watch('brz_total')}
              segments={dynamicSegments}
            />
          </div>

          {/* Bloque de depuración temporal */}
          {process.env.NODE_ENV === 'development' && Object.keys(errors).length > 0 && (
            <Card className="p-4 mt-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
              <h4 className="font-bold text-red-700 dark:text-red-300">Errores de Validación Activos:</h4>
              <pre className="text-xs text-red-600 dark:text-red-400 mt-2 whitespace-pre-wrap">
                {JSON.stringify(errors, null, 2)}
              </pre>
            </Card>
          )}

          {/* Sección de Feedback y Estado */}
          <FormFeedback 
            autoSaveStatus={autoSaveStatus}
            isHidingAutoSave={isHidingAutoSave}
            submitStatus={submitStatus}
            submitMessage={submitMessage}
          />

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
    </FormProvider>
  )
} 