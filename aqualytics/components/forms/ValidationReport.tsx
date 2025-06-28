'use client'

import React from 'react'
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface ValidationReportProps {
  totalRows: number
  validRows: number
  errors: string[]
  warnings: string[]
  processingTime?: number
  encoding_detected?: string
  delimiter_detected?: string
  className?: string
}

export default function ValidationReport({
  totalRows,
  validRows,
  errors = [],
  warnings = [],
  processingTime,
  encoding_detected,
  delimiter_detected,
  className = ''
}: ValidationReportProps) {
  const invalidRows = totalRows - validRows
  const successRate = totalRows > 0 ? (validRows / totalRows) * 100 : 0

  return (
    <div className={`rounded-xl border bg-card p-6 shadow-sm dark:bg-gray-800/50 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-foreground">Reporte de Validación</h3>
      
      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-muted-foreground mb-1">Total de filas</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalRows}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-muted-foreground mb-1">Filas válidas</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{validRows}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-muted-foreground mb-1">Filas inválidas</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{invalidRows}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-muted-foreground mb-1">Tasa de éxito</div>
          <div className="text-2xl font-bold text-phoenix-purple dark:text-phoenix-purple">{successRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Información técnica */}
      {(encoding_detected || delimiter_detected || processingTime) && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Información técnica</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            {encoding_detected && (
              <div>
                <span className="text-muted-foreground">Codificación:</span>{' '}
                <span className="font-medium">{encoding_detected}</span>
              </div>
            )}
            {delimiter_detected && (
              <div>
                <span className="text-muted-foreground">Delimitador:</span>{' '}
                <span className="font-medium">{delimiter_detected === ',' ? 'Coma (,)' : delimiter_detected === ';' ? 'Punto y coma (;)' : delimiter_detected}</span>
              </div>
            )}
            {processingTime && (
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tiempo:</span>{' '}
                <span className="font-medium">{(processingTime / 1000).toFixed(1)}s</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Errores */}
      {errors.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <XCircleIcon className="h-5 w-5 text-red-500" />
            <h4 className="font-medium text-red-600 dark:text-red-400">Errores ({errors.length})</h4>
          </div>
          <div className="space-y-2">
            {errors.map((error, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advertencias */}
      {warnings.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
            <h4 className="font-medium text-orange-600 dark:text-orange-400">Advertencias ({warnings.length})</h4>
          </div>
          <div className="space-y-2">
            {warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <span className="text-sm text-orange-700 dark:text-orange-300">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje de éxito si no hay errores */}
      {errors.length === 0 && warnings.length === 0 && validRows > 0 && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-700 dark:text-green-300">¡Validación exitosa!</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Todas las filas pasaron la validación correctamente.
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 