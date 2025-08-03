/**
 * API Route: Comparación de Nadadores
 * Endpoint para comparar métricas entre dos nadadores en una prueba específica
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

// Schema para validar la request
const CompareSwimmersSchema = z.object({
  swimmer1_id: z.number(),
  swimmer2_id: z.number(),
  prueba_id: z.number(),
  competencia_id: z.number().optional(),
});

interface ComparisonMetric {
  metric_name: string;
  swimmer1_value: number;
  swimmer2_value: number;
  difference: number;
  percentage_diff: number;
  unit: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    const body = await request.json();

    // Validar los datos de entrada
    const validatedData = CompareSwimmersSchema.parse(body);
    const { swimmer1_id, swimmer2_id, prueba_id } = validatedData;

    console.log(`🏊‍♂️ Comparando nadadores ${swimmer1_id} vs ${swimmer2_id} en prueba ${prueba_id}`);

    // Obtener las métricas más recientes de ambos nadadores para la prueba especificada
    const { data: swimmer1Metrics, error: error1 } = await supabase
      .from('registros')
      .select(`
        valor,
        metricas:metrica_id (
          nombre,
          tipo
        )
      `)
      .eq('id_nadador', swimmer1_id)
      .eq('prueba_id', prueba_id)
      .order('fecha', { ascending: false });

    const { data: swimmer2Metrics, error: error2 } = await supabase
      .from('registros')
      .select(`
        valor,
        metricas:metrica_id (
          nombre,
          tipo
        )
      `)
      .eq('id_nadador', swimmer2_id)
      .eq('prueba_id', prueba_id)
      .order('fecha', { ascending: false });

    if (error1 || error2) {
      console.error('Error obteniendo métricas:', error1 || error2);
      return NextResponse.json(
        { 
          success: false,
          error: 'Error al obtener las métricas de los nadadores' 
        },
        { status: 500 }
      );
    }

    // Verificar que ambos nadadores tengan datos
    if (!swimmer1Metrics || swimmer1Metrics.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No se encontraron datos para el primer nadador en esta prueba' 
        },
        { status: 404 }
      );
    }

    if (!swimmer2Metrics || swimmer2Metrics.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No se encontraron datos para el segundo nadador en esta prueba' 
        },
        { status: 404 }
      );
    }

    // Procesar las métricas y crear la comparación
    const comparisonData: ComparisonMetric[] = [];
    
    // Crear mapas para facilitar la comparación
    const swimmer1Map = new Map<string, number>();
    const swimmer2Map = new Map<string, number>();

    swimmer1Metrics.forEach(metric => {
      if (metric.metricas?.nombre) {
        swimmer1Map.set(metric.metricas.nombre, metric.valor);
      }
    });

    swimmer2Metrics.forEach(metric => {
      if (metric.metricas?.nombre) {
        swimmer2Map.set(metric.metricas.nombre, metric.valor);
      }
    });

    // Crear comparaciones para las métricas comunes
    swimmer1Map.forEach((value1, metricName) => {
      const value2 = swimmer2Map.get(metricName);
      
      if (value2 !== undefined) {
        const difference = value1 - value2;
        const percentageDiff = value2 !== 0 ? (difference / value2) * 100 : 0;
        
        // Determinar la unidad basada en el nombre de la métrica
        let unit = '';
        if (metricName.toLowerCase().includes('tiempo') || metricName.toLowerCase().includes('t_')) {
          unit = 's';
        } else if (metricName.toLowerCase().includes('velocidad')) {
          unit = 'm/s';
        } else if (metricName.toLowerCase().includes('frecuencia')) {
          unit = 'Hz';
        } else {
          unit = 'units';
        }

        comparisonData.push({
          metric_name: metricName,
          swimmer1_value: value1,
          swimmer2_value: value2,
          difference,
          percentage_diff: percentageDiff,
          unit
        });
      }
    });

    // Ordenar por tipo de métrica (tiempos primero)
    comparisonData.sort((a, b) => {
      if (a.unit === 's' && b.unit !== 's') return -1;
      if (a.unit !== 's' && b.unit === 's') return 1;
      return a.metric_name.localeCompare(b.metric_name);
    });

    console.log(`✅ Comparación completada: ${comparisonData.length} métricas comunes encontradas`);

    return NextResponse.json({
      success: true,
      data: comparisonData,
      message: `Comparación exitosa entre los dos nadadores`
    });

  } catch (error) {
    console.error('Error en comparación de nadadores:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Datos de entrada inválidos',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
} 