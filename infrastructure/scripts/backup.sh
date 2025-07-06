#!/bin/bash

# MSPR Backup Script
# This script creates backups of the database and application data

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="${BACKUP_STORAGE_PATH:-$PROJECT_ROOT/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Default values
CLUSTER_NAME=""
BACKUP_TYPE="full"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
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
MSPR Backup Script

Usage: $0 [OPTIONS]

Options:
    -c, --cluster CLUSTER       Cluster to backup (us, france, switzerland)
    -t, --type TYPE             Backup type (full, db-only, files-only)
    -r, --retention DAYS        Backup retention in days (default: 30)
    -v, --verbose              Enable verbose output
    -h, --help                 Show this help message

Examples:
    $0 --cluster us --type full
    $0 -c france -t db-only
    $0 --cluster switzerland --retention 60

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--cluster)
            CLUSTER_NAME="$2"
            shift 2
            ;;
        -t|--type)
            BACKUP_TYPE="$2"
            shift 2
            ;;
        -r|--retention)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
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

if [[ ! "$CLUSTER_NAME" =~ ^(us|france|switzerland)$ ]]; then
    log_error "Invalid cluster name. Must be one of: us, france, switzerland"
    exit 1
fi

if [[ ! "$BACKUP_TYPE" =~ ^(full|db-only|files-only)$ ]]; then
    log_error "Invalid backup type. Must be one of: full, db-only, files-only"
    exit 1
fi

# Set verbose mode
if [[ "$VERBOSE" == "true" ]]; then
    set -x
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

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup filename
BACKUP_NAME="mspr_${CLUSTER_NAME}_${BACKUP_TYPE}_${TIMESTAMP}"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

log_info "Starting backup process..."
log_info "Cluster: $CLUSTER_NAME"
log_info "Backup type: $BACKUP_TYPE"
log_info "Backup path: $BACKUP_PATH"

# Create backup directory for this backup
mkdir -p "$BACKUP_PATH"

# Function to backup database
backup_database() {
    log_info "Creating database backup..."
    
    # Check if postgres container is running
    if ! docker-compose -f "$PROJECT_ROOT/infrastructure/docker/docker-compose.yml" ps postgres | grep -q "Up"; then
        log_error "PostgreSQL container is not running"
        return 1
    fi
    
    # Create database dump
    DB_BACKUP_FILE="$BACKUP_PATH/database_${TIMESTAMP}.sql"
    
    if ! docker-compose -f "$PROJECT_ROOT/infrastructure/docker/docker-compose.yml" exec -T postgres pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" > "$DB_BACKUP_FILE"; then
        log_error "Database backup failed"
        return 1
    fi
    
    # Compress database backup
    if ! gzip "$DB_BACKUP_FILE"; then
        log_error "Database backup compression failed"
        return 1
    fi
    
    log_success "Database backup completed: ${DB_BACKUP_FILE}.gz"
    
    # Create database schema backup
    SCHEMA_BACKUP_FILE="$BACKUP_PATH/schema_${TIMESTAMP}.sql"
    
    if ! docker-compose -f "$PROJECT_ROOT/infrastructure/docker/docker-compose.yml" exec -T postgres pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --schema-only > "$SCHEMA_BACKUP_FILE"; then
        log_warn "Schema backup failed"
    else
        gzip "$SCHEMA_BACKUP_FILE"
        log_success "Schema backup completed: ${SCHEMA_BACKUP_FILE}.gz"
    fi
}

# Function to backup application files
backup_files() {
    log_info "Creating files backup..."
    
    # Backup configuration files
    CONFIG_BACKUP_DIR="$BACKUP_PATH/config"
    mkdir -p "$CONFIG_BACKUP_DIR"
    
    # Copy environment files
    if [[ -f "$ENV_FILE" ]]; then
        cp "$ENV_FILE" "$CONFIG_BACKUP_DIR/"
    fi
    
    # Copy Docker configurations
    cp -r "$PROJECT_ROOT/infrastructure" "$CONFIG_BACKUP_DIR/"
    
    # Backup persistent data volumes
    VOLUMES_BACKUP_DIR="$BACKUP_PATH/volumes"
    mkdir -p "$VOLUMES_BACKUP_DIR"
    
    # Get Docker volume names
    POSTGRES_VOLUME=$(docker volume ls -q | grep postgres_data || true)
    REDIS_VOLUME=$(docker volume ls -q | grep redis_data || true)
    
    if [[ -n "$POSTGRES_VOLUME" ]]; then
        log_info "Backing up PostgreSQL data volume..."
        docker run --rm -v "$POSTGRES_VOLUME":/source -v "$VOLUMES_BACKUP_DIR":/backup alpine tar czf /backup/postgres_data_${TIMESTAMP}.tar.gz -C /source .
    fi
    
    if [[ -n "$REDIS_VOLUME" ]]; then
        log_info "Backing up Redis data volume..."
        docker run --rm -v "$REDIS_VOLUME":/source -v "$VOLUMES_BACKUP_DIR":/backup alpine tar czf /backup/redis_data_${TIMESTAMP}.tar.gz -C /source .
    fi
    
    # Backup application logs
    LOGS_BACKUP_DIR="$BACKUP_PATH/logs"
    mkdir -p "$LOGS_BACKUP_DIR"
    
    # Copy logs from running containers
    CONTAINERS=(postgres backend frontend)
    if [[ "$CLUSTER_NAME" == "us" || "$CLUSTER_NAME" == "france" ]]; then
        CONTAINERS+=(etl redis)
    fi
    
    for container in "${CONTAINERS[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "mspr-$container"; then
            log_info "Backing up logs for $container..."
            docker logs "mspr-$container" > "$LOGS_BACKUP_DIR/${container}_${TIMESTAMP}.log" 2>&1 || true
        fi
    done
    
    log_success "Files backup completed"
}

# Function to create backup metadata
create_metadata() {
    log_info "Creating backup metadata..."
    
    METADATA_FILE="$BACKUP_PATH/metadata.json"
    
    cat > "$METADATA_FILE" << EOF
{
    "backup_name": "$BACKUP_NAME",
    "cluster": "$CLUSTER_NAME",
    "backup_type": "$BACKUP_TYPE",
    "timestamp": "$TIMESTAMP",
    "date": "$(date -Iseconds)",
    "retention_days": $RETENTION_DAYS,
    "database": {
        "name": "${POSTGRES_DB}",
        "user": "${POSTGRES_USER}"
    },
    "services": $(docker-compose -f "$PROJECT_ROOT/infrastructure/docker/docker-compose.yml" ps --services | jq -R . | jq -s .),
    "docker_images": $(docker images --format "table {{.Repository}}:{{.Tag}}" | tail -n +2 | jq -R . | jq -s .),
    "environment": {
        "NODE_ENV": "${NODE_ENV:-}",
        "CLUSTER_FEATURES": "${CLUSTER_FEATURES:-}",
        "CLUSTER_LANGUAGES": "${CLUSTER_LANGUAGES:-}"
    }
}
EOF
    
    log_success "Metadata created: $METADATA_FILE"
}

# Function to verify backup integrity
verify_backup() {
    log_info "Verifying backup integrity..."
    
    # Check if backup directory exists and is not empty
    if [[ ! -d "$BACKUP_PATH" || -z "$(ls -A "$BACKUP_PATH")" ]]; then
        log_error "Backup directory is empty or doesn't exist"
        return 1
    fi
    
    # Verify database backup if it exists
    if [[ -f "$BACKUP_PATH/database_${TIMESTAMP}.sql.gz" ]]; then
        if ! gzip -t "$BACKUP_PATH/database_${TIMESTAMP}.sql.gz"; then
            log_error "Database backup file is corrupted"
            return 1
        fi
        log_success "Database backup verified"
    fi
    
    # Verify metadata file
    if [[ -f "$BACKUP_PATH/metadata.json" ]]; then
        if ! python3 -m json.tool "$BACKUP_PATH/metadata.json" > /dev/null; then
            log_error "Metadata file is corrupted"
            return 1
        fi
        log_success "Metadata file verified"
    fi
    
    log_success "Backup integrity verification completed"
}

# Function to clean old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups (retention: $RETENTION_DAYS days)..."
    
    # Find and remove backups older than retention period
    find "$BACKUP_DIR" -name "mspr_${CLUSTER_NAME}_*" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true
    
    log_success "Old backups cleaned up"
}

# Main backup process
main() {
    log_info "Starting backup process for cluster: $CLUSTER_NAME"
    
    # Perform backup based on type
    case "$BACKUP_TYPE" in
        full)
            backup_database
            backup_files
            ;;
        db-only)
            backup_database
            ;;
        files-only)
            backup_files
            ;;
    esac
    
    # Create metadata and verify
    create_metadata
    verify_backup
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Create final compressed archive
    log_info "Creating final backup archive..."
    cd "$BACKUP_DIR"
    tar czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"
    
    FINAL_BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
    
    log_success "Backup completed successfully!"
    echo
    echo "=== Backup Summary ==="
    echo "Backup file: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    echo "Backup size: $FINAL_BACKUP_SIZE"
    echo "Backup type: $BACKUP_TYPE"
    echo "Cluster: $CLUSTER_NAME"
    echo "Timestamp: $TIMESTAMP"
    echo
    log_success "Backup process completed successfully!"
}

# Run main function
main "$@"