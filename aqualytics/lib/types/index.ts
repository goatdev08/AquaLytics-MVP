/**
 * Archivo central de exportación de tipos - AquaLytics
 * Exporta todos los tipos TypeScript de la aplicación
 */

// ===== EXPORTAR TIPOS DE BASE DE DATOS =====
export type {
  // Tipos base de Supabase
  Json,
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  
  // Tipos convenience para entidades
  Nadador,
  Competencia,
  Distancia,
  Estilo,
  Fase,
  Parametro,
  Registro,
  
  // Tipos para creación de entidades
  NuevoNadador,
  NuevaCompetencia,
  NuevoRegistro,
  
  // Tipos extendidos con relaciones
  RegistroCompleto,
  NadadorConRegistros,
  CompetenciaConRegistros,
  
  // Tipos para análisis
  MetricaAnalisis,
  RendimientoNadador,
  ComparativaRendimiento,
  
  // Tipos para filtros y búsquedas
  FiltroRegistros,
  ResultadoBusqueda,
  
  // Tipos literales y constantes
  DistanciaValida,
  EstiloValido,
  FaseValida,
  TipoParametro,
  
  // Tipos para métricas específicas
  MetricaDefinicion,
  
  // Tipos para Supabase client
  SupabaseDatabase,
  SupabaseSchema,
  SupabaseTables
} from './database'

// ===== EXPORTAR CONSTANTES DE BASE DE DATOS =====
export {
  DISTANCIAS_DISPONIBLES,
  ESTILOS_DISPONIBLES,
  FASES_DISPONIBLES,
  TIPOS_PARAMETRO,
  METRICAS_MANUALES,
  METRICAS_AUTOMATICAS,
  TODAS_LAS_METRICAS,
  obtenerMetricaPorId,
  obtenerMetricasPorTipo,
  esDistanciaValida,
  esEstiloValido
} from './database'

// ===== EXPORTAR TIPOS DE MÉTRICAS =====
export type {
  // Tipos para formularios
  MetricFormData,
  MetricFormErrors,
  
  // Tipos para cálculos automáticos
  MetricCalculationInput,
  AutomaticMetrics,
  CalculationResult,
  
  // Tipos para validaciones
  MetricValidationRule,
  ConsistencyRule,
  
  // Tipos para análisis de métricas
  MetricAnalysis,
  PerformanceAnalysis,
  
  // Tipos para comparaciones
  MetricComparison,
  ComparisonResult,
  
  // Tipos para progresión temporal
  ProgressPoint,
  ProgressAnalysis,
  
  // Tipos para rankings
  RankingEntry,
  RankingResult,
  
  // Tipos para filtros de métricas
  MetricFilter,
  MetricFilterResult,
  
  // Tipos para exportación
  ExportOptions,
  ExportResult
} from './metrics'

// ===== EXPORTAR CONSTANTES DE MÉTRICAS =====
export {
  METRIC_VALIDATION_RULES,
  CONSISTENCY_RULES
} from './metrics'

// ===== EXPORTAR TIPOS DE API =====
export type {
  // Tipos base para API responses
  ApiResponse,
  ApiError,
  PaginatedResponse,
  
  // Tipos para endpoints de nadadores
  GetSwimmersResponse,
  GetSwimmerResponse,
  CreateSwimmerRequest,
  CreateSwimmerResponse,
  UpdateSwimmerRequest,
  UpdateSwimmerResponse,
  DeleteSwimmerResponse,
  
  // Tipos para endpoints de competencias
  GetCompetitionsResponse,
  GetCompetitionResponse,
  CreateCompetitionRequest,
  CreateCompetitionResponse,
  
  // Tipos para endpoints de registros/métricas
  CreateMetricRecordRequest,
  CreateMetricRecordResponse,
  GetRecordsRequest,
  GetRecordsResponse,
  UpdateRecordRequest,
  UpdateRecordResponse,
  DeleteRecordRequest,
  DeleteRecordResponse,
  
  // Tipos para endpoints de análisis
  GetAnalysisRequest,
  GetAnalysisResponse,
  GetComparisonRequest,
  GetComparisonResponse,
  GetProgressRequest,
  GetProgressResponse,
  GetRankingsRequest,
  GetRankingsResponse,
  
  // Tipos para endpoints de filtros y búsquedas
  SearchRequest,
  SearchResponse,
  GetFiltersResponse,
  
  // Tipos para endpoints de exportación
  ExportRequest,
  ExportResponse,
  
  // Tipos para endpoints de upload/import
  UploadCsvRequest,
  UploadCsvResponse,
  ValidateDataRequest,
  ValidateDataResponse,
  
  // Tipos para websocket/real-time
  RealtimeEvent,
  SubscribeRequest,
  
  // Tipos para autenticación (post-MVP)
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  
  // Tipos para configuración y metadata
  GetConfigResponse,
  HealthCheckResponse,
  
  // Tipos de error específicos
  ValidationError,
  NotFoundError,
  ConflictError,
  CalculationError,
  
  // Tipos para batch operations
  BatchRequest,
  BatchResponse,
  
  // Utility types
  EndpointMethod,
  EndpointConfig,
  ApiEndpoints
} from './api'

// ===== EXPORTAR CONSTANTES DE API =====
export {
  API_ENDPOINTS,
  HTTP_STATUS_CODES
} from './api'

// ===== TIPOS UTILITARIOS ADICIONALES =====

/**
 * Tipo helper para props de componentes React con children
 */
export interface ComponentProps {
  children?: React.ReactNode
  className?: string
}

/**
 * Tipo helper para componentes con loading state
 */
export interface LoadingState {
  loading: boolean
  error?: string | null
}

/**
 * Tipo helper para componentes de formulario
 */
export interface FormState<T = unknown> {
  data: T
  errors: Record<string, string>
  isValid: boolean
  isSubmitting: boolean
}

/**
 * Tipo helper para filtros de tabla/lista
 */
export interface TableFilter {
  search?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * Tipo helper para opciones de select/dropdown
 */
export interface SelectOption<T = unknown> {
  value: T
  label: string
  description?: string
  disabled?: boolean
  icon?: string
}

/**
 * Tipo helper para configuración de gráficos Chart.js
 */
export interface ChartConfig {
  type: 'line' | 'bar' | 'radar' | 'pie' | 'doughnut'
  responsive: boolean
  theme: 'light' | 'dark'
  phoenix_colors: boolean
}

/**
 * Tipo helper para datos de gráficos
 */
export interface ChartData<T = number> {
  labels: string[]
  datasets: {
    label: string
    data: T[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    [key: string]: unknown
  }[]
}

/**
 * Tipo helper para notificaciones/toast
 */
export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Tipo helper para configuración de modales
 */
export interface ModalConfig {
  isOpen: boolean
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'phoenix' | 'destructive'
  onClose: () => void
}

/**
 * Tipo helper para navegación/breadcrumbs
 */
export interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

/**
 * Tipo helper para configuración de tema
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  accentColor: 'phoenix' | 'blue' | 'green' | 'purple'
  compactMode: boolean
}

// ===== RE-EXPORT TIPOS DE REACT PARA CONVENIENCE =====
export type {
  ReactNode,
  ReactElement,
  ComponentType,
  HTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  FormHTMLAttributes
} from 'react' 