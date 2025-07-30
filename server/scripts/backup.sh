#!/bin/bash

# Database backup script for InsiderPulse
set -e

# Configuration
BACKUP_DIR="./database/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="insiderpulse_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=30

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

print_status "Starting database backup..."

# Create database backup
if docker-compose -f docker-compose.production.yml exec -T postgres pg_dump -U insiderpulse insiderpulse > "$BACKUP_DIR/$BACKUP_FILE"; then
    print_status "Database backup created: $BACKUP_FILE"
    
    # Compress the backup
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    print_status "Backup compressed: ${BACKUP_FILE}.gz"
    
    # Remove old backups
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
    print_status "Old backups cleaned up (retention: $RETENTION_DAYS days)"
    
    # Show backup size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_FILE}.gz" | cut -f1)
    print_status "Backup size: $BACKUP_SIZE"
    
else
    print_error "Database backup failed"
    exit 1
fi

print_status "Backup completed successfully!"