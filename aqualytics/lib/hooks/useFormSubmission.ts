/**
 * Hook para manejar el envío y validación del formulario de métricas
 * Extraído de MetricsForm.tsx para mejor modularidad
 */

import { UseFormReset } from 'react-hook-form'
import { type MetricFormData } from '@/lib/utils/validators'
import { type SubmitStatus, type MetricsFormProps } from '@/lib/types/metricsForm'
import { type Metrica } from '@/lib/types'
import { createLogger } from '@/lib/utils/logger'

const logger = createLogger('FormSubmission')

interface UseFormSubmissionParams {
  metricas: Metrica[]
  setSubmitStatus: (status: SubmitStatus) => void
  setSubmitMessage: (message: string) => void
  setIsInternalSubmitting: (submitting: boolean) => void
  clearFormState: () => void
  onSubmit: MetricsFormProps['onSubmit']
  onCancel?: MetricsFormProps['onCancel']
  form: {
    reset: UseFormReset<MetricFormData>
  }
}

export function useFormSubmission({
  metricas,
  setSubmitStatus,
  setSubmitMessage,
  setIsInternalSubmitting,
  clearFormState,
  onSubmit,
  onCancel,
  form
}: UseFormSubmissionParams) {

  // Validaciones adicionales (pueden ser eliminadas si Zod cubre todo)
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
      if (onCancel) {
        onCancel()
      }
    }
  }

  return {
    handleFormSubmit,
    handleCancel,
    performAdditionalValidations
  }
}