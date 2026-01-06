# RabuSore Diff - Transcription Comparison Tool

A Next.js application for comparing transcription texts and evaluating transcription accuracy.

## Live Demo

Visit the hosted version at: **[diff.rabusore.com](https://diff.rabusore.com)**

## Features

- Compare multiple transcription outputs against a ground truth
- Calculate Word Error Rate (WER) and Diarization Error Rate (DER)
- Word-level and character-level diff visualization
- Customizable word mapping for variant normalization
- Text normalization options (case, punctuation, whitespace)
- Support for speaker-tagged transcriptions
- Local storage persistence of all data

## Running the App

### Option 1: Desktop Application - Tauri (Recommended, ~10MB)

**Lightweight, native desktop app - 98% smaller than Electron!**

```bash
# Build the Tauri app
npm install
npm run tauri:build-linux   # Linux (.deb, AppImage)
# OR
npm run tauri:build-win      # Windows (.exe installer)
# OR
npm run tauri:build-mac      # macOS (.dmg)

# Run the app (Linux example)
sudo dpkg -i src-tauri/target/release/bundle/deb/rabusore-diff_*.deb
rabusore-diff
# OR run directly
./run-tauri.sh
```

Tauri uses your system's native webview instead of bundling Chromium, resulting in tiny executables (~10MB vs 787MB). See [TAURI-BUILD.md](TAURI-BUILD.md) for detailed instructions and prerequisites.

### Option 2: Desktop Application - Electron (Full Compatibility, 787MB)

**Build once, run anywhere - includes Chromium for consistent rendering.**

```bash
# Build the Electron app
npm install
npm run electron:build-linux   # Linux
# OR
npm run electron:build-win      # Windows
# OR
npm run electron:build-mac      # macOS

# Run the desktop app
./run-app.sh                    # Linux
# OR double-click the installer  # Windows/Mac
```

The Electron desktop app bundles Chromium for consistent cross-platform rendering. See [BUILD-EXECUTABLE.md](BUILD-EXECUTABLE.md) for detailed instructions.

### Option 3: Local Web Server (Development)

### Quick Start (Easiest Method)

**Linux/Mac:**
```bash
./run-local.sh
```

**Windows:**
```cmd
run-local.bat
```

This will automatically:
1. Install dependencies (if needed)
2. Build the static export (if needed)
3. Start a local server at http://localhost:3000

### Alternative: Python Server (No npm needed after build)

If you've already built the app and want to run it without Node.js:

```bash
./run-local-python.sh
```

### Manual Method

```bash
# Install dependencies
npm install

# Build static export
npm run export

# Serve the static files
npm run serve
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- diff-match-patch for text comparison
