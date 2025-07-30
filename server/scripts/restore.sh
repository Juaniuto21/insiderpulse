#!/bin/bash

# Database restore script for InsiderPulse
set -e

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Available backups:"
    ls -la ./database/backups/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

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

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

print_warning "This will restore the database and overwrite all existing data!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Restore cancelled"
    exit 0
fi

print_status "Starting database restore from: $BACKUP_FILE"

# Stop the API service to prevent connections
print_status "Stopping API service..."
docker-compose -f docker-compose.production.yml stop api

# Decompress and restore
if zcat "$BACKUP_FILE" | docker-compose -f docker-compose.production.yml exec -T postgres psql -U insiderpulse -d insiderpulse; then
    print_status "Database restored successfully"
else
    print_error "Database restore failed"
    exit 1
fi

# Restart services
print_status "Restarting services..."
docker-compose -f docker-compose.production.yml start api

print_status "Restore completed successfully!"