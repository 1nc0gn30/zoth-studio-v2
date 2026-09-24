const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
const port = process.env.PORT || '3000';
const studioUrl = `http://127.0.0.1:${port}/index.html`;

function createWindow() {
  const iconCandidates = [
    '/opt/zoth-studio/public/brand/ghostbyte-dark.png',
    '/usr/share/pixmaps/zoth-studio.png',
    path.join(__dirname, 'public/brand/ghostbyte-dark.png')
  ];
  let iconPath = undefined;
  for (const ic of iconCandidates) {
    if (fs.existsSync(ic)) {
      iconPath = ic;
      break;
    }
  }

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#070a0f',
    icon: iconPath,
    frame: true,
    titleBarStyle: 'default',
    title: 'ZOTH STUDIO v2 // SOVEREIGN AGENT MATRIX',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });

  // Try loading live HTTP server first (ensures Vite assets /assets/*.js resolve correctly)
  mainWindow.loadURL(studioUrl).catch(() => {
    const distIndex = path.join(__dirname, 'dist', 'index.html');
    const rootIndex = path.join(__dirname, 'index.html');
    const targetIndex = fs.existsSync(distIndex) ? distIndex : rootIndex;
    mainWindow.loadFile(targetIndex);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
