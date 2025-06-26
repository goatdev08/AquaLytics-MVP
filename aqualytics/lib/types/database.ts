/**
 * Tipos de base de datos para AquaLytics
 * Generados desde Supabase y extendidos para compatibilidad
 */

// ===== TIPOS GENERADOS DESDE SUPABASE =====

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      competencias: {
        Row: {
          competencia: string
          competencia_id: number
          periodo: unknown | null
        }
        Insert: {
          competencia: string
          competencia_id?: number
          periodo?: unknown | null
        }
        Update: {
          competencia?: string
          competencia_id?: number
          periodo?: unknown | null
        }
        Relationships: []
      }
      distancias: {
        Row: {
          distancia: number
          distancia_id: number
        }
        Insert: {
          distancia: number
          distancia_id?: number
        }
        Update: {
          distancia?: number
          distancia_id?: number
        }
        Relationships: []
      }
      estilos: {
        Row: {
          estilo: string
          estilo_id: number
        }
        Insert: {
          estilo: string
          estilo_id?: number
        }
        Update: {
          estilo?: string
          estilo_id?: number
        }
        Relationships: []
      }
      fases: {
        Row: {
          fase: string
          fase_id: number
        }
        Insert: {
          fase: string
          fase_id?: number
        }
        Update: {
          fase?: string
          fase_id?: number
        }
        Relationships: []
      }
      nadadores: {
        Row: {
          edad: number | null
          id_nadador: number
          nombre: string
          peso: number | null
        }
        Insert: {
          edad?: number | null
          id_nadador?: number
          nombre: string
          peso?: number | null
        }
        Update: {
          edad?: number | null
          id_nadador?: number
          nombre?: string
          peso?: number | null
        }
        Relationships: []
      }
      parametros: {
        Row: {
          global: boolean | null
          parametro: string
          parametro_id: number
          tipo: string
        }
        Insert: {
          global?: boolean | null
          parametro: string
          parametro_id?: number
          tipo: string
        }
        Update: {
          global?: boolean | null
          parametro?: string
          parametro_id?: number
          tipo?: string
        }
        Relationships: []
      }
      registros: {
        Row: {
          competencia_id: number | null
          distancia_id: number | null
          estilo_id: number | null
          fase_id: number | null
          fecha: string | null
          id_nadador: number | null
          parametro_id: number | null
          registro_id: number
          segmento: number | null
          valor: number | null
        }
        Insert: {
          competencia_id?: number | null
          distancia_id?: number | null
          estilo_id?: number | null
          fase_id?: number | null
          fecha?: string | null
          id_nadador?: number | null
          parametro_id?: number | null
          registro_id?: number
          segmento?: number | null
          valor?: number | null
        }
        Update: {
          competencia_id?: number | null
          distancia_id?: number | null
          estilo_id?: number | null
          fase_id?: number | null
          fecha?: string | null
          id_nadador?: number | null
          parametro_id?: number | null
          registro_id?: number
          segmento?: number | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "registros_competencia_id_fkey"
            columns: ["competencia_id"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["competencia_id"]
          },
          {
            foreignKeyName: "registros_distancia_id_fkey"
            columns: ["distancia_id"]
            isOneToOne: false
            referencedRelation: "distancias"
            referencedColumns: ["distancia_id"]
          },
          {
            foreignKeyName: "registros_estilo_id_fkey"
            columns: ["estilo_id"]
            isOneToOne: false
            referencedRelation: "estilos"
            referencedColumns: ["estilo_id"]
          },
          {
            foreignKeyName: "registros_fase_id_fkey"
            columns: ["fase_id"]
            isOneToOne: false
            referencedRelation: "fases"
            referencedColumns: ["fase_id"]
          },
          {
            foreignKeyName: "registros_id_nadador_fkey"
            columns: ["id_nadador"]
            isOneToOne: false
            referencedRelation: "nadadores"
            referencedColumns: ["id_nadador"]
          },
          {
            foreignKeyName: "registros_parametro_id_fkey"
            columns: ["parametro_id"]
            isOneToOne: false
            referencedRelation: "parametros"
            referencedColumns: ["parametro_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

// ===== TIPOS CONVENIENCE (COMPATIBILIDAD HACIA ATRÁS) =====

export type Nadador = Tables<'nadadores'>
export type Competencia = Tables<'competencias'>
export type Distancia = Tables<'distancias'>
export type Estilo = Tables<'estilos'>
export type Fase = Tables<'fases'>
export type Parametro = Tables<'parametros'>
export type Registro = Tables<'registros'>

export type NuevoNadador = TablesInsert<'nadadores'>
export type NuevaCompetencia = TablesInsert<'competencias'>
export type NuevoRegistro = TablesInsert<'registros'>

// ===== TIPOS EXTENDIDOS CON RELACIONES =====

export interface RegistroCompleto extends Registro {
  nadador?: Nadador
  competencia?: Competencia
  distancia?: Distancia
  estilo?: Estilo
  fase?: Fase
  parametro?: Parametro
}

export interface NadadorConRegistros extends Nadador {
  registros?: Registro[]
  totalRegistros?: number
  ultimaParticipacion?: string
}

export interface CompetenciaConRegistros extends Competencia {
  registros?: Registro[]
  totalNadadores?: number
  totalRegistros?: number
}

// ===== TIPOS PARA ANÁLISIS Y MÉTRICAS =====

export interface MetricaAnalisis {
  parametro: string
  tipo: 'M' | 'A'
  valor: number
  segmento?: number | null
  fecha?: string | null
  unidad?: string
  descripcion?: string
}

export interface RendimientoNadador {
  nadador: Nadador
  competencia: Competencia
  distancia: Distancia
  estilo: Estilo
  fase: Fase
  metricas: MetricaAnalisis[]
  fecha?: string | null
  tiempoTotal?: number
  velocidadPromedio?: number
}

export interface ComparativaRendimiento {
  nadador1: RendimientoNadador
  nadador2: RendimientoNadador
  diferencias: {
    parametro: string
    diferencia: number
    porcentaje: number
    mejora?: 'nadador1' | 'nadador2'
  }[]
}

// ===== TIPOS PARA FILTROS Y BÚSQUEDAS =====

export interface FiltroRegistros {
  nadador_id?: number
  competencia_id?: number
  distancia_id?: number
  estilo_id?: number
  fase_id?: number
  fecha_desde?: string
  fecha_hasta?: string
  parametros?: number[]
  tipo_parametro?: 'M' | 'A' | 'all'
  limite?: number
  offset?: number
}

export interface ResultadoBusqueda<T> {
  data: T[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}

// ===== CONSTANTES Y TIPOS LITERALES =====

export const DISTANCIAS_DISPONIBLES = [25, 50, 100, 200, 400, 800, 1500] as const
export const ESTILOS_DISPONIBLES = ['Crol', 'Dorso', 'Pecho', 'Mariposa', 'Combinado'] as const
export const FASES_DISPONIBLES = ['PRELIMINAR', 'SEMIFINAL', 'FINAL'] as const
export const TIPOS_PARAMETRO = ['M', 'A'] as const

export type DistanciaValida = typeof DISTANCIAS_DISPONIBLES[number]
export type EstiloValido = typeof ESTILOS_DISPONIBLES[number]
export type FaseValida = typeof FASES_DISPONIBLES[number]
export type TipoParametro = typeof TIPOS_PARAMETRO[number]

// ===== TIPOS PARA MÉTRICAS ESPECÍFICAS DE NATACIÓN =====

export interface MetricaDefinicion {
  parametro_id: number
  nombre: string
  descripcion: string
  unidad: string
  tipo: TipoParametro
  segmento_especifico: boolean
  global: boolean
  formula?: string
}

// Métricas manuales según el PRD
export const METRICAS_MANUALES: Readonly<MetricaDefinicion[]> = [
  { parametro_id: 1, nombre: 'T15 (1)', descripcion: 'Tiempo 15m (Primer Segmento)', unidad: 'seg', tipo: 'M', segmento_especifico: true, global: false },
  { parametro_id: 2, nombre: '# de BRZ 1', descripcion: 'Brazadas (Primer Segmento)', unidad: 'brazadas', tipo: 'M', segmento_especifico: true, global: false },
  { parametro_id: 3, nombre: 'T25 (1)', descripcion: 'Tiempo 25m (Primer Segmento)', unidad: 'seg', tipo: 'M', segmento_especifico: true, global: false },
  { parametro_id: 4, nombre: 'F1', descripcion: 'Flecha (Primer Segmento)', unidad: 'metros', tipo: 'M', segmento_especifico: true, global: false },
  { parametro_id: 5, nombre: 'T15 (2)', descripcion: 'Tiempo 15m (Segundo Segmento)', unidad: 'seg', tipo: 'M', segmento_especifico: true, global: false },
  { parametro_id: 6, nombre: '# de BRZ 2', descripcion: 'Brazadas (Segundo Segmento)', unidad: 'brazadas', tipo: 'M', segmento_especifico: true, global: false },
  { parametro_id: 7, nombre: 'T25 (2)', descripcion: 'Tiempo 25m (Segundo Segmento)', unidad: 'seg', tipo: 'M', segmento_especifico: true, global: false },
  { parametro_id: 8, nombre: 'F2', descripcion: 'Flecha (Segundo Segmento)', unidad: 'metros', tipo: 'M', segmento_especifico: true, global: false },
  { parametro_id: 9, nombre: 'T TOTAL', descripcion: 'Tiempo Total', unidad: 'seg', tipo: 'M', segmento_especifico: false, global: true },
  { parametro_id: 10, nombre: '# de BRZ TOTAL', descripcion: 'Total de Brazadas', unidad: 'brazadas', tipo: 'M', segmento_especifico: false, global: true }
] as const

// Métricas automáticas según el PRD
export const METRICAS_AUTOMATICAS: Readonly<MetricaDefinicion[]> = [
  { parametro_id: 11, nombre: 'V1', descripcion: 'Velocidad (Primer Segmento)', unidad: 'm/s', tipo: 'A', segmento_especifico: true, global: false, formula: '25 / T25(1)' },
  { parametro_id: 12, nombre: 'V2', descripcion: 'Velocidad (Segundo Segmento)', unidad: 'm/s', tipo: 'A', segmento_especifico: true, global: false, formula: '25 / T25(2)' },
  { parametro_id: 13, nombre: 'V promedio', descripcion: 'Velocidad Promedio', unidad: 'm/s', tipo: 'A', segmento_especifico: false, global: true, formula: '50 / T_TOTAL' },
  { parametro_id: 14, nombre: 'DIST x BRZ', descripcion: 'Distancia por Brazada', unidad: 'm/brazada', tipo: 'A', segmento_especifico: false, global: true, formula: '50 / BRZ_TOTAL' },
  { parametro_id: 15, nombre: 'DIST sin F', descripcion: 'Distancia sin Flecha', unidad: 'metros', tipo: 'A', segmento_especifico: false, global: true, formula: '50 - (F1 + F2)' },
  { parametro_id: 16, nombre: 'F promedio', descripcion: 'Promedio de Flecha', unidad: 'metros', tipo: 'A', segmento_especifico: false, global: true, formula: '(F1 + F2) / 2' }
] as const

// Todas las métricas combinadas
export const TODAS_LAS_METRICAS = [...METRICAS_MANUALES, ...METRICAS_AUTOMATICAS] as const

// ===== HELPER FUNCTIONS PARA TIPOS =====

/**
 * Función para obtener definición de métrica por ID
 */
export function obtenerMetricaPorId(id: number): MetricaDefinicion | undefined {
  return TODAS_LAS_METRICAS.find(metrica => metrica.parametro_id === id)
}

/**
 * Función para obtener métricas por tipo
 */
export function obtenerMetricasPorTipo(tipo: TipoParametro): readonly MetricaDefinicion[] {
  return tipo === 'M' ? METRICAS_MANUALES : METRICAS_AUTOMATICAS
}

/**
 * Función para validar si una distancia es válida
 */
export function esDistanciaValida(distancia: number): distancia is DistanciaValida {
  return DISTANCIAS_DISPONIBLES.includes(distancia as DistanciaValida)
}

/**
 * Función para validar si un estilo es válido
 */
export function esEstiloValido(estilo: string): estilo is EstiloValido {
  return ESTILOS_DISPONIBLES.includes(estilo as EstiloValido)
}

// ===== EXPORT TYPES PARA SUPABASE CLIENT =====

export type SupabaseDatabase = Database
export type SupabaseSchema = Database['public']
export type SupabaseTables = SupabaseSchema['Tables']

 