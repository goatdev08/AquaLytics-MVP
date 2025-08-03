-- =====================================================
-- SCRIPT DE RESTAURACIÓN AL ESQUEMA ORIGINAL
-- Fecha: 2024-01-21
-- Propósito: Restaurar estructura original desde backup_esquema_original
-- =====================================================

-- ⚠️  ADVERTENCIA: Este script eliminará las tablas híbridas
-- ⚠️  y restaurará el esquema original. Usar con precaución.

-- =====================================================
-- VERIFICACIONES PREVIAS
-- =====================================================

-- Verificar que existe el backup
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'backup_esquema_original') THEN
        RAISE EXCEPTION 'ERRO: Schema backup_esquema_original no existe. Ejecute backup-current-schema.sql primero.';
    END IF;
    
    RAISE NOTICE 'Backup schema encontrado. Iniciando restauración...';
END $$;

-- Mostrar información del backup disponible
SELECT 
    'BACKUP DISPONIBLE' as status,
    fecha_backup,
    total_registros,
    total_nadadores,
    total_competencias,
    descripcion
FROM backup_esquema_original.metadata_backup
ORDER BY fecha_backup DESC
LIMIT 1;

-- =====================================================
-- PASO 1: ELIMINAR ESTRUCTURA HÍBRIDA (SI EXISTE)
-- =====================================================

-- Eliminar tabla híbrida si existe
DROP TABLE IF EXISTS public.pruebas_completas CASCADE;
DROP TRIGGER IF EXISTS sync_to_complete_tests ON public.registros;
DROP TRIGGER IF EXISTS sync_to_granular ON public.pruebas_completas;
DROP FUNCTION IF EXISTS sync_to_complete_tests();
DROP FUNCTION IF EXISTS sync_to_granular();

RAISE NOTICE 'Estructura híbrida eliminada (si existía)';

-- =====================================================
-- PASO 2: CREAR COPIA DE SEGURIDAD DE ESTADO ACTUAL
-- =====================================================

-- Crear backup del estado antes de restaurar (por seguridad)
CREATE SCHEMA IF NOT EXISTS backup_antes_restauracion;

-- Backup rápido de tablas actuales
CREATE TABLE backup_antes_restauracion.registros_actual AS 
SELECT * FROM public.registros;

CREATE TABLE backup_antes_restauracion.nadadores_actual AS 
SELECT * FROM public.nadadores;

-- Metadatos de la restauración
CREATE TABLE backup_antes_restauracion.metadata_restauracion (
    fecha_restauracion TIMESTAMP DEFAULT NOW(),
    registros_perdidos INTEGER,
    descripcion TEXT
);

INSERT INTO backup_antes_restauracion.metadata_restauracion (
    registros_perdidos,
    descripcion
) VALUES (
    (SELECT COUNT(*) FROM public.registros) - 
    (SELECT COUNT(*) FROM backup_esquema_original.registros),
    'Backup automático antes de restaurar esquema original'
);

-- =====================================================
-- PASO 3: LIMPIAR SCHEMA PÚBLICO ACTUAL
-- =====================================================

-- Eliminar triggers actuales
DROP TRIGGER IF EXISTS update_registros_updated_at ON public.registros;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Eliminar vistas actuales
DROP VIEW IF EXISTS public.vista_registros_completos CASCADE;

-- Eliminar índices personalizados (mantener PKs y FKs básicos)
DROP INDEX IF EXISTS public.idx_registros_nadador_fecha;
DROP INDEX IF EXISTS public.idx_registros_competencia;
DROP INDEX IF EXISTS public.idx_registros_parametro_tipo;
DROP INDEX IF EXISTS public.idx_registros_distancia_estilo;
DROP INDEX IF EXISTS public.idx_registros_fecha;
DROP INDEX IF EXISTS public.idx_registros_nadador_competencia_distancia;
DROP INDEX IF EXISTS public.idx_registros_calculo;

-- Eliminar contenido de tablas (MANTENIENDO ESTRUCTURA)
TRUNCATE TABLE public.registros RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.parametros RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.fases RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.estilos RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.distancias RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.competencias RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.nadadores RESTART IDENTITY CASCADE;

RAISE NOTICE 'Schema público limpiado';

-- =====================================================
-- PASO 4: RESTAURAR DATOS DESDE BACKUP
-- =====================================================

-- Restaurar nadadores
INSERT INTO public.nadadores SELECT * FROM backup_esquema_original.nadadores;

-- Restaurar competencias
INSERT INTO public.competencias SELECT * FROM backup_esquema_original.competencias;

-- Restaurar distancias
INSERT INTO public.distancias SELECT * FROM backup_esquema_original.distancias;

-- Restaurar estilos
INSERT INTO public.estilos SELECT * FROM backup_esquema_original.estilos;

-- Restaurar fases
INSERT INTO public.fases SELECT * FROM backup_esquema_original.fases;

-- Restaurar parametros
INSERT INTO public.parametros SELECT * FROM backup_esquema_original.parametros;

-- Restaurar registros (LA PARTE MÁS IMPORTANTE)
INSERT INTO public.registros SELECT * FROM backup_esquema_original.registros;

RAISE NOTICE 'Datos restaurados desde backup';

-- =====================================================
-- PASO 5: RECREAR ÍNDICES ORIGINALES
-- =====================================================

-- Recrear índices desde el backup
DO $$
DECLARE
    idx_record RECORD;
BEGIN
    FOR idx_record IN 
        SELECT indexdef 
        FROM backup_esquema_original.indices_originales 
        WHERE indexname NOT LIKE '%_pkey' -- Evitar PKs duplicadas
    LOOP
        BEGIN
            EXECUTE idx_record.indexdef;
        EXCEPTION 
            WHEN duplicate_table THEN
                -- Ignorar si el índice ya existe
                CONTINUE;
        END;
    END LOOP;
END $$;

-- =====================================================
-- PASO 6: RECREAR VISTAS ORIGINALES
-- =====================================================

-- Recrear vista principal
CREATE OR REPLACE VIEW public.vista_registros_completos AS
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
FROM public.registros r
LEFT JOIN public.nadadores n ON r.id_nadador = n.id_nadador
LEFT JOIN public.competencias c ON r.competencia_id = c.competencia_id
LEFT JOIN public.distancias d ON r.distancia_id = d.distancia_id
LEFT JOIN public.estilos e ON r.estilo_id = e.estilo_id
LEFT JOIN public.fases f ON r.fase_id = f.fase_id
LEFT JOIN public.parametros p ON r.parametro_id = p.parametro_id;

-- =====================================================
-- PASO 7: RECREAR TRIGGERS ORIGINALES
-- =====================================================

-- Recrear función de timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recrear trigger
CREATE TRIGGER update_registros_updated_at 
    BEFORE UPDATE ON public.registros 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PASO 8: VERIFICACIÓN DE LA RESTAURACIÓN
-- =====================================================

-- Verificar conteos
CREATE TEMP TABLE verificacion_restauracion AS
SELECT 
    'original' as fuente,
    (SELECT COUNT(*) FROM backup_esquema_original.nadadores) as nadadores,
    (SELECT COUNT(*) FROM backup_esquema_original.registros) as registros,
    (SELECT COUNT(*) FROM backup_esquema_original.competencias) as competencias
UNION ALL
SELECT 
    'restaurado' as fuente,
    (SELECT COUNT(*) FROM public.nadadores) as nadadores,
    (SELECT COUNT(*) FROM public.registros) as registros,
    (SELECT COUNT(*) FROM public.competencias) as competencias;

-- Mostrar resultado de verificación
SELECT * FROM verificacion_restauracion;

-- Verificar que las vistas funcionan
SELECT 
    'VERIFICACIÓN VISTA' as test,
    COUNT(*) as registros_en_vista
FROM public.vista_registros_completos;

-- =====================================================
-- PASO 9: METADATOS DE RESTAURACIÓN
-- =====================================================

CREATE TABLE IF NOT EXISTS public.log_restauraciones (
    id SERIAL PRIMARY KEY,
    fecha_restauracion TIMESTAMP DEFAULT NOW(),
    registros_restaurados INTEGER,
    desde_backup_fecha TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'completado'
);

INSERT INTO public.log_restauraciones (
    registros_restaurados,
    desde_backup_fecha
) VALUES (
    (SELECT COUNT(*) FROM public.registros),
    (SELECT fecha_backup FROM backup_esquema_original.metadata_backup ORDER BY fecha_backup DESC LIMIT 1)
);

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

SELECT 
    'RESTAURACIÓN COMPLETADA' as status,
    fecha_restauracion,
    registros_restaurados,
    'Schema original restaurado exitosamente' as mensaje
FROM public.log_restauraciones 
ORDER BY fecha_restauracion DESC 
LIMIT 1;

-- Instrucciones post-restauración
\echo '================================================================='
\echo 'RESTAURACIÓN COMPLETADA EXITOSAMENTE'
\echo '================================================================='
\echo 'El schema original ha sido restaurado.'
\echo 'Verificar que la aplicación funcione correctamente.'
\echo 'Backup del estado anterior guardado en: backup_antes_restauracion'
\echo '=================================================================' 