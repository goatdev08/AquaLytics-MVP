// =====================================================
// API Route: /api/pruebas
// Description: CRUD operations for swimming tests/events
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
  curso: z.enum(['largo', 'corto']).optional(),
  estilo_id: z.coerce.number().positive().optional(),
  distancia_id: z.coerce.number().positive().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  orderBy: z.enum(['nombre', 'distancia_id', 'estilo_id']).default('nombre'),
  orderDirection: z.enum(['asc', 'desc']).default('asc')
})

// Schema para POST request body
const createPruebaSchema = z.object({
  nombre: z.string().min(1).max(100),
  distancia_id: z.number().positive(),
  estilo_id: z.number().positive(),
  curso: z.enum(['largo', 'corto'])
})

// =====================================================
// GET: Listar pruebas con filtros y paginación
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    
    // Validar parámetros de query
    const params = getQuerySchema.parse({
      curso: searchParams.get('curso') || undefined,
      estilo_id: searchParams.get('estilo_id') || undefined,
      distancia_id: searchParams.get('distancia_id') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      orderBy: searchParams.get('orderBy') || 'nombre',
      orderDirection: searchParams.get('orderDirection') || 'asc'
    })
    
    // Construir query base
    let query = supabase
      .from('pruebas')
      .select('*, distancias(*), estilos(*)', { count: 'exact' })
    
    // Aplicar filtros
    if (params.curso) {
      query = query.eq('curso', params.curso)
    }
    if (params.estilo_id) {
      query = query.eq('estilo_id', params.estilo_id)
    }
    if (params.distancia_id) {
      query = query.eq('distancia_id', params.distancia_id)
    }
    
    // Aplicar ordenamiento
    query = query.order(params.orderBy, { ascending: params.orderDirection === 'asc' })
    
    // Aplicar paginación
    const offset = (params.page - 1) * params.limit
    query = query.range(offset, offset + params.limit - 1)
    
    // Ejecutar query
    const { data, error, count } = await query
    
    if (error) {
      console.error('Error fetching pruebas:', error)
      return NextResponse.json(
        { error: 'Error al obtener las pruebas' },
        { status: 500 }
      )
    }
    
    // Calcular metadata de paginación
    const totalPages = Math.ceil((count || 0) / params.limit)
    const hasNextPage = params.page < totalPages
    const hasPrevPage = params.page > 1
    
    return NextResponse.json({
      data: data || [],
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
    
  } catch (error) {
    console.error('Unexpected error in GET /api/pruebas:', error)
    
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
// POST: Crear nueva prueba
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const body = await request.json()
    
    // Validar body de la request
    const validatedData = createPruebaSchema.parse(body)
    
    // Verificar que la combinación distancia+estilo+curso no exista
    const { data: existing } = await supabase
      .from('pruebas')
      .select('id')
      .eq('distancia_id', validatedData.distancia_id)
      .eq('estilo_id', validatedData.estilo_id)
      .eq('curso', validatedData.curso)
      .single()
    
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una prueba con esa combinación de distancia, estilo y curso' },
        { status: 409 }
      )
    }
    
    // Verificar que distancia y estilo existan
    const [{ data: distancia }, { data: estilo }] = await Promise.all([
      supabase.from('distancias').select('distancia').eq('distancia_id', validatedData.distancia_id).single(),
      supabase.from('estilos').select('nombre').eq('estilo_id', validatedData.estilo_id).single()
    ])
    
    if (!distancia || !estilo) {
      return NextResponse.json(
        { error: 'Distancia o estilo inválidos' },
        { status: 400 }
      )
    }
    
    // Crear la prueba (el trigger calculará automáticamente los tramos)
    const { data, error } = await supabase
      .from('pruebas')
      .insert(validatedData)
      .select('*, distancias(*), estilos(*)')
      .single()
    
    if (error) {
      console.error('Error creating prueba:', error)
      return NextResponse.json(
        { error: 'Error al crear la prueba' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'Prueba creada exitosamente',
        data 
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Unexpected error in POST /api/pruebas:', error)
    
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