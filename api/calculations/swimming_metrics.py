"""
Swimming Metrics Calculator - AquaLytics API
Calculadora de métricas de natación con validaciones y cálculos automáticos
"""

from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class MetricCalculationInput:
    """Entrada para cálculo de métricas"""
    # Métricas manuales
    t25_1: float  # Tiempo primer tramo (segundos)
    t25_2: float  # Tiempo segundo tramo (segundos)
    t_total: float  # Tiempo total (segundos)
    brz_total: int  # Brazadas totales
    f1: float  # Flecha primer tramo (metros)
    f2: float  # Flecha segundo tramo (metros)
    
    # Métricas opcionales
    brz_1: Optional[int] = None  # Brazadas primer tramo
    brz_2: Optional[int] = None  # Brazadas segundo tramo
    t15_1: Optional[float] = None  # Tiempo 15m primer tramo
    t15_2: Optional[float] = None  # Tiempo 15m segundo tramo
    
    # Contexto
    distancia_total: float = 50.0  # Distancia total en metros


@dataclass
class SwimmingMetrics:
    """Métricas calculadas de natación"""
    # Métricas globales automáticas
    v_promedio: float  # Velocidad promedio (m/s)
    v1: float  # Velocidad primer tramo (m/s)
    v2: float  # Velocidad segundo tramo (m/s)
    dist_x_brz: float  # Distancia por brazada (m/brazada)
    dist_sin_f: float  # Distancia sin flecha (m)
    f_promedio: float  # Flecha promedio (m)
    
    # Métricas opcionales
    f_promedio_efectiva: Optional[float] = None  # Flecha promedio efectiva
    brz_promedio: Optional[float] = None  # Brazadas promedio por tramo


class SwimmingMetricsCalculator:
    """Calculadora de métricas de natación"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def calculate_metrics(self, input_data: MetricCalculationInput) -> SwimmingMetrics:
        """Calcula todas las métricas automáticas a partir de los datos manuales"""
        try:
            # Cálculos básicos
            v_promedio = input_data.distancia_total / input_data.t_total
            
            # Velocidades por tramo (asumiendo tramos de 25m cada uno)
            tramo_distance = input_data.distancia_total / 2
            v1 = tramo_distance / input_data.t25_1
            v2 = tramo_distance / input_data.t25_2
            
            # Distancia por brazada
            dist_x_brz = input_data.distancia_total / input_data.brz_total
            
            # Flecha promedio
            f_promedio = (input_data.f1 + input_data.f2) / 2
            
            # Distancia sin flecha
            dist_sin_f = input_data.distancia_total - (input_data.f1 + input_data.f2)
            
            # Métricas opcionales
            brz_promedio = None
            if input_data.brz_1 and input_data.brz_2:
                brz_promedio = (input_data.brz_1 + input_data.brz_2) / 2
            
            return SwimmingMetrics(
                v_promedio=round(v_promedio, 3),
                v1=round(v1, 3),
                v2=round(v2, 3),
                dist_x_brz=round(dist_x_brz, 2),
                dist_sin_f=round(dist_sin_f, 1),
                f_promedio=round(f_promedio, 2),
                brz_promedio=round(brz_promedio, 1) if brz_promedio else None
            )
            
        except Exception as e:
            self.logger.error(f"Error calculando métricas: {str(e)}")
            raise
    
    def calculate_from_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Calcula métricas desde un diccionario de datos"""
        try:
            # Crear objeto de entrada
            input_obj = MetricCalculationInput(
                t25_1=data['t25_1'],
                t25_2=data['t25_2'],
                t_total=data['t_total'],
                brz_total=data['brz_total'],
                f1=data['f1'],
                f2=data['f2'],
                brz_1=data.get('brz_1'),
                brz_2=data.get('brz_2'),
                t15_1=data.get('t15_1'),
                t15_2=data.get('t15_2'),
                distancia_total=data.get('distancia_total', 50.0)
            )
            
            # Calcular métricas
            metrics = self.calculate_metrics(input_obj)
            
            # Convertir a diccionario
            return {
                'v_promedio': metrics.v_promedio,
                'v1': metrics.v1,
                'v2': metrics.v2,
                'dist_x_brz': metrics.dist_x_brz,
                'dist_sin_f': metrics.dist_sin_f,
                'f_promedio': metrics.f_promedio,
                'brz_promedio': metrics.brz_promedio
            }
            
        except Exception as e:
            self.logger.error(f"Error calculando métricas desde diccionario: {str(e)}")
            raise
    
    def validate_input(self, data: Dict[str, Any]) -> List[str]:
        """Valida los datos de entrada para el cálculo"""
        errors = []
        
        # Campos requeridos
        required_fields = ['t25_1', 't25_2', 't_total', 'brz_total', 'f1', 'f2']
        for field in required_fields:
            if field not in data or data[field] is None:
                errors.append(f"Campo requerido faltante: {field}")
        
        if errors:
            return errors
        
        # Validaciones lógicas
        if data['t_total'] <= 0:
            errors.append("El tiempo total debe ser positivo")
        
        if data['t25_1'] <= 0 or data['t25_2'] <= 0:
            errors.append("Los tiempos por tramo deben ser positivos")
        
        if data['brz_total'] <= 0:
            errors.append("Las brazadas totales deben ser positivas")
        
        if data['f1'] < 0 or data['f2'] < 0:
            errors.append("Las flechas no pueden ser negativas")
        
        # Validación de consistencia
        if data['t_total'] < (data['t25_1'] + data['t25_2']):
            errors.append("El tiempo total no puede ser menor que la suma de los tramos")
        
        return errors 