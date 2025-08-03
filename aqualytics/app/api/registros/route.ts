import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

// Schema para una única métrica de un segmento
const MetricEntrySchema = z.object({
  metrica_id: z.number(),
  valor: z.number(),
  segmento: z.number().optional(),
});

// Schema para el body del POST
const CreateRegistrosSchema = z.object({
  id_nadador: z.number(),
  prueba_id: z.number(),
  competencia_id: z.number().optional(),
  fecha: z.string(),
  fase_id: z.number().optional(),
  metricas: z.array(MetricEntrySchema),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    const body = await request.json();

    const validatedData = CreateRegistrosSchema.parse(body);

    const registrosToInsert = validatedData.metricas.map(metrica => ({
      id_nadador: validatedData.id_nadador,
      prueba_id: validatedData.prueba_id,
      competencia_id: validatedData.competencia_id,
      fecha: validatedData.fecha,
      fase_id: validatedData.fase_id,
      metrica_id: metrica.metrica_id,
      valor: metrica.valor,
      segmento: metrica.segmento,
    }));

    const { data, error } = await supabase
      .from('registros')
      .insert(registrosToInsert)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al crear registros', details: (error as Error).message }, { status: 500 });
  }
} 