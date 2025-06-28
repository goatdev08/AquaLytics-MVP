'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MetricsForm } from '@/components/forms/MetricsForm'
import { type MetricFormData } from '@/lib/utils/validators'
import { apiClient } from '@/lib/api/client'

export default function ManualDataEntryPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: MetricFormData) => {
    try {
      setIsSubmitting(true)
      
      // Transformar datos del formulario al formato esperado por el backend
      const processedData = {
        swimmer_id: data.swimmer_id,
        competition_id: data.competition_id,
        date: data.date,
        distance_id: data.distance_id,
        stroke_id: data.stroke_id,
        phase_id: data.phase_id,
        metrics: {
          // Métricas manuales del primer segmento
          t15_1: data.t15_1,
          brz_1: data.brz_1,
          t25_1: data.t25_1,
          f1: data.f1,
          // Métricas manuales del segundo segmento
          t15_2: data.t15_2,
          brz_2: data.brz_2,
          t25_2: data.t25_2,
          f2: data.f2,
          // Métricas globales manuales
          t_total: data.t_total,
          brz_total: data.brz_total
        }
      }

      console.log('📊 Enviando métricas manuales:', processedData)

      // Enviar datos al backend Python para procesamiento y almacenamiento
      const result = await apiClient.submitManualMetrics(processedData)
      
      if (result.success) {
        console.log('✅ Métricas guardadas exitosamente:', result.data)
        
        // Opcional: Mostrar datos calculados automáticamente
        if (result.data?.automaticMetrics) {
          console.log('🧮 Métricas automáticas calculadas:', result.data.automaticMetrics)
        }
        
        // Opcional: Redirigir a la página de visualización o dashboard
        // router.push(`/analytics/swimmer/${data.swimmer_id}`)
      } else {
        throw new Error(result.error || 'Error al procesar métricas')
      }

    } catch (error) {
      console.error('❌ Error al enviar métricas:', error)
      throw error // Re-lanzar para que MetricsForm maneje el error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/data-entry')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-phoenix-red via-phoenix-orange to-phoenix-yellow bg-clip-text text-transparent">
              📝 Entrada Manual de Métricas
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Registra las métricas de natación de forma detallada con validación en tiempo real
          </p>
          
          {/* Breadcrumb navigation */}
          <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <a href="/data-entry" className="hover:text-gray-700 dark:hover:text-gray-200">
              Entrada de Datos
            </a>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-200">Manual</span>
          </div>
        </div>

        {/* Información de ayuda */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            💡 Información Importante
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• <strong>Auto-guardado:</strong> Tus datos se guardan automáticamente mientras escribes</li>
            <li>• <strong>Validación en tiempo real:</strong> Los cálculos se actualizan instantáneamente</li>
            <li>• <strong>Consistencia:</strong> El sistema verifica que los tiempos y brazadas sean coherentes</li>
            <li>• <strong>Métricas automáticas:</strong> Se calcularán velocidades, distancia por brazada y más</li>
          </ul>
        </div>

        {/* Formulario de métricas */}
        <MetricsForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          title="Registrar Métricas de Natación"
          showCancel={true}
          className="phoenix-card"
        />

        {/* Información adicional sobre tramos dinámicos */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            🚧 Próximas Mejoras
          </h3>
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            <p className="mb-2">
              <strong>Tramos dinámicos por distancia:</strong> Próximamente el formulario se adaptará automáticamente según la distancia seleccionada:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>50m:</strong> 2 tramos de 25m (actual)</li>
              <li><strong>100m:</strong> 2 tramos de 50m</li>
              <li><strong>200m:</strong> 4 tramos de 50m</li>
              <li><strong>400m:</strong> 4 tramos de 100m</li>
              <li><strong>800m:</strong> 8 tramos de 100m</li>
              <li><strong>1500m:</strong> 15 tramos de 100m</li>
            </ul>
            <p className="mt-2">
              Las flechas y brazadas siempre se registrarán cada 25m para máxima precisión.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 