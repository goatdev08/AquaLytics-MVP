'use client'

import React from 'react'
import { CSVValidationResult, validateCSVStructure } from '@/lib/utils/csvParser'
import { Card } from '../ui/Card'

interface CSVPreviewProps {
  validationResult: CSVValidationResult
  className?: string
}

export const CSVPreview: React.FC<CSVPreviewProps> = ({
  validationResult,
  className = ''
}) => {
  if (!validationResult.preview) {
    return null
  }

  const preview = validationResult.preview
  const structureValidation = validateCSVStructure(preview)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header con estado de validación */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Preview del Archivo
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          validationResult.isValid 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {validationResult.isValid ? '✅ Válido' : '❌ Con errores'}
        </div>
      </div>

      {/* Métricas del archivo */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Información del Archivo
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Filas:</span>
            <div className="font-medium">{preview.totalRows.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Columnas:</span>
            <div className="font-medium">{preview.totalColumns}</div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Tamaño:</span>
            <div className="font-medium">{(preview.fileSize / 1024).toFixed(1)} KB</div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Codificación:</span>
            <div className="font-medium">{preview.encoding}</div>
          </div>
        </div>
      </Card>

      {/* Score de validación */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Validación de Estructura
          </h4>
          <div className={`text-lg font-bold ${
            structureValidation.score >= 80 ? 'text-green-600' :
            structureValidation.score >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {structureValidation.score}%
          </div>
        </div>
        
        <div className="space-y-2">
          {structureValidation.feedback.map((feedback, index) => (
            <p key={index} className="text-sm text-gray-600 dark:text-gray-300">
              {feedback}
            </p>
          ))}
        </div>
      </Card>

      {/* Errores y warnings */}
      {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
            Validaciones
          </h4>
          
          {/* Errores */}
          {validationResult.errors.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                Errores ({validationResult.errors.length}):
              </h5>
              <ul className="space-y-1">
                {validationResult.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-600 dark:text-red-400 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                Advertencias ({validationResult.warnings.length}):
              </h5>
              <ul className="space-y-1">
                {validationResult.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-600 dark:text-yellow-400 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Preview de columnas */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Estructura de Columnas
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 font-medium text-gray-900 dark:text-gray-100">Columna</th>
                <th className="text-left py-2 font-medium text-gray-900 dark:text-gray-100">Tipo</th>
                <th className="text-left py-2 font-medium text-gray-900 dark:text-gray-100">Muestra</th>
                <th className="text-left py-2 font-medium text-gray-900 dark:text-gray-100">Estado</th>
              </tr>
            </thead>
            <tbody>
              {preview.columns.map((column, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 font-mono text-xs">{column.name}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      column.type === 'date' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      column.type === 'number' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      column.type === 'string' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {column.type}
                    </span>
                  </td>
                  <td className="py-2 font-mono text-xs text-gray-600 dark:text-gray-400 max-w-32 truncate">
                    {column.sample || '(vacío)'}
                  </td>
                  <td className="py-2">
                    {column.isEmpty ? (
                      <span className="text-yellow-600 text-xs">⚠️ Vacía</span>
                    ) : (
                      <span className="text-green-600 text-xs">✅ OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Preview de datos */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Preview de Datos (Primeras 5 filas)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {preview.headers.map((header, index) => (
                  <th key={index} className="text-left py-2 px-2 font-medium text-gray-900 dark:text-gray-100 min-w-20">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="py-2 px-2 text-gray-600 dark:text-gray-400 truncate max-w-24">
                      {cell || '(vacío)'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {preview.totalRows > 5 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            ... y {preview.totalRows - 5} filas más
          </p>
        )}
      </Card>
    </div>
  )
}

export default CSVPreview 