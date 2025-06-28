'use client'

import { useState, useEffect } from 'react'
import CSVUploader from '@/components/forms/CSVUploader'
import CSVPreview from '@/components/forms/CSVPreview'
import ValidationReport from '@/components/forms/ValidationReport'
import { Button } from '../../../components/ui/Button'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { parseCSVFile, CSVValidationResult } from '../../../lib/utils/csvParser'
import { apiClient } from '../../../lib/api/client'

interface RowValidationError {
  row_number: number
  column: string
  error_type: string
  value: unknown
  message: string
}

interface ValidationSummary {
  totalRowErrors: number
  criticalErrors: number
  anomalyCount: number
}

interface SampleDataRow {
  nadador: string
  t_total: number
  v1: number
  v2: number
  v_promedio: number
  dist_x_brz: number
  f_promedio: number
  [key: string]: unknown
}

interface ProcessingResult {
  success: boolean
  message: string
  data?: {
    processedRows: number
    totalRows?: number // Opcional para compatibilidad
    validRows?: number // Opcional para compatibilidad
    errors: string[]
    warnings: string[]
    processingTime: number
    encoding_detected?: string
    delimiter_detected?: string
    sampleData?: SampleDataRow[]
    automaticMetrics?: {
      calculated: number
      types: string[]
    }
    // NUEVAS características de validación granular
    rowErrors?: RowValidationError[]
    anomalies?: string[]
    validationSummary?: ValidationSummary
  }
  error?: string
}

export default function DataEntryPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<CSVValidationResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking')

  const handleFileSelect = async (file: File) => {
    console.log('📄 Archivo seleccionado:', file.name)
    setSelectedFile(file)
    setValidationResult(null)
    setProcessingResult(null)

    try {
      // Parsear y validar archivo automáticamente
      const result = await parseCSVFile(file)
      setValidationResult(result)
      console.log('📊 Validación completada:', {
        isValid: result.isValid,
        errors: result.errors.length,
        warnings: result.warnings.length
      })
    } catch (_error) {
      console.error('❌ Error al parsear archivo:', _error)
             setValidationResult({
         isValid: false,
         errors: ['Error inesperado al parsear el archivo'],
         warnings: []
       })
    }
  }

  // Verificar estado del backend al cargar
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const status = await apiClient.getProcessingStatus()
        setBackendStatus(status.backend === 'connected' ? 'connected' : 'disconnected')
      } catch (_error) {
        console.log('Backend Python no disponible, usando modo simulación')
        setBackendStatus('disconnected')
      }
    }
    
    checkBackendStatus()
  }, [])

  const handleProcessFile = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProcessingResult(null)

    try {
      console.log('🚀 Enviando archivo al servidor...')
      
      let result: ProcessingResult
      
      if (backendStatus === 'connected') {
        // Usar procesamiento real con Python backend
        console.log('📡 Enviando a backend Python...')
        const processResult = await apiClient.processCSV(selectedFile)
        
        // Convertir respuesta del backend a nuestro formato
        result = {
          success: processResult.success,
          message: processResult.message,
          data: processResult.data ? {
            processedRows: processResult.data.processedRows,
            errors: processResult.data.validationErrors,
            warnings: processResult.data.warnings,
            processingTime: 0 // Backend no devuelve este dato
          } : undefined,
          error: processResult.error
        }
      } else {
        // Usar simulación local
        console.log('⚠️ Backend no disponible, usando simulación...')
        const uploadResult = await apiClient.uploadCSV(selectedFile)
        
        result = {
          success: uploadResult.success,
          message: uploadResult.message + ' (Simulación)',
          data: uploadResult.data,
          error: uploadResult.error
        }
      }
      
      console.log('📊 Resultado del procesamiento:', result)
      setProcessingResult(result)

      if (result.success) {
        console.log(`✅ Archivo procesado: ${result.data?.processedRows} filas`)
      } else {
        console.error('❌ Error:', result.error)
      }

    } catch (_error) {
      console.error('❌ Error enviando archivo:', _error)
      setProcessingResult({
        success: false,
        message: 'Error de conexión',
        error: _error instanceof Error ? _error.message : 'Error desconocido'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const canProcess = selectedFile && validationResult?.isValid && !isProcessing

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-phoenix-red via-phoenix-orange to-phoenix-yellow bg-clip-text text-transparent">
              📊 Entrada de Datos CSV
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Sube y procesa archivos CSV con datos de natación
          </p>
          {/* Breadcrumb navigation */}
          <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <a href="/data-entry" className="hover:text-gray-700 dark:hover:text-gray-200">
              Entrada de Datos
            </a>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-200">CSV</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Seleccionar Archivo
            </h2>
            <CSVUploader onFileSelect={handleFileSelect} />
            
            {selectedFile && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 dark:text-blue-400">📄</span>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Preview y Validación Section */}
          {validationResult && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Vista Previa y Validación
              </h2>
              <CSVPreview validationResult={validationResult} />
            </div>
          )}

          {/* Processing Section */}
          {selectedFile && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                3. Procesamiento
              </h2>
              
              {/* Indicador de estado del backend */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  backendStatus === 'connected' ? 'bg-green-500' :
                  backendStatus === 'disconnected' ? 'bg-yellow-500' :
                  backendStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {backendStatus === 'connected' ? 'Backend Python conectado' :
                   backendStatus === 'disconnected' ? 'Modo simulación' :
                   backendStatus === 'error' ? 'Error de conexión' : 'Verificando...'}
                </span>
              </div>
            </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handleProcessFile}
                    disabled={!canProcess}
                    className={`px-6 py-3 ${
                      canProcess
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <LoadingSpinner size="sm" variant="default" />
                        <span>Procesando...</span>
                      </div>
                    ) : (
                      '🚀 Procesar Archivo'
                    )}
                  </Button>
                  
                  {selectedFile && !validationResult?.isValid && (
                    <span className="text-amber-600 dark:text-amber-400 text-sm">
                      ⚠️ El archivo necesita corrección de errores antes del procesamiento
                    </span>
                  )}
                </div>

                {/* Processing Results */}
                {processingResult && (
                  <div className={`p-4 rounded-lg border ${
                    processingResult.success
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`text-2xl ${
                        processingResult.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {processingResult.success ? '✅' : '❌'}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          processingResult.success 
                            ? 'text-green-800 dark:text-green-300' 
                            : 'text-red-800 dark:text-red-300'
                        }`}>
                          {processingResult.message}
                        </h3>
                        
                        {processingResult.success && processingResult.data && (
                          <div className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-400">
                            <p>📊 Filas procesadas: <strong>{processingResult.data.processedRows}</strong></p>
                            <p>⏱️ Tiempo: <strong>{processingResult.data.processingTime}ms</strong></p>
                            
                            {processingResult.data.warnings.length > 0 && (
                              <div className="mt-2">
                                <p className="font-medium text-amber-700 dark:text-amber-400">⚠️ Advertencias:</p>
                                <ul className="list-disc list-inside pl-4 text-amber-600 dark:text-amber-500">
                                  {processingResult.data.warnings.map((warning, idx) => (
                                    <li key={idx}>{warning}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {processingResult.data.errors.length > 0 && (
                              <div className="mt-2">
                                <p className="font-medium text-red-700 dark:text-red-400">❌ Errores:</p>
                                <ul className="list-disc list-inside pl-4 text-red-600 dark:text-red-500">
                                  {processingResult.data.errors.map((error, idx) => (
                                    <li key={idx}>{error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {processingResult.error && (
                          <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                            Error: {processingResult.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Reporte de validación */}
                {processingResult?.success && processingResult?.data && (
                  <ValidationReport
                    totalRows={processingResult.data.totalRows || 0}
                    validRows={processingResult.data.validRows || 0}
                    errors={processingResult.data.errors || []}
                    warnings={processingResult.data.warnings || []}
                    processingTime={processingResult.data.processingTime}
                  />
                )}
                
                {/* Métricas Automáticas */}
                {processingResult?.success && processingResult?.data?.automaticMetrics && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center">
                      🧮 Métricas Automáticas Calculadas
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {processingResult.data.automaticMetrics.calculated}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-500">Filas con métricas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          {processingResult.data.automaticMetrics.types.length}
                        </div>
                        <div className="text-sm text-indigo-700 dark:text-indigo-500">Tipos de métricas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ✅
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-500">Cálculo exitoso</div>
                      </div>
                    </div>
                    
                    {/* Tipos de métricas calculadas */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                        Métricas calculadas automáticamente:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {processingResult.data.automaticMetrics.types.map((metric, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium"
                          >
                            {metric === 'v1' ? 'V1 (Velocidad primer segmento)' :
                             metric === 'v2' ? 'V2 (Velocidad segundo segmento)' :
                             metric === 'v_promedio' ? 'V promedio (Velocidad total)' :
                             metric === 'dist_x_brz' ? 'DIST x BRZ (Distancia por brazada)' :
                             metric === 'dist_sin_f' ? 'DIST sin F (Distancia sin flecha)' :
                             metric === 'f_promedio' ? 'F promedio (Flecha promedio)' :
                             metric}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Muestra de datos procesados */}
                    {processingResult.data.sampleData && processingResult.data.sampleData.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">
                          📊 Muestra de datos procesados (con métricas automáticas):
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-blue-200 dark:border-blue-700">
                                <th className="text-left py-2 px-2 font-medium text-blue-900 dark:text-blue-300">Nadador</th>
                                <th className="text-left py-2 px-2 font-medium text-blue-900 dark:text-blue-300">T_Total</th>
                                <th className="text-left py-2 px-2 font-medium text-blue-900 dark:text-blue-300">V1</th>
                                <th className="text-left py-2 px-2 font-medium text-blue-900 dark:text-blue-300">V2</th>
                                <th className="text-left py-2 px-2 font-medium text-blue-900 dark:text-blue-300">V Prom</th>
                                <th className="text-left py-2 px-2 font-medium text-blue-900 dark:text-blue-300">DIST/BRZ</th>
                                <th className="text-left py-2 px-2 font-medium text-blue-900 dark:text-blue-300">F Prom</th>
                              </tr>
                            </thead>
                            <tbody>
                              {processingResult.data.sampleData.slice(0, 3).map((row, idx) => (
                                <tr key={idx} className="border-b border-blue-100 dark:border-blue-800/50">
                                  <td className="py-2 px-2 text-blue-700 dark:text-blue-400">{row.nadador}</td>
                                  <td className="py-2 px-2 text-gray-600 dark:text-gray-400">{row.t_total}s</td>
                                  <td className="py-2 px-2 text-green-600 dark:text-green-400 font-medium">{row.v1} m/s</td>
                                  <td className="py-2 px-2 text-green-600 dark:text-green-400 font-medium">{row.v2} m/s</td>
                                  <td className="py-2 px-2 text-green-600 dark:text-green-400 font-medium">{row.v_promedio} m/s</td>
                                  <td className="py-2 px-2 text-blue-600 dark:text-blue-400 font-medium">{row.dist_x_brz} m/brz</td>
                                  <td className="py-2 px-2 text-phoenix-purple dark:text-phoenix-purple font-medium">{row.f_promedio} m</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                          * Las métricas en verde son calculadas automáticamente por el sistema
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 