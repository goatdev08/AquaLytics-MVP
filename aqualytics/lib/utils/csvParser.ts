/**
 * CSV Parser Utility - AquaLytics
 * Utilidad para parsear, validar y previsualizar archivos CSV
 */

export interface CSVColumn {
  name: string
  type: 'string' | 'number' | 'date' | 'unknown'
  sample: string
  isEmpty: boolean
}

export interface CSVPreview {
  headers: string[]
  rows: string[][]
  totalRows: number
  totalColumns: number
  fileSize: number
  encoding: string
  columns: CSVColumn[]
  errors: string[]
  warnings: string[]
}

export interface CSVValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  preview?: CSVPreview
}

// Formato esperado según PRD
const EXPECTED_HEADERS = [
  'fecha', 'nadador', 'competencia', 'distancia', 'estilo', 'fase',
  't15_1', 'brz_1', 't25_1', 'f1', 't15_2', 'brz_2', 't25_2', 'f2', 't_total', 'brz_total'
]

/**
 * Detecta el tipo de datos de una columna basado en muestras
 */
function inferColumnType(values: string[]): CSVColumn['type'] {
  const nonEmptyValues = values.filter(v => v.trim() !== '')
  
  if (nonEmptyValues.length === 0) return 'unknown'
  
  // Chequear si son fechas (YYYY-MM-DD)
  const datePattern = /^\d{4}-\d{2}-\d{2}$/
  if (nonEmptyValues.every(v => datePattern.test(v.trim()))) {
    return 'date'
  }
  
  // Chequear si son números
  const numericValues = nonEmptyValues.filter(v => !isNaN(Number(v.trim())))
  if (numericValues.length === nonEmptyValues.length) {
    return 'number'
  }
  
  return 'string'
}

/**
 * Parsea un archivo CSV y genera preview con validaciones
 */
export async function parseCSVFile(file: File): Promise<CSVValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    // Leer archivo como texto
    const text = await file.text()
    
    // Detectar encoding (básico)
    let encoding = 'UTF-8'
    if (text.includes('�')) {
      encoding = 'Posible problema de encoding'
      warnings.push('El archivo puede tener problemas de codificación de caracteres')
    }
    
    // Parsear líneas
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    if (lines.length === 0) {
      errors.push('El archivo está vacío')
      return { isValid: false, errors, warnings }
    }
    
    if (lines.length === 1) {
      errors.push('El archivo solo contiene headers, no hay datos')
      return { isValid: false, errors, warnings }
    }
    
    // Parsear headers
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const dataRows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim())
    )
    
    // Validaciones básicas
    if (headers.length === 0) {
      errors.push('No se encontraron headers en el archivo')
      return { isValid: false, errors, warnings }
    }
    
    // Validar estructura de columnas
    const inconsistentRows = dataRows.filter(row => row.length !== headers.length)
    if (inconsistentRows.length > 0) {
      errors.push(`${inconsistentRows.length} filas tienen un número inconsistente de columnas`)
    }
    
    // Validar headers esperados (según PRD)
    const missingHeaders = EXPECTED_HEADERS.filter(expected => 
      !headers.includes(expected)
    )
    if (missingHeaders.length > 0) {
      warnings.push(`Faltan columnas esperadas: ${missingHeaders.join(', ')}`)
    }
    
    const extraHeaders = headers.filter(header => 
      !EXPECTED_HEADERS.includes(header)
    )
    if (extraHeaders.length > 0) {
      warnings.push(`Columnas adicionales encontradas: ${extraHeaders.join(', ')}`)
    }
    
    // Crear preview de columnas
    const columns: CSVColumn[] = headers.map((header, index) => {
      const columnValues = dataRows.map(row => row[index] || '')
      const nonEmptyValues = columnValues.filter(v => v !== '')
      
      return {
        name: header,
        type: inferColumnType(columnValues),
        sample: nonEmptyValues.length > 0 ? nonEmptyValues[0] : '',
        isEmpty: nonEmptyValues.length === 0
      }
    })
    
    // Validaciones específicas de datos
    columns.forEach(column => {
      if (column.isEmpty) {
        warnings.push(`La columna '${column.name}' está completamente vacía`)
      }
      
      // Validaciones específicas por tipo de columna
      if (column.name === 'fecha' && column.type !== 'date') {
        errors.push(`La columna 'fecha' debe tener formato YYYY-MM-DD`)
      }
      
      if (['t15_1', 't15_2', 't25_1', 't25_2', 't_total'].includes(column.name) && column.type !== 'number') {
        warnings.push(`La columna '${column.name}' debería contener valores numéricos (tiempos)`)
      }
      
      if (['brz_1', 'brz_2', 'brz_total'].includes(column.name) && column.type !== 'number') {
        warnings.push(`La columna '${column.name}' debería contener valores numéricos (brazadas)`)
      }
    })
    
    // Crear preview
    const preview: CSVPreview = {
      headers,
      rows: dataRows.slice(0, 5), // Solo primeras 5 filas para preview
      totalRows: dataRows.length,
      totalColumns: headers.length,
      fileSize: file.size,
      encoding,
      columns,
      errors: [...errors],
      warnings: [...warnings]
    }
    
    // Determinar si es válido (errores críticos vs warnings)
    const isValid = errors.length === 0
    
    return {
      isValid,
      errors,
      warnings,
      preview
    }
    
  } catch (error) {
    errors.push(`Error al parsear el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    return { isValid: false, errors, warnings }
  }
}

/**
 * Valida si un archivo tiene el formato CSV esperado para AquaLytics
 */
export function validateCSVStructure(preview: CSVPreview): { isValid: boolean; score: number; feedback: string[] } {
  const feedback: string[] = []
  let score = 0
  
  // Headers esperados (peso: 40%)
  const expectedHeadersFound = EXPECTED_HEADERS.filter(header => 
    preview.headers.includes(header)
  ).length
  const headerScore = (expectedHeadersFound / EXPECTED_HEADERS.length) * 40
  score += headerScore
  
  if (headerScore === 40) {
    feedback.push('✅ Todas las columnas esperadas están presentes')
  } else {
    feedback.push(`⚠️ Faltan ${EXPECTED_HEADERS.length - expectedHeadersFound} columnas esperadas`)
  }
  
  // Datos consistentes (peso: 30%)
  const consistentRows = preview.totalRows > 0 ? 30 : 0
  score += consistentRows
  
  if (consistentRows > 0) {
    feedback.push(`✅ ${preview.totalRows} filas de datos encontradas`)
  }
  
  // Tipos de datos correctos (peso: 30%)
  const correctTypes = preview.columns.filter(col => {
    if (col.name === 'fecha') return col.type === 'date'
    if (['t15_1', 't15_2', 't25_1', 't25_2', 't_total', 'f1', 'f2'].includes(col.name)) {
      return col.type === 'number'
    }
    return true // Otros campos pueden ser string
  }).length
  
  const typeScore = (correctTypes / preview.columns.length) * 30
  score += typeScore
  
  if (typeScore === 30) {
    feedback.push('✅ Todos los tipos de datos son correctos')
  } else {
    feedback.push('⚠️ Algunos tipos de datos pueden ser incorrectos')
  }
  
  return {
    isValid: score >= 70, // 70% o más para ser considerado válido
    score: Math.round(score),
    feedback
  }
} 