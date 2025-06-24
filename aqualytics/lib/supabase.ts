import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/database'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Frontend client - uses anonymous key for client-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Backend client - uses service role key for server-side operations
// This will only work on the server side (API routes, server components)
export const createSupabaseAdmin = () => {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Typed clients
export const supabaseTyped = supabase
export const getSupabaseAdminTyped = createSupabaseAdmin

// ===== FUNCIONES HELPER BÁSICAS =====

/**
 * Obtiene todos los nadadores
 */
export async function getNadadores() {
  const { data, error } = await supabase
    .from('nadadores')
    .select('*')
    .order('nombre')
  
  if (error) throw error
  return data
}

/**
 * Obtiene un nadador por ID
 */
export async function getNadador(id: number) {
  const { data, error } = await supabase
    .from('nadadores')
    .select('*')
    .eq('id_nadador', id)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Obtiene todas las competencias
 */
export async function getCompetencias() {
  const { data, error } = await supabase
    .from('competencias')
    .select('*')
    .order('competencia')
  
  if (error) throw error
  return data
}

/**
 * Obtiene todas las distancias
 */
export async function getDistancias() {
  const { data, error } = await supabase
    .from('distancias')
    .select('*')
    .order('distancia')
  
  if (error) throw error
  return data
}

/**
 * Obtiene todos los estilos
 */
export async function getEstilos() {
  const { data, error } = await supabase
    .from('estilos')
    .select('*')
    .order('estilo')
  
  if (error) throw error
  return data
}

/**
 * Obtiene todas las fases
 */
export async function getFases() {
  const { data, error } = await supabase
    .from('fases')
    .select('*')
    .order('fase')
  
  if (error) throw error
  return data
}

/**
 * Obtiene todos los parámetros
 */
export async function getParametros() {
  const { data, error } = await supabase
    .from('parametros')
    .select('*')
    .order('parametro_id')
  
  if (error) throw error
  return data
}

/**
 * Obtiene parámetros por tipo
 */
export async function getParametrosPorTipo(tipo: 'M' | 'A') {
  const { data, error } = await supabase
    .from('parametros')
    .select('*')
    .eq('tipo', tipo)
    .order('parametro_id')
  
  if (error) throw error
  return data
}

/**
 * Obtiene registros completos con filtros
 */
export async function getRegistrosCompletos(filtros?: {
  nadador_id?: number
  competencia_id?: number
  distancia_id?: number
  estilo_id?: number
  fase_id?: number
  fecha_desde?: string
  fecha_hasta?: string
  limite?: number
}) {
  let query = supabase
    .from('registros')
    .select(`
      *,
      nadador:nadadores!inner(id_nadador, nombre),
      competencia:competencias!inner(competencia_id, competencia),
      distancia:distancias!inner(distancia_id, distancia),
      estilo:estilos!inner(estilo_id, estilo),
      fase:fases!inner(fase_id, fase),
      parametro:parametros!inner(parametro_id, parametro, tipo)
    `)
    .order('fecha', { ascending: false })
  
  // Aplicar filtros si existen
  if (filtros?.nadador_id) {
    query = query.eq('id_nadador', filtros.nadador_id)
  }
  if (filtros?.competencia_id) {
    query = query.eq('competencia_id', filtros.competencia_id)
  }
  if (filtros?.distancia_id) {
    query = query.eq('distancia_id', filtros.distancia_id)
  }
  if (filtros?.estilo_id) {
    query = query.eq('estilo_id', filtros.estilo_id)
  }
  if (filtros?.fase_id) {
    query = query.eq('fase_id', filtros.fase_id)
  }
  if (filtros?.fecha_desde) {
    query = query.gte('fecha', filtros.fecha_desde)
  }
  if (filtros?.fecha_hasta) {
    query = query.lte('fecha', filtros.fecha_hasta)
  }
  if (filtros?.limite) {
    query = query.limit(filtros.limite)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

/**
 * Crea un nuevo registro
 */
export async function crearRegistro(registro: {
  competencia_id?: number
  fecha?: string
  id_nadador?: number
  distancia_id?: number
  estilo_id?: number
  fase_id?: number
  parametro_id?: number
  segmento?: number
  valor?: number
}) {
  const { data, error } = await supabase
    .from('registros')
    .insert(registro)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Crea registros en lote
 */
export async function crearRegistrosLote(registros: Array<{
  competencia_id?: number
  fecha?: string
  id_nadador?: number
  distancia_id?: number
  estilo_id?: number
  fase_id?: number
  parametro_id?: number
  segmento?: number
  valor?: number
}>) {
  const { data, error } = await supabase
    .from('registros')
    .insert(registros)
    .select()
  
  if (error) throw error
  return data
}

/**
 * Actualiza un registro existente
 */
export async function actualizarRegistro(
  registroId: number,
  actualizacion: {
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
) {
  const { data, error } = await supabase
    .from('registros')
    .update(actualizacion)
    .eq('registro_id', registroId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Elimina un registro
 */
export async function eliminarRegistro(registroId: number) {
  const { error } = await supabase
    .from('registros')
    .delete()
    .eq('registro_id', registroId)
  
  if (error) throw error
  return { success: true }
}

/**
 * Prueba la conexión con la base de datos
 */
export async function probarConexion() {
  try {
    const { data, error } = await supabase
      .from('nadadores')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
} 