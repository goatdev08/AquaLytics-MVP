/**
 * API Route: Gestión de Datos de Referencia
 * Operaciones CRUD unificadas para distancias, estilos, fases y parámetros
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseAdmin } from '@/lib/supabase'

// Esquemas de validación por tipo
const DistanciaSchema = z.object({
  distancia: z.number().positive('Distancia debe ser un número positivo')
})

const EstiloSchema = z.object({
  estilo: z.string().min(1, 'Nombre de estilo requerido').max(100)
})

const FaseSchema = z.object({
  fase: z.string().min(1, 'Nombre de fase requerido').max(100)
})

const ParametroSchema = z.object({
  parametro: z.string().min(1, 'Nombre de parámetro requerido').max(100),
  tipo: z.enum(['M', 'A'], { errorMap: () => ({ message: 'Tipo debe ser M (métrica) o A (auxiliar)' }) }),
  global: z.boolean().optional().default(false)
})

// Schema de actualización (para futura referencia)
// const UpdateReferenceSchema = z.object({
//   id: z.number().positive('ID inválido'),
//   type: z.enum(['distancias', 'estilos', 'fases', 'parametros']),
//   data: z.record(z.any()) // Datos específicos del tipo
// })

// Tipos (para futura referencia)
// type DistanciaData = z.infer<typeof DistanciaSchema>
// type EstiloData = z.infer<typeof EstiloSchema>  
// type FaseData = z.infer<typeof FaseSchema>
// type ParametroData = z.infer<typeof ParametroSchema>

// Mapa de configuración por tipo
const typeConfig = {
  distancias: {
    table: 'distancias',
    idField: 'distancia_id',
    nameField: 'distancia',
    schema: DistanciaSchema,
    orderBy: 'distancia'
  },
  estilos: {
    table: 'estilos',
    idField: 'estilo_id',
    nameField: 'nombre',
    schema: EstiloSchema,
    orderBy: 'nombre'
  },
  fases: {
    table: 'fases',
    idField: 'fase_id',
    nameField: 'nombre',
    schema: FaseSchema,
    orderBy: 'nombre'
  },
  metricas: {
    table: 'metricas',
    idField: 'metrica_id',
    nameField: 'nombre',
    schema: ParametroSchema,
    orderBy: 'metrica_id'
  }
} as const

/**
 * GET - Obtener datos de referencia
 * ?type=distancias|estilos|fases|metricas
 * ?search=texto&limit=50&offset=0
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as keyof typeof typeConfig
    const search = searchParams.get('search') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)

    // Validar tipo
    if (!type || !typeConfig[type]) {
      return NextResponse.json(
        { error: 'Tipo requerido: distancias, estilos, fases, metricas' },
        { status: 400 }
      )
    }

    const config = typeConfig[type]
    const supabase = createSupabaseAdmin()

    let query = supabase
      .from(config.table)
      .select('*')

    // Búsqueda por nombre
    if (search) {
      query = query.ilike(config.nameField, `%${search}%`)
    }

    // Ordenar
    query = query.order(config.orderBy)

    // Paginación
    if (limit > 0) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error(`Error fetching ${type}:`, error)
      return NextResponse.json(
        { error: `Error al obtener ${type}`, details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      type,
      data: data || [],
      total: data?.length || 0,
      limit,
      offset
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/reference:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST - Crear nuevo dato de referencia
 * Body: { type: 'distancias', data: { distancia: 50 } }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    // Validar tipo
    if (!type || !typeConfig[type]) {
      return NextResponse.json(
        { error: 'Tipo requerido: distancias, estilos, fases, metricas' },
        { status: 400 }
      )
    }

    const config = typeConfig[type]
    
    // Validar datos según el tipo
    const result = config.schema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.format() },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()

    // Verificar duplicados
    const { data: existing } = await supabase
      .from(config.table)
      .select(config.idField)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq(config.nameField, (result.data as Record<string, any>)[config.nameField])
      .single()

    if (existing) {
      return NextResponse.json(
        { error: `Ya existe un ${type.slice(0, -1)} con ese nombre/valor` },
        { status: 409 }
      )
    }

    // Insertar
    const { data: inserted, error } = await supabase
      .from(config.table)
      .insert([result.data])
      .select()
      .single()

    if (error) {
      console.error(`Error creating ${type}:`, error)
      return NextResponse.json(
        { error: `Error al crear ${type.slice(0, -1)}`, details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `${type.slice(0, -1)} creado exitosamente`,
      type,
      data: inserted
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error in POST /api/reference:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Actualizar dato de referencia existente
 * Body: { type: 'distancias', id: 1, data: { distancia: 100 } }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, data } = body

    // Validar tipo
    if (!type || !typeConfig[type]) {
      return NextResponse.json(
        { error: 'Tipo requerido: distancias, estilos, fases, metricas' },
        { status: 400 }
      )
    }

    if (!id || typeof id !== 'number') {
      return NextResponse.json(
        { error: 'ID numérico requerido' },
        { status: 400 }
      )
    }

    const config = typeConfig[type]
    
    // Validar datos
    const result = config.schema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.format() },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()

    // Verificar que existe
    const { data: existing } = await supabase
      .from(config.table)
      .select(config.idField)
      .eq(config.idField, id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: `${type.slice(0, -1)} no encontrado` },
        { status: 404 }
      )
    }

    // Actualizar
    const { data: updated, error } = await supabase
      .from(config.table)
      .update(result.data)
      .eq(config.idField, id)
      .select()
      .single()

    if (error) {
      console.error(`Error updating ${type}:`, error)
      return NextResponse.json(
        { error: `Error al actualizar ${type.slice(0, -1)}`, details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `${type.slice(0, -1)} actualizado exitosamente`,
      type,
      data: updated
    })

  } catch (error) {
    console.error('Unexpected error in PUT /api/reference:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Eliminar dato de referencia
 * ?type=distancias&id=1
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as keyof typeof typeConfig
    const id = parseInt(searchParams.get('id') || '0')

    // Validar tipo
    if (!type || !typeConfig[type]) {
      return NextResponse.json(
        { error: 'Tipo requerido: distancias, estilos, fases, metricas' },
        { status: 400 }
      )
    }

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    const config = typeConfig[type]
    const supabase = createSupabaseAdmin()

    // Verificar que existe
    const { data: existing } = await supabase
      .from(config.table)
      .select(`${config.idField}, ${config.nameField}`)
      .eq(config.idField, id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: `${type.slice(0, -1)} no encontrado` },
        { status: 404 }
      )
    }

    // Verificar si tiene registros asociados
    const foreignKeyMap = {
      distancias: 'distancia_id',
      estilos: 'estilo_id', 
      fases: 'fase_id',
      metricas: 'metrica_id'
    }

    const { data: registros } = await supabase
      .from('registros')
      .select('registro_id')
      .eq(foreignKeyMap[type], id)
      .limit(1)

    if (registros && registros.length > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: ${type.slice(0, -1)} con registros asociados` },
        { status: 409 }
      )
    }

    // Eliminar
    const { error } = await supabase
      .from(config.table)
      .delete()
      .eq(config.idField, id)

    if (error) {
      console.error(`Error deleting ${type}:`, error)
      return NextResponse.json(
        { error: `Error al eliminar ${type.slice(0, -1)}`, details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `${type.slice(0, -1)} eliminado exitosamente`,
      type,
      data: { [config.idField]: id, [config.nameField]: existing[config.nameField] }
    })

  } catch (error) {
    console.error('Unexpected error in DELETE /api/reference:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 