#!/bin/bash

# =============================================================================
# IMARISHA LOAN SYSTEM - POSTGRESQL SETUP SCRIPT
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_info "Created .env file from .env.example"
            print_warning "Please update .env file with your PostgreSQL credentials"
        else
            print_error ".env.example not found. Cannot create .env file."
            exit 1
        fi
    else
        print_success ".env file exists"
    fi
}

# Start PostgreSQL and Redis using Docker Compose
start_databases() {
    print_info "Starting PostgreSQL and Redis containers..."
    
    # Start only the database services first
    docker-compose up -d postgres redis
    
    # Wait for PostgreSQL to be ready
    print_info "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Check if PostgreSQL is ready
    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
            print_success "PostgreSQL is ready!"
            break
        fi
        
        if [ $i -eq 30 ]; then
            print_error "PostgreSQL failed to start after 30 attempts"
            exit 1
        fi
        
        print_info "Waiting for PostgreSQL... (attempt $i/30)"
        sleep 2
    done
}

# Run database migrations
run_migrations() {
    print_info "Running database migrations..."
    
    cd backend
    
    # Install dependencies if needed
    if [ ! -d "venv" ]; then
        print_info "Installing Python dependencies..."
        pip install -r requirements.txt
    fi
    
    # Set environment variables for local development
    export FLASK_APP=run.py
    export FLASK_ENV=development
    
    # Run migrations
    flask db upgrade
    
    # Seed the database
    python seed.py
    
    cd ..
    
    print_success "Database migrations completed"
}

# Start the application
start_application() {
    print_info "Starting the application..."
    
    # Start all services
    docker-compose up -d
    
    print_success "Application started successfully!"
    print_info "Backend API: http://localhost:5000"
    print_info "Frontend: http://localhost:3000"
    print_info "PostgreSQL: localhost:5432"
    print_info "Redis: localhost:6379"
}

# Show status
show_status() {
    print_info "Checking service status..."
    docker-compose ps
}

# Main execution
main() {
    print_info "🚀 Starting Imarisha Loan System PostgreSQL Setup"
    
    # Check prerequisites
    check_docker
    check_env_file
    
    # Start databases
    start_databases
    
    # Run migrations
    run_migrations
    
    # Start application
    start_application
    
    # Show status
    show_status
    
    print_success "🎉 Setup completed successfully!"
    print_info "Your Imarisha Loan System is now running with PostgreSQL!"
    print_warning "Access the application at: http://localhost:3000"
}

# Handle script arguments
case "${1:-}" in
    "start")
        main
        ;;
    "stop")
        print_info "Stopping all services..."
        docker-compose down
        print_success "Services stopped"
        ;;
    "restart")
        print_info "Restarting all services..."
        docker-compose restart
        print_success "Services restarted"
        ;;
    "status")
        show_status
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "migrate")
        run_migrations
        ;;
    "clean")
        print_warning "This will remove all containers and volumes!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            docker system prune -f
            print_success "Cleaned up containers and volumes"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|migrate|clean}"
        echo ""
        echo "Commands:"
        echo "  start   - Start PostgreSQL and the application"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  status  - Show service status"
        echo "  logs    - Show application logs"
        echo "  migrate - Run database migrations"
        echo "  clean   - Remove all containers and volumes"
        ;;
esac
