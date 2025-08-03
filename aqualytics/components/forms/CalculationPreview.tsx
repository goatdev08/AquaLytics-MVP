/**
 * Componente de previsualización de cálculos de métricas
 * Extraído de MetricsForm.tsx para mejor modularidad
 */

import React from 'react'
import { formatTime } from '@/lib/utils/formatters'
import { METRICS_DEFINITIONS } from '@/lib/utils/metrics-mapping'
import { type PreviewProps } from '@/lib/types/metricsForm'

const CalculationPreviewMemo = React.memo(({ calculation, totalTime, totalStrokes, segments }: PreviewProps) => {
  const { globalMetrics, perSegmentMetrics } = calculation;
  const hasGlobalCalculations = Object.keys(globalMetrics).length > 0;

  return (
    <div className="space-y-4">
      {/* Resumen de Tramos y Métricas Globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-blue-800 dark:text-blue-300">Tramos Configurados</div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {segments.length > 0 ? `${segments.length} x ${segments[0].length}m` : 'N/A'}
          </div>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-sm text-green-800 dark:text-green-300">Tiempo Total</div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400 font-mono">
            {formatTime(totalTime)}
          </div>
        </div>
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-sm text-yellow-800 dark:text-yellow-300">Brazadas Totales</div>
          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
            {totalStrokes}
          </div>
        </div>
      </div>

      {/* Métricas Globales Calculadas */}
      {hasGlobalCalculations && (
         <div>
         <h4 className="font-semibold text-foreground mb-2 mt-4">Métricas Globales Derivadas</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
           {Object.entries(globalMetrics).map(([key, value]) => {
             const metricDef = METRICS_DEFINITIONS.find(m => m.parametro.toLowerCase().replace(/ /g, '_') === key);
             return(
               <div key={key} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex justify-between items-center">
                 <span className="text-sm text-purple-800 dark:text-purple-300">{metricDef?.label || key}</span>
                 <span className="font-bold text-purple-600 dark:text-purple-400">{value?.toFixed(2)} {metricDef?.unit}</span>
               </div>
             )
           })}
         </div>
       </div>
      )}

      {/* Métricas por Tramo Calculadas */}
      {perSegmentMetrics.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-2 mt-4">Métricas por Tramo</h4>
          <div className="space-y-2">
            {perSegmentMetrics.map((metric, index) => (
              <div key={index} className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex justify-between items-center">
                 <span className="text-sm text-indigo-800 dark:text-indigo-300">{metric.segmentLabel} - Velocidad</span>
                 <span className="font-bold text-indigo-600 dark:text-indigo-400">{metric.velocity?.toFixed(3)} m/s</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

CalculationPreviewMemo.displayName = 'CalculationPreview';

export { CalculationPreviewMemo as CalculationPreview };