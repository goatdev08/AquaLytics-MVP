'use client'

/**
 * Formulario de Métricas Manuales - AquaLytics
 * Entrada de métricas de natación con validación en tiempo real
 */

import React, { useEffect, useState, useRef } from 'react'
import { useForm, Controller, useFieldArray, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { MetricFormSchema, type MetricFormData } from '@/lib/utils/validators'
import { getSplitConfiguration, calculateSegments, type CourseType, type Segment } from '@/lib/utils/segmentCalculator'
import { 
  type Nadador,
  type Competencia,
  type Prueba,
  type Fase,
  type Distancia,
  type Metrica
} from '@/lib/types'
import { SegmentInputGroup } from './SegmentInputGroup'
import { formatTime } from '@/lib/utils/formatters'
import { METRICS_DEFINITIONS } from '@/lib/utils/metrics-mapping'
import { createLogger } from '@/lib/utils/logger'

const logger = createLogger('MetricsForm')

// +++ ADDED: Define types that were previously imported
export interface CalculationOutput {
  globalMetrics: Partial<GlobalMetrics>;
  perSegmentMetrics: PerSegmentMetrics[];
}

export interface ManualMetricsData {
  tiempo_total?: number;
  brazadas_totales?: number;
  segments: any[]; // Simplified for preview payload
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

// ===== COMPONENTE DE PREVISUALIZACIÓN MEJORADO =====
interface PreviewProps {
  calculation: CalculationOutput;
  totalTime: number;
  totalStrokes: number;
  segments: Segment[];
}

const CalculationPreview = React.memo(({ calculation, totalTime, totalStrokes, segments }: PreviewProps) => {
  const { globalMetrics, perSegmentMetrics } = calculation;
  const hasGlobalCalculations = Object.keys(globalMetrics).length > 0;

  return (
    <div className="space-y-4">
      {/* Resumen de Tramos y Métricas Globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-blue-800 dark:text-blue-300">Tramos Configurados</div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {segments.length > 0 ? `${segments.length} x ${segments[0].length}m` : 'N/A'}
          </div>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-sm text-green-800 dark:text-green-300">Tiempo Total</div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400 font-mono">
            {formatTime(totalTime)}
          </div>
        </div>
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-sm text-yellow-800 dark:text-yellow-300">Brazadas Totales</div>
          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
            {totalStrokes}
          </div>
        </div>
      </div>

      {/* Métricas Globales Calculadas */}
      {hasGlobalCalculations && (
         <div>
         <h4 className="font-semibold text-foreground mb-2 mt-4">Métricas Globales Derivadas</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
           {Object.entries(globalMetrics).map(([key, value]) => {
             const metricDef = METRICS_DEFINITIONS.find(m => m.parametro.toLowerCase().replace(/ /g, '_') === key);
             return(
               <div key={key} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex justify-between items-center">
                 <span className="text-sm text-purple-800 dark:text-purple-300">{metricDef?.label || key}</span>
                 <span className="font-bold text-purple-600 dark:text-purple-400">{value?.toFixed(2)} {metricDef?.unit}</span>
               </div>
             )
           })}
         </div>
       </div>
      )}

      {/* Métricas por Tramo Calculadas */}
      {perSegmentMetrics.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-2 mt-4">Métricas por Tramo</h4>
          <div className="space-y-2">
            {perSegmentMetrics.map((metric, index) => (
              <div key={index} className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex justify-between items-center">
                 <span className="text-sm text-indigo-800 dark:text-indigo-300">{metric.segmentLabel} - Velocidad</span>
                 <span className="font-bold text-indigo-600 dark:text-indigo-400">{metric.velocity?.toFixed(3)} m/s</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

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
  const [pruebas, setPruebas] = useState<Prueba[]>([])
  const [phases, setPhases] = useState<Fase[]>([])
  const [distancias, setDistancias] = useState<Distancia[]>([])
  const [metricas, setMetricas] = useState<Metrica[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [dynamicSegments, setDynamicSegments] = useState<Segment[]>([])
  
  // Estados para persistencia y feedback
  const [isInternalSubmitting, setIsInternalSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [isHidingAutoSave, setIsHidingAutoSave] = useState(false)
  const isSavingRef = useRef(false)
  const hasInteractedRef = useRef(false)
  
  // Clave para localStorage
  const FORM_STORAGE_KEY = 'aqualytics_metrics_form_draft'

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
    handleSubmit,
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

  // Observar valores para mostrar feedback y para lógica dinámica
  const currentValues = watch()
  const selectedPruebaId = watch('prueba_id')
  const watchedSegments = watch('segments')
  const watchedTTotal = watch('t_total') 
  const watchedBrzTotal = watch('brz_total')

  const selectedPrueba = pruebas.find(p => p.id === selectedPruebaId);
  const selectedDistancia = distancias.find(d => d.distancia_id === (selectedPrueba as any)?.distancias?.distancia_id);
  const is50mEvent = selectedDistancia?.distancia === 50;

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
      setIsHidingAutoSave(false) // Asegurarse de que no esté ocultándose
      
      // Empezar a ocultar después de 2 segundos
      setTimeout(() => {
        setIsHidingAutoSave(true)
        // Restablecer completamente después de la animación de fade-out
        setTimeout(() => setAutoSaveStatus('idle'), 500) // 500ms para la transición
      }, 2000)
    } catch (error) {
      logger.error('Error saving form state:', error)
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
          
          logger.info('✅ Formulario restaurado desde borrador guardado')
          return true
        } else {
          // Limpiar estado antiguo
          localStorage.removeItem(FORM_STORAGE_KEY)
        }
      }
    } catch (error) {
      logger.error('Error loading form state:', error)
      localStorage.removeItem(FORM_STORAGE_KEY)
    }
    return false
  }

  // Limpiar estado guardado
  const clearFormState = () => {
    try {
      localStorage.removeItem(FORM_STORAGE_KEY)
    } catch (error) {
      logger.error('Error clearing form state:', error)
    }
  }

  // Auto-save cuando cambian los valores del formulario
  useEffect(() => {
    if (!hasInteractedRef.current) return;

    const timeoutId = setTimeout(() => {
      // Solo auto-guardar si hay algún valor significativo
      const hasSignificantData = Object.values(currentValues).some(value => 
        value !== 0 && value !== '' && value !== null && value !== undefined
      )
      
      if (hasSignificantData && !isSavingRef.current) {
        isSavingRef.current = true
        setAutoSaveStatus('saving')
        saveFormState(currentValues)
        // Permitir un nuevo guardado después de que el ciclo se complete
        setTimeout(() => {
            isSavingRef.current = false
        }, 3000) // Coincide con el ciclo de guardado y ocultado
      }
    }, 1000) // Guardar 1 segundo después del último cambio

    return () => clearTimeout(timeoutId)
  }, [currentValues])

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
          logger.error('Error loading swimmers:', swimmersResponse.statusText)
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
          logger.error('Error loading competitions:', competitionsResponse.statusText)
        }

        // Cargar Distancias
        const distanciasResponse = await fetch('/api/reference?type=distancias');
        if (distanciasResponse.ok) {
          const distanciasData = await distanciasResponse.json();
          if (distanciasData.data) {
            setDistancias(distanciasData.data);
          }
        }
        
        // Cargar Fases
        const phasesResponse = await fetch('/api/reference?type=fases');
        if (phasesResponse.ok) {
          const phasesData = await phasesResponse.json();
          logger.info('API Response for Phases:', phasesData);
          if (phasesData && phasesData.data) {
            setPhases(phasesData.data);
          }
        } else {
          logger.error('Error loading phases:', phasesResponse.statusText);
        }

        // Cargar Pruebas desde el nuevo endpoint
        const pruebasResponse = await fetch('/api/pruebas')
        if (pruebasResponse.ok) {
          const pruebasData = await pruebasResponse.json()
          if (pruebasData.data) {
            setPruebas(pruebasData.data)
          }
        } else {
          logger.error('Error loading pruebas:', pruebasResponse.statusText)
        }
        
        // Cargar Métricas desde el nuevo endpoint
        const metricasResponse = await fetch('/api/reference?type=metricas')
        if (metricasResponse.ok) {
          const metricasData = await metricasResponse.json()
          if (metricasData.data) {
            setMetricas(metricasData.data)
          }
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
        logger.error('Error loading reference data:', error)
        setSubmitStatus('error')
        setSubmitMessage('Error al cargar datos de referencia')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadReferenceData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ===== MANEJO AVANZADO DE ENVÍO =====
  
  const performAdditionalValidations = (data: MetricFormData): { isValid: boolean; errors: string[] } => {
    // La validación principal ahora la hace Zod.
    // Esta función puede ser para validaciones complejas que Zod no puede hacer fácilmente,
    // o puede ser eliminada si Zod ya cubre todos los casos.
    // Por ahora, la mantenemos simple.
    return { isValid: true, errors: [] };
  }
  
  // Manejar envío del formulario con validación avanzada
  const handleFormSubmit = async (formData: MetricFormData) => {
    try {
      setIsInternalSubmitting(true);
      
      const metricasPayload: { metrica_id: number; valor: number; segmento?: number }[] = [];

      // Mapeo seguro de nombres a IDs con validación
      const getMetricaId = (name: string): number | null => {
        const metrica = metricas.find(m => m.nombre === name);
        if (!metrica) {
          logger.warn(`⚠️ Métrica no encontrada: "${name}". Métricas disponibles:`, metricas.map(m => m.nombre));
          return null;
        }
        return metrica.metrica_id;
      };

      // Función helper para agregar métricas de forma segura
      const addMetricaSafely = (name: string, valor: number | undefined, segmento?: number) => {
        const metricaId = getMetricaId(name);
        if (metricaId !== null && valor !== undefined && valor > 0) {
          metricasPayload.push({ 
            metrica_id: metricaId, 
            valor, 
            ...(segmento !== undefined && { segmento }) 
          });
        }
      };

      // Procesar métricas por segmento de forma segura
      formData.segments.forEach((segment, index) => {
        addMetricaSafely('Tiempo por Tramo', segment.segment_time, index + 1);
        addMetricaSafely('Brazadas por Tramo', segment.brz, index + 1);
        addMetricaSafely('Flecha por Tramo', segment.f, index + 1);
        addMetricaSafely('Tiempo 15m', segment.t15, index + 1);
        addMetricaSafely('Tiempo 25m', segment.t25_split, index + 1);
      });

      // Procesar métricas globales
      addMetricaSafely('Tiempo Total', formData.t_total);
      addMetricaSafely('Brazadas Totales', formData.brz_total);

      // Validar que tenemos al menos algunas métricas para enviar
      if (metricasPayload.length === 0) {
        throw new Error('No se pudieron procesar las métricas. Verifica que las métricas estén disponibles en la base de datos.');
      }

      const finalPayload = {
        id_nadador: formData.id_nadador,
        prueba_id: formData.prueba_id,
        competencia_id: formData.competition_id,
        fecha: formData.fecha,
        fase_id: formData.phase_id,
        metricas: metricasPayload,
      };
      
      logger.info('✅ Final Payload to be sent:', finalPayload);
      logger.info(`📊 ${metricasPayload.length} métricas procesadas exitosamente`);
      
      await onSubmit(finalPayload as any); // Usamos 'any' temporalmente para pasar al handler de la página
      
      // Éxito: limpiar formulario y estado guardado
      setSubmitStatus('success')
      setSubmitMessage('Métricas guardadas exitosamente')
      clearFormState()
      
      // Reset del formulario después de un breve delay
      setTimeout(() => {
        form.reset({
          id_nadador: undefined as any,
          competition_id: undefined as any,
          fecha: new Date().toISOString().split('T')[0],
          prueba_id: undefined as any,
          phase_id: undefined as any,
          t_total: 0,
          brz_total: 0,
          segments: [],
        })
        setSubmitStatus('idle')
        setSubmitMessage('')
      }, 2000)
      
    } catch (error) {
      logger.error('Error submitting metrics form:', error)
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
          <div className="space-y-3">
            
            {/* Contenedor del Indicador de Auto-Save para evitar layout shift */}
            <div className="h-6 flex items-center justify-center">
              <div className={`transition-opacity duration-500 ${isHidingAutoSave ? 'opacity-0' : 'opacity-100'}`}>
                {autoSaveStatus === 'saving' ? (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    <span className="text-blue-600 dark:text-blue-400">Guardando borrador...</span>
                  </div>
                ) : autoSaveStatus === 'saved' ? (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-600 dark:text-green-400">Borrador guardado automáticamente</span>
                  </div>
                ) : null}
              </div>
            </div>
            
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
    </FormProvider>
  )
} 