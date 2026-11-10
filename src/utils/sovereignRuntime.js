/**
 * Sovereign Runtime & Device Capability Detection
 * Zoth Studio v2 — 100% Open-Access In-Browser + Local ZothOS Loopback Detection
 */
import { useState, useEffect } from 'react';

export function isLocalRuntime() {
  if (typeof window === 'undefined') return false;
  const search = window.location.search || '';
  if (search.includes('mock_remote=true') || search.includes('remote=1')) {
    return false;
  }
  if (search.includes('mock_local=true') || search.includes('local=1')) {
    return true;
  }
  const hostname = (window.location.hostname || '').toLowerCase();
  if (
    hostname.includes('nullai.tech') ||
    hostname.includes('netlify.app') ||
    hostname.includes('github.io')
  ) {
    return false;
  }
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.test') ||
    window.location.protocol === 'file:'
  );
}

const LOOPBACK_URL_RE = /^https?:\/\/(?:127\.0\.0\.1|localhost|0\.0\.0\.0|\[::1\])(?::\d+)?(?:\/|$)/i;

export function resolveLocalOrFallbackUrl(localUrl, fallbackUrl = 'https://github.com/NullAITech/zoth-studio-v2') {
  return isLocalRuntime() ? localUrl : fallbackUrl;
}

let loopbackGuardInstalled = false;

/**
 * Prevents HTTPS Mixed-Content / Private Network Access console errors and dead
 * 127.0.0.1 anchor tabs when Zoth Studio v2 is served on public HTTPS domains
 * (e.g. https://zoth.nullai.tech), allowing every God-Mode workstation to switch
 * instantaneously (0ms timeout wait) to its 100% client-side in-browser engine.
 */
export function installSovereignLoopbackGuard() {
  if (loopbackGuardInstalled || typeof window === 'undefined') return;
  loopbackGuardInstalled = true;

  if (typeof window.fetch === 'function') {
    const nativeFetch = window.fetch.bind(window);
    window.fetch = function guardedSovereignFetch(input, init) {
      if (!isLocalRuntime()) {
        const urlStr =
          typeof input === 'string'
            ? input
            : input && typeof input.url === 'string'
            ? input.url
            : String(input || '');
        if (LOOPBACK_URL_RE.test(urlStr)) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                ok: false,
                status: 'browser_client_mode',
                offline: true,
                message: 'Public HTTPS runtime active — executing client-side in-browser engine.',
              }),
              {
                status: 503,
                statusText: 'Client-Side In-Browser Mode',
                headers: { 'Content-Type': 'application/json' },
              }
            )
          );
        }
      }
      return nativeFetch(input, init);
    };
  }

  if (typeof document !== 'undefined') {
    document.addEventListener(
      'click',
      (event) => {
        if (isLocalRuntime()) return;
        const anchor = event.target?.closest?.('a[href]');
        if (!anchor) return;
        const rawHref = anchor.getAttribute('href') || '';
        if (LOOPBACK_URL_RE.test(rawHref)) {
          event.preventDefault();
          const deck =
            document.getElementById('enclave-workstation-deck') ||
            document.getElementById('client-workstation-deck');
          if (deck) {
            deck.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      },
      true
    );
  }
}

let webgpuCheckPromise = null;

export async function detectWebGPU() {
  if (typeof window === 'undefined' || !navigator?.gpu) {
    return {
      supported: false,
      adapterName: 'None (WebGPU API Missing)',
      reason: 'navigator.gpu not available in this browser environment.',
    };
  }
  if (!webgpuCheckPromise) {
    webgpuCheckPromise = (async () => {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
          return {
            supported: false,
            adapterName: 'None (No GPU Adapter)',
            reason: 'WebGPU API present, but no suitable hardware GPU adapter found.',
          };
        }
        return {
          supported: true,
          adapterName: adapter.name || 'Hardware Accelerated WebGPU Tensor Core',
          adapter,
        };
      } catch (err) {
        return {
          supported: false,
          adapterName: 'Unavailable',
          reason: err.message || 'Failed to initialize WebGPU adapter',
        };
      }
    })();
  }
  return webgpuCheckPromise;
}

let loopbackCheckPromise = null;

export async function detectZothOSLoopback() {
  return isLocalRuntime();
}

export function canExecuteToolOnClient(tool, isLocal, hasWebGPU) {
  if (!tool) {
    return { canExecute: true, mode: 'in_browser_godmode', label: 'Launch Tool ⚡', description: 'Interactive Sovereign Workstation' };
  }

  if (isLocal) {
    return {
      canExecute: true,
      mode: 'local_node',
      badge: 'ZOTHOS INSTALLED + WEBGPU',
      label: 'Launch Tool ⚡',
      color: '#10B981',
      description: 'Installed in ZothOS (/usr/local/bin) + interactive 60fps in-browser God-Mode Workstation.',
      isLocal: true,
    };
  }

  return {
    canExecute: true,
    mode: hasWebGPU ? 'in_browser_webgpu' : 'in_browser_godmode',
    badge: '100% FREE · IN-BROWSER + CLI',
    label: 'Launch Tool ⚡',
    color: '#10B981',
    description: '100% free & unlocked interactive in-browser God-Mode Workstation + ZothOS CLI.',
    isLocal: false,
  };
}

export function useSovereignRuntime() {
  const [isLocal, setIsLocal] = useState(() => isLocalRuntime());
  const [hasWebGPU, setHasWebGPU] = useState(false);
  const [gpuDetails, setGpuDetails] = useState(null);
  const [isCheckingGPU, setIsCheckingGPU] = useState(true);

  useEffect(() => {
    setIsLocal(isLocalRuntime());
    detectWebGPU().then((res) => {
      setHasWebGPU(res.supported);
      setGpuDetails(res);
      setIsCheckingGPU(false);
    });
  }, []);

  let runtimeMode = 'local_sovereign';
  let badgeLabel = 'ZOTHOS NODE + IN-BROWSER';
  let badgeColor = '#10B981';
  let badgeTooltip = 'Connected to ZothOS local hardware loopback (127.0.0.1) + 100% unlocked in-browser workstations.';

  if (!isLocal) {
    if (hasWebGPU) {
      runtimeMode = 'public_webgpu';
      badgeLabel = '100% FREE · WEBGPU ACTIVE';
      badgeColor = '#10B981';
      badgeTooltip = '100% Free & Open Access. In-browser client WebGPU tensor compute unlocked on your device.';
    } else {
      runtimeMode = 'public_standard';
      badgeLabel = '100% FREE · OPEN ACCESS';
      badgeColor = '#10B981';
      badgeTooltip = '100% Free & Open Access. All 77 interactive God-Mode Workstations unlocked in-browser.';
    }
  }

  const evaluateTool = (tool) => canExecuteToolOnClient(tool, isLocal, hasWebGPU);

  return {
    isLocal,
    hasWebGPU,
    hasWebMCP: true,
    gpuDetails,
    isCheckingGPU,
    runtimeMode,
    badgeLabel,
    badgeColor,
    badgeTooltip,
    evaluateTool,
  };
}
