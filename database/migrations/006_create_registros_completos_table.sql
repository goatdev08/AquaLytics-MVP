-- Migration: 006_create_registros_completos_table.sql
-- Description: Create registros_completos table for efficient competition data storage
-- Created: 2025-06-29  
-- Author: AquaLytics System

-- =====================================================
-- TABLA REGISTROS_COMPLETOS: OPTIMIZACIÓN PARA MVP
-- =====================================================
-- Esta tabla almacena datos completos de una prueba en un solo registro,
-- incluyendo las 16 métricas (10 manuales + 6 calculadas automáticamente)

-- =====================================================
-- TABLE: registros_completos
-- =====================================================
CREATE TABLE IF NOT EXISTS registros_completos (
    id SERIAL PRIMARY KEY,
    -- Referencias principales
    id_nadador INTEGER NOT NULL REFERENCES nadadores(id_nadador) ON DELETE CASCADE,
    prueba_id INTEGER NOT NULL REFERENCES pruebas(id) ON DELETE RESTRICT,
    competencia_id INTEGER REFERENCES competencias(competencia_id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    fase_id INTEGER REFERENCES fases(fase_id) ON DELETE SET NULL,
    
    -- =====================================================
    -- MÉTRICAS MANUALES (10 campos)
    -- =====================================================
    -- Primer segmento (25m)
    t15_1 NUMERIC(10,3),      -- Tiempo a los 15m del primer segmento
    brz_1 NUMERIC(10,3),      -- Número de brazadas primer segmento
    t25_1 NUMERIC(10,3),      -- Tiempo a los 25m del primer segmento
    f1 NUMERIC(10,3),         -- Distancia de flecha primer segmento
    
    -- Segundo segmento (25m)
    t15_2 NUMERIC(10,3),      -- Tiempo a los 15m del segundo segmento
    brz_2 NUMERIC(10,3),      -- Número de brazadas segundo segmento
    t25_2 NUMERIC(10,3),      -- Tiempo a los 25m del segundo segmento
    f2 NUMERIC(10,3),         -- Distancia de flecha segundo segmento
    
    -- Métricas globales
    t_total NUMERIC(10,3),    -- Tiempo total de la prueba
    brz_total NUMERIC(10,3),  -- Total de brazadas
    
    -- =====================================================
    -- MÉTRICAS CALCULADAS AUTOMÁTICAMENTE (6 campos)
    -- =====================================================
    velocidad_promedio NUMERIC(10,3) GENERATED ALWAYS AS (
        CASE WHEN t_total > 0 THEN 50.0 / t_total ELSE NULL END
    ) STORED,
    
    ritmo_brazada NUMERIC(10,3) GENERATED ALWAYS AS (
        CASE WHEN brz_total > 0 AND t_total > 0 
        THEN t_total / brz_total 
        ELSE NULL END
    ) STORED,
    
    eficiencia_nado NUMERIC(10,3) GENERATED ALWAYS AS (
        CASE WHEN brz_total > 0 AND t_total > 0 
        THEN (50.0 / brz_total) * (50.0 / t_total) 
        ELSE NULL END
    ) STORED,
    
    consistencia_tramos NUMERIC(10,3) GENERATED ALWAYS AS (
        CASE WHEN t25_1 > 0 AND t25_2 > 0 
        THEN (1.0 - ABS(t25_1 - t25_2) / GREATEST(t25_1, t25_2)) * 100
        ELSE NULL END
    ) STORED,
    
    indice_fatiga NUMERIC(10,3) GENERATED ALWAYS AS (
        CASE WHEN t25_1 > 0 AND t25_2 > 0 
        THEN ((t25_2 - t25_1) / t25_1) * 100
        ELSE NULL END
    ) STORED,
    
    potencia_relativa NUMERIC(10,3) GENERATED ALWAYS AS (
        CASE WHEN t_total > 0 AND brz_total > 0 
        THEN POWER(50.0 / t_total, 2) * (50.0 / brz_total)
        ELSE NULL END
    ) STORED,
    
    -- =====================================================
    -- CAMPOS DE METADATA
    -- =====================================================
    completitud_porcentaje NUMERIC(5,2) DEFAULT 0,
    metricas_registradas INTEGER DEFAULT 0,
    metodo_registro VARCHAR(50) DEFAULT 'manual',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint único para evitar duplicados
    UNIQUE(id_nadador, prueba_id, competencia_id, fecha, fase_id)
);

-- Add comments for documentation
COMMENT ON TABLE registros_completos IS 'Tabla optimizada para almacenar datos completos de competencias';
COMMENT ON COLUMN registros_completos.t15_1 IS 'Tiempo a los 15m del primer segmento (seg)';
COMMENT ON COLUMN registros_completos.brz_1 IS 'Número de brazadas en el primer segmento';
COMMENT ON COLUMN registros_completos.t25_1 IS 'Tiempo a los 25m del primer segmento (seg)';
COMMENT ON COLUMN registros_completos.f1 IS 'Distancia de flecha/deslizamiento primer segmento (m)';
COMMENT ON COLUMN registros_completos.velocidad_promedio IS 'Velocidad promedio calculada (m/s)';
COMMENT ON COLUMN registros_completos.ritmo_brazada IS 'Tiempo por brazada (seg/brazada)';
COMMENT ON COLUMN registros_completos.eficiencia_nado IS 'Índice de eficiencia de nado';
COMMENT ON COLUMN registros_completos.consistencia_tramos IS 'Porcentaje de consistencia entre tramos (0-100%)';
COMMENT ON COLUMN registros_completos.indice_fatiga IS 'Porcentaje de cambio en velocidad entre tramos';
COMMENT ON COLUMN registros_completos.potencia_relativa IS 'Índice de potencia relativa del nadador';
COMMENT ON COLUMN registros_completos.completitud_porcentaje IS 'Porcentaje de métricas manuales completadas';
COMMENT ON COLUMN registros_completos.metricas_registradas IS 'Número de métricas manuales registradas';

-- =====================================================
-- FUNCTION: update_completitud()
-- =====================================================
-- Actualiza automáticamente completitud_porcentaje y metricas_registradas
CREATE OR REPLACE FUNCTION update_completitud()
RETURNS TRIGGER AS $$
BEGIN
    -- Contar métricas manuales no nulas
    NEW.metricas_registradas := 
        (CASE WHEN NEW.t15_1 IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.brz_1 IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.t25_1 IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.f1 IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.t15_2 IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.brz_2 IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.t25_2 IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.f2 IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.t_total IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.brz_total IS NOT NULL THEN 1 ELSE 0 END);
    
    -- Calcular porcentaje (10 métricas manuales totales)
    NEW.completitud_porcentaje := (NEW.metricas_registradas::NUMERIC / 10.0) * 100;
    
    -- Actualizar timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================
-- Trigger para actualizar completitud antes de INSERT o UPDATE
CREATE TRIGGER trigger_update_completitud
    BEFORE INSERT OR UPDATE ON registros_completos
    FOR EACH ROW
    EXECUTE FUNCTION update_completitud();

-- Trigger para actualizar updated_at en UPDATE
CREATE TRIGGER trigger_update_registros_completos_updated_at
    BEFORE UPDATE ON registros_completos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================
-- Índices principales para consultas frecuentes
CREATE INDEX idx_registros_completos_nadador ON registros_completos(id_nadador);
CREATE INDEX idx_registros_completos_competencia ON registros_completos(competencia_id);
CREATE INDEX idx_registros_completos_fecha ON registros_completos(fecha DESC);
CREATE INDEX idx_registros_completos_prueba ON registros_completos(prueba_id);

-- Índices compuestos para análisis
CREATE INDEX idx_registros_completos_nadador_fecha 
    ON registros_completos(id_nadador, fecha DESC);
CREATE INDEX idx_registros_completos_competencia_fecha 
    ON registros_completos(competencia_id, fecha DESC);

-- Índice para búsquedas de registros completos
CREATE INDEX idx_registros_completos_completitud 
    ON registros_completos(completitud_porcentaje DESC) 
    WHERE completitud_porcentaje >= 50;

-- =====================================================
-- VIEW: Vista simplificada para análisis
-- =====================================================
CREATE OR REPLACE VIEW vista_analisis_competencias AS
SELECT 
    rc.id,
    rc.fecha,
    n.nombre as nadador_nombre,
    p.nombre as prueba_nombre,
    p.curso,
    c.competencia as competencia_nombre,
    f.fase,
    rc.t_total,
    rc.velocidad_promedio,
    rc.eficiencia_nado,
    rc.consistencia_tramos,
    rc.indice_fatiga,
    rc.completitud_porcentaje
FROM registros_completos rc
JOIN nadadores n ON rc.id_nadador = n.id_nadador
JOIN pruebas p ON rc.prueba_id = p.id
LEFT JOIN competencias c ON rc.competencia_id = c.competencia_id
LEFT JOIN fases f ON rc.fase_id = f.fase_id
WHERE rc.completitud_porcentaje >= 80;

COMMENT ON VIEW vista_analisis_competencias IS 'Vista optimizada para análisis de competencias con datos completos';

-- =====================================================
-- VALIDATION: Verify table creation
-- =====================================================
DO $$
DECLARE
    v_table_exists BOOLEAN;
    v_columns_count INTEGER;
    v_generated_columns INTEGER;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'registros_completos'
    ) INTO v_table_exists;
    
    IF NOT v_table_exists THEN
        RAISE EXCEPTION 'Table registros_completos was not created successfully';
    END IF;
    
    -- Count columns
    SELECT COUNT(*) INTO v_columns_count 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'registros_completos';
    
    -- Count generated columns
    SELECT COUNT(*) INTO v_generated_columns
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'registros_completos'
    AND is_generated = 'ALWAYS';
    
    RAISE NOTICE 'REGISTROS_COMPLETOS TABLE CREATION COMPLETED:';
    RAISE NOTICE '- Total columns: %', v_columns_count;
    RAISE NOTICE '- Generated columns: %', v_generated_columns;
    RAISE NOTICE '- Manual metrics: 10';
    RAISE NOTICE '- Automatic metrics: 6';
    
    IF v_columns_count >= 24 AND v_generated_columns = 6 THEN
        RAISE NOTICE 'Migration 006_create_registros_completos_table.sql completed successfully!';
    ELSE
        RAISE WARNING 'Column count mismatch. Expected 24+ columns with 6 generated. Please verify.';
    END IF;
END $$; 