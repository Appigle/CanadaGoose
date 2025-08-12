#!/bin/bash

echo "🚀 Setting up CanadaGoose Development Environment"
echo "================================================="

# Check if .env file exists
if [ -f ".env" ]; then
    echo "📁 .env file already exists"
    echo "💡 To enable development CORS, set NODE_ENV=development in your .env file"
else
    echo "📁 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created"
fi

echo ""
echo "🔧 Development CORS Configuration:"
echo "   - Set NODE_ENV=development in your .env file"
echo "   - This will allow requests from localhost:5173"
echo "   - Production CORS will still work for s25cicd.xiaopotato.top"
echo ""

echo "📋 To start development server with CORS enabled:"
echo "   export NODE_ENV=development"
echo "   npm run dev"
echo "   # or"
echo "   NODE_ENV=development npm run dev"
echo ""

echo "🌐 Your frontend can now make requests to:"
echo "   - http://localhost:3000/api/healthcheck (local backend)"
echo "   - http://s25cicd.xiaopotato.top/api/healthcheck (production backend)"
echo ""

echo "✅ Development environment setup complete!" 