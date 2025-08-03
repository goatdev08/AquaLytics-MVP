'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { useSwimmerDetail } from '@/lib/hooks/useSwimmerDetail'
import TimeRangeSelector from '@/components/ui/TimeRangeSelector'
// import { TimeRange } from '@/lib/hooks/useTeamOverview' // Imported but not used, removing
import { useCompleteTest } from '@/lib/hooks/useCompleteTest'

export default function SwimmerDetailPage() {
  const params = useParams()
  const swimmerId = params.id as string
  
  const {
    swimmerInfo,
    personalBests,
    progressionData,
    teamComparisons,
    loading,
    error,
    filters,
    setFilters,
    availableEstilos,
    availableDistancias,
    refreshData
  } = useSwimmerDetail(swimmerId)

  const {
    data: completeTestData,
    isLoading: isLoadingCompleteTest,
    error: completeTestError,
    fetchTest
  } = useCompleteTest()

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-8 p-8">
          {/* Header skeleton */}
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gradient-to-r from-muted to-muted/50 rounded-lg mb-4"></div>
            <div className="h-4 w-96 bg-muted rounded mb-2"></div>
            <div className="h-4 w-48 bg-muted rounded"></div>
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl animate-pulse"></div>
            ))}
          </div>
          
          {/* Chart skeleton */}
          <div className="h-96 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl animate-pulse"></div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center animate-bounce">
              <span className="text-5xl">⚠️</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-destructive">Error al cargar perfil</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={refreshData}
                className="phoenix-button inline-flex items-center gap-2"
              >
                <span>🔄</span>
                <span>Intentar de nuevo</span>
              </button>
              <Link href="/swimmers" className="phoenix-button-secondary">
                Volver a nadadores
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!swimmerInfo) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="text-6xl mb-4 block">🏊‍♂️</span>
            <h3 className="text-2xl font-bold mb-3">Nadador no encontrado</h3>
            <Link href="/swimmers" className="phoenix-button">
              Volver a nadadores
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Agrupar mejores marcas por estilo
  const bestsByStyle = personalBests.reduce((acc, best) => {
    if (!acc[best.estilo]) acc[best.estilo] = []
    acc[best.estilo].push(best)
    return acc
  }, {} as Record<string, typeof personalBests>)

  return (
    <MainLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-start justify-between animate-in slide-in-from-top duration-500">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link 
                href="/swimmers" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Volver
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">Perfil de nadador</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
              {swimmerInfo.nombre}
            </h1>
            <p className="text-muted-foreground mt-2">
              ID: #{swimmerInfo.id_nadador} • Miembro activo del equipo
            </p>
          </div>
          
          <div className="flex gap-3">
            <button className="phoenix-button-secondary inline-flex items-center gap-2">
              <span>📊</span>
              <span>Exportar reporte</span>
            </button>
            <button 
              disabled
              className="phoenix-button-secondary inline-flex items-center gap-2 opacity-50 cursor-not-allowed"
              title="Función de comparación en desarrollo"
            >
              <span>⚡</span>
              <span>Comparar</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group phoenix-card relative overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-in slide-in-from-bottom duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-5xl">🏊‍♂️</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">{personalBests.length}</div>
                  <div className="text-xs text-muted-foreground">Mejores marcas</div>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">Registros Totales</h3>
              <p className="text-sm text-muted-foreground">En {availableEstilos.length} estilos</p>
            </div>
          </div>

          <div className="group phoenix-card relative overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-in slide-in-from-bottom duration-500 delay-100">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-5xl">📈</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {teamComparisons.filter(c => c.percentDiff > 0).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Métricas destacadas</div>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">Sobre el promedio</h3>
              <p className="text-sm text-muted-foreground">vs equipo completo</p>
            </div>
          </div>

          <div className="group phoenix-card relative overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-in slide-in-from-bottom duration-500 delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-5xl">🎯</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">{Object.keys(bestsByStyle).length}</div>
                  <div className="text-xs text-muted-foreground">Estilos activos</div>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">Versatilidad</h3>
              <p className="text-sm text-muted-foreground">Múltiples especialidades</p>
            </div>
          </div>

          <div className="group phoenix-card relative overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-in slide-in-from-bottom duration-500 delay-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-5xl">⏱️</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">{progressionData.length}</div>
                  <div className="text-xs text-muted-foreground">Registros recientes</div>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">Actividad</h3>
              <p className="text-sm text-muted-foreground">En {filters.periodo}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 animate-in slide-in-from-left duration-500 delay-400">
          <TimeRangeSelector 
            value={filters.periodo} 
            onChange={(periodo) => setFilters({ periodo })}
          />
          
          <select
            value={filters.estilo || ''}
            onChange={(e) => setFilters({ estilo: e.target.value || null })}
            className="px-4 py-2 border rounded-xl bg-background hover:border-phoenix-red/30 focus:border-phoenix-red focus:ring-2 focus:ring-phoenix-red/20 transition-all duration-300"
          >
            <option value="">Todos los estilos</option>
            {availableEstilos.map(estilo => (
              <option key={estilo} value={estilo}>{estilo}</option>
            ))}
          </select>
          
          <select
            value={filters.distancia || ''}
            onChange={(e) => setFilters({ distancia: e.target.value ? Number(e.target.value) : null })}
            className="px-4 py-2 border rounded-xl bg-background hover:border-phoenix-red/30 focus:border-phoenix-red focus:ring-2 focus:ring-phoenix-red/20 transition-all duration-300"
          >
            <option value="">Todas las distancias</option>
            {availableDistancias.map(dist => (
              <option key={dist} value={dist}>{dist}m</option>
            ))}
          </select>
        </div>

        {/* Progress Chart */}
        {progressionData.length > 0 && (
          <div className="phoenix-card bg-gradient-to-br from-card to-card/80 animate-in slide-in-from-bottom duration-500 delay-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Progresión Temporal</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-phoenix-red animate-pulse"></div>
                <span>Datos en vivo</span>
              </div>
            </div>
            
            {/* TODO: Implementar ProgressChart con estructura correcta */}
            <div className="h-80 flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl">
              <div className="text-center">
                <span className="text-6xl">📈</span>
                <p className="text-sm text-muted-foreground mt-4">
                  {progressionData.length} puntos de datos disponibles
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Personal Bests */}
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500 delay-600">
          <h2 className="text-2xl font-bold">Mejores Marcas Personales</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(bestsByStyle).map(([estilo, bests]) => (
              <div key={estilo} className="phoenix-card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏊</span>
                  {estilo}
                </h3>
                
                <div className="space-y-3">
                  {bests.sort((a, b) => a.distancia - b.distancia).map((best, idx) => (
                    <div 
                      key={`${best.distancia}-${best.metrica}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium">{best.distancia}m</div>
                        <div className="text-sm text-muted-foreground">{best.metrica}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {best.valor.toFixed(2)} {best.unit}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(best.fecha).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Complete Tests (MEJORADO) */}
        <div className="phoenix-card bg-gradient-to-br from-card to-card/80 animate-in slide-in-from-bottom duration-500 delay-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Registros de Pruebas Completas</h2>
            <div className="text-sm text-muted-foreground">
              Total: {progressionData.length} registros
            </div>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {progressionData.map(record => (
              <div key={`${record.fecha}-${record.prueba_id}`} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold">{record.prueba_nombre}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        record.curso === 'corto' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {record.curso === 'corto' ? 'CC' : 'CL'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      📅 {new Date(record.fecha).toLocaleDateString()} • 
                      📊 {record.metricas_registradas} métricas registradas • 
                      🏊‍♂️ {record.distancia}m {record.estilo}
                    </p>
                  </div>
                  <button
                    onClick={() => fetchTest(record.prueba_id, parseInt(swimmerId, 10), record.fecha)}
                    className="phoenix-button-secondary text-sm"
                    disabled={isLoadingCompleteTest}
                  >
                    {isLoadingCompleteTest ? 'Cargando...' : 'Ver Detalles'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {progressionData.length === 0 && (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📊</span>
              <p className="text-muted-foreground">No hay registros de pruebas completas en el período seleccionado</p>
            </div>
          )}
        </div>

        {/* Modal or Section to display completeTestData */}
        {isLoadingCompleteTest && (
          <div className="mt-6 text-center">
            <p>Cargando detalles de la prueba...</p>
          </div>
        )}
        {completeTestError && (
          <div className="mt-6 text-center text-red-500">
            <p>Error: {completeTestError.message}</p>
          </div>
        )}
        {completeTestData && (
          <div className="mt-6 phoenix-card">
            <h3 className="text-xl font-bold mb-4">Detalles de la Prueba: {new Date(completeTestData.fecha).toLocaleDateString()}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  📝 Métricas Manuales
                </h4>
                
                {/* Métricas Totales */}
                <div className="mb-6">
                  <h5 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wide">📊 Totales</h5>
                  <div className="space-y-2">
                    {Object.entries(completeTestData.manual_metrics)
                      .filter(([key]) => key.includes('total'))
                      .map(([key, value]) => {
                        const numValue = Number(value);
                        const isTimeMetric = key.toLowerCase().includes('tiempo');
                        const isBrazadaMetric = key.toLowerCase().includes('brazada');
                        
                        let formattedValue = numValue.toFixed(2);
                        let unit = '';
                        let displayName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        
                        if (isTimeMetric) {
                          formattedValue = numValue >= 60 
                            ? `${numValue.toFixed(2)}s (${Math.floor(numValue / 60)}:${(numValue % 60).toFixed(2).padStart(5, '0')})`
                            : `${numValue.toFixed(2)}s`;
                        } else if (isBrazadaMetric) {
                          formattedValue = Math.round(numValue).toString();
                          unit = ' brazadas';
                        }
                        
                        return (
                          <div key={key} className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded border border-green-200 dark:border-green-700">
                            <span className="font-medium text-green-800 dark:text-green-200">{displayName}:</span>
                            <span className="text-green-900 dark:text-green-100 font-mono font-bold">{formattedValue}{unit}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Métricas por Tramo */}
                {(() => {
                  // Agrupar métricas por tramo
                  const segmentMetrics: Record<string, Record<string, number>> = {};
                  Object.entries(completeTestData.manual_metrics).forEach(([key, value]) => {
                    const match = key.match(/^(.+)_(\d+)$/);
                    if (match) {
                      const [, metricName, segmentNum] = match;
                      if (!segmentMetrics[segmentNum]) segmentMetrics[segmentNum] = {};
                      segmentMetrics[segmentNum][metricName] = Number(value);
                    }
                  });

                  return Object.entries(segmentMetrics).map(([segmentNum, metrics]) => (
                    <div key={segmentNum} className="mb-4">
                      <h5 className="font-medium text-sm text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
                        🏊‍♂️ Tramo {segmentNum}
                      </h5>
                      <div className="space-y-2 pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                        {Object.entries(metrics).map(([metricName, value]) => {
                          const isTimeMetric = metricName.toLowerCase().includes('tiempo');
                          const isBrazadaMetric = metricName.toLowerCase().includes('brazada');
                          const isFlechaMetric = metricName.toLowerCase().includes('flecha');
                          
                          let formattedValue = value.toFixed(2);
                          let unit = '';
                          let displayName = metricName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          
                          // Mapear nombres específicos
                          const nameMap: Record<string, string> = {
                            'tiempo_por_tramo': 'Tiempo Total del Tramo',
                            'tiempo_15m': 'Tiempo primeros 15m',
                            'tiempo_25m': 'Tiempo primeros 25m', 
                            'brazadas_por_tramo': 'Brazadas',
                            'flecha_por_tramo': 'Distancia de Flecha'
                          };
                          displayName = nameMap[metricName] || displayName;
                          
                          if (isTimeMetric) {
                            formattedValue = value >= 60 
                              ? `${value.toFixed(2)}s (${Math.floor(value / 60)}:${(value % 60).toFixed(2).padStart(5, '0')})`
                              : `${value.toFixed(2)}s`;
                          } else if (isBrazadaMetric) {
                            formattedValue = Math.round(value).toString();
                            unit = ' brazadas';
                          } else if (isFlechaMetric) {
                            formattedValue = value.toFixed(2);
                            unit = ' m';
                          }
                          
                          return (
                            <div key={metricName} className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                              <span className="font-medium text-blue-700 dark:text-blue-300 text-sm">{displayName}:</span>
                              <span className="text-blue-900 dark:text-blue-100 font-mono">{formattedValue}{unit}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  🧮 Métricas Automáticas
                </h4>
                <div className="space-y-3">
                  {Object.entries(completeTestData.auto_metrics).map(([key, value]) => {
                    const numValue = Number(value);
                    
                    const metricInfo: Record<string, { label: string; unit: string; formatter: (v: number) => string; color: string; description: string }> = {
                      'velocidad_promedio': { 
                        label: 'Velocidad Promedio', 
                        unit: 'm/s', 
                        formatter: (v) => v.toFixed(3),
                        color: 'text-green-600 dark:text-green-400',
                        description: 'Velocidad promedio durante toda la prueba'
                      },
                      'distancia_por_brazada': { 
                        label: 'Distancia por Brazada', 
                        unit: 'm/brazada', 
                        formatter: (v) => v.toFixed(2),
                        color: 'text-purple-600 dark:text-purple-400',
                        description: 'Distancia recorrida por cada brazada'
                      },
                      'distancia_sin_flecha': { 
                        label: 'Distancia sin Flecha', 
                        unit: 'm', 
                        formatter: (v) => v.toFixed(1),
                        color: 'text-orange-600 dark:text-orange-400',
                        description: 'Distancia nadada (excluyendo flechas)'
                      }
                    };
                    
                    const metric = metricInfo[key];
                    const displayLabel = metric?.label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    const formattedValue = metric?.formatter(numValue) || numValue.toFixed(2);
                    const unit = metric?.unit || '';
                    const colorClass = metric?.color || 'text-gray-600 dark:text-gray-400';
                    const description = metric?.description || '';
                    
                    return (
                      <div key={key} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-purple-800 dark:text-purple-200">{displayLabel}</span>
                          <span className={`font-mono font-bold text-lg ${colorClass}`}>{formattedValue} {unit}</span>
                        </div>
                        {description && (
                          <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">{description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                {Object.keys(completeTestData.auto_metrics).length === 0 && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>No se encontraron métricas automáticas calculadas para esta prueba.</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Team Comparison (MEJORADO) */}
        <div className="phoenix-card bg-gradient-to-br from-card to-card/80 animate-in slide-in-from-bottom duration-500 delay-700">
          <h2 className="text-2xl font-bold mb-6">Top 5 Comparaciones con el Equipo</h2>
          
          <div className="space-y-3">
            {teamComparisons.length > 0 ? teamComparisons.map((comparison) => {
              const isPositive = comparison.percentDiff > 0;
              const isSignificant = Math.abs(comparison.percentDiff) > 5; // Resaltar si la diferencia es > 5%
              
              return (
                <div 
                  key={comparison.metrica}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{comparison.label}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Tu Promedio: {comparison.swimmerValue.toFixed(2)} {comparison.unit} • 
                      Promedio Equipo: {comparison.teamAverage.toFixed(2)} {comparison.unit}
                    </div>
                  </div>
                  
                  <div className={`text-right ml-4 ${isPositive ? 'text-green-600' : 'text-orange-600'}`}>
                    <div className={`font-bold text-lg ${isSignificant ? 'animate-pulse' : ''}`}>
                      {isPositive ? '+' : ''}{comparison.percentDiff.toFixed(1)}%
                    </div>
                    <div className="text-xs">
                      {isPositive ? 'Mejor que el equipo' : 'A mejorar'}
                    </div>
                  </div>
                </div>
              )
            }) : (
              <p className="text-sm text-muted-foreground text-center p-4">No hay suficientes datos de otros nadadores para una comparación relevante.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 