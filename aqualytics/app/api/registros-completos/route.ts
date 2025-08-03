// =====================================================
// API Route: /api/registros-completos
// Description: CRUD operations for complete swimming records
// Author: AquaLytics System
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

// Schema para GET request query params
const getQuerySchema = z.object({
  nadador_id: z.coerce.number().positive().optional(),
  competencia_id: z.coerce.number().positive().optional(),
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
  fase_id: z.coerce.number().positive().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  orderBy: z.enum(['fecha', 'id', 'velocidad_promedio', 'completitud_porcentaje']).default('fecha'),
  orderDirection: z.enum(['asc', 'desc']).default('desc')
})

// Schema para métricas individuales
const metricaSchema = z.number().positive().nullable()

// Schema para POST/PUT request body
const registroCompletoSchema = z.object({
  id_nadador: z.number().positive(),
  prueba_id: z.number().positive(),
  competencia_id: z.number().positive().nullable().optional(),
  fecha: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Fecha inválida"
  }),
  fase_id: z.number().positive().nullable().optional(),
  // Métricas manuales (todas opcionales)
  t15_1: metricaSchema.optional(),
  brz_1: metricaSchema.optional(),
  t25_1: metricaSchema.optional(),
  f1: metricaSchema.optional(),
  t15_2: metricaSchema.optional(),
  brz_2: metricaSchema.optional(),
  t25_2: metricaSchema.optional(),
  f2: metricaSchema.optional(),
  t_total: metricaSchema.optional(),
  brz_total: metricaSchema.optional(),
  // Metodo de registro
  metodo_registro: z.enum(['manual', 'electronico', 'video_analisis', 'cronometro', 'manual_corregido']).default('manual')
})

// =====================================================
// GET: Listar registros completos con filtros
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    
    // Validar parámetros
    const params = getQuerySchema.parse({
      nadador_id: searchParams.get('nadador_id') || undefined,
      competencia_id: searchParams.get('competencia_id') || undefined,
      fecha_desde: searchParams.get('fecha_desde') || undefined,
      fecha_hasta: searchParams.get('fecha_hasta') || undefined,
      fase_id: searchParams.get('fase_id') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      orderBy: searchParams.get('orderBy') || 'fecha',
      orderDirection: searchParams.get('orderDirection') || 'desc'
    })
    
    // Construir query base con relaciones
    let query = supabase
      .from('registros_completos')
      .select(`
        *,
        nadadores (id_nadador, nombre, edad, peso),
        pruebas (
          id, nombre, curso, tramos_totales,
          distancias (distancia_id, distancia),
          estilos (estilo_id, nombre)
        ),
        competencias (competencia_id, nombre, fecha, lugar),
        fases (fase_id, nombre)
      `, { count: 'exact' })
    
    // Aplicar filtros
    if (params.nadador_id) {
      query = query.eq('id_nadador', params.nadador_id)
    }
    if (params.competencia_id) {
      query = query.eq('competencia_id', params.competencia_id)
    }
    if (params.fase_id) {
      query = query.eq('fase_id', params.fase_id)
    }
    if (params.fecha_desde) {
      query = query.gte('fecha', params.fecha_desde)
    }
    if (params.fecha_hasta) {
      query = query.lte('fecha', params.fecha_hasta)
    }
    
    // Aplicar ordenamiento
    query = query.order(params.orderBy, { ascending: params.orderDirection === 'asc' })
    
    // Aplicar paginación
    const offset = (params.page - 1) * params.limit
    query = query.range(offset, offset + params.limit - 1)
    
    // Ejecutar query
    const { data, error, count } = await query
    
    if (error) {
      console.error('Error fetching registros completos:', error)
      return NextResponse.json(
        { error: 'Error al obtener registros completos' },
        { status: 500 }
      )
    }
    
    // Calcular metadata de paginación
    const totalPages = Math.ceil((count || 0) / params.limit)
    
    return NextResponse.json({
      data: data || [],
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count || 0,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPrevPage: params.page > 1
      }
    })
    
  } catch (error) {
    console.error('Unexpected error in GET /api/registros-completos:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// =====================================================
// POST: Crear nuevo registro completo
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const body = await request.json()
    
    // Validar datos
    const validatedData = registroCompletoSchema.parse(body)
    
    // Verificar que el nadador existe
    const { data: nadador } = await supabase
      .from('nadadores')
      .select('id_nadador')
      .eq('id_nadador', validatedData.id_nadador)
      .single()
    
    if (!nadador) {
      return NextResponse.json(
        { error: 'Nadador no encontrado' },
        { status: 404 }
      )
    }
    
    // Verificar que la prueba existe
    const { data: prueba } = await supabase
      .from('pruebas')
      .select('id')
      .eq('id', validatedData.prueba_id)
      .single()
    
    if (!prueba) {
      return NextResponse.json(
        { error: 'Prueba no encontrada' },
        { status: 404 }
      )
    }
    
    // Verificar competencia si se proporciona
    if (validatedData.competencia_id) {
      const { data: competencia } = await supabase
        .from('competencias')
        .select('competencia_id')
        .eq('competencia_id', validatedData.competencia_id)
        .single()
      
      if (!competencia) {
        return NextResponse.json(
          { error: 'Competencia no encontrada' },
          { status: 404 }
        )
      }
    }
    
    // Crear registro completo (triggers calcularán métricas automáticas y completitud)
    const { data, error } = await supabase
      .from('registros_completos')
      .insert(validatedData)
      .select(`
        *,
        nadadores (id_nadador, nombre),
        pruebas (id, nombre, curso),
        competencias (competencia_id, nombre),
        fases (fase_id, nombre)
      `)
      .single()
    
    if (error) {
      console.error('Error creating registro completo:', error)
      return NextResponse.json(
        { error: 'Error al crear registro completo' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'Registro completo creado exitosamente',
        data 
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Unexpected error in POST /api/registros-completos:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// =====================================================
// PUT: Actualizar registro completo existente
// =====================================================
export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de registro requerido' },
        { status: 400 }
      )
    }
    
    // Validar datos de actualización (parcial)
    const partialSchema = registroCompletoSchema.partial()
    const validatedData = partialSchema.parse(updateData)
    
    // Verificar que el registro existe
    const { data: existing } = await supabase
      .from('registros_completos')
      .select('id')
      .eq('id', id)
      .single()
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      )
    }
    
    // Actualizar registro (triggers recalcularán métricas)
    const { data, error } = await supabase
      .from('registros_completos')
      .update(validatedData)
      .eq('id', id)
      .select(`
        *,
        nadadores (id_nadador, nombre),
        pruebas (id, nombre, curso),
        competencias (competencia_id, nombre),
        fases (fase_id, nombre)
      `)
      .single()
    
    if (error) {
      console.error('Error updating registro completo:', error)
      return NextResponse.json(
        { error: 'Error al actualizar registro' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Registro actualizado exitosamente',
      data
    })
    
  } catch (error) {
    console.error('Unexpected error in PUT /api/registros-completos:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// =====================================================
// DELETE: Eliminar registro completo
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de registro requerido' },
        { status: 400 }
      )
    }
    
    // Verificar que el registro existe
    const { data: existing } = await supabase
      .from('registros_completos')
      .select('id')
      .eq('id', parseInt(id))
      .single()
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      )
    }
    
    // Eliminar registro (triggers limpiarán registros individuales si es necesario)
    const { error } = await supabase
      .from('registros_completos')
      .delete()
      .eq('id', parseInt(id))
    
    if (error) {
      console.error('Error deleting registro completo:', error)
      return NextResponse.json(
        { error: 'Error al eliminar registro' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Registro eliminado exitosamente'
    })
    
  } catch (error) {
    console.error('Unexpected error in DELETE /api/registros-completos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 