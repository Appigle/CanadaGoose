#!/bin/bash

# Setup Environment Script for CanadaGoose Server
# This script helps create the .env file from env.example

set -e

echo "🔧 Setting up environment for CanadaGoose Server..."

# Check if we're in the right directory
if [ ! -f "app.js" ]; then
    echo "❌ Error: app.js not found. Please run this script from the server directory."
    exit 1
fi

# Check if .env already exists
if [ -f ".env" ]; then
    echo "📁 .env file already exists."
    echo "   Current .env contents:"
    echo "   DB_HOST: $(grep '^DB_HOST=' .env | cut -d'=' -f2)"
    echo "   DB_NAME: $(grep '^DB_NAME=' .env | cut -d'=' -f2)"
    echo "   NODE_ENV: $(grep '^NODE_ENV=' .env | cut -d'=' -f2)"
    echo ""
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "✅ Keeping existing .env file"
        exit 0
    fi
fi

# Check if env.example exists
if [ ! -f "env.example" ]; then
    echo "❌ Error: env.example not found. Cannot create .env file."
    exit 1
fi

# Create .env from env.example
echo "📁 Creating .env file from env.example..."
cp env.example .env

if [ $? -eq 0 ]; then
    echo "✅ Successfully created .env file"
    echo ""
    echo "📋 Environment variables set:"
    echo "   DB_HOST: $(grep '^DB_HOST=' .env | cut -d'=' -f2)"
    echo "   DB_PORT: $(grep '^DB_PORT=' .env | cut -d'=' -f2)"
    echo "   DB_USER: $(grep '^DB_USER=' .env | cut -d'=' -f2)"
    echo "   DB_NAME: $(grep '^DB_NAME=' .env | cut -d'=' -f2)"
    echo "   NODE_ENV: $(grep '^NODE_ENV=' .env | cut -d'=' -f2)"
    echo "   PORT: $(grep '^PORT=' .env | cut -d'=' -f2)"
    echo ""
    echo "🔒 IMPORTANT: Please verify the database credentials in .env file"
    echo "   Make sure DB_PASSWORD and JWT_SECRET are correct for production"
    echo ""
    echo "🚀 You can now run: ./deploy-production.sh"
else
    echo "❌ Failed to create .env file"
    exit 1
fi 