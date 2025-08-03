/**
 * formatters.ts - Utilidades para formatear datos en AquaLytics
 */

/**
 * Formatea tiempo en segundos a formato MM:SS.CC para tiempos > 60s
 * @param seconds - Tiempo en segundos
 * @returns String formateado (XX.XX para < 60s, MM:SS.CC para >= 60s)
 */
export function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0.00';
  
  if (seconds < 60) {
    return seconds.toFixed(2);
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toFixed(2).padStart(5, '0')}`;
}

/**
 * Formatea tiempo con etiqueta contextual
 * @param seconds - Tiempo en segundos
 * @param showLabel - Si mostrar la etiqueta "(MM:SS)" para tiempos > 60s
 * @returns String formateado con etiqueta opcional
 */
export function formatTimeWithLabel(seconds: number, showLabel: boolean = true): string {
  const formatted = formatTime(seconds);
  
  if (seconds >= 60 && showLabel) {
    return `${seconds.toFixed(2)}s (${formatted})`;
  }
  
  return `${formatted}s`;
}

/**
 * Formatea velocidad con unidades apropiadas
 * @param velocity - Velocidad en m/s
 * @returns String formateado con unidad
 */
export function formatVelocity(velocity: number): string {
  if (!velocity || velocity <= 0) return '0.00 m/s';
  return `${velocity.toFixed(2)} m/s`;
}

/**
 * Formatea distancia con unidades apropiadas
 * @param distance - Distancia en metros
 * @param decimals - Número de decimales (default: 1)
 * @returns String formateado con unidad
 */
export function formatDistance(distance: number, decimals: number = 1): string {
  if (!distance || distance <= 0) return '0.0 m';
  return `${distance.toFixed(decimals)} m`;
}

/**
 * Formatea brazadas como número entero
 * @param strokes - Número de brazadas
 * @returns String formateado
 */
export function formatStrokes(strokes: number): string {
  if (!strokes || strokes <= 0) return '0';
  return Math.round(strokes).toString();
}

/**
 * Formatea métricas manuales con etiquetas descriptivas y formato de tiempo
 * @param metricKey - Clave de la métrica
 * @param value - Valor de la métrica
 * @returns String formateado con descripción
 */
export function formatManualMetric(metricKey: string, value: number): string {
  // Métricas de tiempo
  if (metricKey.toLowerCase().includes('tiempo') || metricKey.startsWith('t')) {
    return `${metricKey}: ${formatTimeWithLabel(value)}`;
  }
  
  // Métricas de brazadas
  if (metricKey.toLowerCase().includes('brazada') || metricKey.toLowerCase().includes('brz')) {
    return `${metricKey}: ${formatStrokes(value)}`;
  }
  
  // Métricas de flecha/distancia
  if (metricKey.toLowerCase().includes('flecha') || metricKey.startsWith('f')) {
    return `${metricKey}: ${formatDistance(value, 2)}`;
  }
  
  // Default
  return `${metricKey}: ${value.toFixed(2)}`;
}

/**
 * Determina si un valor de tiempo debe mostrarse en formato MM:SS.CC
 * @param seconds - Tiempo en segundos
 * @returns Boolean indicando si debe usar formato extendido
 */
export function shouldUseExtendedTimeFormat(seconds: number): boolean {
  return seconds >= 60;
}

/**
 * Obtiene información contextual sobre el formato de tiempo
 * @param seconds - Tiempo en segundos
 * @returns Objeto con información de formato
 */
export function getTimeFormatInfo(seconds: number) {
  return {
    raw: seconds,
    formatted: formatTime(seconds),
    withLabel: formatTimeWithLabel(seconds),
    isExtended: shouldUseExtendedTimeFormat(seconds),
    unit: seconds >= 60 ? 'MM:SS.CC' : 'SS.CC'
  };
} 