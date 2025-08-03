/**
 * API Routes para Gestión de Nadadores
 * Endpoints CRUD completos para la entidad nadadores
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { validateSwimmer } from '@/lib/utils/validators'
import { createLogger } from '@/lib/utils/logger'

const logger = createLogger('SwimmersAPI')

export const revalidate = 0 // <-- LA SOLUCIÓN: No cachear esta ruta

// GET - Obtener todos los nadadores (Refactorizado para leer datos en tiempo real)
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get('search')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const includeStats = searchParams.get('includeStats') === 'true'
    const competenciaId = searchParams.get('competencia')
    const pruebaId = searchParams.get('prueba')

    // Si se especifica una competencia (y opcionalmente una prueba), obtener nadadores disponibles
    if (competenciaId) {
      let query = supabase
        .from('registros')
        .select(`
          id_nadador,
          fecha,
          fase_id,
          nadadores(nombre),
          fases(nombre)
        `)
        .eq('competencia_id', parseInt(competenciaId))
      
      // Si también se especifica una prueba, filtrar por esa prueba específica
      if (pruebaId) {
        query = query.eq('prueba_id', parseInt(pruebaId))
      }
      
      const { data: swimmersInCompetition, error } = await query.order('fecha', { ascending: false })
      
      if (error) {
        logger.error('Error fetching swimmers for competition:', error)
        return NextResponse.json(
          { success: false, error: 'Error obteniendo nadadores de la competencia' },
          { status: 500 }
        )
      }
      
      // Agrupar por nadador y obtener registros únicos
      const swimmersMap = new Map()
      swimmersInCompetition?.forEach(record => {
        const swimmerId = record.id_nadador
        if (!swimmersMap.has(swimmerId)) {
          swimmersMap.set(swimmerId, {
            id_nadador: swimmerId,
            nombre: record.nadadores?.nombre || 'Sin nombre',
            fecha: record.fecha,
            fase_id: record.fase_id,
            fase_nombre: record.fases?.nombre || 'Sin fase',
            total_registros: 0
          })
        }
        swimmersMap.get(swimmerId).total_registros += 1
      })
      
      const result = Array.from(swimmersMap.values())
      
      const mensaje = pruebaId 
        ? `${result.length} nadadores encontrados en la competencia y prueba especificada`
        : `${result.length} nadadores encontrados en la competencia`
      
      return NextResponse.json({
        success: true,
        data: result,
        total: result.length,
        message: mensaje
      })
    }

    let query;

    // Construir la consulta base
    if (includeStats) {
      // Si se piden estadísticas, contamos las PRUEBAS COMPLETAS (no registros individuales)
      // Cada prueba completa = combinación única de (prueba_id + nadador_id + fecha)
      // CORREGIDO: Usar LEFT JOIN para incluir nadadores sin registros
      query = supabase
        .from('nadadores')
        .select(`
          *,
          registros(
            prueba_id,
            fecha,
            created_at
          )
        `)
    } else {
      // Si no, solo los datos del nadador
      query = supabase
      .from('nadadores')
      .select('*')
    }

    query.order('nombre');

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
      logger.error('Error fetching swimmers:', error)
      return NextResponse.json(
        { error: 'Error al obtener nadadores', details: error.message },
        { status: 500 }
      )
    }

    // Adaptar la estructura de datos para el frontend solo si se incluyen estadísticas
    let responseData = nadadores;

    if (includeStats && nadadores) {
      type SwimmerWithRegistros = typeof nadadores[number] & {
        registros: Array<{
          prueba_id: number;
          fecha: string;
          created_at: string;
        }>;
      };
      
      responseData = nadadores.map(nadador => {
        const nadadorConRegistros = nadador as SwimmerWithRegistros;
        
        // CORREGIDO: Manejar nadadores sin registros (registros puede ser null o array vacío)
        const registrosValidos = nadadorConRegistros.registros || [];
        
        // Contar pruebas ÚNICAS (agrupando por prueba_id + fecha)
        // Esto da el número real de pruebas completas realizadas
        const pruebasUnicas = new Set(
          registrosValidos.map(registro => 
            `${registro.prueba_id}-${registro.fecha}`
          )
        );
        
        // Encontrar la fecha más reciente de competencia
        const fechasCompetencia = registrosValidos
          .map(r => new Date(r.created_at))
          .sort((a, b) => b.getTime() - a.getTime());
        
          return {
            ...nadador,
          total_competencias: 0, // Placeholder - se podría calcular más adelante
          total_pruebas: 0, // Placeholder - se podría calcular más adelante  
          total_registros: pruebasUnicas.size, // CORREGIDO: ahora cuenta pruebas completas
          ultima_competencia: fechasCompetencia.length > 0 ? fechasCompetencia[0].toISOString() : null
          }
      });
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      total: count,
      message: `${nadadores?.length || 0} nadadores encontrados`
    })

  } catch (error) {
    logger.error('Unexpected error in GET /api/swimmers:', error)
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
      logger.error('Error creating swimmer:', error)
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
    logger.error('Unexpected error in POST /api/swimmers:', error)
    
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
      logger.error('Error updating swimmer:', updateError)
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
    logger.error('Unexpected error in PUT /api/swimmers:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar nadador (con borrado en cascada desde la BD)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de nadador requerido para eliminación' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()
    const swimmerIdNum = parseInt(id, 10)

    const { data: existingSwimmer, error: fetchError } = await supabase
      .from('nadadores')
      .select('nombre')
      .eq('id_nadador', swimmerIdNum)
      .single()

    if (fetchError || !existingSwimmer) {
      return NextResponse.json({ error: 'Nadador no encontrado' }, { status: 404 })
    }

    const { error: deleteError } = await supabase
      .from('nadadores')
      .delete()
      .eq('id_nadador', swimmerIdNum)

    if (deleteError) {
      logger.error('Error deleting swimmer:', deleteError)
      return NextResponse.json({ error: 'Error al eliminar nadador', details: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Nadador "${existingSwimmer.nombre}" y todos sus registros han sido eliminados.`
    })
  } catch (error) {
    logger.error('Unexpected error in DELETE /api/swimmers:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 