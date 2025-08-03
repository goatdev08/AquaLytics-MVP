-- Migration: 004_drop_registros_completos.sql
-- Description: Removes the obsolete 'registros_completos' table.
BEGIN;

DROP TABLE IF EXISTS public.registros_completos CASCADE;

COMMIT; 