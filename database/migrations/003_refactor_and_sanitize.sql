-- Migration: 003_refactor_and_sanitize.sql
-- Description: Refactors 'parametros' to 'metricas' and standardizes names.
BEGIN;

-- 1. Renombrar la tabla y sus componentes
ALTER TABLE public.parametros RENAME TO metricas;
ALTER SEQUENCE public.parametros_parametro_id_seq RENAME TO metricas_metrica_id_seq;
ALTER TABLE public.metricas RENAME CONSTRAINT parametros_pkey TO metricas_pkey;
ALTER TABLE public.metricas RENAME CONSTRAINT parametros_parametro_key TO metricas_nombre_unique;
ALTER TABLE public.metricas RENAME COLUMN parametro_id TO metrica_id;
ALTER TABLE public.metricas RENAME COLUMN parametro TO nombre;

-- 2. Renombrar columna en 'estilos' para consistencia
ALTER TABLE public.estilos RENAME COLUMN estilo TO nombre;

-- 3. Actualizar la clave foránea en la tabla 'registros'
ALTER TABLE public.registros DROP CONSTRAINT IF EXISTS registros_parametro_id_fkey;
ALTER TABLE public.registros RENAME COLUMN parametro_id TO metrica_id;
ALTER TABLE public.registros ADD CONSTRAINT registros_metrica_id_fkey
    FOREIGN KEY (metrica_id) REFERENCES public.metricas(metrica_id);

-- 4. Limpiar y estandarizar los nombres de las métricas manuales
UPDATE public.metricas SET nombre = 'Tiempo 15m' WHERE nombre = 'T15 (1)';
UPDATE public.metricas SET nombre = 'Brazadas por Tramo' WHERE nombre = 'BRZ 1';
UPDATE public.metricas SET nombre = 'Tiempo por Tramo' WHERE nombre = 'T25 (1)';
UPDATE public.metricas SET nombre = 'Flecha por Tramo' WHERE nombre = 'F1';
UPDATE public.metricas SET nombre = 'Tiempo Total' WHERE nombre = 'T TOTAL';
UPDATE public.metricas SET nombre = 'Brazadas Totales' WHERE nombre = '# de BRZ TOTAL';

-- 5. Re-mapear las FKs y eliminar los duplicados
WITH map AS (
    SELECT metrica_id as old_id, (SELECT metrica_id FROM public.metricas WHERE nombre = 'Tiempo 15m') as new_id FROM public.metricas WHERE nombre = 'T15 (2)'
    UNION ALL
    SELECT metrica_id, (SELECT metrica_id FROM public.metricas WHERE nombre = 'Brazadas por Tramo') FROM public.metricas WHERE nombre = 'BRZ 2'
    UNION ALL
    SELECT metrica_id, (SELECT metrica_id FROM public.metricas WHERE nombre = 'Tiempo por Tramo') FROM public.metricas WHERE nombre = 'T25 (2)'
    UNION ALL
    SELECT metrica_id, (SELECT metrica_id FROM public.metricas WHERE nombre = 'Flecha por Tramo') FROM public.metricas WHERE nombre = 'F2'
)
UPDATE public.registros SET metrica_id = map.new_id FROM map WHERE registros.metrica_id = map.old_id;

-- 6. Eliminar las métricas ahora duplicadas y las automáticas antiguas
DELETE FROM public.metricas WHERE nombre IN ('T15 (2)', 'BRZ 2', 'T25 (2)', 'F2', 'V1', 'V2', 'V promedio', 'DIST x BRZ', 'DIST sin F', 'F promedio');

-- 7. Insertar las métricas automáticas correctas
INSERT INTO public.metricas (nombre, tipo, global) VALUES
    ('Velocidad Promedio', 'A', true),
    ('Distancia por Brazada', 'A', true),
    ('Distancia sin Flecha', 'A', true)
ON CONFLICT (nombre) DO NOTHING;

COMMIT; 