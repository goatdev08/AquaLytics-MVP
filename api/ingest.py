"""
Data Ingestion Function - AquaLytics API
Función serverless para ingesta de datos de natación con cálculo automático de métricas
"""

import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

# Importar utilidades locales
from utils.supabase_client import create_supabase_client, MetricRecord
from utils.data_validation import SwimmingDataValidator
from utils.csv_processor import process_csv_data
from calculations.swimming_metrics import SwimmingMetricsCalculator, MetricCalculationInput

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataIngestionService:
    """Servicio de ingesta de datos de natación"""
    
    def __init__(self):
        self.db_client = create_supabase_client()
        self.validator = SwimmingDataValidator()
        self.metrics_calculator = SwimmingMetricsCalculator()
        self.reference_cache = {}
    
    async def initialize(self):
        """Inicializa conexiones y carga datos de referencia"""
        success = await self.db_client.connect()
        if not success:
            raise RuntimeError("No se pudo conectar a la base de datos")
        
        self.reference_cache = await self.db_client.get_reference_data()
        logger.info("Servicio de ingesta inicializado")
    
    def find_reference_id(self, table: str, value: str) -> Optional[int]:
        """Busca ID en tablas de referencia"""
        if table not in self.reference_cache:
            return None
        
        field_map = {
            'distances': ('distancia', 'distancia_id'),
            'strokes': ('estilo', 'estilo_id'),
            'phases': ('fase', 'fase_id'),
            'parameters': ('parametro', 'parametro_id')
        }
        
        if table not in field_map:
            return None
        
        search_field, id_field = field_map[table]
        value_lower = str(value).lower().strip()
        
        for item in self.reference_cache[table]:
            if str(item.get(search_field, '')).lower().strip() == value_lower:
                return item.get(id_field)
        
        return None
    
    async def process_single_record(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Procesa un registro individual de métricas"""
        try:
            # Validar métricas manuales
            validation = self.validator.validate_manual_metrics(data)
            if not validation.is_valid:
                return {'success': False, 'errors': validation.errors, 'data': None}
            
            manual_data = validation.sanitized_data
            
            # Calcular métricas automáticas
            calc_input = MetricCalculationInput(
                t25_1=manual_data['t25_1'],
                t25_2=manual_data['t25_2'],
                t_total=manual_data['t_total'],
                brz_total=manual_data['brz_total'],
                f1=manual_data['f1'],
                f2=manual_data['f2'],
                distance=data.get('distancia', 50.0)
            )
            
            calc_result = self.metrics_calculator.calculate_all_metrics(calc_input)
            if not calc_result.success:
                return {'success': False, 'errors': calc_result.errors, 'data': None}
            
            # Resolver nadador (crear si no existe)
            swimmer_name = data.get('nadador', '').strip()
            swimmers = await self.db_client.get_swimmers()
            swimmer_id = None
            
            for swimmer in swimmers:
                if swimmer['nombre'].lower().strip() == swimmer_name.lower():
                    swimmer_id = swimmer['id_nadador']
                    break
            
            if not swimmer_id:
                new_swimmer = await self.db_client.create_swimmer(swimmer_name)
                swimmer_id = new_swimmer['id_nadador']
            
            # Resolver competencia (crear si no existe)
            competition_name = data.get('competencia', '').strip()
            competitions = await self.db_client.get_competitions(limit=100)
            competition_id = None
            
            for comp in competitions:
                if comp['competencia'].lower().strip() == competition_name.lower():
                    competition_id = comp['competencia_id']
                    break
            
            if not competition_id:
                period = data.get('periodo', datetime.now().strftime('%Y'))
                new_comp = await self.db_client.create_competition(competition_name, period)
                competition_id = new_comp['competencia_id']
            
            # Buscar IDs de referencia
            distance_id = self.find_reference_id('distances', data.get('distancia', 50))
            stroke_id = self.find_reference_id('strokes', data.get('estilo', ''))
            phase_id = self.find_reference_id('phases', data.get('fase', ''))
            
            if not all([distance_id, stroke_id, phase_id]):
                missing = []
                if not distance_id: missing.append("distancia")
                if not stroke_id: missing.append("estilo")
                if not phase_id: missing.append("fase")
                
                return {
                    'success': False,
                    'errors': [f"Referencias no encontradas: {', '.join(missing)}"],
                    'data': None
                }
            
            # Crear registros de métricas
            records = []
            fecha = data.get('fecha', datetime.now().strftime('%Y-%m-%d'))
            
            # Métricas manuales
            manual_metrics = [
                ('t25_1', manual_data['t25_1'], 1),
                ('t25_2', manual_data['t25_2'], 2),
                ('t_total', manual_data['t_total'], None),
                ('brz_1', manual_data['brz_1'], 1),
                ('brz_2', manual_data['brz_2'], 2),
                ('brz_total', manual_data['brz_total'], None),
                ('f1', manual_data['f1'], 1),
                ('f2', manual_data['f2'], 2)
            ]
            
            for param_name, value, segment in manual_metrics:
                param_id = self.find_reference_id('parameters', param_name)
                if param_id:
                    records.append(MetricRecord(
                        competencia_id=competition_id,
                        fecha=fecha,
                        id_nadador=swimmer_id,
                        distancia_id=distance_id,
                        estilo_id=stroke_id,
                        fase_id=phase_id,
                        parametro_id=param_id,
                        segmento=segment,
                        valor=value
                    ))
            
            # Métricas automáticas
            auto_metrics = calc_result.metrics
            automatic_params = [
                ('v1', auto_metrics.v1),
                ('v2', auto_metrics.v2),
                ('v_promedio', auto_metrics.v_promedio),
                ('dist_por_brz', auto_metrics.dist_por_brz),
                ('dist_sin_f', auto_metrics.dist_sin_f),
                ('f_promedio', auto_metrics.f_promedio)
            ]
            
            for param_name, value in automatic_params:
                param_id = self.find_reference_id('parameters', param_name)
                if param_id:
                    records.append(MetricRecord(
                        competencia_id=competition_id,
                        fecha=fecha,
                        id_nadador=swimmer_id,
                        distancia_id=distance_id,
                        estilo_id=stroke_id,
                        fase_id=phase_id,
                        parametro_id=param_id,
                        segmento=None,
                        valor=value
                    ))
            
            # Insertar registros
            created = await self.db_client.create_multiple_metrics(records)
            
            return {
                'success': True,
                'errors': [],
                'data': {
                    'swimmer_id': swimmer_id,
                    'competition_id': competition_id,
                    'manual_metrics': manual_data,
                    'automatic_metrics': auto_metrics.__dict__,
                    'records_created': len(created)
                }
            }
            
        except Exception as e:
            logger.error(f"Error procesando registro: {str(e)}")
            return {'success': False, 'errors': [f"Error interno: {str(e)}"], 'data': None}
    
    async def process_csv_upload(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Procesa carga masiva desde CSV"""
        try:
            # Procesar CSV
            csv_result = process_csv_data(file_content, filename)
            
            if not csv_result.success:
                return {
                    'success': False,
                    'errors': csv_result.errors,
                    'warnings': csv_result.warnings,
                    'total_rows': csv_result.total_rows,
                    'processed_rows': 0
                }
            
            # Procesar cada fila
            results = []
            errors = []
            
            for i, row_data in enumerate(csv_result.data):
                result = await self.process_single_record(row_data)
                results.append({
                    'row_number': i + 2,
                    'success': result['success'],
                    'data': result['data'] if result['success'] else None,
                    'errors': result['errors'] if not result['success'] else []
                })
                
                if not result['success']:
                    errors.extend([f"Fila {i + 2}: {error}" for error in result['errors']])
            
            successful = sum(1 for r in results if r['success'])
            
            return {
                'success': successful > 0,
                'errors': errors,
                'warnings': csv_result.warnings,
                'total_rows': csv_result.total_rows,
                'processed_rows': len(results),
                'successful_rows': successful,
                'failed_rows': len(results) - successful,
                'data': results
            }
            
        except Exception as e:
            logger.error(f"Error procesando CSV: {str(e)}")
            return {
                'success': False,
                'errors': [f"Error procesando archivo: {str(e)}"],
                'total_rows': 0,
                'processed_rows': 0
            }


# Instancia global
ingestion_service = DataIngestionService()


async def ingest_single_record(request: Request) -> JSONResponse:
    """Endpoint para registro individual"""
    try:
        data = await request.json()
        
        if not ingestion_service.db_client._is_connected:
            await ingestion_service.initialize()
        
        result = await ingestion_service.process_single_record(data)
        status_code = 200 if result['success'] else 400
        return JSONResponse(result, status_code=status_code)
        
    except json.JSONDecodeError:
        return JSONResponse({
            'success': False,
            'errors': ['JSON inválido'],
            'data': None
        }, status_code=400)
    except Exception as e:
        logger.error(f"Error en endpoint: {str(e)}")
        return JSONResponse({
            'success': False,
            'errors': [f'Error interno: {str(e)}'],
            'data': None
        }, status_code=500)


async def ingest_csv_file(request: Request) -> JSONResponse:
    """Endpoint para carga masiva CSV"""
    try:
        if not ingestion_service.db_client._is_connected:
            await ingestion_service.initialize()
        
        form = await request.form()
        csv_file = form.get('file')
        
        if not csv_file:
            return JSONResponse({
                'success': False,
                'errors': ['No se encontró archivo'],
                'data': []
            }, status_code=400)
        
        filename = getattr(csv_file, 'filename', 'upload.csv')
        file_content = await csv_file.read()
        
        if not file_content:
            return JSONResponse({
                'success': False,
                'errors': ['Archivo vacío'],
                'data': []
            }, status_code=400)
        
        result = await ingestion_service.process_csv_upload(file_content, filename)
        status_code = 200 if result['success'] else 400
        return JSONResponse(result, status_code=status_code)
        
    except Exception as e:
        logger.error(f"Error en CSV endpoint: {str(e)}")
        return JSONResponse({
            'success': False,
            'errors': [f'Error interno: {str(e)}'],
            'data': []
        }, status_code=500)


async def health_check(request: Request) -> JSONResponse:
    """Endpoint de health check"""
    try:
        if not ingestion_service.db_client._is_connected:
            await ingestion_service.initialize()
        
        db_health = await ingestion_service.db_client.health_check()
        
        return JSONResponse({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'database': db_health,
            'cache_loaded': bool(ingestion_service.reference_cache)
        })
        
    except Exception as e:
        return JSONResponse({
            'status': 'error',
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }, status_code=500)


# Configuración Starlette
routes = [
    Route('/ingest/record', ingest_single_record, methods=['POST']),
    Route('/ingest/csv', ingest_csv_file, methods=['POST']),
    Route('/health', health_check, methods=['GET'])
]

middleware = [
    Middleware(CORSMiddleware, 
              allow_origins=['*'], 
              allow_methods=['GET', 'POST'], 
              allow_headers=['*'])
]

app = Starlette(routes=routes, middleware=middleware)


# Handler para Vercel
async def handler(request, context=None):
    """Handler principal para deployment serverless"""
    return await app(request.scope, request.receive, request.send) 