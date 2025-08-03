/**
 * Tipos para API responses y manejo de errores - AquaLytics
 * Incluye tipos para todos los endpoints de la aplicación
 */

import { 
  Nadador, 
  Competencia, 
  Distancia, 
  Estilo, 
  Fase, 
  Metrica, 
  Registro,
  RegistroCompleto
} from './database.types'

import { 
  MetricFormData, 
  AutomaticMetrics, 
  PerformanceAnalysis,
  ComparisonResult,
  ProgressAnalysis,
  RankingResult,
  MetricFilter,
  ExportResult 
} from './metrics'

// ===== TIPOS BASE PARA API RESPONSES =====

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

export interface ApiError {
  success: false
  error: string
  message: string
  details?: unknown
  code?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
  timestamp: string
}

// ===== TIPOS PARA ENDPOINTS DE NADADORES =====

export interface GetSwimmersResponse extends ApiResponse<Nadador[]> {
  data: (Nadador & {
    total_races?: number
    best_time?: number
    latest_race_date?: string
    average_performance?: number
  })[]
}

export interface GetSwimmerResponse extends ApiResponse<Nadador> {
  data: Nadador & {
    total_races: number
    competitions: Competencia[]
    recent_performances: RegistroCompleto[]
    personal_bests: Record<string, number>
    statistics: {
      avg_time: number
      improvement_rate: number
      consistency_score: number
    }
  }
}

export interface CreateSwimmerRequest {
  nombre: string
  edad?: number
  peso?: number
}

export type CreateSwimmerResponse = ApiResponse<Nadador>

export interface UpdateSwimmerRequest extends Partial<CreateSwimmerRequest> {
  id_nadador: number
}

export type UpdateSwimmerResponse = ApiResponse<Nadador>

export type DeleteSwimmerResponse = ApiResponse<{ deleted_id: number }>

// ===== TIPOS PARA ENDPOINTS DE COMPETENCIAS =====

export interface GetCompetitionsResponse extends ApiResponse<Competencia[]> {
  data: (Competencia & {
    total_swimmers?: number
    total_races?: number
    date_range?: string
  })[]
}

export interface GetCompetitionResponse extends ApiResponse<Competencia> {
  data: Competencia & {
    swimmers: Nadador[]
    races: RegistroCompleto[]
    statistics: {
      total_participants: number
      total_races: number
      fastest_time: number
      average_time: number
    }
  }
}

export interface CreateCompetitionRequest {
  competencia: string
  periodo?: string
}

export type CreateCompetitionResponse = ApiResponse<Competencia>

// ===== TIPOS PARA ENDPOINTS DE REGISTROS/MÉTRICAS =====

export interface CreateMetricRecordRequest extends MetricFormData {}

export interface CreateMetricRecordResponse extends ApiResponse<{
  manual_records: Registro[]
  automatic_metrics: AutomaticMetrics
  record_ids: number[]
  calculation_details: {
    formulas_used: string[]
    values_calculated: Record<string, number>
  }
}> {}

export interface MetricFilterParams {
  swimmer_id?: number;
  competition_id?: number;
  distance_id?: number;
  stroke_id?: number;
  date_from?: string;
  date_to?: string;
  limit?: number;
}

export interface GetRecordsResponse extends PaginatedResponse<RegistroCompleto> {}

export interface UpdateRecordRequest {
  registro_id: number
  valor: number
  recalculate_automatic?: boolean
}

export interface UpdateRecordResponse extends ApiResponse<{
  updated_record: Registro
  affected_automatic_metrics?: AutomaticMetrics
}> {}

export interface DeleteRecordRequest {
  registro_id: number
  delete_related_automatic?: boolean
}

export interface DeleteRecordResponse extends ApiResponse<{
  deleted_record_id: number
  deleted_automatic_metrics?: number[]
}> {}

// ===== TIPOS PARA ENDPOINTS DE ANÁLISIS =====

export interface GetAnalysisRequest {
  swimmer_id: number
  competition_id?: number
  distance_id?: number
  stroke_id?: number
  date_from?: string
  date_to?: string
  include_comparisons?: boolean
}

export type GetAnalysisResponse = ApiResponse<PerformanceAnalysis>

export interface GetComparisonRequest {
  swimmer1_id: number
  swimmer2_id: number
  competition_id?: number
  distance_id?: number
  stroke_id?: number
  metric_ids?: number[]
}

export type GetComparisonResponse = ApiResponse<ComparisonResult>

export interface GetProgressRequest {
  swimmer_id: number
  metric_id: number
  timeframe_days: number
  comparison_type?: 'absolute' | 'relative'
}

export type GetProgressResponse = ApiResponse<ProgressAnalysis>

export interface GetRankingsRequest {
  metric_id: number
  distance_id?: number
  stroke_id?: number
  phase_id?: number
  date_from?: string
  date_to?: string
  limit?: number
}

export type GetRankingsResponse = ApiResponse<RankingResult>

// ===== TIPOS PARA ENDPOINTS DE FILTROS Y BÚSQUEDAS =====

export interface SearchRequest {
  query: string
  type: 'swimmers' | 'competitions' | 'records' | 'all'
  filters?: MetricFilter
  limit?: number
}

export type SearchResponse = ApiResponse<{
  swimmers: Nadador[]
  competitions: Competencia[]
  records: RegistroCompleto[]
  total_results: number
}>

export type GetFiltersResponse = ApiResponse<{
  swimmers: Nadador[]
  competitions: Competencia[]
  distances: Distancia[]
  strokes: Estilo[]
  phases: Fase[]
  parameters: Metrica[]
}>

// ===== TIPOS PARA ENDPOINTS DE EXPORTACIÓN =====

export interface ExportRequest {
  format: 'csv' | 'json' | 'excel'
  data_type: 'swimmers' | 'competitions' | 'records' | 'analysis'
  filters?: MetricFilter
  include_metadata?: boolean
  include_calculations?: boolean
}

export type ExportResponse = ApiResponse<ExportResult>

// ===== TIPOS PARA ENDPOINTS DE UPLOAD/IMPORT =====

export interface UploadCsvRequest {
  file: File
  competition_id: number
  validate_only?: boolean
  auto_calculate?: boolean
}

export type UploadCsvResponse = ApiResponse<{
  processed_records: number
  validation_errors: string[]
  created_swimmers: number
  created_records: number
  calculated_metrics: number
  preview?: RegistroCompleto[]
}>

export interface ValidateDataRequest {
  data: MetricFormData | MetricFormData[]
  check_consistency?: boolean
  check_duplicates?: boolean
}

export type ValidateDataResponse = ApiResponse<{
  is_valid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}>

// ===== TIPOS PARA WEBSOCKET/REAL-TIME =====

export interface RealtimeEvent {
  type: 'record_created' | 'record_updated' | 'record_deleted' | 'analysis_updated'
  data: unknown
  timestamp: string
  user_id?: string
}

export interface SubscribeRequest {
  events: RealtimeEvent['type'][]
  filters?: {
    swimmer_ids?: number[]
    competition_ids?: number[]
  }
}

// ===== TIPOS PARA AUTENTICACIÓN (POST-MVP) =====

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'coach' | 'swimmer' | 'admin'
  permissions: string[]
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export type LoginResponse = ApiResponse<{
  user: AuthUser
  token: string
  expires_at: string
}>

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role: 'coach' | 'swimmer'
}

export type RegisterResponse = ApiResponse<AuthUser>

// ===== TIPOS PARA CONFIGURACIÓN Y METADATA =====

export type GetConfigResponse = ApiResponse<{
  app_version: string
  api_version: string
  features_enabled: string[]
  limits: {
    max_swimmers_per_coach: number
    max_records_per_request: number
    max_export_records: number
  }
  constants: {
    distances: Distancia[]
    strokes: Estilo[]
    phases: Fase[]
    parameters: Metrica[]
  }
}>

export type HealthCheckResponse = ApiResponse<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: {
    database: 'up' | 'down'
    calculations: 'up' | 'down'
    storage: 'up' | 'down'
  }
  version: string
  uptime: string
}>

// ===== TIPOS DE ERROR ESPECÍFICOS =====

export interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR'
  details: {
    field: string
    message: string
    value: unknown
  }[]
}

export interface NotFoundError extends ApiError {
  code: 'NOT_FOUND'
  details: {
    resource: string
    id: number | string
  }
}

export interface ConflictError extends ApiError {
  code: 'CONFLICT'
  details: {
    conflicting_field: string
    existing_value: unknown
  }
}

export interface CalculationError extends ApiError {
  code: 'CALCULATION_ERROR'
  details: {
    failed_metric: string
    input_values: Record<string, number>
    formula: string
  }
}

// ===== TIPOS PARA BATCH OPERATIONS =====

export interface BatchRequest<T> {
  operations: {
    action: 'create' | 'update' | 'delete'
    data: T
    id?: number
  }[]
  options?: {
    continue_on_error?: boolean
    return_details?: boolean
  }
}

export type BatchResponse<T> = ApiResponse<{
  successful: number
  failed: number
  results: {
    success: boolean
    data?: T
    error?: string
    index: number
  }[]
}>

// ===== UTILITY TYPES =====

export type EndpointMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface EndpointConfig {
  method: EndpointMethod
  url: string
  auth_required?: boolean
  rate_limit?: number
  timeout?: number
}

export type ApiEndpoints = {
  // Swimmers
  getSwimmers: EndpointConfig
  getSwimmer: EndpointConfig
  createSwimmer: EndpointConfig
  updateSwimmer: EndpointConfig
  deleteSwimmer: EndpointConfig
  
  // Competitions
  getCompetitions: EndpointConfig
  getCompetition: EndpointConfig
  createCompetition: EndpointConfig
  
  // Records/Metrics
  createRecord: EndpointConfig
  getRecords: EndpointConfig
  updateRecord: EndpointConfig
  deleteRecord: EndpointConfig
  
  // Analysis
  getAnalysis: EndpointConfig
  getComparison: EndpointConfig
  getProgress: EndpointConfig
  getRankings: EndpointConfig
  
  // Utility
  search: EndpointConfig
  export: EndpointConfig
  uploadCsv: EndpointConfig
  validateData: EndpointConfig
  getConfig: EndpointConfig
  healthCheck: EndpointConfig
}

// ===== CONSTANTS =====

export const API_ENDPOINTS: ApiEndpoints = {
  // Swimmers
  getSwimmers: { method: 'GET', url: '/api/swimmers' },
  getSwimmer: { method: 'GET', url: '/api/swimmers/:id' },
  createSwimmer: { method: 'POST', url: '/api/swimmers' },
  updateSwimmer: { method: 'PUT', url: '/api/swimmers/:id' },
  deleteSwimmer: { method: 'DELETE', url: '/api/swimmers/:id' },
  
  // Competitions
  getCompetitions: { method: 'GET', url: '/api/competitions' },
  getCompetition: { method: 'GET', url: '/api/competitions/:id' },
  createCompetition: { method: 'POST', url: '/api/competitions' },
  
  // Records/Metrics
  createRecord: { method: 'POST', url: '/api/records' },
  getRecords: { method: 'GET', url: '/api/records' },
  updateRecord: { method: 'PUT', url: '/api/records/:id' },
  deleteRecord: { method: 'DELETE', url: '/api/records/:id' },
  
  // Analysis
  getAnalysis: { method: 'GET', url: '/api/analysis/swimmer/:id' },
  getComparison: { method: 'GET', url: '/api/analysis/compare' },
  getProgress: { method: 'GET', url: '/api/analysis/progress' },
  getRankings: { method: 'GET', url: '/api/analysis/rankings' },
  
  // Utility
  search: { method: 'GET', url: '/api/search' },
  export: { method: 'POST', url: '/api/export' },
  uploadCsv: { method: 'POST', url: '/api/upload/csv' },
  validateData: { method: 'POST', url: '/api/validate' },
  getConfig: { method: 'GET', url: '/api/config' },
  healthCheck: { method: 'GET', url: '/api/health' }
} as const

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const 

export interface CompleteTestRecord {
  prueba_id: number;
  nadador_id: number;
  fecha: string;
  manual_metrics: Record<string, number>;
  auto_metrics: Record<string, number>;
} 