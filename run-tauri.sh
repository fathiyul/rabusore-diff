#!/bin/bash

echo "🚀 RabuSore Diff - Tauri Desktop App Launcher"
echo "=============================================="
echo ""

# Check if executable exists
TAURI_BIN="src-tauri/target/release/rabusore-diff"

if [ ! -f "$TAURI_BIN" ]; then
    echo "❌ Error: Tauri executable not found."
    echo ""
    echo "Please build the application first:"
    echo "  npm run tauri:build-linux"
    echo ""
    echo "Or install the .deb package:"
    echo "  sudo dpkg -i src-tauri/target/release/bundle/deb/rabusore-diff_*.deb"
    echo "  rabusore-diff"
    exit 1
fi

echo "🖥️  Starting RabuSore Diff (Tauri version)..."
echo ""

./$TAURI_BIN
