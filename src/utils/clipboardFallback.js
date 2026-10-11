// Make every navigator.clipboard.writeText() call in the Studio work everywhere.
// The async Clipboard API is missing on plain-http origins other than localhost,
// inside some Electron/iframe contexts, and it rejects without focus. Without this,
// "Copy" buttons silently did nothing. Falls back to a hidden-textarea copy.
function legacyCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = String(text ?? '');
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;top:-1000px;left:-1000px;opacity:0;';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove();
  return ok;
}

export function installClipboardFallback() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const nav = window.navigator;
  const native = nav.clipboard && typeof nav.clipboard.writeText === 'function'
    ? nav.clipboard.writeText.bind(nav.clipboard) : null;
  const writeText = (text) => {
    const viaLegacy = () => (legacyCopy(text) ? Promise.resolve() : Promise.reject(new Error('Copy blocked by the browser')));
    if (!native) return viaLegacy();
    return native(text).catch(viaLegacy);
  };
  try {
    if (nav.clipboard) Object.defineProperty(nav.clipboard, 'writeText', { value: writeText, configurable: true });
    else Object.defineProperty(nav, 'clipboard', { value: { writeText }, configurable: true });
  } catch { /* read-only in this browser; native behaviour stays */ }
}
