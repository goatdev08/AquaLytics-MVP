import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export const revalidate = 0; // No cachear esta ruta

export async function POST() {
  try {
    const supabase = createSupabaseAdmin()

    // TODO: Implementar función refresh_performance_views según esquema DB real
    // Temporalmente comentado para evitar errores de compilación
    /*
    // Llamar a la función de PostgreSQL para refrescar las vistas
    const { error } = await supabase.rpc('refresh_performance_views')

    if (error) {
      console.error('Error refreshing materialized views:', error)
      return NextResponse.json(
        { success: false, error: 'Error al refrescar las vistas de rendimiento', details: error.message },
        { status: 500 }
      )
    }
    */

    return NextResponse.json({ success: true, message: 'Endpoint temporalmente deshabilitado' })

  } catch (error) {
    console.error('Unexpected error in refresh-views endpoint:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 