"""
Data Preview Function - AquaLytics API
Función serverless para previsualización de métricas calculadas sin persistencia
"""

import json
import logging
from typing import Dict, Any

from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

# Eliminamos la dependencia de Supabase
# from utils.supabase_client import create_supabase_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataPreviewService:
    """Servicio de previsualización de métricas"""

    def __init__(self):
        # Eliminamos la inicialización del cliente de Supabase
        pass

    async def initialize(self):
        """Inicializa el servicio."""
        logger.info("Servicio de previsualización inicializado")
        return True

    async def calculate_preview_metrics(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calcula métricas automáticas para previsualización.
        Esta función implementa la lógica de cálculo directamente sin depender de la BD.
        """
        try:
            # Validación básica del payload
            required_keys = ['manual_metrics', 'distancia_total']
            if not all(key in data for key in required_keys):
                return {'success': False, 'errors': ['Faltan campos requeridos.'], 'data': None}

            # Extraer datos del payload
            manual_metrics = data.get('manual_metrics', {})
            distancia_total = data.get('distancia_total', 0)
            
            logger.info(f"Datos recibidos: manual_metrics={manual_metrics}, distancia_total={distancia_total}")
            
            # Métricas básicas
            tiempo_total = manual_metrics.get('tiempo_total', 0)
            brazadas_totales = manual_metrics.get('brazadas_totales', 0)
            segments = manual_metrics.get('segments', [])
            
            logger.info(f"Métricas extraídas: tiempo_total={tiempo_total}, brazadas_totales={brazadas_totales}, segments_count={len(segments)}")
            
            # Calcular métricas automáticas globales
            auto_metrics = {}
            
            if tiempo_total and tiempo_total > 0 and distancia_total > 0:
                auto_metrics['v_promedio'] = round(distancia_total / tiempo_total, 3)
                logger.info(f"Velocidad promedio calculada: {auto_metrics['v_promedio']}")
            
            if brazadas_totales and brazadas_totales > 0 and distancia_total > 0:
                auto_metrics['dist_x_brz'] = round(distancia_total / brazadas_totales, 2)
                logger.info(f"Distancia por brazada calculada: {auto_metrics['dist_x_brz']}")
            
            # Calcular métricas adicionales si hay suficientes datos
            if segments and len(segments) > 0:
                # Calcular flecha promedio si existe
                flechas = []
                for segment in segments:
                    if 'f' in segment and segment['f'] and segment['f'] > 0:
                        flechas.append(segment['f'])
                
                if flechas:
                    auto_metrics['f_promedio'] = round(sum(flechas) / len(flechas), 2)
                    auto_metrics['dist_sin_f'] = round(distancia_total - sum(flechas), 1)
                    logger.info(f"Flecha promedio: {auto_metrics['f_promedio']}, Distancia sin flecha: {auto_metrics['dist_sin_f']}")
            
            # Calcular métricas por segmento
            per_segment_metrics = []
            for i, segment in enumerate(segments):
                if not segment:
                    continue
                    
                segment_time = segment.get('segment_time', 0)
                segment_length = segment.get('length', 0)
                
                # Si no hay segment_time, intentar usar t15 o t25_split
                if not segment_time:
                    segment_time = segment.get('t15', 0) or segment.get('t25_split', 0)
                
                logger.info(f"Segmento {i+1}: tiempo={segment_time}, longitud={segment_length}")
                
                if segment_time and segment_time > 0 and segment_length and segment_length > 0:
                    velocity = round(segment_length / segment_time, 3)
                    per_segment_metrics.append({
                        'segmentLabel': f"Tramo {i + 1}",
                        'velocity': velocity
                    })
                    logger.info(f"Velocidad segmento {i+1}: {velocity} m/s")
            
            result = {
                'success': True,
                'data': {
                    'globalMetrics': auto_metrics,
                    'perSegmentMetrics': per_segment_metrics
                }
            }
            
            logger.info(f"Resultado final: {result}")
            return result

        except Exception as e:
            logger.error(f"Error calculando previsualización: {str(e)}")
            return {'success': False, 'errors': [f"Error interno: {str(e)}"], 'data': None}


# Instancia global
preview_service = DataPreviewService()


async def calculate_preview(request: Request) -> JSONResponse:
    """Endpoint para previsualización de métricas"""
    try:
        data = await request.json()
        logger.info(f"Request recibido en /preview/calculate: {data}")
        
        # Inicializar el servicio si es necesario
        await preview_service.initialize()
        
        result = await preview_service.calculate_preview_metrics(data)
        status_code = 200 if result['success'] else 400
        return JSONResponse(result, status_code=status_code)
        
    except json.JSONDecodeError:
        logger.error("Error decodificando JSON")
        return JSONResponse({'success': False, 'errors': ['JSON inválido']}, status_code=400)
    except Exception as e:
        logger.error(f"Error en endpoint de previsualización: {str(e)}")
        return JSONResponse({'success': False, 'errors': [f'Error interno: {str(e)}']}, status_code=500)


# Configuración Starlette
routes = [
    Route('/preview/calculate', calculate_preview, methods=['POST'])
]

middleware = [
    Middleware(CORSMiddleware, 
              allow_origins=['*'], 
              allow_methods=['POST'], 
              allow_headers=['*'])
]

app = Starlette(routes=routes, middleware=middleware)

# Handler para Vercel
async def handler(request, context=None):
    """Handler principal para deployment serverless"""
    return await app(request.scope, request.receive, request.send) 