#!/usr/bin/env bash
# =============================================================================
# Шаг 6: резервное копирование PostgreSQL (для пояснительной по ИБ)
#
# Использование:
#   export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
#   ./scripts/backup.sh
#
# Или с Supabase CLI:
#   supabase db dump -f backups/green_$(date +%Y%m%d_%H%M%S).sql
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/../backups"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_FILE="${BACKUP_DIR}/green_pharmacy_${STAMP}.sql"

mkdir -p "${BACKUP_DIR}"

if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "Ошибка: задайте переменную DATABASE_URL (строка подключения Supabase Postgres)."
    echo "Dashboard → Project Settings → Database → Connection string (URI)"
    exit 1
fi

echo "Создание дампа: ${OUT_FILE}"
pg_dump "${DATABASE_URL}" \
    --no-owner \
    --no-privileges \
    --schema=public \
    --file="${OUT_FILE}"

echo "Готово. Размер: $(wc -c < "${OUT_FILE}" | tr -d ' ') байт"
