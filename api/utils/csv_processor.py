"""
CSV Processor Utility - AquaLytics API
Procesamiento de archivos CSV para carga masiva de métricas de natación
"""

import csv
import io
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
import logging
from datetime import datetime
import chardet
import re

logger = logging.getLogger(__name__)


@dataclass
class CSVProcessingResult:
    """Resultado del procesamiento de CSV"""
    success: bool
    total_rows: int
    valid_rows: int
    errors: List[str]
    warnings: List[str]
    data: List[Dict[str, Any]]
    encoding_detected: str
    delimiter_detected: str


class CSVProcessor:
    """Procesador de archivos CSV para métricas de natación"""
    
    def __init__(self):
        # Configuración
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.max_rows = 10000
        
        # Columnas requeridas según PRD
        self.required_columns = [
            'fecha', 'nadador', 'competencia', 'distancia', 'estilo', 'fase',
            't25_1', 'brz_1', 't25_2', 'brz_2', 't_total', 'brz_total', 'f1', 'f2'
        ]
        
        # Mapeo de columnas CSV a nombres estándar
        self.column_mappings = {
            'fecha': ['fecha', 'date', 'fecha_competencia'],
            'nadador': ['nadador', 'swimmer', 'nombre', 'athlete'],
            'competencia': ['competencia', 'competition', 'evento', 'event'],
            'distancia': ['distancia', 'distance', 'dist'],
            'estilo': ['estilo', 'stroke', 'style'],
            'fase': ['fase', 'phase', 'tipo'],
            't25_1': ['t25_1', 't25(1)', 'tiempo_25_1', 'time_25_1'],
            't25_2': ['t25_2', 't25(2)', 'tiempo_25_2', 'time_25_2'],
            't_total': ['t_total', 'tiempo_total', 'total_time', 'tiempo'],
            'brz_1': ['brz_1', 'brazadas_1', 'strokes_1', '# de brz 1'],
            'brz_2': ['brz_2', 'brazadas_2', 'strokes_2', '# de brz 2'],
            'brz_total': ['brz_total', 'brazadas_total', 'total_strokes', '# de brz total'],
            'f1': ['f1', 'flecha_1', 'underwater_1', 'flecha1'],
            'f2': ['f2', 'flecha_2', 'underwater_2', 'flecha2']
        }
        
        # Formatos de fecha soportados
        self.date_formats = ['%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%Y/%m/%d']
        
        # Patrones regex para limpieza
        self.patterns = {
            'number': re.compile(r'[\d.,]+'),
            'integer': re.compile(r'[\d]+')
        }
    
    def detect_encoding(self, file_content: bytes) -> str:
        """Detecta la codificación del archivo"""
        try:
            detection = chardet.detect(file_content[:1024])
            detected = detection.get('encoding', 'utf-8')
            confidence = detection.get('confidence', 0)
            
            if confidence < 0.7:
                # Intentar fallbacks comunes
                for encoding in ['utf-8', 'latin-1', 'cp1252']:
                    try:
                        file_content.decode(encoding)
                        return encoding
                    except UnicodeDecodeError:
                        continue
            
            return detected
        except Exception:
            return 'utf-8'
    
    def detect_delimiter(self, sample_lines: List[str]) -> str:
        """Detecta el delimitador del CSV"""
        delimiters = [',', ';', '\t', '|']
        counts = {}
        
        for delimiter in delimiters:
            count = sum(line.count(delimiter) for line in sample_lines[:3])
            counts[delimiter] = count
        
        return max(counts, key=counts.get)
    
    def normalize_column_names(self, headers: List[str]) -> Dict[str, str]:
        """Normaliza nombres de columnas usando mapeos"""
        normalized = {}
        headers_lower = [h.lower().strip() for h in headers]
        
        for standard_name, variations in self.column_mappings.items():
            for i, header_lower in enumerate(headers_lower):
                for variation in variations:
                    if variation.lower() in header_lower:
                        normalized[headers[i]] = standard_name
                        break
                if headers[i] in normalized:
                    break
        
        return normalized
    
    def parse_date(self, date_str: str) -> Optional[str]:
        """Parsea fecha en múltiples formatos"""
        if not date_str or not isinstance(date_str, str):
            return None
        
        date_str = date_str.strip()
        for date_format in self.date_formats:
            try:
                parsed = datetime.strptime(date_str, date_format)
                return parsed.strftime('%Y-%m-%d')
            except ValueError:
                continue
        
        return None
    
    def parse_numeric(self, value_str: str, value_type: str = 'float') -> Optional[Union[int, float]]:
        """Parsea valores numéricos con limpieza"""
        if not value_str:
            return None
        
        if isinstance(value_str, str):
            # Limpiar y extraer números
            cleaned = value_str.strip().replace(',', '.')
            
            if value_type == 'int':
                match = self.patterns['integer'].search(cleaned)
            else:
                match = self.patterns['number'].search(cleaned)
            
            if match:
                try:
                    if value_type == 'int':
                        return int(float(match.group()))
                    else:
                        return float(match.group())
                except ValueError:
                    pass
        
        return None
    
    def process_csv_file(self, file_content: Union[bytes, str], filename: str = "upload.csv") -> CSVProcessingResult:
        """Procesa un archivo CSV completo"""
        try:
            # Validar tamaño
            if isinstance(file_content, bytes) and len(file_content) > self.max_file_size:
                return CSVProcessingResult(
                    success=False, total_rows=0, valid_rows=0,
                    errors=[f"Archivo muy grande (máximo {self.max_file_size // 1024 // 1024}MB)"],
                    warnings=[], data=[], encoding_detected="unknown", delimiter_detected="unknown"
                )
            
            # Detectar encoding y convertir
            if isinstance(file_content, bytes):
                encoding = self.detect_encoding(file_content)
                try:
                    content_str = file_content.decode(encoding)
                except UnicodeDecodeError as e:
                    return CSVProcessingResult(
                        success=False, total_rows=0, valid_rows=0,
                        errors=[f"Error de encoding: {str(e)}"],
                        warnings=[], data=[], encoding_detected=encoding, delimiter_detected="unknown"
                    )
            else:
                content_str = file_content
                encoding = "utf-8"
            
            # Detectar delimitador
            lines = content_str.strip().split('\n')
            if len(lines) < 2:
                return CSVProcessingResult(
                    success=False, total_rows=len(lines), valid_rows=0,
                    errors=["El archivo debe tener headers y al menos una fila de datos"],
                    warnings=[], data=[], encoding_detected=encoding, delimiter_detected="unknown"
                )
            
            delimiter = self.detect_delimiter(lines)
            
            # Leer CSV
            csv_reader = csv.DictReader(io.StringIO(content_str), delimiter=delimiter)
            headers = csv_reader.fieldnames
            
            if not headers:
                return CSVProcessingResult(
                    success=False, total_rows=0, valid_rows=0,
                    errors=["No se detectaron columnas"],
                    warnings=[], data=[], encoding_detected=encoding, delimiter_detected=delimiter
                )
            
            # Normalizar columnas
            column_mapping = self.normalize_column_names(headers)
            
            # Verificar columnas requeridas
            missing = [col for col in self.required_columns if col not in column_mapping.values()]
            if missing:
                return CSVProcessingResult(
                    success=False, total_rows=0, valid_rows=0,
                    errors=[f"Faltan columnas requeridas: {', '.join(missing)}"],
                    warnings=[], data=[], encoding_detected=encoding, delimiter_detected=delimiter
                )
            
            # Procesar filas
            processed_data = []
            errors = []
            warnings = []
            row_count = 0
            
            for row_num, row in enumerate(csv_reader, start=2):
                row_count += 1
                
                if row_count > self.max_rows:
                    warnings.append(f"Límite de {self.max_rows} filas alcanzado")
                    break
                
                processed_row = self.process_row(row, column_mapping, row_num)
                
                if processed_row['success']:
                    processed_data.append(processed_row['data'])
                else:
                    errors.extend([f"Fila {row_num}: {error}" for error in processed_row['errors']])
            
            return CSVProcessingResult(
                success=len(processed_data) > 0,
                total_rows=row_count,
                valid_rows=len(processed_data),
                errors=errors,
                warnings=warnings,
                data=processed_data,
                encoding_detected=encoding,
                delimiter_detected=delimiter
            )
            
        except Exception as e:
            return CSVProcessingResult(
                success=False, total_rows=0, valid_rows=0,
                errors=[f"Error procesando archivo: {str(e)}"],
                warnings=[], data=[], encoding_detected="unknown", delimiter_detected="unknown"
            )
    
    def process_row(self, row: Dict[str, str], column_mapping: Dict[str, str], row_num: int) -> Dict[str, Any]:
        """Procesa una fila individual"""
        try:
            processed_data = {}
            errors = []
            
            for original_col, value in row.items():
                if original_col in column_mapping:
                    standard_col = column_mapping[original_col]
                    
                    if standard_col == 'fecha':
                        parsed = self.parse_date(value)
                        if parsed:
                            processed_data[standard_col] = parsed
                        else:
                            errors.append(f"Fecha inválida: {value}")
                    
                    elif standard_col in ['t25_1', 't25_2', 't_total', 'f1', 'f2']:
                        # Tiempos y flechas (decimales)
                        parsed = self.parse_numeric(value, 'float')
                        if parsed is not None:
                            processed_data[standard_col] = parsed
                        else:
                            errors.append(f"Valor decimal inválido en {original_col}: {value}")
                    
                    elif standard_col in ['brz_1', 'brz_2', 'brz_total']:
                        # Brazadas (enteros)
                        parsed = self.parse_numeric(value, 'int')
                        if parsed is not None:
                            processed_data[standard_col] = parsed
                        else:
                            errors.append(f"Entero inválido en {original_col}: {value}")
                    
                    elif standard_col == 'distancia':
                        parsed = self.parse_numeric(value, 'int')
                        if parsed is not None:
                            processed_data[standard_col] = parsed
                        else:
                            errors.append(f"Distancia inválida: {value}")
                    
                    else:
                        # Campos de texto
                        if value and value.strip():
                            processed_data[standard_col] = value.strip()
                        else:
                            errors.append(f"Campo requerido vacío: {original_col}")
            
            # Verificar campos mínimos
            required_in_row = ['fecha', 'nadador', 'competencia', 'distancia', 'estilo', 'fase']
            for field in required_in_row:
                if field not in processed_data:
                    errors.append(f"Falta campo requerido: {field}")
            
            return {
                'success': len(errors) == 0,
                'data': processed_data if len(errors) == 0 else None,
                'errors': errors
            }
            
        except Exception as e:
            return {
                'success': False,
                'data': None,
                'errors': [f"Error procesando fila: {str(e)}"]
            }


# Funciones helper
def process_csv_data(file_content: Union[bytes, str], filename: str = "upload.csv") -> CSVProcessingResult:
    """Función helper para procesar datos CSV"""
    processor = CSVProcessor()
    return processor.process_csv_file(file_content, filename)


def validate_csv_structure(headers: List[str]) -> Dict[str, Any]:
    """Valida rápidamente la estructura de un CSV"""
    processor = CSVProcessor()
    column_mapping = processor.normalize_column_names(headers)
    
    missing = [col for col in processor.required_columns if col not in column_mapping.values()]
    
    return {
        'is_valid': len(missing) == 0,
        'mapped_columns': len(column_mapping),
        'total_columns': len(headers),
        'missing_required': missing,
        'column_mapping': column_mapping
    } 