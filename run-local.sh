#!/bin/bash

# RabuSore Diff - Local Server Launcher
# This script will build and serve the app locally

echo "🚀 RabuSore Diff - Local Server"
echo "================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if out directory exists
if [ ! -d "out" ]; then
    echo "🔨 Building static export..."
    npm run export
    echo ""
fi

echo "🌐 Starting local server on http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

npx serve@latest out -l 3000
