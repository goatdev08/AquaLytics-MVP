import { NextResponse } from 'next/server';
import { 
  getNadadores, 
  getCompetencias, 
  getDistancias, 
  getEstilos, 
  getFases, 
  getParametros,
  getRegistrosCompletos,
  probarConexion 
} from '@/lib/supabase';

export async function GET() {
  try {
    // Probar conexión básica
    const conexion = await probarConexion();
    
    if (!conexion.success) {
      return NextResponse.json({
        success: false,
        message: 'Error de conexión a la base de datos',
        error: conexion.error
      }, { status: 500 });
    }

    // Obtener datos de referencia
    const [nadadores, competencias, distancias, estilos, fases, parametros] = await Promise.all([
      getNadadores(),
      getCompetencias(),
      getDistancias(),
      getEstilos(),
      getFases(),
      getParametros()
    ]);

    // Obtener algunos registros de ejemplo
    const registrosEjemplo = await getRegistrosCompletos({ limite: 5 });

    // Estadísticas de la base de datos
    const estadisticas = {
      nadadores: nadadores.length,
      competencias: competencias.length,
      distancias: distancias.length,
      estilos: estilos.length,
      fases: fases.length,
      parametros: parametros.length,
      registros_ejemplo: registrosEjemplo.length
    };

    // Separar parámetros por tipo
    const parametrosManuales = parametros.filter(p => p.tipo === 'M');
    const parametrosAutomaticos = parametros.filter(p => p.tipo === 'A');

    return NextResponse.json({
      success: true,
      message: 'Conexión exitosa a Phoenixdb',
      data: {
        estadisticas,
        estructura: {
          nadadores: nadadores.slice(0, 3), // Solo primeros 3 para ejemplo
          competencias,
          distancias,
          estilos,
          fases,
          parametros: {
            manuales: parametrosManuales,
            automaticos: parametrosAutomaticos
          }
        },
        registros_ejemplo: registrosEjemplo.map(registro => ({
          registro_id: registro.registro_id,
          nadador: registro.nadador?.nombre || 'N/A',
          competencia: registro.competencia?.competencia || 'N/A',
          // TODO: Corregir JOINs según esquema DB real (registros -> pruebas -> distancias/estilos)
          distancia: 'N/A', // registro.distancia?.distancia (relación incorrecta)
          estilo: 'N/A', // registro.estilo?.estilo (relación incorrecta)
          fase: 'N/A', // registro.fase?.fase (relación incorrecta)
          parametro: 'N/A', // registro.metrica?.nombre (relación incorrecta) 
          tipo: 'N/A', // registro.metrica?.tipo (relación incorrecta)
          segmento: registro.segmento,
          valor: registro.valor,
          fecha: registro.fecha
        }))
      }
    });

  } catch (error) {
    console.error('Error en test de base de datos:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 