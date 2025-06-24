import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Frontend client - uses anonymous key for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Backend client - uses service role key for server-side operations
// This will only work on the server side (API routes, server components)
export const createSupabaseAdmin = () => {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types for type safety
export type Database = {
  public: {
    Tables: {
      nadadores: {
        Row: {
          id_nadador: number
          nombre: string
          edad?: number
          peso?: number
        }
        Insert: {
          id_nadador?: number
          nombre: string
          edad?: number
          peso?: number
        }
        Update: {
          id_nadador?: number
          nombre?: string
          edad?: number
          peso?: number
        }
      }
      competencias: {
        Row: {
          competencia_id: number
          competencia: string
          periodo: string
        }
        Insert: {
          competencia_id?: number
          competencia: string
          periodo: string
        }
        Update: {
          competencia_id?: number
          competencia?: string
          periodo?: string
        }
      }
      distancias: {
        Row: {
          distancia_id: number
          distancia: number
        }
        Insert: {
          distancia_id?: number
          distancia: number
        }
        Update: {
          distancia_id?: number
          distancia?: number
        }
      }
      estilos: {
        Row: {
          estilo_id: number
          estilo: string
        }
        Insert: {
          estilo_id?: number
          estilo: string
        }
        Update: {
          estilo_id?: number
          estilo?: string
        }
      }
      fases: {
        Row: {
          fase_id: number
          fase: string
        }
        Insert: {
          fase_id?: number
          fase: string
        }
        Update: {
          fase_id?: number
          fase?: string
        }
      }
      parametros: {
        Row: {
          parametro_id: number
          parametro: string
          tipo: string
          global: boolean
        }
        Insert: {
          parametro_id?: number
          parametro: string
          tipo: string
          global: boolean
        }
        Update: {
          parametro_id?: number
          parametro?: string
          tipo?: string
          global?: boolean
        }
      }
      registros: {
        Row: {
          registro_id: number
          competencia_id: number
          fecha: string
          id_nadador: number
          distancia_id: number
          estilo_id: number
          fase_id: number
          parametro_id: number
          segmento?: number
          valor: number
        }
        Insert: {
          registro_id?: number
          competencia_id: number
          fecha: string
          id_nadador: number
          distancia_id: number
          estilo_id: number
          fase_id: number
          parametro_id: number
          segmento?: number
          valor: number
        }
        Update: {
          registro_id?: number
          competencia_id?: number
          fecha?: string
          id_nadador?: number
          distancia_id?: number
          estilo_id?: number
          fase_id?: number
          parametro_id?: number
          segmento?: number
          valor?: number
        }
      }
    }
  }
}

// Typed clients
export const supabaseTyped = supabase as ReturnType<typeof createClient<Database>>

// Helper function to get typed admin client (server-side only)
export const getSupabaseAdminTyped = () => {
  return createSupabaseAdmin() as ReturnType<typeof createClient<Database>>
} 