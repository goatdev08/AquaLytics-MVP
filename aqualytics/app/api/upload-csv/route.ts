import { NextRequest, NextResponse } from 'next/server'

// Configuración para archivos grandes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

interface UploadResponse {
  success: boolean
  message: string
  data?: {
    processedRows: number
    totalRows: number
    validRows: number
    errors: string[]
    warnings: string[]
    processingTime: number
    encoding_detected?: string
    delimiter_detected?: string
    sampleData?: Array<Record<string, unknown>>
    automaticMetrics?: {
      calculated: number
      types: string[]
    }
  }
  error?: string
}

/**
 * POST /api/upload-csv
 * Maneja el upload de archivos CSV y los envía al backend Python para procesamiento
 */
export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  const startTime = Date.now()
  
  try {
    console.log('📁 Iniciando upload de CSV...')
    
    // Verificar content-type
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json({
        success: false,
        message: 'Error de validación',
        error: 'Content-Type debe ser multipart/form-data'
      }, { status: 400 })
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

    // Validaciones básicas del archivo
    console.log(`📄 Archivo recibido: ${file.name} (${file.size} bytes)`)
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({
        success: false,
        message: 'Error de validación',
        error: 'El archivo debe ser un CSV'
      }, { status: 400 })
    }

    if (file.size === 0) {
      return NextResponse.json({
        success: false,
        message: 'Error de validación',
        error: 'El archivo está vacío'
      }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      return NextResponse.json({
        success: false,
        message: 'Error de validación',
        error: 'El archivo es muy grande. Máximo 10MB permitido.'
      }, { status: 400 })
    }

    // Por ahora, simular procesamiento (hasta que tengamos el backend Python)
    // TODO: Reemplazar con llamada real al backend Python
    const mockProcessing = await simulateProcessing(file)
    
    const processingTime = Date.now() - startTime
    
    console.log(`✅ Procesamiento completado en ${processingTime}ms`)
    
    return NextResponse.json({
      success: true,
      message: 'CSV procesado exitosamente',
      data: {
        ...mockProcessing,
        processingTime
      }
    })

  } catch (error) {
    console.error('❌ Error en upload-csv:', error)
    
    const processingTime = Date.now() - startTime
    
    return NextResponse.json({
      success: false,
      message: 'Error durante el procesamiento',
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      data: {
        processedRows: 0,
        totalRows: 0,
        validRows: 0,
        errors: ['Error durante el procesamiento'],
        warnings: [],
        processingTime,
        encoding_detected: 'unknown',
        delimiter_detected: 'unknown'
      }
    }, { status: 500 })
  }
}

/**
 * Simulación de procesamiento mientras desarrollamos el backend Python
 * Incluye cálculo de métricas automáticas para testing
 * TODO: Reemplazar con llamada real al servicio Python
 */
async function simulateProcessing(file: File) {
  // Simular tiempo de procesamiento
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  try {
    // Leer contenido del archivo para análisis básico
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    const dataRows = lines.length > 1 ? lines.length - 1 : 0 // Excluir header
    
    // Simulación básica de validación
    const errors: string[] = []
    const warnings: string[] = []
    const processedData: Array<Record<string, unknown>> = []
    
    if (dataRows === 0) {
      errors.push('No se encontraron filas de datos')
    }
    
    if (lines.length > 0) {
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      // Verificar estructura esperada
      const expectedColumns = [
        'fecha', 'nadador', 'competencia', 'distancia', 'estilo', 'fase',
        't25_1', 'brz_1', 't25_2', 'brz_2', 't_total', 'brz_total', 'f1', 'f2'
      ]
      
      const missingColumns = expectedColumns.filter(col => 
        !headers.some(h => h.includes(col.replace('_', '')))
      )
      
      if (missingColumns.length > 0) {
        warnings.push(`Columnas faltantes: ${missingColumns.join(', ')}`)
      }
      
      // Procesar datos y calcular métricas automáticas para las primeras filas
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const _row = lines[i].split(',').map(cell => cell.trim())
        
        try {
          // Extraer métricas manuales (valores simulados realistas)
          const t25_1 = 12.45 + Math.random() * 2
          const t25_2 = 13.23 + Math.random() * 2  
          const t_total = t25_1 + t25_2 + Math.random() * 1
          const brz_1 = Math.floor(7 + Math.random() * 3)
          const brz_2 = Math.floor(8 + Math.random() * 3)
          const brz_total = brz_1 + brz_2
          const f1 = 5.0 + Math.random() * 2
          const f2 = 5.2 + Math.random() * 2
          
          // Calcular métricas automáticas (usando las mismas fórmulas del backend)
          const v1 = 25.0 / t25_1  // Velocidad primer segmento
          const v2 = 25.0 / t25_2  // Velocidad segundo segmento
          const v_promedio = 50.0 / t_total  // Velocidad promedio
          const dist_x_brz = 50.0 / brz_total  // Distancia por brazada
          const dist_sin_f = 50.0 - (f1 + f2)  // Distancia sin flecha
          const f_promedio = (f1 + f2) / 2.0  // Flecha promedio
          
          processedData.push({
            fecha: '2024-01-15',
            nadador: `Nadador ${i}`,
            competencia: 'Simulación Nacional',
            distancia: 50,
            estilo: 'Crol',
            fase: 'Competencia',
            // Métricas manuales
            t25_1: Number(t25_1.toFixed(2)),
            t25_2: Number(t25_2.toFixed(2)),
            t_total: Number(t_total.toFixed(2)),
            brz_1: brz_1,
            brz_2: brz_2,
            brz_total: brz_total,
            f1: Number(f1.toFixed(2)),
            f2: Number(f2.toFixed(2)),
            // Métricas automáticas calculadas
            v1: Number(v1.toFixed(3)),
            v2: Number(v2.toFixed(3)),
            v_promedio: Number(v_promedio.toFixed(3)),
            dist_x_brz: Number(dist_x_brz.toFixed(3)),
            dist_sin_f: Number(dist_sin_f.toFixed(1)),
            f_promedio: Number(f_promedio.toFixed(2))
          })
        } catch (_e) {
          errors.push(`Error procesando fila ${i + 1}`)
        }
      }
    }
    
    // Simular algunos warnings realistas
    if (Math.random() > 0.6) {
      warnings.push('Algunos tiempos están fuera del rango típico para la distancia')
    }
    
    if (dataRows > 10) {
      warnings.push(`${dataRows - 10} filas adicionales no mostradas en la vista previa`)
    }
    
    const validRows = Math.max(0, dataRows - errors.length)
    
    return {
      processedRows: validRows,
      totalRows: dataRows,
      validRows: validRows,
      errors,
      warnings,
      encoding_detected: 'utf-8',
      delimiter_detected: ',',
      sampleData: processedData.slice(0, 3), // Primeras 3 filas con métricas
      automaticMetrics: {
        calculated: processedData.length,
        types: ['v1', 'v2', 'v_promedio', 'dist_x_brz', 'dist_sin_f', 'f_promedio']
      }
    }
    
  } catch (error) {
    throw new Error(`Error al procesar archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}

/**
 * GET /api/upload-csv
 * Endpoint de información/salud
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    service: 'CSV Upload API',
    status: 'active',
    version: '1.0.0',
    maxFileSize: '10MB',
    supportedFormats: ['csv'],
    timestamp: new Date().toISOString()
  })
} 