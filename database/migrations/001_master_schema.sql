-- Migration: 001_master_schema.sql
-- Description: Creates the complete, final database schema for AquaLytics from scratch.
BEGIN;

-- TABLA: nadadores
CREATE TABLE public.nadadores (
    id_nadador SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    edad SMALLINT,
    peso SMALLINT
);

-- TABLA: competencias
CREATE TABLE public.competencias (
    competencia_id SERIAL PRIMARY KEY,
    competencia VARCHAR(255) NOT NULL,
    periodo DATERANGE
);

-- TABLA: distancias
CREATE TABLE public.distancias (
    distancia_id SERIAL PRIMARY KEY,
    distancia INT NOT NULL UNIQUE
);

-- TABLA: estilos
CREATE TABLE public.estilos (
    estilo_id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

-- TABLA: fases
CREATE TABLE public.fases (
    fase_id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

-- TABLA: parametros (será renombrada después)
CREATE TABLE public.parametros (
    parametro_id SERIAL PRIMARY KEY,
    parametro TEXT NOT NULL UNIQUE,
    tipo CHAR(1) NOT NULL,
    global BOOLEAN DEFAULT false
);

-- TABLA: pruebas
CREATE TABLE public.pruebas (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    distancia_id INT NOT NULL REFERENCES public.distancias(distancia_id),
    estilo_id INT NOT NULL REFERENCES public.estilos(estilo_id),
    curso TEXT NOT NULL,
    UNIQUE(distancia_id, estilo_id, curso)
);

-- TABLA: registros
CREATE TABLE public.registros (
    registro_id BIGSERIAL PRIMARY KEY,
    id_nadador INT NOT NULL REFERENCES public.nadadores(id_nadador) ON DELETE CASCADE,
    prueba_id INT NOT NULL REFERENCES public.pruebas(id) ON DELETE CASCADE,
    competencia_id INT REFERENCES public.competencias(competencia_id) ON DELETE SET NULL,
    fecha DATE NOT NULL,
    fase_id INT REFERENCES public.fases(fase_id) ON DELETE SET NULL,
    parametro_id INT NOT NULL REFERENCES public.parametros(parametro_id),
    valor NUMERIC NOT NULL,
    segmento INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT; 