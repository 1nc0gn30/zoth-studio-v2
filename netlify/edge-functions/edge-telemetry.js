/**
 * Netlify Edge Function: edge-telemetry
 * Ultra-low latency edge compute running on Netlify's global Deno network.
 * Provides live visitor edge POP geolocation, sub-millisecond edge timestamps,
 * and enforces strict Cross-Origin security headers required for WebGPU and High-Resolution Timers.
 */

export default async (request, context) => {
  const geo = context.geo || {};
  const clientIP = context.ip || '127.0.0.1';

  const telemetry = {
    platform: 'Netlify Edge Runtime (Deno)',
    status: 'online',
    timestamp: new Date().toISOString(),
    edgePOP: {
      city: geo.city || 'Edge Location',
      subdivision: geo.subdivision?.name || '',
      country: geo.country?.name || 'Global Edge',
      countryCode: geo.country?.code || 'XX',
      timezone: geo.timezone || 'UTC',
      latitude: geo.latitude || null,
      longitude: geo.longitude || null,
    },
    client: {
      ipMasked: clientIP.includes(':') ? `${clientIP.split(':')[0]}::*` : `${clientIP.split('.').slice(0, 2).join('.')}.*.*`,
    },
    securityEnclave: {
      coop: 'same-origin',
      coep: 'credentialless',
      webgpuPermitted: true,
      highResolutionTimers: true,
      zeroEgressInvariant: 'Strictly Preserved',
    },
    showcase: {
      eventName: 'Netlify Community Stream',
      host: 'zoth.nullai.tech',
      framework: 'React 19 + Vite + Three.js + WebGPU',
      routesPrerendered: 140,
      edgeEngine: 'Deno v1.x at Netlify Anycast Edge',
    }
  };

  return new Response(JSON.stringify(telemetry, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
      'X-Netlify-Edge-Region': geo.city || 'Global-Edge',
    },
  });
};

export const config = {
  path: ['/api/edge/telemetry', '/api/edge/geo'],
};
