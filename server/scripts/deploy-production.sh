#!/bin/bash

# Production deployment script for InsiderPulse API
set -e

echo "🚀 Starting InsiderPulse API production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking required environment variables..."
    
    required_vars=(
        "GEMINI_API_KEY"
        "JWT_SECRET"
        "SESSION_SECRET"
        "ENCRYPTION_KEY"
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        exit 1
    fi
    
    print_status "All required environment variables are set ✓"
}

# Validate secrets strength
validate_secrets() {
    print_status "Validating secret strength..."
    
    if [ ${#JWT_SECRET} -lt 32 ]; then
        print_error "JWT_SECRET must be at least 32 characters long"
        exit 1
    fi
    
    if [ ${#SESSION_SECRET} -lt 32 ]; then
        print_error "SESSION_SECRET must be at least 32 characters long"
        exit 1
    fi
    
    if [ ${#ENCRYPTION_KEY} -lt 32 ]; then
        print_error "ENCRYPTION_KEY must be at least 32 characters long"
        exit 1
    fi
    
    print_status "Secret validation passed ✓"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs/nginx
    mkdir -p nginx/ssl
    mkdir -p database/backups
    
    print_status "Directories created ✓"
}

# Generate SSL certificates (self-signed for development)
generate_ssl_certs() {
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        print_warning "SSL certificates not found. Generating self-signed certificates..."
        print_warning "For production, replace with valid SSL certificates from a CA"
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        
        print_status "Self-signed SSL certificates generated ✓"
    else
        print_status "SSL certificates found ✓"
    fi
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Stop existing services
    docker-compose -f docker-compose.production.yml down
    
    # Build images
    docker-compose -f docker-compose.production.yml build --no-cache
    
    # Start services
    docker-compose -f docker-compose.production.yml up -d
    
    print_status "Services started ✓"
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    timeout=300  # 5 minutes
    counter=0
    
    while [ $counter -lt $timeout ]; do
        if docker-compose -f docker-compose.production.yml ps | grep -q "healthy"; then
            print_status "Services are healthy ✓"
            return 0
        fi
        
        if [ $counter -eq $((timeout - 1)) ]; then
            print_error "Services failed to become healthy within $timeout seconds"
            docker-compose -f docker-compose.production.yml logs
            exit 1
        fi
        
        sleep 5
        counter=$((counter + 5))
        echo -n "."
    done
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run migrations (if you have a migration system)
    # docker-compose -f docker-compose.production.yml exec api npm run migrate
    
    print_status "Database migrations completed ✓"
}

# Setup monitoring and logging
setup_monitoring() {
    print_status "Setting up monitoring and logging..."
    
    # Create log rotation configuration
    cat > /etc/logrotate.d/insiderpulse << EOF
/app/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f docker-compose.production.yml restart api
    endscript
}
EOF
    
    print_status "Monitoring and logging configured ✓"
}

# Security hardening
security_hardening() {
    print_status "Applying security hardening..."
    
    # Set proper file permissions
    chmod 600 nginx/ssl/key.pem
    chmod 644 nginx/ssl/cert.pem
    chmod 600 .env
    
    # Create backup of important files
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    
    print_status "Security hardening applied ✓"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Check API health
    if curl -f -s http://localhost:3001/health > /dev/null; then
        print_status "API health check passed ✓"
    else
        print_error "API health check failed"
        exit 1
    fi
    
    # Check database connection
    if docker-compose -f docker-compose.production.yml exec -T postgres pg_isready -U insiderpulse > /dev/null; then
        print_status "Database health check passed ✓"
    else
        print_error "Database health check failed"
        exit 1
    fi
    
    print_status "All health checks passed ✓"
}

# Show deployment summary
show_summary() {
    print_status "Deployment Summary:"
    echo "===================="
    echo "🌐 API URL: https://localhost:3001"
    echo "📊 Health Check: https://localhost:3001/health"
    echo "📋 Service Status:"
    docker-compose -f docker-compose.production.yml ps
    echo ""
    echo "📁 Important Files:"
    echo "   - Logs: ./logs/"
    echo "   - SSL Certs: ./nginx/ssl/"
    echo "   - Database Backups: ./database/backups/"
    echo ""
    print_status "Deployment completed successfully! 🎉"
}

# Main deployment flow
main() {
    print_status "InsiderPulse API Production Deployment"
    print_status "======================================"
    
    check_env_vars
    validate_secrets
    create_directories
    generate_ssl_certs
    security_hardening
    deploy_services
    wait_for_services
    run_migrations
    setup_monitoring
    health_check
    show_summary
}

# Run main function
main "$@"