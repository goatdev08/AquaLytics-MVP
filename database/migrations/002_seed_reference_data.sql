-- Migration: 002_seed_reference_data.sql
-- Description: Insert reference data for AquaLytics system
-- Created: 2024-12-24
-- Author: AquaLytics System

-- =====================================================
-- REFERENCE DATA SEEDING FOR AQUALYTICS
-- =====================================================

-- =====================================================
-- SEED: distancias (Swimming Distances)
-- =====================================================
INSERT INTO distancias (distancia_id, distancia) VALUES
(1, 25),
(2, 50),
(3, 100),
(4, 200),
(5, 400),
(6, 800),
(7, 1500)
ON CONFLICT (distancia) DO NOTHING;

-- Update sequence
SELECT setval('distancias_distancia_id_seq', (SELECT MAX(distancia_id) FROM distancias));

-- =====================================================
-- SEED: estilos (Swimming Strokes)
-- =====================================================
INSERT INTO estilos (estilo_id, estilo) VALUES
(1, 'Crol'),
(2, 'Dorso'),
(3, 'Pecho'),
(4, 'Mariposa'),
(5, 'Combinado')
ON CONFLICT (estilo) DO NOTHING;

-- Update sequence
SELECT setval('estilos_estilo_id_seq', (SELECT MAX(estilo_id) FROM estilos));

-- =====================================================
-- SEED: fases (Competition Phases)  
-- =====================================================
INSERT INTO fases (fase_id, fase) VALUES
(1, 'PRELIMINAR'),
(2, 'SEMIFINAL'),
(3, 'FINAL')
ON CONFLICT (fase) DO NOTHING;

-- Update sequence
SELECT setval('fases_fase_id_seq', (SELECT MAX(fase_id) FROM fases));

-- =====================================================
-- SEED: parametros (Swimming Metrics)
-- =====================================================

-- Manual Parameters (Métricas Manuales)
INSERT INTO parametros (parametro_id, parametro, tipo, global) VALUES
-- Primer segmento
(1, 'T15 (1)', 'M', false),        -- Tiempo primer segmento 15m
(2, '# de BRZ 1', 'M', false),    -- Número de brazadas primer segmento
(4, 'T25 (1)', 'M', false),       -- Tiempo primer segmento 25m
(12, 'F1', 'M', false),           -- Frecuencia primer segmento

-- Segundo segmento  
(5, '# de BRZ 2', 'M', false),    -- Número de brazadas segundo segmento
(7, 'T15 (2)', 'M', false),       -- Tiempo segundo segmento 15m
(10, 'T25 (2)', 'M', false),      -- Tiempo segundo segmento 25m
(15, 'F2', 'M', false),           -- Frecuencia segundo segmento

-- Métricas globales manuales
(13, 'T TOTAL', 'M', true)        -- Tiempo total
ON CONFLICT (parametro_id) DO NOTHING;

-- Automatic Parameters (Métricas Automáticas)
INSERT INTO parametros (parametro_id, parametro, tipo, global) VALUES
-- Velocidades por segmento
(3, 'V1', 'A', false),            -- Velocidad primer segmento
(6, 'V2', 'A', false),            -- Velocidad segundo segmento

-- Métricas globales automáticas
(8, 'BRZ TOTAL', 'A', true),      -- Total de brazadas
(9, 'V promedio', 'A', true),     -- Velocidad promedio
(11, 'DIST sin F', 'A', true),    -- Distancia sin frecuencia
(14, 'DIST x BRZ', 'A', true),    -- Distancia por brazada
(16, 'F promedio', 'A', true)     -- Frecuencia promedio
ON CONFLICT (parametro_id) DO NOTHING;

-- Update sequence
SELECT setval('parametros_parametro_id_seq', (SELECT MAX(parametro_id) FROM parametros));

-- =====================================================
-- SAMPLE DATA: competencias (Sample Competitions)
-- =====================================================
INSERT INTO competencias (competencia_id, competencia, periodo) VALUES
(1, 'Campeonato Nacional Junior 2024', '[2024-06-15,2024-06-19)'),
(2, 'Copa Autonómica Cataluña', '[2024-04-20,2024-04-23)'),
(3, 'Meeting Internacional Valencia', '[2024-08-10,2024-08-13)')
ON CONFLICT DO NOTHING;

-- Update sequence
SELECT setval('competencias_competencia_id_seq', (SELECT MAX(competencia_id) FROM competencias));

-- =====================================================
-- SAMPLE DATA: nadadores (Sample Swimmers)
-- =====================================================
INSERT INTO nadadores (id_nadador, nombre, edad, peso) VALUES
(1, 'Ana García', 19, 62),
(2, 'Carlos Martínez', 20, 78),
(3, 'Carmen López', 21, 60),
(4, 'Alejandro Rodríguez', 18, 72),
(5, 'María Fernández', 22, 58)
ON CONFLICT DO NOTHING;

-- Update sequence
SELECT setval('nadadores_id_nadador_seq', (SELECT MAX(id_nadador) FROM nadadores));

-- =====================================================
-- VALIDATION AND STATISTICS
-- =====================================================

-- Display seeded data statistics
DO $$
DECLARE
    distancias_count INTEGER;
    estilos_count INTEGER;
    fases_count INTEGER;
    parametros_count INTEGER;
    parametros_manuales INTEGER;
    parametros_automaticos INTEGER;
    competencias_count INTEGER;
    nadadores_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO distancias_count FROM distancias;
    SELECT COUNT(*) INTO estilos_count FROM estilos;
    SELECT COUNT(*) INTO fases_count FROM fases;
    SELECT COUNT(*) INTO parametros_count FROM parametros;
    SELECT COUNT(*) INTO parametros_manuales FROM parametros WHERE tipo = 'M';
    SELECT COUNT(*) INTO parametros_automaticos FROM parametros WHERE tipo = 'A';
    SELECT COUNT(*) INTO competencias_count FROM competencias;
    SELECT COUNT(*) INTO nadadores_count FROM nadadores;
    
    RAISE NOTICE 'SEEDING COMPLETED SUCCESSFULLY:';
    RAISE NOTICE '- Distancias: %', distancias_count;
    RAISE NOTICE '- Estilos: %', estilos_count;
    RAISE NOTICE '- Fases: %', fases_count;
    RAISE NOTICE '- Parámetros Total: % (Manuales: %, Automáticos: %)', 
        parametros_count, parametros_manuales, parametros_automaticos;
    RAISE NOTICE '- Competencias: %', competencias_count;
    RAISE NOTICE '- Nadadores: %', nadadores_count;
    
    -- Verify expected counts
    IF distancias_count = 7 AND estilos_count = 5 AND fases_count = 3 
       AND parametros_manuales = 9 AND parametros_automaticos = 7 THEN
        RAISE NOTICE 'Migration 002_seed_reference_data.sql completed successfully!';
    ELSE
        RAISE WARNING 'Some expected data counts do not match. Please verify.';
    END IF;
END $$; 