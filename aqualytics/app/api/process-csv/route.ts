import { NextRequest, NextResponse } from 'next/server'

// Configuración del backend Python
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000'

interface ProcessResponse {
  success: boolean
  message: string
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
  error?: string
}

/**
 * POST /api/process-csv
 * Proxy hacia el backend Python para procesamiento completo de CSV
 */
export async function POST(request: NextRequest): Promise<NextResponse<ProcessResponse>> {
  const startTime = Date.now()
  
  try {
    console.log('🔄 Iniciando proxy hacia backend Python...')
    
    // Verificar que el backend esté configurado
    if (!PYTHON_BACKEND_URL) {
      return NextResponse.json({
        success: false,
        message: 'Backend Python no configurado',
        error: 'Variable de entorno PYTHON_BACKEND_URL no encontrada'
      }, { status: 500 })
    }
    
    // Extraer form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'Error de validación',
        error: 'No se encontró archivo en la petición'
      }, { status: 400 })
    }
    
    console.log(`📄 Enviando archivo al backend: ${file.name} (${file.size} bytes)`)
    
    // Preparar FormData para el backend Python
    const pythonFormData = new FormData()
    pythonFormData.append('file', file)
    
    // Enviar al backend Python
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/ingest/csv`, {
      method: 'POST',
      body: pythonFormData,
      headers: {
        // No establecer Content-Type manualmente para multipart/form-data
        'Accept': 'application/json',
      },
    })
    
    const _processingTime = Date.now() - startTime
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Error del backend Python: ${response.status} - ${errorText}`)
      
      return NextResponse.json({
        success: false,
        message: 'Error del backend de procesamiento',
        error: `Error ${response.status}: ${errorText}`
      }, { status: response.status })
    }
    
    // Parsear respuesta del backend
    const pythonResult = await response.json()
    
    console.log(`✅ Backend Python completado en ${_processingTime}ms:`, pythonResult)
    
    // Transformar respuesta del backend a nuestro formato
    const processResponse: ProcessResponse = {
      success: pythonResult.success || false,
      message: pythonResult.message || 'Procesamiento completado',
      data: pythonResult.data ? {
        processedRows: pythonResult.data.processed_rows || 0,
        validationErrors: pythonResult.data.validation_errors || [],
        warnings: pythonResult.data.warnings || [],
        metrics: {
          averageTime: pythonResult.data.metrics?.average_time || 0,
          totalSwimmers: pythonResult.data.metrics?.total_swimmers || 0,
          competitions: pythonResult.data.metrics?.competitions || []
        },
        uploadedToDatabase: pythonResult.data.uploaded_to_database || false
      } : undefined,
      error: pythonResult.error
    }
    
    return NextResponse.json(processResponse)
    
  } catch (error) {
    const _processingTime = Date.now() - startTime
    console.error('❌ Error en proxy process-csv:', error)
    
    // Determinar si es un error de conexión con el backend
    const isConnectionError = error instanceof Error && 
      (error.message.includes('fetch') || error.message.includes('ECONNREFUSED'))
    
    return NextResponse.json({
      success: false,
      message: isConnectionError 
        ? 'Backend de procesamiento no disponible' 
        : 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { 
      status: isConnectionError ? 503 : 500 
    })
  }
}

/**
 * GET /api/process-csv
 * Verificar estado del backend Python
 */
export async function GET(): Promise<NextResponse> {
  try {
    const backendUrl = PYTHON_BACKEND_URL
    
    if (!backendUrl) {
      return NextResponse.json({
        service: 'CSV Processing Proxy',
        status: 'misconfigured',
        backend: 'not_configured',
        error: 'PYTHON_BACKEND_URL no configurada'
      }, { status: 500 })
    }
    
    // Intentar ping al backend Python
    const healthCheck = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    }).catch(() => null)
    
    const backendStatus = healthCheck?.ok ? 'connected' : 'disconnected'
    
    return NextResponse.json({
      service: 'CSV Processing Proxy',
      status: 'active',
      backend: backendStatus,
      backendUrl: backendUrl,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      service: 'CSV Processing Proxy',
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
} 