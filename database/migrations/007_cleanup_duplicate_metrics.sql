-- Migration: 007_cleanup_duplicate_metrics.sql
-- Description: Unifies split metric names and removes duplicates.

BEGIN;

-- Paso 1: Renombrar 'Tiempo 15m Split' a 'Tiempo 15m' para estandarizar
-- Usamos 'Tiempo 15m' porque es más corto y claro.
UPDATE public.metricas
SET nombre = 'Tiempo 15m'
WHERE nombre = 'Tiempo 15m Split'
-- Asegurarnos de que no falle si 'Tiempo 15m' ya existe, aunque lo borraremos después
ON CONFLICT (nombre) DO NOTHING;

-- Paso 2: Re-mapear cualquier registro que todavía use el ID de 'Tiempo 15m' (el antiguo)
-- al ID del nuevo 'Tiempo 15m' (que era 'Tiempo 15m Split').
-- Este paso es por seguridad, aunque no debería haber registros usando el ID antiguo.
DO $$
DECLARE
    old_id INT;
    new_id INT;
BEGIN
    -- Obtener el ID de la métrica que vamos a eliminar ('Tiempo 15m' original)
    SELECT metrica_id INTO old_id FROM public.metricas WHERE nombre = 'Tiempo 15m' AND metrica_id != (SELECT metrica_id FROM public.metricas WHERE nombre = 'Tiempo 15m');
    
    -- Obtener el ID de la métrica que vamos a conservar
    SELECT metrica_id INTO new_id FROM public.metricas WHERE nombre = 'Tiempo 15m';

    IF old_id IS NOT NULL AND new_id IS NOT NULL THEN
        UPDATE public.registros
        SET metrica_id = new_id
        WHERE metrica_id = old_id;
    END IF;
END $$;

-- Paso 3: Eliminar la métrica duplicada original ('Tiempo 15m')
-- Ahora que todo está unificado, podemos eliminar la que ya no se usa.
DELETE FROM public.metricas
WHERE nombre = 'Tiempo 15m' 
  AND metrica_id != (SELECT metrica_id FROM public.metricas WHERE nombre = 'Tiempo 15m');

-- También, para consistencia, renombramos 'Tiempo 25m Split'
UPDATE public.metricas
SET nombre = 'Tiempo 25m'
WHERE nombre = 'Tiempo 25m Split'
ON CONFLICT (nombre) DO NOTHING;

COMMIT; 