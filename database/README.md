# Database Migrations - AquaLytics

## 📋 Overview

Este directorio contiene las migraciones de base de datos para AquaLytics, diseñadas para capturar y versionar la estructura de la base de datos Phoenixdb en Supabase.

## 🗂️ Structure

```
database/
├── migrations/           # Archivos de migración SQL
├── seeds/               # Datos de ejemplo (separados de migraciones)
├── docs/               # Documentación adicional
└── README.md           # Este archivo
```

## 📝 Migration Files

### 001_initial_schema.sql

- **Propósito**: Define la estructura completa de la base de datos
- **Incluye**:
  - Todas las tablas (nadadores, competencias, distancias, estilos, fases, parametros, registros)
  - Índices para optimización de consultas
  - Comentarios de documentación
  - Triggers automáticos
  - Vista de registros completos
  - Configuración básica de seguridad (RLS)

### 002_seed_reference_data.sql

- **Propósito**: Inserta datos de referencia necesarios para el funcionamiento
- **Incluye**:
  - Distancias estándar (25m, 50m, 100m, 200m, 400m, 800m, 1500m)
  - Estilos de natación (Crol, Dorso, Pecho, Mariposa, Combinado)
  - Fases de competencia (PRELIMINAR, SEMIFINAL, FINAL)
  - 16 parámetros de métricas (9 manuales + 7 automáticas)
  - Datos de ejemplo (competencias y nadadores)

## 🚀 How to Use

### Opción 1: Manual (Supabase Dashboard)

1. Accede al Dashboard de Supabase
2. Ve a **SQL Editor**
3. Ejecuta las migraciones en orden:

   ```sql
   -- Paso 1: Ejecutar 001_initial_schema.sql
   -- Paso 2: Ejecutar 002_seed_reference_data.sql
   ```

### Opción 2: Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Inicializar proyecto local
supabase init

# 3. Enlazar con proyecto remoto
supabase link --project-ref ombbxzdptnasoipzpmfh

# 4. Aplicar migraciones
supabase db push

# 5. Verificar estado
supabase db diff
```

### Opción 3: Desde código TypeScript

```typescript
import { mcp_supabase_execute_sql } from '@/lib/mcp-tools'

// Ejecutar migración
const result = await mcp_supabase_execute_sql({
  project_id: 'ombbxzdptnasoipzpmfh',
  query: fs.readFileSync('database/migrations/001_initial_schema.sql', 'utf8')
})
```

## 📊 Database Schema

### Tables Overview

| Tabla | Propósito | Registros Típicos |
|-------|-----------|-------------------|
| `nadadores` | Información de nadadores | ~100-1000 |
| `competencias` | Eventos y competencias | ~10-50 |
| `distancias` | Distancias estándar | 7 (fijo) |
| `estilos` | Estilos de natación | 5 (fijo) |
| `fases` | Fases de competencia | 3 (fijo) |
| `parametros` | Métricas del sistema | 16 (fijo) |
| `registros` | **Tabla principal** | ~10,000-100,000+ |

### Key Relationships

```
registros (Main)
├── nadadores (id_nadador)
├── competencias (competencia_id)
├── distancias (distancia_id)
├── estilos (estilo_id)
├── fases (fase_id)
└── parametros (parametro_id)
```

## 🔍 Performance Optimizations

Las migraciones incluyen índices optimizados para:

- ✅ Consultas por nadador y fecha
- ✅ Filtros por competencia
- ✅ Búsquedas por parámetro/métrica
- ✅ Combinaciones nadador-competencia-distancia
- ✅ Cálculos automáticos de métricas

## 🛡️ Security Features

- **Row Level Security (RLS)** habilitado en tablas sensibles
- **Foreign Key Constraints** para integridad referencial  
- **Check Constraints** para validación de datos
- **Timestamps automáticos** para auditoría

## 🧪 Testing Migrations

```sql
-- Verificar estructura
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- Verificar datos de referencia
SELECT 
  (SELECT COUNT(*) FROM distancias) as distancias,
  (SELECT COUNT(*) FROM estilos) as estilos,
  (SELECT COUNT(*) FROM parametros) as parametros;

-- Probar vista completa
SELECT * FROM vista_registros_completos LIMIT 5;
```

## 📋 Migration History

| Version | File | Date | Description |
|---------|------|------|-------------|
| 001 | `001_initial_schema.sql` | 2024-12-24 | Initial database structure |
| 002 | `002_seed_reference_data.sql` | 2024-12-24 | Reference data seeding |

## 🔄 Future Migrations

Para crear nuevas migraciones:

1. **Naming Convention**: `003_descriptive_name.sql`
2. **Include Rollback**: Considerar como revertir cambios
3. **Test First**: Probar en entorno de desarrollo
4. **Document**: Actualizar este README

## ⚠️ Important Notes

- **No modificar migraciones ya aplicadas** - crear nuevas en su lugar
- **Backup antes de aplicar** en producción
- **Verificar dependencias** antes de aplicar
- **Monitorear performance** después de cambios de schema

## 🔗 Related Files

- `/aqualytics/lib/types/database.ts` - Tipos TypeScript correspondientes
- `/aqualytics/lib/supabase.ts` - Cliente y helpers de base de datos
- `/aqualytics/docs/database-schema.md` - Documentación detallada del schema
