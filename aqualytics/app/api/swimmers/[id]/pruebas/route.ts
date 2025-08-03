import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/swimmers/[id]/pruebas
 * Obtiene las pruebas únicas que ha realizado un nadador específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const swimmerId = parseInt(resolvedParams.id, 10)
    
    if (isNaN(swimmerId)) {
      return NextResponse.json(
        { error: 'ID de nadador inválido' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()

    // Verificar que el nadador existe
    const { data: swimmer, error: swimmerError } = await supabase
      .from('nadadores')
      .select('id_nadador, nombre')
      .eq('id_nadador', swimmerId)
      .single()

    if (swimmerError || !swimmer) {
      return NextResponse.json(
        { error: 'Nadador no encontrado' },
        { status: 404 }
      )
    }

    // Obtener las pruebas únicas que ha realizado este nadador
    const { data: pruebas, error: pruebasError } = await supabase
      .from('registros')
      .select(`
        pruebas!inner(
          id,
          nombre,
          distancia_id,
          estilo_id,
          curso,
          distancias!inner(distancia),
          estilos!inner(nombre)
        )
      `)
      .eq('id_nadador', swimmerId)
      .order('pruebas.nombre')

    if (pruebasError) {
      console.error('Error fetching swimmer pruebas:', pruebasError)
      return NextResponse.json(
        { error: 'Error al obtener pruebas del nadador' },
        { status: 500 }
      )
    }

    // Extraer y deduplicar las pruebas
    const uniquePruebas = new Map()
    
    pruebas?.forEach(registro => {
      const prueba = registro.pruebas
      if (!uniquePruebas.has(prueba.id)) {
        uniquePruebas.set(prueba.id, {
          id: prueba.id,
          nombre: prueba.nombre,
          distancia: prueba.distancias.distancia,
          estilo: prueba.estilos.nombre,
          curso: prueba.curso
        })
      }
    })

    const pruebasArray = Array.from(uniquePruebas.values())

    return NextResponse.json({
      success: true,
      data: pruebasArray,
      swimmer: swimmer,
      message: `${pruebasArray.length} pruebas encontradas para ${swimmer.nombre}`
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/swimmers/[id]/pruebas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 