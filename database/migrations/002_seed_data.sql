-- Migration: 002_seed_data.sql
-- Description: Populates the reference tables with standard data.
BEGIN;

-- Insertar datos de referencia
INSERT INTO public.distancias (distancia) VALUES (25), (50), (100), (200), (400), (800), (1500) ON CONFLICT DO NOTHING;
INSERT INTO public.estilos (nombre) VALUES ('Crol'), ('Dorso'), ('Pecho'), ('Mariposa'), ('Combinado') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO public.fases (nombre) VALUES ('Entrenamiento'), ('Competencia'), ('Prueba') ON CONFLICT (nombre) DO NOTHING;

-- Insertar los parámetros originales
INSERT INTO public.parametros (parametro, tipo, global) VALUES
    ('T15 (1)', 'M', false), ('BRZ 1', 'M', false), ('T25 (1)', 'M', false), ('F1', 'M', false),
    ('T15 (2)', 'M', false), ('BRZ 2', 'M', false), ('T25 (2)', 'M', false), ('F2', 'M', false),
    ('T TOTAL', 'M', true), ('# de BRZ TOTAL', 'M', true),
    ('V1', 'A', false), ('V2', 'A', false), ('V promedio', 'A', true),
    ('DIST x BRZ', 'A', true), ('DIST sin F', 'A', true), ('F promedio', 'A', true)
ON CONFLICT (parametro) DO NOTHING;

-- Insertar las pruebas de natación estándar
INSERT INTO public.pruebas (distancia_id, estilo_id, curso, nombre) VALUES
    (2, 1, 'largo', '50m Libre'), (2, 1, 'corto', '50m Libre'),
    (3, 1, 'largo', '100m Libre'), (3, 1, 'corto', '100m Libre'),
    (4, 1, 'largo', '200m Libre'), (4, 1, 'corto', '200m Libre'),
    (5, 1, 'largo', '400m Libre'), (5, 1, 'corto', '400m Libre'),
    (6, 1, 'largo', '800m Libre'), (6, 1, 'corto', '800m Libre'),
    (7, 1, 'largo', '1500m Libre'), (7, 1, 'corto', '1500m Libre'),
    (2, 2, 'largo', '50m Espalda'), (2, 2, 'corto', '50m Espalda'),
    (3, 2, 'largo', '100m Espalda'), (3, 2, 'corto', '100m Espalda'),
    (4, 2, 'largo', '200m Espalda'), (4, 2, 'corto', '200m Espalda'),
    (2, 3, 'largo', '50m Pecho'), (2, 3, 'corto', '50m Pecho'),
    (3, 3, 'largo', '100m Pecho'), (3, 3, 'corto', '100m Pecho'),
    (4, 3, 'largo', '200m Pecho'), (4, 3, 'corto', '200m Pecho'),
    (2, 4, 'largo', '50m Mariposa'), (2, 4, 'corto', '50m Mariposa'),
    (3, 4, 'largo', '100m Mariposa'), (3, 4, 'corto', '100m Mariposa'),
    (4, 4, 'largo', '200m Mariposa'), (4, 4, 'corto', '200m Mariposa'),
    (4, 5, 'largo', '200m Combinado'), (4, 5, 'corto', '200m Combinado'),
    (5, 5, 'largo', '400m Combinado'), (5, 5, 'corto', '400m Combinado')
ON CONFLICT (distancia_id, estilo_id, curso) DO NOTHING;

COMMIT; 