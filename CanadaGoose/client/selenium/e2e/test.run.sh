#!/bin/bash

set -e

echo "🚀 Starting Selenium E2E Test Suite..."
echo "======================================"

# Store the original directory
ORIGINAL_DIR=$(pwd)

# Function to cleanup background processes and Docker containers
cleanup() {
    echo "🧹 Cleaning up background processes and containers..."
    
    # Stop background servers
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Stop Docker containers
    echo "Stopping Docker containers..."
    cd "$ORIGINAL_DIR/../../.."
    docker-compose down 2>/dev/null || true
    cd "$ORIGINAL_DIR"
    
    echo "Cleanup completed."
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check and kill any processes using ports 3000 and 5173
echo "🔍 Checking for port conflicts..."
if lsof -i :3000 >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is in use. Stopping conflicting process..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if lsof -i :5173 >/dev/null 2>&1; then
    echo "⚠️  Port 5173 is in use. Stopping conflicting process..."
    lsof -ti :5173 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start MySQL database using Docker Compose
echo "🐳 Starting MySQL database..."
cd "$ORIGINAL_DIR/../../.."
docker-compose up -d mysql-db
cd "$ORIGINAL_DIR"

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL database to be ready..."
for i in {1..60}; do
    if docker exec $(docker ps -q --filter "ancestor=mysql:8.0") mysqladmin ping -h localhost -u root -prootpass >/dev/null 2>&1; then
        echo "✅ MySQL database is ready!"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "❌ MySQL database failed to start within timeout"
        exit 1
    fi
    echo "⏳ Attempt $i/60: MySQL not ready yet, waiting..."
    sleep 3
done

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating Python virtual environment..."
source venv/bin/activate

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📥 Installing Python dependencies..."
    pip install -r requirements.txt
else
    echo "📥 Installing required Python packages..."
    pip install selenium webdriver-manager requests
fi

# Start backend server with database environment variables
echo "🔧 Starting backend server..."
cd "$ORIGINAL_DIR/../../../server"
npm install

# Set database environment variables
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=rootpass
export DB_NAME=webapp_db
export JWT_SECRET=chiputaobutuputaopibuchiputaopibuchiputaodaotuputaopi

npm run dev &
BACKEND_PID=$!
cd "$ORIGINAL_DIR"

# Wait for backend to be ready
echo "⏳ Waiting for backend server to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3000/api/healthcheck >/dev/null 2>&1; then
        echo "✅ Backend server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend server failed to start within timeout"
        echo "🔍 Checking backend server logs..."
        ps aux | grep "npm run dev" | grep -v grep || echo "Backend process not found"
        exit 1
    fi
    echo "⏳ Attempt $i/30: Backend not ready yet, waiting..."
    sleep 2
done

# Start frontend server
echo "🔧 Starting frontend server..."
cd "$ORIGINAL_DIR/../.."
npm install
npm run dev &
FRONTEND_PID=$!
cd "$ORIGINAL_DIR"

# Wait for frontend to be ready
echo "⏳ Waiting for frontend server to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:5173 >/dev/null 2>&1; then
        echo "✅ Frontend server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Frontend server failed to start within timeout"
        echo "🔍 Checking frontend server logs..."
        ps aux | grep "npm run dev" | grep -v grep || echo "Frontend process not found"
        exit 1
    fi
    echo "⏳ Attempt $i/30: Frontend not ready yet, waiting..."
    sleep 2
done

# Set environment variable for backend port
export BACKEND_PORT=3000

echo "🧪 Starting Selenium E2E tests..."
echo "======================================"

# Run all test files
for f in test_*.py; do
    echo "Running $f..."
    python "$f"
    echo "---"
done

echo "✅ All Selenium E2E tests completed successfully!"
echo "======================================" 