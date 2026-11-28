/**
 * Pure ESM engine for Likeness Desk (AI Video Double) v2.6.0.
 * Handles normalized mouth ROI validation/clamping, honest pipeline telemetry formatting,
 * CLI/MCP command synthesis, and safe client-side defaults.
 */

export const DEFAULT_MOUTH_ROI = Object.freeze({
  x: 0.38,
  y: 0.62,
  w: 0.24,
  h: 0.14,
});

export const MIN_MOUTH_WIDTH = 0.04;
export const MIN_MOUTH_HEIGHT = 0.03;

export const LIKENESS_MCP_TOOLS = Object.freeze([
  'likeness_status',
  'likeness_mouth_roi',
  'likeness_speak',
  'likeness_diagnostics',
]);

/**
 * Validate a normalized mouth ROI box against server.js invariants:
 * finite numbers, 0 <= x,y <= 1, w >= 0.04, h >= 0.03, x + w <= 1, y + h <= 1.
 */
export function validateMouthRoi(roi) {
  if (!roi || typeof roi !== 'object') {
    return { valid: false, error: 'Mouth ROI object is required.' };
  }
  const x = Number(roi.x);
  const y = Number(roi.y);
  const w = Number(roi.w);
  const h = Number(roi.h);
  if (![x, y, w, h].every(Number.isFinite)) {
    return { valid: false, error: 'All mouth ROI coordinates must be finite numbers.' };
  }
  if (x < 0 || y < 0 || x > 1 || y > 1) {
    return { valid: false, error: 'x and y must lie within [0, 1].' };
  }
  if (w < MIN_MOUTH_WIDTH || h < MIN_MOUTH_HEIGHT) {
    return { valid: false, error: `Width must be >= ${MIN_MOUTH_WIDTH} and height >= ${MIN_MOUTH_HEIGHT}.` };
  }
  if (x + w > 1.0001 || y + h > 1.0001) {
    return { valid: false, error: 'Box exceeds frame bounds (require x + w <= 1 and y + h <= 1).' };
  }
  return {
    valid: true,
    error: null,
    roi: {
      x: round4(x),
      y: round4(y),
      w: round4(Math.min(w, 1 - x)),
      h: round4(Math.min(h, 1 - y)),
    },
  };
}

/**
 * Clamp any candidate ROI cleanly into legal frame bounds.
 */
export function clampMouthRoi(roi) {
  const src = roi && typeof roi === 'object' ? roi : DEFAULT_MOUTH_ROI;
  const x = clamp(Number.isFinite(Number(src.x)) ? Number(src.x) : DEFAULT_MOUTH_ROI.x, 0, 1 - MIN_MOUTH_WIDTH);
  const y = clamp(Number.isFinite(Number(src.y)) ? Number(src.y) : DEFAULT_MOUTH_ROI.y, 0, 1 - MIN_MOUTH_HEIGHT);
  const w = clamp(Number.isFinite(Number(src.w)) ? Number(src.w) : DEFAULT_MOUTH_ROI.w, MIN_MOUTH_WIDTH, 1 - x);
  const h = clamp(Number.isFinite(Number(src.h)) ? Number(src.h) : DEFAULT_MOUTH_ROI.h, MIN_MOUTH_HEIGHT, 1 - y);
  return { x: round4(x), y: round4(y), w: round4(w), h: round4(h) };
}

/**
 * Format honest telemetry summary from /api/status payload (never fabricates active GPU when offline).
 */
export function formatPipelineTelemetry(status, online) {
  if (!online || !status) {
    return {
      online: false,
      modeLabel: 'OFFLINE',
      gpuLabel: 'Daemon Offline (:9395)',
      voiceLabel: 'Daemon Offline',
      faceLabel: 'Daemon Offline',
      egressLabel: 'Local GPU · Optional xAI Chat',
      mouth: DEFAULT_MOUTH_ROI,
      lazyGpu: true,
      chatEnabled: false,
    };
  }
  const lazyGpu = Boolean(status.lazyGpu || status.mode === 'lazy_gpu');
  const voiceSeconds = Number(status.voiceSeconds || 0);
  const voiceLabel = status.voiceTrained
    ? `Chatterbox (${voiceSeconds.toFixed(1)}s${lazyGpu ? ' · lazy' : ''})`
    : (status.voiceModel ? 'Model Ready (No Sample)' : 'Awaiting Voice Sample');
  const gpuName = status.faceGpuName || (lazyGpu ? 'Idle (Lazy GPU)' : 'CPU Fallback');
  const faceLabel = status.motion
    ? `Motion + Portrait (${gpuName})`
    : (status.face ? `Portrait Ready (${gpuName})` : 'No Portrait Saved');
  const egressLabel = status.chat
    ? `Local GPU · xAI Chat Enabled (${status.chatModel || 'grok-4-latest'})`
    : 'Local GPU · xAI Chat Disabled (Local-Only)';

  return {
    online: true,
    modeLabel: lazyGpu ? 'LAZY GPU PREVIEW' : 'ACTIVE GPU',
    gpuLabel: gpuName,
    voiceLabel,
    faceLabel,
    egressLabel,
    mouth: status.mouth ? clampMouthRoi(status.mouth) : DEFAULT_MOUTH_ROI,
    lazyGpu,
    chatEnabled: Boolean(status.chat),
  };
}

/**
 * Build shell-safe CLI command string for likeness-desk speak.
 */
export function buildSpeakCliCommand(text, port = 9395) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 360);
  const escaped = clean.replace(/'/g, "'\\''");
  const portFlag = Number(port) && Number(port) !== 9395 ? ` --port ${Number(port)}` : '';
  return `likeness-desk speak '${escaped || 'Hello from Likeness Desk.'}'${portFlag}`;
}

/**
 * Build MCP JSON-RPC 2.0 request payload for a Likeness Desk tool.
 */
export function buildMcpToolCall(toolName, args = {}, id = 1) {
  if (!LIKENESS_MCP_TOOLS.includes(toolName)) {
    throw new Error(`Unsupported MCP tool: ${toolName}`);
  }
  return {
    jsonrpc: '2.0',
    id,
    method: 'tools/call',
    params: { name: toolName, arguments: args },
  };
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function round4(n) {
  return Math.round(n * 10000) / 10000;
}
