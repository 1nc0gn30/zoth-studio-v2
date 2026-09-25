/* ==========================================================================
   Zoth Studio v2 - Sovereign Air-Gapped Service Worker
   Architecture: Zero-Cloud / Zero-Egress Offline Resilience
   Strategy: Cache-First / Stale-While-Revalidate with Clean Shell Fallback
   ========================================================================== */

const CACHE_VERSION = 'zoth-v2.0.0-offline';
const SHELL_CACHE = `zoth-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `zoth-runtime-${CACHE_VERSION}`;

// Pre-cached sovereign shell assets (zero cloud dependencies)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/brand/ghostbyte-dark.png',
  '/brand/ghostbyte.png',
  '/assets/lucy.png',
  '/fonts/CelticGaramond.ttf',
  '/robots.txt',
  '/ai.txt',
  '/llms.txt',
  '/api/tools.json',
  '/api/netlify-ax.json',
  '/api/netlify-rules-ontology.json',
];

// Install: Precache offline app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => {
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch(() => {
              // Ignore optional or dev-mode missing precache assets
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Purge obsolete cache stores and immediately claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== SHELL_CACHE && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only intercept GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 1. Bypass Vite HMR & local development internal endpoints
  // Ensures zero interference with Vite development server or HMR websockets
  if (
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.includes('__vite') ||
    url.searchParams.has('t') ||
    url.searchParams.has('import') ||
    url.searchParams.has('direct') ||
    url.searchParams.has('v') ||
    request.headers.get('Upgrade') === 'websocket'
  ) {
    return;
  }

  // 2. Bypass dynamic local studio daemon APIs (Ollama, memory daemon, signal bridge)
  if (url.pathname.startsWith('/api/studio/')) {
    return;
  }

  // 3. Air-Gapped Zero-Cloud Policy:
  // If external origin (non-same-origin), prevent cloud egress and return offline synthetic fallback.
  if (url.origin !== self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        if (request.destination === 'style' || url.pathname.endsWith('.css')) {
          return new Response('/* Offline fallback for external style */', {
            status: 200,
            headers: { 'Content-Type': 'text/css' },
          });
        }
        if (request.destination === 'font') {
          return new Response(new ArrayBuffer(0), {
            status: 200,
            headers: { 'Content-Type': 'font/woff2' },
          });
        }
        return new Response(
          JSON.stringify({ airgapped: true, status: 'zero_cloud_egress_enforced' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // 4. Navigation Requests (HTML SPA Routes):
  // Cache-First / Stale-While-Revalidate with resilient fallback to root app shell
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(SHELL_CACHE).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(async () => {
            if (cachedResponse) return cachedResponse;
            const rootShell = await caches.match('/');
            if (rootShell) return rootShell;
            const indexShell = await caches.match('/index.html');
            if (indexShell) return indexShell;
            return new Response(
              '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Zoth Studio // Offline</title></head><body style="background:#08080B;color:#D4AF37;font-family:sans-serif;padding:2rem;"><h2>Offline Sovereign Shell</h2><p>Zoth Studio is operating in air-gapped offline mode.</p></body></html>',
              {
                status: 200,
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
              }
            );
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 5. Static Shell Assets (JS, CSS, Images, Fonts, Icons, JSON):
  // Cache-First strategy with background Stale-While-Revalidate update
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
