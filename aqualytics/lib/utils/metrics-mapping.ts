/**
 * Mapeo de métricas con filtros agrupados y labels amigables
 * Basado en PRD.txt sección 5.2 - Métricas Definidas (16 Total)
 */

export interface MetricDefinition {
  parametro: string
  label: string
  shortLabel: string
  unit: string
  tipo: 'M' | 'A' // Manual | Automática
  grupo: 'brazadas' | 'velocidad' | 'tiempo' | 'insights'
  format: string
  formula?: string
}

/**
 * Genera labels dinámicos basados en la distancia seleccionada
 */
export function getSegmentLabel(segmento: number, distancia: number): string {
  const segmentDistance = distancia / 2 // Para 50m = 25m, para 100m = 50m, etc.
  
  if (segmento === 1) return `primer ${segmentDistance}`
  if (segmento === 2) return `segundo ${segmentDistance}`
  return `segmento ${segmento}`
}

/**
 * Definición completa de todas las métricas
 */
export const METRICS_DEFINITIONS: MetricDefinition[] = [
  // === MÉTRICAS MANUALES (10) ===
  {
    parametro: "T15 (1)",
    label: "Tiempo 15m (Primer Segmento)",
    shortLabel: "T15 - primer tramo", 
    unit: "seg",
    tipo: "M",
    grupo: "tiempo",
    format: "XX.XX"
  },
  {
    parametro: "# de BRZ 1",
    label: "Brazadas (Primer Segmento)",
    shortLabel: "Brazadas - primer tramo",
    unit: "brazadas", 
    tipo: "M",
    grupo: "brazadas",
    format: "integer"
  },
  {
    parametro: "T25 (1)", 
    label: "Tiempo 25m (Primer Segmento)",
    shortLabel: "primer 25",
    unit: "seg",
    tipo: "M", 
    grupo: "tiempo",
    format: "XX.XX"
  },
  {
    parametro: "F1",
    label: "Flecha (Primer Segmento)",
    shortLabel: "Flecha - primer tramo",
    unit: "metros",
    tipo: "M",
    grupo: "insights", 
    format: "X.XX"
  },
  {
    parametro: "T15 (2)",
    label: "Tiempo 15m (Segundo Segmento)", 
    shortLabel: "T15 - segundo tramo",
    unit: "seg",
    tipo: "M",
    grupo: "tiempo",
    format: "XX.XX"
  },
  {
    parametro: "# de BRZ 2",
    label: "Brazadas (Segundo Segmento)",
    shortLabel: "Brazadas - segundo tramo", 
    unit: "brazadas",
    tipo: "M",
    grupo: "brazadas",
    format: "integer"
  },
  {
    parametro: "T25 (2)",
    label: "Tiempo 25m (Segundo Segmento)",
    shortLabel: "segundo 25",
    unit: "seg", 
    tipo: "M",
    grupo: "tiempo", 
    format: "XX.XX"
  },
  {
    parametro: "F2",
    label: "Flecha (Segundo Segmento)",
    shortLabel: "Flecha - segundo tramo",
    unit: "metros",
    tipo: "M",
    grupo: "insights",
    format: "X.XX"
  },
  {
    parametro: "T TOTAL",
    label: "Tiempo Total", 
    shortLabel: "Tiempo total",
    unit: "seg",
    tipo: "M",
    grupo: "tiempo",
    format: "XX.XX"
  },
  {
    parametro: "# de BRZ TOTAL",
    label: "Total de Brazadas",
    shortLabel: "Brazadas total", 
    unit: "brazadas",
    tipo: "M",
    grupo: "brazadas",
    format: "integer"
  },

  // === MÉTRICAS AUTOMÁTICAS (6) ===
  {
    parametro: "V1",
    label: "Velocidad (Primer Segmento)",
    shortLabel: "Velocidad - primer tramo",
    unit: "m/s",
    tipo: "A",
    grupo: "velocidad", 
    format: "X.XX",
    formula: "25 / T25(1)"
  },
  {
    parametro: "V2", 
    label: "Velocidad (Segundo Segmento)",
    shortLabel: "Velocidad - segundo tramo",
    unit: "m/s",
    tipo: "A",
    grupo: "velocidad",
    format: "X.XX", 
    formula: "25 / T25(2)"
  },
  {
    parametro: "V promedio",
    label: "Velocidad Promedio",
    shortLabel: "Velocidad promedio",
    unit: "m/s",
    tipo: "A", 
    grupo: "velocidad",
    format: "X.XX",
    formula: "50 / T_TOTAL"
  },
  {
    parametro: "DIST x BRZ",
    label: "Distancia por Brazada", 
    shortLabel: "Dist. x brazada",
    unit: "m/brazada",
    tipo: "A",
    grupo: "brazadas",
    format: "X.XX",
    formula: "50 / BRZ_TOTAL"
  },
  {
    parametro: "DIST sin F",
    label: "Distancia sin Flecha",
    shortLabel: "Distancia sin flecha", 
    unit: "metros",
    tipo: "A",
    grupo: "insights",
    format: "XX.X",
    formula: "50 - (F1 + F2)"
  },
  {
    parametro: "F promedio",
    label: "Promedio de Flecha",
    shortLabel: "Flecha promedio",
    unit: "metros", 
    tipo: "A",
    grupo: "insights",
    format: "X.XX",
    formula: "(F1 + F2) / 2"
  }
]

/**
 * Filtros agrupados por tipo de métrica
 */
export const METRIC_GROUPS = {
  brazadas: {
    name: "Brazadas",
    icon: "🏊‍♂️",
    description: "Métricas relacionadas con el número y eficiencia de brazadas",
    metrics: METRICS_DEFINITIONS.filter(m => m.grupo === 'brazadas')
  },
  velocidad: {
    name: "Velocidad", 
    icon: "⚡",
    description: "Métricas de velocidad por segmentos y promedio",
    metrics: METRICS_DEFINITIONS.filter(m => m.grupo === 'velocidad')
  },
  tiempo: {
    name: "Tiempo",
    icon: "⏱️", 
    description: "Tiempos por segmentos, parciales y totales",
    metrics: METRICS_DEFINITIONS.filter(m => m.grupo === 'tiempo')
  },
  insights: {
    name: "Insights",
    icon: "💡",
    description: "Métricas avanzadas: eficiencia, técnica y consistencia", 
    metrics: METRICS_DEFINITIONS.filter(m => m.grupo === 'insights')
  }
} as const

/**
 * Obtiene métricas por grupo
 */
export function getMetricsByGroup(grupo: keyof typeof METRIC_GROUPS): MetricDefinition[] {
  return METRIC_GROUPS[grupo].metrics
}

/**
 * Obtiene definición de métrica por parámetro
 */
export function getMetricDefinition(parametro: string): MetricDefinition | undefined {
  return METRICS_DEFINITIONS.find(m => m.parametro === parametro)
}

/**
 * Genera labels dinámicos para comparaciones basados en distancia
 */
export function getDynamicLabel(metric: MetricDefinition, distancia: number): string {
  const segmentDistance = distancia / 2
  
  // Adaptar labels según la distancia  
  if (metric.parametro.includes('(1)') || metric.parametro.includes('1')) {
    return metric.shortLabel.replace('primer 25', `primer ${segmentDistance}`)
                           .replace('primer tramo', `primer ${segmentDistance}m`)
  }
  
  if (metric.parametro.includes('(2)') || metric.parametro.includes('2')) {
    return metric.shortLabel.replace('segundo 25', `segundo ${segmentDistance}`)
                           .replace('segundo tramo', `segundo ${segmentDistance}m`)
  }
  
  return metric.shortLabel
}

/**
 * Métricas adicionales calculadas para Insights creativos
 */
export const CALCULATED_INSIGHTS = {
  eficiencia: {
    name: "Eficiencia",
    formula: "V_promedio / BRZ_TOTAL", 
    description: "Ratio velocidad/brazadas - mayor es mejor",
    unit: "(m/s)/brazada"
  },
  consistencia: {
    name: "Consistencia", 
    formula: "1 - |V1 - V2| / V_promedio",
    description: "Uniformidad entre segmentos - 1.0 es perfecto",
    unit: "índice"
  },
  fatiga: {
    name: "Índice de Fatiga",
    formula: "(V1 - V2) / V1", 
    description: "Pérdida de velocidad - menor es mejor", 
    unit: "porcentaje"
  },
  tecnica: {
    name: "Técnica",
    formula: "F_promedio / DIST_sin_F",
    description: "Ratio flecha/nado - indica técnica de salida/viraje",
    unit: "ratio"
  }
} as const 