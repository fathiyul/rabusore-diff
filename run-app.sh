#!/bin/bash

# RabuSore Diff - Desktop App Launcher
# This script will run the Electron desktop application

echo "🚀 RabuSore Diff - Desktop App Launcher"
echo "========================================"
echo ""

# Check if executable exists
if [ ! -f "dist/linux-unpacked/rabusore-diff" ]; then
    echo "❌ Error: Executable not found."
    echo "Please build the application first:"
    echo "  npm run electron:build-linux"
    exit 1
fi

echo "🖥️  Starting RabuSore Diff desktop app..."
echo ""

./dist/linux-unpacked/rabusore-diff
