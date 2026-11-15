/**
 * Shared browser utilities for every Zoth tool.
 *
 * Replaces the ~112 hand-rolled `navigator.clipboard` calls and ~36 hand-rolled
 * Blob downloads across src/components/tools/. All helpers are SSR-safe (no
 * window/navigator access at import time) so prerendering never breaks.
 *
 *   const { copied, copy } = useCopy();
 *   <Button onClick={() => copy(json)}>{copied ? 'Copied' : 'Copy'}</Button>
 *
 *   downloadText(csv, 'report.csv', 'text/csv');
 *   downloadJson(payload, 'report.json');
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Copy text to the clipboard. Resolves to true on success.
 * Falls back to a hidden <textarea> + execCommand when the async Clipboard API
 * is unavailable (plain-http LAN hosts, older WebViews).
 */
export async function copyText(text) {
  if (!isBrowser()) return false;
  const value = String(text ?? '');
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext !== false) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Trigger a client-side file download from a string or Blob. */
export function downloadText(content, filename = 'zoth-export.txt', mime = 'text/plain;charset=utf-8') {
  if (!isBrowser()) return false;
  const blob = content instanceof Blob ? content : new Blob([String(content ?? '')], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
  return true;
}

/** Pretty-print and download any JSON-serialisable value. */
export function downloadJson(value, filename = 'zoth-export.json') {
  return downloadText(JSON.stringify(value, null, 2), filename, 'application/json;charset=utf-8');
}

/** Serialise rows (array of objects) to RFC-4180 CSV. */
export function toCsv(rows = [], columns) {
  const cols = columns || (rows[0] ? Object.keys(rows[0]).map((key) => ({ key, label: key })) : []);
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = cols.map((c) => esc(c.label ?? c.key)).join(',');
  const body = rows.map((r) => cols.map((c) => esc(r[c.key])).join(','));
  return [head, ...body].join('\n');
}

/**
 * Copy with transient "copied" feedback. Clears its timer on unmount so a
 * tool closing mid-flash never sets state on an unmounted component.
 *
 * `copied` is true (or the key passed to copy()) for `resetMs` after success,
 * so one hook can drive many copy buttons: copy(value, rowIndex).
 */
export function useCopy(resetMs = 1600) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text, key = true) => {
      const ok = await copyText(text);
      if (ok) {
        setCopied(key);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetMs);
      }
      return ok;
    },
    [resetMs],
  );

  return { copied, copy };
}
