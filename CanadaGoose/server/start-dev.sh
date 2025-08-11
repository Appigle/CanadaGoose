#!/bin/bash

echo "🚀 Starting CanadaGoose Development Server"
echo "=========================================="

# Set development environment
export NODE_ENV=development

echo "🔧 Environment: $NODE_ENV"
echo "🌐 CORS will allow requests from localhost:5173"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp env.example .env
    echo "✅ .env file created"
fi

echo "📋 Starting server with development CORS settings..."
echo "💡 Your frontend on localhost:5173 can now make API requests"
echo ""

# Start the server
npm run dev 