import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { createLogger } from '@/lib/utils/logger'

const logger = createLogger('AggregateAPI')

/**
 * GET /api/query/aggregate?metrics=total_swimmers,active_competitions,total_tests
 * Obtiene métricas agregadas para el dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metricsParam = searchParams.get('metrics') || ''
    const requestedMetrics = metricsParam.split(',').map(m => m.trim()).filter(Boolean)

    if (requestedMetrics.length === 0) {
      return NextResponse.json(
        { error: 'Se requieren métricas. Ejemplo: ?metrics=total_swimmers,active_competitions' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()
    const aggregateData: Record<string, number> = {}

    // Procesar cada métrica solicitada
    for (const metric of requestedMetrics) {
      try {
        switch (metric) {
          case 'total_swimmers':
            const { count: swimmersCount, error: swimmersError } = await supabase
              .from('nadadores')
              .select('*', { count: 'exact', head: true })
            
            if (swimmersError) {
              logger.error('Error fetching swimmers count:', swimmersError)
              aggregateData[metric] = 0
            } else {
              aggregateData[metric] = swimmersCount || 0
            }
            break

          case 'active_competitions':
            const { count: competitionsCount, error: competitionsError } = await supabase
              .from('competencias')
              .select('*', { count: 'exact', head: true })
            
            if (competitionsError) {
              logger.error('Error fetching competitions count:', competitionsError)
              aggregateData[metric] = 0
            } else {
              aggregateData[metric] = competitionsCount || 0
            }
            break

          case 'total_tests':
            // Contar registros únicos por combinación de nadador + prueba + competencia + fecha
            const { count: testsCount, error: testsError } = await supabase
              .from('registros')
              .select('*', { count: 'exact', head: true })
            
            if (testsError) {
              logger.error('Error fetching tests count:', testsError)
              aggregateData[metric] = 0
            } else {
              aggregateData[metric] = testsCount || 0
            }
            break

          case 'total_records':
            const { count: recordsCount, error: recordsError } = await supabase
              .from('registros')
              .select('*', { count: 'exact', head: true })
            
            if (recordsError) {
              logger.error('Error fetching records count:', recordsError)
              aggregateData[metric] = 0
            } else {
              aggregateData[metric] = recordsCount || 0
            }
            break

          default:
            logger.warn(`Métrica desconocida: ${metric}`)
            aggregateData[metric] = 0
        }
      } catch (metricError) {
        logger.error(`Error procesando métrica ${metric}:`, metricError)
        aggregateData[metric] = 0
      }
    }

    logger.info('Aggregate data fetched successfully:', aggregateData)

    return NextResponse.json({
      success: true,
      data: aggregateData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Error in aggregate endpoint:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}