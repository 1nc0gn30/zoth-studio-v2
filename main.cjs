const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const os = require('os');
const { spawn, exec } = require('child_process');

// 1. VM & Linux Display Safeguards (prevents GPU process crash in QEMU/KVM & live ISOs)
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('enable-features', 'UseOzonePlatform');
app.commandLine.appendSwitch('ozone-platform', 'x11');

// Handle GPU crash gracefully without crashing application
app.on('child-process-gone', (event, details) => {
  if (details.type === 'GPU') {
    console.log('[Zoth Studio] GPU process recovered or running in software compatibility mode');
  }
});

let mainWindow = null;
let serverInstance = null;
let activePort = parseInt(process.env.PORT || '3000', 10);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function autoStartDaemons() {
  const zothCli = path.join(__dirname, 'bin', 'zoth.js');
  if (fs.existsSync(zothCli)) {
    try {
      const child = spawn(process.execPath, [zothCli, 'up'], {
        cwd: __dirname,
        detached: true,
        stdio: 'ignore'
      });
      child.unref();
      console.log('[Zoth Studio] Background daemons spawned via zoth up');
    } catch (err) {
      console.warn('[Zoth Studio] Could not auto-start daemons:', err.message);
    }
  }
}

function startInternalServer() {
  return new Promise((resolve) => {
    const distDir = path.join(__dirname, 'dist');
    const publicDir = path.join(__dirname, 'public');
    const serveRoot = fs.existsSync(distDir) ? distDir : publicDir;

    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url, `http://127.0.0.1:${activePort}`);
      let pathname = decodeURIComponent(parsedUrl.pathname);

      // CORS & Security headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // API: Host Telemetry
      if (req.method === 'GET' && pathname === '/api/studio/host') {
        const isZothOS = fs.existsSync('/etc/zothos-release') || fs.existsSync('/usr/local/bin/zoth-doctor') || fs.existsSync('/opt/zoth-studio');
        const info = {
          isZothOS,
          distro: 'ZothOS Sovereign Linux',
          release: '2026.1 (Imperial Sovereign Edition)',
          kernel: os.release(),
          arch: os.arch(),
          hostname: os.hostname(),
          cpus: os.cpus().length,
          cpuModel: os.cpus()[0]?.model || 'Native Silicon',
          totalMem: Math.round(os.totalmem() / (1024 * 1024)),
          freeMem: Math.round(os.freemem() / (1024 * 1024)),
          uptime: Math.round(os.uptime()),
          audioDevice: 'ICH9 High Definition Audio (Active)',
          installedTools: {
            claude: fs.existsSync('/usr/local/bin/claude'),
            opencode: fs.existsSync('/usr/local/bin/opencode'),
            hermes: fs.existsSync('/usr/local/bin/hermes'),
            burpsuite: fs.existsSync('/usr/bin/burpsuite'),
            bitwarden: fs.existsSync('/usr/local/bin/bw'),
            streamlit: fs.existsSync('/usr/local/bin/streamlit'),
            netlify: fs.existsSync('/usr/local/bin/netlify'),
            ollama: fs.existsSync('/usr/local/bin/ollama') || fs.existsSync('/usr/bin/ollama')
          }
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(info));
        return;
      }

      // API: Tool Launcher
      if (req.method === 'POST' && pathname === '/api/studio/launch') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const tool = data.tool;
            const allowed = {
              claude: 'xfce4-terminal --title="Claude CLI" -e "claude" &',
              opencode: 'xfce4-terminal --title="OpenCode" -e "opencode" &',
              hermes: 'xfce4-terminal --title="Hermes Agent" -e "hermes" &',
              netlify: 'xfce4-terminal --title="Netlify CLI" -e "netlify" &',
              burpsuite: 'burpsuite &',
              bitwarden: 'xfce4-terminal --title="Bitwarden CLI" -e "bw" &',
              streamlit: 'xfce4-terminal --title="Streamlit" -e "streamlit" &',
              terminal: 'xfce4-terminal &',
              arsenal: 'xfce4-terminal --title="Arsenal Provisioner" -e "zoth-arsenal-sync" &'
            };
            if (allowed[tool]) {
              exec(allowed[tool]);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, tool }));
            } else {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Unknown tool' }));
            }
          } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      // Static File Serving with SPA Fallback
      let filePath = path.join(serveRoot, pathname);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
      } else {
        // SPA Fallback: serve dist/index.html
        const fallback = path.join(serveRoot, 'index.html');
        if (fs.existsSync(fallback)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          fs.createReadStream(fallback).pipe(res);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      }
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        activePort += 1;
        server.listen(activePort, '127.0.0.1');
      }
    });

    server.listen(activePort, '127.0.0.1', () => {
      console.log(`[Zoth Studio] Self-contained loopback server active at http://127.0.0.1:${activePort}`);
      serverInstance = server;
      resolve(activePort);
    });
  });
}

function createWindow(port) {
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
    backgroundColor: '#08080B',
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

  const studioUrl = `http://127.0.0.1:${port}/index.html`;
  mainWindow.loadURL(studioUrl);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (serverInstance) {
      serverInstance.close();
    }
  });
}

app.whenReady().then(async () => {
  autoStartDaemons();
  const port = await startInternalServer();
  createWindow(port);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(port);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
