#!/bin/bash

# RabuSore Diff - Local Server Launcher (Python)
# This script uses Python's built-in HTTP server (no npm required after build)

echo "🚀 RabuSore Diff - Local Server (Python)"
echo "========================================"
echo ""

# Check if out directory exists
if [ ! -d "out" ]; then
    echo "❌ Error: 'out' directory not found."
    echo "Please run './run-local.sh' first to build the app,"
    echo "or run 'npm run export' if you have Node.js installed."
    exit 1
fi

echo "🌐 Starting local server on http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

cd out
python3 -m http.server 3000
