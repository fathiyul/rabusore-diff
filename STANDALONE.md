# RabuSore Diff - Standalone Version

This is a standalone static version of RabuSore Diff that can run locally without any build process.

## How to Run

You have several options to run this app locally:

### Option 1: Python (Simplest - works on most systems)

Open a terminal in this directory and run:

```bash
# Python 3
python3 -m http.server 3000

# Or Python 2
python -m SimpleHTTPServer 3000
```

Then open your browser to: http://localhost:3000

### Option 2: Node.js (if you have it installed)

```bash
npx serve@latest -l 3000
```

Then open your browser to: http://localhost:3000

### Option 3: PHP (if you have it installed)

```bash
php -S localhost:3000
```

Then open your browser to: http://localhost:3000

### Option 4: Any other local server

You can use any local HTTP server to serve the files in this directory. The app is completely static and doesn't require any backend.

## Notes

- All data is stored locally in your browser's local storage
- No internet connection required after initial load
- The app runs entirely in your browser
- Your data never leaves your computer

## Requirements

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local HTTP server (Python, Node.js, PHP, or any other)

Why do you need a server? Modern browsers block certain features when opening HTML files directly (file:// protocol) for security reasons. A local server solves this.
