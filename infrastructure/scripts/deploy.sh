#!/bin/bash

# Script de Déploiement MSPR
# Ce script gère le déploiement de l'application MSPR sur différents clusters

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/infrastructure/docker"

# Valeurs par défaut
CLUSTER_NAME=""
ENVIRONMENT="production"
SKIP_BACKUP=false
FORCE_RECREATE=false
VERBOSE=false

# Couleurs pour la sortie
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Pas de couleur

# Fonctions de journalisation
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERREUR]${NC} $1"
}

# Fonction d'aide
show_help() {
    cat << EOF
Script de Déploiement MSPR

Usage : $0 [OPTIONS]

Options :
    -c, --cluster CLUSTER       Cluster à déployer (us, france, switzerland)
    -e, --environment ENV       Environnement (development, staging, production)
    -s, --skip-backup          Ignorer la sauvegarde de base de données avant le déploiement
    -f, --force-recreate       Forcer la recréation des conteneurs
    -v, --verbose              Activer la sortie détaillée
    -h, --help                 Afficher ce message d'aide

Exemples :
    $0 --cluster us --environment production
    $0 -c france -e staging --skip-backup
    $0 --cluster switzerland --force-recreate

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--cluster)
            CLUSTER_NAME="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -s|--skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        -f|--force-recreate)
            FORCE_RECREATE=true
            shift
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

if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    log_error "Invalid environment. Must be one of: development, staging, production"
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

# Validate Docker and Docker Compose
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed or not in PATH"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    log_error "Docker daemon is not running"
    exit 1
fi

# Create backup before deployment (if not skipped)
if [[ "$SKIP_BACKUP" != "true" && "$ENVIRONMENT" == "production" ]]; then
    log_info "Creating backup before deployment..."
    if ! "$SCRIPT_DIR/backup.sh" --cluster "$CLUSTER_NAME"; then
        log_error "Backup failed. Deployment aborted."
        exit 1
    fi
    log_success "Backup completed successfully"
fi

# Set Docker Compose profiles based on cluster
DOCKER_COMPOSE_PROFILES=""
case "$CLUSTER_NAME" in
    us)
        DOCKER_COMPOSE_PROFILES="--profile etl --profile cache"
        if [[ "$ENVIRONMENT" == "production" ]]; then
            DOCKER_COMPOSE_PROFILES="$DOCKER_COMPOSE_PROFILES --profile production"
        fi
        ;;
    france)
        DOCKER_COMPOSE_PROFILES="--profile etl --profile cache"
        if [[ "$ENVIRONMENT" == "production" ]]; then
            DOCKER_COMPOSE_PROFILES="$DOCKER_COMPOSE_PROFILES --profile production"
        fi
        ;;
    switzerland)
        DOCKER_COMPOSE_PROFILES=""
        if [[ "$ENVIRONMENT" == "production" ]]; then
            DOCKER_COMPOSE_PROFILES="--profile production"
        fi
        ;;
esac

# Build images
log_info "Building Docker images for cluster: $CLUSTER_NAME"
cd "$DOCKER_DIR"

BUILD_ARGS=""
if [[ "$FORCE_RECREATE" == "true" ]]; then
    BUILD_ARGS="--no-cache"
fi

if ! docker-compose build $BUILD_ARGS; then
    log_error "Failed to build Docker images"
    exit 1
fi

# Stop existing containers if running
log_info "Stopping existing containers..."
docker-compose down $DOCKER_COMPOSE_PROFILES || true

# Start services
log_info "Starting services for cluster: $CLUSTER_NAME"
if [[ "$FORCE_RECREATE" == "true" ]]; then
    docker-compose up -d --force-recreate $DOCKER_COMPOSE_PROFILES
else
    docker-compose up -d $DOCKER_COMPOSE_PROFILES
fi

# Wait for services to be healthy
log_info "Waiting for services to be healthy..."
sleep 30

# Check service health
log_info "Checking service health..."
SERVICES=(postgres backend frontend)

if [[ "$CLUSTER_NAME" == "us" || "$CLUSTER_NAME" == "france" ]]; then
    SERVICES+=(etl redis)
fi

if [[ "$ENVIRONMENT" == "production" ]]; then
    SERVICES+=(nginx)
fi

for service in "${SERVICES[@]}"; do
    if docker-compose ps --services --filter "status=running" | grep -q "^$service$"; then
        # Check if service is healthy
        health_status=$(docker-compose ps --format "table {{.Name}}\t{{.Status}}" | grep "$service" | awk '{print $2}')
        if [[ "$health_status" == *"healthy"* ]] || [[ "$health_status" == *"Up"* ]]; then
            log_success "Service $service is running and healthy"
        else
            log_warn "Service $service is running but may not be healthy: $health_status"
        fi
    else
        log_error "Service $service is not running"
        exit 1
    fi
done

# Run database migrations
log_info "Running database migrations..."
if ! docker-compose exec backend pnpm dlx prisma migrate deploy; then
    log_error "Database migration failed"
    exit 1
fi

# Seed database if needed
if [[ "$ENVIRONMENT" == "development" ]]; then
    log_info "Seeding database with sample data..."
    docker-compose exec backend pnpm dlx prisma db seed || log_warn "Database seeding failed or not configured"
fi

# Display deployment summary
log_success "Deployment completed successfully!"
echo
echo "=== Deployment Summary ==="
echo "Cluster: $CLUSTER_NAME"
echo "Environment: $ENVIRONMENT"
echo "Services: ${SERVICES[*]}"
echo
echo "=== Service URLs ==="
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo "Frontend: http://localhost:${NGINX_HTTP_PORT:-80}"
    echo "API: http://localhost:${NGINX_HTTP_PORT:-80}/api"
else
    echo "Frontend: http://localhost:${FRONTEND_PORT:-3000}"
    echo "API: http://localhost:${BACKEND_PORT:-3001}"
fi
echo
echo "=== Logs ==="
echo "To view logs: docker-compose logs -f [service_name]"
echo "To stop services: docker-compose down"
echo
log_success "Deployment script completed successfully!"