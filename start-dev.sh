#!/bin/bash

# 🚀 Imarisha Loan - Local Development Startup Script
# This script sets up and starts both backend and frontend locally

set -e

echo "🚀 Starting Imarisha Loan Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# BACKEND SETUP
# ============================================================================
echo -e "${BLUE}📍 Setting up Backend...${NC}"
cd backend

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -q -r requirements.txt

# Initialize database
if [ ! -f "imarisha.db" ]; then
    echo "Initializing database..."
    flask db upgrade 2>/dev/null || true
fi

# Seed database if first time
if [ ! -f ".seeded" ]; then
    echo "Seeding database with test data..."
    python seed.py
    touch .seeded
fi

echo -e "${GREEN}✓ Backend ready${NC}"

# Start backend in background
echo "Starting backend server..."
python run.py &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend running on http://localhost:5000 (PID: $BACKEND_PID)${NC}"
echo ""

# ============================================================================
# FRONTEND SETUP
# ============================================================================
echo -e "${BLUE}📍 Setting up Frontend...${NC}"
cd ../frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install -q
fi

echo -e "${GREEN}✓ Frontend ready${NC}"

# Start frontend
echo "Starting frontend dev server..."
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend running on http://localhost:5173${NC}"
echo ""

# ============================================================================
# SUMMARY
# ============================================================================
echo "================================"
echo -e "${GREEN}✅ DEVELOPMENT ENVIRONMENT STARTED!${NC}"
echo "================================"
echo ""
echo "📊 ENDPOINTS:"
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:5173 (or http://localhost:3000)"
echo ""
echo "🔑 TEST CREDENTIALS:"
echo "   Admin:       admin / admin123"
echo "   Loan Officer: james.mutua / officer123"
echo "   Field Officer: field.john.kipchoge / officer123"
echo "   Customer:    member.0.0 / customer123"
echo ""
echo "📚 Documentation:"
echo "   LOCAL_SETUP.md - Complete setup guide"
echo "   CHANGES_SUMMARY.md - What was changed"
echo ""
echo "⚡ Commands:"
echo "   Press Ctrl+C to stop servers"
echo "   Backend logs: (above)"
echo "   Frontend logs: (above)"
echo ""

# Wait for processes
wait

