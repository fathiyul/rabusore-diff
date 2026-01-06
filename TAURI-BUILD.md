# Building RabuSore Diff with Tauri

This guide covers building the lightweight Tauri desktop application for RabuSore Diff. Tauri produces ~10MB executables (vs 787MB for Electron) by using the system's native webview instead of bundling Chromium.

## Prerequisites

### 1. Rust Toolchain

Install Rust using rustup (if not already installed):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation, reload your shell or run:
```bash
source $HOME/.cargo/env
```

Verify installation:
```bash
rustc --version
cargo --version
```

### 2. System Dependencies

#### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### Linux (Arch/Manjaro)

```bash
sudo pacman -S webkit2gtk-4.1 \
  base-devel \
  curl \
  wget \
  file \
  openssl \
  gtk3 \
  libayatana-appindicator \
  librsvg
```

#### Linux (Fedora)

```bash
sudo dnf install webkit2gtk4.1-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel
sudo dnf group install "C Development Tools and Libraries"
```

#### macOS

Install Xcode Command Line Tools:
```bash
xcode-select --install
```

#### Windows

Install:
1. [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
2. [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually pre-installed on Windows 11)

### 3. Node.js Dependencies

```bash
npm install
```

## Development

### Running in Development Mode

```bash
npm run tauri:dev
```

This will:
1. Start the Next.js development server on http://localhost:3000
2. Launch the Tauri window pointing to the dev server
3. Enable hot reload - changes to frontend code will refresh automatically

## Building Executables

### Building for Linux

```bash
npm run tauri:build-linux
```

**Output** (in `src-tauri/target/release/bundle/`):
- `deb/rabusore-diff_0.1.0_amd64.deb` - Debian package (~10-15MB)
- `appimage/rabusore-diff_0.1.0_amd64.AppImage` - Portable AppImage
- Binary in `src-tauri/target/release/rabusore-diff`

**Installation**:
```bash
# Debian/Ubuntu
sudo dpkg -i src-tauri/target/release/bundle/deb/rabusore-diff_0.1.0_amd64.deb

# AppImage (no installation needed)
chmod +x src-tauri/target/release/bundle/appimage/rabusore-diff_0.1.0_amd64.AppImage
./src-tauri/target/release/bundle/appimage/rabusore-diff_0.1.0_amd64.AppImage

# Or use the helper script
./run-tauri.sh
```

### Building for Windows

**On Windows:**
```bash
npm run tauri:build-win
```

**Output** (in `src-tauri/target/release/bundle/`):
- `nsis/RabuSore Diff_0.1.0_x64-setup.exe` - Installer

**Cross-compilation from Linux** is possible but complex - recommended to use GitHub Actions or a Windows VM.

### Building for macOS

**On macOS:**
```bash
npm run tauri:build-mac
```

**Output** (in `src-tauri/target/release/bundle/`):
- `dmg/RabuSore Diff_0.1.0_x64.dmg` - Disk image
- `macos/RabuSore Diff.app` - Application bundle

**Note**: macOS builds can only be created on macOS machines.

## Build Optimization

The Tauri build is configured for size optimization in `src-tauri/Cargo.toml`:

```toml
[profile.release]
opt-level = "z"     # Optimize for size
lto = true          # Link-time optimization
codegen-units = 1   # Better optimization
strip = true        # Strip debug symbols
```

## Size Comparison

| Platform | Tauri | Electron |
|----------|-------|----------|
| Linux .deb | ~10-15MB | 787MB (unpacked) |
| Linux binary | ~8MB | - |
| Windows installer | ~12-15MB | ~150MB |
| macOS .dmg | ~10-12MB | ~200MB |

**Size reduction: ~98%**

## Troubleshooting

### "webkit2gtk not found"

Install the webkit2gtk development package (see System Dependencies above).

### "cargo not found"

Ensure Rust is installed and in your PATH:
```bash
source $HOME/.cargo/env
```

### Build fails with "out directory not found"

Run the static export first:
```bash
npm run export
```

### Windows: "MSVC not found"

Install Visual Studio C++ Build Tools (see Prerequisites).

### Permission denied on Linux

Make the binary executable:
```bash
chmod +x src-tauri/target/release/rabusore-diff
```

## Distribution

### Linux

**Debian-based** (.deb package):
- Installs to `/usr/bin/rabusore-diff`
- Creates desktop entry and menu icon
- Users can install with: `sudo dpkg -i rabusore-diff_*.deb`

**AppImage** (portable):
- No installation needed
- Run directly: `./rabusore-diff_*.AppImage`
- Works across most Linux distributions

### Windows

Distribute the NSIS installer (.exe). Users can:
- Choose installation directory
- Create desktop and start menu shortcuts
- Uninstall via Windows Settings

### macOS

Distribute the .dmg file. Users drag the app to Applications folder.

## CI/CD with GitHub Actions

Example workflow for multi-platform builds (future):

```yaml
name: Tauri Build
on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        platform: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - run: npm install
      - run: npm run tauri:build
```

## Additional Resources

- [Tauri Documentation](https://v2.tauri.app/)
- [Tauri Prerequisites Guide](https://v2.tauri.app/start/prerequisites/)
- [Rust Installation](https://www.rust-lang.org/tools/install)
