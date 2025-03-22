#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print with timestamp
log() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

# Function to handle errors
handle_error() {
    echo -e "\033[0;31mError: $1\033[0m"
    exit 1
}

# Setup backend
log "${GREEN}Setting up backend...${NC}"
cd backend || handle_error "Backend directory not found"
log "Installing backend dependencies..."
npm install || handle_error "Failed to install backend dependencies"
npm run build || handle_error "Failed to build backend"

# Setup frontend
log "${GREEN}Setting up frontend...${NC}"
cd ../frontend || handle_error "Frontend directory not found"
log "Installing frontend dependencies..."
npm install || handle_error "Failed to install frontend dependencies"

# Start both services
log "${GREEN}Starting services...${NC}"

# Start backend in background
cd ../backend || handle_error "Backend directory not found"
log "Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Start frontend in background
cd ../frontend || handle_error "Frontend directory not found"
log "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

# Handle script termination
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null' EXIT

# Keep script running and show status
log "${GREEN}Services started successfully!${NC}"
log "Backend running on http://localhost:8080"
log "Frontend running on http://localhost:3000"
log "Press Ctrl+C to stop all services"

# Wait for both processes
wait
