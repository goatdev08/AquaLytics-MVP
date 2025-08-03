/**
 * Hook para manejar la persistencia automática del formulario en localStorage
 * Extraído de MetricsForm.tsx para mejor reutilización
 */

import { useEffect, useRef, useCallback } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { type MetricFormData } from '@/lib/utils/validators'
import { type AutoSaveStatus } from '@/lib/types/metricsForm'
import { createLogger } from '@/lib/utils/logger'

const logger = createLogger('FormPersistence')

interface UseFormPersistenceParams {
  currentValues: Partial<MetricFormData>
  setValue: UseFormSetValue<MetricFormData>
  setAutoSaveStatus: (status: AutoSaveStatus) => void
  setIsHidingAutoSave: (hiding: boolean) => void
  hasInteractedRef: React.MutableRefObject<boolean>
  storageKey?: string
}

export function useFormPersistence({
  currentValues,
  setValue,
  setAutoSaveStatus,
  setIsHidingAutoSave,
  hasInteractedRef,
  storageKey = 'aqualytics_metrics_form_draft'
}: UseFormPersistenceParams) {
  
  const isSavingRef = useRef(false)

  // ===== FUNCIONES DE PERSISTENCIA =====
  
  // Guardar estado del formulario en localStorage (MEMOIZADO)
  const saveFormState = useCallback((data: Partial<MetricFormData>) => {
    try {
      const formState = {
        ...data,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(storageKey, JSON.stringify(formState))
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
  }, [storageKey, setAutoSaveStatus, setIsHidingAutoSave])

  // Cargar estado del formulario desde localStorage (MEMOIZADO)
  const loadFormState = useCallback(() => {
    try {
      const savedState = localStorage.getItem(storageKey)
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
          localStorage.removeItem(storageKey)
        }
      }
    } catch (error) {
      logger.error('Error loading form state:', error)
      localStorage.removeItem(storageKey)
    }
    return false
  }, [storageKey, setValue])

  // Limpiar estado guardado (MEMOIZADO)
  const clearFormState = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      logger.error('Error clearing form state:', error)
    }
  }, [storageKey])

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
  }, [currentValues, hasInteractedRef, setAutoSaveStatus, saveFormState])

  return {
    saveFormState,
    loadFormState,
    clearFormState
  }
}