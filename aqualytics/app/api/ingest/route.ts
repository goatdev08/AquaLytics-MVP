import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';
const USE_PYTHON_BACKEND = process.env.USE_PYTHON_BACKEND === 'true';

async function getMetricMapping(supabase: any) {
  const { data: metricas, error } = await supabase
    .from('metricas')
    .select('metrica_id, nombre, tipo');
    
  if (error) {
    console.error('Error obteniendo métricas:', error);
    return null;
  }
  
  const mapping: Record<string, number> = {};
  metricas.forEach((metrica: any) => {
    mapping[metrica.nombre] = metrica.metrica_id;
  });
  
  return mapping;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Si está configurado para usar Python, intentar primero
    if (USE_PYTHON_BACKEND && PYTHON_API_URL) {
      try {
        const response = await fetch(`${PYTHON_API_URL}/ingest/record`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error('Python backend error');
        }

        return NextResponse.json(data);
      } catch (pythonError) {
        console.warn('Python backend not available, falling back to direct Supabase');
      }
    }
    
    // Fallback: Usar Supabase directamente con trigger automático
    const supabase = createSupabaseAdmin();
    
    // Preparar registros MANUALES para inserción
    const registrosToInsert = body.metricas.map((metrica: any) => ({
      id_nadador: body.id_nadador,
      prueba_id: body.prueba_id,
      competencia_id: body.competencia_id,
      fecha: body.fecha,
      fase_id: body.fase_id,
      metrica_id: metrica.metrica_id,
      valor: metrica.valor,
      segmento: metrica.segmento
    }));
    
    // Insertar registros MANUALES
    // El trigger automático calculate_automatic_metrics se ejecutará automáticamente
    const { data: manualData, error: manualError } = await supabase
      .from('registros')
      .insert(registrosToInsert)
      .select();
    
    if (manualError) {
      console.error('Supabase error:', manualError);
      return NextResponse.json(
        { 
          success: false, 
          errors: [`Error al guardar métricas manuales: ${manualError.message}`], 
          data: null 
        },
        { status: 400 }
      );
    }

    // Esperar un momento para que el trigger procese las métricas automáticas
    await new Promise(resolve => setTimeout(resolve, 100));

    // Obtener todas las métricas (manuales + automáticas) que se guardaron
    const { data: allMetrics, error: queryError } = await supabase
      .from('registros')
      .select(`
        valor,
        segmento,
        metricas:metrica_id (
          metrica_id,
          nombre,
          tipo
        )
      `)
      .eq('id_nadador', body.id_nadador)
      .eq('prueba_id', body.prueba_id)
      .eq('competencia_id', body.competencia_id)
      .eq('fecha', body.fecha)
      .eq('fase_id', body.fase_id);

    if (queryError) {
      console.warn('Error consultando métricas resultantes:', queryError);
    }

    // Separar métricas manuales y automáticas para el reporte
    const manualCount = allMetrics?.filter(m => m.metricas?.tipo === 'M').length || 0;
    const automaticCount = allMetrics?.filter(m => m.metricas?.tipo === 'A').length || 0;
    
    return NextResponse.json({
      success: true,
      errors: [],
      data: {
        swimmer_id: body.id_nadador,
        competition_id: body.competencia_id,
        prueba_id: body.prueba_id,
        records_created: manualCount + automaticCount,
        manual_records: manualCount,
        automatic_records: automaticCount,
        message: 'Métricas guardadas. Las métricas automáticas se calcularon via trigger de PostgreSQL.'
      }
    });

  } catch (error) {
    console.error('Error in ingest endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        errors: [error instanceof Error ? error.message : 'Error al procesar la solicitud'], 
        data: null 
      },
      { status: 500 }
    );
  }
} 