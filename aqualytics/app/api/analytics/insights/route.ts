import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/analytics/insights
 * Genera insights avanzados de rendimiento para el equipo
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'

    // Calcular fecha de inicio basada en el timeframe
    const now = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '3m':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    const supabase = createSupabaseAdmin()

    // Crear estadísticas básicas manualmente
    // Estadísticas básicas
    const { data: nadadores } = await supabase.from('nadadores').select('id_nadador')
    const { data: registros } = await supabase
      .from('registros')
      .select('*')
      .gte('fecha', startDate.toISOString().split('T')[0])

    // Calcular estadísticas básicas
    const totalSwimmers = nadadores?.length || 0
    const totalRecords = registros?.length || 0

    // Calcular promedios básicos
    const timeTotal = registros?.filter(r => r.metrica_id === 9) || [] // Tiempo Total
    const velocityAvg = registros?.filter(r => r.metrica_id === 17) || [] // Velocidad Promedio
    const distPerStroke = registros?.filter(r => r.metrica_id === 18) || [] // Distancia por Brazada

    const avgTime = timeTotal.length > 0 
      ? timeTotal.reduce((sum, r) => sum + parseFloat(r.valor.toString()), 0) / timeTotal.length
      : 0

    const avgVelocity = velocityAvg.length > 0
      ? velocityAvg.reduce((sum, r) => sum + parseFloat(r.valor.toString()), 0) / velocityAvg.length
      : 0

    const avgEfficiency = distPerStroke.length > 0
      ? distPerStroke.reduce((sum, r) => sum + parseFloat(r.valor.toString()), 0) / distPerStroke.length
      : 0

      // Obtener mejores rendimientos
      const { data: topPerformers } = await supabase
        .from('registros')
        .select(`
          *,
          nadadores!inner(nombre),
          pruebas!inner(nombre),
          metricas!inner(nombre)
        `)
        .gte('fecha', startDate.toISOString().split('T')[0])
        .order('valor', { ascending: false })
        .limit(6)

      const processedTopPerformers = topPerformers?.slice(0, 6).map(record => ({
        swimmer_name: record.nadadores.nombre,
        metric: record.metricas.nombre,
        value: parseFloat(record.valor.toString()),
        prueba: record.pruebas.nombre
      })) || []

      const mockTeamStats = {
        total_swimmers: totalSwimmers,
        total_records: totalRecords,
        average_performance: {
          tiempo_promedio: avgTime,
          velocidad_promedio: avgVelocity,
          eficiencia_brazadas: avgEfficiency
        },
        top_performers: processedTopPerformers,
        improvement_trends: [
          {
            metric: 'Velocidad Promedio',
            trend: 'improving' as const,
            percentage: 5.2
          },
          {
            metric: 'Tiempo Total',
            trend: 'improving' as const,
            percentage: -3.1
          },
          {
            metric: 'Distancia por Brazada',
            trend: 'stable' as const,
            percentage: 0.8
          }
        ]
      }

      // Generar insights por métrica
      const metricInsights = [
        {
          metric_name: 'Velocidad Promedio',
          team_average: avgVelocity,
          best_value: Math.max(...(velocityAvg?.map(r => parseFloat(r.valor.toString())) || [0])),
          worst_value: Math.min(...(velocityAvg?.map(r => parseFloat(r.valor.toString())) || [0])),
          swimmers_analyzed: totalSwimmers,
          recommendations: [
            'Enfocar entrenamiento en técnica de brazada',
            'Mejorar la cadencia de patada',
            'Trabajar resistencia específica para mantener velocidad'
          ]
        },
        {
          metric_name: 'Tiempo Total',
          team_average: avgTime,
          best_value: Math.min(...(timeTotal?.map(r => parseFloat(r.valor.toString())) || [Infinity])),
          worst_value: Math.max(...(timeTotal?.map(r => parseFloat(r.valor.toString())) || [0])),
          swimmers_analyzed: totalSwimmers,
          recommendations: [
            'Optimizar salidas y virajes',
            'Mejorar estrategia de carrera',
            'Enfoque en entrenamiento de velocidad'
          ]
        }
      ]

    return NextResponse.json({
      success: true,
      data: {
        team_stats: mockTeamStats,
        metric_insights: metricInsights
      }
    })
    
  } catch (error) {
    console.error('Unexpected error in /api/analytics/insights:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 