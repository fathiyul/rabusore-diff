const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const handler = require('serve-handler');

let server;
const PORT = 8273; // Random port for local server

// Start local HTTP server to serve the static files
function startServer() {
  server = http.createServer((request, response) => {
    return handler(request, response, {
      public: path.join(__dirname, 'out'),
      cleanUrls: true,
    });
  });

  server.listen(PORT, () => {
    console.log(`Local server running at http://localhost:${PORT}`);
  });
}

function createWindow() {
  // Try to find an icon, fallback to placeholder
  let iconPath = path.join(__dirname, 'public', 'icon.png');
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(__dirname, 'public', 'placeholder-logo.png');
  }

  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#f8fafc',
    autoHideMenuBar: false,
  });

  // Check if out directory exists
  const outPath = path.join(__dirname, 'out');
  if (fs.existsSync(outPath)) {
    // Load from local server - explicitly load index.html
    mainWindow.loadURL(`http://localhost:${PORT}/index.html`);
  } else {
    // Fallback: show error if out directory doesn't exist
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Build Required</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f8fafc;
            }
            .error {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #b45309; }
            code {
              background: #f1f5f9;
              padding: 0.2rem 0.5rem;
              border-radius: 4px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>⚠️ Build Required</h1>
            <p>The application needs to be built first.</p>
            <p>Please run: <code>npm run export</code></p>
            <p>Then restart this application.</p>
          </div>
        </body>
      </html>
    `)}`);
  }

  // Open DevTools in development (optional)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (server) {
    server.close();
  }
});
