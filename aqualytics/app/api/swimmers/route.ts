/**
 * API Routes para Gestión de Nadadores
 * Endpoints CRUD completos para la entidad nadadores
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { validateSwimmer } from '@/lib/utils/validators'


// GET - Obtener todos los nadadores
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    
    // Parámetros de búsqueda opcionales
    const search = searchParams.get('search')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const includeStats = searchParams.get('includeStats') === 'true'

    let query = supabase
      .from('nadadores')
      .select('*')
      .order('nombre')

    // Aplicar filtro de búsqueda si existe
    if (search) {
      query = query.ilike('nombre', `%${search}%`)
    }

    // Aplicar paginación si se especifica
    if (limit) {
      const limitNum = parseInt(limit, 10)
      const offsetNum = offset ? parseInt(offset, 10) : 0
      query = query.range(offsetNum, offsetNum + limitNum - 1)
    }

    const { data: nadadores, error, count } = await query

    if (error) {
      console.error('Error fetching swimmers:', error)
      return NextResponse.json(
        { error: 'Error al obtener nadadores', details: error.message },
        { status: 500 }
      )
    }

    // Si se solicitan estadísticas, obtener información adicional
    let nadadoresConStats = nadadores

    if (includeStats && nadadores) {
      nadadoresConStats = await Promise.all(
        nadadores.map(async (nadador) => {
          // Obtener estadísticas básicas del nadador
          const { data: stats } = await supabase
            .from('registros')
            .select('registro_id, fecha, competencia_id')
            .eq('id_nadador', nadador.id_nadador)
            .order('fecha', { ascending: false })
            .limit(1)

          const { count: totalRegistros } = await supabase
            .from('registros')
            .select('*', { count: 'exact', head: true })
            .eq('id_nadador', nadador.id_nadador)

          return {
            ...nadador,
            totalRegistros: totalRegistros || 0,
            ultimaParticipacion: stats?.[0]?.fecha || null
          }
        })
      )
    }

    return NextResponse.json({
      success: true,
      data: nadadoresConStats,
      total: count,
      message: `${nadadores?.length || 0} nadadores encontrados`
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/swimmers:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo nadador
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos usando Zod
    const validation = validateSwimmer(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos de nadador inválidos', 
          validationErrors: validation.error.errors 
        },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()
    const { nombre, edad, peso } = validation.data

    // Verificar que no exista un nadador con el mismo nombre
    const { data: existingSwimmer } = await supabase
      .from('nadadores')
      .select('id_nadador, nombre')
      .eq('nombre', nombre)
      .single()

    if (existingSwimmer) {
      return NextResponse.json(
        { error: 'Ya existe un nadador con ese nombre' },
        { status: 409 }
      )
    }

    // Crear nuevo nadador
    const { data: newSwimmer, error } = await supabase
      .from('nadadores')
      .insert({
        nombre,
        edad: edad || null,
        peso: peso || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating swimmer:', error)
      return NextResponse.json(
        { error: 'Error al crear nadador', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: newSwimmer,
      message: `Nadador "${nombre}" creado exitosamente`
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error in POST /api/swimmers:', error)
    
    // Manejar errores de JSON malformado
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'JSON malformado en la solicitud' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar nadador existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id_nadador, ...updateData } = body

    if (!id_nadador) {
      return NextResponse.json(
        { error: 'ID de nadador requerido para actualización' },
        { status: 400 }
      )
    }

    // Validar datos de actualización
    const validation = validateSwimmer({ id_nadador, ...updateData })
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos de nadador inválidos', 
          validationErrors: validation.error.errors 
        },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()

    // Verificar que el nadador existe
    const { data: existingSwimmer, error: fetchError } = await supabase
      .from('nadadores')
      .select('id_nadador, nombre')
      .eq('id_nadador', id_nadador)
      .single()

    if (fetchError || !existingSwimmer) {
      return NextResponse.json(
        { error: 'Nadador no encontrado' },
        { status: 404 }
      )
    }

    // Si se está cambiando el nombre, verificar que no exista otro nadador con ese nombre
    if (updateData.nombre && updateData.nombre !== existingSwimmer.nombre) {
      const { data: duplicateSwimmer } = await supabase
        .from('nadadores')
        .select('id_nadador')
        .eq('nombre', updateData.nombre)
        .neq('id_nadador', id_nadador)
        .single()

      if (duplicateSwimmer) {
        return NextResponse.json(
          { error: 'Ya existe otro nadador con ese nombre' },
          { status: 409 }
        )
      }
    }

    // Actualizar nadador
    const { data: updatedSwimmer, error: updateError } = await supabase
      .from('nadadores')
      .update({
        nombre: updateData.nombre,
        edad: updateData.edad || null,
        peso: updateData.peso || null
      })
      .eq('id_nadador', id_nadador)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating swimmer:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar nadador', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedSwimmer,
      message: `Nadador "${updatedSwimmer.nombre}" actualizado exitosamente`
    })

  } catch (error) {
    console.error('Unexpected error in PUT /api/swimmers:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar nadador
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id_nadador = searchParams.get('id')

    if (!id_nadador) {
      return NextResponse.json(
        { error: 'ID de nadador requerido para eliminación' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()
    const swimmerIdNum = parseInt(id_nadador, 10)

    // Verificar que el nadador existe
    const { data: existingSwimmer, error: fetchError } = await supabase
      .from('nadadores')
      .select('id_nadador, nombre')
      .eq('id_nadador', swimmerIdNum)
      .single()

    if (fetchError || !existingSwimmer) {
      return NextResponse.json(
        { error: 'Nadador no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si el nadador tiene registros asociados
    const { count: recordsCount, error: countError } = await supabase
      .from('registros')
      .select('*', { count: 'exact', head: true })
      .eq('id_nadador', swimmerIdNum)

    if (countError) {
      console.error('Error checking swimmer records:', countError)
      return NextResponse.json(
        { error: 'Error al verificar registros del nadador' },
        { status: 500 }
      )
    }

    // Si tiene registros, no permitir eliminación (integridad referencial)
    if (recordsCount && recordsCount > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar el nadador porque tiene registros asociados',
          details: `El nadador tiene ${recordsCount} registros. Elimine primero los registros.`
        },
        { status: 409 }
      )
    }

    // Eliminar nadador
    const { error: deleteError } = await supabase
      .from('nadadores')
      .delete()
      .eq('id_nadador', swimmerIdNum)

    if (deleteError) {
      console.error('Error deleting swimmer:', deleteError)
      return NextResponse.json(
        { error: 'Error al eliminar nadador', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Nadador "${existingSwimmer.nombre}" eliminado exitosamente`
    })

  } catch (error) {
    console.error('Unexpected error in DELETE /api/swimmers:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 