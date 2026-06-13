#!/bin/bash
# Backup The Adventurer's Chronicle: PostgreSQL dump + uploads archive.
# Run on the Docker host (e.g., Unraid User Scripts). Safe while containers run:
# pg_dump produces a consistent snapshot, no downtime needed.
#
# Usage: ./scripts/backup.sh [backup_dir]
#   backup_dir defaults to ./backups next to this repo.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${1:-$APP_DIR/backups}"
DB_CONTAINER="adventurers-chronicle-db"
KEEP_DAYS=30
STAMP="$(date +%Y-%m-%d_%H%M%S)"

mkdir -p "$BACKUP_DIR"

echo "Dumping database..."
docker exec "$DB_CONTAINER" pg_dump -U postgres adventurers_chronicle \
  | gzip > "$BACKUP_DIR/chronicle-db-$STAMP.sql.gz"

echo "Archiving uploads..."
if [ -d "$APP_DIR/uploads" ]; then
  tar -czf "$BACKUP_DIR/chronicle-uploads-$STAMP.tar.gz" -C "$APP_DIR" uploads
else
  echo "  (no uploads directory found at $APP_DIR/uploads, skipping)"
fi

echo "Pruning backups older than $KEEP_DAYS days..."
find "$BACKUP_DIR" -name 'chronicle-*' -mtime +"$KEEP_DAYS" -delete

echo "Done. Backups in $BACKUP_DIR:"
ls -lh "$BACKUP_DIR" | tail -n 5
