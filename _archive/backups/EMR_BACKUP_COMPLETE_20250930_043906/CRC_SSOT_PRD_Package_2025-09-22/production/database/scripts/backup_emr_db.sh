#!/bin/bash
# Backup EMR Database (HIPAA Compliant)

source ./.env

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/emr_backup_$TIMESTAMP.sql.gpg"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "🏥 Creating encrypted EMR database backup..."
echo "⚠️  PHI Backup - Encrypting with GPG"

# Create encrypted backup
PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" | \
    gpg --symmetric --cipher-algo AES256 --output "$BACKUP_FILE"

if [[ $? -eq 0 ]]; then
    echo "✅ Encrypted backup completed: $BACKUP_FILE"
    echo "🔐 Backup is GPG encrypted for HIPAA compliance"
    ls -lh "$BACKUP_FILE"
else
    echo "❌ Backup failed"
    exit 1
fi
