'use client'

import React, { useState, useMemo } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { phoenixColors } from '@/lib/utils/chart-configs'

interface MetricScore {
  metric: string
  value: number
  displayName?: string
  unit?: string
}

interface SwimmerRanking {
  id: string
  nombre: string
  prueba?: string
  fecha?: string
  scores: MetricScore[]
  overallScore?: number
}

interface RankingTableProps {
  title: string
  swimmers: SwimmerRanking[]
  primaryMetric?: string
  showOverallScore?: boolean
  showFilters?: boolean
  highlightTop?: number
  className?: string
}

type SortField = 'nombre' | 'prueba' | 'fecha' | 'overall' | string
type SortDirection = 'asc' | 'desc'

export default function RankingTable({
  title,
  swimmers,
  primaryMetric,
  showOverallScore = true,
  showFilters = true,
  highlightTop = 3,
  className = ''
}: RankingTableProps) {
  const [sortField, setSortField] = useState<SortField>('overall')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filter, setFilter] = useState('')
  const [selectedPrueba, setSelectedPrueba] = useState<string>('all')

  // Obtener todas las métricas disponibles
  const allMetrics = useMemo(() => {
    const metrics = new Set<string>()
    swimmers.forEach(swimmer => {
      swimmer.scores.forEach(score => metrics.add(score.metric))
    })
    return Array.from(metrics)
  }, [swimmers])

  // Obtener todas las pruebas únicas
  const allPruebas = useMemo(() => {
    const pruebas = new Set<string>()
    swimmers.forEach(swimmer => {
      if (swimmer.prueba) pruebas.add(swimmer.prueba)
    })
    return Array.from(pruebas).sort()
  }, [swimmers])

  // Calcular puntuación general si no está proporcionada
  const swimmersWithScores = useMemo(() => {
    return swimmers.map(swimmer => ({
      ...swimmer,
      overallScore: swimmer.overallScore ?? 
        swimmer.scores.reduce((sum, score) => sum + score.value, 0) / swimmer.scores.length
    }))
  }, [swimmers])

  // Filtrar nadadores
  const filteredSwimmers = useMemo(() => {
    return swimmersWithScores.filter(swimmer => {
      const matchesName = swimmer.nombre.toLowerCase().includes(filter.toLowerCase())
      const matchesPrueba = selectedPrueba === 'all' || swimmer.prueba === selectedPrueba
      return matchesName && matchesPrueba
    })
  }, [swimmersWithScores, filter, selectedPrueba])

  // Ordenar nadadores
  const sortedSwimmers = useMemo(() => {
    return [...filteredSwimmers].sort((a, b) => {
      let aValue: any, bValue: any

      if (sortField === 'nombre') {
        aValue = a.nombre
        bValue = b.nombre
      } else if (sortField === 'prueba') {
        aValue = a.prueba || ''
        bValue = b.prueba || ''
      } else if (sortField === 'fecha') {
        aValue = a.fecha || ''
        bValue = b.fecha || ''
      } else if (sortField === 'overall') {
        aValue = a.overallScore || 0
        bValue = b.overallScore || 0
      } else {
        // Es una métrica específica
        const aScore = a.scores.find(s => s.metric === sortField)
        const bScore = b.scores.find(s => s.metric === sortField)
        aValue = aScore?.value || 0
        bValue = bScore?.value || 0
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    })
  }, [filteredSwimmers, sortField, sortDirection])

  // Función para cambiar ordenamiento
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection(field === 'nombre' || field === 'prueba' ? 'asc' : 'desc')
    }
  }

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = ['Posición', 'Nombre', 'Prueba', 'Fecha']
    allMetrics.forEach(metric => {
      const firstScore = swimmers[0]?.scores.find(s => s.metric === metric)
      headers.push(firstScore?.displayName || metric)
    })
    if (showOverallScore) headers.push('Puntuación General')

    const rows = sortedSwimmers.map((swimmer, index) => {
      const row = [
        index + 1,
        swimmer.nombre,
        swimmer.prueba || '',
        swimmer.fecha || ''
      ]
      
      allMetrics.forEach(metric => {
        const score = swimmer.scores.find(s => s.metric === metric)
        row.push(score ? score.value.toFixed(2) : '0')
      })
      
      if (showOverallScore) {
        row.push(swimmer.overallScore?.toFixed(2) || '0')
      }
      
      return row
    })

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ranking-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  // Componente de icono de ordenamiento
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" />
    }
    return sortDirection === 'desc' 
      ? <ChevronDownIcon className="w-4 h-4" />
      : <ChevronUpIcon className="w-4 h-4" />
  }

  // Función para obtener color de medalla
  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    return ''
  }

  // Función para obtener color de resaltado
  const getHighlightClass = (position: number) => {
    if (position <= highlightTop) {
      if (position === 1) return 'bg-yellow-50 dark:bg-yellow-900/20'
      if (position === 2) return 'bg-gray-50 dark:bg-gray-800/20'
      if (position === 3) return 'bg-orange-50 dark:bg-orange-900/20'
    }
    return ''
  }

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          className="text-xs"
        >
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Buscar nadador..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          
          {allPruebas.length > 0 && (
            <select
              value={selectedPrueba}
              onChange={(e) => setSelectedPrueba(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todas las pruebas</option>
              {allPruebas.map(prueba => (
                <option key={prueba} value={prueba}>{prueba}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                #
              </th>
              <th 
                className="text-left p-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => handleSort('nombre')}
              >
                <div className="flex items-center gap-1">
                  Nadador
                  <SortIcon field="nombre" />
                </div>
              </th>
              
              {allPruebas.length > 0 && (
                <th 
                  className="text-left p-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('prueba')}
                >
                  <div className="flex items-center gap-1">
                    Prueba
                    <SortIcon field="prueba" />
                  </div>
                </th>
              )}
              
              {/* Columnas de métricas */}
              {allMetrics.map(metric => {
                const firstScore = swimmers[0]?.scores.find(s => s.metric === metric)
                const displayName = firstScore?.displayName || metric
                const isPrimary = metric === primaryMetric
                
                return (
                  <th 
                    key={metric}
                    className={`text-right p-2 text-sm font-medium cursor-pointer hover:text-foreground ${
                      isPrimary ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    onClick={() => handleSort(metric)}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {displayName}
                      <SortIcon field={metric} />
                    </div>
                  </th>
                )
              })}
              
              {showOverallScore && (
                <th 
                  className="text-right p-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('overall')}
                >
                  <div className="flex items-center justify-end gap-1">
                    General
                    <SortIcon field="overall" />
                  </div>
                </th>
              )}
            </tr>
          </thead>
          
          <tbody>
            {sortedSwimmers.map((swimmer, index) => {
              const position = index + 1
              const medal = getMedalEmoji(position)
              const highlightClass = getHighlightClass(position)
              
              return (
                <tr 
                  key={swimmer.id}
                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${highlightClass}`}
                >
                  <td className="p-2 text-sm font-medium">
                    <div className="flex items-center gap-1">
                      {position}
                      {medal && <span>{medal}</span>}
                    </div>
                  </td>
                  
                  <td className="p-2 text-sm font-medium">
                    {swimmer.nombre}
                  </td>
                  
                  {allPruebas.length > 0 && (
                    <td className="p-2 text-sm text-muted-foreground">
                      {swimmer.prueba || '-'}
                    </td>
                  )}
                  
                  {/* Valores de métricas */}
                  {allMetrics.map(metric => {
                    const score = swimmer.scores.find(s => s.metric === metric)
                    const isPrimary = metric === primaryMetric
                    
                    return (
                      <td 
                        key={metric}
                        className={`p-2 text-sm text-right ${
                          isPrimary ? 'font-semibold text-primary' : ''
                        }`}
                      >
                        {score ? (
                          <>
                            {score.value.toFixed(2)}
                            {score.unit && (
                              <span className="text-xs text-muted-foreground ml-1">
                                {score.unit}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    )
                  })}
                  
                  {showOverallScore && (
                    <td className="p-2 text-sm text-right font-semibold">
                      {swimmer.overallScore?.toFixed(2) || '-'}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {/* Resumen */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {sortedSwimmers.length} de {swimmers.length} nadadores
        </span>
        {sortField !== 'nombre' && sortField !== 'prueba' && (
          <span>
            Ordenado por: {sortField === 'overall' ? 'Puntuación General' : sortField} 
            {' '}({sortDirection === 'desc' ? 'Mayor a menor' : 'Menor a mayor'})
          </span>
        )}
      </div>
    </Card>
  )
} 