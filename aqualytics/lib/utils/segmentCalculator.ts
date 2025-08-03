/**
 * segmentCalculator.ts - Lógica para el Cálculo de Tramos de Natación
 *
 * Este archivo contiene las funciones de utilidad para determinar
 * el número y la longitud de los tramos (segmentos) de una prueba de natación,
 * basándose en la distancia total y el tipo de curso (piscina).
 * 
 * DEFINICIONES CORRECTAS:
 * - CL (Curso Largo) = Alberca de 50m
 * - CC (Curso Corto) = Alberca de 25m
 */

export type CourseType = 'largo' | 'corto';

export interface Segment {
  length: number; // Longitud del tramo en metros
  label: string;  // Etiqueta para la UI, ej: "0-50m", "50-100m"
  showT15?: boolean; // Si debe mostrar campo de tiempo 15m
  showT25Split?: boolean; // Si debe mostrar campo de split 25m
  showSegmentTime?: boolean; // Si debe mostrar tiempo del segmento completo
  showStrokes?: boolean; // Si debe mostrar brazadas
  showUnderwaterDistance?: boolean; // Si debe mostrar flecha
}

/**
 * Configuración específica de splits según distancia y curso
 */
export interface SplitConfiguration {
  segments: Segment[];
  globalSplits?: string[]; // Splits globales adicionales (ej: 25m, 50m, 75m para 200m CC)
}

/**
 * Determina la configuración de splits según las reglas correctas de natación
 */
export function getSplitConfiguration(distance: number, course: CourseType): SplitConfiguration {
  
  // **50m Curso Largo (Alberca 50m)**: 1 tramo de 50m con splits de 15m y 25m
  if (distance === 50 && course === 'largo') {
    return {
      segments: [
        {
          length: 50, // Un solo tramo de 50m completos
          label: "0-50m",
          showT15: true,        // Split 15m
          showT25Split: true,   // Split 25m
          showSegmentTime: true, // Tiempo total 50m
          showStrokes: true,
          showUnderwaterDistance: true
        }
      ]
    };
  }

  // **50m Curso Corto (Alberca 25m)**: 2 tramos de 25m cada uno
  if (distance === 50 && course === 'corto') {
    return {
      segments: [
        {
          length: 25, // Primer tramo de 25m
          label: "0-25m",
          showT15: true,          // Split 15m del primer tramo
          showT25Split: false,    // No split 25m (es el tiempo del tramo)
          showSegmentTime: true,  // Tiempo del tramo (25m)
          showStrokes: true,
          showUnderwaterDistance: true
        },
        {
          length: 25, // Segundo tramo de 25m
          label: "25-50m", 
          showT15: true,          // Split 15m del segundo tramo
          showT25Split: false,    // No split 25m
          showSegmentTime: true,  // Tiempo del tramo (25m)
          showStrokes: true,
          showUnderwaterDistance: true
        }
      ]
    };
  }

  // **100m Curso Largo (Alberca 50m)**: 2 tramos de 50m cada uno
  if (distance === 100 && course === 'largo') {
    return {
      segments: [
        {
          length: 50,
          label: "0-50m",
          showT15: false,         // No splits en tramos largos
          showT25Split: false,
          showSegmentTime: true,  // Tiempo del tramo (50m)
          showStrokes: true,
          showUnderwaterDistance: true
        },
        {
          length: 50,
          label: "50-100m",
          showT15: false,
          showT25Split: false,
          showSegmentTime: true,  // Tiempo del tramo (50m)
          showStrokes: true,
          showUnderwaterDistance: true
        }
      ]
    };
  }

  // **100m Curso Corto (Alberca 25m)**: 4 tramos de 25m cada uno
  if (distance === 100 && course === 'corto') {
    const segments: Segment[] = [];
    for (let i = 0; i < 4; i++) {
      const start = i * 25;
      const end = start + 25;
      segments.push({
        length: 25,
        label: `${start}-${end}m`,
        showT15: false,
        showT25Split: false,
        showSegmentTime: true,
        showStrokes: true,
        showUnderwaterDistance: true
      });
    }
    return { segments };
  }

  // **200m Curso Corto (Alberca 25m)**: 8 tramos de 25m con splits cada 25m
  if (distance === 200 && course === 'corto') {
    const segments: Segment[] = [];
    const globalSplits: string[] = [];

    // Generar splits globales cada 25m
    for (let split = 25; split < distance; split += 25) {
      globalSplits.push(`${split}m`);
    }

    // Generar 8 tramos de 25m cada uno
    for (let i = 0; i < 8; i++) {
      const start = i * 25;
      const end = start + 25;
      segments.push({
        length: 25,
        label: `${start}-${end}m`,
        showT15: false,
        showT25Split: false, // En CC > 100m, los splits se manejan de otra forma
        showSegmentTime: true,
        showStrokes: true,
        showUnderwaterDistance: true
      });
    }

    return { segments, globalSplits };
  }

  // **200m Curso Largo (Alberca 50m)**: 4 tramos de 50m cada uno
  if (distance === 200 && course === 'largo') {
    const segments: Segment[] = [];
    for (let i = 0; i < 4; i++) {
      const start = i * 50;
      const end = start + 50;
      segments.push({
        length: 50,
        label: `${start}-${end}m`,
        showT15: false,
        showT25Split: false,
        showSegmentTime: true,
        showStrokes: true,
        showUnderwaterDistance: true
      });
    }
    return { segments };
  }

  // **Reglas para otras distancias...**
  const segmentLength = course === 'largo' ? 50 : 25;
  if (distance > 0 && distance % segmentLength === 0) {
    const numberOfSegments = distance / segmentLength;
    const segments: Segment[] = [];

    for (let i = 0; i < numberOfSegments; i++) {
      const start = i * segmentLength;
      const end = start + segmentLength;
      segments.push({
        length: segmentLength,
        label: `${start}-${end}m`,
        showT15: false,
        showT25Split: false,
        showSegmentTime: true,
        showStrokes: true,
        showUnderwaterDistance: true
      });
    }
    
    // Para pruebas largas en curso corto, se pueden agregar splits globales
    const globalSplits: string[] = [];
    if (distance >= 200 && course === 'corto') {
      for (let split = 25; split < distance; split += 25) {
        globalSplits.push(`${split}m`);
      }
    }

    return { segments, globalSplits };
  }


  // Fallback: configuración vacía si no coincide ninguna regla
  return {
    segments: [] 
  };
}

/**
 * Calcula el número y la longitud de los tramos para una prueba de natación.
 * DEPRECATED: Usar getSplitConfiguration en su lugar
 */
export function calculateSegments(distance: number, course: CourseType): Segment[] {
  const config = getSplitConfiguration(distance, course);
  return config.segments;
}

/**
 * Ejemplo de uso:
 *
 * const tramos_200_corto = calculateSegments(200, 'corto');
 * // Devuelve:
 * // [
 * //   { length: 25, label: '0-25m' },
 * //   { length: 25, label: '25-50m' },
 * //   ... (8 tramos en total)
 * // ]
 *
 * const tramos_400_largo = calculateSegments(400, 'largo');
 * // Devuelve:
 * // [
 * //   { length: 50, label: '0-50m' },
 * //   { length: 50, label: '50-100m' },
 * //   ... (8 tramos en total)
 * // ]
 */ 