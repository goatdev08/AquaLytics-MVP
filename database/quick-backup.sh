#!/bin/bash

# =====================================================
# SCRIPT DE BACKUP RÁPIDO PARA AQUALYTICS
# =====================================================
# Uso: ./database/quick-backup.sh [mensaje-opcional]
# Ejemplo: ./database/quick-backup.sh "Antes de estructura híbrida"

# Configuración
PROJECT_NAME="AquaLytics"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_BRANCH="backup-$TIMESTAMP"
DEFAULT_MESSAGE="Backup automático antes de cambios importantes"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensaje con color
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo "========================================"
echo "🔄 BACKUP RÁPIDO - $PROJECT_NAME"
echo "========================================"

# Verificar que estamos en un repositorio git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "No se detectó repositorio Git en el directorio actual"
    exit 1
fi

# Obtener mensaje de commit
COMMIT_MESSAGE="${1:-$DEFAULT_MESSAGE}"
log "Mensaje del backup: $COMMIT_MESSAGE"

# Verificar estado del repositorio
if [[ -n $(git status --porcelain) ]]; then
    warning "Hay cambios sin confirmar en el repositorio"
    log "Agregando todos los cambios al staging..."
    git add .
else
    log "Repositorio limpio, creando backup del estado actual"
fi

# Crear commit con los cambios actuales
log "Creando commit con timestamp: $TIMESTAMP"
if git commit -m "$COMMIT_MESSAGE - $TIMESTAMP" --allow-empty; then
    success "Commit creado exitosamente"
else
    error "Error al crear commit"
    exit 1
fi

# Obtener branch actual
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log "Branch actual: $CURRENT_BRANCH"

# Crear branch de backup
log "Creando branch de backup: $BACKUP_BRANCH"
if git checkout -b "$BACKUP_BRANCH"; then
    success "Branch de backup creado: $BACKUP_BRANCH"
else
    error "Error al crear branch de backup"
    exit 1
fi

# Pushear branch de backup (opcional, comentar si no quieres push automático)
log "Enviando branch de backup al repositorio remoto..."
if git push origin "$BACKUP_BRANCH" 2>/dev/null; then
    success "Branch de backup enviado al remoto"
else
    warning "No se pudo enviar al remoto (normal si no hay conexión)"
fi

# Volver al branch original
log "Volviendo al branch original: $CURRENT_BRANCH"
git checkout "$CURRENT_BRANCH"

# Mostrar información del backup creado
echo ""
echo "========================================"
echo "✅ BACKUP COMPLETADO EXITOSAMENTE"
echo "========================================"
echo "📝 Commit: $(git rev-parse --short HEAD)"
echo "🌿 Branch de backup: $BACKUP_BRANCH"
echo "📅 Timestamp: $TIMESTAMP"
echo "💬 Mensaje: $COMMIT_MESSAGE"
echo ""

# Instrucciones para base de datos
echo "========================================"
echo "🗃️  SIGUIENTE PASO: BACKUP DE BASE DE DATOS"
echo "========================================"
echo "Para completar el backup, ejecutar en Supabase SQL Editor:"
echo ""
echo "\\i database/backup-current-schema.sql"
echo ""
echo "O copiar y pegar el contenido de:"
echo "database/backup-current-schema.sql"
echo ""

# Mostrar comandos de restauración
echo "========================================"
echo "🔄 COMANDOS DE RESTAURACIÓN"
echo "========================================"
echo "Para restaurar CÓDIGO:"
echo "  git checkout $BACKUP_BRANCH"
echo ""
echo "Para restaurar BASE DE DATOS:"
echo "  Ejecutar en Supabase: \\i database/restore-original-schema.sql"
echo ""

# Lista de backups recientes
echo "========================================"
echo "📋 BACKUPS RECIENTES"
echo "========================================"
echo "Últimos 5 branches de backup:"
git branch | grep "backup-" | tail -5 | sed 's/^/  /'
echo ""

success "Backup de código completado. No olvides hacer backup de la BD!"

# Verificación final
BACKUP_EXISTS=$(git branch | grep "$BACKUP_BRANCH" | wc -l)
if [ "$BACKUP_EXISTS" -eq 1 ]; then
    success "Verificación: Branch de backup existe correctamente"
else
    error "Verificación falló: Branch de backup no encontrado"
    exit 1
fi

echo "========================================" 