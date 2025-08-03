"""
Constantes de Base de Datos - AquaLytics API
Constantes para IDs de tablas usando la estructura real de Supabase.

Estas constantes fueron generadas basándose en la consulta real a la BD
mediante MCP Supabase (project: ombbxzdptnasoipzpmfh).
"""

from typing import Final

# ===== MÉTRICAS =====
# Constantes para metrica_id basado en la estructura real de la tabla 'metricas'

class MetricaID:
    """Constantes para IDs de métricas desde la tabla 'metricas'"""
    
    # Métricas identificadas en la BD real
    TIEMPO_15M: Final[int] = 1    # "Tiempo 15m" (tipo M, no global)
    TIEMPO_TOTAL: Final[int] = 9  # "Tiempo Total" (tipo M, global)
    
    @classmethod
    def get_description(cls, metrica_id: int) -> str:
        """Obtiene la descripción de una métrica por su ID"""
        descriptions = {
            cls.TIEMPO_15M: "Tiempo 15m",
            cls.TIEMPO_TOTAL: "Tiempo Total"
        }
        return descriptions.get(metrica_id, f"Métrica ID {metrica_id}")

# ===== ALIASES PARA RETROCOMPATIBILIDAD =====
# Aliases más cortos para uso frecuente
TIEMPO_15M_ID = MetricaID.TIEMPO_15M
TIEMPO_TOTAL_ID = MetricaID.TIEMPO_TOTAL

# ===== VALIDACIÓN =====
def validate_metrica_id(metrica_id: int) -> bool:
    """Valida si un metrica_id es conocido en el sistema"""
    known_ids = [MetricaID.TIEMPO_15M, MetricaID.TIEMPO_TOTAL]
    return metrica_id in known_ids

def get_metrica_name(metrica_id: int) -> str:
    """Obtiene el nombre de una métrica, útil para logging y debugging"""
    return MetricaID.get_description(metrica_id)