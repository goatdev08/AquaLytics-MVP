"""
Business Logic for Data Querying - AquaLytics API
"""
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from utils.supabase_client import SupabaseClient
from utils.db_constants import MetricaID, TIEMPO_15M_ID, TIEMPO_TOTAL_ID

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataQueryService:
    """Servicio de consultas de datos de natación"""
    
    def __init__(self):
        self.supabase_client = SupabaseClient()
        logger.info("Cliente de Supabase para consultas inicializado")
    
    async def get_rankings(self, limit: int = 10) -> Dict[str, Any]:
        """Obtiene rankings de nadadores basado en rendimiento usando métricas de Tiempo 15m"""
        try:
            logger.info(f"Obteniendo rankings usando métrica: {MetricaID.get_description(TIEMPO_15M_ID)}")
            result = self.supabase_client.client.table('registros') \
                .select('id_nadador, nadadores(nombre), valor, metrica_id, metricas(nombre)') \
                .eq('metrica_id', TIEMPO_15M_ID) \
                .order('valor', desc=True) \
                .limit(limit) \
                .execute()
            
            if not result.data:
                return {"success": True, "data": []}
            
            rankings = [
                {"id": r['id_nadador'], "name": r['nadadores']['nombre'] if r.get('nadadores') else 'N/A', "improvement": float(r['valor'])}
                for r in result.data
            ]
            return {"success": True, "data": rankings}
            
        except Exception as e:
            logger.error(f"Error obteniendo rankings: {str(e)}")
            return {"success": False, "error": "No ranking data available."}
    
    async def get_aggregate_data(self, metrics: List[str]) -> Dict[str, Any]:
        """Obtiene datos agregados para una lista de métricas."""
        try:
            aggregate_data = {}
            for metric in metrics:
                if metric == "total_swimmers":
                    result = self.supabase_client.client.table('nadadores').select('id_nadador', count='exact').execute()
                    aggregate_data['total_swimmers'] = result.count or 0
                elif metric == "active_competitions":
                    today = datetime.now().strftime('%Y-%m-%d')
                    result = self.supabase_client.client.table('competencias') \
                        .select('competencia_id', count='exact') \
                        .gte('periodo', f"[{today},{today}]") \
                        .execute()
                    aggregate_data['active_competitions'] = result.count or 0
                elif metric == "total_tests":
                    result = self.supabase_client.client.table('pruebas').select('id', count='exact').execute()
                    aggregate_data['total_tests'] = result.count or 0
            return {"success": True, "data": aggregate_data}
                
        except Exception as e:
            logger.error(f"Error obteniendo datos agregados: {str(e)}")
            return {"success": False, "error": f"Error obteniendo datos agregados: {str(e)}"}
    
    async def get_performance_progress(self, days: int = 30) -> Dict[str, Any]:
        """Obtiene progreso de rendimiento en los últimos días"""
        try:
            start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            result = self.supabase_client.client.table('registros') \
                .select('fecha, valor, metrica_id') \
                .gte('fecha', start_date) \
                .eq('metrica_id', TIEMPO_15M_ID) \
                .order('fecha') \
                .execute()
            
            if not result.data:
                return {"success": True, "data": []}
            
            date_values = {}
            for record in result.data:
                date_key = record['fecha']
                date_values.setdefault(date_key, []).append(float(record['valor']))
            
            progress_data = [{"date": date_key, "avg_speed": round(sum(values) / len(values), 2)}
                             for date_key, values in sorted(date_values.items())]
            
            return {"success": True, "data": progress_data}
            
        except Exception as e:
            logger.error(f"Error obteniendo progreso de rendimiento: {str(e)}")
            return {"success": False, "error": f"Error obteniendo progreso de rendimiento: {str(e)}"}
    
    async def get_swimmer_records(self, swimmer_id: int) -> Dict[str, Any]:
        """Obtiene registros de un nadador específico"""
        try:
            records = self.supabase_client.get_registros_by_swimmer(swimmer_id)
            return {"success": True, "data": records}
        except Exception as e:
            logger.error(f"Error obteniendo registros del nadador {swimmer_id}: {str(e)}")
            return {"success": False, "error": f"Error obteniendo registros del nadador: {str(e)}"}
    
    async def get_complete_test_record(self) -> Dict[str, Any]:
        """Obtiene registro completo de prueba usando la función de BD"""
        try:
            result = self.supabase_client.client.rpc('get_complete_test_record').execute()
            return {"success": True, "data": result.data}
        except Exception as e:
            logger.error(f"Error obteniendo registro completo: {str(e)}")
            return {"success": False, "error": f"Error obteniendo registro completo: {str(e)}"}

    # Función para obtener los mejores tiempos de una prueba
    async def get_best_times(self, style: str, distance: int, course: str) -> Dict[str, Any]:
        """Obtiene los 5 mejores tiempos para una prueba específica."""
        try:
            client = self.supabase_client
            
            # Normalizar el curso directamente (el frontend envía 'largo' o 'corto')
            curso_normalizado = course.lower()
            
            # Validar que el curso sea válido
            if curso_normalizado not in ['largo', 'corto']:
                logger.warning(f"Curso inválido: {course}. Usando 'corto' como default.")
                curso_normalizado = 'corto'
            
            # Normalizar el estilo (primera letra mayúscula, resto minúsculas)
            estilo_normalizado = style.capitalize()
            
            logger.info(f"Buscando mejores tiempos para: {distance}m {estilo_normalizado} curso {curso_normalizado}")
            
            # Primero obtener IDs de distancia y estilo directamente
            dist_result = client.client.table('distancias').select('*').eq('distancia', distance).execute()
            if not dist_result.data:
                logger.warning(f"No se encontró distancia para: {distance}m")
                return {"success": True, "data": []}
            distancia_id = dist_result.data[0]['distancia_id']
            logger.info(f"Distancia ID encontrada: {distancia_id}")
            
            estilo_result = client.client.table('estilos').select('*').eq('nombre', estilo_normalizado).execute()
            if not estilo_result.data:
                logger.warning(f"No se encontró estilo para: {estilo_normalizado}")
                return {"success": True, "data": []}
            estilo_id = estilo_result.data[0]['estilo_id']
            logger.info(f"Estilo ID encontrado: {estilo_id}")
            
            # Buscar la prueba directamente
            prueba_result = client.client.table('pruebas').select('*') \
                .eq('distancia_id', distancia_id) \
                .eq('estilo_id', estilo_id) \
                .eq('curso', curso_normalizado) \
                .execute()
            
            if not prueba_result.data:
                logger.warning(f"No se encontró prueba para: {distance}m {estilo_normalizado} ({curso_normalizado})")
                return {"success": True, "data": []}
            
            prueba_id = prueba_result.data[0]['id']
            logger.info(f"Prueba ID encontrada: {prueba_id}")
            
            # Verificar si hay registros para esta prueba específica
            registros_count = client.client.table('registros') \
                .select('registro_id', count='exact') \
                .eq('prueba_id', prueba_id) \
                .eq('metrica_id', TIEMPO_TOTAL_ID) \
                .execute()
                
            logger.info(f"Registros encontrados para prueba {prueba_id}: {registros_count.count}")
                
            if registros_count.count == 0:
                logger.info(f"No hay registros para la prueba: {distance}m {estilo_normalizado} ({curso_normalizado})")
                return {"success": True, "data": []}

            # Obtener los registros para esta prueba específica
            registros_query = client.client.table('registros') \
                .select('valor, nadadores(nombre), competencias(competencia)') \
                .eq('prueba_id', prueba_id) \
                .eq('metrica_id', TIEMPO_TOTAL_ID) \
                .order('valor', desc=False) \
                .limit(5) \
                .execute()

            formatted_data = [
                {"tiempo": record['valor'], "nadador": record['nadadores']['nombre'] if record.get('nadadores') else "N/A",
                 "competencia": record['competencias']['competencia'] if record.get('competencias') else "N/A"}
                for record in registros_query.data
            ]
            
            logger.info(f"Datos formateados para retorno: {len(formatted_data)} registros")
            return {"success": True, "data": formatted_data}
        except Exception as e:
            logger.error(f"Error obteniendo mejores tiempos: {str(e)}")
            return {"success": False, "error": f"Error obteniendo mejores tiempos: {str(e)}"}

    async def get_styles_distribution(self) -> Dict[str, Any]:
        """Obtiene la distribución de estilos más practicados."""
        try:
            client = self.supabase_client
            
            logger.info("Obteniendo distribución de estilos")
            
            # Usar la misma consulta que funciona en la query directa
            style_counts = {}
            
            # Obtener todos los registros con información de pruebas y estilos
            registros = client.client.table('registros') \
                .select('prueba_id') \
                .execute()
            
            if not registros.data:
                logger.warning("No se encontraron registros")
                return {"success": True, "data": []}
            
            # Obtener información de pruebas y estilos
            pruebas = client.client.table('pruebas') \
                .select('id, estilo_id') \
                .execute()
            
            estilos = client.client.table('estilos') \
                .select('estilo_id, nombre') \
                .execute()
            
            # Crear mapas para búsqueda rápida
            prueba_to_estilo = {p['id']: p['estilo_id'] for p in pruebas.data}
            estilo_to_nombre = {e['estilo_id']: e['nombre'] for e in estilos.data}
            
            # Contar registros por estilo
            nadadores_por_estilo = {}
            
            for registro in registros.data:
                prueba_id = registro['prueba_id']
                if prueba_id in prueba_to_estilo:
                    estilo_id = prueba_to_estilo[prueba_id]
                    if estilo_id in estilo_to_nombre:
                        estilo_nombre = estilo_to_nombre[estilo_id]
                        style_counts[estilo_nombre] = style_counts.get(estilo_nombre, 0) + 1
            
            # Contar nadadores únicos por estilo
            for estilo_nombre in style_counts.keys():
                # Obtener nadadores únicos para este estilo
                nadadores_query = client.client.table('registros') \
                    .select('id_nadador') \
                    .in_('prueba_id', [pid for pid, eid in prueba_to_estilo.items() 
                                        if eid in [eid for eid, name in estilo_to_nombre.items() 
                                                   if name == estilo_nombre]]) \
                    .execute()
                
                unique_swimmers = set(record['id_nadador'] for record in nadadores_query.data)
                nadadores_por_estilo[estilo_nombre] = len(unique_swimmers)
            
            # Formatear los datos
            formatted_data = [
                {
                    "estilo": style,
                    "total_registros": count,
                    "nadadores_distintos": nadadores_por_estilo.get(style, 0)
                }
                for style, count in sorted(style_counts.items(), key=lambda x: x[1], reverse=True)
            ]
            
            logger.info(f"Distribución de estilos obtenida: {len(formatted_data)} estilos")
            return {"success": True, "data": formatted_data}
            
        except Exception as e:
            logger.error(f"Error en get_styles_distribution: {str(e)}")
            return {"success": False, "error": str(e)}