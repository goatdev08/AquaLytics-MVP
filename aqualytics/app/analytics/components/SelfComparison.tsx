'use client'

/**
 * Comparación Personal - AquaLytics
 * Permite comparar el mismo nadador en diferentes fechas o fases de la misma prueba
 */

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ComparisonChart } from './ComparisonChart'

interface Swimmer {
  id_nadador: number
  nombre: string
}

interface Prueba {
  id: number
  nombre: string
  distancia: number
  estilo: string
}

interface HistoricalRecord {
  fecha: string
  fase: string
  metricas: {
    [key: string]: number
  }
}

interface SelfComparisonData {
  swimmer_id: number
  swimmer_name: string
  prueba_info: Prueba
  records: HistoricalRecord[]
}

export function SelfComparison() {
  const [swimmers, setSwimmers] = useState<Swimmer[]>([])
  const [pruebas, setPruebas] = useState<Prueba[]>([])
  const [selectedSwimmer, setSelectedSwimmer] = useState<number | null>(null)
  const [selectedPrueba, setSelectedPrueba] = useState<number | null>(null)
  const [comparisonData, setComparisonData] = useState<SelfComparisonData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar nadadores
  useEffect(() => {
    const fetchSwimmers = async () => {
      try {
        const response = await fetch('/api/swimmers')
        const result = await response.json()
        if (result.success) {
          setSwimmers(result.data || [])
        }
      } catch (err) {
        console.error('Error cargando nadadores:', err)
      }
    }
    fetchSwimmers()
  }, [])

  // Cargar pruebas cuando se selecciona un nadador
  useEffect(() => {
    if (!selectedSwimmer) return

    const fetchPruebasForSwimmer = async () => {
      try {
        const response = await fetch(`/api/swimmers/${selectedSwimmer}/pruebas`)
        const result = await response.json()
        if (result.success) {
          setPruebas(result.data || [])
        }
      } catch (err) {
        console.error('Error cargando pruebas del nadador:', err)
      }
    }
    fetchPruebasForSwimmer()
  }, [selectedSwimmer])

  // Cargar datos de comparación personal
  const loadSelfComparisonData = async () => {
    if (!selectedSwimmer || !selectedPrueba) return

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `/api/analytics/self-comparison?swimmer=${selectedSwimmer}&prueba=${selectedPrueba}`
      )
      const result = await response.json()
      
      if (result.success) {
        setComparisonData(result.data)
      } else {
        setError(result.error || 'Error cargando datos de comparación personal')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const canCompare = selectedSwimmer !== null && selectedPrueba !== null

  // Transformar datos para el gráfico
  const chartData = comparisonData?.records?.map(record => ({
    swimmer_id: comparisonData.swimmer_id,
    swimmer_name: comparisonData.swimmer_name,
    fecha: record.fecha,
    fase: record.fase,
    metricas: record.metricas
  })) || []

  return (
    <div className="space-y-6">
      {/* Configuración de Comparación Personal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selección de Nadador */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-phoenix-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Seleccionar Nadador
          </h3>
          
          <Select
            value={selectedSwimmer?.toString() || ''}
            onChange={(value: string) => {
              setSelectedSwimmer(Number(value))
              setSelectedPrueba(null) // Reset prueba selection
              setComparisonData(null) // Reset data
            }}
            placeholder="Selecciona un nadador..."
            options={[
              { value: '', label: 'Selecciona un nadador...' },
              ...swimmers.map((swimmer) => ({
                value: swimmer.id_nadador.toString(),
                label: swimmer.nombre
              }))
            ]}
            variant="phoenix"
            size="md"
            fullWidth
          />
          
          {selectedSwimmer && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-md">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                ✅ Nadador seleccionado: {swimmers.find(s => s.id_nadador === selectedSwimmer)?.nombre}
              </p>
            </div>
          )}
        </Card>

        {/* Selección de Prueba */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-phoenix-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Seleccionar Prueba
          </h3>
          
          <Select
            value={selectedPrueba?.toString() || ''}
            onChange={(value: string) => setSelectedPrueba(Number(value))}
            placeholder={!selectedSwimmer ? "Primero selecciona un nadador" : "Selecciona una prueba..."}
            options={[
              { value: '', label: !selectedSwimmer ? "Primero selecciona un nadador" : "Selecciona una prueba..." },
              ...pruebas.map((prueba) => ({
                value: prueba.id.toString(),
                label: prueba.nombre
              }))
            ]}
            variant="phoenix"
            size="md"
            fullWidth
            disabled={!selectedSwimmer}
          />
          
          {selectedPrueba && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-md">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✅ Prueba seleccionada: {pruebas.find(p => p.id === selectedPrueba)?.nombre}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Botón de Comparación */}
      <div className="flex justify-center">
        <Button
          onClick={loadSelfComparisonData}
          disabled={!canCompare || loading}
          variant="phoenix"
          size="lg"
          className="min-w-[200px]"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Cargando...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Analizar Progresión
            </>
          )}
        </Button>
      </div>

      {/* Errores */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </Card>
      )}

      {/* Información de datos disponibles */}
      {comparisonData && chartData.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-phoenix-red/5 to-phoenix-orange/5 border-phoenix-orange/30">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6 text-phoenix-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <div>
              <h4 className="font-semibold text-foreground">
                Análisis de Progresión: {comparisonData.swimmer_name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {chartData.length} registros encontrados para {comparisonData.prueba_info.nombre}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Gráfico de Comparación Personal */}
      {chartData.length > 0 && (
        <ComparisonChart data={chartData} chartType="bar" />
      )}

      {/* Análisis de Tendencias */}
      {comparisonData && chartData.length > 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
            Análisis de Tendencias
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estadísticas de mejora */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Evolución Temporal
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Primer registro:</span>
                  <span className="font-medium">{chartData[0]?.fecha} ({chartData[0]?.fase})</span>
                </div>
                <div className="flex justify-between">
                  <span>Último registro:</span>
                  <span className="font-medium">{chartData[chartData.length - 1]?.fecha} ({chartData[chartData.length - 1]?.fase})</span>
                </div>
                <div className="flex justify-between">
                  <span>Total de registros:</span>
                  <span className="font-medium">{chartData.length}</span>
                </div>
              </div>
            </div>

            {/* Recomendaciones */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Insights de Rendimiento
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• Compara registros de diferentes fechas</div>
                <div>• Identifica patrones de mejora</div>
                <div>• Analiza consistencia entre fases</div>
                <div>• Encuentra oportunidades de optimización</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
} 