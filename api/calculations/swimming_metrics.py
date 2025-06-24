"""
Swimming Metrics Calculator - AquaLytics
Implementa todas las fórmulas automáticas para métricas de natación competitiva

Métricas automáticas implementadas:
1. V1 - Velocidad primer segmento (m/s)
2. V2 - Velocidad segundo segmento (m/s) 
3. V promedio - Velocidad promedio total (m/s)
4. DIST x BRZ - Distancia por brazada (m/brazada)
5. DIST sin F - Distancia sin flecha (metros)
6. F promedio - Promedio de flecha (metros)
"""

import numpy as np
from typing import Dict, Optional, Any
from dataclasses import dataclass
import logging

# Configurar logging
logger = logging.getLogger(__name__)


@dataclass
class MetricCalculationInput:
    """
    Estructura de datos para los inputs de cálculo de métricas
    """
    # Métricas manuales requeridas
    t25_1: float    # Tiempo 25m primer segmento (segundos)
    t25_2: float    # Tiempo 25m segundo segmento (segundos)
    t_total: float  # Tiempo total (segundos)
    brz_total: int  # Total de brazadas
    f1: float       # Flecha primer segmento (metros)
    f2: float       # Flecha segundo segmento (metros)
    
    # Información adicional
    distance: float = 50.0  # Distancia total por defecto (metros)
    segment_distance: float = 25.0  # Distancia por segmento (metros)


@dataclass
class AutomaticMetrics:
    """
    Estructura de datos para las métricas automáticas calculadas
    """
    v1: float              # Velocidad primer segmento (m/s)
    v2: float              # Velocidad segundo segmento (m/s)
    v_promedio: float      # Velocidad promedio (m/s)
    dist_por_brz: float    # Distancia por brazada (m/brazada)
    dist_sin_f: float      # Distancia sin flecha (metros)
    f_promedio: float      # Promedio de flecha (metros)


@dataclass
class CalculationResult:
    """
    Resultado del cálculo de métricas automáticas
    """
    success: bool
    metrics: Optional[AutomaticMetrics] = None
    errors: Optional[list] = None
    warnings: Optional[list] = None
    calculation_details: Optional[Dict[str, Any]] = None


class SwimmingMetricsCalculator:
    """
    Calculadora de métricas automáticas para natación competitiva
    Implementa las 6 fórmulas según el PRD de AquaLytics
    """
    
    def __init__(self):
        """
        Inicializa el calculador con configuración por defecto
        """
        self.precision = 3  # Decimales para velocidades
        self.distance_precision = 2  # Decimales para distancias
        
        # Límites de validación
        self.validation_limits = {
            'time_min': 0.1,      # Tiempo mínimo en segundos
            'time_max': 300.0,    # Tiempo máximo en segundos
            'strokes_min': 1,     # Brazadas mínimas
            'strokes_max': 200,   # Brazadas máximas
            'underwater_min': 0.0, # Flecha mínima en metros
            'underwater_max': 20.0, # Flecha máxima en metros
        }
    
    def validate_input(self, input_data: MetricCalculationInput) -> list:
        """
        Valida los datos de entrada para el cálculo
        
        Args:
            input_data: Datos de entrada para el cálculo
            
        Returns:
            Lista de errores de validación (vacía si es válido)
        """
        errors = []
        limits = self.validation_limits
        
        # Validar tiempos
        if not (limits['time_min'] <= input_data.t25_1 <= limits['time_max']):
            errors.append(f"T25(1) debe estar entre {limits['time_min']} y {limits['time_max']} segundos")
        
        if not (limits['time_min'] <= input_data.t25_2 <= limits['time_max']):
            errors.append(f"T25(2) debe estar entre {limits['time_min']} y {limits['time_max']} segundos")
        
        if not (limits['time_min'] <= input_data.t_total <= limits['time_max']):
            errors.append(f"T_TOTAL debe estar entre {limits['time_min']} y {limits['time_max']} segundos")
        
        # Validar brazadas
        if not (limits['strokes_min'] <= input_data.brz_total <= limits['strokes_max']):
            errors.append(f"BRZ_TOTAL debe estar entre {limits['strokes_min']} y {limits['strokes_max']} brazadas")
        
        # Validar flechas
        if not (limits['underwater_min'] <= input_data.f1 <= limits['underwater_max']):
            errors.append(f"F1 debe estar entre {limits['underwater_min']} y {limits['underwater_max']} metros")
        
        if not (limits['underwater_min'] <= input_data.f2 <= limits['underwater_max']):
            errors.append(f"F2 debe estar entre {limits['underwater_min']} y {limits['underwater_max']} metros")
        
        # Validaciones de consistencia lógica
        if input_data.t_total < (input_data.t25_1 + input_data.t25_2):
            errors.append("Tiempo total no puede ser menor que la suma de segmentos")
        
        # Validar que la distancia sin flecha sea positiva
        total_underwater = input_data.f1 + input_data.f2
        if total_underwater >= input_data.distance:
            errors.append("La suma de flechas no puede ser mayor o igual a la distancia total")
        
        return errors
    
    def calculate_velocity_segment(self, distance: float, time: float) -> float:
        """
        Calcula velocidad de un segmento
        Fórmula: V = Distancia / Tiempo
        
        Args:
            distance: Distancia del segmento en metros
            time: Tiempo del segmento en segundos
            
        Returns:
            Velocidad en m/s
        """
        if time <= 0:
            raise ValueError("El tiempo debe ser mayor a 0")
        
        velocity = distance / time
        return round(velocity, self.precision)
    
    def calculate_average_velocity(self, total_distance: float, total_time: float) -> float:
        """
        Calcula velocidad promedio total
        Fórmula: V_promedio = Distancia_total / Tiempo_total
        
        Args:
            total_distance: Distancia total en metros
            total_time: Tiempo total en segundos
            
        Returns:
            Velocidad promedio en m/s
        """
        return self.calculate_velocity_segment(total_distance, total_time)
    
    def calculate_distance_per_stroke(self, total_distance: float, total_strokes: int) -> float:
        """
        Calcula distancia por brazada
        Fórmula: DPS = Distancia_total / Brazadas_total
        
        Args:
            total_distance: Distancia total en metros
            total_strokes: Número total de brazadas
            
        Returns:
            Distancia por brazada en m/brazada
        """
        if total_strokes <= 0:
            raise ValueError("Las brazadas deben ser mayor a 0")
        
        dps = total_distance / total_strokes
        return round(dps, self.distance_precision)
    
    def calculate_distance_without_underwater(self, total_distance: float, f1: float, f2: float) -> float:
        """
        Calcula distancia sin fase subacuática (flecha)
        Fórmula: Dist_sin_F = Distancia_total - (F1 + F2)
        
        Args:
            total_distance: Distancia total en metros
            f1: Flecha primer segmento en metros
            f2: Flecha segundo segmento en metros
            
        Returns:
            Distancia sin flecha en metros
        """
        distance_without_underwater = total_distance - (f1 + f2)
        return round(distance_without_underwater, self.distance_precision)
    
    def calculate_average_underwater(self, f1: float, f2: float) -> float:
        """
        Calcula promedio de fase subacuática
        Fórmula: F_promedio = (F1 + F2) / 2
        
        Args:
            f1: Flecha primer segmento en metros
            f2: Flecha segundo segmento en metros
            
        Returns:
            Promedio de flecha en metros
        """
        average_underwater = (f1 + f2) / 2
        return round(average_underwater, self.distance_precision)
    
    def calculate_all_metrics(self, input_data: MetricCalculationInput) -> CalculationResult:
        """
        Calcula todas las métricas automáticas
        
        Args:
            input_data: Datos de entrada validados
            
        Returns:
            Resultado del cálculo con métricas o errores
        """
        try:
            # Validar entrada
            validation_errors = self.validate_input(input_data)
            if validation_errors:
                return CalculationResult(
                    success=False,
                    errors=validation_errors
                )
            
            warnings = []
            
            # Verificar si los tiempos de segmento son muy diferentes (warning)
            time_difference = abs(input_data.t25_1 - input_data.t25_2)
            if time_difference > 2.0:  # Diferencia mayor a 2 segundos
                warnings.append(f"Gran diferencia entre tiempos de segmentos: {time_difference:.2f}s")
            
            # Calcular métricas automáticas
            v1 = self.calculate_velocity_segment(input_data.segment_distance, input_data.t25_1)
            v2 = self.calculate_velocity_segment(input_data.segment_distance, input_data.t25_2)
            v_promedio = self.calculate_average_velocity(input_data.distance, input_data.t_total)
            dist_por_brz = self.calculate_distance_per_stroke(input_data.distance, input_data.brz_total)
            dist_sin_f = self.calculate_distance_without_underwater(input_data.distance, input_data.f1, input_data.f2)
            f_promedio = self.calculate_average_underwater(input_data.f1, input_data.f2)
            
            # Crear estructura de métricas
            metrics = AutomaticMetrics(
                v1=v1,
                v2=v2,
                v_promedio=v_promedio,
                dist_por_brz=dist_por_brz,
                dist_sin_f=dist_sin_f,
                f_promedio=f_promedio
            )
            
            # Detalles del cálculo para logging/debugging
            calculation_details = {
                'formulas_used': [
                    f'V1 = {input_data.segment_distance} / {input_data.t25_1} = {v1}',
                    f'V2 = {input_data.segment_distance} / {input_data.t25_2} = {v2}',
                    f'V_promedio = {input_data.distance} / {input_data.t_total} = {v_promedio}',
                    f'DIST_x_BRZ = {input_data.distance} / {input_data.brz_total} = {dist_por_brz}',
                    f'DIST_sin_F = {input_data.distance} - ({input_data.f1} + {input_data.f2}) = {dist_sin_f}',
                    f'F_promedio = ({input_data.f1} + {input_data.f2}) / 2 = {f_promedio}'
                ],
                'input_values': {
                    't25_1': input_data.t25_1,
                    't25_2': input_data.t25_2,
                    't_total': input_data.t_total,
                    'brz_total': input_data.brz_total,
                    'f1': input_data.f1,
                    'f2': input_data.f2,
                    'distance': input_data.distance
                },
                'calculated_at': np.datetime64('now').item().isoformat()
            }
            
            logger.info(f"Métricas calculadas exitosamente: {metrics}")
            
            return CalculationResult(
                success=True,
                metrics=metrics,
                warnings=warnings if warnings else None,
                calculation_details=calculation_details
            )
            
        except Exception as e:
            error_msg = f"Error calculando métricas automáticas: {str(e)}"
            logger.error(error_msg)
            
            return CalculationResult(
                success=False,
                errors=[error_msg]
            )
    
    def get_metric_definitions(self) -> Dict[str, Dict[str, str]]:
        """
        Retorna las definiciones de todas las métricas automáticas
        
        Returns:
            Diccionario con las definiciones de métricas
        """
        return {
            'V1': {
                'nombre': 'Velocidad Primer Segmento',
                'unidad': 'm/s',
                'formula': 'Distancia_segmento / Tiempo_segmento_1',
                'descripcion': 'Velocidad promedio durante los primeros 25 metros'
            },
            'V2': {
                'nombre': 'Velocidad Segundo Segmento',
                'unidad': 'm/s',
                'formula': 'Distancia_segmento / Tiempo_segmento_2',
                'descripcion': 'Velocidad promedio durante los segundos 25 metros'
            },
            'V_promedio': {
                'nombre': 'Velocidad Promedio',
                'unidad': 'm/s',
                'formula': 'Distancia_total / Tiempo_total',
                'descripcion': 'Velocidad promedio durante toda la carrera'
            },
            'DIST_x_BRZ': {
                'nombre': 'Distancia por Brazada',
                'unidad': 'm/brazada',
                'formula': 'Distancia_total / Brazadas_total',
                'descripcion': 'Distancia promedio avanzada por cada brazada'
            },
            'DIST_sin_F': {
                'nombre': 'Distancia sin Flecha',
                'unidad': 'metros',
                'formula': 'Distancia_total - (F1 + F2)',
                'descripcion': 'Distancia nadada excluyendo las fases subacuáticas'
            },
            'F_promedio': {
                'nombre': 'Promedio de Flecha',
                'unidad': 'metros',
                'formula': '(F1 + F2) / 2',
                'descripcion': 'Promedio de distancia en fase subacuática'
            }
        }


# Función helper para uso directo
def calculate_swimming_metrics(
    t25_1: float,
    t25_2: float,
    t_total: float,
    brz_total: int,
    f1: float,
    f2: float,
    distance: float = 50.0
) -> CalculationResult:
    """
    Función helper para calcular métricas de forma directa
    
    Args:
        t25_1: Tiempo primer segmento (segundos)
        t25_2: Tiempo segundo segmento (segundos)
        t_total: Tiempo total (segundos)
        brz_total: Total de brazadas
        f1: Flecha primer segmento (metros)
        f2: Flecha segundo segmento (metros)
        distance: Distancia total (metros, por defecto 50)
        
    Returns:
        Resultado del cálculo de métricas
    """
    calculator = SwimmingMetricsCalculator()
    input_data = MetricCalculationInput(
        t25_1=t25_1,
        t25_2=t25_2,
        t_total=t_total,
        brz_total=brz_total,
        f1=f1,
        f2=f2,
        distance=distance
    )
    
    return calculator.calculate_all_metrics(input_data) 