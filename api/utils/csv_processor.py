"""
CSV Processor Utility - AquaLytics API (MVP Version)
Procesamiento simplificado de archivos CSV para carga masiva de métricas de natación
Versión optimizada para MVP con validaciones esenciales
"""

import pandas as pd
import io
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass
import logging
from datetime import datetime
import chardet

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
    """Procesador CSV simplificado para MVP"""
    
    def __init__(self):
        # Configuración básica
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.max_rows = 10000  # Hasta 10k filas para MVP
        
        # Mapeo de columnas (normalización de nombres)
        self.column_mappings = {
            'fecha': ['fecha', 'date', 'dia'],
            'nombre': ['nombre', 'name', 'nadador', 'swimmer'],
            'competencia': ['competencia', 'equipo', 'team', 'competition'],
            'fase': ['fase', 'categoria', 'phase', 'category'],
            'estilo': ['estilo', 'style', 'stroke'],
            'distancia': ['distancia', 'distance', 'dist'],
            't25_1': ['t25_1', 't25(1)', 'time_25_1'],
            't25_2': ['t25_2', 't25(2)', 'time_25_2'],
            't_total': ['t_total', 'tiempo_total', 'total_time'],
            'brz_1': ['brz_1', 'brz(1)', 'brazada_1'],
            'brz_2': ['brz_2', 'brz(2)', 'brazada_2'],
            'brz_total': ['brz_total', 'brazadas_total', 'total_strokes'],
            'f1': ['f1', 'flecha_1', 'underwater_1'],
            'f2': ['f2', 'flecha_2', 'underwater_2'],
            't15_1': ['t15_1', 't15(1)', 'time_15_1'],
            't15_2': ['t15_2', 't15(2)', 'time_15_2']
        }
        
        # Columnas requeridas para el procesamiento
        self.required_columns = [
            'fecha', 'nombre', 'competencia', 'fase', 'estilo', 'distancia',
            't25_1', 't25_2', 't_total', 'brz_1', 'brz_2', 'brz_total', 'f1', 'f2'
        ]
        
        # Rangos de validación básicos (min, max)
        self.validation_ranges = {
            'distancia': (25, 1500),
            't25_1': (5.0, 60.0),
            't25_2': (5.0, 60.0),
            't_total': (10.0, 300.0),
            'brz_1': (1, 100),
            'brz_2': (1, 100),
            'brz_total': (2, 200),
            'f1': (0.0, 15.0),
            'f2': (0.0, 15.0),
            't15_1': (3.0, 30.0),
            't15_2': (3.0, 30.0)
        }

    def detect_encoding(self, file_content: bytes) -> str:
        """Detecta encoding del archivo"""
        try:
            detection = chardet.detect(file_content)
            return detection.get('encoding', 'utf-8')
        except Exception:
            return 'utf-8'
    
    def detect_delimiter(self, content_str: str) -> str:
        """Detecta el delimitador del CSV"""
        for delimiter in [',', ';', '\t']:
            try:
                df_test = pd.read_csv(io.StringIO(content_str.split('\n')[0]), delimiter=delimiter, nrows=1)
                if len(df_test.columns) > 5:  # Mínimo esperado de columnas
                    return delimiter
            except:
                continue
        return ','  # Default

    def normalize_column_names(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normaliza nombres de columnas usando mapeos"""
        column_mapping = {}
        
        # Mapear columnas
        for col in df.columns:
            col_lower = col.lower().strip()
            for standard_name, variations in self.column_mappings.items():
                if col_lower in variations:
                    column_mapping[col] = standard_name
                    break
        
        # Renombrar columnas
        df_renamed = df.rename(columns=column_mapping)
        
        # Verificar columnas requeridas
        missing_cols = [col for col in self.required_columns if col not in df_renamed.columns]
        if missing_cols:
            raise ValueError(f"Faltan columnas requeridas: {', '.join(missing_cols)}")
        
        return df_renamed

    def validate_and_clean_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str], List[str]]:
        """Valida y limpia los datos con validaciones básicas para MVP"""
        errors = []
        warnings = []
        
        # Crear copia para modificar
        df_clean = df.copy()
        
        # 1. Convertir fecha
        try:
            df_clean['fecha'] = pd.to_datetime(df_clean['fecha'], errors='coerce')
            null_dates = df_clean['fecha'].isna().sum()
            if null_dates > 0:
                warnings.append(f"{null_dates} fechas inválidas encontradas")
                df_clean = df_clean.dropna(subset=['fecha'])
        except Exception as e:
            errors.append(f"Error procesando fechas: {str(e)}")
        
        # 2. Convertir campos numéricos y validar rangos básicos
        numeric_fields = ['t25_1', 't25_2', 't_total', 'brz_1', 'brz_2', 'brz_total', 
                         'f1', 'f2', 'distancia', 't15_1', 't15_2']
        
        for field in numeric_fields:
            if field in df_clean.columns:
                # Convertir a numérico
                df_clean[field] = pd.to_numeric(df_clean[field], errors='coerce')
                
                # Validar rango si existe
                if field in self.validation_ranges:
                    min_val, max_val = self.validation_ranges[field]
                    out_of_range = df_clean[
                        (df_clean[field] < min_val) | (df_clean[field] > max_val)
                    ][field].count()
                    
                    if out_of_range > 0:
                        warnings.append(f"{out_of_range} valores fuera de rango en {field}")
                        # Filtrar valores fuera de rango
                        df_clean = df_clean[
                            (df_clean[field] >= min_val) & (df_clean[field] <= max_val)
                        ]
        
        # 3. Eliminar filas con datos críticos faltantes
        critical_fields = ['t25_1', 't25_2', 't_total', 'brz_1', 'brz_2', 'brz_total', 'f1', 'f2']
        initial_rows = len(df_clean)
        df_clean = df_clean.dropna(subset=critical_fields)
        dropped_rows = initial_rows - len(df_clean)
        
        if dropped_rows > 0:
            warnings.append(f"{dropped_rows} filas eliminadas por datos faltantes")
        
        # 4. Validación básica de consistencia (solo tiempo total)
        inconsistent = df_clean[df_clean['t_total'] < (df_clean['t25_1'] + df_clean['t25_2'])].shape[0]
        if inconsistent > 0:
            warnings.append(f"{inconsistent} registros con tiempo total inconsistente")
            df_clean = df_clean[df_clean['t_total'] >= (df_clean['t25_1'] + df_clean['t25_2'])]
        
        return df_clean, errors, warnings
    
    def transform_to_long_format(self, df: pd.DataFrame, reference_data: Dict[str, List[Dict[str, Any]]]) -> Tuple[List[Dict[str, Any]], List[str]]:
        """Transforma el DataFrame de formato ancho a formato largo."""
        
        long_format_records = []
        errors = []
        
        # Crear mapas de búsqueda para eficiencia
        swimmer_map = {s['nombre'].lower(): s['id_nadador'] for s in reference_data.get('swimmers', [])}
        competition_map = {c['competencia'].lower(): c['competencia_id'] for c in reference_data.get('competitions', [])}
        phase_map = {p['nombre'].lower(): p['fase_id'] for p in reference_data.get('phases', [])}
        metric_map = {m['nombre'].lower(): m['metrica_id'] for m in reference_data.get('metrics', [])}
        
        # Mapeo de columnas de CSV a nombres de métricas y segmentos
        metric_column_map = {
            't15_1': ('Tiempo 15m', 1),
            'brz_1': ('Brazadas por Tramo', 1),
            't25_1': ('Tiempo por Tramo', 1),
            'f1': ('Flecha por Tramo', 1),
            't15_2': ('Tiempo 15m', 2),
            'brz_2': ('Brazadas por Tramo', 2),
            't25_2': ('Tiempo por Tramo', 2),
            'f2': ('Flecha por Tramo', 2),
            't_total': ('Tiempo Total', None),
            'brz_total': ('Brazadas Totales', None),
        }

        for index, row in df.iterrows():
            try:
                nadador_id = swimmer_map.get(str(row['nombre']).lower())
                competencia_id = competition_map.get(str(row['competencia']).lower())
                fase_id = phase_map.get(str(row['fase']).lower())
                
                # Crear prueba_id (simplificado, asume que ya existe en la BD)
                # En un sistema real, esto podría necesitar una lógica más robusta
                # para crear la prueba si no existe.
                # Esta parte sigue siendo una simplificación y podría necesitar ajuste.
                # Por ahora, dejamos que el frontend maneje la creación de la prueba si es necesario.
                # El CSV se enfoca en registrar datos para pruebas existentes.
                # Aquí necesitaríamos un lookup para prueba_id basado en distancia y estilo.
                # Esta lógica se omite por brevedad pero es un punto a considerar.
                
                if not all([nadador_id, competencia_id, fase_id]):
                    errors.append(f"Fila {index + 2}: No se pudo encontrar ID para nadador, competencia o fase.")
                    continue

                metricas_list = []
                for col, (metric_name, segment) in metric_column_map.items():
                    if col in row and pd.notna(row[col]):
                        metric_id = metric_map.get(metric_name.lower())
                        if metric_id:
                            metricas_list.append({
                                'metrica_id': metric_id,
                                'valor': row[col],
                                'segmento': segment
                            })
                        else:
                             warnings.append(f"Fila {index + 2}: Métrica '{metric_name}' no encontrada en la base de datos.")


                record = {
                    "id_nadador": nadador_id,
                    "competencia_id": competencia_id,
                    "fecha": row['fecha'].strftime('%Y-%m-%d'),
                    "fase_id": fase_id,
                    # "prueba_id" necesitaría ser buscado o creado dinámicamente
                    # Lo omitimos del payload principal por ahora. El frontend lo gestiona.
                    "metricas": metricas_list
                }
                long_format_records.append(record)

            except Exception as e:
                errors.append(f"Fila {index + 2}: Error transformando - {str(e)}")

        return long_format_records, errors
    
    def process_csv_file(self, file_content: Union[bytes, str], reference_data: Dict, filename: str = "upload.csv") -> CSVProcessingResult:
        """Procesa un archivo CSV completo y lo transforma a formato largo"""
        try:
            # Validar tamaño
            if isinstance(file_content, bytes) and len(file_content) > self.max_file_size:
                return CSVProcessingResult(
                    success=False, total_rows=0, valid_rows=0,
                    errors=[f"Archivo muy grande (máximo {self.max_file_size // 1024 // 1024}MB)"],
                    warnings=[], data=[], encoding_detected="unknown", delimiter_detected="unknown"
                )
            
            # Detectar encoding
            encoding = self.detect_encoding(file_content) if isinstance(file_content, bytes) else 'utf-8'
            content_str = file_content.decode(encoding) if isinstance(file_content, bytes) else file_content
            
            # Detectar delimitador
            delimiter = self.detect_delimiter(content_str)
            
            # Leer CSV con pandas
            df = pd.read_csv(io.StringIO(content_str), delimiter=delimiter)
            total_rows = len(df)
            
            if total_rows > self.max_rows:
                return CSVProcessingResult(
                    success=False, total_rows=total_rows, valid_rows=0,
                    errors=[f"Demasiadas filas (máximo {self.max_rows} para MVP)"],
                    warnings=[], data=[], encoding_detected=encoding, delimiter_detected=delimiter
                )
            
            # Normalizar columnas
            try:
                df = self.normalize_column_names(df)
            except ValueError as e:
                return CSVProcessingResult(
                    success=False, total_rows=total_rows, valid_rows=0,
                    errors=[str(e)], warnings=[], data=[],
                    encoding_detected=encoding, delimiter_detected=delimiter
                )
            
            # Validar y limpiar datos
            df_clean, errors, warnings = self.validate_and_clean_data(df)
            
            if len(errors) > 0:
                return CSVProcessingResult(
                    success=False, total_rows=total_rows, valid_rows=0,
                    errors=errors, warnings=warnings, data=[],
                    encoding_detected=encoding, delimiter_detected=delimiter
                )
            
            # Transformar a formato largo
            long_format_data, transform_errors = self.transform_to_long_format(df_clean, reference_data)
            errors.extend(transform_errors)

            if len(errors) > 0:
                 return CSVProcessingResult(
                    success=False, total_rows=total_rows, valid_rows=0,
                    errors=errors, warnings=warnings, data=[],
                    encoding_detected=encoding, delimiter_detected=delimiter
                )
            
            return CSVProcessingResult(
                success=True,
                total_rows=total_rows,
                valid_rows=len(long_format_data),
                errors=[],
                warnings=warnings,
                data=long_format_data,
                encoding_detected=encoding,
                delimiter_detected=delimiter
            )
            
        except Exception as e:
            logger.error(f"Error procesando CSV: {str(e)}")
            return CSVProcessingResult(
                success=False, total_rows=0, valid_rows=0,
                errors=[f"Error procesando archivo: {str(e)}"],
                warnings=[], data=[], 
                encoding_detected="unknown", delimiter_detected="unknown"
            )


# Función helper para uso directo
def process_csv_data(file_content: Union[bytes, str], reference_data: Dict, filename: str = "upload.csv") -> CSVProcessingResult:
    """Función helper para procesar CSV"""
    processor = CSVProcessor()
    return processor.process_csv_file(file_content, reference_data, filename) 