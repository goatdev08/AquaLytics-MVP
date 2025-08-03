/**
 * Tipos de Datos de la Aplicación - AquaLytics
 *
 * Este archivo define tipos de datos limpios y reutilizables,
 * derivados de los tipos generados por Supabase en `database.ts`.
 * El objetivo es tener un único lugar de referencia para los modelos
 * de datos de la aplicación.
 */

import type { Database } from './database'

// ===== TIPOS DE TABLAS BASE =====
// Extraemos el tipo 'Row' de cada tabla para usarlo en la aplicación.

export type Nadador = Database['public']['Tables']['nadadores']['Row']
export type Competencia = Database['public']['Tables']['competencias']['Row']
export type Prueba = Database['public']['Tables']['pruebas']['Row']
export type Fase = Database['public']['Tables']['fases']['Row']
export type Estilo = Database['public']['Tables']['estilos']['Row']
export type Distancia = Database['public']['Tables']['distancias']['Row']
export type Metrica = Database['public']['Tables']['metricas']['Row']
export type Registro = Database['public']['Tables']['registros']['Row']
// export type RegistroCompleto = Database['public']['Tables']['registros_completos']['Row'] // Tabla eliminada

// ===== TIPOS DE INSERCIÓN Y ACTUALIZACIÓN =====
// Útiles para formularios y operaciones de API.

export type NuevoNadador = Database['public']['Tables']['nadadores']['Insert']
export type NuevaCompetencia = Database['public']['Tables']['competencias']['Insert']
export type NuevoRegistro = Database['public']['Tables']['registros']['Insert']

// ===== TIPOS DE VISTAS MATERIALIZADAS =====
// Definidos explícitamente ya que la generación de tipos de Supabase
// a veces no incluye vistas de forma predeterminada.

export type SwimmerPerformanceSummary = {
  id_nadador: number
  nombre: string | null
  total_competencias: number | null
  total_distancias: number | null
  total_estilos: number | null
  primera_competencia: string | null
  ultima_competencia: string | null
  total_registros: number | null
  tiempo_promedio: number | null
  velocidad_promedio: number | null
}

export type CompetitionStats = {
  competencia_id: number
  competencia: string | null
  total_nadadores: number | null
  total_pruebas: number | null
  total_registros: number | null
  fecha_inicio: string | null
  fecha_fin: string | null
  tiempo_promedio_general: number | null
}

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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const 