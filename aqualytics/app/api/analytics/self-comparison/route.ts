import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/analytics/self-comparison
 * Compara el mismo nadador en diferentes fechas/fases de la misma prueba
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const swimmerId = searchParams.get('swimmer')
    const pruebaId = searchParams.get('prueba')

    if (!swimmerId || !pruebaId) {
      return NextResponse.json(
        { success: false, error: 'Parámetros swimmer y prueba son requeridos' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()

    // Obtener información de la prueba
    const { data: pruebaInfo, error: pruebaError } = await supabase
      .from('pruebas')
      .select(`
        id,
        nombre,
        distancias(distancia),
        estilos(nombre)
      `)
      .eq('id', parseInt(pruebaId))
      .single()

    if (pruebaError || !pruebaInfo) {
      return NextResponse.json(
        { success: false, error: 'Prueba no encontrada' },
        { status: 404 }
      )
    }

    // Obtener información del nadador
    const { data: nadadorInfo, error: nadadorError } = await supabase
      .from('nadadores')
      .select('id_nadador, nombre')
      .eq('id_nadador', parseInt(swimmerId))
      .single()

    if (nadadorError || !nadadorInfo) {
      return NextResponse.json(
        { success: false, error: 'Nadador no encontrado' },
        { status: 404 }
      )
    }

    // Obtener todos los registros históricos del nadador para esta prueba
    const { data: registros, error } = await supabase
      .from('registros')
      .select(`
        *,
        metricas!inner(metrica_id, nombre, tipo),
        fases(fase_id, nombre)
      `)
      .eq('id_nadador', parseInt(swimmerId))
      .eq('prueba_id', parseInt(pruebaId))
      .order('fecha', { ascending: false })
      .order('registro_id', { ascending: false })

    if (error) {
      console.error('Error fetching self-comparison data:', error)
      return NextResponse.json(
        { success: false, error: 'Error al cargar datos de comparación personal' },
        { status: 500 }
      )
    }

    // Agrupar por fecha y fase
    const groupedByDate = new Map()

    registros?.forEach(registro => {
      const key = `${registro.fecha}-${registro.fases?.nombre || 'Sin fase'}`
      if (!groupedByDate.has(key)) {
        groupedByDate.set(key, {
          fecha: registro.fecha,
          fase: registro.fases?.nombre || 'Sin fase',
          metricas: {}
        })
      }
      
      const dateData = groupedByDate.get(key)
      dateData.metricas[registro.metricas.nombre] = parseFloat(registro.valor.toString())
    })

    const records = Array.from(groupedByDate.values())

    const selfComparisonData = {
      swimmer_id: parseInt(swimmerId),
      swimmer_name: nadadorInfo.nombre,
      prueba_info: {
        id: pruebaInfo.id,
        nombre: pruebaInfo.nombre,
        distancia: pruebaInfo.distancias?.distancia || 0,
        estilo: pruebaInfo.estilos?.nombre || ''
      },
      records
    }

    return NextResponse.json({ 
      success: true, 
      data: selfComparisonData 
    })
    
  } catch (error) {
    console.error('Unexpected error in /api/analytics/self-comparison:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 