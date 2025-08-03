-- Migration: 000_drop_all.sql
-- Description: Drops all project-related tables to reset the database schema.
-- WARNING: This is a destructive operation.

BEGIN;

-- Drop tables in reverse order of dependency
DROP TABLE IF EXISTS public.registros CASCADE;
DROP TABLE IF EXISTS public.registros_completos CASCADE;
DROP TABLE IF EXISTS public.metricas CASCADE;
DROP TABLE IF EXISTS public.parametros CASCADE; -- En caso de que el renombrado haya fallado
DROP TABLE IF EXISTS public.pruebas CASCADE;
DROP TABLE IF EXISTS public.competencias CASCADE;
DROP TABLE IF EXISTS public.nadadores CASCADE;
DROP TABLE IF EXISTS public.fases CASCADE;
DROP TABLE IF EXISTS public.estilos CASCADE;
DROP TABLE IF EXISTS public.distancias CASCADE;

-- Drop any potentially conflicting functions or views we created
DROP FUNCTION IF EXISTS public.delete_swimmer_and_records(integer);
DROP FUNCTION IF EXISTS public.fn_get_rankings_data(integer, integer);
DROP FUNCTION IF EXISTS public.fn_get_aggregated_metrics(text,integer,integer,integer,integer,date,date);
DROP FUNCTION IF EXISTS public.refresh_performance_views();
DROP FUNCTION IF EXISTS public.get_table_stats();
DROP FUNCTION IF EXISTS public.set_updated_at();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP VIEW IF EXISTS public.vista_analisis_competencias;
DROP VIEW IF EXISTS public.vista_registros_completos;

COMMIT; 