-- Migration: 005_create_pivot_function.sql
-- Description: Creates a function to pivot 'registros' data into a complete test record.
BEGIN;

CREATE OR REPLACE FUNCTION get_complete_test_record(p_prueba_id INT, p_nadador_id INT, p_fecha DATE)
RETURNS jsonb AS $$
DECLARE
    record_data jsonb;
    manual_metrics jsonb;
    auto_metrics jsonb := '{}'::jsonb;
    v_tiempo_total NUMERIC;
    v_brazadas_totales NUMERIC;
    v_distancia NUMERIC;
    v_flechas_sum NUMERIC;
BEGIN
    SELECT d.distancia INTO v_distancia
    FROM pruebas p
    JOIN distancias d ON p.distancia_id = d.distancia_id
    WHERE p.id = p_prueba_id;

    SELECT 
        jsonb_object_agg(m.nombre, r.valor),
        MAX(CASE WHEN m.nombre = 'Tiempo Total' THEN r.valor END),
        MAX(CASE WHEN m.nombre = 'Brazadas Totales' THEN r.valor END),
        SUM(CASE WHEN m.nombre = 'Flecha por Tramo' THEN r.valor END)
    INTO 
        manual_metrics, v_tiempo_total, v_brazadas_totales, v_flechas_sum
    FROM registros r
    JOIN metricas m ON r.metrica_id = m.metrica_id
    WHERE r.prueba_id = p_prueba_id AND r.id_nadador = p_nadador_id AND r.fecha = p_fecha AND m.tipo = 'M';

    IF v_tiempo_total > 0 AND v_distancia > 0 THEN
        auto_metrics := auto_metrics || jsonb_build_object('Velocidad Promedio', v_distancia / v_tiempo_total);
    END IF;
    IF v_brazadas_totales > 0 AND v_distancia > 0 THEN
        auto_metrics := auto_metrics || jsonb_build_object('Distancia por Brazada', v_distancia / v_brazadas_totales);
    END IF;
    IF v_flechas_sum IS NOT NULL AND v_distancia > 0 THEN
        auto_metrics := auto_metrics || jsonb_build_object('Distancia sin Flecha', v_distancia - v_flechas_sum);
    END IF;

    SELECT jsonb_build_object(
        'prueba_id', p_prueba_id,
        'nadador_id', p_nadador_id,
        'fecha', p_fecha,
        'manual_metrics', manual_metrics,
        'auto_metrics', auto_metrics
    )
    INTO record_data;
    
    RETURN record_data;
END;
$$ LANGUAGE plpgsql;

COMMIT; 