#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/infrastructure/docker/docker-compose.yml"

load_env() {
    if [ -f "$SCRIPT_DIR/.env" ]; then
        echo "📁 Loading environment variables from .env..."
        export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
    else
        echo "⚠️  Warning: .env file not found"
    fi
}

start() {
    echo "🚀 Starting MSPR Application..."
    load_env
    
    echo "🐳 Starting Docker Compose services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    echo "✅ Services started successfully!"
    echo "🌐 Frontend: http://localhost:${FRONTEND_PORT:-3000}"
    echo "🔗 Backend API: http://localhost:${BACKEND_PORT:-3001}"
    echo "📊 Database: localhost:${POSTGRES_PORT:-5455}"
    
    echo ""
    echo "To view logs: ./mspr.sh logs"
}

stop() {
    echo "🛑 Stopping MSPR Application..."
    docker-compose -f "$COMPOSE_FILE" down
    echo "✅ Services stopped successfully!"
}

delete() {
    echo "🗑️  Deleting MSPR Application and cleaning up..."
    docker-compose -f "$COMPOSE_FILE" down --volumes --remove-orphans
    
    echo "🧹 Pruning build cache and images..."
    docker system prune -af --volumes
    docker builder prune -af
    
    echo "✅ Cleanup completed successfully!"
}

logs() {
    docker-compose -f "$COMPOSE_FILE" logs -f
}

populate_data() {
    echo "📊 Populating database with data..."
    load_env
    
    # Check if services are running
    if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        echo "⚠️  Services are not running. Starting them first..."
        start
        echo "⏳ Waiting for services to be ready..."
        sleep 10
    fi
    
    # Get the actual network name created by docker-compose
    NETWORK_NAME=$(docker network ls --format "{{.Name}}" | grep mspr-network)
    
    # Run all Python scripts in a single container to share environment and files
    echo "🐍 Running data population scripts (fetch.py, main.py, model.py, postgress.py)..."
    docker run --rm \
        --network "$NETWORK_NAME" \
        -v "$SCRIPT_DIR:/app" \
        -w /app \
        --env-file "$SCRIPT_DIR/.env" \
        python:3.11-slim bash -c "
            echo '📦 Installing dependencies...' && \
            apt-get update && apt-get install -y curl && \
            pip install -r requirements.txt && \
            echo '🐍 Running fetch.py to download data...' && \
            python fetch.py && \
            echo '🔄 Running main.py to process data...' && \
            python main.py && \
            echo '🤖 Running model.py to train and populate model data...' && \
            python model.py && \
            echo '🗄️ Running postgress.py to populate database...' && \
            python postgress.py
        "
    
    echo "✅ Database population completed successfully!"
}

case "$1" in
    start|"")
        start
        ;;
    stop)
        stop
        ;;
    delete)
        delete
        ;;
    logs)
        logs
        ;;
    populate)
        populate_data
        ;;
    restart)
        stop
        start
        ;;
    *)
        echo "Usage: $0 {start|stop|delete|logs|populate|restart}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the MSPR application (default)"
        echo "  stop     - Stop the MSPR application"
        echo "  delete   - Stop services and clean up all Docker data"
        echo "  logs     - Show service logs"
        echo "  populate - Populate database with data (runs fetch.py, main.py, model.py, postgress.py)"
        echo "  restart  - Restart the application"
        exit 1
        ;;
esac