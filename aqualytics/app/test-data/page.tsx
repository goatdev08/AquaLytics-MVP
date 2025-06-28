'use client'

import { useEffect, useState } from 'react'
import { getNadadores, getRegistrosCompletos, probarConexion, getParametros } from '@/lib/supabase'

export default function TestDataPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({})

  useEffect(() => {
    async function loadData() {
      try {
        console.log('🔍 Verificando conexión y datos...')
        
        // Probar conexión
        const conexion = await probarConexion()
        console.log('📡 Conexión:', conexion)
        
        // Obtener nadadores
        const nadadores = await getNadadores()
        console.log('🏊‍♂️ Nadadores:', nadadores)
        
        // Obtener parámetros/métricas disponibles
        const parametros = await getParametros()
        console.log('📏 Parámetros disponibles:', parametros)
        
        // Obtener total de registros (sin límite para contar)
        const registrosCompletos = await getRegistrosCompletos()
        console.log('📊 Total registros:', registrosCompletos?.length)
        
        // Obtener solo 3 registros como muestra
        const registrosMuestra = await getRegistrosCompletos({ limite: 3 })
        console.log('📊 Muestra registros:', registrosMuestra)
        
        setData({
          conexion,
          nadadores: nadadores || [],
          parametros: parametros || [],
          registros: registrosMuestra || [],
          totalNadadores: nadadores?.length || 0,
          totalParametros: parametros?.length || 0,
          totalRegistros: registrosCompletos?.length || 0,
          registrosReales: registrosCompletos?.length || 0
        })
        
      } catch (error) {
        console.error('❌ Error cargando datos:', error)
        setData({ error: error instanceof Error ? error.message : 'Error desconocido' })
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">🔍 Verificando Datos de Supabase...</h1>
        <div className="animate-pulse">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">📊 Estado de Datos en Supabase</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">📡 Conexión</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(data.conexion, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">🏊‍♂️ Nadadores ({data.totalNadadores || 0})</h2>
          <pre className="text-sm overflow-auto max-h-64">
            {JSON.stringify(data.nadadores?.slice(0, 3), null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">📏 Parámetros/Métricas ({data.totalParametros || 0})</h2>
          <pre className="text-sm overflow-auto max-h-64">
            {JSON.stringify(data.parametros, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">
            📊 Registros (Total: {data.totalRegistros || 0}, Mostrando: {Math.min(data.registros?.length || 0, 2)} ejemplos)
          </h2>
          <pre className="text-sm overflow-auto max-h-64">
            {JSON.stringify(data.registros?.slice(0, 2), null, 2)}
          </pre>
        </div>
        
        {data.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {data.error}
          </div>
        )}
      </div>
    </div>
  )
} 