import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/analytics/comparison
 * Compara métricas entre múltiples nadadores en la misma prueba
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const swimmersParam = searchParams.get('swimmers')
    const pruebaId = searchParams.get('prueba')
    const competenciaId = searchParams.get('competencia')
    const faseId = searchParams.get('fase')

    if (!swimmersParam || !pruebaId) {
      return NextResponse.json(
        { success: false, error: 'Parámetros swimmers y prueba son requeridos' },
        { status: 400 }
      )
    }

    const swimmerIds = swimmersParam.split(',').map(id => parseInt(id.trim()))
    
    if (swimmerIds.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Se requieren al menos 2 nadadores para comparar' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()

    // Construir query con filtros opcionales
    let query = supabase
      .from('registros')
      .select(`
        *,
        nadadores!inner(id_nadador, nombre),
        metricas!inner(metrica_id, nombre, tipo),
        fases(fase_id, nombre),
        competencias(competencia_id, competencia)
      `)
      .eq('prueba_id', parseInt(pruebaId))
      .in('id_nadador', swimmerIds)

    // Aplicar filtros opcionales
    if (competenciaId) {
      query = query.eq('competencia_id', parseInt(competenciaId))
    }
    
    if (faseId) {
      query = query.eq('fase_id', parseInt(faseId))
    }

    const { data: registros, error } = await query.order('fecha', { ascending: false })

    if (error) {
      console.error('Error fetching comparison data:', error)
      return NextResponse.json(
        { success: false, error: 'Error al cargar datos de comparación' },
        { status: 500 }
      )
    }

    // Agrupar datos por nadador y obtener el registro más reciente de cada uno
    const groupedBySwimmer = new Map()

    registros?.forEach(registro => {
      const swimmerId = registro.id_nadador
      if (!groupedBySwimmer.has(swimmerId)) {
        groupedBySwimmer.set(swimmerId, {
          swimmer_id: swimmerId,
          swimmer_name: registro.nadadores.nombre,
          fecha: registro.fecha,
          fase: registro.fases?.nombre || 'Sin fase',
          competencia: registro.competencias?.competencia || 'Sin competencia',
          metricas: {}
        })
      }
      
      const swimmerData = groupedBySwimmer.get(swimmerId)
      swimmerData.metricas[registro.metricas.nombre] = parseFloat(registro.valor.toString())
    })

    const comparisonData = Array.from(groupedBySwimmer.values())

    return NextResponse.json({ 
      success: true, 
      data: comparisonData 
    })
    
  } catch (error) {
    console.error('Unexpected error in /api/analytics/comparison:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/analytics/comparison
 * Compara métricas entre registros específicos de nadadores
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { records, prueba, competencia } = body

    if (!records || !Array.isArray(records) || records.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Se requieren al menos 2 registros para comparar' },
        { status: 400 }
      )
    }

    if (!prueba || !competencia) {
      return NextResponse.json(
        { success: false, error: 'Parámetros prueba y competencia son requeridos' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()

    // Obtener registros específicos para cada nadador
    const comparisonPromises = records.map(async (record) => {

      const { data: registros, error } = await supabase
        .from('registros')
        .select(`
          *,
          nadadores!inner(id_nadador, nombre),
          metricas!inner(metrica_id, nombre, tipo),
          fases(fase_id, nombre),
          competencias(competencia_id, competencia)
        `)
        .eq('id_nadador', record.swimmer_id)
        .eq('prueba_id', prueba)
        .eq('competencia_id', competencia)
        .eq('fase_id', record.fase_id)
        .eq('fecha', record.fecha)

      if (error) {
        console.error('Error fetching record:', error)
        return null
      }

      // Agrupar métricas para este nadador
      const metricas: { [key: string]: number } = {}
      registros?.forEach(registro => {
        metricas[registro.metricas.nombre] = parseFloat(registro.valor.toString())
      })

      const result = {
        swimmer_id: record.swimmer_id,
        swimmer_name: registros?.[0]?.nadadores?.nombre || record.swimmer_name || 'Nadador Desconocido',
        fecha: record.fecha,
        fase: registros?.[0]?.fases?.nombre || record.fase_nombre || 'Sin fase',
        competencia: registros?.[0]?.competencias?.competencia || 'Sin competencia',
        metricas
      };

      return result;
    })

    const results = await Promise.all(comparisonPromises)
    const validResults = results.filter(result => result !== null)

    return NextResponse.json({
      success: true,
      data: validResults,
      total: validResults.length
    })

  } catch (error) {
    console.error('Error in comparison POST API:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}