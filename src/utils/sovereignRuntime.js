/**
 * Sovereign Runtime & Device Capability Detection
 * Zoth Studio v2 — Public Web vs Local Sovereign Node Dynamic Adaptation
 */
import { useState, useEffect } from 'react';

/**
 * Detects whether Zoth Studio is running in a local sovereign runtime (localhost / 127.0.0.1 / desktop)
 * or in a remote public cloud environment (Netlify, custom domain, remote web server).
 *
 * Supports URL overrides for auditing & testing:
 * - ?remote=1 or ?mock_remote=true forces the remote lockout UI
 * - ?local=1 or ?mock_local=true forces local execution mode
 */
export function isLocalRuntime() {
  if (typeof window === 'undefined') return true; // Static prerendering pass
  const search = window.location.search || '';
  if (search.includes('mock_remote=true') || search.includes('remote=1')) {
    return false;
  }
  if (search.includes('mock_local=true') || search.includes('local=1')) {
    return true;
  }
  const hostname = window.location.hostname;
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

// Global cached promise for WebGPU check to prevent multiple adapter requests
let webgpuCheckPromise = null;

export async function detectWebGPU() {
  if (typeof window === 'undefined' || !navigator?.gpu) {
    return {
      supported: false,
      adapterName: 'None (WebGPU API Missing)',
      reason: 'navigator.gpu not available in this browser environment.'
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
            reason: 'WebGPU API present, but no suitable hardware GPU adapter found.'
          };
        }
        return {
          supported: true,
          adapterName: adapter.name || 'Hardware Accelerated WebGPU Tensor Core',
          adapter
        };
      } catch (err) {
        return {
          supported: false,
          adapterName: 'Unavailable',
          reason: err.message || 'Failed to initialize WebGPU adapter'
        };
      }
    })();
  }
  return webgpuCheckPromise;
}

/**
 * Evaluates whether a given tool can be executed/tried in the current runtime environment.
 * On public websites:
 * - Bare-metal host tools (local_cli) CANNOT be tried or run directly.
 * - WebGPU and WebMCP tools CAN be tried and run in-browser if supported by client device.
 * On local sovereign nodes:
 * - Full execution privileges apply to all tools.
 */
export function canExecuteToolOnClient(tool, isLocal, hasWebGPU) {
  if (!tool) {
    return { canExecute: false, mode: 'unknown', label: 'Unknown Tool', description: 'Tool metadata missing' };
  }

  // Local sovereign environment: full bare-metal & daemon access
  if (isLocal) {
    return {
      canExecute: true,
      mode: 'local_node',
      badge: 'LOCAL SOVEREIGN NODE',
      label: 'Run Local Enclave ⚡',
      color: '#10B981',
      description: 'Executes against local hardware registers, loopback Unix sockets, or bare-metal ZothOS.',
      isLocal: true,
    };
  }

  // Public web environment: check if tool supports client-side in-browser execution
  const isWebGPUTool = tool.executionType === 'webgpu';
  const isWebMCPTool = tool.id === 'webmcp-protocol-inspector' || tool.executionType === 'webmcp';

  if (isWebGPUTool || isWebMCPTool) {
    if (hasWebGPU) {
      return {
        canExecute: true,
        mode: 'in_browser_webgpu',
        badge: 'WEBGPU IN-BROWSER',
        label: 'Try In-Browser (WebGPU) ⚡',
        color: '#38BDF8',
        description: 'Runs client-side on your device GPU via WGSL compute shaders. Zero external network egress.',
        isLocal: false,
      };
    }
    // WebGPU API not supported on user's device/browser, but in-browser WASM/CPU fallback available
    return {
      canExecute: true,
      mode: 'in_browser_wasm',
      badge: 'WASM CLIENT FALLBACK',
      label: 'Try In-Browser (WASM/CPU) ⚡',
      color: '#F59E0B',
      description: 'WebGPU not detected; runs client-side in-browser via WebAssembly / CPU SIMD.',
      isLocal: false,
    };
  }

  // Bare-metal / local CLI tool accessed on public web -> EXECUTION BLOCKED
  return {
    canExecute: false,
    mode: 'bare_metal_required',
    badge: 'BARE-METAL ENCLAVE',
    label: 'Inspect Specs & CLI 📖',
    color: '#EF4444',
    description: 'Host execution disabled on public web to protect zero-egress invariants. Requires local CLI or ZothOS.',
    isLocal: false,
  };
}

/**
 * React hook providing dynamic environment detection, WebGPU hardware verification,
 * and adaptive tool execution policies.
 */
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
  let badgeLabel = 'LOCAL SOVEREIGN NODE';
  let badgeColor = '#10B981';
  let badgeTooltip = 'Connected to local hardware loopback (127.0.0.1). Full bare-metal daemon execution unlocked.';

  if (!isLocal) {
    if (hasWebGPU) {
      runtimeMode = 'public_webgpu';
      badgeLabel = 'PUBLIC WEB · WEBGPU ACTIVE';
      badgeColor = '#38BDF8';
      badgeTooltip = 'Browsing public showcase. In-browser client WebGPU tensor compute unlocked on your device.';
    } else {
      runtimeMode = 'public_standard';
      badgeLabel = 'PUBLIC WEB · ZERO-EGRESS';
      badgeColor = '#F59E0B';
      badgeTooltip = 'Browsing public showcase. Host execution sealed. WebGPU/WASM micro-tools available.';
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
