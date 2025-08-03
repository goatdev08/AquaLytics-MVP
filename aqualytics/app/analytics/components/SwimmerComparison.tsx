'use client'

/**
 * Comparación entre Nadadores - AquaLytics
 * Permite comparar 2-4 nadadores en la misma prueba con diferentes fechas/fases
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
  total_registros: number
}

interface Prueba {
  id: number
  nombre: string
  curso: string
  distancias: {
    distancia: number
  }
  estilos: {
    nombre: string
  }
}

interface Competencia {
  competencia_id: number
  competencia: string
}

interface Fase {
  fase_id: number
  nombre: string
}

interface SwimmerRecord {
  id_nadador: number
  nombre: string
  fecha: string
  fase_id: number
  fase_nombre: string
  total_registros: number
}

interface SelectedSwimmerRecord {
  swimmer_id: number
  swimmer_name: string
  fecha: string
  fase_id: number
  fase_nombre: string
}

interface ComparisonData {
  swimmer_id: number
  swimmer_name: string
  fecha: string
  fase: string
  competencia: string
  metricas: {
    [key: string]: number
  }
}

export function SwimmerComparison() {
  const [competencias, setCompetencias] = useState<Competencia[]>([])
  const [selectedCompetencia, setSelectedCompetencia] = useState<number | null>(null)
  const [availableSwimmers, setAvailableSwimmers] = useState<SwimmerRecord[]>([])
  const [selectedSwimmerRecords, setSelectedSwimmerRecords] = useState<SelectedSwimmerRecord[]>([])
  const [pruebas, setPruebas] = useState<Prueba[]>([])
  const [selectedPrueba, setSelectedPrueba] = useState<number | null>(null)
  const [selectedCurso, setSelectedCurso] = useState<'corto' | 'largo'>('largo')
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para controlar qué dropdown está abierto
  const [isPruebaSelectOpen, setIsPruebaSelectOpen] = useState(false)
  const [isCompetenciaSelectOpen, setIsCompetenciaSelectOpen] = useState(false)

  // Cargar competencias disponibles
  useEffect(() => {
    const fetchCompetencias = async () => {
      try {
        const response = await fetch('/api/competitions')
        const result = await response.json()
        if (result.success) {
          setCompetencias(result.data || [])
        }
      } catch (err) {
        console.error('Error cargando competencias:', err)
      }
    }
    fetchCompetencias()
  }, [])

  // Cargar pruebas disponibles filtradas por curso
  useEffect(() => {
    const fetchPruebas = async () => {
      try {
        const response = await fetch(`/api/pruebas?curso=${selectedCurso}`)
        const result = await response.json()
        if (result.success) {
          setPruebas(result.data || [])
          // Limpiar selección de prueba si cambia el curso
          setSelectedPrueba(null)
        }
      } catch (err) {
        console.error('Error cargando pruebas:', err)
      }
    }
    fetchPruebas()
  }, [selectedCurso])

  // Cargar nadadores disponibles cuando se selecciona una competencia Y una prueba
  useEffect(() => {
    const fetchAvailableSwimmers = async () => {
      if (!selectedCompetencia || !selectedPrueba) {
        setAvailableSwimmers([])
        return
      }
      
      try {
        const response = await fetch(`/api/swimmers?competencia=${selectedCompetencia}&prueba=${selectedPrueba}`)
        const result = await response.json()
        if (result.success) {
          setAvailableSwimmers(result.data || [])
        }
      } catch (err) {
        console.error('Error cargando nadadores disponibles:', err)
      }
    }
    fetchAvailableSwimmers()
    // Limpiar selecciones cuando cambia la prueba
    setSelectedSwimmerRecords([])
  }, [selectedCompetencia, selectedPrueba])

  // Cargar datos de comparación
  const loadComparisonData = async () => {
    if (selectedSwimmerRecords.length < 2 || !selectedPrueba || !selectedCompetencia) return

    setLoading(true)
    setError(null)
    
    try {
      const records = selectedSwimmerRecords.map(record => ({
        swimmer_id: record.swimmer_id,
        swimmer_name: record.swimmer_name,
        fecha: record.fecha,
        fase_id: record.fase_id,
        fase_nombre: record.fase_nombre
      }))
      
      const response = await fetch('/api/analytics/comparison', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records,
          prueba: selectedPrueba,
          competencia: selectedCompetencia
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setComparisonData(result.data)
      } else {
        setError(result.error || 'Error cargando datos de comparación')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSwimmerRecordSelect = (swimmerRecord: SwimmerRecord, fase_id: number, fecha: string) => {
    const newRecord: SelectedSwimmerRecord = {
      swimmer_id: swimmerRecord.id_nadador,
      swimmer_name: swimmerRecord.nombre,
      fecha: fecha,
      fase_id: fase_id,
      fase_nombre: swimmerRecord.fase_nombre
    }
    
    setSelectedSwimmerRecords(prev => {
      // Reemplazar si ya existe un registro para este nadador
      const filtered = prev.filter(record => record.swimmer_id !== swimmerRecord.id_nadador)
      return [...filtered, newRecord]
    })
  }

  const removeSwimmerRecord = (swimmerId: number) => {
    setSelectedSwimmerRecords(prev => prev.filter(record => record.swimmer_id !== swimmerId))
  }

  const canCompare = selectedSwimmerRecords.length >= 2 && selectedPrueba !== null && selectedCompetencia !== null

  // Manejadores para controlar los estados de los dropdowns
  const handleCompetenciaChange = (value: string) => {
    setSelectedCompetencia(Number(value) || null)
    setSelectedSwimmerRecords([])
    setAvailableSwimmers([]) // Limpiar nadadores cuando cambia competencia
    setIsCompetenciaSelectOpen(false)
  }

  const handlePruebaChange = (value: string) => {
    setSelectedPrueba(Number(value))
    setSelectedSwimmerRecords([]) // Limpiar nadadores seleccionados cuando cambia prueba
    setIsPruebaSelectOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Configuración Inicial - Competencia y Prueba */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paso 1: Selección de Competencia */}
        <div style={{ position: 'relative', zIndex: isPruebaSelectOpen ? 50 : 100 }}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-phoenix-orange/20 rounded-full flex items-center justify-center text-phoenix-orange font-bold text-sm">
                1
              </div>
              Seleccionar Competencia
            </h3>
            
            <div onClick={() => {
              // Cerrar el otro select si está abierto
              if (isPruebaSelectOpen) {
                setIsPruebaSelectOpen(false)
              }
            }}>
              <Select
                value={selectedCompetencia?.toString() || ''}
                onChange={handleCompetenciaChange}
                placeholder="Selecciona una competencia..."
                options={[
                  { value: '', label: 'Selecciona una competencia...' },
                  ...competencias.map((competencia) => ({
                    value: competencia.competencia_id.toString(),
                    label: competencia.competencia
                  }))
                ]}
                variant="phoenix"
                size="md"
                fullWidth
              />
            </div>
            
            {selectedCompetencia && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-md">
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {competencias.find(c => c.competencia_id === selectedCompetencia)?.competencia}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Paso 2: Selección de Prueba */}
        <div style={{ position: 'relative', zIndex: isCompetenciaSelectOpen ? 50 : 100 }}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                selectedCompetencia 
                  ? 'bg-phoenix-orange/20 text-phoenix-orange' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                2
              </div>
              Seleccionar Prueba
            </h3>
            
            {/* Toggle para filtrar por curso */}
            <div className="mb-4 p-3 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tipo de Curso:</span>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${selectedCurso === 'largo' ? 'font-semibold text-phoenix-orange' : 'text-muted-foreground'}`}>
                    Largo (50m)
                  </span>
                  <button
                    onClick={() => setSelectedCurso(selectedCurso === 'largo' ? 'corto' : 'largo')}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-phoenix-orange focus:ring-offset-2 ${
                      selectedCurso === 'corto' ? 'bg-phoenix-orange' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                        selectedCurso === 'corto' ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-sm ${selectedCurso === 'corto' ? 'font-semibold text-phoenix-orange' : 'text-muted-foreground'}`}>
                    Corto (25m)
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedCurso === 'largo' ? 'Mostrando pruebas de piscina olímpica (50m)' : 'Mostrando pruebas de piscina corta (25m)'}
              </p>
            </div>
            
            <div onClick={() => {
              // Cerrar el otro select si está abierto
              if (isCompetenciaSelectOpen) {
                setIsCompetenciaSelectOpen(false)
              }
            }}>
              <Select
                value={selectedPrueba?.toString() || ''}
                onChange={handlePruebaChange}
                placeholder="Selecciona una prueba..."
                options={[
                  { value: '', label: 'Selecciona una prueba...' },
                  ...pruebas.map((prueba) => ({
                    value: prueba.id.toString(),
                    label: `${prueba.distancias?.distancia}m ${prueba.estilos?.nombre}`
                  }))
                ]}
                variant="phoenix"
                size="md"
                fullWidth
              />
            </div>
            
            {selectedPrueba && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-md">
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {pruebas.find(p => p.id === selectedPrueba)?.nombre} ({selectedCurso})
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Paso 3: Selección de Nadadores */}
      {selectedCompetencia && selectedPrueba && (
        <div style={{ position: 'relative', zIndex: 5 }}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                selectedPrueba 
                  ? 'bg-phoenix-orange/20 text-phoenix-orange' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                3
              </div>
              Seleccionar Nadadores
              <span className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                {selectedSwimmerRecords.length}/4
              </span>
            </h3>
            
            {availableSwimmers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableSwimmers.map((swimmer) => (
                  <div key={swimmer.id_nadador} className="border rounded-lg p-4 hover:border-phoenix-orange/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-lg">{swimmer.nombre}</div>
                      <div className="text-sm text-muted-foreground">
                        {swimmer.total_registros} registros
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Select
                        value={selectedSwimmerRecords.find(r => r.swimmer_id === swimmer.id_nadador)?.fecha || ''}
                        onChange={(value: string) => {
                          if (value) {
                            handleSwimmerRecordSelect(swimmer, swimmer.fase_id, value)
                          } else {
                            removeSwimmerRecord(swimmer.id_nadador)
                          }
                        }}
                        placeholder="Seleccionar fecha..."
                        options={[
                          { value: '', label: 'Seleccionar fecha...' },
                          { value: swimmer.fecha, label: `${swimmer.fecha} - ${swimmer.fase_nombre}` }
                        ]}
                        variant="phoenix"
                        size="sm"
                        fullWidth
                      />
                      
                      {selectedSwimmerRecords.find(r => r.swimmer_id === swimmer.id_nadador) && (
                        <Button
                          onClick={() => removeSwimmerRecord(swimmer.id_nadador)}
                          variant="outline"
                          size="sm"
                          className="w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
                          ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">No hay nadadores disponibles</p>
                  <p className="text-sm">No se encontraron nadadores que tengan registros en esta prueba específica</p>
                </div>
              )}
          </Card>
        </div>
      )}

      {/* Estado y Botón de Comparación */}
      <div className="flex flex-col items-center space-y-3">
        {/* Indicadores de progreso */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-sm">
          <div className={`flex items-center gap-1.5 ${selectedCompetencia ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Competencia</span>
          </div>
          <div className={`flex items-center gap-1.5 ${selectedPrueba ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Prueba</span>
          </div>
          <div className={`flex items-center gap-1.5 ${selectedSwimmerRecords.length >= 2 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{selectedSwimmerRecords.length}/2+ Nadadores</span>
          </div>
        </div>

        {/* Botón de comparación */}
        <Button
          onClick={loadComparisonData}
          disabled={!canCompare || loading}
          variant="phoenix"
          size="md"
          className="px-8 py-3 text-base font-semibold"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span>Generando comparación...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012-2z" />
              </svg>
              <span>Generar Comparación</span>
            </div>
          )}
        </Button>

        {/* Ayuda contextual para el usuario */}
        {!selectedCompetencia ? (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg max-w-md">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-sm">
              <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Comienza seleccionando una competencia</span>
            </div>
          </div>
        ) : !selectedPrueba ? (
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg max-w-md">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 text-sm">
              <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Selecciona una prueba para ver los nadadores disponibles</span>
            </div>
          </div>
        ) : selectedSwimmerRecords.length < 2 ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg max-w-md">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
              <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Selecciona al menos 2 nadadores para comparar sus rendimientos</span>
            </div>
          </div>
        ) : selectedSwimmerRecords.length >= 2 && canCompare && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg max-w-md">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
              <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>¡Perfecto! Todo listo para generar la comparación entre {selectedSwimmerRecords.length} nadadores</span>
            </div>
          </div>
        )}
      </div>

      {/* Errores */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/50 dark:border-red-800">
          <div className="flex items-start gap-3 text-red-800 dark:text-red-400">
            <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium mb-1">Error en la comparación</h4>
              <p className="text-sm opacity-90">{error}</p>
              <p className="text-xs mt-2 opacity-75">
                💡 Intenta seleccionar diferentes nadadores o verifica que la prueba tenga datos suficientes.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Gráfico de Comparación */}
      {loading && canCompare && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <LoadingSpinner size="lg" />
            <h3 className="text-lg font-medium text-muted-foreground mt-4 mb-2">
              Generando comparación...
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Estamos procesando los datos de los nadadores seleccionados para crear el análisis comparativo.
            </p>
          </div>
        </Card>
      )}
      
      {!loading && comparisonData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
              Análisis Comparativo
            </h2>
            <div className="text-sm text-muted-foreground">
              {comparisonData.length} nadadores • {Object.keys(comparisonData[0]?.metricas || {}).length} métricas
            </div>
          </div>
          <ComparisonChart data={comparisonData} />
        </div>
      )}
    </div>
  )
}