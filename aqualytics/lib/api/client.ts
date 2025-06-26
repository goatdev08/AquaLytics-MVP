/**
 * API Client para AquaLytics
 * Cliente tipado para interactuar con las API routes de Next.js
 */

interface BaseResponse {
  success: boolean
  message: string
  error?: string
}

interface UploadResponse extends BaseResponse {
  data?: {
    processedRows: number
    errors: string[]
    warnings: string[]
    processingTime: number
  }
}

interface ProcessResponse extends BaseResponse {
  data?: {
    processedRows: number
    validationErrors: string[]
    warnings: string[]
    metrics: {
      averageTime: number
      totalSwimmers: number
      competitions: string[]
    }
    uploadedToDatabase: boolean
  }
}

interface ApiStatus {
  service: string
  status: string
  version?: string
  maxFileSize?: string
  supportedFormats?: string[]
  backend?: string
  timestamp: string
}

class AquaLyticsApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  /**
   * Upload y validación básica de CSV (mock/simulación)
   */
  async uploadCSV(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/api/upload-csv`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Procesamiento completo via proxy a Python backend
   */
  async processCSV(file: File): Promise<ProcessResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/api/process-csv`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Obtener estado del servicio de upload
   */
  async getUploadStatus(): Promise<ApiStatus> {
    const response = await fetch(`${this.baseUrl}/api/upload-csv`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Obtener estado del servicio de procesamiento y backend Python
   */
  async getProcessingStatus(): Promise<ApiStatus> {
    const response = await fetch(`${this.baseUrl}/api/process-csv`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Validar archivo antes de envío
   */
  validateFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validar tipo de archivo
    if (!file.name.toLowerCase().endsWith('.csv')) {
      errors.push('El archivo debe ser un CSV')
    }

    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('El archivo es muy grande. Máximo 10MB permitido.')
    }

    // Validar que no esté vacío
    if (file.size === 0) {
      errors.push('El archivo está vacío')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Instancia singleton del cliente
export const apiClient = new AquaLyticsApiClient()

// Exportar tipos para uso en componentes
export type { UploadResponse, ProcessResponse, ApiStatus }
export { AquaLyticsApiClient } 