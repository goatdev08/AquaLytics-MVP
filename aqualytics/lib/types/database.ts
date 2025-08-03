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
          estilo_id: number
          nombre: string
        }
        Insert: {
          estilo_id?: number
          nombre: string
        }
        Update: {
          estilo_id?: number
          nombre?: string
        }
        Relationships: []
      }
      fases: {
        Row: {
          fase_id: number
          nombre: string
        }
        Insert: {
          fase_id?: number
          nombre: string
        }
        Update: {
          fase_id?: number
          nombre?: string
        }
        Relationships: []
      }
      metricas: {
        Row: {
          global: boolean | null
          metrica_id: number
          nombre: string
          tipo: string
        }
        Insert: {
          global?: boolean | null
          metrica_id?: number
          nombre: string
          tipo: string
        }
        Update: {
          global?: boolean | null
          metrica_id?: number
          nombre?: string
          tipo?: string
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
      pruebas: {
        Row: {
          curso: string
          distancia_id: number
          estilo_id: number
          id: number
          nombre: string
        }
        Insert: {
          curso: string
          distancia_id: number
          estilo_id: number
          id?: number
          nombre: string
        }
        Update: {
          curso?: string
          distancia_id?: number
          estilo_id?: number
          id?: number
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "pruebas_distancia_id_fkey"
            columns: ["distancia_id"]
            isOneToOne: false
            referencedRelation: "distancias"
            referencedColumns: ["distancia_id"]
          },
          {
            foreignKeyName: "pruebas_estilo_id_fkey"
            columns: ["estilo_id"]
            isOneToOne: false
            referencedRelation: "estilos"
            referencedColumns: ["estilo_id"]
          },
        ]
      }
      registros: {
        Row: {
          competencia_id: number | null
          created_at: string | null
          fase_id: number | null
          fecha: string
          id_nadador: number
          metrica_id: number
          prueba_id: number
          registro_id: number
          segmento: number | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          competencia_id?: number | null
          created_at?: string | null
          fase_id?: number | null
          fecha: string
          id_nadador: number
          metrica_id: number
          prueba_id: number
          registro_id?: number
          segmento?: number | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          competencia_id?: number | null
          created_at?: string | null
          fase_id?: number | null
          fecha?: string
          id_nadador?: number
          metrica_id?: number
          prueba_id?: number
          registro_id?: number
          segmento?: number | null
          updated_at?: string | null
          valor?: number
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
            foreignKeyName: "registros_metrica_id_fkey"
            columns: ["metrica_id"]
            isOneToOne: false
            referencedRelation: "metricas"
            referencedColumns: ["metrica_id"]
          },
          {
            foreignKeyName: "registros_prueba_id_fkey"
            columns: ["prueba_id"]
            isOneToOne: false
            referencedRelation: "pruebas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_completitud_porcentaje: {
        Args: {
          p_t15_1: number
          p_brz_1: number
          p_t25_1: number
          p_f1: number
          p_t15_2: number
          p_brz_2: number
          p_t25_2: number
          p_f2: number
          p_t_total: number
          p_brz_total: number
        }
        Returns: number
      }
      get_complete_test_record: {
        Args: { p_prueba_id: number; p_nadador_id: number; p_fecha: string }
        Returns: Json
      }
      schedule_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/**
 * Tipos derivados para el frontend
 */

// Define el tipo base para las tablas de la base de datos
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

// Tipos específicos para las entidades principales
export type Nadador = Tables<'nadadores'>
export type Competencia = Tables<'competencias'>
export type Prueba = Tables<'pruebas'>
export type Metrica = Tables<'metricas'>
export type Registro = Tables<'registros'>
export type Fase = Tables<'fases'>
export type Estilo = Tables<'estilos'>
export type Distancia = Tables<'distancias'>

// Tipo para el payload de una competencia con información adicional
export interface CompetitionWithDetails extends Competencia {
  total_swimmers: number
  total_races: number
  fastest_time: number | null
  average_time: number | null
}

// Tipo para el resumen de rendimiento de un nadador
export interface SwimmerPerformanceSummary {
  total_competitions: number
  total_races: number
  total_records: number
  last_competition_date: string | null
}

// Tipo para los filtros de datos
export interface DataFilters {
  swimmerId?: number
  competitionId?: number
  distance?: number
  stroke?: string
  startDate?: string
  endDate?: string
}

// Tipo para el resultado de la función `get_complete_test_record`
export type CompleteTestRecord = {
  prueba_id: number;
  nadador_id: number;
  fecha: string;
  manual_metrics: Record<string, number>;
  auto_metrics: Record<string, number>;
}

// Tipo para el resultado de la función `fn_get_rankings_data`
export interface RankingData {
  nadador_id: number
  nombre_nadador: string
  competencia_id: number
  nombre_competencia: string
  prueba_id: number
  nombre_prueba: string
  fecha: string
  tiempo_total: number
  velocidad_promedio: number
  ranking_competencia: number
  ranking_general: number
}

// Tipo para el resumen de una competencia
export interface CompetitionSummary {
  id: number
  name: string
  date: string
  totalSwimmers: number
  totalRaces: number
  fastestTime: number | null
  averageTime: number | null
  improvementRate: number
}

// Tipo para el resumen del equipo
export interface TeamSummary {
  totalSwimmers: number
  activeSwimmers: number
  totalCompetitions: number
  recordsInPeriod: number
  improvementRate: number
  averageTime: number | null
}

// Nuevo tipo para el payload de la API de competiciones
export type CompetitionDataPayload = {
  competencia_id: number;
  competencia: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  tiempo_promedio_general: number | null;
}
