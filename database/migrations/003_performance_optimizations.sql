-- Migration: 003_performance_optimizations.sql
-- Description: Advanced performance optimizations for AquaLytics
-- Created: 2024-12-24
-- Author: AquaLytics System

-- =====================================================
-- ADVANCED PERFORMANCE OPTIMIZATIONS
-- =====================================================

-- =====================================================
-- ADDITIONAL INDEXES FOR SPECIFIC QUERY PATTERNS
-- =====================================================

-- Index for metrics analysis by date range
CREATE INDEX IF NOT EXISTS idx_registros_fecha_parametro_valor 
ON registros(fecha DESC, parametro_id, valor) 
WHERE valor IS NOT NULL;

-- Index for swimmer performance trends
CREATE INDEX IF NOT EXISTS idx_registros_nadador_parametro_fecha 
ON registros(id_nadador, parametro_id, fecha DESC, valor);

-- Index for competition analytics
CREATE INDEX IF NOT EXISTS idx_registros_competencia_distancia_estilo 
ON registros(competencia_id, distancia_id, estilo_id, fase_id);

-- Partial index for automatic metrics only
CREATE INDEX IF NOT EXISTS idx_registros_automaticos 
ON registros(parametro_id, id_nadador, fecha DESC) 
WHERE parametro_id IN (3, 6, 8, 9, 11, 14, 16);

-- Partial index for manual metrics only  
CREATE INDEX IF NOT EXISTS idx_registros_manuales 
ON registros(parametro_id, id_nadador, fecha DESC) 
WHERE parametro_id IN (1, 2, 4, 5, 7, 10, 12, 13, 15);

-- Index for segmented metrics queries
CREATE INDEX IF NOT EXISTS idx_registros_segmento_valor 
ON registros(id_nadador, distancia_id, estilo_id, segmento, parametro_id, valor) 
WHERE segmento IS NOT NULL;

-- =====================================================
-- COVERING INDEXES FOR FREQUENT QUERIES
-- =====================================================

-- Covering index for swimmer dashboard queries
CREATE INDEX IF NOT EXISTS idx_registros_dashboard_cover 
ON registros(id_nadador, fecha DESC) 
INCLUDE (competencia_id, distancia_id, estilo_id, parametro_id, valor);

-- Covering index for competition rankings
CREATE INDEX IF NOT EXISTS idx_registros_ranking_cover 
ON registros(competencia_id, distancia_id, estilo_id, parametro_id) 
INCLUDE (id_nadador, valor, fecha);

-- =====================================================
-- EXPRESSION INDEXES FOR CALCULATED FIELDS
-- =====================================================

-- Index for time-based calculations (months)
CREATE INDEX IF NOT EXISTS idx_registros_year_month 
ON registros(EXTRACT(YEAR FROM fecha), EXTRACT(MONTH FROM fecha));

-- Index for performance comparisons (value ranges)
CREATE INDEX IF NOT EXISTS idx_registros_valor_ranges 
ON registros(parametro_id, 
  CASE 
    WHEN valor < 1 THEN 'low'
    WHEN valor < 10 THEN 'medium' 
    ELSE 'high'
  END);

-- =====================================================
-- FUNCTIONAL INDEXES FOR TEXT SEARCHES
-- =====================================================

-- Gin index for nadador name searches (case insensitive)
CREATE INDEX IF NOT EXISTS idx_nadadores_nombre_gin 
ON nadadores USING gin(to_tsvector('spanish', nombre));

-- Index for competition name searches
CREATE INDEX IF NOT EXISTS idx_competencias_nombre_gin 
ON competencias USING gin(to_tsvector('spanish', competencia));

-- =====================================================
-- HASH INDEXES FOR EXACT MATCHES
-- =====================================================

-- Hash indexes for foreign key lookups (faster than btree for exact matches)
CREATE INDEX IF NOT EXISTS idx_registros_nadador_hash 
ON registros USING hash(id_nadador);

CREATE INDEX IF NOT EXISTS idx_registros_parametro_hash 
ON registros USING hash(parametro_id);

-- =====================================================
-- CLUSTER OPTIMIZATION
-- =====================================================

-- Cluster the main table by most frequent access pattern
-- This physically reorganizes data for better cache performance
CLUSTER registros USING idx_registros_nadador_fecha;

-- =====================================================
-- TABLE-LEVEL OPTIMIZATIONS
-- =====================================================

-- Set fillfactor for tables with frequent updates
ALTER TABLE registros SET (fillfactor = 90);
ALTER TABLE nadadores SET (fillfactor = 95);

-- Enable automatic statistics collection
ALTER TABLE registros SET (autovacuum_analyze_scale_factor = 0.05);
ALTER TABLE registros SET (autovacuum_vacuum_scale_factor = 0.1);

-- =====================================================
-- MATERIALIZED VIEWS FOR COMPLEX ANALYTICS
-- =====================================================

-- Materialized view for swimmer performance summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_swimmer_performance_summary AS
SELECT 
    n.id_nadador,
    n.nombre,
    COUNT(DISTINCT r.competencia_id) as total_competencias,
    COUNT(DISTINCT r.distancia_id) as total_distancias,
    COUNT(DISTINCT r.estilo_id) as total_estilos,
    MIN(r.fecha) as primera_competencia,
    MAX(r.fecha) as ultima_competencia,
    COUNT(r.registro_id) as total_registros,
    AVG(CASE WHEN p.parametro = 'T TOTAL' THEN r.valor END) as tiempo_promedio,
    AVG(CASE WHEN p.parametro = 'V promedio' THEN r.valor END) as velocidad_promedio
FROM nadadores n
LEFT JOIN registros r ON n.id_nadador = r.id_nadador
LEFT JOIN parametros p ON r.parametro_id = p.parametro_id
GROUP BY n.id_nadador, n.nombre;

-- Index on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_swimmer_performance_nadador 
ON mv_swimmer_performance_summary(id_nadador);

-- Materialized view for competition statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_competition_stats AS
SELECT 
    c.competencia_id,
    c.competencia,
    COUNT(DISTINCT r.id_nadador) as total_nadadores,
    COUNT(DISTINCT CONCAT(r.distancia_id, '-', r.estilo_id)) as total_pruebas,
    COUNT(r.registro_id) as total_registros,
    MIN(r.fecha) as fecha_inicio,
    MAX(r.fecha) as fecha_fin,
    AVG(CASE WHEN p.parametro = 'T TOTAL' THEN r.valor END) as tiempo_promedio_general
FROM competencias c
LEFT JOIN registros r ON c.competencia_id = r.competencia_id
LEFT JOIN parametros p ON r.parametro_id = p.parametro_id
GROUP BY c.competencia_id, c.competencia;

-- Index on competition stats
CREATE INDEX IF NOT EXISTS idx_mv_competition_stats_competencia 
ON mv_competition_stats(competencia_id);

-- =====================================================
-- QUERY PERFORMANCE FUNCTIONS
-- =====================================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_performance_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_swimmer_performance_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_competition_stats;
    
    -- Update table statistics
    ANALYZE registros;
    ANALYZE nadadores;
    ANALYZE competencias;
    
    RAISE NOTICE 'Performance views and statistics refreshed successfully';
END;
$$ LANGUAGE plpgsql;

-- Function to get query performance metrics
CREATE OR REPLACE FUNCTION get_table_stats()
RETURNS TABLE(
    table_name TEXT,
    total_rows BIGINT,
    total_size TEXT,
    index_size TEXT,
    index_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        t.n_tup_ins - t.n_tup_del as total_rows,
        pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename)) as total_size,
        pg_size_pretty(pg_indexes_size(t.schemaname||'.'||t.tablename)) as index_size,
        (SELECT COUNT(*)::INTEGER 
         FROM pg_indexes 
         WHERE tablename = t.tablename AND schemaname = t.schemaname) as index_count
    FROM pg_stat_user_tables t
    WHERE t.schemaname = 'public'
    ORDER BY pg_total_relation_size(t.schemaname||'.'||t.tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- AUTOMATIC MAINTENANCE
-- =====================================================

-- Schedule automatic refresh of materialized views (pseudo-cron)
-- Note: In production, use pg_cron extension or external scheduler

CREATE OR REPLACE FUNCTION schedule_maintenance()
RETURNS void AS $$
BEGIN
    -- This would need to be called periodically by an external scheduler
    -- or pg_cron extension in production
    
    PERFORM refresh_performance_views();
    
    -- Cleanup old temporary data if any
    -- VACUUM ANALYZE registros;
    
    RAISE NOTICE 'Scheduled maintenance completed';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERFORMANCE MONITORING
-- =====================================================

-- View for monitoring slow queries
CREATE OR REPLACE VIEW v_performance_monitor AS
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    ROUND((100.0 * idx_scan / NULLIF(seq_scan + idx_scan, 0))::numeric, 2) as index_usage_percent
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY seq_scan DESC;

-- =====================================================
-- VALIDATION AND REPORTING
-- =====================================================

-- Report performance optimization results
DO $$
DECLARE
    index_count INTEGER;
    mv_count INTEGER;
    function_count INTEGER;
BEGIN
    -- Count created indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    -- Count materialized views
    SELECT COUNT(*) INTO mv_count
    FROM pg_matviews 
    WHERE schemaname = 'public';
    
    -- Count performance functions
    SELECT COUNT(*) INTO function_count
    FROM pg_proc 
    WHERE proname IN ('refresh_performance_views', 'get_table_stats', 'schedule_maintenance');
    
    RAISE NOTICE 'PERFORMANCE OPTIMIZATION COMPLETED:';
    RAISE NOTICE '- Total Indexes: %', index_count;
    RAISE NOTICE '- Materialized Views: %', mv_count;
    RAISE NOTICE '- Performance Functions: %', function_count;
    RAISE NOTICE '- Table Clustering: Applied to registros';
    RAISE NOTICE '- Auto-vacuum: Optimized for registros table';
    
    IF index_count >= 15 AND mv_count >= 2 AND function_count >= 3 THEN
        RAISE NOTICE 'Migration 003_performance_optimizations.sql completed successfully!';
    ELSE
        RAISE WARNING 'Some performance optimizations may not have been applied correctly.';
    END IF;
END $$; 