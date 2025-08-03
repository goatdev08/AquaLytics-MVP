// =====================================================
// API Route: /api/pruebas
// Description: CRUD operations for swimming tests/events
// Author: AquaLytics System
// =====================================================

import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/pruebas
 * Obtiene todas las pruebas disponibles con información de distancia y estilo
 * Query parameters:
 * - curso: 'corto' | 'largo' - Filtra por tipo de curso
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const curso = searchParams.get('curso')
    
    const supabase = createSupabaseAdmin()
    
    let query = supabase
      .from('pruebas')
      .select(`
        id,
        nombre,
        curso,
        distancias!inner (
          distancia_id,
          distancia
        ),
        estilos!inner (
          estilo_id,
          nombre
        )
      `)
    
    // Filtrar por curso si se especifica
    if (curso && (curso === 'corto' || curso === 'largo')) {
      query = query.eq('curso', curso)
    }
    
    const { data, error } = await query
      .order('distancias(distancia)', { ascending: true })
      .order('estilos(nombre)', { ascending: true })

    if (error) {
      console.error('Error fetching pruebas:', error)
      return NextResponse.json(
        { success: false, error: 'Error al cargar las pruebas' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data || [] })
    
  } catch (error) {
    console.error('Unexpected error in /api/pruebas:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 