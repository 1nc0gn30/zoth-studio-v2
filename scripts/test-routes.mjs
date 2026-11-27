#!/usr/bin/env node
/**
 * Zoth Studio v2 - Automated Browser & Hydration Quality Sentinel
 *
 * Inspects all primary, tool, workstation, and mathematical documentation routes.
 * Verifies:
 *  - HTTP 200 OK status
 *  - Clean browser console (0 uncaught exceptions, 0 console.errors)
 *  - Document title validity and metadata presence
 *  - Client DOM hydration (#root element rendering & hierarchy)
 *
 * Runs against the active Vite dev server at http://127.0.0.1:3000
 * (or starts a built-in static server from dist/ if the dev server is inactive).
 */

import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Target test routes
const PRIMARY_ROUTES = [
  '/',
  '/adytum',
  '/swarm',
  '/bridges',
  '/voice',
  '/tools',
  '/workstations',
  '/arsenal',
  '/memory',
  '/consensus',
  '/webgen',
  '/hexstrike',
  '/zoth-os',
  '/docs',
  '/docs/math',
  '/faqs',
  '/ax',
  '/gallery',
  '/agora',
];

const SAMPLE_ROUTES = [
  '/webgen/docs',
  '/swarm/docs',
  '/hexstrike/docs',
  '/memory/docs',
  '/zoth-os/docs',
  '/adytum/docs',
  '/ax/docs',
  '/tools/envguard-secrets-vault',
  '/tools/etsy-pod-forge',
  '/tools/etsy-connector',
  '/tools/vision-gesture-control',
  '/tools/printify-connector',
  '/tools/gelato-connector',
  '/tools/pod-smart-router',
  '/tools/digital-asset-forge',
  '/tools/pod-mockup-forge',
  '/tools/pod-margin-sentinel',
  '/workstations/cockpit',
  '/tools/cockpit',
  '/workstations/connectors',
  '/tools/connectors',
  '/workstations/consensus',
  '/tools/consensus',
  '/workstations/cyberpunk-hud',
  '/tools/cyberpunk-hud',
  '/workstations/edge-forge',
  '/tools/edge-forge',
  '/workstations/agent-composer',
  '/tools/agent-composer',
  '/workstations/ax-powerhouse',
  '/tools/ax-powerhouse',
  '/workstations/brand',
  '/tools/brand',
  '/workstations/bus-monitor',
  '/tools/bus-monitor',
  '/workstations/chronicle',
  '/tools/chronicle',
  '/tools/certpath-roadmap-studio',
  '/tools/city-desk',
  '/tools/creatorplaybooks',
  '/tools/cron-rhythm-studio',
  '/tools/cwv-speed-engine',
  '/tools/cyber-turtle-studio',
  '/tools/datamosh-glitch-studio',
  '/tools/deepsearch-research-agent',
  '/workstations/mission-control',
  '/docs/math/stdp',
];

const ALL_ROUTES = [...PRIMARY_ROUTES, ...SAMPLE_ROUTES];

// ANSI styling
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

/**
 * Dynamically resolves Playwright from local node_modules or global/npx caches.
 */
async function resolvePlaywright() {
  // 1. Try direct import
  try {
    return await import('playwright');
  } catch (e) {
    // ignore
  }

  // 2. Try require from current directory
  try {
    const localRequire = createRequire(import.meta.url);
    return localRequire('playwright');
  } catch (e) {
    // ignore
  }

  // 3. Search common npx cache locations
  const homedir = os.homedir();
  const npxDir = path.join(homedir, '.npm', '_npx');
  if (fs.existsSync(npxDir)) {
    try {
      const hashes = fs.readdirSync(npxDir);
      for (const hash of hashes) {
        const candidate = path.join(npxDir, hash, 'node_modules', 'playwright');
        if (fs.existsSync(candidate)) {
          const req = createRequire(candidate);
          return req('playwright');
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return null;
}

/**
 * Finds a suitable Chromium or Chrome executable on the system.
 */
function findChromeExecutable() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }

  const homedir = os.homedir();
  const standardPaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    path.join(homedir, '.cache/ms-playwright/chromium-1234/chrome-linux/chrome'),
    path.join(homedir, '.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell'),
    path.join(homedir, '.cache/ms-playwright/chromium-1187/chrome-linux/chrome'),
    path.join(homedir, '.cache/ms-playwright/chromium-1223/chrome-linux/chrome'),
  ];

  for (const p of standardPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return undefined;
}

/**
 * Checks if a given URL is actively accepting HTTP requests.
 */
function checkServerActive(urlStr) {
  return new Promise((resolve) => {
    try {
      const url = new URL(urlStr);
      const req = http.request(
        {
          host: url.hostname,
          port: url.port || 80,
          path: '/',
          method: 'HEAD',
          timeout: 1500,
        },
        (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 400);
        }
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    } catch (err) {
      resolve(false);
    }
  });
}

/**
 * Starts a minimal static HTTP file server for dist/ as fallback if dev server is inactive.
 */
function startDistServer(port = 4173) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url, `http://127.0.0.1:${port}`);
      let reqPath = decodeURIComponent(parsedUrl.pathname);

      // Map route to prerendered html file or root index.html
      let filePath = path.join(distDir, reqPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      if (!fs.existsSync(filePath)) {
        if (fs.existsSync(filePath + '.html')) {
          filePath = filePath + '.html';
        } else {
          // SPA fallback
          filePath = path.join(distDir, 'index.html');
        }
      }

      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.woff2': 'font/woff2',
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
    server.on('error', reject);
  });
}

/**
 * Main test suite execution
 */
async function main() {
  console.log(`${C.bold}${C.cyan}╔══════════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}${C.cyan}║  Zoth Studio v2 - Automated Browser & Hydration Quality Sentinel ║${C.reset}`);
  console.log(`${C.bold}${C.cyan}╚══════════════════════════════════════════════════════════════════╝${C.reset}\n`);

  let targetUrl = process.env.TEST_URL || 'http://127.0.0.1:3000';
  let tempServer = null;

  const isDevServerRunning = await checkServerActive(targetUrl);
  if (isDevServerRunning) {
    console.log(`${C.green}✓ Connected to live dev server at ${targetUrl}${C.reset}`);
  } else {
    console.log(`${C.yellow}⚠ No server listening at ${targetUrl}.${C.reset}`);
    if (fs.existsSync(distDir)) {
      console.log(`${C.cyan}ℹ Spawning internal static server from dist/ on port 4173...${C.reset}`);
      tempServer = await startDistServer(4173);
      targetUrl = 'http://127.0.0.1:4173';
      console.log(`${C.green}✓ Static server active at ${targetUrl}${C.reset}`);
    } else {
      console.error(`${C.red}✗ dist/ not found and dev server is inactive. Run "npm run build" or "npm run dev".${C.reset}`);
      process.exit(1);
    }
  }

  const pw = await resolvePlaywright();
  if (!pw) {
    console.warn(`${C.yellow}⚠ Playwright module not found. Falling back to HTTP fetch smoke testing.${C.reset}`);
    await runFetchSmokeTest(targetUrl);
    if (tempServer) tempServer.close();
    return;
  }

  const chromePath = findChromeExecutable();
  console.log(`${C.dim}→ Launching headless browser (${chromePath || 'default-chromium'})...${C.reset}`);

  let browser;
  try {
    const launchOptions = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    };
    if (chromePath) {
      launchOptions.executablePath = chromePath;
    }
    browser = await pw.chromium.launch(launchOptions);
  } catch (err) {
    console.warn(`${C.yellow}⚠ Failed to launch browser via Playwright (${err.message}). Falling back to HTTP fetch test.${C.reset}`);
    await runFetchSmokeTest(targetUrl);
    if (tempServer) tempServer.close();
    return;
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 ZothSentinel/2.0',
  });

  const page = await context.newPage();

  console.log(`\n${C.bold}Testing ${ALL_ROUTES.length} routes against ${targetUrl}:${C.reset}\n`);

  const results = [];
  let totalErrors = 0;

  for (let i = 0; i < ALL_ROUTES.length; i++) {
    const route = ALL_ROUTES[i];
    const fullUrl = `${targetUrl}${route}`;
    const consoleErrors = [];
    const pageErrors = [];

    const onConsole = (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('PHANTOM') || text.includes('contentScript') || text.includes('favicon') || text.includes('extension')) return;
        consoleErrors.push(text);
      }
    };

    const onPageError = (err) => {
      pageErrors.push(err.message || String(err));
    };

    page.on('console', onConsole);
    page.on('pageerror', onPageError);

    const startTime = Date.now();
    let status = 0;
    let title = '';
    let rootRendered = false;
    let rootChildCount = 0;
    let rootTextSnippet = '';
    let failureReason = '';
    try {
      const resp = await page.goto(fullUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      status = resp ? resp.status() : 200;
      await page.waitForSelector('#root > *', { timeout: 5000 }).catch(() => {});
      title = await page.title();

      // Verify #root existence and child elements
      const rootLocator = page.locator('#root');
      const rootCount = await rootLocator.count();

      if (rootCount > 0) {
        rootChildCount = await page.locator('#root > *').count();
        const text = await rootLocator.innerText();
        rootTextSnippet = text.trim().replace(/\s+/g, ' ').slice(0, 60);
        rootRendered = rootChildCount > 0 && rootTextSnippet.length > 0;
      }

      if (status !== 200) {
        failureReason = `Non-200 HTTP status (${status})`;
      } else if (!rootRendered) {
        failureReason = 'Root element (#root) empty or not hydrated';
      } else if (!title || title.trim().length === 0) {
        failureReason = 'Document title is empty';
      } else if (consoleErrors.length > 0 || pageErrors.length > 0) {
        failureReason = `${consoleErrors.length + pageErrors.length} console/runtime error(s)`;
      } else if (route === '/workstations/cockpit' || route === '/tools/cockpit') {
        const ckCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          const bodyText = document.body?.innerText || '';
          return {
            hasTitle: document.title.includes('The Cockpit'),
            hasH1: h1Text.includes('The Cockpit'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasCockpitWorkstation: Boolean(document.querySelector('[data-testid="cockpit-workstation"]')),
            hasSwarmCollision: bodyText.includes('3-RING PBFT TOPOLOGY') || bodyText.includes('ACTIVE PTY PANES'),
          };
        });
        if (!ckCheck.hasTitle || !ckCheck.hasH1 || !ckCheck.hasSoftwareApp || !ckCheck.hasFaq || !ckCheck.hasCockpitWorkstation || ckCheck.hasSwarmCollision) {
          failureReason = `cockpit invariants failed: ${JSON.stringify(ckCheck)}`;
        }
      } else if (route === '/workstations/connectors' || route === '/tools/connectors') {
        const cnCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          const bodyText = document.body?.innerText || '';
          return {
            hasTitle: document.title.includes('Connectors Hub'),
            hasH1: h1Text.includes('Connectors Hub'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasConnectorsWorkstation: Boolean(document.querySelector('[data-testid="connectors-hub-workstation"]')),
            hasMcpLensCollision: bodyText.includes('MCP Lens God Mode Suite') || bodyText.includes('connectors_execute'),
          };
        });
        if (!cnCheck.hasTitle || !cnCheck.hasH1 || !cnCheck.hasSoftwareApp || !cnCheck.hasFaq || !cnCheck.hasConnectorsWorkstation || cnCheck.hasMcpLensCollision) {
          failureReason = `connectors invariants failed: ${JSON.stringify(cnCheck)}`;
        }
      } else if (route === '/workstations/consensus' || route === '/tools/consensus') {
        const csCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          const bodyText = document.body?.innerText || '';
          return {
            hasTitle: document.title.includes('Byzantine Consensus Battle Arena'),
            hasH1: h1Text.includes('Byzantine Consensus Battle Arena'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasConsensusWorkstation: Boolean(document.querySelector('[data-testid="consensus-arena-workstation"]')),
            hasCollision: bodyText.includes('3-RING PBFT TOPOLOGY') || bodyText.includes('consensus_execute'),
          };
        });
        if (!csCheck.hasTitle || !csCheck.hasH1 || !csCheck.hasSoftwareApp || !csCheck.hasFaq || !csCheck.hasConsensusWorkstation || csCheck.hasCollision) {
          failureReason = `consensus invariants failed: ${JSON.stringify(csCheck)}`;
        }
      } else if (route === '/workstations/cyberpunk-hud' || route === '/tools/cyberpunk-hud') {
        const hudCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          const bodyText = document.body?.innerText || '';
          return {
            hasTitle: document.title.includes('Cyberpunk Telemetry HUD Cockpit'),
            hasH1: h1Text.includes('Cyberpunk Telemetry HUD Cockpit'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasHudWorkstation: Boolean(document.querySelector('[data-testid="cyberpunk-hud-workstation"]')),
            hasAttackSurfaceCollision: bodyText.includes('SHODAN INTERNETDB') || bodyText.includes('Attack Surface CPE/CVE Fingerprinter'),
            hasPhantomMcp: bodyText.includes('cyberpunk_hud_execute') || bodyText.includes('CYBERPUNK_HUD_EXECUTE'),
          };
        });
        if (!hudCheck.hasTitle || !hudCheck.hasH1 || !hudCheck.hasSoftwareApp || !hudCheck.hasFaq || !hudCheck.hasHudWorkstation || hudCheck.hasAttackSurfaceCollision || hudCheck.hasPhantomMcp) {
          failureReason = `cyberpunk-hud invariants failed: ${JSON.stringify(hudCheck)}`;
        }
      } else if (route === '/workstations/agent-composer' || route === '/tools/agent-composer') {
        const metaCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          return {
            hasTitle: document.title.includes('Multi-Agent DAG Composer'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasDagSvg: Boolean(document.querySelector('[data-testid="composer-dag-svg"]')),
          };
        });
        if (!metaCheck.hasTitle || !metaCheck.hasSoftwareApp || !metaCheck.hasFaq || !metaCheck.hasDagSvg) {
          failureReason = `agent-composer invariants failed: ${JSON.stringify(metaCheck)}`;
        }
      } else if (route === '/workstations/ax-powerhouse' || route === '/tools/ax-powerhouse') {
        const axCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          return {
            hasTitle: document.title.includes('Zoth AX Powerhouse'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasAxWorkstation: Boolean(document.querySelector('[data-testid="ax-powerhouse-workstation"]')),
          };
        });
        if (!axCheck.hasTitle || !axCheck.hasSoftwareApp || !axCheck.hasFaq || !axCheck.hasAxWorkstation) {
          failureReason = `ax-powerhouse invariants failed: ${JSON.stringify(axCheck)}`;
        }
      } else if (route === '/workstations/bus-monitor' || route === '/tools/bus-monitor') {
        const busCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          return {
            hasTitle: document.title.includes('Zoth Swarm NOC & Signal Bridge'),
            hasH1: h1Text.includes('Zoth Swarm NOC & Signal Bridge'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasBusWorkstation: Boolean(document.querySelector('[data-testid="bus-monitor-workstation"]')),
          };
        });
        if (!busCheck.hasTitle || !busCheck.hasH1 || !busCheck.hasSoftwareApp || !busCheck.hasFaq || !busCheck.hasBusWorkstation) {
          failureReason = `bus-monitor invariants failed: ${JSON.stringify(busCheck)}`;
        }
      } else if (route === '/workstations/chronicle' || route === '/tools/chronicle') {
        await page.waitForTimeout(700);
        const chrCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          const bodyText = document.body?.innerText || '';
          return {
            hasTitle: document.title.includes('Zoth Chronicle Hub & Engineering Horizon'),
            hasH1: h1Text.includes('Zoth Chronicle Hub & Engineering Horizon'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasChronicleWorkstation: Boolean(document.querySelector('[data-testid="chronicle-hub-workstation"]')),
            hasErrorBoundary: bodyText.includes('Zoth Studio Workstation UI Recovered'),
          };
        });
        if (!chrCheck.hasTitle || !chrCheck.hasH1 || !chrCheck.hasSoftwareApp || !chrCheck.hasFaq || !chrCheck.hasChronicleWorkstation || chrCheck.hasErrorBoundary) {
          failureReason = `chronicle invariants failed: ${JSON.stringify(chrCheck)}`;
        }
      } else if (route === '/tools/certpath-roadmap-studio') {
        const cpCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          return {
            hasTitle: document.title.includes('CertPath Roadmap Studio'),
            hasH1: h1Text.includes('CertPath Roadmap Studio'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
          };
        });
        if (!cpCheck.hasTitle || !cpCheck.hasH1 || !cpCheck.hasSoftwareApp || !cpCheck.hasFaq) {
          failureReason = `certpath-roadmap-studio invariants failed: ${JSON.stringify(cpCheck)}`;
        }
      } else if (route === '/tools/cron-rhythm-studio') {
        const crCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          const bodyText = document.body?.innerText || '';
          return {
            hasTitle: document.title.includes('CronRhythm Studio'),
            hasH1: h1Text.includes('CronRhythm Studio'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasPhantomDocs:
              bodyText.includes('TypeScript / Node.js') ||
              bodyText.includes('cron_evaluate') ||
              bodyText.includes('cron-rhythm eval'),
          };
        });
        if (!crCheck.hasTitle || !crCheck.hasH1 || !crCheck.hasSoftwareApp || !crCheck.hasFaq || crCheck.hasPhantomDocs) {
          failureReason = `cron-rhythm-studio invariants failed: ${JSON.stringify(crCheck)}`;
        }
      } else if (route === '/tools/cwv-speed-engine') {
        const cwvCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          const bodyText = document.body?.innerText || '';
          return {
            hasTitle: document.title.includes('CWV Speed Engine'),
            hasH1: h1Text.includes('CWV Speed Engine'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasPhantomDocs:
              bodyText.includes('Headless Chromium CDP runner') ||
              bodyText.includes('audit_web_vitals') ||
              bodyText.includes('cwv-speed profile') ||
              bodyText.includes('python3 -m http.server 8128') ||
              bodyText.includes('Next-Gen'),
          };
        });
        if (!cwvCheck.hasTitle || !cwvCheck.hasH1 || !cwvCheck.hasSoftwareApp || !cwvCheck.hasFaq || cwvCheck.hasPhantomDocs) {
          failureReason = `cwv-speed-engine invariants failed: ${JSON.stringify(cwvCheck)}`;
        }
      } else if (route === '/tools/cyber-turtle-studio') {
        const ctCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          const bodyText = document.body?.innerText || '';
          return {
            hasTitle: document.title.includes('Cyber Turtle Studio'),
            hasH1: h1Text.includes('Cyber Turtle Studio'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasPhantomDocs:
              bodyText.includes('cyber_turtle_studio_execute') ||
              bodyText.includes('Multi-Format Exporters —\n') ||
              bodyText.includes('WEBGL // SHADER'),
          };
        });
        if (!ctCheck.hasTitle || !ctCheck.hasH1 || !ctCheck.hasSoftwareApp || !ctCheck.hasFaq || ctCheck.hasPhantomDocs) {
          failureReason = `cyber-turtle-studio invariants failed: ${JSON.stringify(ctCheck)}`;
        }
      } else if (route === '/tools/digital-asset-forge') {
        const dafCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          const bodyText = document.body?.innerText || '';
          return {
            hasTitle: document.title.includes('Digital Asset Forge'),
            hasH1: h1Text.includes('Digital Asset Forge'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasPhantomMcp: bodyText.includes('digital_asset_forge_execute') || bodyText.includes('DIGITAL_ASSET_FORGE_EXECUTE'),
          };
        });
        if (!dafCheck.hasTitle || !dafCheck.hasH1 || !dafCheck.hasSoftwareApp || !dafCheck.hasFaq || dafCheck.hasPhantomMcp) {
          failureReason = `digital-asset-forge invariants failed: ${JSON.stringify(dafCheck)}`;
        }
      } else if (route === '/tools/datamosh-glitch-studio') {
        const dmCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          const bodyText = document.body?.innerText || '';
          return {
            hasTitle: document.title.includes('Datamosh Glitch Studio'),
            hasH1: h1Text.includes('Datamosh Glitch Studio'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasPhantomDocs:
              bodyText.includes('datamosh_glitch_studio_execute') ||
              bodyText.includes('DATAMOSH_GLITCH_STUDIO_EXECUTE') ||
              bodyText.includes('ProRes/H.265'),
          };
        });
        if (!dmCheck.hasTitle || !dmCheck.hasH1 || !dmCheck.hasSoftwareApp || !dmCheck.hasFaq || dmCheck.hasPhantomDocs) {
          failureReason = `datamosh-glitch-studio invariants failed: ${JSON.stringify(dmCheck)}`;
        }
      } else if (route === '/tools/creatorplaybooks') {
        await page.waitForSelector('[data-testid="creatorplaybooks-godmode-workstation"]', { timeout: 4000 }).catch(() => {});
        const cbCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          const bodyText = document.body?.innerText || '';
          return {
            hasTitle: document.title.includes('CreatorPlaybooks'),
            hasH1: h1Text.includes('CreatorPlaybooks'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasWorkstation: Boolean(document.querySelector('[data-testid="creatorplaybooks-godmode-workstation"]')),
            hasPhantomMcp: bodyText.includes('creatorplaybooks_search') || bodyText.includes('hermes-creatorplaybooks --horizon'),
          };
        });
        if (!cbCheck.hasTitle || !cbCheck.hasH1 || !cbCheck.hasSoftwareApp || !cbCheck.hasFaq || !cbCheck.hasWorkstation || cbCheck.hasPhantomMcp) {
          failureReason = `creatorplaybooks invariants failed: ${JSON.stringify(cbCheck)}`;
        }
      } else if (route === '/workstations/edge-forge' || route === '/tools/edge-forge') {
        await page.waitForSelector('[data-testid="edge-forge-workstation"]', { timeout: 4000 }).catch(() => {});
        const efCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          const bodyText = document.body?.innerText || '';
          return {
            hasTitle: document.title.includes('Zoth Edge Forge'),
            hasH1: h1Text.includes('Zoth Edge Forge'),
            hasWorkstation: Boolean(document.querySelector('[data-testid="edge-forge-workstation"]')),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasPayloadEntropyFallback: bodyText.includes('PayloadEntropyWorkstation') || bodyText.includes('<?php') || bodyText.includes('WEBSHELL RISK EVALUATION'),
            hasPhantomMcp: bodyText.includes('edge_forge_execute') || bodyText.includes('EDGE_FORGE_EXECUTE') || bodyText.includes('zoth run edge-forge'),
          };
        });
        if (!efCheck.hasTitle || !efCheck.hasH1 || !efCheck.hasWorkstation || !efCheck.hasSoftwareApp || !efCheck.hasFaq || efCheck.hasPayloadEntropyFallback || efCheck.hasPhantomMcp) {
          failureReason = `edge-forge invariants failed: ${JSON.stringify(efCheck)}`;
        }
      } else if (route === '/tools/etsy-pod-forge') {
        const epfCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          const bodyText = document.body?.innerText || '';
          return {
            hasTitle: document.title.includes('Etsy POD Forge'),
            hasH1: h1Text.includes('Etsy POD Forge'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasPhantomDocs:
              bodyText.includes('etsy_generate_pod_payload') ||
              bodyText.includes('--archetype') ||
              bodyText.includes('Day 7 Revenue Engine'),
          };
        });
        if (!epfCheck.hasTitle || !epfCheck.hasH1 || !epfCheck.hasSoftwareApp || !epfCheck.hasFaq || epfCheck.hasPhantomDocs) {
          failureReason = `etsy-pod-forge invariants failed: ${JSON.stringify(epfCheck)}`;
        }
      } else if (route === '/tools/gelato-connector') {
        const gcCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          const bodyText = document.body?.innerText || '';
          return {
            hasTitle: document.title.includes('Gelato Connector'),
            hasH1: h1Text.includes('Gelato Connector'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasPhantomDocs:
              bodyText.includes('gelato_connector_execute') ||
              bodyText.includes('route-order') ||
              bodyText.includes('~/.config/zothos/gelato.env'),
          };
        });
        if (!gcCheck.hasTitle || !gcCheck.hasH1 || !gcCheck.hasSoftwareApp || !gcCheck.hasFaq || gcCheck.hasPhantomDocs) {
          failureReason = `gelato-connector invariants failed: ${JSON.stringify(gcCheck)}`;
        }
      } else if (route === '/tools/etsy-connector') {
        const ecCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          const bodyText = document.body?.innerText || '';
          return {
            hasTitle: document.title.includes('Etsy Connector'),
            hasH1: h1Text.includes('Etsy Connector'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
            hasPhantomDocs:
              bodyText.includes('etsy-connector/mcp_server.py') ||
              bodyText.includes('audit-seo') ||
              bodyText.includes('Day 7 Printify'),
          };
        });
        if (!ecCheck.hasTitle || !ecCheck.hasH1 || !ecCheck.hasSoftwareApp || !ecCheck.hasFaq || ecCheck.hasPhantomDocs) {
          failureReason = `etsy-connector invariants failed: ${JSON.stringify(ecCheck)}`;
        }
      } else if (route === '/tools/city-desk') {
        const cdCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          const h1Text = (document.querySelector('h1')?.textContent || '').trim();
          return {
            hasTitle: document.title.includes('City Desk'),
            hasH1: h1Text.includes('City Desk'),
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
          };
        });
        if (!cdCheck.hasTitle || !cdCheck.hasH1 || !cdCheck.hasSoftwareApp || !cdCheck.hasFaq) {
          failureReason = `city-desk invariants failed: ${JSON.stringify(cdCheck)}`;
        }
      } else if (route === '/bridges') {
        const brCheck = await page.evaluate(() => {
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((s) => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const types = ld.flatMap((d) => (Array.isArray(d['@graph']) ? d['@graph'] : [d])).flatMap((n) => (Array.isArray(n?.['@type']) ? n['@type'] : [n?.['@type']]));
          return {
            hasSoftwareApp: types.includes('SoftwareApplication'),
            hasFaq: types.includes('FAQPage'),
          };
        });
        if (!brCheck.hasSoftwareApp || !brCheck.hasFaq) {
          failureReason = `/bridges invariants failed: ${JSON.stringify(brCheck)}`;
        }
      }
    } catch (err) {
      status = 0;
      failureReason = `Navigation error: ${err.message}`;
    }

    const duration = Date.now() - startTime;
    const allErrors = [...consoleErrors, ...pageErrors];
    totalErrors += allErrors.length;

    page.off('console', onConsole);
    page.off('pageerror', onPageError);

    const passed = failureReason === '';

    results.push({
      route,
      status,
      title,
      rootRendered,
      rootChildCount,
      errors: allErrors,
      passed,
      failureReason,
      duration,
    });

    const statusBadge = passed
      ? `${C.green}✔ PASS${C.reset}`
      : `${C.red}✖ FAIL${C.reset}`;

    const httpBadge = status === 200 ? `${C.green}200${C.reset}` : `${C.red}${status || 'ERR'}${C.reset}`;
    const errBadge = allErrors.length === 0 ? `${C.dim}0 err${C.reset}` : `${C.red}${allErrors.length} err${C.reset}`;

    console.log(
      `  [${String(i + 1).padStart(2, ' ')}/${ALL_ROUTES.length}] ${statusBadge} ${httpBadge}  ${route.padEnd(32, ' ')} ${errBadge}  ${C.dim}(${duration}ms)${C.reset}`
    );

    if (allErrors.length > 0) {
      for (const err of allErrors) {
        console.log(`       ${C.red}↳ Console Error: ${err}${C.reset}`);
      }
    }
  }

  await browser.close();
  if (tempServer) tempServer.close();

  // Print Pass/Fail Matrix Summary
  console.log(`\n${C.bold}${C.cyan}══════════════════════════════════════════════════════════════════════════════════════${C.reset}`);
  console.log(`${C.bold}                     ROUTE HYDRATION & INTEGRITY MATRIX                     ${C.reset}`);
  console.log(`${C.bold}${C.cyan}══════════════════════════════════════════════════════════════════════════════════════${C.reset}`);

  console.log(
    ` ${'Route'.padEnd(34)} | ${'HTTP'.padEnd(6)} | ${'Hydrated'.padEnd(8)} | ${'Errors'.padEnd(6)} | ${'Title'.padEnd(26)}`
  );
  console.log(''.padEnd(86, '-'));

  for (const r of results) {
    const mark = r.passed ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`;
    const httpStr = r.status === 200 ? `${C.green}200 OK${C.reset}` : `${C.red}${r.status}${C.reset}`;
    const hydStr = r.rootRendered ? `${C.green}YES${C.reset} (${r.rootChildCount})` : `${C.red}NO${C.reset}`;
    const errStr = r.errors.length === 0 ? `${C.green}0${C.reset}` : `${C.red}${r.errors.length}${C.reset}`;
    const titleStr = (r.title || 'Untitled').slice(0, 24);

    console.log(
      ` ${mark} ${r.route.padEnd(32)} | ${httpStr.padEnd(15)} | ${hydStr.padEnd(17)} | ${errStr.padEnd(15)} | ${C.dim}${titleStr}${C.reset}`
    );
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  console.log(`\n${C.bold}Summary:${C.reset}`);
  console.log(`  Total Routes Evaluated : ${results.length}`);
  console.log(`  Passed                 : ${C.green}${passedCount}${C.reset}`);
  console.log(`  Failed                 : ${failedCount === 0 ? C.green + '0' : C.red + failedCount}${C.reset}`);
  console.log(`  Total Console Errors   : ${totalErrors === 0 ? C.green + '0' : C.red + totalErrors}${C.reset}`);

  if (failedCount === 0 && totalErrors === 0) {
    console.log(`\n${C.bgGreen}${C.white}${C.bold} ALL ${ALL_ROUTES.length} TESTED ROUTES PASSED: 100% HYDRATION & CONSOLE CLEANLINESS ${C.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${C.bgRed}${C.white}${C.bold} ROUTE VERIFICATION COMPLETED WITH FAILURES (${failedCount} failed) ${C.reset}\n`);
    process.exit(1);
  }
}

/**
 * Fallback lightweight HTTP smoke test when Playwright or Chromium is not available.
 */
async function runFetchSmokeTest(targetUrl) {
  console.log(`\n${C.bold}Running HTTP Fetch Smoke Test on ${ALL_ROUTES.length} routes...${C.reset}\n`);
  let failCount = 0;

  for (let i = 0; i < ALL_ROUTES.length; i++) {
    const route = ALL_ROUTES[i];
    const fullUrl = `${targetUrl}${route}`;
    try {
      const res = await fetch(fullUrl);
      const html = await res.text();
      const hasRoot = html.includes('id="root"');
      const hasTitle = /<title>(.*?)<\/title>/i.test(html);
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : '';

      const ok = res.status === 200 && hasRoot;
      if (!ok) failCount++;

      const mark = ok ? `${C.green}✔ PASS${C.reset}` : `${C.red}✖ FAIL${C.reset}`;
      console.log(`  [${String(i + 1).padStart(2, ' ')}/${ALL_ROUTES.length}] ${mark} ${res.status} ${route.padEnd(32)} ${C.dim}${title.slice(0, 30)}${C.reset}`);
    } catch (err) {
      failCount++;
      console.log(`  [${String(i + 1).padStart(2, ' ')}/${ALL_ROUTES.length}] ${C.red}✖ FAIL${C.reset} ERR ${route.padEnd(32)} ${err.message}`);
    }
  }

  console.log(`\nFetch Smoke Test Complete: ${ALL_ROUTES.length - failCount}/${ALL_ROUTES.length} passed.`);
  if (failCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Fatal execution error:`, err);
  process.exit(1);
});
