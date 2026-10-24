/* Capsule sandbox worker. Operator snippets run here, not in the page.
   The page CSP does not allow eval. This response is the only one that does,
   and network primitives below are replaced before the snippet runs. */
self.onmessage = function (e) {
  const code = e && e.data ? e.data.code : '';
  const logs = [];
  const virtualFs = {};

  const fakeConsole = {
    log: function () {
      logs.push({ type: 'log', text: formatArgs(arguments) });
    },
    warn: function () {
      logs.push({ type: 'warn', text: formatArgs(arguments) });
    },
    error: function () {
      logs.push({ type: 'error', text: formatArgs(arguments) });
    },
  };

  const fs = {
    writeFile: function (name, content) {
      virtualFs[name] = content;
      logs.push({ type: 'fs', text: '[VFS] Created virtual scratch: ' + name });
    },
    readFile: function (name) {
      return virtualFs[name] || null;
    },
    listFiles: function () {
      return Object.keys(virtualFs);
    },
  };

  ['fetch', 'XMLHttpRequest', 'WebSocket', 'importScripts', 'indexedDB'].forEach(function (key) {
    try {
      Object.defineProperty(self, key, {
        get: function () {
          throw new Error("CAPSULE_SECURITY_VIOLATION: Egress primitive '" + key + "' is strictly blocked by sandbox boundary.");
        },
      });
    } catch (err) {
      /* The runtime may already own the property. */
    }
  });

  const startTime = performance.now();
  try {
    const fn = new Function('console', 'fs', 'env', String(code || ''));
    const result = fn(fakeConsole, fs, { NODE_ENV: 'capsule_jail', SANDBOX_ID: 'cap_sovereign_01' });
    self.postMessage({
      success: true,
      logs: logs,
      result: result,
      elapsed: performance.now() - startTime,
      virtualFs: virtualFs,
    });
  } catch (err) {
    self.postMessage({
      success: false,
      error: err && err.message ? err.message : 'Capsule rejected the snippet.',
      logs: logs,
      elapsed: performance.now() - startTime,
      virtualFs: virtualFs,
    });
  }
};

function formatArgs(args) {
  return Array.prototype.map.call(args, function (value) {
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }).join(' ');
}
