"""
Supabase Client - AquaLytics API
Cliente de base de datos para operaciones CRUD con Supabase PostgreSQL
"""

import os
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
import logging
from datetime import datetime, date

from supabase import create_client, Client
from supabase.client import ClientOptions
from postgrest import APIError

logger = logging.getLogger(__name__)


@dataclass
class DatabaseConfig:
    """Configuración de la base de datos"""
    url: str
    anon_key: str
    service_role_key: str
    timeout: int = 30


@dataclass
class MetricRecord:
    """Estructura para registros de métricas"""
    competencia_id: int
    fecha: Union[str, date]
    id_nadador: int
    distancia_id: int
    estilo_id: int
    fase_id: int
    parametro_id: int
    segmento: Optional[int]
    valor: float
    registro_id: Optional[int] = None


class SupabaseClient:
    """Cliente de Supabase para operaciones de base de datos"""
    
    def __init__(self, config: Optional[DatabaseConfig] = None):
        if config is None:
            config = self._load_config_from_env()
        
        self.config = config
        self.client: Optional[Client] = None
        self._is_connected = False
        
        # Mapeo de tablas
        self.tables = {
            'swimmers': 'nadadores',
            'competitions': 'competencias',
            'distances': 'distancias',
            'strokes': 'estilos',
            'phases': 'fases',
            'parameters': 'parametros',
            'records': 'registros'
        }
    
    def _load_config_from_env(self) -> DatabaseConfig:
        """Carga configuración desde variables de entorno"""
        url = os.getenv('SUPABASE_URL')
        anon_key = os.getenv('SUPABASE_ANON_KEY')
        service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not all([url, anon_key, service_role_key]):
            raise ValueError("Faltan variables de entorno de Supabase")
        
        return DatabaseConfig(
            url=url,
            anon_key=anon_key,
            service_role_key=service_role_key
        )
    
    async def connect(self) -> bool:
        """Establece conexión con Supabase"""
        try:
            self.client = create_client(
                self.config.url,
                self.config.service_role_key,
                options=ClientOptions(
                    postgrest_client_timeout=self.config.timeout,
                    storage_client_timeout=self.config.timeout
                )
            )
            
            # Verificar conexión
            result = self.client.table(self.tables['swimmers']).select("id_nadador").limit(1).execute()
            self._is_connected = True
            logger.info("Conexión a Supabase establecida")
            return True
            
        except Exception as e:
            logger.error(f"Error conectando a Supabase: {str(e)}")
            self._is_connected = False
            return False
    
    def _ensure_connected(self):
        """Verifica que la conexión esté establecida"""
        if not self._is_connected or self.client is None:
            raise RuntimeError("Cliente no conectado. Llama a connect() primero.")
    
    # ========== OPERACIONES DE NADADORES ==========
    
    async def get_swimmers(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Obtiene lista de nadadores"""
        self._ensure_connected()
        
        try:
            query = self.client.table(self.tables['swimmers']).select("*")
            if limit:
                query = query.limit(limit)
            
            result = query.execute()
            return result.data
            
        except Exception as e:
            logger.error(f"Error obteniendo nadadores: {str(e)}")
            raise
    
    async def create_swimmer(self, nombre: str, edad: Optional[int] = None, peso: Optional[int] = None) -> Dict[str, Any]:
        """Crea un nuevo nadador"""
        self._ensure_connected()
        
        try:
            data = {'nombre': nombre}
            if edad is not None:
                data['edad'] = edad
            if peso is not None:
                data['peso'] = peso
            
            result = self.client.table(self.tables['swimmers']).insert(data).execute()
            
            if result.data:
                logger.info(f"Nadador creado: {result.data[0]['id_nadador']}")
                return result.data[0]
            
            raise RuntimeError("No se pudo crear el nadador")
            
        except Exception as e:
            logger.error(f"Error creando nadador: {str(e)}")
            raise
    
    # ========== OPERACIONES DE COMPETENCIAS ==========
    
    async def get_competitions(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Obtiene lista de competencias"""
        self._ensure_connected()
        
        try:
            query = self.client.table(self.tables['competitions']).select("*").order("competencia_id", desc=True)
            if limit:
                query = query.limit(limit)
            
            result = query.execute()
            return result.data
            
        except Exception as e:
            logger.error(f"Error obteniendo competencias: {str(e)}")
            raise
    
    async def create_competition(self, competencia: str, periodo: str) -> Dict[str, Any]:
        """Crea una nueva competencia"""
        self._ensure_connected()
        
        try:
            data = {'competencia': competencia, 'periodo': periodo}
            result = self.client.table(self.tables['competitions']).insert(data).execute()
            
            if result.data:
                logger.info(f"Competencia creada: {result.data[0]['competencia_id']}")
                return result.data[0]
            
            raise RuntimeError("No se pudo crear la competencia")
            
        except Exception as e:
            logger.error(f"Error creando competencia: {str(e)}")
            raise
    
    # ========== OPERACIONES DE MÉTRICAS ==========
    
    async def create_metric_record(self, metric: MetricRecord) -> Dict[str, Any]:
        """Crea un nuevo registro de métrica"""
        self._ensure_connected()
        
        try:
            data = {
                'competencia_id': metric.competencia_id,
                'fecha': metric.fecha if isinstance(metric.fecha, str) else metric.fecha.isoformat(),
                'id_nadador': metric.id_nadador,
                'distancia_id': metric.distancia_id,
                'estilo_id': metric.estilo_id,
                'fase_id': metric.fase_id,
                'parametro_id': metric.parametro_id,
                'segmento': metric.segmento,
                'valor': metric.valor
            }
            
            result = self.client.table(self.tables['records']).insert(data).execute()
            
            if result.data:
                logger.info(f"Registro de métrica creado: {result.data[0]['registro_id']}")
                return result.data[0]
            
            raise RuntimeError("No se pudo crear el registro de métrica")
            
        except Exception as e:
            logger.error(f"Error creando registro de métrica: {str(e)}")
            raise
    
    async def create_multiple_metrics(self, metrics: List[MetricRecord]) -> List[Dict[str, Any]]:
        """Crea múltiples registros de métricas en batch"""
        self._ensure_connected()
        
        try:
            data = []
            for metric in metrics:
                record = {
                    'competencia_id': metric.competencia_id,
                    'fecha': metric.fecha if isinstance(metric.fecha, str) else metric.fecha.isoformat(),
                    'id_nadador': metric.id_nadador,
                    'distancia_id': metric.distancia_id,
                    'estilo_id': metric.estilo_id,
                    'fase_id': metric.fase_id,
                    'parametro_id': metric.parametro_id,
                    'segmento': metric.segmento,
                    'valor': metric.valor
                }
                data.append(record)
            
            result = self.client.table(self.tables['records']).insert(data).execute()
            
            if result.data:
                logger.info(f"Creados {len(result.data)} registros de métricas en batch")
                return result.data
            
            raise RuntimeError("No se pudieron crear los registros de métricas")
            
        except Exception as e:
            logger.error(f"Error creando métricas en batch: {str(e)}")
            raise
    
    async def get_metrics_by_filters(self,
                                   swimmer_id: Optional[int] = None,
                                   competition_id: Optional[int] = None,
                                   distance_id: Optional[int] = None,
                                   stroke_id: Optional[int] = None,
                                   date_from: Optional[str] = None,
                                   date_to: Optional[str] = None,
                                   limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Obtiene métricas con filtros múltiples"""
        self._ensure_connected()
        
        try:
            query = self.client.table(self.tables['records']).select("""
                *,
                nadadores!inner(nombre),
                competencias!inner(competencia),
                distancias!inner(distancia),
                estilos!inner(estilo),
                fases!inner(fase),
                parametros!inner(parametro, tipo)
            """)
            
            # Aplicar filtros
            if swimmer_id:
                query = query.eq("id_nadador", swimmer_id)
            if competition_id:
                query = query.eq("competencia_id", competition_id)
            if distance_id:
                query = query.eq("distancia_id", distance_id)
            if stroke_id:
                query = query.eq("estilo_id", stroke_id)
            if date_from:
                query = query.gte("fecha", date_from)
            if date_to:
                query = query.lte("fecha", date_to)
            
            query = query.order("fecha", desc=True)
            if limit:
                query = query.limit(limit)
            
            result = query.execute()
            return result.data
            
        except Exception as e:
            logger.error(f"Error obteniendo métricas con filtros: {str(e)}")
            raise
    
    # ========== DATOS DE REFERENCIA ==========
    
    async def get_reference_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """Obtiene todos los datos de referencia"""
        self._ensure_connected()
        
        try:
            references = {}
            
            # Obtener todas las tablas de referencia
            for key, table in [
                ('distances', 'distancias'),
                ('strokes', 'estilos'),
                ('phases', 'fases'),
                ('parameters', 'parametros')
            ]:
                result = self.client.table(table).select("*").execute()
                references[key] = result.data
            
            logger.info("Datos de referencia obtenidos exitosamente")
            return references
            
        except Exception as e:
            logger.error(f"Error obteniendo datos de referencia: {str(e)}")
            raise
    
    # ========== UTILIDADES ==========
    
    async def health_check(self) -> Dict[str, Any]:
        """Verifica el estado de la conexión"""
        try:
            if not self._is_connected:
                return {'status': 'disconnected', 'message': 'Cliente no conectado'}
            
            result = self.client.table(self.tables['swimmers']).select("id_nadador").limit(1).execute()
            
            return {
                'status': 'healthy',
                'message': 'Conexión a base de datos OK',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Error en conexión: {str(e)}',
                'timestamp': datetime.now().isoformat()
            }


def create_supabase_client(config: Optional[DatabaseConfig] = None) -> SupabaseClient:
    """Factory function para crear un cliente de Supabase"""
    return SupabaseClient(config) 