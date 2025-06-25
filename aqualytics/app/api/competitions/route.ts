/**
 * API Route: Gestión de Competencias
 * Operaciones CRUD para competencias con validación de fechas
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseAdmin } from '@/lib/supabase'

// Tipos para manejo de datos de competencias
interface CompetitionWithPeriod {
  competencia_id: number
  competencia: string
  fecha_inicio: string | null
  fecha_fin: string | null
  totalRegistros?: number
}

// Esquemas de validación
const CompetitionSchema = z.object({
  competencia: z.string().min(1, 'Nombre de competencia requerido').max(255),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  fecha_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
}).refine((data) => {
  const inicio = new Date(data.fecha_inicio)
  const fin = new Date(data.fecha_fin)
  return inicio <= fin
}, {
  message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin',
  path: ['fecha_fin']
})

const UpdateCompetitionSchema = z.object({
  competencia_id: z.number().positive('ID de competencia inválido'),
  competencia: z.string().min(1, 'Nombre de competencia requerido').max(255),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  fecha_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
}).refine((data) => {
  const inicio = new Date(data.fecha_inicio)
  const fin = new Date(data.fecha_fin)
  return inicio <= fin
}, {
  message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin',
  path: ['fecha_fin']
})

// Tipos (para futura referencia)
// type Competition = z.infer<typeof CompetitionSchema>
// type UpdateCompetition = z.infer<typeof UpdateCompetitionSchema>

/**
 * GET - Obtener competencias con búsqueda y paginación
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)
    const includeStats = searchParams.get('includeStats') === 'true'

    const supabase = createSupabaseAdmin()
    let query = supabase
      .from('competencias')
      .select(
        includeStats 
          ? 'competencia_id, competencia, periodo, registros(count)'
          : 'competencia_id, competencia, periodo'
      )

    // Búsqueda por nombre
    if (search) {
      query = query.ilike('competencia', `%${search}%`)
    }

    // Ordenar por fecha más reciente primero
    query = query.order('competencia_id', { ascending: false })

    // Paginación
    if (limit > 0) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching competitions:', error)
      return NextResponse.json(
        { error: 'Error al obtener competencias', details: error.message },
        { status: 500 }
      )
    }

    // Procesar datos de periodo (daterange)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const competitions = data?.map((comp: any) => {
      const result: CompetitionWithPeriod = {
        competencia_id: comp.competencia_id,
        competencia: comp.competencia,
        fecha_inicio: null,
        fecha_fin: null
      }

      // Parsear daterange de PostgreSQL [2024-01-01,2024-01-07)
      if (comp.periodo) {
        const match = comp.periodo.match(/\[(\d{4}-\d{2}-\d{2}),(\d{4}-\d{2}-\d{2})\)/)
        if (match) {
          result.fecha_inicio = match[1]
          result.fecha_fin = match[2]
        }
      }

      // Agregar estadísticas si se solicitan
      if (includeStats && comp.registros) {
        result.totalRegistros = Array.isArray(comp.registros) ? comp.registros.length : comp.registros.count || 0
      }

      return result
    }) || []

    return NextResponse.json({
      data: competitions,
      total: competitions.length,
      limit,
      offset
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/competitions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST - Crear nueva competencia
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos
    const result = CompetitionSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.format() },
        { status: 400 }
      )
    }

    const { competencia, fecha_inicio, fecha_fin } = result.data

    // Verificar duplicados
    const supabase = createSupabaseAdmin()
    const { data: existing } = await supabase
      .from('competencias')
      .select('competencia_id')
      .eq('competencia', competencia)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una competencia con ese nombre' },
        { status: 409 }
      )
    }

    // Crear daterange para PostgreSQL
    const periodo = `[${fecha_inicio},${fecha_fin})`

    // Insertar competencia
    const { data, error } = await supabase
      .from('competencias')
      .insert([{ competencia, periodo }])
      .select()
      .single()

    if (error) {
      console.error('Error creating competition:', error)
      return NextResponse.json(
        { error: 'Error al crear competencia', details: error.message },
        { status: 500 }
      )
    }

    // Formatear respuesta
    const response = {
      competencia_id: data.competencia_id,
      competencia: data.competencia,
      fecha_inicio,
      fecha_fin
    }

    return NextResponse.json({
      message: 'Competencia creada exitosamente',
      data: response
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error in POST /api/competitions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Actualizar competencia existente
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos
    const result = UpdateCompetitionSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.format() },
        { status: 400 }
      )
    }

    const { competencia_id, competencia, fecha_inicio, fecha_fin } = result.data

    const supabase = createSupabaseAdmin()

    // Verificar que existe
    const { data: existing } = await supabase
      .from('competencias')
      .select('competencia_id')
      .eq('competencia_id', competencia_id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Competencia no encontrada' },
        { status: 404 }
      )
    }

    // Crear daterange
    const periodo = `[${fecha_inicio},${fecha_fin})`

    // Actualizar
    const { data, error } = await supabase
      .from('competencias')
      .update({ competencia, periodo })
      .eq('competencia_id', competencia_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating competition:', error)
      return NextResponse.json(
        { error: 'Error al actualizar competencia', details: error.message },
        { status: 500 }
      )
    }

    // Formatear respuesta
    const response = {
      competencia_id: data.competencia_id,
      competencia: data.competencia,
      fecha_inicio,
      fecha_fin
    }

    return NextResponse.json({
      message: 'Competencia actualizada exitosamente',
      data: response
    })

  } catch (error) {
    console.error('Unexpected error in PUT /api/competitions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Eliminar competencia
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '0')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de competencia requerido' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()

    // Verificar que existe
    const { data: existing } = await supabase
      .from('competencias')
      .select('competencia_id, competencia')
      .eq('competencia_id', id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Competencia no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si tiene registros asociados
    const { data: registros } = await supabase
      .from('registros')
      .select('registro_id')
      .eq('competencia_id', id)
      .limit(1)

    if (registros && registros.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar: competencia con registros asociados' },
        { status: 409 }
      )
    }

    // Eliminar
    const { error } = await supabase
      .from('competencias')
      .delete()
      .eq('competencia_id', id)

    if (error) {
      console.error('Error deleting competition:', error)
      return NextResponse.json(
        { error: 'Error al eliminar competencia', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Competencia eliminada exitosamente',
      data: { competencia_id: id, competencia: existing.competencia }
    })

  } catch (error) {
    console.error('Unexpected error in DELETE /api/competitions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 