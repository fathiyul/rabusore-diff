# Building Standalone Executables

This guide explains how to build standalone executable versions of RabuSore Diff for different platforms.

## Prerequisites

```bash
npm install
```

## Building Executables

### Linux (AppImage, .deb, or portable directory)

```bash
# Build portable directory (simplest, works immediately)
npm run electron:build-linux

# The executable will be at: dist/linux-unpacked/rabusore-diff
# Run it with: ./dist/linux-unpacked/rabusore-diff
# Or use: ./run-app.sh
```

### Windows (.exe installer)

```bash
# On Windows, or using Wine on Linux
npm run electron:build-win

# Creates: dist/RabuSore Diff Setup 0.1.0.exe
```

### macOS (.dmg)

```bash
# On macOS
npm run electron:build-mac

# Creates: dist/RabuSore Diff-0.1.0.dmg
```

### Build for all platforms

```bash
npm run electron:build
```

## Quick Start (After Building)

### Linux
```bash
./run-app.sh
```

### Windows
Double-click the installer or the .exe in the dist folder.

### macOS
Open the .dmg file and drag to Applications.

## What Gets Built

The built application includes:
- Standalone executable (no server needed)
- All web assets bundled inside
- Chromium-based desktop window
- Native OS integration (taskbar, notifications, etc.)
- **Fully offline** - no internet required after build

## Output Locations

- **Linux**: `dist/linux-unpacked/rabusore-diff`
- **Windows**: `dist/RabuSore Diff Setup 0.1.0.exe`
- **macOS**: `dist/RabuSore Diff-0.1.0.dmg`

## Distribution

You can distribute the entire `dist/linux-unpacked/` folder (or the installer for Windows/Mac) to users who want to run the app without building it themselves.

### Linux Distribution (Portable)
Zip the entire `dist/linux-unpacked/` folder:
```bash
cd dist
tar -czf rabusore-diff-linux-portable.tar.gz linux-unpacked/
```

Users extract and run:
```bash
tar -xzf rabusore-diff-linux-portable.tar.gz
cd linux-unpacked
./rabusore-diff
```

## Customizing

### App Icon
Replace `public/placeholder-logo.png` with a 256x256px icon named `icon.png`.

### App Name & Version
Edit `package.json`:
```json
{
  "name": "rabusore-diff",
  "productName": "RabuSore Diff",
  "version": "0.1.0"
}
```

### Window Size
Edit `electron-main.js`:
```javascript
const mainWindow = new BrowserWindow({
  width: 1400,  // Change this
  height: 900,  // Change this
  ...
});
```

## Troubleshooting

### "Out directory not found"
Run `npm run export` first to build the web assets.

### Icon errors on Linux
AppImage requires 256x256px icons. Use the `dir` target instead:
```json
"linux": {
  "target": ["dir"]
}
```

### Large file size
The executable directory is ~800MB because it includes a full Chromium browser. This is normal for Electron apps and ensures the app works identically on all systems.
