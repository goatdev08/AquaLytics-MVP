"""
Servidor de prueba para CSV Processor
Test independiente del procesador CSV con métricas automáticas
"""

import json
import logging
from typing import Dict, Any
from datetime import datetime

from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

# Importar nuestro procesador actualizado
from utils.csv_processor import process_csv_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def process_csv_endpoint(request: Request) -> JSONResponse:
    """Endpoint de prueba para procesamiento CSV"""
    try:
        form = await request.form()
        csv_file = form.get('file')
        
        if not csv_file:
            return JSONResponse({
                'success': False,
                'error': 'No se encontró archivo',
                'data': []
            }, status_code=400)
        
        filename = getattr(csv_file, 'filename', 'upload.csv')
        file_content = await csv_file.read()
        
        if not file_content:
            return JSONResponse({
                'success': False,
                'error': 'Archivo vacío',
                'data': []
            }, status_code=400)
        
        # Procesar con nuestro nuevo procesador Pandas
        logger.info(f"Procesando archivo: {filename} ({len(file_content)} bytes)")
        result = process_csv_data(file_content, filename)
        
        # Preparar respuesta
        response_data = {
            'success': result.success,
            'total_rows': result.total_rows,
            'valid_rows': result.valid_rows,
            'errors': result.errors,
            'warnings': result.warnings,
            'encoding_detected': result.encoding_detected,
            'delimiter_detected': result.delimiter_detected,
            'processed_at': datetime.now().isoformat(),
            'data': result.data[:5] if result.data else []  # Solo primeras 5 filas para respuesta
        }
        
        # Log de métricas automáticas
        if result.data:
            first_row = result.data[0]
            auto_metrics = ['v1', 'v2', 'v_promedio', 'dist_x_brz', 'dist_sin_f', 'f_promedio']
            detected_metrics = [metric for metric in auto_metrics if metric in first_row]
            logger.info(f"Métricas automáticas detectadas: {len(detected_metrics)}")
        
        status_code = 200 if result.success else 400
        return JSONResponse(response_data, status_code=status_code)
        
    except Exception as e:
        logger.error(f"Error procesando CSV: {str(e)}")
        return JSONResponse({
            'success': False,
            'error': f'Error interno: {str(e)}',
            'data': []
        }, status_code=500)


async def health_check(request: Request) -> JSONResponse:
    """Health check simple"""
    return JSONResponse({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'csv-processor-test',
        'pandas_ready': True
    })


async def test_csv_sample(request: Request) -> JSONResponse:
    """Endpoint para probar con CSV de ejemplo"""
    try:
        # Leer el archivo de ejemplo
        import os
        sample_path = '../aqualytics/public/sample-data/ejemplo_natacion.csv'
        
        if not os.path.exists(sample_path):
            return JSONResponse({
                'success': False,
                'error': 'Archivo de ejemplo no encontrado',
                'data': []
            }, status_code=404)
        
        with open(sample_path, 'rb') as f:
            file_content = f.read()
        
        # Procesar archivo de ejemplo
        result = process_csv_data(file_content, 'ejemplo_natacion.csv')
        
        response_data = {
            'success': result.success,
            'total_rows': result.total_rows,
            'valid_rows': result.valid_rows,
            'errors': result.errors,
            'warnings': result.warnings,
            'encoding_detected': result.encoding_detected,
            'delimiter_detected': result.delimiter_detected,
            'processed_at': datetime.now().isoformat(),
            'sample_data': result.data  # Todas las filas del ejemplo
        }
        
        return JSONResponse(response_data, status_code=200)
        
    except Exception as e:
        logger.error(f"Error en test sample: {str(e)}")
        return JSONResponse({
            'success': False,
            'error': f'Error: {str(e)}',
            'data': []
        }, status_code=500)


# Configuración Starlette
routes = [
    Route('/process-csv', process_csv_endpoint, methods=['POST']),
    Route('/health', health_check, methods=['GET']),
    Route('/test-sample', test_csv_sample, methods=['GET'])
]

middleware = [
    Middleware(CORSMiddleware, 
              allow_origins=['*'], 
              allow_methods=['GET', 'POST'], 
              allow_headers=['*'])
]

app = Starlette(routes=routes, middleware=middleware)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 