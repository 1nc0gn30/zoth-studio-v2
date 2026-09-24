/**
 * Netlify Serverless Function: studio-api
 * Handles /api/studio/* endpoints when hosted on Netlify.
 * Returns valid, sovereign JSON structures for status, memory vectors, and bridge health.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};

const SAMPLE_MEMORIES = [
  {
    id: 'MEM-001',
    category: 'kernel',
    cluster: 'Kernel',
    weight: 0.98,
    text: 'Spike-Timing-Dependent Plasticity (STDP) biomorphic decay algorithm active in local SQLite vector database.',
    author: 'Azoth',
    tags: ['stdp', 'synaptic', 'decay']
  },
  {
    id: 'MEM-002',
    category: 'oracle',
    cluster: 'Lucy Oracle',
    weight: 0.99,
    text: 'Lucyna Kushinada Netrunner Oracle channel active on Codec 141.12. Deep net breach monitor in Whitespace cyberspace.',
    author: 'Lucy',
    tags: ['netrunner', 'lucy', 'oracle']
  },
  {
    id: 'MEM-003',
    category: 'consensus',
    cluster: 'Consensus',
    weight: 0.94,
    text: '3-Agent Byzantine Triangulation synthesized: Azoth, Chronos, and Athena signed block consensus #8849.',
    author: 'Athena',
    tags: ['consensus', 'byzantine', 'triangulation']
  },
  {
    id: 'MEM-004',
    category: 'security',
    cluster: 'Security',
    weight: 0.96,
    text: 'Zero-Egress enclave verified. Loopback containment active with 0 external tracking endpoints.',
    author: 'Lycan',
    tags: ['zero-egress', 'entropy', 'security']
  }
];

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const rawPath = event.path || '';
  const subpath = rawPath.replace(/^\/\.netlify\/functions\/studio-api\/?/, '').replace(/^\/api\/studio\/?/, '');

  // 1. Status endpoint (/api/studio/status)
  if (subpath === 'status' || subpath === '') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        checkedAt: new Date().toISOString(),
        environment: 'Netlify Hosted Showcase (Zero-Egress Guaranteed)',
        kvm: false,
        services: {
          memory: {
            name: 'Neuro memory daemon',
            port: 8788,
            up: true,
            detail: { mode: 'Netlify Cloud Showcase', vector_count: SAMPLE_MEMORIES.length }
          },
          bridge: {
            name: 'Sovereign agent bridge',
            port: 8789,
            up: true,
            detail: { mode: 'Netlify Cloud Showcase', agents: 21 }
          },
          vault: {
            name: 'Vault daemon',
            port: 8787,
            up: true,
            detail: { algorithm: 'Argon2id + XChaCha20-Poly1305' }
          },
          ollama: {
            name: 'Ollama',
            port: 11434,
            up: false,
            models: [],
            note: 'Run locally at 127.0.0.1:11434 for offline silicon inference'
          },
          classic: {
            name: 'Classic studio',
            port: 8088,
            up: false,
            note: 'Decoupled in v2 — all workstations render natively in this SPA'
          }
        }
      })
    };
  }

  // 2. Memory endpoint (/api/studio/memory?q=...)
  if (subpath.startsWith('memory')) {
    const q = (event.queryStringParameters?.q || '').toLowerCase();
    const filtered = q
      ? SAMPLE_MEMORIES.filter(m => m.text.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.category.includes(q))
      : SAMPLE_MEMORIES;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        query: q,
        count: filtered.length,
        memories: filtered,
        results: filtered
      })
    };
  }

  // 3. Bridge endpoint (/api/studio/bridge)
  if (subpath.startsWith('bridge')) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        status: 'online',
        transport: 'WebSocket / Loopback Mesh',
        peers: 21,
        message: 'Sovereign Agent Bridge active. Ready for inter-agent consensus packets.'
      })
    };
  }

  // 4. Default fallback
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      endpoint: subpath,
      status: 'active',
      architecture: 'Zero-Egress Sovereign Enclave'
    })
  };
}
