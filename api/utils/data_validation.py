"""
Data Validation Utility - AquaLytics API
Validación de datos de entrada para métricas de natación
"""

import re
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)


@dataclass
class ValidationResult:
    """Resultado de validación de datos"""
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    sanitized_data: Optional[Dict[str, Any]] = None


class SwimmingDataValidator:
    """Validador de datos de natación"""
    
    def __init__(self):
        # Rangos de validación para métricas
        self.ranges = {
            # Tiempos (segundos)
            't15_1': {'min': 3.0, 'max': 30.0},
            't15_2': {'min': 3.0, 'max': 30.0},
            't25_1': {'min': 5.0, 'max': 60.0},
            't25_2': {'min': 5.0, 'max': 60.0},
            't_total': {'min': 10.0, 'max': 120.0},
            # Brazadas
            'brz_1': {'min': 1, 'max': 50},
            'brz_2': {'min': 1, 'max': 50},
            'brz_total': {'min': 2, 'max': 100},
            # Flechas (metros)
            'f1': {'min': 0.0, 'max': 15.0},
            'f2': {'min': 0.0, 'max': 15.0}
        }
        
        # Campos requeridos
        self.required_manual_fields = ['t25_1', 't25_2', 't_total', 'brz_total', 'f1', 'f2']
        self.required_record_fields = ['id_nadador', 'competencia_id', 'fecha', 'distancia_id', 
                                     'estilo_id', 'fase_id', 'parametro_id', 'valor']
        
        # Patrones regex
        self.patterns = {
            'name': re.compile(r'^[a-zA-ZÀ-ÿ\s]{2,50}$'),
            'date': re.compile(r'^\d{4}-\d{2}-\d{2}$')
        }
    
    def validate_swimmer_data(self, data: Dict[str, Any]) -> ValidationResult:
        """Valida datos de nadador"""
        errors = []
        warnings = []
        sanitized_data = {}
        
        # Validar nombre (requerido)
        if 'nombre' not in data or not data['nombre']:
            errors.append("El nombre del nadador es requerido")
        elif not isinstance(data['nombre'], str):
            errors.append("El nombre debe ser texto")
        elif not self.patterns['name'].match(data['nombre'].strip()):
            errors.append("El nombre debe tener entre 2-50 caracteres y solo letras")
        else:
            sanitized_data['nombre'] = data['nombre'].strip().title()
        
        # Validar edad (opcional)
        if 'edad' in data and data['edad'] is not None:
            if not isinstance(data['edad'], int) or data['edad'] < 5 or data['edad'] > 80:
                errors.append("La edad debe ser un entero entre 5 y 80 años")
            else:
                sanitized_data['edad'] = data['edad']
        
        # Validar peso (opcional)
        if 'peso' in data and data['peso'] is not None:
            if not isinstance(data['peso'], (int, float)) or data['peso'] < 20 or data['peso'] > 200:
                errors.append("El peso debe estar entre 20 y 200 kg")
            else:
                sanitized_data['peso'] = int(data['peso'])
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            sanitized_data=sanitized_data if len(errors) == 0 else None
        )
    
    def validate_competition_data(self, data: Dict[str, Any]) -> ValidationResult:
        """Valida datos de competencia"""
        errors = []
        warnings = []
        sanitized_data = {}
        
        # Validar nombre de competencia
        if 'competencia' not in data or not data['competencia']:
            errors.append("El nombre de la competencia es requerido")
        elif not isinstance(data['competencia'], str):
            errors.append("El nombre de la competencia debe ser texto")
        elif len(data['competencia'].strip()) < 3 or len(data['competencia'].strip()) > 100:
            errors.append("El nombre de la competencia debe tener entre 3-100 caracteres")
        else:
            sanitized_data['competencia'] = data['competencia'].strip()
        
        # Validar periodo
        if 'periodo' not in data or not data['periodo']:
            errors.append("El periodo es requerido")
        elif not isinstance(data['periodo'], str):
            errors.append("El periodo debe ser texto")
        else:
            sanitized_data['periodo'] = data['periodo'].strip()
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            sanitized_data=sanitized_data if len(errors) == 0 else None
        )
    
    def validate_metric_record(self, data: Dict[str, Any]) -> ValidationResult:
        """Valida un registro de métrica completo"""
        errors = []
        warnings = []
        sanitized_data = {}
        
        # Validar campos requeridos
        for field in self.required_record_fields:
            if field not in data or data[field] is None:
                errors.append(f"El campo '{field}' es requerido")
        
        if errors:
            return ValidationResult(is_valid=False, errors=errors, warnings=warnings)
        
        # Validar IDs (deben ser enteros positivos)
        id_fields = ['id_nadador', 'competencia_id', 'distancia_id', 'estilo_id', 'fase_id', 'parametro_id']
        for field in id_fields:
            if field in data:
                if not isinstance(data[field], int) or data[field] <= 0:
                    errors.append(f"'{field}' debe ser un entero positivo")
                else:
                    sanitized_data[field] = data[field]
        
        # Validar fecha
        if 'fecha' in data:
            if isinstance(data['fecha'], str):
                if not self.patterns['date'].match(data['fecha']):
                    errors.append("La fecha debe tener formato YYYY-MM-DD")
                else:
                    try:
                        datetime.strptime(data['fecha'], '%Y-%m-%d')
                        sanitized_data['fecha'] = data['fecha']
                    except ValueError:
                        errors.append("La fecha no es válida")
            elif isinstance(data['fecha'], date):
                sanitized_data['fecha'] = data['fecha'].isoformat()
            else:
                errors.append("La fecha debe ser texto o objeto date")
        
        # Validar valor
        if 'valor' in data:
            if not isinstance(data['valor'], (int, float)):
                errors.append("El valor debe ser numérico")
            elif data['valor'] < 0:
                errors.append("El valor no puede ser negativo")
            else:
                sanitized_data['valor'] = float(data['valor'])
        
        # Validar segmento (opcional)
        if 'segmento' in data and data['segmento'] is not None:
            if not isinstance(data['segmento'], int) or data['segmento'] not in [1, 2]:
                errors.append("El segmento debe ser 1, 2 o null")
            else:
                sanitized_data['segmento'] = data['segmento']
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            sanitized_data=sanitized_data if len(errors) == 0 else None
        )
    
    def validate_manual_metrics(self, data: Dict[str, Any]) -> ValidationResult:
        """Valida métricas manuales para cálculo automático"""
        errors = []
        warnings = []
        sanitized_data = {}
        
        # Verificar campos requeridos
        for field in self.required_manual_fields:
            if field not in data or data[field] is None:
                errors.append(f"El campo '{field}' es requerido para cálculo automático")
        
        if errors:
            return ValidationResult(is_valid=False, errors=errors, warnings=warnings)
        
        # Validar rangos
        for field, value in data.items():
            if field in self.ranges:
                range_rule = self.ranges[field]
                
                # Validar tipo para brazadas (deben ser enteros)
                if field.startswith('brz_'):
                    if not isinstance(value, int) or value != int(value):
                        errors.append(f"'{field}' debe ser un número entero")
                    elif value < range_rule['min'] or value > range_rule['max']:
                        errors.append(f"'{field}' debe estar entre {range_rule['min']} y {range_rule['max']}")
                    else:
                        sanitized_data[field] = int(value)
                
                # Validar tiempos y flechas (pueden ser decimales)
                else:
                    if not isinstance(value, (int, float)):
                        errors.append(f"'{field}' debe ser numérico")
                    elif value < range_rule['min'] or value > range_rule['max']:
                        errors.append(f"'{field}' debe estar entre {range_rule['min']} y {range_rule['max']}")
                    else:
                        sanitized_data[field] = round(float(value), 2)
        
        # Validaciones de consistencia lógica
        if len(errors) == 0:
            consistency_errors = self._validate_consistency(sanitized_data)
            errors.extend(consistency_errors)
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            sanitized_data=sanitized_data if len(errors) == 0 else None
        )
    
    def _validate_consistency(self, data: Dict[str, Any]) -> List[str]:
        """Valida consistencia lógica entre métricas"""
        errors = []
        
        # Obtener valores
        t25_1 = data.get('t25_1', 0)
        t25_2 = data.get('t25_2', 0)
        t_total = data.get('t_total', 0)
        brz_1 = data.get('brz_1', 0)
        brz_2 = data.get('brz_2', 0)
        brz_total = data.get('brz_total', 0)
        t15_1 = data.get('t15_1', 0)
        t15_2 = data.get('t15_2', 0)
        f1 = data.get('f1', 0)
        f2 = data.get('f2', 0)
        
        # Validar que el tiempo total sea coherente
        if t_total > 0 and t25_1 > 0 and t25_2 > 0:
            sum_segments = t25_1 + t25_2
            if t_total < sum_segments:
                errors.append(f"Tiempo total ({t_total}s) menor que suma de segmentos ({sum_segments:.2f}s)")
            elif t_total > sum_segments * 1.1:  # Máximo 10% de diferencia (más estricto)
                errors.append(f"Tiempo total ({t_total}s) excesivamente mayor que suma de segmentos ({sum_segments:.2f}s)")
        
        # Validar que el total de brazadas sea coherente
        if brz_total > 0 and brz_1 > 0 and brz_2 > 0:
            sum_strokes = brz_1 + brz_2
            if brz_total < sum_strokes:
                errors.append(f"Total brazadas ({brz_total}) menor que suma de segmentos ({sum_strokes})")
            elif brz_total > sum_strokes + 5:  # Máximo 5 brazadas de diferencia
                errors.append(f"Total brazadas ({brz_total}) excesivamente mayor que suma de segmentos ({sum_strokes})")
        
        # Validar que T15 < T25 en cada segmento
        if t15_1 > 0 and t25_1 > 0 and t15_1 >= t25_1:
            errors.append(f"T15(1) ({t15_1}s) debe ser menor que T25(1) ({t25_1}s)")
        
        if t15_2 > 0 and t25_2 > 0 and t15_2 >= t25_2:
            errors.append(f"T15(2) ({t15_2}s) debe ser menor que T25(2) ({t25_2}s)")
        
        # Validar coherencia de velocidades entre segmentos
        if t25_1 > 0 and t25_2 > 0:
            speed1 = 25 / t25_1
            speed2 = 25 / t25_2
            speed_diff = abs(speed2 - speed1) / speed1
            
            if speed_diff > 0.5:  # 50% de diferencia máxima
                errors.append(f"Diferencia de velocidad entre segmentos excesiva ({speed_diff*100:.1f}%). Verificar tiempos.")
        
        # Validar distancias de flecha razonables
        if f1 > 0 and f2 > 0:
            if abs(f1 - f2) > 10:  # Diferencia máxima de 10m
                errors.append(f"Diferencia entre flechas muy alta: F1={f1}m, F2={f2}m")
        
        # Suma de flechas no puede ser >= distancia total
        total_underwater = f1 + f2
        distance = data.get('distance', 50.0)
        if total_underwater >= distance:
            errors.append(f"Suma de flechas ({total_underwater}m) debe ser < distancia total ({distance}m)")
        
        return errors
    
    def validate_batch_data(self, data_list: List[Dict[str, Any]], 
                           validation_type: str = 'metric_record') -> Dict[str, Any]:
        """Valida múltiples registros en batch"""
        if not isinstance(data_list, list) or len(data_list) == 0:
            return {
                'is_valid': False,
                'total_records': len(data_list) if isinstance(data_list, list) else 0,
                'valid_records': 0,
                'errors': ['Los datos deben ser una lista no vacía'],
                'results': []
            }
        
        results = []
        valid_count = 0
        
        for i, record in enumerate(data_list):
            if validation_type == 'metric_record':
                result = self.validate_metric_record(record)
            elif validation_type == 'manual_metrics':
                result = self.validate_manual_metrics(record)
            elif validation_type == 'swimmer':
                result = self.validate_swimmer_data(record)
            elif validation_type == 'competition':
                result = self.validate_competition_data(record)
            else:
                result = ValidationResult(
                    is_valid=False,
                    errors=[f"Tipo de validación desconocido: {validation_type}"],
                    warnings=[]
                )
            
            result.record_index = i
            results.append(result)
            
            if result.is_valid:
                valid_count += 1
        
        return {
            'is_valid': valid_count == len(data_list),
            'total_records': len(data_list),
            'valid_records': valid_count,
            'validation_type': validation_type,
            'results': results
        }


# Funciones helper
def validate_swimming_metrics(data: Dict[str, Any]) -> ValidationResult:
    """Función helper para validar métricas de natación"""
    validator = SwimmingDataValidator()
    return validator.validate_manual_metrics(data)


def validate_record_data(data: Dict[str, Any]) -> ValidationResult:
    """Función helper para validar un registro de métrica"""
    validator = SwimmingDataValidator()
    return validator.validate_metric_record(data)


def quick_validate(data: Any, field_type: str) -> bool:
    """Validación rápida para casos simples"""
    if field_type == 'time' and isinstance(data, (int, float)):
        return 0.1 <= data <= 300.0
    elif field_type == 'strokes' and isinstance(data, int):
        return 1 <= data <= 200
    elif field_type == 'underwater' and isinstance(data, (int, float)):
        return 0.0 <= data <= 20.0
    elif field_type == 'id' and isinstance(data, int):
        return data > 0
    elif field_type == 'name' and isinstance(data, str):
        return len(data.strip()) >= 2
    
    return False 