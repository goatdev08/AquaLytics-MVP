'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface CSVUploaderProps {
  onFileSelect: (file: File) => void
  onUploadProgress?: (progress: number) => void
  disabled?: boolean
  className?: string
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({
  onFileSelect,
  onUploadProgress: _onUploadProgress,
  disabled = false,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [_isUploading, _setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [_uploadProgress, _setUploadProgress] = useState(0)

  // Validación de archivos CSV
  const validateFile = (file: File): string | null => {
    // Validar tipo de archivo
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return 'Solo se permiten archivos CSV (.csv)'
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return 'El archivo es muy grande. Máximo 10MB permitido.'
    }

    // Validar que no esté vacío
    if (file.size === 0) {
      return 'El archivo está vacío.'
    }

    return null
  }

  // Manejar selección de archivo
  const handleFileSelect = useCallback((file: File) => {
    setError(null)
    
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    onFileSelect(file)
  }, [onFileSelect])

  // Eventos de drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [disabled, handleFileSelect])

  // Manejar input de archivo
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Zona de Drop */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('csv-input')?.click()}
      >
        {/* Input oculto */}
        <input
          id="csv-input"
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Contenido del área de drop */}
        <div className="space-y-4">
          {_isUploading ? (
            <div className="space-y-3">
              <LoadingSpinner size="lg" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Procesando archivo...
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${_uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {_uploadProgress}% completado
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Icono de upload */}
              <div className="mx-auto w-12 h-12 text-gray-400">
                <svg 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                  />
                </svg>
              </div>

              {/* Texto principal */}
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {isDragOver ? '¡Suelta el archivo aquí!' : 'Arrastra tu archivo CSV aquí'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  o haz clic para seleccionar archivo
                </p>
              </div>

              {/* Restricciones */}
              <div className="text-xs text-gray-400 space-y-1">
                <p>• Solo archivos .csv</p>
                <p>• Máximo 10MB</p>
                <p>• Formato: fecha,nadador,competencia,distancia,estilo,fase,métricas...</p>
              </div>

              {/* Botón alternativo */}
              <Button 
                variant="outline" 
                size="sm"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation()
                  document.getElementById('csv-input')?.click()
                }}
              >
                Seleccionar Archivo
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}
    </div>
  )
}

export default CSVUploader 