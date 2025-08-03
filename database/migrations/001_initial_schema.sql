-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for AquaLytics Phoenixdb
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

-- TABLA: parametros
CREATE TABLE public.parametros (
    parametro_id SERIAL PRIMARY KEY,
    parametro TEXT NOT NULL UNIQUE,
    tipo CHAR(1) NOT NULL,
    global BOOLEAN DEFAULT false
);

-- TABLA: registros
CREATE TABLE public.registros (
    registro_id BIGSERIAL PRIMARY KEY,
    competencia_id INT REFERENCES public.competencias(competencia_id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    id_nadador INT NOT NULL REFERENCES public.nadadores(id_nadador) ON DELETE CASCADE,
    distancia_id INT NOT NULL REFERENCES public.distancias(distancia_id),
    estilo_id INT NOT NULL REFERENCES public.estilos(estilo_id),
    fase_id INT NOT NULL REFERENCES public.fases(fase_id),
    parametro_id INT NOT NULL REFERENCES public.parametros(parametro_id),
    segmento INT,
    valor NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT; 