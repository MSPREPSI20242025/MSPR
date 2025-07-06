#!/bin/bash

# MSPR Restore Script
# This script restores backups of the database and application data

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="${BACKUP_STORAGE_PATH:-$PROJECT_ROOT/backups}"

# Default values
CLUSTER_NAME=""
BACKUP_FILE=""
RESTORE_TYPE="full"
FORCE_RESTORE=false
VERBOSE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
MSPR Restore Script

Usage: $0 [OPTIONS]

Options:
    -c, --cluster CLUSTER       Cluster to restore (us, france, switzerland)
    -f, --file FILE             Backup file to restore (without .tar.gz extension)
    -t, --type TYPE             Restore type (full, db-only, files-only)
    -F, --force                 Force restore without confirmation
    -v, --verbose              Enable verbose output
    -l, --list                 List available backups
    -h, --help                 Show this help message

Examples:
    $0 --cluster us --file mspr_us_full_20240101_120000
    $0 -c france -f mspr_france_db-only_20240101_120000 -t db-only
    $0 --list
    $0 --cluster switzerland --file mspr_switzerland_full_20240101_120000 --force

EOF
}

# Function to list available backups
list_backups() {
    log_info "Available backups in $BACKUP_DIR:"
    echo
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log_warn "Backup directory does not exist: $BACKUP_DIR"
        return 0
    fi
    
    # Find all backup files
    find "$BACKUP_DIR" -name "mspr_*.tar.gz" -type f | sort -r | while read -r backup; do
        backup_name=$(basename "$backup" .tar.gz)
        backup_size=$(du -h "$backup" | cut -f1)
        backup_date=$(stat -c %y "$backup" | cut -d' ' -f1)
        
        echo "  $backup_name ($backup_size, $backup_date)"
    done
    
    echo
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--cluster)
            CLUSTER_NAME="$2"
            shift 2
            ;;
        -f|--file)
            BACKUP_FILE="$2"
            shift 2
            ;;
        -t|--type)
            RESTORE_TYPE="$2"
            shift 2
            ;;
        -F|--force)
            FORCE_RESTORE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -l|--list)
            list_backups
            exit 0
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "$CLUSTER_NAME" ]]; then
    log_error "Cluster name is required. Use -c or --cluster option."
    show_help
    exit 1
fi

if [[ -z "$BACKUP_FILE" ]]; then
    log_error "Backup file is required. Use -f or --file option."
    show_help
    exit 1
fi

if [[ ! "$CLUSTER_NAME" =~ ^(us|france|switzerland)$ ]]; then
    log_error "Invalid cluster name. Must be one of: us, france, switzerland"
    exit 1
fi

if [[ ! "$RESTORE_TYPE" =~ ^(full|db-only|files-only)$ ]]; then
    log_error "Invalid restore type. Must be one of: full, db-only, files-only"
    exit 1
fi

# Set verbose mode
if [[ "$VERBOSE" == "true" ]]; then
    set -x
fi

# Validate backup file exists
BACKUP_PATH="$BACKUP_DIR/${BACKUP_FILE}.tar.gz"
if [[ ! -f "$BACKUP_PATH" ]]; then
    log_error "Backup file not found: $BACKUP_PATH"
    log_info "Use --list to see available backups"
    exit 1
fi

# Extract backup
TEMP_DIR=$(mktemp -d)
EXTRACT_DIR="$TEMP_DIR/$BACKUP_FILE"

cleanup_temp() {
    rm -rf "$TEMP_DIR"
}
trap cleanup_temp EXIT

log_info "Extracting backup archive..."
tar xzf "$BACKUP_PATH" -C "$TEMP_DIR"

if [[ ! -d "$EXTRACT_DIR" ]]; then
    log_error "Failed to extract backup or invalid backup structure"
    exit 1
fi

# Verify backup metadata
METADATA_FILE="$EXTRACT_DIR/metadata.json"
if [[ ! -f "$METADATA_FILE" ]]; then
    log_error "Backup metadata not found. This may not be a valid backup."
    exit 1
fi

# Parse metadata
BACKUP_CLUSTER=$(python3 -c "import json; print(json.load(open('$METADATA_FILE'))['cluster'])" 2>/dev/null || echo "unknown")
BACKUP_TYPE_META=$(python3 -c "import json; print(json.load(open('$METADATA_FILE'))['backup_type'])" 2>/dev/null || echo "unknown")
BACKUP_DATE=$(python3 -c "import json; print(json.load(open('$METADATA_FILE'))['date'])" 2>/dev/null || echo "unknown")

# Validate backup cluster matches
if [[ "$BACKUP_CLUSTER" != "$CLUSTER_NAME" ]]; then
    log_warn "Backup cluster ($BACKUP_CLUSTER) does not match target cluster ($CLUSTER_NAME)"
    if [[ "$FORCE_RESTORE" != "true" ]]; then
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Restore aborted by user"
            exit 0
        fi
    fi
fi

# Load environment configuration
ENV_FILE="$PROJECT_ROOT/.env.$CLUSTER_NAME"
if [[ ! -f "$ENV_FILE" ]]; then
    log_warn "Environment file not found: $ENV_FILE"
    log_info "Using default .env file"
    ENV_FILE="$PROJECT_ROOT/.env"
fi

if [[ -f "$ENV_FILE" ]]; then
    log_info "Loading environment from: $ENV_FILE"
    export $(grep -v '^#' "$ENV_FILE" | xargs)
else
    log_error "No environment file found. Please create .env or .env.$CLUSTER_NAME"
    exit 1
fi

# Confirmation prompt
if [[ "$FORCE_RESTORE" != "true" ]]; then
    echo
    echo "=== Restore Confirmation ==="
    echo "Cluster: $CLUSTER_NAME"
    echo "Backup: $BACKUP_FILE"
    echo "Backup Date: $BACKUP_DATE"
    echo "Restore Type: $RESTORE_TYPE"
    echo
    log_warn "This will overwrite existing data!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Restore aborted by user"
        exit 0
    fi
fi

# Function to restore database
restore_database() {
    log_info "Restoring database..."
    
    # Check if database backup exists
    DB_BACKUP_FILE="$EXTRACT_DIR/database_"*.sql.gz
    if [[ ! -f $DB_BACKUP_FILE ]]; then
        log_error "Database backup file not found in archive"
        return 1
    fi
    
    # Ensure PostgreSQL container is running
    if ! docker-compose -f "$PROJECT_ROOT/infrastructure/docker/docker-compose.yml" ps postgres | grep -q "Up"; then
        log_info "Starting PostgreSQL container..."
        docker-compose -f "$PROJECT_ROOT/infrastructure/docker/docker-compose.yml" up -d postgres
        
        # Wait for PostgreSQL to be ready
        log_info "Waiting for PostgreSQL to be ready..."
        sleep 30
    fi
    
    # Create a backup of current database before restore
    CURRENT_BACKUP_FILE="/tmp/current_db_backup_$(date +%Y%m%d_%H%M%S).sql"
    log_info "Creating backup of current database..."
    docker-compose -f "$PROJECT_ROOT/infrastructure/docker/docker-compose.yml" exec -T postgres pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" > "$CURRENT_BACKUP_FILE" || log_warn "Failed to backup current database"
    
    # Drop and recreate database
    log_info "Dropping and recreating database..."
    docker-compose -f "$PROJECT_ROOT/infrastructure/docker/docker-compose.yml" exec -T postgres psql -U "${POSTGRES_USER}" -c "DROP DATABASE IF EXISTS \"${POSTGRES_DB}\";"
    docker-compose -f "$PROJECT_ROOT/infrastructure/docker/docker-compose.yml" exec -T postgres psql -U "${POSTGRES_USER}" -c "CREATE DATABASE \"${POSTGRES_DB}\";"
    
    # Restore database from backup
    log_info "Restoring database from backup..."
    if ! zcat "$DB_BACKUP_FILE" | docker-compose -f "$PROJECT_ROOT/infrastructure/docker/docker-compose.yml" exec -T postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"; then
        log_error "Database restore failed"
        if [[ -f "$CURRENT_BACKUP_FILE" ]]; then
            log_info "Attempting to restore from current backup..."
            cat "$CURRENT_BACKUP_FILE" | docker-compose -f "$PROJECT_ROOT/infrastructure/docker/docker-compose.yml" exec -T postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"
        fi
        return 1
    fi
    
    # Clean up temporary backup
    rm -f "$CURRENT_BACKUP_FILE"
    
    log_success "Database restore completed"
}

# Function to restore application files
restore_files() {
    log_info "Restoring application files..."
    
    # Restore configuration files
    if [[ -d "$EXTRACT_DIR/config" ]]; then
        log_info "Restoring configuration files..."
        
        # Backup current configuration
        if [[ -f "$ENV_FILE" ]]; then
            cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
        fi
        
        # Restore environment file if it exists in backup
        if [[ -f "$EXTRACT_DIR/config/.env.$CLUSTER_NAME" ]]; then
            cp "$EXTRACT_DIR/config/.env.$CLUSTER_NAME" "$PROJECT_ROOT/.env.$CLUSTER_NAME"
            log_success "Environment file restored"
        elif [[ -f "$EXTRACT_DIR/config/.env" ]]; then
            cp "$EXTRACT_DIR/config/.env" "$PROJECT_ROOT/.env"
            log_success "Environment file restored"
        fi
        
        # Restore infrastructure configuration
        if [[ -d "$EXTRACT_DIR/config/infrastructure" ]]; then
            cp -r "$EXTRACT_DIR/config/infrastructure"/* "$PROJECT_ROOT/infrastructure/"
            log_success "Infrastructure configuration restored"
        fi
    fi
    
    # Restore Docker volumes
    if [[ -d "$EXTRACT_DIR/volumes" ]]; then
        log_info "Restoring Docker volumes..."
        
        # Stop containers to safely restore volumes
        docker-compose -f "$PROJECT_ROOT/infrastructure/docker/docker-compose.yml" down
        
        # Restore PostgreSQL volume
        if [[ -f "$EXTRACT_DIR/volumes/postgres_data_"*.tar.gz ]]; then
            log_info "Restoring PostgreSQL data volume..."
            POSTGRES_VOLUME=$(docker volume ls -q | grep postgres_data || docker volume create postgres_data)
            zcat "$EXTRACT_DIR/volumes/postgres_data_"*.tar.gz | docker run --rm -i -v "$POSTGRES_VOLUME":/target alpine tar xzf - -C /target
            log_success "PostgreSQL volume restored"
        fi
        
        # Restore Redis volume
        if [[ -f "$EXTRACT_DIR/volumes/redis_data_"*.tar.gz ]]; then
            log_info "Restoring Redis data volume..."
            REDIS_VOLUME=$(docker volume ls -q | grep redis_data || docker volume create redis_data)
            zcat "$EXTRACT_DIR/volumes/redis_data_"*.tar.gz | docker run --rm -i -v "$REDIS_VOLUME":/target alpine tar xzf - -C /target
            log_success "Redis volume restored"
        fi
    fi
    
    log_success "Application files restore completed"
}

# Function to verify restore
verify_restore() {
    log_info "Verifying restore..."
    
    # Start services
    docker-compose -f "$PROJECT_ROOT/infrastructure/docker/docker-compose.yml" up -d
    
    # Wait for services to be ready
    sleep 30
    
    # Check if services are running
    SERVICES=(postgres backend frontend)
    for service in "${SERVICES[@]}"; do
        if docker-compose -f "$PROJECT_ROOT/infrastructure/docker/docker-compose.yml" ps "$service" | grep -q "Up"; then
            log_success "Service $service is running"
        else
            log_error "Service $service is not running"
            return 1
        fi
    done
    
    # Test database connection
    if docker-compose -f "$PROJECT_ROOT/infrastructure/docker/docker-compose.yml" exec -T postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "SELECT 1;" > /dev/null; then
        log_success "Database connection verified"
    else
        log_error "Database connection failed"
        return 1
    fi
    
    # Test API endpoint
    sleep 10
    if curl -f -s "http://localhost:${BACKEND_PORT:-3001}/health" > /dev/null; then
        log_success "API endpoint verified"
    else
        log_warn "API endpoint not responding (this may be normal if the service is still starting)"
    fi
    
    log_success "Restore verification completed"
}

# Main restore process
main() {
    log_info "Starting restore process..."
    log_info "Cluster: $CLUSTER_NAME"
    log_info "Backup: $BACKUP_FILE"
    log_info "Restore type: $RESTORE_TYPE"
    
    # Perform restore based on type
    case "$RESTORE_TYPE" in
        full)
            restore_database
            restore_files
            ;;
        db-only)
            restore_database
            ;;
        files-only)
            restore_files
            ;;
    esac
    
    # Verify restore
    verify_restore
    
    log_success "Restore completed successfully!"
    echo
    echo "=== Restore Summary ==="
    echo "Cluster: $CLUSTER_NAME"
    echo "Backup: $BACKUP_FILE"
    echo "Restore type: $RESTORE_TYPE"
    echo "Backup date: $BACKUP_DATE"
    echo
    echo "=== Next Steps ==="
    echo "1. Verify application functionality"
    echo "2. Check logs: docker-compose logs -f"
    echo "3. Test API endpoints"
    echo "4. Verify data integrity"
    echo
    log_success "Restore process completed successfully!"
}

# Run main function
main "$@"