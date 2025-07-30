#!/bin/bash

# Production deployment script for InsiderPulse API
set -e

echo "🚀 Starting InsiderPulse API deployment..."

# Check if required environment variables are set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Error: GEMINI_API_KEY environment variable is required"
    exit 1
fi

# Create logs directory
mkdir -p logs

# Build and start services
echo "📦 Building Docker images..."
docker-compose build --no-cache

echo "🔄 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if docker-compose ps | grep -q "healthy"; then
        echo "✅ Services are healthy!"
        break
    fi
    
    if [ $counter -eq $((timeout - 1)) ]; then
        echo "❌ Services failed to become healthy within $timeout seconds"
        docker-compose logs
        exit 1
    fi
    
    sleep 1
    counter=$((counter + 1))
done

# Show running services
echo "📊 Service status:"
docker-compose ps

echo "🎉 Deployment completed successfully!"
echo "🌐 API is available at: http://localhost:3001"
echo "📋 Health check: http://localhost:3001/health"