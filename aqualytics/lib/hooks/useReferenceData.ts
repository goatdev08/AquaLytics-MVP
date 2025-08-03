/**
 * Hook para manejar la carga de datos de referencia (nadadores, competencias, etc.)
 * Extraído de MetricsForm.tsx para mejor modularidad
 */

import { useState, useEffect } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { 
  type Nadador,
  type Competencia,
  type Prueba,
  type Fase,
  type Distancia,
  type Metrica
} from '@/lib/types'
import { type MetricFormData } from '@/lib/utils/validators'
import { type SubmitStatus } from '@/lib/types/metricsForm'
import { createLogger } from '@/lib/utils/logger'

const logger = createLogger('ReferenceData')

interface UseReferenceDataParams {
  setValue: UseFormSetValue<MetricFormData>
  setSubmitStatus: (status: SubmitStatus) => void
  setSubmitMessage: (message: string) => void
  loadFormState: () => boolean
}

export function useReferenceData({
  setValue,
  setSubmitStatus,
  setSubmitMessage,
  loadFormState
}: UseReferenceDataParams) {
  
  // Estados para datos de referencia
  const [swimmers, setSwimmers] = useState<Nadador[]>([])
  const [competitions, setCompetitions] = useState<Competencia[]>([])
  const [pruebas, setPruebas] = useState<Prueba[]>([])
  const [phases, setPhases] = useState<Fase[]>([])
  const [distancias, setDistancias] = useState<Distancia[]>([])
  const [metricas, setMetricas] = useState<Metrica[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

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
  }, [loadFormState, setSubmitStatus, setSubmitMessage])

  return {
    swimmers,
    competitions,
    pruebas,
    phases,
    distancias,
    metricas,
    isLoadingData
  }
}