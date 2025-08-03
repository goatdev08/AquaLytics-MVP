"""
Data Ingestion Function - AquaLytics API
Función serverless para ingesta de datos de natación
"""

import json
import logging
import pandas as pd
import io
from typing import Dict, Any, List, Optional
from datetime import datetime

from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

from utils.supabase_client import SupabaseClient, MetricRecord
from utils.csv_processor import CSVProcessor
from utils.data_validation import SwimmingDataValidator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataIngestionService:
    """Servicio de ingesta de datos"""
    
    def __init__(self):
        self.supabase_client = None
        self.validator = SwimmingDataValidator()
    
    async def initialize(self):
        """Inicializa el servicio si es necesario"""
        if not self.supabase_client:
            try:
                self.supabase_client = SupabaseClient()
                logger.info("Cliente de Supabase inicializado")
            except Exception as e:
                logger.error(f"Error inicializando Supabase: {str(e)}")
                raise
    
    async def ingest_csv_data(self, csv_content: str, filename: str) -> Dict[str, Any]:
        """Procesa e ingesta datos desde contenido CSV"""
        try:
            # Asegurar inicialización
            await self.initialize()
            
            # Leer CSV desde string
            df = pd.read_csv(io.StringIO(csv_content))
            
            # Procesar con CSVProcessor
            processor = CSVProcessor()
            
            # Guardar temporalmente para procesamiento
            import tempfile
            with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=True) as tmp:
                df.to_csv(tmp.name, index=False)
                processed_df, errors = processor.process_csv(tmp.name)
            
            # Verificar errores críticos
            critical_errors = [e for e in errors if e.severity == 'error']
            if critical_errors:
                return {
                    "success": False,
                    "message": "Se encontraron errores en el archivo",
                    "errors": [
                        {
                            "row": e.row,
                            "column": e.column,
                            "message": e.message
                        } for e in critical_errors
                    ],
                    "warnings": [
                        {
                            "row": e.row,
                            "column": e.column,
                            "message": e.message
                        } for e in errors if e.severity == 'warning'
                    ]
                }
            
            # Obtener registros para cargar
            records_data = processor.validate_for_upload(processed_df)
            
            if not records_data:
                return {
                    "success": False,
                    "message": "No se encontraron registros válidos para procesar",
                    "errors": [],
                    "warnings": []
                }
            
            # Convertir a MetricRecords
            metric_records = []
            pruebas_no_encontradas = set()
            
            for record in records_data:
                # Obtener o crear nadador
                nadador_id = self.supabase_client.get_or_create_nadador(record['nombre_nadador'])
                
                # Obtener ID de métrica
                metrica_id = self.supabase_client.get_metrica_id(record['nombre_metrica'])
                if not metrica_id:
                    continue
                
                # Obtener ID de prueba
                prueba_id = None
                if record.get('prueba'):
                    prueba_id = self.supabase_client.get_prueba_by_name(record['prueba'])
                    
                    if not prueba_id:
                        # Intentar parsear y buscar por detalles
                        prueba_parts = record['prueba'].split()
                        if len(prueba_parts) >= 2:
                            try:
                                distancia = int(prueba_parts[0].lower().replace('m', ''))
                                estilo = ' '.join(prueba_parts[1:])
                                prueba_id = self.supabase_client.get_prueba_by_details(
                                    distancia=distancia,
                                    estilo=estilo,
                                    curso='largo'
                                )
                            except:
                                pass
                    
                    if not prueba_id:
                        pruebas_no_encontradas.add(record['prueba'])
                        continue
                else:
                    continue
                
                # IDs opcionales
                competencia_id = None
                if record.get('competencia'):
                    competencia_id = self.supabase_client.get_or_create_competencia(record['competencia'])
                
                fase_id = None
                if record.get('fase'):
                    fase_id = self.supabase_client.get_fase_id(record['fase'])
                
                # Crear MetricRecord
                metric_record = MetricRecord(
                    id_nadador=nadador_id,
                    prueba_id=prueba_id,
                    metrica_id=metrica_id,
                    valor=record['valor'],
                    fecha=record['fecha'].strftime('%Y-%m-%d') if hasattr(record['fecha'], 'strftime') else str(record['fecha']),
                    segmento=record.get('segmento'),
                    competencia_id=competencia_id,
                    fase_id=fase_id
                )
                
                metric_records.append(metric_record)
            
            # Insertar registros
            if metric_records:
                result = self.supabase_client.insert_metric_records(metric_records)
                
                response = {
                    "success": result['success'],
                    "message": f"Se procesaron {result['inserted']} registros de métricas",
                    "stats": {
                        "total_records": len(records_data),
                        "inserted": result['inserted'],
                        "skipped": len(records_data) - result['inserted']
                    },
                    "warnings": [
                        {
                            "row": e.row,
                            "column": e.column,
                            "message": e.message
                        } for e in errors if e.severity == 'warning'
                    ],
                    "info": "Las métricas automáticas se calculan automáticamente mediante triggers en la base de datos."
                }
                
                if pruebas_no_encontradas:
                    response["warnings"].append({
                        "row": 0,
                        "column": "prueba",
                        "message": f"Pruebas no encontradas: {', '.join(pruebas_no_encontradas)}"
                    })
                
                return response
            else:
                return {
                    "success": False,
                    "message": "No se pudieron procesar registros válidos",
                    "errors": [],
                    "warnings": []
            }

        except Exception as e:
            logger.error(f"Error en ingesta CSV: {str(e)}")
            return {
                "success": False,
                "message": f"Error procesando archivo: {str(e)}",
                "errors": [str(e)],
                "warnings": []
            }
    
    async def ingest_single_record(self, record_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ingesta un registro individual de métrica"""
        try:
            await self.initialize()
            
            # Validación robusta usando SwimmingDataValidator
            logger.info(f"Validando registro individual: {record_data.keys()}")
            
            # Validar datos del registro usando el validador robusto
            validation_result = self.validator.validate_record_data(record_data)
            
            if not validation_result.is_valid:
                logger.warning(f"Validación fallida: {validation_result.errors}")
                return {
                    "success": False,
                    "message": "Datos inválidos",
                    "errors": validation_result.errors,
                    "warnings": validation_result.warnings
                }
            
            # Usar datos sanitizados de la validación
            sanitized_data = validation_result.sanitized_data
            logger.info("Validación exitosa, usando datos sanitizados")
            
            # Obtener o crear nadador usando datos sanitizados
            nadador_id = self.supabase_client.get_or_create_nadador(
                sanitized_data.get('nombre', record_data.get('nadador', '')),
                sanitized_data.get('edad'),
                sanitized_data.get('peso')
            )
            
            # Crear MetricRecord usando datos sanitizados
            metric_record = MetricRecord(
                id_nadador=nadador_id,
                prueba_id=sanitized_data.get('prueba_id', record_data['prueba_id']),
                metrica_id=sanitized_data.get('metrica_id', record_data['metrica_id']),
                valor=sanitized_data.get('valor', float(record_data['valor'])),
                fecha=sanitized_data.get('fecha', record_data['fecha']),
                segmento=sanitized_data.get('segmento', record_data.get('segmento')),
                competencia_id=sanitized_data.get('competencia_id', record_data.get('competencia_id')),
                fase_id=sanitized_data.get('fase_id', record_data.get('fase_id'))
            )
            
            # Insertar
            result = self.supabase_client.insert_metric_records([metric_record])
            
            if result['success']:
                return {
                    "success": True,
                    "message": "Registro insertado correctamente",
                    "data": metric_record.to_dict()
                }
            else:
                return {
                    "success": False,
                    "message": "Error al insertar registro",
                    "errors": result.get('errors', [])
                }
            
        except Exception as e:
            logger.error(f"Error en ingesta individual: {str(e)}")
            return {
                "success": False,
                "message": f"Error procesando registro: {str(e)}"
            }


# Instancia global del servicio
ingestion_service = DataIngestionService()


# Endpoints

async def ingest_csv(request: Request) -> JSONResponse:
    """Endpoint para ingesta de archivos CSV"""
    try:
        # Obtener el form data
        form = await request.form()
        file = form.get("file")
        
        if not file:
            return JSONResponse(
                {"success": False, "message": "No se proporcionó archivo"},
                status_code=400
            )
        
        # Leer contenido del archivo
        content = await file.read()
        csv_content = content.decode('utf-8')
        
        # Procesar
        result = await ingestion_service.ingest_csv_data(csv_content, file.filename)
        
        status_code = 200 if result['success'] else 400
        return JSONResponse(result, status_code=status_code)
        
    except Exception as e:
        logger.error(f"Error en endpoint CSV: {str(e)}")
        return JSONResponse(
            {"success": False, "message": f"Error interno: {str(e)}"},
            status_code=500
        )


async def ingest_record(request: Request) -> JSONResponse:
    """Endpoint para ingesta de registro individual"""
    try:
        data = await request.json()
        result = await ingestion_service.ingest_single_record(data)
        
        status_code = 200 if result['success'] else 400
        return JSONResponse(result, status_code=status_code)
        
    except json.JSONDecodeError:
        return JSONResponse(
            {"success": False, "message": "JSON inválido"},
            status_code=400
        )
    except Exception as e:
        logger.error(f"Error en endpoint record: {str(e)}")
        return JSONResponse(
            {"success": False, "message": f"Error interno: {str(e)}"},
            status_code=500
        )


# Configuración de rutas
routes = [
    Route('/ingest/csv', ingest_csv, methods=['POST']),
    Route('/ingest/record', ingest_record, methods=['POST'])
]

# Middleware
middleware = [
    Middleware(
        CORSMiddleware,
              allow_origins=['*'], 
        allow_methods=['POST', 'OPTIONS'],
        allow_headers=['*']
    )
]

# Aplicación Starlette
app = Starlette(routes=routes, middleware=middleware)

# Handler para Vercel
async def handler(request, context=None):
    """Handler principal para deployment serverless"""
    return await app(request.scope, request.receive, request.send) 