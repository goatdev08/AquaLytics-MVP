# Esquema de Base de Datos - AquaLytics Phoenixdb

## Resumen General

La base de datos **Phoenixdb** en Supabase contiene la estructura completa para el análisis de rendimiento en natación competitiva. El esquema está diseñado para almacenar datos de nadadores, competencias, y métricas de rendimiento tanto manuales como automáticas.

## Estructura de Tablas

### 1. Nadadores (`nadadores`)

Almacena información básica de los atletas.

| Campo | Tipo | Descripción | Constraints |
|-------|------|-------------|-------------|
| `id_nadador` | `integer` | Identificador único del nadador | PRIMARY KEY, AUTO_INCREMENT |
| `nombre` | `varchar` | Nombre completo del nadador | NOT NULL |
| `edad` | `smallint` | Edad del nadador | OPTIONAL |
| `peso` | `smallint` | Peso del nadador en kg | OPTIONAL |

### 2. Competencias (`competencias`)

Información sobre eventos y competencias.

| Campo | Tipo | Descripción | Constraints |
|-------|------|-------------|-------------|
| `competencia_id` | `integer` | Identificador único de la competencia | PRIMARY KEY, AUTO_INCREMENT |
| `competencia` | `varchar` | Nombre de la competencia | NOT NULL |
| `periodo` | `daterange` | Rango de fechas de la competencia | OPTIONAL |

### 3. Distancias (`distancias`)

Distancias estándar de natación.

| Campo | Tipo | Descripción | Constraints |
|-------|------|-------------|-------------|
| `distancia_id` | `integer` | Identificador único | PRIMARY KEY, AUTO_INCREMENT |
| `distancia` | `integer` | Distancia en metros | NOT NULL, UNIQUE |

**Valores existentes:** 25, 50, 100, 200, 400, 800, 1500 metros

### 4. Estilos (`estilos`)

Estilos de natación reconocidos.

| Campo | Tipo | Descripción | Constraints |
|-------|------|-------------|-------------|
| `estilo_id` | `integer` | Identificador único | PRIMARY KEY, AUTO_INCREMENT |
| `estilo` | `varchar` | Nombre del estilo | NOT NULL, UNIQUE |

**Valores existentes:**

- Crol
- Dorso  
- Pecho
- Mariposa
- Combinado

### 5. Fases (`fases`)

Fases de competencia.

| Campo | Tipo | Descripción | Constraints |
|-------|------|-------------|-------------|
| `fase_id` | `integer` | Identificador único | PRIMARY KEY, AUTO_INCREMENT |
| `fase` | `varchar` | Nombre de la fase | NOT NULL, UNIQUE |

**Valores existentes:**

- PRELIMINAR
- SEMIFINAL
- FINAL

### 6. Parámetros (`parametros`)

Métricas de rendimiento que se pueden medir.

| Campo | Tipo | Descripción | Constraints |
|-------|------|-------------|-------------|
| `parametro_id` | `integer` | Identificador único | PRIMARY KEY, AUTO_INCREMENT |
| `parametro` | `varchar` | Nombre del parámetro | NOT NULL, UNIQUE |
| `tipo` | `char(1)` | Tipo: 'M' (Manual) o 'A' (Automático) | NOT NULL, CHECK (M o A) |
| `global` | `boolean` | Si es una métrica global o por segmento | DEFAULT false |

#### Parámetros Manuales (tipo = 'M')

| ID | Parámetro | Descripción | Global |
|----|-----------|-------------|--------|
| 1 | T15 (1) | Tiempo primer segmento 15m | No |
| 2 | # de BRZ 1 | Número de brazadas primer segmento | No |
| 4 | T25 (1) | Tiempo primer segmento 25m | No |
| 5 | # de BRZ 2 | Número de brazadas segundo segmento | No |
| 7 | T15 (2) | Tiempo segundo segmento 15m | No |
| 10 | T25 (2) | Tiempo segundo segmento 25m | No |
| 12 | F1 | Frecuencia primer segmento | No |
| 13 | T TOTAL | Tiempo total | Sí |
| 15 | F2 | Frecuencia segundo segmento | No |

#### Parámetros Automáticos (tipo = 'A')

| ID | Parámetro | Descripción | Fórmula | Global |
|----|-----------|-------------|---------|--------|
| 3 | V1 | Velocidad primer segmento | distancia/tiempo | No |
| 6 | V2 | Velocidad segundo segmento | distancia/tiempo | No |
| 8 | BRZ TOTAL | Total de brazadas | suma(brazadas) | Sí |
| 9 | V promedio | Velocidad promedio | distancia_total/tiempo_total | Sí |
| 11 | DIST sin F | Distancia sin frecuencia | calculado | Sí |
| 14 | DIST x BRZ | Distancia por brazada | distancia/brazadas | Sí |
| 16 | F promedio | Frecuencia promedio | promedio(frecuencias) | Sí |

### 7. Registros (`registros`)

Tabla principal que almacena todas las mediciones.

| Campo | Tipo | Descripción | Constraints |
|-------|------|-------------|-------------|
| `registro_id` | `bigint` | Identificador único | PRIMARY KEY, AUTO_INCREMENT |
| `competencia_id` | `integer` | Referencia a competencia | FOREIGN KEY → competencias |
| `fecha` | `date` | Fecha del registro | OPTIONAL |
| `id_nadador` | `integer` | Referencia al nadador | FOREIGN KEY → nadadores |
| `distancia_id` | `integer` | Referencia a distancia | FOREIGN KEY → distancias |
| `estilo_id` | `integer` | Referencia al estilo | FOREIGN KEY → estilos |
| `fase_id` | `integer` | Referencia a la fase | FOREIGN KEY → fases |
| `parametro_id` | `integer` | Referencia al parámetro | FOREIGN KEY → parametros |
| `segmento` | `integer` | Número de segmento (1, 2, etc.) | OPTIONAL |
| `valor` | `numeric` | Valor medido/calculado | OPTIONAL |

## Relaciones

```
nadadores (1) ←→ (N) registros
competencias (1) ←→ (N) registros  
distancias (1) ←→ (N) registros
estilos (1) ←→ (N) registros
fases (1) ←→ (N) registros
parametros (1) ←→ (N) registros
```

## Índices Recomendados

Para optimizar el rendimiento de consultas frecuentes:

```sql
-- Índices en registros para consultas comunes
CREATE INDEX idx_registros_nadador_fecha ON registros(id_nadador, fecha DESC);
CREATE INDEX idx_registros_competencia ON registros(competencia_id);
CREATE INDEX idx_registros_parametro_tipo ON registros(parametro_id);
CREATE INDEX idx_registros_busqueda ON registros(id_nadador, distancia_id, estilo_id, fase_id);
```

## Patrones de Consulta Comunes

### 1. Obtener rendimiento completo de un nadador

```sql
SELECT r.*, n.nombre, c.competencia, d.distancia, e.estilo, f.fase, p.parametro, p.tipo
FROM registros r
JOIN nadadores n ON r.id_nadador = n.id_nadador
JOIN competencias c ON r.competencia_id = c.competencia_id
JOIN distancias d ON r.distancia_id = d.distancia_id
JOIN estilos e ON r.estilo_id = e.estilo_id
JOIN fases f ON r.fase_id = f.fase_id
JOIN parametros p ON r.parametro_id = p.parametro_id
WHERE r.id_nadador = $1
ORDER BY r.fecha DESC, r.parametro_id;
```

### 2. Comparar nadadores en misma competencia

```sql
SELECT n.nombre, r.valor, p.parametro
FROM registros r
JOIN nadadores n ON r.id_nadador = n.id_nadador
JOIN parametros p ON r.parametro_id = p.parametro_id
WHERE r.competencia_id = $1 
  AND r.distancia_id = $2 
  AND r.estilo_id = $3 
  AND r.fase_id = $4
  AND r.id_nadador IN ($5, $6)
ORDER BY r.id_nadador, r.parametro_id;
```

### 3. Obtener métricas automáticas para cálculo

```sql
SELECT * FROM parametros WHERE tipo = 'A' ORDER BY parametro_id;
```

## Reglas de Negocio

1. **Segmentos**: Los parámetros pueden ser por segmento (1, 2) o globales (NULL)
2. **Cálculos automáticos**: Los parámetros tipo 'A' se calculan basándose en parámetros tipo 'M'
3. **Integridad referencial**: Todos los registros deben tener referencias válidas
4. **Validaciones**:
   - Distancias deben ser valores estándar
   - Tiempos deben ser positivos
   - Frecuencias deben ser > 0

## Estadísticas Actuales

- **Nadadores**: 5 registrados
- **Competencias**: 3 activas  
- **Distancias**: 7 disponibles (25-1500m)
- **Estilos**: 5 tipos
- **Fases**: 3 fases de competencia
- **Parámetros**: 16 total (9 manuales + 7 automáticos)
- **Registros**: 128+ mediciones almacenadas

## Conexión TypeScript

Los modelos TypeScript están definidos en `lib/types/database.ts` y proporcionan:

- Interfaces tipadas para todas las tablas
- Tipos de unión para valores válidos
- Esquemas para operaciones CRUD
- Tipos extendidos con relaciones

La integración con Supabase utiliza estos tipos para garantizar la seguridad de tipos en tiempo de compilación.

## Próximas Mejoras

1. **RLS (Row Level Security)**: Implementar políticas de acceso por usuario
2. **Índices adicionales**: Optimizar consultas de análisis temporal
3. **Vistas materializadas**: Para consultas de análisis complejas
4. **Triggers**: Para validaciones automáticas y cálculos en tiempo real
5. **Particionado**: Para manejar grandes volúmenes de datos históricos
