-- Migration: 007_sync_functions.sql
-- Description: Create synchronization functions between registros and registros_completos
-- Created: 2025-06-29
-- Author: AquaLytics System

-- =====================================================
-- FUNCIONES DE SINCRONIZACIÓN PARA ESTRUCTURA HÍBRIDA
-- =====================================================
-- Estas funciones mantienen coherencia entre las tablas
-- registros (granular) y registros_completos (optimizada)

-- =====================================================
-- FUNCIÓN: calculate_completitud_porcentaje
-- =====================================================
-- Calcula el porcentaje de métricas completadas
CREATE OR REPLACE FUNCTION calculate_completitud_porcentaje(
    p_t15_1 NUMERIC,
    p_brz_1 NUMERIC, 
    p_t25_1 NUMERIC,
    p_f1 NUMERIC,
    p_t15_2 NUMERIC,
    p_brz_2 NUMERIC,
    p_t25_2 NUMERIC, 
    p_f2 NUMERIC,
    p_t_total NUMERIC,
    p_brz_total NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
    metricas_totales INTEGER := 10;
    metricas_completadas INTEGER := 0;
BEGIN
    -- Contar métricas no nulas
    IF p_t15_1 IS NOT NULL THEN metricas_completadas := metricas_completadas + 1; END IF;
    IF p_brz_1 IS NOT NULL THEN metricas_completadas := metricas_completadas + 1; END IF;
    IF p_t25_1 IS NOT NULL THEN metricas_completadas := metricas_completadas + 1; END IF;
    IF p_f1 IS NOT NULL THEN metricas_completadas := metricas_completadas + 1; END IF;
    IF p_t15_2 IS NOT NULL THEN metricas_completadas := metricas_completadas + 1; END IF;
    IF p_brz_2 IS NOT NULL THEN metricas_completadas := metricas_completadas + 1; END IF;
    IF p_t25_2 IS NOT NULL THEN metricas_completadas := metricas_completadas + 1; END IF;
    IF p_f2 IS NOT NULL THEN metricas_completadas := metricas_completadas + 1; END IF;
    IF p_t_total IS NOT NULL THEN metricas_completadas := metricas_completadas + 1; END IF;
    IF p_brz_total IS NOT NULL THEN metricas_completadas := metricas_completadas + 1; END IF;
    
    RETURN ROUND((metricas_completadas::NUMERIC / metricas_totales) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: sync_to_registros_completos
-- =====================================================
-- Agrupa registros individuales en un registro completo
CREATE OR REPLACE FUNCTION sync_to_registros_completos() RETURNS TRIGGER AS $$
DECLARE
    v_existing_record_id INTEGER;
    v_prueba_id INTEGER;
    v_t15_1 NUMERIC;
    v_brz_1 NUMERIC;
    v_t25_1 NUMERIC;
    v_f1 NUMERIC;
    v_t15_2 NUMERIC;
    v_brz_2 NUMERIC;
    v_t25_2 NUMERIC;
    v_f2 NUMERIC;
    v_t_total NUMERIC;
    v_brz_total NUMERIC;
    v_completitud NUMERIC;
    v_metricas_count INTEGER;
BEGIN
    -- Solo procesar si tenemos información completa del contexto
    IF NEW.id_nadador IS NULL OR NEW.fecha IS NULL OR 
       NEW.distancia_id IS NULL OR NEW.estilo_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Buscar prueba correspondiente
    SELECT id INTO v_prueba_id
    FROM pruebas
    WHERE distancia_id = NEW.distancia_id 
    AND estilo_id = NEW.estilo_id
    LIMIT 1;
    
    -- Si no encontramos la prueba, no podemos sincronizar
    IF v_prueba_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Verificar si ya existe un registro completo para este contexto
    SELECT id INTO v_existing_record_id
    FROM registros_completos
    WHERE id_nadador = NEW.id_nadador
    AND prueba_id = v_prueba_id
    AND fecha = NEW.fecha
    AND COALESCE(competencia_id, -1) = COALESCE(NEW.competencia_id, -1)
    AND COALESCE(fase_id, -1) = COALESCE(NEW.fase_id, -1);
    
    -- Obtener todas las métricas para este contexto
    SELECT 
        MAX(CASE WHEN p.nombre = 'T15_1' THEN r.valor END) AS t15_1,
        MAX(CASE WHEN p.nombre = 'BRZ_1' THEN r.valor END) AS brz_1,
        MAX(CASE WHEN p.nombre = 'T25_1' THEN r.valor END) AS t25_1,
        MAX(CASE WHEN p.nombre = 'F1' THEN r.valor END) AS f1,
        MAX(CASE WHEN p.nombre = 'T15_2' THEN r.valor END) AS t15_2,
        MAX(CASE WHEN p.nombre = 'BRZ_2' THEN r.valor END) AS brz_2,
        MAX(CASE WHEN p.nombre = 'T25_2' THEN r.valor END) AS t25_2,
        MAX(CASE WHEN p.nombre = 'F2' THEN r.valor END) AS f2,
        MAX(CASE WHEN p.nombre = 'T_TOTAL' THEN r.valor END) AS t_total,
        MAX(CASE WHEN p.nombre = 'BRZ_TOTAL' THEN r.valor END) AS brz_total
    INTO v_t15_1, v_brz_1, v_t25_1, v_f1, v_t15_2, v_brz_2, v_t25_2, v_f2, v_t_total, v_brz_total
    FROM registros r
    JOIN parametros p ON r.parametro_id = p.parametro_id
    WHERE r.id_nadador = NEW.id_nadador
    AND r.fecha = NEW.fecha
    AND r.distancia_id = NEW.distancia_id
    AND r.estilo_id = NEW.estilo_id
    AND COALESCE(r.competencia_id, -1) = COALESCE(NEW.competencia_id, -1)
    AND COALESCE(r.fase_id, -1) = COALESCE(NEW.fase_id, -1);
    
    -- Calcular completitud y número de métricas
    v_completitud := calculate_completitud_porcentaje(
        v_t15_1, v_brz_1, v_t25_1, v_f1, v_t15_2, 
        v_brz_2, v_t25_2, v_f2, v_t_total, v_brz_total
    );
    
    v_metricas_count := (
        CASE WHEN v_t15_1 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN v_brz_1 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN v_t25_1 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN v_f1 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN v_t15_2 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN v_brz_2 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN v_t25_2 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN v_f2 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN v_t_total IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN v_brz_total IS NOT NULL THEN 1 ELSE 0 END
    );
    
    -- Solo sincronizar si tenemos al menos una métrica
    IF v_metricas_count = 0 THEN
        RETURN NEW;
    END IF;
    
    IF v_existing_record_id IS NULL THEN
        -- Crear nuevo registro completo
        INSERT INTO registros_completos (
            id_nadador, prueba_id, competencia_id, fecha, fase_id,
            t15_1, brz_1, t25_1, f1, t15_2, brz_2, t25_2, f2, t_total, brz_total,
            completitud_porcentaje, metricas_registradas, metodo_registro
        ) VALUES (
            NEW.id_nadador, v_prueba_id, NEW.competencia_id, NEW.fecha, NEW.fase_id,
            v_t15_1, v_brz_1, v_t25_1, v_f1, v_t15_2, v_brz_2, v_t25_2, v_f2, v_t_total, v_brz_total,
            v_completitud, v_metricas_count, 'manual'
        );
    ELSE
        -- Actualizar registro completo existente
        UPDATE registros_completos
        SET t15_1 = v_t15_1,
            brz_1 = v_brz_1,
            t25_1 = v_t25_1,
            f1 = v_f1,
            t15_2 = v_t15_2,
            brz_2 = v_brz_2,
            t25_2 = v_t25_2,
            f2 = v_f2,
            t_total = v_t_total,
            brz_total = v_brz_total,
            completitud_porcentaje = v_completitud,
            metricas_registradas = v_metricas_count,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_existing_record_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: sync_from_registros_completos
-- =====================================================
-- Crea/actualiza registros individuales desde un registro completo
CREATE OR REPLACE FUNCTION sync_from_registros_completos() RETURNS TRIGGER AS $$
DECLARE
    v_parametro_id INTEGER;
    v_sync_flag BOOLEAN;
BEGIN
    -- Verificar flag para evitar loops infinitos
    v_sync_flag := current_setting('app.sync_in_progress', true)::BOOLEAN;
    IF v_sync_flag IS NOT NULL AND v_sync_flag = TRUE THEN
        RETURN NEW;
    END IF;
    
    -- Establecer flag de sincronización
    PERFORM set_config('app.sync_in_progress', 'true', true);
    
    -- Obtener distancia_id y estilo_id desde la prueba
    DECLARE
        v_distancia_id INTEGER;
        v_estilo_id INTEGER;
    BEGIN
        SELECT distancia_id, estilo_id 
        INTO v_distancia_id, v_estilo_id
        FROM pruebas 
        WHERE id = NEW.prueba_id;
        
        -- Sincronizar cada métrica manual
        -- T15_1
        IF NEW.t15_1 IS NOT NULL THEN
            SELECT parametro_id INTO v_parametro_id FROM parametros WHERE nombre = 'T15_1';
            INSERT INTO registros (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento, valor)
            VALUES (NEW.id_nadador, NEW.fecha, NEW.competencia_id, NEW.fase_id, v_distancia_id, v_estilo_id, v_parametro_id, 1, NEW.t15_1)
            ON CONFLICT (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento)
            DO UPDATE SET valor = EXCLUDED.valor;
        END IF;
        
        -- BRZ_1
        IF NEW.brz_1 IS NOT NULL THEN
            SELECT parametro_id INTO v_parametro_id FROM parametros WHERE nombre = 'BRZ_1';
            INSERT INTO registros (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento, valor)
            VALUES (NEW.id_nadador, NEW.fecha, NEW.competencia_id, NEW.fase_id, v_distancia_id, v_estilo_id, v_parametro_id, 1, NEW.brz_1)
            ON CONFLICT (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento)
            DO UPDATE SET valor = EXCLUDED.valor;
        END IF;
        
        -- T25_1
        IF NEW.t25_1 IS NOT NULL THEN
            SELECT parametro_id INTO v_parametro_id FROM parametros WHERE nombre = 'T25_1';
            INSERT INTO registros (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento, valor)
            VALUES (NEW.id_nadador, NEW.fecha, NEW.competencia_id, NEW.fase_id, v_distancia_id, v_estilo_id, v_parametro_id, 1, NEW.t25_1)
            ON CONFLICT (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento)
            DO UPDATE SET valor = EXCLUDED.valor;
        END IF;
        
        -- F1
        IF NEW.f1 IS NOT NULL THEN
            SELECT parametro_id INTO v_parametro_id FROM parametros WHERE nombre = 'F1';
            INSERT INTO registros (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento, valor)
            VALUES (NEW.id_nadador, NEW.fecha, NEW.competencia_id, NEW.fase_id, v_distancia_id, v_estilo_id, v_parametro_id, 1, NEW.f1)
            ON CONFLICT (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento)
            DO UPDATE SET valor = EXCLUDED.valor;
        END IF;
        
        -- T15_2
        IF NEW.t15_2 IS NOT NULL THEN
            SELECT parametro_id INTO v_parametro_id FROM parametros WHERE nombre = 'T15_2';
            INSERT INTO registros (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento, valor)
            VALUES (NEW.id_nadador, NEW.fecha, NEW.competencia_id, NEW.fase_id, v_distancia_id, v_estilo_id, v_parametro_id, 2, NEW.t15_2)
            ON CONFLICT (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento)
            DO UPDATE SET valor = EXCLUDED.valor;
        END IF;
        
        -- BRZ_2
        IF NEW.brz_2 IS NOT NULL THEN
            SELECT parametro_id INTO v_parametro_id FROM parametros WHERE nombre = 'BRZ_2';
            INSERT INTO registros (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento, valor)
            VALUES (NEW.id_nadador, NEW.fecha, NEW.competencia_id, NEW.fase_id, v_distancia_id, v_estilo_id, v_parametro_id, 2, NEW.brz_2)
            ON CONFLICT (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento)
            DO UPDATE SET valor = EXCLUDED.valor;
        END IF;
        
        -- T25_2
        IF NEW.t25_2 IS NOT NULL THEN
            SELECT parametro_id INTO v_parametro_id FROM parametros WHERE nombre = 'T25_2';
            INSERT INTO registros (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento, valor)
            VALUES (NEW.id_nadador, NEW.fecha, NEW.competencia_id, NEW.fase_id, v_distancia_id, v_estilo_id, v_parametro_id, 2, NEW.t25_2)
            ON CONFLICT (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento)
            DO UPDATE SET valor = EXCLUDED.valor;
        END IF;
        
        -- F2
        IF NEW.f2 IS NOT NULL THEN
            SELECT parametro_id INTO v_parametro_id FROM parametros WHERE nombre = 'F2';
            INSERT INTO registros (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento, valor)
            VALUES (NEW.id_nadador, NEW.fecha, NEW.competencia_id, NEW.fase_id, v_distancia_id, v_estilo_id, v_parametro_id, 2, NEW.f2)
            ON CONFLICT (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento)
            DO UPDATE SET valor = EXCLUDED.valor;
        END IF;
        
        -- T_TOTAL
        IF NEW.t_total IS NOT NULL THEN
            SELECT parametro_id INTO v_parametro_id FROM parametros WHERE nombre = 'T_TOTAL';
            INSERT INTO registros (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento, valor)
            VALUES (NEW.id_nadador, NEW.fecha, NEW.competencia_id, NEW.fase_id, v_distancia_id, v_estilo_id, v_parametro_id, 0, NEW.t_total)
            ON CONFLICT (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento)
            DO UPDATE SET valor = EXCLUDED.valor;
        END IF;
        
        -- BRZ_TOTAL
        IF NEW.brz_total IS NOT NULL THEN
            SELECT parametro_id INTO v_parametro_id FROM parametros WHERE nombre = 'BRZ_TOTAL';
            INSERT INTO registros (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento, valor)
            VALUES (NEW.id_nadador, NEW.fecha, NEW.competencia_id, NEW.fase_id, v_distancia_id, v_estilo_id, v_parametro_id, 0, NEW.brz_total)
            ON CONFLICT (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento)
            DO UPDATE SET valor = EXCLUDED.valor;
        END IF;
    END;
    
    -- Limpiar flag de sincronización
    PERFORM set_config('app.sync_in_progress', 'false', true);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CONSTRAINTS ÚNICOS PARA EVITAR DUPLICADOS
-- =====================================================
-- Necesitamos un constraint único en registros para el conflict resolution
ALTER TABLE registros 
ADD CONSTRAINT unique_registro_context 
UNIQUE (id_nadador, fecha, competencia_id, fase_id, distancia_id, estilo_id, parametro_id, segmento);

-- =====================================================
-- TRIGGERS PARA SINCRONIZACIÓN AUTOMÁTICA
-- =====================================================

-- Trigger para sincronizar desde registros a registros_completos
CREATE TRIGGER trigger_sync_to_registros_completos
    AFTER INSERT OR UPDATE ON registros
    FOR EACH ROW
    EXECUTE FUNCTION sync_to_registros_completos();

-- Trigger para sincronizar desde registros_completos a registros
CREATE TRIGGER trigger_sync_from_registros_completos
    AFTER INSERT OR UPDATE ON registros_completos
    FOR EACH ROW
    EXECUTE FUNCTION sync_from_registros_completos();

-- =====================================================
-- FUNCIÓN HELPER: Actualizar completitud después de cada cambio
-- =====================================================
CREATE OR REPLACE FUNCTION update_completitud_registros_completos() RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar completitud y número de métricas
    NEW.completitud_porcentaje := calculate_completitud_porcentaje(
        NEW.t15_1, NEW.brz_1, NEW.t25_1, NEW.f1, NEW.t15_2,
        NEW.brz_2, NEW.t25_2, NEW.f2, NEW.t_total, NEW.brz_total
    );
    
    NEW.metricas_registradas := (
        CASE WHEN NEW.t15_1 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN NEW.brz_1 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN NEW.t25_1 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN NEW.f1 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN NEW.t15_2 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN NEW.brz_2 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN NEW.t25_2 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN NEW.f2 IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN NEW.t_total IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN NEW.brz_total IS NOT NULL THEN 1 ELSE 0 END
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar completitud antes de insertar/actualizar
CREATE TRIGGER trigger_update_completitud
    BEFORE INSERT OR UPDATE ON registros_completos
    FOR EACH ROW
    EXECUTE FUNCTION update_completitud_registros_completos();

-- =====================================================
-- COMMIT Y NOTIFICACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Migration 007_sync_functions.sql completed successfully!';
    RAISE NOTICE 'Synchronization functions and triggers created.';
    RAISE NOTICE 'Bidirectional sync between registros and registros_completos is now active.';
END $$; 