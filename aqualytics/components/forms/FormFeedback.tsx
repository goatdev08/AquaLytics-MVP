/**
 * Componente de feedback y estado del formulario
 * Extraído de MetricsForm.tsx para reducir complejidad visual
 */

import React from 'react'
import { type SubmitStatus, type AutoSaveStatus } from '@/lib/types/metricsForm'

interface FormFeedbackProps {
  autoSaveStatus: AutoSaveStatus
  isHidingAutoSave: boolean
  submitStatus: SubmitStatus
  submitMessage: string
}

export function FormFeedback({
  autoSaveStatus,
  isHidingAutoSave,
  submitStatus,
  submitMessage
}: FormFeedbackProps) {
  return (
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
  )
}