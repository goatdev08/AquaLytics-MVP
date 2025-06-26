/**
 * AquaLytics Chart Components
 * 
 * Componentes de visualización de datos para métricas de natación
 * Todos los componentes soportan modo oscuro y exportación de datos
 * 
 * @see README.md para documentación completa
 */

// Gráfico de líneas para progresión temporal de una métrica
export { default as MetricsChart } from './MetricsChart'

// Gráfico multi-línea para comparar progreso entre nadadores
export { default as ProgressChart } from './ProgressChart'

// Gráfico de radar para comparación multi-métrica
export { default as ComparisonChart } from './ComparisonChart'

// Tabla interactiva con rankings y filtros
export { default as RankingTable } from './RankingTable'

// Próximamente se agregarán:
// export { default as ComparisonChart } from './ComparisonChart'
// export { default as RankingTable } from './RankingTable' 