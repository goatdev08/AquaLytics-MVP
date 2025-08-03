/**
 * API Route: Registros Completos - Distribución por Estilos
 * Endpoint para obtener conteos de registros completos (pruebas únicas) agrupados por estilo
 * Utiliza la misma lógica que el endpoint de swimmers para contar pruebas completas
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

interface StyleDistributionData {
  estilo: string;
  total_registros_completos: number;
  nadadores_distintos: number;
}

/**
 * GET - Obtener distribución de estilos basada en registros completos
 * Cuenta pruebas únicas (agrupadas por prueba_id + fecha) por estilo
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const includeSwimmerCount = searchParams.get('includeSwimmerCount') === 'true';

    console.log('🎯 Obteniendo distribución de estilos basada en registros completos...');

    // Obtener todos los registros con información de pruebas y estilos
    // Usamos la misma lógica que el endpoint de swimmers para contar registros completos
    const { data: registros, error: registrosError } = await supabase
      .from('registros')
      .select(`
        prueba_id,
        fecha,
        id_nadador,
        pruebas!inner (
          id,
          estilo_id,
          estilos!inner (
            estilo_id,
            nombre
          )
        )
      `);

    if (registrosError) {
      console.error('Error obteniendo registros:', registrosError);
      return NextResponse.json(
        { error: 'Error al obtener registros', details: registrosError.message },
        { status: 500 }
      );
    }

    if (!registros || registros.length === 0) {
      console.log('⚠️ No se encontraron registros');
      return NextResponse.json({
        success: true,
        data: [],
        total_registros_completos: 0,
        total_nadadores_unicos: 0
      });
    }

    // Procesar registros para contar pruebas completas por estilo
    const stylesCompleteRecords = new Map<string, Set<string>>(); // estilo -> Set de "prueba_id-fecha"
    const stylesSwimmers = new Map<string, Set<number>>(); // estilo -> Set de id_nadador
    const allSwimmers = new Set<number>(); // Set global de nadadores únicos

    registros.forEach(registro => {
      // Extraer información anidada
      const prueba = registro.pruebas;
      if (!prueba || !prueba.estilos) {
        console.warn('Registro sin información de prueba/estilo:', registro);
        return;
      }

      const estiloNombre = prueba.estilos.nombre;
      const pruebaId = registro.prueba_id;
      const fecha = registro.fecha;
      const nadadorId = registro.id_nadador;

      // Crear clave única para la prueba completa
      const pruebaCompleta = `${pruebaId}-${fecha}`;

      // Agregar a conteo de registros completos
      if (!stylesCompleteRecords.has(estiloNombre)) {
        stylesCompleteRecords.set(estiloNombre, new Set());
      }
      stylesCompleteRecords.get(estiloNombre)!.add(pruebaCompleta);

      // Agregar a conteo de nadadores únicos por estilo si se solicita
      if (includeSwimmerCount) {
        if (!stylesSwimmers.has(estiloNombre)) {
          stylesSwimmers.set(estiloNombre, new Set());
        }
        stylesSwimmers.get(estiloNombre)!.add(nadadorId);
      }

      // Agregar al conteo global de nadadores únicos
      allSwimmers.add(nadadorId);
    });

    // Formatear datos para respuesta
    const distributionData: StyleDistributionData[] = Array.from(stylesCompleteRecords.entries())
      .map(([estilo, pruebasCompletasSet]) => ({
        estilo,
        total_registros_completos: pruebasCompletasSet.size,
        nadadores_distintos: includeSwimmerCount 
          ? stylesSwimmers.get(estilo)?.size || 0 
          : 0
      }))
      .sort((a, b) => b.total_registros_completos - a.total_registros_completos);

    // Calcular total de registros completos
    const totalRegistrosCompletos = distributionData.reduce(
      (sum, style) => sum + style.total_registros_completos, 
      0
    );

    // Usar el conteo global único de nadadores
    const totalNadadoresUnicos = allSwimmers.size;

    console.log(`✅ Distribución de estilos obtenida: ${distributionData.length} estilos, ${totalRegistrosCompletos} registros completos totales, ${totalNadadoresUnicos} nadadores únicos`);

    return NextResponse.json({
      success: true,
      data: distributionData,
      total_registros_completos: totalRegistrosCompletos,
      total_nadadores_unicos: totalNadadoresUnicos, // Este es el correcto
      message: `${distributionData.length} estilos encontrados`
    });

  } catch (error) {
    console.error('Error inesperado en GET /api/registros-completos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 