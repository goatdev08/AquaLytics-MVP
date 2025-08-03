-- Migration: 006_add_missing_automatic_metrics.sql
-- Description: Adds missing automatic metrics for complete integration with Python backend calculations.
BEGIN;

-- Insertar las métricas automáticas faltantes para completar las 6 métricas del backend Python
INSERT INTO public.metricas (nombre, tipo, global) VALUES
    ('V1', 'A', false),  -- Velocidad primer segmento (m/s)
    ('V2', 'A', false),  -- Velocidad segundo segmento (m/s)
    ('F promedio', 'A', true)  -- Promedio de flecha (metros)
ON CONFLICT (nombre) DO NOTHING;

COMMIT; 