# Guía Completa de Backup y Restauración - AquaLytics

## Resumen

Esta guía proporciona múltiples estrategias para respaldar tu base de datos **ANTES** de implementar cambios significativos (como la estructura híbrida) y poder regresar al estado original si es necesario.

---

## 🔥 Método 1: Backup Completo en Supabase (RECOMENDADO)

### Ejecutar Backup
```sql
-- En Supabase Dashboard > SQL Editor, ejecutar:
\i database/backup-current-schema.sql
```

### Verificar Backup
```sql
-- Verificar que se creó correctamente
SELECT * FROM backup_esquema_original.metadata_backup;
SELECT schemaname, tablename, n_tup_ins 
FROM pg_stat_user_tables 
WHERE schemaname = 'backup_esquema_original';
```

### Restaurar al Original
```sql
-- Para volver al estado original:
\i database/restore-original-schema.sql
```

**✅ Ventajas:**
- Backup dentro de la misma base de datos
- Restauración automática completa
- Preserva metadatos y estructura exacta
- No requiere herramientas externas

---

## 🗂️ Método 2: Snapshot de Supabase Dashboard

### Crear Snapshot
1. **Ir a Supabase Dashboard**
2. **Settings** > **Database**  
3. **Backups** tab
4. **Create backup** (manual snapshot)
5. **Nombrar**: `"Pre-hybrid-structure-backup"`

### Restaurar Snapshot
1. **Ir a Backups tab**
2. **Seleccionar backup deseado**
3. **Restore** > **Confirmar restauración**

**✅ Ventajas:**
- Interfaz gráfica simple
- Backup completo automático
- Incluye configuraciones de Supabase

**⚠️ Limitaciones:**
- Requiere plan Pro de Supabase para backups manuales
- Proceso más lento

---

## 💻 Método 3: Backup Local con pg_dump

### Configurar Variables
```bash
# En terminal, crear archivo .env.backup
export SUPABASE_DB_HOST="db.your-project.supabase.co"
export SUPABASE_DB_PORT="5432"
export SUPABASE_DB_NAME="postgres"
export SUPABASE_DB_USER="postgres"
export SUPABASE_DB_PASSWORD="your-password"
```

### Crear Backup Local
```bash
# Backup completo
pg_dump \
  --host=$SUPABASE_DB_HOST \
  --port=$SUPABASE_DB_PORT \
  --username=$SUPABASE_DB_USER \
  --dbname=$SUPABASE_DB_NAME \
  --verbose \
  --format=custom \
  --file="backup-aqualytics-$(date +%Y%m%d_%H%M%S).dump"

# Backup solo datos (más rápido)
pg_dump \
  --host=$SUPABASE_DB_HOST \
  --port=$SUPABASE_DB_PORT \
  --username=$SUPABASE_DB_USER \
  --dbname=$SUPABASE_DB_NAME \
  --data-only \
  --verbose \
  --file="backup-data-only-$(date +%Y%m%d_%H%M%S).sql"
```

### Restaurar desde Backup Local
```bash
# Restaurar backup completo
pg_restore \
  --host=$SUPABASE_DB_HOST \
  --port=$SUPABASE_DB_PORT \
  --username=$SUPABASE_DB_USER \
  --dbname=$SUPABASE_DB_NAME \
  --verbose \
  --clean \
  --if-exists \
  backup-aqualytics-20240121_143000.dump

# Restaurar solo datos
psql \
  --host=$SUPABASE_DB_HOST \
  --port=$SUPABASE_DB_PORT \
  --username=$SUPABASE_DB_USER \
  --dbname=$SUPABASE_DB_NAME \
  --file=backup-data-only-20240121_143000.sql
```

**✅ Ventajas:**
- Backup local bajo tu control
- Compresión automática
- Compatible con cualquier PostgreSQL

**⚠️ Requerimientos:**
- Instalar `postgresql-client`
- Configurar credenciales de Supabase

---

## 🌳 Método 4: Backup por Git Branching (Código)

### Crear Branch de Backup
```bash
# Crear branch del estado actual
git checkout -b backup-mvp-original
git add .
git commit -m "BACKUP: Estado original antes de estructura híbrida"
git push origin backup-mvp-original

# Volver a develop/main para hacer cambios
git checkout main
```

### Restaurar Código Original
```bash
# Para volver al código original
git checkout backup-mvp-original
git checkout -b restore-original
git push origin restore-original

# O merge específico
git checkout main
git merge backup-mvp-original --strategy=ours
```

**✅ Ventajas:**
- Versionado completo del código
- Fácil comparación de cambios
- Colaboración en equipo

**⚠️ Limitación:**
- Solo respalda código, no datos de BD

---

## 📋 Método 5: Export Manual de Datos Críticos

### Script de Export Mínimo
```sql
-- Exportar solo datos críticos en CSV
COPY (
  SELECT r.*, n.nombre, c.competencia, d.distancia, e.estilo, p.parametro
  FROM registros r
  JOIN nadadores n ON r.id_nadador = n.id_nadador
  JOIN competencias c ON r.competencia_id = c.competencia_id  
  JOIN distancias d ON r.distancia_id = d.distancia_id
  JOIN estilos e ON r.estilo_id = e.estilo_id
  JOIN parametros p ON r.parametro_id = p.parametro_id
  ORDER BY r.fecha DESC
) TO '/tmp/registros_backup.csv' WITH CSV HEADER;

-- Exportar nadadores
COPY nadadores TO '/tmp/nadadores_backup.csv' WITH CSV HEADER;
```

### Re-importar Datos
```sql
-- Limpiar tablas
TRUNCATE TABLE registros RESTART IDENTITY CASCADE;
TRUNCATE TABLE nadadores RESTART IDENTITY CASCADE;

-- Re-importar
COPY nadadores FROM '/tmp/nadadores_backup.csv' WITH CSV HEADER;
-- ... procesar registros con mapping de IDs
```

**✅ Ventajas:**
- Archivos legibles y editables
- Fácil migración entre sistemas
- Backup mínimo para casos críticos

---

## ⚡ Método Recomendado: Estrategia Combinada

### Para el MVP de AquaLytics:

1. **ANTES de cambios importantes:**
   ```bash
   # 1. Backup de código
   git checkout -b backup-pre-hybrid
   git add . && git commit -m "Backup pre-híbrido"
   
   # 2. Backup de BD en Supabase
   # Ejecutar: database/backup-current-schema.sql
   
   # 3. Snapshot manual en Dashboard (si tienes Pro)
   ```

2. **Durante desarrollo:**
   ```bash
   # Trabajar en branch separado
   git checkout -b feature-hybrid-structure
   # ... hacer cambios ...
   ```

3. **Si algo sale mal:**
   ```bash
   # Restaurar código
   git checkout backup-pre-hybrid
   
   # Restaurar BD
   # Ejecutar: database/restore-original-schema.sql
   ```

---

## 🚨 Checklist Pre-Cambios Críticos

### Antes de Modificar Estructura de BD:

- [ ] ✅ **Backup de código**: `git branch backup-pre-change`
- [ ] ✅ **Backup de BD**: Ejecutar `backup-current-schema.sql`
- [ ] ✅ **Verificar backup**: Confirmar tablas en `backup_esquema_original`
- [ ] ✅ **Snapshot dashboard**: Crear backup manual en Supabase
- [ ] ✅ **Documentar cambios**: Anotar razón y alcance del cambio
- [ ] ✅ **Plan de rollback**: Revisar `restore-original-schema.sql`

### Después de Cambios:

- [ ] ✅ **Testing completo**: Verificar todas las funcionalidades
- [ ] ✅ **Performance check**: Confirmar que mejoras son evidentes
- [ ] ✅ **Backup del nuevo estado**: Para futuros rollbacks
- [ ] ✅ **Documentar**: Actualizar documentación técnica

---

## 🔧 Scripts de Automatización

### Script de Backup Rápido
```bash
#!/bin/bash
# database/quick-backup.sh

echo "🔄 Iniciando backup rápido de AquaLytics..."

# Backup de código
git add .
git commit -m "Backup automático $(date)"
BRANCH_NAME="auto-backup-$(date +%Y%m%d_%H%M%S)"
git checkout -b $BRANCH_NAME
git push origin $BRANCH_NAME
git checkout main

echo "✅ Backup de código creado: $BRANCH_NAME"

# Backup de BD (ejecutar manualmente)
echo "🔄 Para backup de BD, ejecutar:"
echo "  En Supabase SQL Editor: \\i database/backup-current-schema.sql"

echo "✅ Backup rápido completado"
```

---

**¿Cuál método prefieres usar para tu proyecto?** Te recomiendo empezar con el **Método 1** (SQL dentro de Supabase) por ser el más simple y completo para tu caso de uso. 