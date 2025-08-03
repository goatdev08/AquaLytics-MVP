"""
Supabase Client - AquaLytics API
Cliente de base de datos para operaciones CRUD con Supabase PostgreSQL
"""

import os
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
import logging
from datetime import datetime, date

from supabase import create_client, Client
from supabase.client import ClientOptions
from postgrest import APIError
from pydantic import BaseModel, Field
from dotenv import load_dotenv
try:
    from calculations.swimming_metrics import SwimmingMetrics
except ImportError:
    # Fallback si se ejecuta desde otro contexto
    SwimmingMetrics = None

logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()

# === PARCHE DE COMPATIBILIDAD HTTPX ===
# Solucion temporal para incompatibilidad entre versiones de httpx y gotrue
# que causan error: "Client.__init__() got an unexpected keyword argument 'proxy'"
def _apply_httpx_compatibility_patch():
    """
    Aplica un parche para resolver la incompatibilidad entre httpx y gotrue.
    
    El problema surge porque gotrue intenta pasar un argumento 'proxy' a httpx.Client,
    pero httpx espera 'proxies' (plural). Este parche convierte 'proxy' a 'proxies'
    si es necesario.
    """
    import httpx
    
    # Verificar si el parche ya se aplicó
    if hasattr(httpx.Client.__init__, '_aqualytics_patched'):
        return
    
    # Guardar el método original
    original_init = httpx.Client.__init__
    
    def patched_init(self, *args, **kwargs):
        # Convertir 'proxy' a 'proxies' si existe
        if 'proxy' in kwargs:
            proxy_value = kwargs.pop('proxy')
            if proxy_value and 'proxies' not in kwargs:
                kwargs['proxies'] = proxy_value
        
        return original_init(self, *args, **kwargs)
    
    # Marcar el método como patcheado
    patched_init._aqualytics_patched = True
    
    # Aplicar el parche
    httpx.Client.__init__ = patched_init
    
    logger.debug("Parche de compatibilidad httpx aplicado exitosamente")

# Aplicar el parche al importar el módulo
_apply_httpx_compatibility_patch()

@dataclass
class DatabaseConfig:
    """Configuración de la base de datos"""
    url: str
    anon_key: str
    service_role_key: str
    timeout: int = 30


@dataclass
class MetricRecord:
    """Estructura para un registro de métrica en la base de datos"""
    id_nadador: int
    prueba_id: int
    metrica_id: int
    valor: float
    fecha: str
    segmento: Optional[int] = None
    competencia_id: Optional[int] = None
    fase_id: Optional[int] = None
    
    def to_dict(self) -> Dict:
        """Convierte el record a diccionario para inserción en DB"""
        data = {
            'id_nadador': self.id_nadador,
            'prueba_id': self.prueba_id,
            'metrica_id': self.metrica_id,
            'valor': self.valor,
            'fecha': self.fecha
        }
        
        # Agregar campos opcionales solo si tienen valor
        if self.segmento is not None:
            data['segmento'] = self.segmento
        if self.competencia_id is not None:
            data['competencia_id'] = self.competencia_id
        if self.fase_id is not None:
            data['fase_id'] = self.fase_id
            
        return data


class Nadador(BaseModel):
    id_nadador: int
    nombre: str
    edad: Optional[int] = None
    peso: Optional[int] = None


class Metrica(BaseModel):
    metrica_id: int
    nombre: str
    tipo: str
    global_flag: bool = Field(False, alias='global')


class Registro(BaseModel):
    registro_id: Optional[int] = None
    id_nadador: int
    prueba_id: int
    competencia_id: Optional[int] = None
    fecha: date
    fase_id: int
    metrica_id: int
    valor: float
    segmento: Optional[int] = None
    created_at: Optional[datetime] = None


class SupabaseClient:
    """Cliente para interactuar con la base de datos de Supabase"""
    
    TABLE_MAP = {
        'swimmers': 'nadadores',
        'competitions': 'competencias',
        'distances': 'distancias',
        'styles': 'estilos',
        'phases': 'fases',
        'metrics': 'metricas',
        'events': 'pruebas',
        'records': 'registros'
    }
    
    def __init__(self):
        """Inicializa el cliente de Supabase"""
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_ANON_KEY')
        
        if not url or not key:
            raise ValueError("SUPABASE_URL y SUPABASE_ANON_KEY deben estar configurados")
        
        self.client: Client = create_client(url, key)
        self._cache = {
            'nadadores': {},
            'pruebas': {},
            'metricas': {},
            'competencias': {},
            'fases': {}
        }
    
    # === Métodos para Nadadores ===
    
    def get_or_create_nadador(self, nombre: str, edad: Optional[int] = None, 
                              peso: Optional[int] = None) -> int:
        """Obtiene o crea un nadador y retorna su ID"""
        # Verificar cache
        if nombre in self._cache['nadadores']:
            return self._cache['nadadores'][nombre]
        
        # Buscar en DB
        result = self.client.table('nadadores').select('*').eq('nombre', nombre).execute()
        
        if result.data:
            nadador_id = result.data[0]['id_nadador']
        else:
            # Crear nuevo nadador
            data = {'nombre': nombre}
            if edad is not None:
                data['edad'] = edad
            if peso is not None:
                data['peso'] = peso
            
            insert_result = self.client.table('nadadores').insert(data).execute()
            nadador_id = insert_result.data[0]['id_nadador']
        
        # Guardar en cache
        self._cache['nadadores'][nombre] = nadador_id
        return nadador_id
    
    # === Métodos para Pruebas ===
    
    def get_prueba_by_name(self, nombre_prueba: str) -> Optional[int]:
        """Busca una prueba por nombre y retorna su ID"""
        # Verificar cache
        if nombre_prueba in self._cache['pruebas']:
            return self._cache['pruebas'][nombre_prueba]
        
        # Buscar en DB
        result = self.client.table('pruebas').select('*').eq('nombre', nombre_prueba).execute()
        
        if result.data:
            prueba_id = result.data[0]['id']
            self._cache['pruebas'][nombre_prueba] = prueba_id
            return prueba_id
        
        return None
    
    def get_prueba_by_details(self, distancia: int, estilo: str, curso: str = 'largo') -> Optional[int]:
        """Busca una prueba por sus detalles y retorna su ID"""
        cache_key = f"{distancia}m_{estilo}_{curso}"
        
        # Verificar cache
        if cache_key in self._cache['pruebas']:
            return self._cache['pruebas'][cache_key]
        
        # Primero obtener IDs de distancia y estilo
        dist_result = self.client.table('distancias').select('*').eq('distancia', distancia).execute()
        if not dist_result.data:
            return None
        distancia_id = dist_result.data[0]['distancia_id']
        
        estilo_result = self.client.table('estilos').select('*').eq('nombre', estilo).execute()
        if not estilo_result.data:
            return None
        estilo_id = estilo_result.data[0]['estilo_id']
        
        # Buscar la prueba
        result = self.client.table('pruebas').select('*') \
            .eq('distancia_id', distancia_id) \
            .eq('estilo_id', estilo_id) \
            .eq('curso', curso) \
            .execute()
        
        if result.data:
            prueba_id = result.data[0]['id']
            self._cache['pruebas'][cache_key] = prueba_id
            return prueba_id
        
        return None
    
    # === Métodos para Métricas ===
    
    def get_metrica_id(self, nombre_metrica: str) -> Optional[int]:
        """Obtiene el ID de una métrica por su nombre"""
        # Verificar cache
        if nombre_metrica in self._cache['metricas']:
            return self._cache['metricas'][nombre_metrica]
        
        # Buscar en DB
        result = self.client.table('metricas').select('*').eq('nombre', nombre_metrica).execute()
        
        if result.data:
            metrica_id = result.data[0]['metrica_id']
            self._cache['metricas'][nombre_metrica] = metrica_id
            return metrica_id
        
        return None
    
    def get_all_metricas(self) -> List[Dict]:
        """Obtiene todas las métricas disponibles"""
        result = self.client.table('metricas').select('*').order('metrica_id').execute()
        return result.data
    
    # === Métodos para Competencias ===
    
    def get_or_create_competencia(self, nombre_competencia: str) -> int:
        """Obtiene o crea una competencia y retorna su ID"""
        # Verificar cache
        if nombre_competencia in self._cache['competencias']:
            return self._cache['competencias'][nombre_competencia]
        
        # Buscar en DB
        result = self.client.table('competencias').select('*').eq('competencia', nombre_competencia).execute()
        
        if result.data:
            competencia_id = result.data[0]['competencia_id']
        else:
            # Crear nueva competencia
            insert_result = self.client.table('competencias').insert({
                'competencia': nombre_competencia
            }).execute()
            competencia_id = insert_result.data[0]['competencia_id']
        
        # Guardar en cache
        self._cache['competencias'][nombre_competencia] = competencia_id
        return competencia_id
    
    # === Métodos para Fases ===
    
    def get_fase_id(self, nombre_fase: str) -> Optional[int]:
        """Obtiene el ID de una fase por su nombre"""
        # Verificar cache
        if nombre_fase in self._cache['fases']:
            return self._cache['fases'][nombre_fase]
        
        # Buscar en DB
        result = self.client.table('fases').select('*').eq('nombre', nombre_fase).execute()
        
        if result.data:
            fase_id = result.data[0]['fase_id']
            self._cache['fases'][nombre_fase] = fase_id
            return fase_id
        
        return None
    
    # === Métodos para Registros ===
    
    def insert_metric_records(self, records: List[MetricRecord]) -> Dict[str, Any]:
        """
        Inserta múltiples registros de métricas
        
        Returns:
            Dict con información sobre el proceso
        """
        if not records:
            return {'success': True, 'inserted': 0, 'errors': []}
        
        # Convertir records a diccionarios
        data = [record.to_dict() for record in records]
        
        try:
            result = self.client.table('registros').insert(data).execute()
            return {
                'success': True,
                'inserted': len(result.data),
                'errors': []
            }
        except Exception as e:
            return {
                'success': False,
                'inserted': 0,
                'errors': [str(e)]
            }
    
    def get_registros_by_swimmer(self, nadador_id: int, 
                                fecha_desde: Optional[str] = None,
                                fecha_hasta: Optional[str] = None) -> List[Dict]:
        """Obtiene los registros de un nadador con filtros opcionales"""
        query = self.client.table('registros').select(
            '*, metricas(*), pruebas(*, distancias(*), estilos(*))'
        ).eq('id_nadador', nadador_id)
        
        if fecha_desde:
            query = query.gte('fecha', fecha_desde)
        if fecha_hasta:
            query = query.lte('fecha', fecha_hasta)
        
        result = query.order('fecha', desc=True).execute()
        return result.data
    
    def get_registros_by_prueba(self, prueba_id: int, 
                               fecha_desde: Optional[str] = None,
                               fecha_hasta: Optional[str] = None) -> List[Dict]:
        """Obtiene todos los registros de una prueba específica"""
        query = self.client.table('registros').select(
            '*, nadadores(*), metricas(*)'
        ).eq('prueba_id', prueba_id)
        
        if fecha_desde:
            query = query.gte('fecha', fecha_desde)
        if fecha_hasta:
            query = query.lte('fecha', fecha_hasta)
        
        result = query.order('fecha', desc=True).execute()
        return result.data
    
    # === Métodos de utilidad ===
    
    def clear_cache(self):
        """Limpia la cache interna"""
        for key in self._cache:
            self._cache[key] = {}
    
    def test_connection(self) -> bool:
        """Prueba la conexión con Supabase"""
        try:
            # Intentar una consulta simple
            result = self.client.table('nadadores').select('id_nadador').limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Error de conexión: {e}")
            return False
    
    def get_summary_stats(self) -> Dict[str, int]:
        """Obtiene estadísticas generales de la base de datos"""
        try:
            stats = {}
            
            # Contar registros en cada tabla principal
            tables = ['nadadores', 'pruebas', 'competencias', 'registros']
            for table in tables:
                result = self.client.table(table).select('*', count='exact').execute()
                stats[table] = result.count or 0
            
            return stats
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas: {e}")
            return {}


def create_supabase_client(config: Optional[DatabaseConfig] = None) -> SupabaseClient:
    """Factory function para crear un cliente de Supabase"""
    return SupabaseClient() 