-- =====================================================
-- BACKUP COMPLETO DEL ESQUEMA ACTUAL
-- Fecha: 2024-01-21
-- Propósito: Preservar estructura antes de implementar enfoque híbrido
-- =====================================================

-- Instrucciones para ejecutar este backup:
-- 1. Desde Supabase Dashboard > SQL Editor
-- 2. O desde psql: \i backup-current-schema.sql

-- =====================================================
-- BACKUP SCHEMA STRUCTURE
-- =====================================================

-- Crear schema de backup para preservar estructura actual
CREATE SCHEMA IF NOT EXISTS backup_esquema_original;

-- =====================================================
-- 1. BACKUP DE TABLAS PRINCIPALES
-- =====================================================

-- Backup tabla nadadores
CREATE TABLE backup_esquema_original.nadadores AS 
SELECT * FROM public.nadadores;

-- Backup tabla competencias  
CREATE TABLE backup_esquema_original.competencias AS 
SELECT * FROM public.competencias;

-- Backup tabla distancias
CREATE TABLE backup_esquema_original.distancias AS 
SELECT * FROM public.distancias;

-- Backup tabla estilos
CREATE TABLE backup_esquema_original.estilos AS 
SELECT * FROM public.estilos;

-- Backup tabla fases
CREATE TABLE backup_esquema_original.fases AS 
SELECT * FROM public.fases;

-- Backup tabla parametros
CREATE TABLE backup_esquema_original.parametros AS 
SELECT * FROM public.parametros;

-- Backup tabla registros (DATOS IMPORTANTES)
CREATE TABLE backup_esquema_original.registros AS 
SELECT * FROM public.registros;

-- =====================================================
-- 2. BACKUP DE VISTAS
-- =====================================================

-- Recrear vista original en backup
CREATE OR REPLACE VIEW backup_esquema_original.vista_registros_completos AS
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
FROM backup_esquema_original.registros r
LEFT JOIN backup_esquema_original.nadadores n ON r.id_nadador = n.id_nadador
LEFT JOIN backup_esquema_original.competencias c ON r.competencia_id = c.competencia_id
LEFT JOIN backup_esquema_original.distancias d ON r.distancia_id = d.distancia_id
LEFT JOIN backup_esquema_original.estilos e ON r.estilo_id = e.estilo_id
LEFT JOIN backup_esquema_original.fases f ON r.fase_id = f.fase_id
LEFT JOIN backup_esquema_original.parametros p ON r.parametro_id = p.parametro_id;

-- =====================================================
-- 3. BACKUP DE ÍNDICES (ESTRUCTURA)
-- =====================================================

-- Guardar información de índices existentes
CREATE TABLE backup_esquema_original.indices_originales AS
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('nadadores', 'competencias', 'distancias', 'estilos', 'fases', 'parametros', 'registros');

-- =====================================================
-- 4. BACKUP DE TRIGGERS Y FUNCIONES
-- =====================================================

-- Guardar definiciones de triggers
CREATE TABLE backup_esquema_original.triggers_originales AS
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_schema = 'public';

-- =====================================================
-- 5. METADATOS DEL BACKUP
-- =====================================================

CREATE TABLE backup_esquema_original.metadata_backup (
    fecha_backup TIMESTAMP DEFAULT NOW(),
    version_app VARCHAR(50) DEFAULT 'MVP-v1.0',
    total_registros INTEGER,
    total_nadadores INTEGER,
    total_competencias INTEGER,
    descripcion TEXT
);

-- Insertar metadatos
INSERT INTO backup_esquema_original.metadata_backup (
    total_registros,
    total_nadadores, 
    total_competencias,
    descripcion
) VALUES (
    (SELECT COUNT(*) FROM public.registros),
    (SELECT COUNT(*) FROM public.nadadores),
    (SELECT COUNT(*) FROM public.competencias),
    'Backup completo antes de implementar estructura híbrida con tabla pruebas_completas'
);

-- =====================================================
-- 6. VERIFICACIÓN DEL BACKUP
-- =====================================================

-- Mostrar resumen del backup
SELECT 
    'BACKUP COMPLETADO' as status,
    fecha_backup,
    total_registros,
    total_nadadores,
    total_competencias,
    descripcion
FROM backup_esquema_original.metadata_backup
ORDER BY fecha_backup DESC
LIMIT 1;

-- Verificar que las tablas fueron copiadas
SELECT 
    schemaname,
    tablename,
    n_tup_ins as filas_copiadas
FROM pg_stat_user_tables 
WHERE schemaname = 'backup_esquema_original'
ORDER BY tablename;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON SCHEMA backup_esquema_original IS 'Backup completo del esquema original antes de implementar estructura híbrida';
COMMENT ON TABLE backup_esquema_original.registros IS 'Backup de tabla registros original - ESTRUCTURA GRANULAR';
COMMENT ON TABLE backup_esquema_original.metadata_backup IS 'Metadatos del backup para seguimiento y restauración';

-- =====================================================
-- FINAL DEL BACKUP
-- =====================================================

-- Mensaje de confirmación
\echo 'BACKUP COMPLETADO EXITOSAMENTE'
\echo 'Schema: backup_esquema_original'
\echo 'Para restaurar: ejecutar restore-original-schema.sql' 