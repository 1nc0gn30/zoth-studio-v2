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
  '/tools',
  '/workstations',
  '/templates',
  '/memory',
  '/consensus',
  '/webgen',
  '/hexstrike',
  '/zoth-os',
  '/docs',
  '/docs/math',
  '/faqs',
  '/ax',
];

const SAMPLE_ROUTES = [
  '/tools/envguard-secrets-vault',
  '/tools/vision-gesture-control',
  '/workstations/cockpit',
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
  const homedir = process.env.HOME || '/home/neo';
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

  const standardPaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/home/neo/.cache/ms-playwright/chromium-1234/chrome-linux/chrome',
    '/home/neo/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell',
    '/home/neo/.cache/ms-playwright/chromium-1187/chrome-linux/chrome',
    '/home/neo/.cache/ms-playwright/chromium-1223/chrome-linux/chrome',
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
    console.log(`\n${C.bgGreen}${C.white}${C.bold} ALL 21 TESTED ROUTES PASSED: 100% HYDRATION & CONSOLE CLEANLINESS ${C.reset}\n`);
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
