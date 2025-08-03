-- Migration: 005_create_pruebas_table.sql
-- Description: Create pruebas table with automatic swim segments calculation
-- Created: 2025-06-29
-- Author: AquaLytics System

-- =====================================================
-- TABLA PRUEBAS: OPTIMIZACIÓN PARA MVP
-- =====================================================
-- Esta tabla define los tipos de pruebas de natación y calcula
-- automáticamente el número de tramos según el curso (largo/corto)

-- =====================================================
-- TABLE: pruebas (Swimming Tests/Events)
-- =====================================================
CREATE TABLE IF NOT EXISTS pruebas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    distancia_id INTEGER NOT NULL REFERENCES distancias(distancia_id) ON DELETE RESTRICT,
    estilo_id INTEGER NOT NULL REFERENCES estilos(estilo_id) ON DELETE RESTRICT,
    curso VARCHAR(10) NOT NULL CHECK (curso IN ('largo', 'corto')),
    tramos_totales INTEGER,
    distancia_por_tramo INTEGER,
    UNIQUE(distancia_id, estilo_id, curso)
);

-- Add comments for documentation
COMMENT ON TABLE pruebas IS 'Tabla de definición de pruebas con cálculo automático de tramos';
COMMENT ON COLUMN pruebas.id IS 'Identificador único de la prueba';
COMMENT ON COLUMN pruebas.nombre IS 'Nombre descriptivo de la prueba (ej: 50m Libre)';
COMMENT ON COLUMN pruebas.distancia_id IS 'Referencia a la distancia total';
COMMENT ON COLUMN pruebas.estilo_id IS 'Referencia al estilo de natación';
COMMENT ON COLUMN pruebas.curso IS 'Tipo de piscina: largo (50m) o corto (25m)';
COMMENT ON COLUMN pruebas.tramos_totales IS 'Número total de tramos calculado automáticamente';
COMMENT ON COLUMN pruebas.distancia_por_tramo IS 'Distancia de cada tramo (25 o 50 metros)';

-- =====================================================
-- FUNCTION: calculate_tramos()
-- =====================================================
-- Calcula automáticamente los tramos según el curso
CREATE OR REPLACE FUNCTION calculate_tramos() 
RETURNS TRIGGER AS $$
DECLARE
    v_distancia INTEGER;
    v_estilo VARCHAR(50);
    v_pool_size INTEGER;
BEGIN
    -- Obtener la distancia total de la tabla distancias
    SELECT distancia INTO v_distancia 
    FROM distancias 
    WHERE distancia_id = NEW.distancia_id;
    
    -- Obtener el nombre del estilo
    SELECT estilo INTO v_estilo 
    FROM estilos 
    WHERE estilo_id = NEW.estilo_id;
    
    -- Determinar el tamaño de la piscina según el curso
    IF NEW.curso = 'largo' THEN
        v_pool_size := 50;
    ELSE
        v_pool_size := 25;
    END IF;
    
    -- Validar que la distancia sea divisible por el tamaño del curso
    IF v_distancia % v_pool_size != 0 THEN
        RAISE EXCEPTION 'La distancia % metros no es válida para curso %', 
            v_distancia, NEW.curso;
    END IF;
    
    -- Calcular tramos totales y distancia por tramo
    NEW.tramos_totales := v_distancia / v_pool_size;
    NEW.distancia_por_tramo := v_pool_size;
    
    -- Generar nombre descriptivo si no se proporcionó
    IF NEW.nombre IS NULL OR NEW.nombre = '' THEN
        NEW.nombre := v_distancia || 'm ' || v_estilo || ' (' || 
                     CASE NEW.curso 
                         WHEN 'largo' THEN 'CL' 
                         ELSE 'CC' 
                     END || ')';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-calculate tramos on insert/update
-- =====================================================
CREATE TRIGGER pruebas_calculate_tramos_trigger
    BEFORE INSERT OR UPDATE ON pruebas
    FOR EACH ROW
    EXECUTE FUNCTION calculate_tramos();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_pruebas_distancia ON pruebas(distancia_id);
CREATE INDEX idx_pruebas_estilo ON pruebas(estilo_id);
CREATE INDEX idx_pruebas_curso ON pruebas(curso);
CREATE INDEX idx_pruebas_lookup ON pruebas(distancia_id, estilo_id, curso);

-- =====================================================
-- SEED DATA: Common swimming tests
-- =====================================================
-- Insertamos las pruebas más comunes en competencias

-- Pruebas de Crol (estilo_id = 1)
INSERT INTO pruebas (distancia_id, estilo_id, curso, nombre) VALUES
-- 50m Crol
(2, 1, 'largo', '50m Libre CL'),
(2, 1, 'corto', '50m Libre CC'),
-- 100m Crol
(3, 1, 'largo', '100m Libre CL'),
(3, 1, 'corto', '100m Libre CC'),
-- 200m Crol
(4, 1, 'largo', '200m Libre CL'),
(4, 1, 'corto', '200m Libre CC'),
-- 400m Crol
(5, 1, 'largo', '400m Libre CL'),
(5, 1, 'corto', '400m Libre CC'),
-- 800m Crol
(6, 1, 'largo', '800m Libre CL'),
(6, 1, 'corto', '800m Libre CC'),
-- 1500m Crol
(7, 1, 'largo', '1500m Libre CL'),
(7, 1, 'corto', '1500m Libre CC')
ON CONFLICT (distancia_id, estilo_id, curso) DO NOTHING;

-- Pruebas de Espalda (estilo_id = 2)
INSERT INTO pruebas (distancia_id, estilo_id, curso, nombre) VALUES
(2, 2, 'largo', '50m Espalda CL'),
(2, 2, 'corto', '50m Espalda CC'),
(3, 2, 'largo', '100m Espalda CL'),
(3, 2, 'corto', '100m Espalda CC'),
(4, 2, 'largo', '200m Espalda CL'),
(4, 2, 'corto', '200m Espalda CC')
ON CONFLICT (distancia_id, estilo_id, curso) DO NOTHING;

-- Pruebas de Pecho (estilo_id = 3)
INSERT INTO pruebas (distancia_id, estilo_id, curso, nombre) VALUES
(2, 3, 'largo', '50m Pecho CL'),
(2, 3, 'corto', '50m Pecho CC'),
(3, 3, 'largo', '100m Pecho CL'),
(3, 3, 'corto', '100m Pecho CC'),
(4, 3, 'largo', '200m Pecho CL'),
(4, 3, 'corto', '200m Pecho CC')
ON CONFLICT (distancia_id, estilo_id, curso) DO NOTHING;

-- Pruebas de Mariposa (estilo_id = 4)
INSERT INTO pruebas (distancia_id, estilo_id, curso, nombre) VALUES
(2, 4, 'largo', '50m Mariposa CL'),
(2, 4, 'corto', '50m Mariposa CC'),
(3, 4, 'largo', '100m Mariposa CL'),
(3, 4, 'corto', '100m Mariposa CC'),
(4, 4, 'largo', '200m Mariposa CL'),
(4, 4, 'corto', '200m Mariposa CC')
ON CONFLICT (distancia_id, estilo_id, curso) DO NOTHING;

-- Pruebas de Combinado Individual (estilo_id = 5)
INSERT INTO pruebas (distancia_id, estilo_id, curso, nombre) VALUES
(4, 5, 'largo', '200m Combinado CL'),
(4, 5, 'corto', '200m Combinado CC'),
(5, 5, 'largo', '400m Combinado CL'),
(5, 5, 'corto', '400m Combinado CC')
ON CONFLICT (distancia_id, estilo_id, curso) DO NOTHING;

-- =====================================================
-- VALIDATION: Verify table creation and data
-- =====================================================
DO $$
DECLARE
    v_table_exists BOOLEAN;
    v_pruebas_count INTEGER;
    v_tramos_check INTEGER;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pruebas'
    ) INTO v_table_exists;
    
    IF NOT v_table_exists THEN
        RAISE EXCEPTION 'Table pruebas was not created successfully';
    END IF;
    
    -- Count pruebas
    SELECT COUNT(*) INTO v_pruebas_count FROM pruebas;
    
    -- Verify automatic calculation worked
    SELECT COUNT(*) INTO v_tramos_check 
    FROM pruebas 
    WHERE tramos_totales IS NOT NULL 
    AND distancia_por_tramo IS NOT NULL;
    
    RAISE NOTICE 'PRUEBAS TABLE CREATION COMPLETED:';
    RAISE NOTICE '- Total pruebas created: %', v_pruebas_count;
    RAISE NOTICE '- Pruebas with calculated tramos: %', v_tramos_check;
    
    -- Example verification
    RAISE NOTICE 'Example calculations:';
    RAISE NOTICE '- 50m curso largo: 1 tramo de 50m';
    RAISE NOTICE '- 50m curso corto: 2 tramos de 25m';
    RAISE NOTICE '- 200m curso largo: 4 tramos de 50m';
    RAISE NOTICE '- 200m curso corto: 8 tramos de 25m';
    
    IF v_pruebas_count >= 36 AND v_tramos_check = v_pruebas_count THEN
        RAISE NOTICE 'Migration 005_create_pruebas_table.sql completed successfully!';
    ELSE
        RAISE WARNING 'Some pruebas might not have been created correctly. Please verify.';
    END IF;
END $$; 