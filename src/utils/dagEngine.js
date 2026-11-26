/**
 * Zoth Studio v2 — Pure Multi-Agent DAG Composer Engine
 * Zero external dependencies; shared between Browser UI and Node test suite.
 *
 * Exports:
 *  - DAG_PROVIDERS, TRANSFORM_MODES, STARTER_TEMPLATES
 *  - validateDag(nodes, edges)
 *  - topologicalWaves(nodes, edges)
 *  - interpolateTemplate(template, outputsById, pipelineInput)
 *  - executeTransformNode(node, resolvedPrompt)
 *  - computeAutoLayout(nodes, edges, options)
 *  - exportDagJson(dag), importDagJson(rawText)
 *  - exportDagYaml(dag), exportDagPython(dag)
 */

export const DAG_PROVIDERS = [
  {
    id: 'ollama',
    label: 'Ollama Local LLM',
    shortLabel: 'Ollama',
    port: 11434,
    kind: 'loopback',
    defaultModel: 'hermes3-64k:latest',
    accentDark: '#D4AF37',
    accentLight: '#9A6F0B',
    description: 'Local GGUF inference on 127.0.0.1:11434/api/chat',
  },
  {
    id: 'agy-hermes',
    label: 'AGY-Hermes Proxy',
    shortLabel: 'AGY-Hermes',
    port: 18000,
    kind: 'loopback',
    defaultModel: 'gemini-3.8-flash-medium',
    accentDark: '#38BDF8',
    accentLight: '#0369A1',
    description: 'OpenAI-compatible local gateway on 127.0.0.1:18000/v1/chat/completions',
  },
  {
    id: 'azoth',
    label: 'Azoth Local Agent',
    shortLabel: 'Azoth',
    port: 8136,
    kind: 'loopback',
    defaultModel: 'azoth-react',
    accentDark: '#C084FC',
    accentLight: '#6D28D9',
    description: 'Local ReAct orchestrator on 127.0.0.1:8136',
  },
  {
    id: 'neuro-memory',
    label: 'Neuro-Memory Daemon',
    shortLabel: 'Neuro-Memory',
    port: 8094,
    kind: 'loopback',
    defaultModel: 'stdp-recall',
    accentDark: '#34D399',
    accentLight: '#047857',
    description: 'STDP synaptic memory query on 127.0.0.1:8094/api/memories',
  },
  {
    id: 'transform',
    label: 'Transform / Local JS',
    shortLabel: 'Transform',
    port: null,
    kind: 'deterministic',
    defaultModel: 'markdown-brief',
    accentDark: '#F59E0B',
    accentLight: '#B45309',
    description: 'Deterministic offline in-browser & local JS transform (zero LLM required)',
  },
  {
    id: 'hermes',
    label: 'Hermes CLI',
    shortLabel: 'Hermes CLI',
    port: null,
    kind: 'cli',
    defaultModel: 'hermes-cli',
    accentDark: '#2DD4BF',
    accentLight: '#0F766E',
    description: 'Local Hermes Agent CLI binary (PATH)',
  },
  {
    id: 'agy',
    label: 'AGY CLI',
    shortLabel: 'AGY CLI',
    port: null,
    kind: 'cli',
    defaultModel: 'agy-cli',
    accentDark: '#60A5FA',
    accentLight: '#1D4ED8',
    description: 'Antigravity CLI binary (PATH)',
  },
  {
    id: 'codex',
    label: 'Codex CLI',
    shortLabel: 'Codex CLI',
    port: null,
    kind: 'cli',
    defaultModel: 'codex-cli',
    accentDark: '#A78BFA',
    accentLight: '#5B21B6',
    description: 'Codex coding agent CLI binary (PATH)',
  },
  {
    id: 'claude-code',
    label: 'Claude Code CLI',
    shortLabel: 'Claude Code',
    port: null,
    kind: 'cli',
    defaultModel: 'claude-code',
    accentDark: '#FB923C',
    accentLight: '#C2410C',
    description: 'Claude Code CLI binary (PATH)',
  },
];

export const TRANSFORM_MODES = [
  { id: 'json-validate', label: 'JSON Validator & Formatter' },
  { id: 'markdown-brief', label: 'Markdown Brief Synthesizer' },
  { id: 'regex-extract', label: 'Token, Entropy & Artifact Extractor' },
  { id: 'schema-verify', label: 'Schema & Policy Verifier' },
];

export const STARTER_TEMPLATES = [
  {
    id: 'security-code-audit',
    name: 'Security & Code Audit DAG',
    subtitle: 'Static extraction -> parallel Ollama vulnerability audit + Neuro-Memory precedent recall -> Markdown remediation brief',
    pipelineInput: JSON.stringify(
      {
        service: 'studio-api.mjs',
        endpoint: '/api/studio/agent/dispatch',
        host: '127.0.0.1:3000',
        findings: [
          'Verify Origin header enforcement on mutating endpoints',
          'Ensure execFile argv arrays replace shell string interpolation',
          'Confirm zero absolute filesystem path disclosure in error payloads',
        ],
      },
      null,
      2,
    ),
    nodes: [
      {
        id: 'intake_extract',
        name: 'Static Intake & Extractor',
        role: 'Deterministic Surface Parser',
        provider: 'transform',
        model: 'regex-extract',
        prompt: 'Extract endpoints, ports, keys, and entropy telemetry from:\n{{input}}',
      },
      {
        id: 'memory_precedent',
        name: 'Memory Precedent Recall',
        role: 'STDP Historical Auditor',
        provider: 'neuro-memory',
        model: 'stdp-recall',
        prompt: 'security audit loopback origin execFile {{input}}',
      },
      {
        id: 'ollama_auditor',
        name: 'Local Security Analyst',
        role: 'Zero-Egress AppSec Reviewer',
        provider: 'ollama',
        model: 'qwen2.5-coder:1.5b',
        prompt:
          'You are a concise security reviewer. Given the extracted artifacts below, list 3 concrete hardening checks in bullet form:\n\n{{intake_extract.output}}',
      },
      {
        id: 'remediation_brief',
        name: 'Remediation Brief Compiler',
        role: 'Deterministic Report Builder',
        provider: 'transform',
        model: 'markdown-brief',
        prompt:
          '## Static Surface\n{{intake_extract.output}}\n\n## Memory Precedents\n{{memory_precedent.output}}\n\n## Analyst Review\n{{ollama_auditor.output}}',
      },
    ],
    edges: [
      { id: 'e-intake-mem', source: 'intake_extract', target: 'memory_precedent' },
      { id: 'e-intake-ollama', source: 'intake_extract', target: 'ollama_auditor' },
      { id: 'e-mem-brief', source: 'memory_precedent', target: 'remediation_brief' },
      { id: 'e-ollama-brief', source: 'ollama_auditor', target: 'remediation_brief' },
    ],
  },
  {
    id: 'research-memory-brief',
    name: 'Research -> Memory Recall -> Brief',
    subtitle: 'Parallel JSON intake + STDP context recall -> AGY-Hermes synthesis -> structured Executive Brief',
    pipelineInput:
      'Topic: Local-first Multi-Agent DAG execution on ZothOS loopback (:11434 Ollama, :18000 AGY-Hermes, :8094 Neuro-Memory). Goal: summarize architectural trade-offs and latency budget.',
    nodes: [
      {
        id: 'query_schema',
        name: 'Query & Scope Verifier',
        role: 'Input Normalizer',
        provider: 'transform',
        model: 'schema-verify',
        prompt: 'Verify scope and structure of research prompt:\n{{input}}',
      },
      {
        id: 'stdp_recall',
        name: 'STDP Context Recall',
        role: 'Synaptic Memory Retrieval',
        provider: 'neuro-memory',
        model: 'stdp-recall',
        prompt: 'zoth agent composer dag loopback',
      },
      {
        id: 'hermes_synth',
        name: 'AGY-Hermes Synthesizer',
        role: 'Architecture Reasoner',
        provider: 'agy-hermes',
        model: 'gemini-3.8-flash-medium',
        prompt:
          'Synthesize a tight 4-bullet architecture brief from the scope and recalled context.\n\nScope:\n{{query_schema.output}}\n\nRecalled Memory:\n{{stdp_recall.output}}',
      },
      {
        id: 'exec_brief',
        name: 'Executive Brief Formatter',
        role: 'Markdown Compiler',
        provider: 'transform',
        model: 'markdown-brief',
        prompt:
          '## Research Input\n{{input}}\n\n## Synthesis\n{{hermes_synth.output}}\n\n## Memory Citations\n{{stdp_recall.output}}',
      },
    ],
    edges: [
      { id: 'e-q-h', source: 'query_schema', target: 'hermes_synth' },
      { id: 'e-m-h', source: 'stdp_recall', target: 'hermes_synth' },
      { id: 'e-h-b', source: 'hermes_synth', target: 'exec_brief' },
    ],
  },
  {
    id: 'consensus-triangulation',
    name: 'Multi-Provider Consensus Triangulation',
    subtitle: 'JSON spec validation -> parallel 3-provider fan-out (Ollama + AGY-Hermes + Azoth) -> deterministic consensus merge',
    pipelineInput: JSON.stringify(
      {
        proposal: 'Enforce strict DAG acyclicity + explicit error states on offline providers',
        constraints: ['Zero silent mock fallback', 'AbortController cancellation', 'Loopback-only execution'],
        target_sla_ms: 1200,
      },
      null,
      2,
    ),
    nodes: [
      {
        id: 'spec_validate',
        name: 'Spec JSON Validator',
        role: 'Deterministic Schema Gate',
        provider: 'transform',
        model: 'json-validate',
        prompt: '{{input}}',
      },
      {
        id: 'critic_ollama',
        name: 'Ollama Local Critic',
        role: 'Local Model Reviewer',
        provider: 'ollama',
        model: 'qwen2.5-coder:1.5b',
        prompt: 'Critique this proposal in 3 short points:\n{{spec_validate.output}}',
      },
      {
        id: 'critic_hermes',
        name: 'AGY-Hermes Critic',
        role: 'Frontier Gateway Reviewer',
        provider: 'agy-hermes',
        model: 'gemini-3.8-flash-medium',
        prompt: 'Review feasibility and edge cases in 3 short points:\n{{spec_validate.output}}',
      },
      {
        id: 'verifier_azoth',
        name: 'Azoth ReAct Verifier',
        role: 'Local Agent Verifier',
        provider: 'azoth',
        model: 'azoth-react',
        prompt: 'Verify operational safety constraints for:\n{{spec_validate.output}}',
      },
      {
        id: 'consensus_merge',
        name: 'Consensus Arbitrator',
        role: 'Deterministic Triangulation Compiler',
        provider: 'transform',
        model: 'markdown-brief',
        prompt:
          '## Validated Spec\n{{spec_validate.output}}\n\n## Ollama Critic\n{{critic_ollama.output}}\n\n## AGY-Hermes Critic\n{{critic_hermes.output}}\n\n## Azoth Verifier\n{{verifier_azoth.output}}',
      },
    ],
    edges: [
      { id: 'e-s-o', source: 'spec_validate', target: 'critic_ollama' },
      { id: 'e-s-h', source: 'spec_validate', target: 'critic_hermes' },
      { id: 'e-s-a', source: 'spec_validate', target: 'verifier_azoth' },
      { id: 'e-o-c', source: 'critic_ollama', target: 'consensus_merge' },
      { id: 'e-h-c', source: 'critic_hermes', target: 'consensus_merge' },
      { id: 'e-a-c', source: 'verifier_azoth', target: 'consensus_merge' },
    ],
  },
];

/**
 * Validate a DAG definition: checks duplicate IDs, blank prompts/names,
 * dangling edges, self-loops, duplicate edges, and DFS cycle detection
 * returning the exact cycle node path.
 */
export function validateDag(nodes = [], edges = []) {
  const errors = [];
  const warnings = [];
  let cyclePath = null;

  if (!Array.isArray(nodes) || nodes.length === 0) {
    errors.push({ code: 'EMPTY_DAG', message: 'Pipeline must contain at least one node.' });
    return { valid: false, errors, warnings, cyclePath };
  }

  const nodeMap = new Map();
  for (const n of nodes) {
    if (!n || typeof n.id !== 'string' || !n.id.trim()) {
      errors.push({ code: 'INVALID_NODE_ID', message: 'Every node must have a non-empty string id.' });
      continue;
    }
    if (nodeMap.has(n.id)) {
      errors.push({
        code: 'DUPLICATE_NODE_ID',
        message: `Duplicate node id "${n.id}".`,
        nodeIds: [n.id],
      });
    } else {
      nodeMap.set(n.id, n);
    }

    if (!String(n.name || '').trim()) {
      errors.push({
        code: 'MISSING_NAME',
        message: `Node "${n.id}" is missing a display name.`,
        nodeIds: [n.id],
      });
    }
    if (!String(n.prompt || '').trim()) {
      errors.push({
        code: 'MISSING_PROMPT',
        message: `Node "${n.name || n.id}" requires a non-empty prompt template.`,
        nodeIds: [n.id],
      });
    }
  }

  const adj = new Map();
  for (const id of nodeMap.keys()) adj.set(id, []);
  const edgeKeys = new Set();

  for (const e of Array.isArray(edges) ? edges : []) {
    if (!e || !e.source || !e.target) {
      errors.push({ code: 'INVALID_EDGE', message: 'Every edge must define both source and target.' });
      continue;
    }
    if (!nodeMap.has(e.source) || !nodeMap.has(e.target)) {
      errors.push({
        code: 'DANGLING_EDGE',
        message: `Edge "${e.source} -> ${e.target}" references a missing node.`,
        nodeIds: [e.source, e.target].filter((id) => nodeMap.has(id)),
      });
      continue;
    }
    if (e.source === e.target) {
      cyclePath = [e.source, e.target];
      errors.push({
        code: 'SELF_LOOP',
        message: `Self-loop detected on node "${nodeMap.get(e.source)?.name || e.source}" (${e.source} -> ${e.source}).`,
        nodeIds: [e.source],
      });
      continue;
    }
    const key = `${e.source}->${e.target}`;
    if (edgeKeys.has(key)) {
      warnings.push({
        code: 'DUPLICATE_EDGE',
        message: `Duplicate edge "${e.source} -> ${e.target}" ignored.`,
        nodeIds: [e.source, e.target],
      });
      continue;
    }
    edgeKeys.add(key);
    adj.get(e.source).push(e.target);
  }

  // DFS 3-color cycle detection with exact cycle path extraction
  if (!cyclePath) {
    const color = new Map(); // 0=unvisited, 1=visiting, 2=visited
    const stack = [];
    const stackIndex = new Map();

    const dfs = (u) => {
      color.set(u, 1);
      stackIndex.set(u, stack.length);
      stack.push(u);

      for (const v of adj.get(u) || []) {
        const state = color.get(v) || 0;
        if (state === 1) {
          const start = stackIndex.get(v);
          cyclePath = [...stack.slice(start), v];
          return true;
        }
        if (state === 0 && dfs(v)) return true;
      }

      stack.pop();
      stackIndex.delete(u);
      color.set(u, 2);
      return false;
    };

    for (const id of nodeMap.keys()) {
      if ((color.get(id) || 0) === 0) {
        if (dfs(id)) break;
      }
    }

    if (cyclePath) {
      const pretty = cyclePath.map((id) => nodeMap.get(id)?.name || id).join(' -> ');
      errors.push({
        code: 'CYCLE_DETECTED',
        message: `Cycle detected in DAG: ${pretty} (${cyclePath.join(' -> ')}).`,
        nodeIds: [...new Set(cyclePath)],
      });
    }
  }

  // Warn on disconnected isolated nodes if graph has multiple nodes and edges
  if (nodes.length > 1 && Array.isArray(edges) && edges.length > 0) {
    const connected = new Set();
    for (const e of edges) {
      if (nodeMap.has(e.source) && nodeMap.has(e.target)) {
        connected.add(e.source);
        connected.add(e.target);
      }
    }
    for (const id of nodeMap.keys()) {
      if (!connected.has(id)) {
        warnings.push({
          code: 'ISOLATED_NODE',
          message: `Node "${nodeMap.get(id)?.name || id}" has no incoming or outgoing edges (runs in Wave 1).`,
          nodeIds: [id],
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    cyclePath,
  };
}

/**
 * Kahn's algorithm grouping independent nodes into parallel topological waves.
 */
export function topologicalWaves(nodes = [], edges = []) {
  const validation = validateDag(nodes, edges);
  if (!validation.valid) {
    return {
      ok: false,
      waves: [],
      order: [],
      waveByNodeId: {},
      cyclePath: validation.cyclePath,
      errors: validation.errors,
    };
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const inDegree = new Map(nodes.map((n) => [n.id, 0]));
  const adj = new Map(nodes.map((n) => [n.id, []]));
  const seen = new Set();

  for (const e of edges) {
    const key = `${e.source}->${e.target}`;
    if (seen.has(key)) continue;
    seen.add(key);
    adj.get(e.source).push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  }

  let frontier = nodes.filter((n) => inDegree.get(n.id) === 0).map((n) => n.id);
  const waves = [];
  const order = [];
  const waveByNodeId = {};

  while (frontier.length > 0) {
    const waveIdx = waves.length;
    const waveNodes = frontier.map((id) => nodeMap.get(id));
    waves.push(waveNodes);
    const nextFrontier = [];

    for (const u of frontier) {
      order.push(u);
      waveByNodeId[u] = waveIdx;
      for (const v of adj.get(u) || []) {
        const deg = inDegree.get(v) - 1;
        inDegree.set(v, deg);
        if (deg === 0) nextFrontier.push(v);
      }
    }
    frontier = nextFrontier;
  }

  if (order.length !== nodes.length) {
    return {
      ok: false,
      waves: [],
      order: [],
      waveByNodeId: {},
      cyclePath: validation.cyclePath,
      errors: [{ code: 'CYCLE_DETECTED', message: 'Graph contains a cycle and cannot be topologically ordered.' }],
    };
  }

  return {
    ok: true,
    waves,
    order,
    waveByNodeId,
    cyclePath: null,
    errors: [],
  };
}

/**
 * Pure mustache template interpolation without eval/Function.
 * Supports {{input}} and {{nodeId.output}} (whitespace inside braces tolerated).
 */
export function interpolateTemplate(template = '', outputsById = {}, pipelineInput = '') {
  const src = String(template ?? '');
  return src.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, expr) => {
    if (expr === 'input') {
      return String(pipelineInput ?? '');
    }
    if (expr.endsWith('.output')) {
      const nodeId = expr.slice(0, -'.output'.length);
      if (Object.prototype.hasOwnProperty.call(outputsById, nodeId)) {
        const val = outputsById[nodeId];
        return typeof val === 'string' ? val : JSON.stringify(val, null, 2);
      }
      return `[missing:${nodeId}.output]`;
    }
    return match;
  });
}

function shannonEntropy(text) {
  if (!text) return 0;
  const freq = new Map();
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    freq.set(ch, (freq.get(ch) || 0) + 1);
  }
  let h = 0;
  for (const count of freq.values()) {
    const p = count / text.length;
    h -= p * Math.log2(p);
  }
  return Number(h.toFixed(4));
}

function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * Genuine deterministic local JS transform node execution (zero fake timers).
 * Modes: json-validate | markdown-brief | regex-extract | schema-verify
 */
export function executeTransformNode(node, resolvedPrompt) {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const mode = String(node?.model || node?.transformMode || 'markdown-brief').toLowerCase();
  const text = String(resolvedPrompt || '').trim();
  const lines = text ? text.split(/\r?\n/) : [];
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const estTokens = Math.max(1, Math.round(text.length / 4));
  const entropy = shannonEntropy(text);
  const checksum = fnv1a32(text);

  let output = '';

  if (mode === 'json-validate' || mode === 'validator') {
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    const startIdx =
      firstBrace === -1 ? firstBracket : firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket);
    let candidate = text;
    if (startIdx >= 0) {
      const endBrace = text.lastIndexOf('}');
      const endBracket = text.lastIndexOf(']');
      const endIdx = Math.max(endBrace, endBracket);
      if (endIdx > startIdx) candidate = text.slice(startIdx, endIdx + 1);
    }
    try {
      const parsed = JSON.parse(candidate);
      const isArr = Array.isArray(parsed);
      const keys = isArr ? [`array[${parsed.length}]`] : Object.keys(parsed || {});
      output = [
        `[TRANSFORM: json-validate] VALID JSON (${isArr ? `Array(${parsed.length})` : `Object(${keys.length} keys)`})`,
        `Checksum: fnv1a:${checksum} | Entropy: ${entropy} bits/char | Est. Tokens: ${estTokens}`,
        `Top-level Keys: ${keys.join(', ') || '(empty)'}`,
        '--- Normalized Payload ---',
        JSON.stringify(parsed, null, 2),
      ].join('\n');
    } catch (err) {
      output = [
        `[TRANSFORM: json-validate] JSON PARSE DIAGNOSTIC: ${err.message}`,
        `Checksum: fnv1a:${checksum} | Bytes: ${text.length} | Lines: ${lines.length}`,
        'Input preserved as raw text payload:',
        text.slice(0, 600),
      ].join('\n');
    }
  } else if (mode === 'regex-extract') {
    const urls = [...new Set(text.match(/https?:\/\/[^\s"'<>]+/g) || [])];
    const ports = [...new Set(text.match(/(?:127\.0\.0\.1|localhost|0\.0\.0\.0)?:\d{2,5}/g) || [])];
    const paths = [...new Set(text.match(/\/api\/[a-zA-Z0-9/_-]+/g) || [])];
    const cves = [...new Set(text.match(/CVE-\d{4}-\d{4,7}/gi) || [])];
    const envKeys = [...new Set(text.match(/\b[A-Z][A-Z0-9_]{3,}\b/g) || [])].slice(0, 12);
    output = [
      `[TRANSFORM: regex-extract] Deterministic Artifact Extraction`,
      `- Payload Stats: ${text.length} chars · ${lines.length} lines · ${words} words · ~${estTokens} tokens`,
      `- Shannon Entropy: ${entropy} bits/char · Checksum: fnv1a:${checksum}`,
      `- API Routes (${paths.length}): ${paths.length ? paths.join(', ') : 'none detected'}`,
      `- Endpoints / Ports (${ports.length}): ${ports.length ? ports.join(', ') : 'none detected'}`,
      `- URLs (${urls.length}): ${urls.length ? urls.join(', ') : 'none detected'}`,
      `- CVEs (${cves.length}): ${cves.length ? cves.join(', ') : 'none detected'}`,
      `- Uppercase Tokens (${envKeys.length}): ${envKeys.length ? envKeys.join(', ') : 'none detected'}`,
    ].join('\n');
  } else if (mode === 'schema-verify') {
    const hasLoopback = /127\.0\.0\.1|localhost|:\d{4,5}/.test(text);
    const hasWildcard = /0\.0\.0\.0/.test(text);
    const hasSecretPattern = /(sk-[a-zA-Z0-9]{16,}|ghp_[a-zA-Z0-9]{16,}|PRIVATE KEY)/.test(text);
    const checks = [
      `[${text.length >= 12 ? 'PASS' : 'WARN'}] Non-trivial payload length (${text.length} chars, ${words} words)`,
      `[${hasWildcard ? 'WARN' : 'PASS'}] Loopback hygiene (${hasWildcard ? '0.0.0.0 detected' : hasLoopback ? 'loopback endpoints detected' : 'no wildcard bind'})`,
      `[${hasSecretPattern ? 'FAIL' : 'PASS'}] Secret hygiene (${hasSecretPattern ? 'potential credential pattern found' : '0 raw secret patterns'})`,
      `[INFO] Shannon H(X)=${entropy} bits/char · Checksum=fnv1a:${checksum}`,
    ];
    output = [
      `[TRANSFORM: schema-verify] Policy & Schema Audit`,
      ...checks,
      '--- Scope Preview ---',
      text.slice(0, 480),
    ].join('\n');
  } else {
    // markdown-brief (default deterministic synthesizer)
    const sectionHeaders = lines.filter((l) => /^#{1,3}\s+/.test(l.trim()));
    const nonEmpty = lines.filter((l) => l.trim().length > 0);
    const highlights = nonEmpty
      .filter((l) => !/^#{1,3}\s+/.test(l.trim()))
      .slice(0, 6)
      .map((l) => `- ${l.replace(/^[-*•]\s*/, '').trim().slice(0, 180)}`);

    output = [
      `# ${node?.name || 'Pipeline Synthesis Brief'}`,
      `> Deterministic Local JS Transform (\`markdown-brief\`) · Checksum \`fnv1a:${checksum}\` · ${words} words · ~${estTokens} tokens`,
      '',
      `## Upstream Sections Synthesized (${sectionHeaders.length || 1})`,
      ...(sectionHeaders.length
        ? sectionHeaders.map((h) => `- ${h.replace(/^#+\s*/, '')}`)
        : ['- Primary Pipeline Input']),
      '',
      '## Key Extracted Signals',
      ...(highlights.length ? highlights : ['- (Empty upstream input)']),
      '',
      '## Full Combined Context Excerpt',
      text.slice(0, 1200) + (text.length > 1200 ? '\n…[truncated]' : ''),
    ].join('\n');
  }

  const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return {
    ok: true,
    provider: 'transform',
    model: mode,
    output,
    durationMs: Math.max(1, Math.round(t1 - t0)),
    tokenEstimate: Math.max(1, Math.round(output.length / 4)),
    error: null,
  };
}

/**
 * Sugiyama-style layered auto-layout: places each topological wave in a column
 * and centers nodes vertically with barycenter ordering to minimize edge crossings.
 */
export function computeAutoLayout(
  nodes = [],
  edges = [],
  { nodeWidth = 224, nodeHeight = 104, colGap = 86, rowGap = 38, padX = 44, padY = 44 } = {},
) {
  const topo = topologicalWaves(nodes, edges);
  let layers = [];
  if (topo.ok) {
    layers = topo.waves;
  } else {
    // Graceful fallback if user temporarily introduced a cycle
    const cols = Math.max(1, Math.ceil(Math.sqrt(nodes.length)));
    for (let i = 0; i < nodes.length; i += cols) {
      layers.push(nodes.slice(i, i + cols));
    }
  }

  const parentsMap = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edges) {
    if (parentsMap.has(e.target)) parentsMap.get(e.target).push(e.source);
  }

  const maxLayerCount = Math.max(1, ...layers.map((l) => l.length));
  const totalHeight = padY * 2 + maxLayerCount * nodeHeight + Math.max(0, maxLayerCount - 1) * rowGap;
  const totalWidth = padX * 2 + layers.length * nodeWidth + Math.max(0, layers.length - 1) * colGap;

  const positions = {};
  layers.forEach((layer, colIdx) => {
    // Order by parent barycenter when colIdx > 0 to reduce edge crossings
    const ordered =
      colIdx === 0
        ? [...layer]
        : [...layer].sort((a, b) => {
            const avgY = (id) => {
              const ps = (parentsMap.get(id) || []).filter((p) => positions[p]);
              if (!ps.length) return 0;
              return ps.reduce((sum, p) => sum + positions[p].y, 0) / ps.length;
            };
            return avgY(a.id) - avgY(b.id);
          });

    const layerH = ordered.length * nodeHeight + Math.max(0, ordered.length - 1) * rowGap;
    const startY = Math.max(padY, Math.round((totalHeight - layerH) / 2));
    const x = padX + colIdx * (nodeWidth + colGap);

    ordered.forEach((n, rowIdx) => {
      positions[n.id] = {
        x,
        y: startY + rowIdx * (nodeHeight + rowGap),
        wave: colIdx,
      };
    });
  });

  return {
    positions,
    width: Math.max(680, totalWidth),
    height: Math.max(340, totalHeight),
    nodeWidth,
    nodeHeight,
  };
}

/**
 * Serialize DAG to canonical Zoth v2 JSON format.
 */
export function exportDagJson(dag) {
  const payload = {
    schema: 'zoth/agent-dag/v2',
    version: '2.2.0',
    name: dag?.name || 'Untitled Agent DAG',
    pipelineInput: String(dag?.pipelineInput ?? ''),
    nodes: (dag?.nodes || []).map((n) => ({
      id: n.id,
      name: n.name,
      role: n.role || 'Pipeline Worker',
      provider: n.provider || 'transform',
      model: n.model || 'markdown-brief',
      prompt: n.prompt || '',
      ...(typeof n.x === 'number' && typeof n.y === 'number' ? { x: Math.round(n.x), y: Math.round(n.y) } : {}),
    })),
    edges: (dag?.edges || []).map((e) => ({
      id: e.id || `${e.source}->${e.target}`,
      source: e.source,
      target: e.target,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Parse and strictly validate an imported DAG JSON string.
 */
export function importDagJson(rawText) {
  let parsed;
  try {
    parsed = typeof rawText === 'string' ? JSON.parse(rawText) : rawText;
  } catch (err) {
    return { ok: false, error: `Invalid JSON syntax: ${err.message}`, dag: null };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'DAG JSON root must be an object.', dag: null };
  }
  if (!Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
    return { ok: false, error: 'DAG JSON must include a non-empty "nodes" array.', dag: null };
  }
  if (parsed.edges !== undefined && !Array.isArray(parsed.edges)) {
    return { ok: false, error: '"edges" must be an array when provided.', dag: null };
  }

  const normalizedNodes = parsed.nodes.map((n, idx) => ({
    id: String(n?.id || `node_${idx + 1}`).trim(),
    name: String(n?.name || '').trim(),
    role: String(n?.role || 'Pipeline Worker').trim(),
    provider: String(n?.provider || 'transform').trim(),
    model: String(n?.model || 'markdown-brief').trim(),
    prompt: String(n?.prompt || '').trim(),
    ...(typeof n?.x === 'number' && typeof n?.y === 'number' ? { x: n.x, y: n.y } : {}),
  }));
  const normalizedEdges = (parsed.edges || []).map((e, idx) => ({
    id: String(e?.id || `edge_${idx + 1}`),
    source: String(e?.source || '').trim(),
    target: String(e?.target || '').trim(),
  }));

  const validation = validateDag(normalizedNodes, normalizedEdges);
  if (!validation.valid) {
    return {
      ok: false,
      error: validation.errors.map((e) => e.message).join(' '),
      dag: null,
    };
  }

  return {
    ok: true,
    error: null,
    dag: {
      name: String(parsed.name || 'Imported Agent DAG'),
      pipelineInput: String(parsed.pipelineInput ?? ''),
      nodes: normalizedNodes,
      edges: normalizedEdges,
    },
  };
}

function yamlStr(val) {
  return JSON.stringify(String(val ?? ''));
}

/**
 * Serialize DAG to clean Zoth / Workflow YAML.
 */
export function exportDagYaml(dag) {
  const topo = topologicalWaves(dag?.nodes || [], dag?.edges || []);
  const lines = [
    'schema: "zoth/agent-dag/v2"',
    'version: "2.2.0"',
    `name: ${yamlStr(dag?.name || 'Untitled Agent DAG')}`,
    'execution:',
    '  mode: "topological-waves"',
    '  loopback_only: true',
    `  waves: ${topo.ok ? topo.waves.length : 0}`,
    'pipeline_input: |',
    ...String(dag?.pipelineInput ?? '')
      .split('\n')
      .map((l) => `  ${l}`),
    'nodes:',
  ];

  for (const n of dag?.nodes || []) {
    lines.push(`  - id: ${yamlStr(n.id)}`);
    lines.push(`    name: ${yamlStr(n.name)}`);
    lines.push(`    role: ${yamlStr(n.role || 'Pipeline Worker')}`);
    lines.push(`    provider: ${yamlStr(n.provider || 'transform')}`);
    lines.push(`    model: ${yamlStr(n.model || 'markdown-brief')}`);
    lines.push('    prompt: |');
    for (const pl of String(n.prompt || '').split('\n')) {
      lines.push(`      ${pl}`);
    }
  }

  lines.push('edges:');
  if (!dag?.edges?.length) {
    lines.push('  []');
  } else {
    for (const e of dag.edges) {
      lines.push(`  - source: ${yamlStr(e.source)}`);
      lines.push(`    target: ${yamlStr(e.target)}`);
    }
  }
  return lines.join('\n') + '\n';
}

/**
 * Generate a standalone runnable Python 3 script (zero external pip deps)
 * executing the exact topological waves against local Ollama (:11434),
 * AGY-Hermes (:18000), Azoth (:8136), Neuro-Memory (:8094), or local Python transforms.
 */
export function exportDagPython(dag) {
  const topo = topologicalWaves(dag?.nodes || [], dag?.edges || []);
  const wavesData = topo.ok
    ? topo.waves.map((w) => w.map((n) => n.id))
    : [(dag?.nodes || []).map((n) => n.id)];

  const specJson = JSON.stringify(
    {
      name: dag?.name || 'Zoth Agent DAG',
      pipelineInput: String(dag?.pipelineInput ?? ''),
      nodes: (dag?.nodes || []).map((n) => ({
        id: n.id,
        name: n.name,
        role: n.role || 'Pipeline Worker',
        provider: n.provider || 'transform',
        model: n.model || 'markdown-brief',
        prompt: n.prompt || '',
      })),
      waves: wavesData,
    },
    null,
    2,
  );

  return `#!/usr/bin/env python3
"""
Standalone Runnable Multi-Agent DAG Pipeline
Generated by Zoth Studio v2 — Multi-Agent DAG Composer & Pipeline Foundry
Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform
Zero external pip dependencies (Python 3 stdlib only; strict 127.0.0.1 loopback).
"""

import concurrent.futures
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

DAG_SPEC = json.loads(r'''${specJson.replace(/'''/g, "\\'\\'\\'")}''')


def interpolate(template: str, outputs: dict, pipeline_input: str) -> str:
    def repl(match):
        expr = match.group(1).strip()
        if expr == "input":
            return pipeline_input
        if expr.endswith(".output"):
            nid = expr[:-7]
            return str(outputs.get(nid, f"[missing:{nid}.output]"))
        return match.group(0)
    return re.sub(r"\\{\\{\\s*([a-zA-Z0-9_.-]+)\\s*\\}\\}", repl, template)


def http_json(url: str, payload=None, timeout: int = 45):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    headers = {"Content-Type": "application/json"} if data is not None else {}
    req = urllib.request.Request(url, data=data, headers=headers, method="POST" if data else "GET")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def run_step(node: dict, prompt: str) -> dict:
    t0 = time.time()
    provider = node["provider"]
    model = node["model"]
    try:
        if provider == "ollama":
            res = http_json(
                "http://127.0.0.1:11434/api/chat",
                {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": f"You are {node['name']} ({node['role']})."},
                        {"role": "user", "content": prompt},
                    ],
                    "stream": False,
                },
            )
            out = res.get("message", {}).get("content", "")
        elif provider == "agy-hermes":
            res = http_json(
                "http://127.0.0.1:18000/v1/chat/completions",
                {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": f"You are {node['name']} ({node['role']})."},
                        {"role": "user", "content": prompt},
                    ],
                },
            )
            out = res["choices"][0]["message"]["content"]
        elif provider == "neuro-memory":
            q = urllib.parse.quote(prompt[:160])
            res = http_json(f"http://127.0.0.1:8094/api/memories?q={q}&limit=5")
            mems = res.get("memories", [])
            out = "\\n".join(f"- [{m.get('id', '')[:8]}] {m.get('text', '')[:220]}" for m in mems) or "No matching memories."
        elif provider == "azoth":
            res = http_json("http://127.0.0.1:8136/api/chat", {"prompt": prompt, "message": prompt})
            out = res.get("reply") or res.get("response") or json.dumps(res)
        elif provider == "transform":
            out = f"[TRANSFORM:{model}] Processed {len(prompt)} chars\\n{prompt[:1000]}"
        else:
            raise RuntimeError(f"Provider '{provider}' requires interactive CLI or Studio HTTP gateway.")
        return {"ok": True, "id": node["id"], "output": out, "ms": int((time.time() - t0) * 1000)}
    except Exception as exc:
        return {"ok": False, "id": node["id"], "error": str(exc), "ms": int((time.time() - t0) * 1000)}


def main():
    nodes_by_id = {n["id"]: n for n in DAG_SPEC["nodes"]}
    outputs = {}
    pipeline_input = sys.argv[1] if len(sys.argv) > 1 else DAG_SPEC["pipelineInput"]
    print(f"=== Running DAG: {DAG_SPEC['name']} ({len(DAG_SPEC['waves'])} waves) ===")

    for idx, wave in enumerate(DAG_SPEC["waves"], start=1):
        print(f"\\n--- Wave {idx}: {', '.join(wave)} ---")
        with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, len(wave))) as pool:
            futures = {}
            for nid in wave:
                node = nodes_by_id[nid]
                resolved = interpolate(node["prompt"], outputs, pipeline_input)
                futures[pool.submit(run_step, node, resolved)] = nid
            for fut in concurrent.futures.as_completed(futures):
                res = fut.result()
                if res["ok"]:
                    outputs[res["id"]] = res["output"]
                    print(f"[OK] {res['id']} ({res['ms']}ms)\\n{res['output'][:400]}\\n")
                else:
                    print(f"[ERROR] {res['id']} ({res['ms']}ms): {res['error']}", file=sys.stderr)
                    sys.exit(1)

    print("=== DAG Execution Complete ===")


if __name__ == "__main__":
    main()
`;
}
