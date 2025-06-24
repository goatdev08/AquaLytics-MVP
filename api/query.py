"""
Data Querying Function - AquaLytics API
Función serverless para consultas de métricas de natación con filtros y análisis
"""

import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import statistics

from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

# Importar utilidades locales
from utils.supabase_client import create_supabase_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataQueryService:
    """Servicio de consultas de datos de natación"""
    
    def __init__(self):
        self.db_client = create_supabase_client()
        self.reference_cache = {}
    
    async def initialize(self):
        """Inicializa conexiones y carga datos de referencia"""
        success = await self.db_client.connect()
        if not success:
            raise RuntimeError("No se pudo conectar a la base de datos")
        
        self.reference_cache = await self.db_client.get_reference_data()
        logger.info("Servicio de consultas inicializado")
    
    def parse_filters(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Parsea filtros de consulta"""
        filters = {}
        
        # IDs numéricos
        for field in ['swimmer_id', 'competition_id', 'distance_id', 'stroke_id']:
            if field in params:
                try:
                    filters[field] = int(params[field])
                except ValueError:
                    pass
        
        # Fechas
        if 'date_from' in params:
            filters['date_from'] = params['date_from']
        if 'date_to' in params:
            filters['date_to'] = params['date_to']
        
        # Períodos relativos
        if 'period' in params:
            today = datetime.now()
            days_map = {
                'last_week': 7,
                'last_month': 30,
                'last_3_months': 90,
                'last_year': 365
            }
            
            if params['period'] in days_map:
                days = days_map[params['period']]
                filters['date_from'] = (today - timedelta(days=days)).strftime('%Y-%m-%d')
        
        # Límite
        if 'limit' in params:
            try:
                limit = int(params['limit'])
                if 1 <= limit <= 1000:
                    filters['limit'] = limit
            except ValueError:
                pass
        
        return filters
    
    async def get_metrics(self, filters: Dict[str, Any]) -> Dict[str, Any]:
        """Obtiene métricas con filtros"""
        try:
            metrics = await self.db_client.get_metrics_by_filters(**filters)
            
            # Enriquecer datos
            enriched = []
            for metric in metrics:
                enriched.append({
                    'registro_id': metric['registro_id'],
                    'fecha': metric['fecha'],
                    'valor': metric['valor'],
                    'segmento': metric['segmento'],
                    'nadador': metric.get('nadadores', {}).get('nombre', 'Desconocido'),
                    'competencia': metric.get('competencias', {}).get('competencia', 'Desconocida'),
                    'distancia': metric.get('distancias', {}).get('distancia', 'Desconocida'),
                    'estilo': metric.get('estilos', {}).get('estilo', 'Desconocido'),
                    'fase': metric.get('fases', {}).get('fase', 'Desconocida'),
                    'parametro': metric.get('parametros', {}).get('parametro', 'Desconocido'),
                    'tipo': metric.get('parametros', {}).get('tipo', 'manual')
                })
            
            return {
                'success': True,
                'data': enriched,
                'total': len(enriched),
                'filters': filters
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo métricas: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'data': []
            }
    
    def calculate_stats(self, values: List[float]) -> Dict[str, Any]:
        """Calcula estadísticas básicas"""
        if not values:
            return {}
        
        try:
            return {
                'count': len(values),
                'mean': round(statistics.mean(values), 3),
                'median': round(statistics.median(values), 3),
                'min': round(min(values), 3),
                'max': round(max(values), 3),
                'std_dev': round(statistics.stdev(values), 3) if len(values) > 1 else 0.0
            }
        except Exception:
            return {'error': 'Error calculando estadísticas'}
    
    async def get_aggregated(self, filters: Dict[str, Any], group_by: str = 'parameter') -> Dict[str, Any]:
        """Obtiene métricas agregadas"""
        try:
            result = await self.get_metrics(filters)
            if not result['success']:
                return result
            
            metrics = result['data']
            groups = {}
            
            # Campo de agrupación
            field_map = {
                'swimmer': 'nadador',
                'competition': 'competencia',
                'distance': 'distancia',
                'stroke': 'estilo',
                'parameter': 'parametro'
            }
            
            group_field = field_map.get(group_by, 'parametro')
            
            # Agrupar datos
            for metric in metrics:
                key = metric[group_field]
                if key not in groups:
                    groups[key] = []
                groups[key].append(metric)
            
            # Calcular estadísticas por grupo
            aggregated = {}
            for group_name, group_metrics in groups.items():
                values = [m['valor'] for m in group_metrics]
                
                aggregated[group_name] = {
                    'statistics': self.calculate_stats(values),
                    'record_count': len(group_metrics),
                    'date_range': {
                        'from': min(m['fecha'] for m in group_metrics),
                        'to': max(m['fecha'] for m in group_metrics)
                    }
                }
            
            return {
                'success': True,
                'group_by': group_by,
                'groups': aggregated,
                'total_groups': len(aggregated)
            }
            
        except Exception as e:
            logger.error(f"Error en agregación: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'groups': {}
            }
    
    async def get_swimmer_progress(self, swimmer_id: int) -> Dict[str, Any]:
        """Obtiene progresión de un nadador"""
        try:
            result = await self.get_metrics({'swimmer_id': swimmer_id})
            if not result['success']:
                return result
            
            metrics = result['data']
            if not metrics:
                return {
                    'success': False,
                    'error': f"No hay datos para el nadador {swimmer_id}",
                    'data': []
                }
            
            # Ordenar por fecha
            metrics.sort(key=lambda x: x['fecha'])
            
            # Agrupar por parámetro
            progress = {}
            for metric in metrics:
                param = metric['parametro']
                if param not in progress:
                    progress[param] = []
                
                progress[param].append({
                    'fecha': metric['fecha'],
                    'valor': metric['valor'],
                    'competencia': metric['competencia']
                })
            
            # Calcular tendencias
            trends = {}
            for param, series in progress.items():
                if len(series) >= 2:
                    values = [p['valor'] for p in series]
                    first, last = values[0], values[-1]
                    change = last - first
                    
                    trends[param] = {
                        'direction': 'improving' if change < 0 else 'declining' if change > 0 else 'stable',
                        'change': round(change, 3),
                        'change_percent': round((change / first * 100), 2) if first != 0 else 0,
                        'points': len(series)
                    }
            
            return {
                'success': True,
                'swimmer_id': swimmer_id,
                'swimmer_name': metrics[0]['nadador'],
                'progress': progress,
                'trends': trends,
                'total_records': len(metrics)
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo progreso: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'data': []
            }
    
    async def get_reference_data(self) -> Dict[str, Any]:
        """Obtiene datos de referencia formateados"""
        try:
            if not self.reference_cache:
                self.reference_cache = await self.db_client.get_reference_data()
            
            # Obtener nadadores y competencias actuales
            swimmers = await self.db_client.get_swimmers(limit=100)
            competitions = await self.db_client.get_competitions(limit=100)
            
            formatted = {
                'swimmers': [
                    {'id': s['id_nadador'], 'name': s['nombre']} 
                    for s in swimmers
                ],
                'competitions': [
                    {'id': c['competencia_id'], 'name': c['competencia']} 
                    for c in competitions
                ],
                'distances': [
                    {'id': d['distancia_id'], 'value': d['distancia']} 
                    for d in self.reference_cache.get('distances', [])
                ],
                'strokes': [
                    {'id': s['estilo_id'], 'name': s['estilo']} 
                    for s in self.reference_cache.get('strokes', [])
                ],
                'phases': [
                    {'id': p['fase_id'], 'name': p['fase']} 
                    for p in self.reference_cache.get('phases', [])
                ],
                'parameters': {
                    'manual': [
                        {'id': p['parametro_id'], 'name': p['parametro']} 
                        for p in self.reference_cache.get('parameters', []) 
                        if p.get('tipo') != 'automatica'
                    ],
                    'automatic': [
                        {'id': p['parametro_id'], 'name': p['parametro']} 
                        for p in self.reference_cache.get('parameters', []) 
                        if p.get('tipo') == 'automatica'
                    ]
                }
            }
            
            return {'success': True, 'data': formatted}
            
        except Exception as e:
            logger.error(f"Error obteniendo referencias: {str(e)}")
            return {'success': False, 'error': str(e), 'data': {}}


# Instancia global
query_service = DataQueryService()


async def query_metrics(request: Request) -> JSONResponse:
    """Endpoint para consultar métricas"""
    try:
        if not query_service.db_client._is_connected:
            await query_service.initialize()
        
        params = dict(request.query_params)
        filters = query_service.parse_filters(params)
        result = await query_service.get_metrics(filters)
        
        status_code = 200 if result['success'] else 400
        return JSONResponse(result, status_code=status_code)
        
    except Exception as e:
        logger.error(f"Error en query_metrics: {str(e)}")
        return JSONResponse({
            'success': False,
            'error': str(e),
            'data': []
        }, status_code=500)


async def aggregate_metrics(request: Request) -> JSONResponse:
    """Endpoint para métricas agregadas"""
    try:
        if not query_service.db_client._is_connected:
            await query_service.initialize()
        
        params = dict(request.query_params)
        filters = query_service.parse_filters(params)
        group_by = params.get('group_by', 'parameter')
        
        result = await query_service.get_aggregated(filters, group_by)
        
        status_code = 200 if result['success'] else 400
        return JSONResponse(result, status_code=status_code)
        
    except Exception as e:
        logger.error(f"Error en aggregate_metrics: {str(e)}")
        return JSONResponse({
            'success': False,
            'error': str(e),
            'groups': {}
        }, status_code=500)


async def swimmer_progress(request: Request) -> JSONResponse:
    """Endpoint para progresión de nadador"""
    try:
        if not query_service.db_client._is_connected:
            await query_service.initialize()
        
        swimmer_id = request.path_params.get('swimmer_id')
        if not swimmer_id:
            return JSONResponse({
                'success': False,
                'error': 'ID de nadador requerido'
            }, status_code=400)
        
        try:
            swimmer_id = int(swimmer_id)
        except ValueError:
            return JSONResponse({
                'success': False,
                'error': 'ID de nadador inválido'
            }, status_code=400)
        
        result = await query_service.get_swimmer_progress(swimmer_id)
        
        status_code = 200 if result['success'] else 400
        return JSONResponse(result, status_code=status_code)
        
    except Exception as e:
        logger.error(f"Error en swimmer_progress: {str(e)}")
        return JSONResponse({
            'success': False,
            'error': str(e),
            'data': []
        }, status_code=500)


async def reference_data(request: Request) -> JSONResponse:
    """Endpoint para datos de referencia"""
    try:
        if not query_service.db_client._is_connected:
            await query_service.initialize()
        
        result = await query_service.get_reference_data()
        
        status_code = 200 if result['success'] else 500
        return JSONResponse(result, status_code=status_code)
        
    except Exception as e:
        logger.error(f"Error en reference_data: {str(e)}")
        return JSONResponse({
            'success': False,
            'error': str(e),
            'data': {}
        }, status_code=500)


async def health_check(request: Request) -> JSONResponse:
    """Health check endpoint"""
    try:
        if not query_service.db_client._is_connected:
            await query_service.initialize()
        
        db_health = await query_service.db_client.health_check()
        
        return JSONResponse({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'database': db_health,
            'cache_loaded': bool(query_service.reference_cache)
        })
        
    except Exception as e:
        return JSONResponse({
            'status': 'error',
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }, status_code=500)


# Configuración Starlette
routes = [
    Route('/query/metrics', query_metrics, methods=['GET']),
    Route('/query/aggregate', aggregate_metrics, methods=['GET']),
    Route('/query/swimmer/{swimmer_id}/progress', swimmer_progress, methods=['GET']),
    Route('/query/reference', reference_data, methods=['GET']),
    Route('/health', health_check, methods=['GET'])
]

middleware = [
    Middleware(CORSMiddleware, 
              allow_origins=['*'], 
              allow_methods=['GET'], 
              allow_headers=['*'])
]

app = Starlette(routes=routes, middleware=middleware)


# Handler para Vercel
async def handler(request, context=None):
    """Handler principal"""
    return await app(request.scope, request.receive, request.send) 