-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for AquaLytics Phoenixdb
-- Created: 2024-12-24
-- Author: AquaLytics System

-- =====================================================
-- INITIAL SCHEMA SETUP FOR AQUALYTICS PHOENIXDB
-- =====================================================

-- Enable UUID extension (if needed for future)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: nadadores (Swimmers)
-- =====================================================
CREATE TABLE IF NOT EXISTS nadadores (
    id_nadador SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    edad SMALLINT CHECK (edad > 0 AND edad < 100),
    peso SMALLINT CHECK (peso > 0 AND peso < 200)
);

-- Add comments for documentation
COMMENT ON TABLE nadadores IS 'Tabla de nadadores registrados en el sistema';
COMMENT ON COLUMN nadadores.id_nadador IS 'Identificador único del nadador';
COMMENT ON COLUMN nadadores.nombre IS 'Nombre completo del nadador';
COMMENT ON COLUMN nadadores.edad IS 'Edad del nadador en años (opcional)';
COMMENT ON COLUMN nadadores.peso IS 'Peso del nadador en kilogramos (opcional)';

-- =====================================================
-- TABLE: competencias (Competitions)
-- =====================================================
CREATE TABLE IF NOT EXISTS competencias (
    competencia_id SERIAL PRIMARY KEY,
    competencia VARCHAR(255) NOT NULL,
    periodo DATERANGE
);

-- Add comments
COMMENT ON TABLE competencias IS 'Tabla de competencias y eventos deportivos';
COMMENT ON COLUMN competencias.competencia_id IS 'Identificador único de la competencia';
COMMENT ON COLUMN competencias.competencia IS 'Nombre de la competencia o evento';
COMMENT ON COLUMN competencias.periodo IS 'Rango de fechas de la competencia';

-- =====================================================
-- TABLE: distancias (Distances)
-- =====================================================
CREATE TABLE IF NOT EXISTS distancias (
    distancia_id SERIAL PRIMARY KEY,
    distancia INTEGER NOT NULL UNIQUE
);

-- Add comments
COMMENT ON TABLE distancias IS 'Tabla de distancias de natación disponibles';
COMMENT ON COLUMN distancias.distancia_id IS 'Identificador único de la distancia';
COMMENT ON COLUMN distancias.distancia IS 'Distancia en metros (25, 50, 100, 200, 400, 800, 1500)';

-- =====================================================
-- TABLE: estilos (Swimming Strokes)
-- =====================================================
CREATE TABLE IF NOT EXISTS estilos (
    estilo_id SERIAL PRIMARY KEY,
    estilo VARCHAR(50) NOT NULL UNIQUE
);

-- Add comments
COMMENT ON TABLE estilos IS 'Tabla de estilos de natación';
COMMENT ON COLUMN estilos.estilo_id IS 'Identificador único del estilo';
COMMENT ON COLUMN estilos.estilo IS 'Nombre del estilo (Crol, Dorso, Pecho, Mariposa, Combinado)';

-- =====================================================
-- TABLE: fases (Competition Phases)
-- =====================================================
CREATE TABLE IF NOT EXISTS fases (
    fase_id SERIAL PRIMARY KEY,
    fase VARCHAR(50) NOT NULL UNIQUE
);

-- Add comments
COMMENT ON TABLE fases IS 'Tabla de fases de competencia';
COMMENT ON COLUMN fases.fase_id IS 'Identificador único de la fase';
COMMENT ON COLUMN fases.fase IS 'Nombre de la fase (PRELIMINAR, SEMIFINAL, FINAL)';

-- =====================================================
-- TABLE: parametros (Metrics Parameters)
-- =====================================================
CREATE TABLE IF NOT EXISTS parametros (
    parametro_id SERIAL PRIMARY KEY,
    parametro VARCHAR(100) NOT NULL,
    tipo CHAR(1) NOT NULL CHECK (tipo IN ('M', 'A')),
    global BOOLEAN DEFAULT FALSE
);

-- Add comments
COMMENT ON TABLE parametros IS 'Tabla de parámetros y métricas de natación';
COMMENT ON COLUMN parametros.parametro_id IS 'Identificador único del parámetro';
COMMENT ON COLUMN parametros.parametro IS 'Nombre del parámetro o métrica';
COMMENT ON COLUMN parametros.tipo IS 'Tipo de parámetro: M=Manual, A=Automático';
COMMENT ON COLUMN parametros.global IS 'Indica si la métrica es global (true) o por segmento (false)';

-- =====================================================
-- TABLE: registros (Records - Main Data Table)
-- =====================================================
CREATE TABLE IF NOT EXISTS registros (
    registro_id BIGSERIAL PRIMARY KEY,
    competencia_id INTEGER REFERENCES competencias(competencia_id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    id_nadador INTEGER REFERENCES nadadores(id_nadador) ON DELETE CASCADE,
    distancia_id INTEGER REFERENCES distancias(distancia_id) ON DELETE RESTRICT,
    estilo_id INTEGER REFERENCES estilos(estilo_id) ON DELETE RESTRICT,
    fase_id INTEGER REFERENCES fases(fase_id) ON DELETE RESTRICT,
    parametro_id INTEGER REFERENCES parametros(parametro_id) ON DELETE RESTRICT,
    segmento INTEGER CHECK (segmento > 0),
    valor NUMERIC(10,3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE registros IS 'Tabla principal de registros de métricas por nadador';
COMMENT ON COLUMN registros.registro_id IS 'Identificador único del registro';
COMMENT ON COLUMN registros.competencia_id IS 'Referencia a la competencia';
COMMENT ON COLUMN registros.fecha IS 'Fecha del registro';
COMMENT ON COLUMN registros.id_nadador IS 'Referencia al nadador';
COMMENT ON COLUMN registros.distancia_id IS 'Referencia a la distancia nadada';
COMMENT ON COLUMN registros.estilo_id IS 'Referencia al estilo de natación';
COMMENT ON COLUMN registros.fase_id IS 'Referencia a la fase de competencia';
COMMENT ON COLUMN registros.parametro_id IS 'Referencia al parámetro medido';
COMMENT ON COLUMN registros.segmento IS 'Número de segmento (1=primer 25m, 2=segundo 25m, NULL=global)';
COMMENT ON COLUMN registros.valor IS 'Valor numérico de la métrica';
COMMENT ON COLUMN registros.created_at IS 'Timestamp de creación del registro';
COMMENT ON COLUMN registros.updated_at IS 'Timestamp de última actualización';

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Primary query patterns indexes
CREATE INDEX IF NOT EXISTS idx_registros_nadador_fecha ON registros(id_nadador, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_registros_competencia ON registros(competencia_id);
CREATE INDEX IF NOT EXISTS idx_registros_parametro_tipo ON registros(parametro_id);
CREATE INDEX IF NOT EXISTS idx_registros_distancia_estilo ON registros(distancia_id, estilo_id);
CREATE INDEX IF NOT EXISTS idx_registros_fecha ON registros(fecha DESC);

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_registros_nadador_competencia_distancia 
ON registros(id_nadador, competencia_id, distancia_id, estilo_id, fase_id);

-- Index for automatic calculations
CREATE INDEX IF NOT EXISTS idx_registros_calculo 
ON registros(id_nadador, competencia_id, distancia_id, estilo_id, fase_id, parametro_id, segmento);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_registros_updated_at 
    BEFORE UPDATE ON registros 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for complete records with all related data
CREATE OR REPLACE VIEW vista_registros_completos AS
SELECT 
    r.registro_id,
    r.fecha,
    r.segmento,
    r.valor,
    r.created_at,
    r.updated_at,
    n.id_nadador,
    n.nombre as nadador_nombre,
    n.edad as nadador_edad,
    n.peso as nadador_peso,
    c.competencia_id,
    c.competencia as competencia_nombre,
    c.periodo as competencia_periodo,
    d.distancia_id,
    d.distancia,
    e.estilo_id,
    e.estilo,
    f.fase_id,
    f.fase,
    p.parametro_id,
    p.parametro,
    p.tipo as parametro_tipo,
    p.global as parametro_global
FROM registros r
LEFT JOIN nadadores n ON r.id_nadador = n.id_nadador
LEFT JOIN competencias c ON r.competencia_id = c.competencia_id
LEFT JOIN distancias d ON r.distancia_id = d.distancia_id
LEFT JOIN estilos e ON r.estilo_id = e.estilo_id
LEFT JOIN fases f ON r.fase_id = f.fase_id
LEFT JOIN parametros p ON r.parametro_id = p.parametro_id;

COMMENT ON VIEW vista_registros_completos IS 'Vista completa de registros con todas las relaciones';

-- =====================================================
-- SECURITY SETUP (Basic)
-- =====================================================

-- Enable Row Level Security (will be configured in later migration)
ALTER TABLE nadadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FINAL VALIDATION
-- =====================================================

-- Verify all tables were created successfully
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('nadadores', 'competencias', 'distancias', 'estilos', 'fases', 'parametros', 'registros');
    
    IF table_count = 7 THEN
        RAISE NOTICE 'Migration 001_initial_schema.sql completed successfully. All % tables created.', table_count;
    ELSE
        RAISE EXCEPTION 'Migration failed. Expected 7 tables, found %', table_count;
    END IF;
END $$; 