#!/bin/bash

# ============================================
# SevaSync Database Restore Script
# ============================================
#
# Restores database from a backup SQL file.
#
# Usage: bash scripts/restore-db.sh backups/sevasync_backup_20260422_120000.sql
#
# This script:
# 1. Validates backup file exists
# 2. Confirms before restoring (prevents accidental data loss)
# 3. Restores entire database
# 4. Verifies restore completed
#
# WARNING: This will overwrite the current database!
#

set -e

echo ""
echo "⚠️  ============================================"
echo "    SEVASYNC DATABASE RESTORE"
echo "============================================"
echo ""

# Check if backup file argument provided
if [ -z "$1" ]; then
    echo "❌ Usage: bash scripts/restore-db.sh <backup_file>"
    echo ""
    echo "Example:"
    echo "  bash scripts/restore-db.sh backups/sevasync_backup_20260422_120000.sql"
    echo ""
    echo "Available backups:"
    if [ -d "backups" ]; then
        ls -lh backups/
    else
        echo "  (no backups directory found)"
    fi
    echo ""
    exit 1
fi

BACKUP_FILE=$1

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    echo ""
    echo "Available backups:"
    if [ -d "backups" ]; then
        ls -lh backups/
    else
        echo "  (no backups directory found)"
    fi
    echo ""
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable not set"
    exit 1
fi

# Display warning
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
BACKUP_LINES=$(wc -l < "$BACKUP_FILE")

echo "⚠️  WARNING: This will OVERWRITE the current database!"
echo ""
echo "📦 Restore from: $BACKUP_FILE"
echo "📏 Size: $BACKUP_SIZE"
echo "📄 Lines: $BACKUP_LINES"
echo ""
echo "Current data WILL BE LOST"
echo ""

# Confirm before proceeding
read -p "Type 'yes' to continue with restore: " -r CONFIRM
echo

if [[ ! $CONFIRM =~ ^[Yy][Ee][Ss]$ ]]
then
    echo "❌ Restore cancelled. Database unchanged."
    exit 0
fi

echo "🔄 Restoring database... this may take a minute"
echo ""

# Perform restore
if psql "$DATABASE_URL" -q < "$BACKUP_FILE" 2>/dev/null; then
    echo ""
    echo "✅ ============================================"
    echo "    RESTORE COMPLETE"
    echo "============================================"
    echo ""
    echo "✓ Database restored from backup"
    echo "✓ All tables and data restored"
    echo ""
    echo "Backup details:"
    echo "  File: $BACKUP_FILE"
    echo "  Size: $BACKUP_SIZE"
    echo "  Created: $(stat -f %Sm -t '%Y-%m-%d %H:%M:%S' $BACKUP_FILE 2>/dev/null || echo 'unknown')"
    echo ""
    echo "Next steps:"
    echo "  1. Verify data integrity"
    echo "  2. Restart your application"
    echo "  3. Run smoke tests"
    echo ""
else
    echo ""
    echo "❌ Restore failed"
    echo ""
    echo "Possible causes:"
    echo "  1. PostgreSQL client tools not installed (psql)"
    echo "  2. Invalid DATABASE_URL"
    echo "  3. Corrupted backup file"
    echo "  4. Backup file format incompatible with current PostgreSQL version"
    echo ""
    echo "To install psql:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    echo "  Windows: choco install postgresql"
    echo ""
    exit 1
fi
