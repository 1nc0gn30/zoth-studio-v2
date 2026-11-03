import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire('${process.env.HOME || "~"}/.npm/_npx/381cec31605a419a/node_modules/playwright');
const { chromium } = require('playwright');

const outDir = '${process.env.HOME || "~"}/.gemini/antigravity-cli/brain/3f3b8fa6-039f-4fd9-b9d1-f9a5b50a4d8b';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function capture() {
  console.log('Launching Chrome for livestream visual capture...');
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // High-DPI Retina
  });

  const page = await context.newPage();

  // 1. Home Page Hero & WebGPU Neural Engine
  console.log('Capturing 01_webgpu_neural_engine.png...');
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Scroll down to WebGPU console
  const webgpuEl = await page.$('text=WebGPU Neural Engine');
  if (webgpuEl) {
    await webgpuEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, '01_webgpu_neural_engine.png') });
  } else {
    await page.screenshot({ path: path.join(outDir, '01_webgpu_neural_engine.png') });
  }

  // 2. Terminal Simulator on Home Page
  console.log('Capturing 02_instant_local_terminal.png...');
  const terminalEl = await page.$('.terminal-window, [data-terminal="true"]');
  if (terminalEl) {
    await terminalEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, '02_instant_local_terminal.png') });
  }

  // 3. WebMCP Console on Home Page
  console.log('Capturing 03_webmcp_suite.png...');
  const mcpEl = await page.$('text=WebMCP (Model Context Protocol) Suite');
  if (mcpEl) {
    await mcpEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, '03_webmcp_suite.png') });
  }

  // 4. Swarm Pantheon Page
  console.log('Capturing 04_swarm_pantheon.png...');
  await page.goto('http://127.0.0.1:3000/swarm', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '04_swarm_pantheon.png') });

  // 5. HexStrike Offensive Security Page
  console.log('Capturing 05_hexstrike_security.png...');
  await page.goto('http://127.0.0.1:3000/hexstrike', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '05_hexstrike_security.png') });

  // 6. Tools Arsenal Page
  console.log('Capturing 06_tools_arsenal.png...');
  await page.goto('http://127.0.0.1:3000/tools', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '06_tools_arsenal.png') });

  await browser.close();
  console.log('All 6 showcase screenshots captured successfully into:', outDir);
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
