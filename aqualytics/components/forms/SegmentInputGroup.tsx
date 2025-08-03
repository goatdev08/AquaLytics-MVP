'use client'

import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { type MetricFormData } from '@/lib/utils/validators'
import { type Prueba, type Distancia } from '@/lib/types'
import { type CourseType, type Segment } from '@/lib/utils/segmentCalculator'
import { formatTime } from '@/lib/utils/formatters'

interface SegmentInputGroupProps {
  segmentIndex: number;
  segment: Segment;
  distancia?: Distancia | null;
  prueba?: Prueba | null;
}

const TimeIcon = () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const StrokeIcon = () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
    </svg>
);

const UnderwaterIcon = () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

export function SegmentInputGroup({ segmentIndex, segment, distancia, prueba }: SegmentInputGroupProps) {
  const { register, formState: { errors }, watch, control } = useFormContext<MetricFormData>();

  const segmentErrors = errors.segments?.[segmentIndex];

  // Observar el tiempo del segmento para mostrar formato
  const segmentTime = watch(`segments.${segmentIndex}.segment_time`);
  const formattedTime = segmentTime && segmentTime > 0 ? formatTime(segmentTime) : '';

  // Determinar configuración según la nueva lógica específica
  const shouldShowT15 = segment?.showT15 ?? false;
  const shouldShowT25Split = segment?.showT25Split ?? false;
  const shouldShowSegmentTime = segment?.showSegmentTime ?? true;
  const shouldShowStrokes = segment?.showStrokes ?? true;
  const shouldShowFlecha = segment?.showUnderwaterDistance ?? true;

  // Información de contexto para el usuario
  const getContextInfo = () => {
    if (!distancia || !prueba) return "";
    
    const isLongCourse = prueba.curso === 'largo';
    const distance = distancia.distancia;
    
    if (distance === 50) {
      return isLongCourse 
        ? "50m CL: Splits 15m y 25m en primer segmento"
        : "50m CC: Solo splits 15m por segmento";
    }
    
    if (distance > 50 && isLongCourse) {
      return "Curso Largo: Solo brazadas, tiempo y flecha por tramo";
    }
    
    if (distance >= 200 && !isLongCourse) {
      return "Curso Corto ≥200m: Splits globales por distancia";
    }
    
    return "Configuración estándar por tramos";
  };

  const timeLabel = `Tiempo ${segment?.length || 'del tramo'}m`;

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Segmento {segmentIndex + 1} ({segment?.label || `Tramo ${segmentIndex + 1}`})
      </h3>
        {distancia && prueba && (
          <span className="text-xs text-muted-foreground bg-orange-100 dark:bg-orange-800/30 px-2 py-1 rounded-full">
            {getContextInfo()}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Split 15m - Solo en configuraciones específicas */}
        {shouldShowT15 && (
          <Controller
            name={`segments.${segmentIndex}.t15`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                label="Split 15m"
                placeholder="7.25"
                variant="phoenix"
                startIcon={<TimeIcon />}
                error={segmentErrors?.t15?.message}
                helperText="Tiempo 15m (seg)"
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
              />
            )}
          />
        )}

        {/* Split 25m - Solo en 50m Curso Largo, primer segmento */}
        {shouldShowT25Split && (
          <Controller
            name={`segments.${segmentIndex}.t25_split`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                label="Split 25m"
                placeholder="12.50"
                variant="phoenix"
                startIcon={<TimeIcon />}
                error={segmentErrors?.t25_split?.message}
                helperText="Tiempo 25m (split)"
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
              />
            )}
          />
        )}

        {/* Brazadas - Siempre presente cuando está habilitado */}
        {shouldShowStrokes && (
          <Controller
            name={`segments.${segmentIndex}.brz`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                label="Brazadas"
                placeholder="8"
                variant="warm"
                startIcon={<StrokeIcon />}
                error={segmentErrors?.brz?.message}
                helperText="Brazadas (#)"
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
              />
            )}
          />
        )}

        {/* Tiempo del segmento - Casi siempre presente */}
        {shouldShowSegmentTime && (
          <div>
            <Controller
              name={`segments.${segmentIndex}.segment_time`}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  label={timeLabel}
                  placeholder="15.50"
                  variant="phoenix"
                  startIcon={<TimeIcon />}
                  error={segmentErrors?.segment_time?.message}
                  helperText="Tiempo del tramo (seg)"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                />
              )}
            />
            {/* Mostrar formato MM:SS.CC si el tiempo es > 60 segundos */}
            {formattedTime && segmentTime && segmentTime >= 60 && (
              <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                📊 Formato: {formattedTime}
              </div>
            )}
          </div>
        )}

        {/* Flecha - Presente en casi todas las configuraciones */}
        {shouldShowFlecha && (
          <Controller
            name={`segments.${segmentIndex}.f`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                label="Flecha"
                placeholder="8.50"
                variant="sunset"
                startIcon={<UnderwaterIcon />}
                error={segmentErrors?.f?.message}
                helperText="Flecha (metros)"
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
              />
            )}
          />
        )}
      </div>

      {/* Información adicional para el usuario */}
      {(shouldShowT15 || shouldShowT25Split) && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {shouldShowT25Split 
              ? "Split 25m: Solo se registra en el primer segmento de 50m Curso Largo"
              : "Splits 15m: Registrar tiempo acumulado hasta los 15 metros"}
          </p>
        </div>
      )}
    </div>
  );
} 