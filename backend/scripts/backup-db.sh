#!/bin/bash

# ============================================
# SevaSync Database Backup Script
# ============================================
#
# Backs up production database to a SQL file.
#
# Usage: bash scripts/backup-db.sh
#
# This script:
# 1. Creates backups/ directory
# 2. Dumps entire database to timestamped file
# 3. Stores uncompressed SQL (can be gzipped manually)
#
# Files created: backups/sevasync_backup_YYYYMMDD_HHMMSS.sql
# Size: ~5-50 MB depending on data
#

set -e

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sevasync_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo ""
echo "💾 ============================================"
echo "   SEVASYNC DATABASE BACKUP"
echo "============================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable not set"
    echo ""
    echo "Set it with:"
    echo "  export DATABASE_URL='postgresql://user:pass@host:5432/sevasync'"
    echo ""
    exit 1
fi

echo "📍 Backup location: $BACKUP_FILE"
echo ""
echo "Creating backup... this may take a minute"
echo ""

# Perform the backup
if pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    BACKUP_LINES=$(wc -l < "$BACKUP_FILE")
    
    echo "✅ ============================================"
    echo "   BACKUP COMPLETE"
    echo "============================================"
    echo ""
    echo "📦 File: $BACKUP_FILE"
    echo "📏 Size: $BACKUP_SIZE"
    echo "📄 Lines: $BACKUP_LINES"
    echo ""
    echo "To compress the backup:"
    echo "  gzip $BACKUP_FILE"
    echo ""
    echo "To view backup metadata:"
    echo "  head -20 $BACKUP_FILE"
    echo ""
    echo "To restore from this backup:"
    echo "  bash scripts/restore-db.sh $BACKUP_FILE"
    echo ""
else
    echo "❌ Backup failed"
    echo ""
    echo "Possible causes:"
    echo "  1. PostgreSQL client tools not installed (pg_dump)"
    echo "  2. Invalid DATABASE_URL"
    echo "  3. Database unreachable"
    echo ""
    echo "To install pg_dump:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    echo "  Windows: choco install postgresql"
    echo ""
    exit 1
fi
