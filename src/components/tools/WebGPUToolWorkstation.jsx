import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  TextField,
  Tabs,
  Tab,
  Card,
  CardContent,
  Unstable_Grid2 as Grid,
  Stack,
  Divider,
  Tooltip,
  IconButton,
  Alert,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SpeedIcon from '@mui/icons-material/Speed';
import MemoryIcon from '@mui/icons-material/Memory';
import TerminalIcon from '@mui/icons-material/Terminal';
import SecurityIcon from '@mui/icons-material/Security';
import CodeIcon from '@mui/icons-material/Code';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { runWebGPUMatrixBenchmark } from '../../utils/webgpuEngine';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

/* --------------------------------------------------------------------------
   1. JWT Inspector Guard Workstation
   -------------------------------------------------------------------------- */
function JwtInspectorWorkstation({ isDark, gold }) {
  const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ6b3RoLXNvdmVyZWlnbi1hZ2VudCIsInJvbGUiOiJhcmNob24tYWRtaW4iLCJpc3MiOiJ6b3RoLm51bGxhaS50ZWNoIiwiYXVkIjoic3dhcm0tbWVzaCIsImlhdCI6MTczODAwMDAwMCwiZXhwIjoyMDgwMDAwMDAwfQ.K8z4jT9N0_mB2V8oP3wQ1rL9sU2vX5yZ7aB1cE3gH4k';
  const [tokenInput, setTokenInput] = useState(sampleToken);
  const [parsedHeader, setParsedHeader] = useState(null);
  const [parsedPayload, setParsedPayload] = useState(null);
  const [signatureRaw, setSignatureRaw] = useState('');
  const [parseError, setParseError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const parts = tokenInput.trim().split('.');
      if (parts.length >= 2) {
        const h = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const p = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        setParsedHeader(h);
        setParsedPayload(p);
        setSignatureRaw(parts[2] || '');
        setParseError(null);
      } else {
        setParseError('Token must consist of at least header.payload[.signature]');
      }
    } catch (e) {
      setParseError('Base64URL decoding error: invalid JWT payload structure.');
    }
  }, [tokenInput]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <TextField
        fullWidth
        label="JWT Raw Token to Inspect"
        value={tokenInput}
        onChange={(e) => setTokenInput(e.target.value)}
        multiline
        rows={3}
        variant="outlined"
        sx={{
          '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.8rem' },
        }}
      />

      {parseError ? (
        <Alert severity="warning" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
          {parseError}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          <Grid xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}`, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#F87171' }}>HEADER: ALGORITHM & TYPE</Typography>
                <Chip label={parsedHeader?.alg || 'HS256'} size="small" sx={{ fontFamily: mono, height: 20, fontSize: '0.68rem', bgcolor: 'rgba(248,113,113,0.15)', color: '#F87171' }} />
              </Box>
              <Box component="pre" sx={{ m: 0, fontFamily: mono, fontSize: '0.78rem', color: isDark ? '#E2E8F0' : '#1E293B', overflowX: 'auto' }}>
                {JSON.stringify(parsedHeader, null, 2)}
              </Box>
            </Paper>
          </Grid>
          <Grid xs={12} md={5}>
            <Paper sx={{ p: 2, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}`, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#A78BFA' }}>PAYLOAD: DECODED CLAIMS</Typography>
                <Chip label="Zero-Egress Verified" size="small" sx={{ fontFamily: mono, height: 20, fontSize: '0.68rem', bgcolor: 'rgba(167,139,250,0.15)', color: '#A78BFA' }} />
              </Box>
              <Box component="pre" sx={{ m: 0, fontFamily: mono, fontSize: '0.78rem', color: isDark ? '#E2E8F0' : '#1E293B', overflowX: 'auto' }}>
                {JSON.stringify(parsedPayload, null, 2)}
              </Box>
            </Paper>
          </Grid>
          <Grid xs={12} md={3}>
            <Paper sx={{ p: 2, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}`, height: '100%' }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#38BDF8', display: 'block', mb: 1 }}>CRYPTOGRAPHIC SIGNATURE</Typography>
              <Typography variant="caption" sx={{ fontFamily: mono, fontSize: '0.72rem', color: 'text.secondary', display: 'block', wordBreak: 'break-all', mb: 1.5 }}>
                {signatureRaw ? `${signatureRaw.substring(0, 32)}...` : 'Unsigned Token'}
              </Typography>
              <Chip label={signatureRaw ? 'Signature Attached' : 'Unsigned'} size="small" sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.68rem', bgcolor: signatureRaw ? 'rgba(56,189,248,0.15)' : 'rgba(239,68,68,0.15)', color: signatureRaw ? '#38BDF8' : '#EF4444' }} />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

/* --------------------------------------------------------------------------
   2. Payload Shannon Entropy Studio Workstation
   -------------------------------------------------------------------------- */
function PayloadEntropyWorkstation({ isDark, gold }) {
  const PRESETS = {
    encrypted: 'U2FsdGVkX1+9bX4uYg781kNmOqVpRtWvYz1234567890abcdefghijklmnopqrstuvwxyz/+=!@#$%^&*()_+~`|}{[]:;?><,./128471928374192834719238471928347129384712983471928374',
    webshell: '<?php @eval(base64_decode($_POST[\'zoth_cmd\'])); $c=gzinflate(base64_decode("SyxKz89Lz8nMS85PK0nNK8nMzUvPBwA=")); echo $c; ?>',
    plaintext: 'Zoth Studio v2 is an air-gapped sovereign development environment engineered for orchestrating autonomous AI agent pantheons with zero outbound telemetry.',
    json: '{\n  "status": "SOVEREIGN_NODE_ONLINE",\n  "version": "2.5.0",\n  "ports": [11434, 8094, 8787, 3000]\n}',
  };

  const [inputVal, setInputVal] = useState(PRESETS.webshell);
  const [entropy, setEntropy] = useState(0);
  const [byteDist, setByteDist] = useState([]);
  const [bench, setBench] = useState(null);
  const [computing, setComputing] = useState(false);

  const calculateEntropy = (str) => {
    const bytes = new TextEncoder().encode(str);
    if (bytes.length === 0) {
      setEntropy(0);
      setByteDist([]);
      return;
    }
    const counts = {};
    bytes.forEach((b) => { counts[b] = (counts[b] || 0) + 1; });
    let ent = 0;
    Object.values(counts).forEach((c) => {
      const p = c / bytes.length;
      ent -= p * Math.log2(p);
    });
    setEntropy(parseFloat(ent.toFixed(3)));

    const topBytes = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([b, count]) => ({
        byte: `0x${parseInt(b, 10).toString(16).padStart(2, '0').toUpperCase()}`,
        pct: ((count / bytes.length) * 100).toFixed(1),
      }));
    setByteDist(topBytes);
  };

  useEffect(() => {
    calculateEntropy(inputVal);
  }, [inputVal]);

  const handleRunGPUCompute = async () => {
    setComputing(true);
    const b = await runWebGPUMatrixBenchmark();
    setBench(b);
    setComputing(false);
  };

  const riskLabel = entropy >= 7.0 ? 'CRITICAL OBSTACLES (High Entropy / Encrypted Payload)' : entropy >= 5.2 ? 'MODERATE (Compressed or Packed Shell)' : 'LOW (Plaintext / Standard Code)';
  const riskColor = entropy >= 7.0 ? '#EF4444' : entropy >= 5.2 ? '#F59E0B' : '#10B981';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: 'text.secondary' }}>PRESETS:</Typography>
        {Object.entries(PRESETS).map(([key, val]) => (
          <Button key={key} size="small" variant="outlined" onClick={() => setInputVal(val)} sx={{ fontFamily: mono, fontSize: '0.72rem', py: 0.2, px: 1 }}>
            {key}
          </Button>
        ))}
        <Button size="small" variant="contained" onClick={handleRunGPUCompute} startIcon={<SpeedIcon />} sx={{ ml: 'auto', fontFamily: mono, fontSize: '0.74rem', bgcolor: gold.accent, color: '#08080B' }}>
          {computing ? 'Computing...' : 'Run WebGPU Tensor Shader'}
        </Button>
      </Box>

      <TextField
        fullWidth
        label="Payload Buffer for Shannon Entropy Analysis"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        multiline
        rows={4}
        variant="outlined"
        sx={{ '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.8rem' } }}
      />

      <Grid container spacing={2}>
        <Grid xs={12} sm={4}>
          <Paper sx={{ p: 2, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}` }}>
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: 'text.secondary' }}>SHANNON ENTROPY (H)</Typography>
            <Typography sx={{ fontFamily: mono, fontWeight: 900, fontSize: '2rem', color: riskColor }}>
              {entropy} <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>bits/byte</span>
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Max theoretical: 8.000 bits/byte</Typography>
          </Paper>
        </Grid>
        <Grid xs={12} sm={8}>
          <Paper sx={{ p: 2, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}`, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>OBFUSCATION / WEBSHELL RISK EVALUATION</Typography>
            <Chip label={riskLabel} sx={{ bgcolor: `${riskColor}22`, color: riskColor, fontFamily: mono, fontWeight: 800, fontSize: '0.76rem', alignSelf: 'flex-start', mb: 1 }} />
            {bench && (
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8' }}>
                ⚡ WGSL Compute Shader Verified: {bench.adapter} ({bench.tflops}, {bench.timeMs}ms)
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/* --------------------------------------------------------------------------
   3. Polyglot Framework Exporter Workstation
   -------------------------------------------------------------------------- */
function PolyglotExporterWorkstation({ isDark, gold }) {
  const [componentName, setComponentName] = useState('SovereignCounter');
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const vueCode = `<script setup>
import { ref } from 'vue';
const count = ref(0);
const increment = () => { count.value++; };
</script>

<template>
  <div class="sovereign-card">
    <h3>${componentName} (Vue 3 Composition)</h3>
    <button @click="increment">Count: {{ count }}</button>
  </div>
</template>`;

  const svelteCode = `<script>
  let count = 0;
  function increment() { count += 1; }
</script>

<div class="sovereign-card">
  <h3>${componentName} (Svelte 5 Runes)</h3>
  <button on:click={increment}>Count: {count}</button>
</div>`;

  const solidCode = `import { createSignal } from 'solid-js';

export function ${componentName}() {
  const [count, setCount] = createSignal(0);
  return (
    <div class="sovereign-card">
      <h3>${componentName} (Solid.js Signals)</h3>
      <button onClick={() => setCount(c => c + 1)}>Count: {count()}</button>
    </div>
  );
}`;

  const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${componentName}</title>
</head>
<body>
  <div class="sovereign-card">
    <h3 id="title">${componentName}</h3>
    <button id="btn">Count: 0</button>
  </div>
  <script>
    let c = 0;
    const btn = document.getElementById('btn');
    btn.onclick = () => { c++; btn.textContent = 'Count: ' + c; };
  </script>
</body>
</html>`;

  const snippets = [vueCode, svelteCode, solidCode, htmlCode];
  const tabLabels = ['Vue 3 (SFC)', 'Svelte 5', 'Solid.js', 'Pure HTML5'];

  const handleCopy = () => {
    navigator.clipboard?.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="Component Name"
          value={componentName}
          onChange={(e) => setComponentName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
          sx={{ fontFamily: mono, width: 240 }}
        />
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          {tabLabels.map((lbl, idx) => (
            <Tab key={lbl} label={lbl} sx={{ fontFamily: mono, fontSize: '0.76rem', minHeight: 36 }} />
          ))}
        </Tabs>
        <Button size="small" variant="outlined" onClick={handleCopy} startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />} sx={{ fontFamily: mono, fontSize: '0.74rem' }}>
          {copied ? 'Copied' : 'Copy Code'}
        </Button>
      </Box>

      <Paper sx={{ p: 2, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}` }}>
        <Box component="pre" sx={{ m: 0, fontFamily: mono, fontSize: '0.8rem', color: isDark ? '#A7F3D0' : '#065F46', overflowX: 'auto', minHeight: 180 }}>
          {snippets[activeTab]}
        </Box>
      </Paper>
    </Box>
  );
}

/* --------------------------------------------------------------------------
   4. Regex Droid Builder Workstation
   -------------------------------------------------------------------------- */
function RegexDroidWorkstation({ isDark, gold }) {
  const [pattern, setPattern] = useState('(?:https?:\\/\\/)?([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})([/\\S]*)?');
  const [flags, setFlags] = useState('gi');
  const [testText, setTestText] = useState('Check endpoints at https://zoth.nullai.tech/arsenal or http://127.0.0.1:8094/sse');
  const [matches, setMatches] = useState([]);
  const [regexError, setRegexError] = useState(null);

  useEffect(() => {
    try {
      const reg = new RegExp(pattern, flags);
      const res = [];
      let m;
      if (flags.includes('g')) {
        while ((m = reg.exec(testText)) !== null) {
          res.push({ match: m[0], index: m.index, groups: m.slice(1) });
          if (m.index === reg.lastIndex) reg.lastIndex++;
        }
      } else {
        m = reg.exec(testText);
        if (m) res.push({ match: m[0], index: m.index, groups: m.slice(1) });
      }
      setMatches(res);
      setRegexError(null);
    } catch (err) {
      setRegexError(err.message);
      setMatches([]);
    }
  }, [pattern, flags, testText]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Grid container spacing={2}>
        <Grid xs={12} sm={9}>
          <TextField
            fullWidth
            label="Regular Expression Pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.85rem' } }}
          />
        </Grid>
        <Grid xs={12} sm={3}>
          <TextField
            fullWidth
            label="Flags"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.85rem' } }}
          />
        </Grid>
      </Grid>

      <TextField
        fullWidth
        label="Test String"
        value={testText}
        onChange={(e) => setTestText(e.target.value)}
        multiline
        rows={3}
        sx={{ '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.85rem' } }}
      />

      {regexError ? (
        <Alert severity="error" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>{regexError}</Alert>
      ) : (
        <Paper sx={{ p: 2, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent }}>
              MATCHES FOUND ({matches.length})
            </Typography>
            <Chip label="In-Browser Engine Active" size="small" sx={{ fontFamily: mono, height: 20, fontSize: '0.68rem', bgcolor: 'rgba(52,211,153,0.15)', color: '#34D399' }} />
          </Box>
          {matches.length === 0 ? (
            <Typography variant="body2" sx={{ fontFamily: mono, color: 'text.secondary' }}>No matches found for current pattern.</Typography>
          ) : (
            <Stack spacing={1}>
              {matches.map((m, idx) => (
                <Box key={idx} sx={{ p: 1, borderRadius: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', border: `1px solid ${gold.border}` }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: '#38BDF8' }}>
                    Match #{idx + 1} at index {m.index}: <code>"{m.match}"</code>
                  </Typography>
                  {m.groups.length > 0 && (
                    <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {m.groups.map((g, gIdx) => (
                        <Chip key={gIdx} label={`Group ${gIdx + 1}: ${g || 'undefined'}`} size="small" sx={{ fontFamily: mono, height: 20, fontSize: '0.68rem' }} />
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      )}
    </Box>
  );
}

/* --------------------------------------------------------------------------
   5. Schema Illustrator Studio Workstation
   -------------------------------------------------------------------------- */
function SchemaIllustratorWorkstation({ isDark, gold }) {
  const sampleSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'SovereignAgentEnvelope',
    type: 'object',
    required: ['agent_id', 'cadre', 'epoch', 'digest'],
    properties: {
      agent_id: { type: 'string', description: 'Unique agent UUID or moniker' },
      cadre: { type: 'string', enum: ['Command', 'Offense', 'Memory', 'Sovereignty'] },
      epoch: { type: 'integer', minimum: 0 },
      digest: { type: 'string', pattern: '^0x[a-fA-F0-9]{64}$' },
      telemetry_allowed: { type: 'boolean', default: false },
    },
  };

  const [schemaJson, setSchemaJson] = useState(JSON.stringify(sampleSchema, null, 2));
  const [parsed, setParsed] = useState(sampleSchema);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setParsed(JSON.parse(schemaJson));
      setError(null);
    } catch (e) {
      setError('Invalid JSON syntax');
    }
  }, [schemaJson]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            label="JSON-Schema Input"
            value={schemaJson}
            onChange={(e) => setSchemaJson(e.target.value)}
            multiline
            rows={10}
            sx={{ '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.78rem' } }}
          />
        </Grid>
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}`, height: '100%', overflowY: 'auto' }}>
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent, display: 'block', mb: 1 }}>
              ENTITY STRUCTURE: {parsed?.title || 'Schema Entity'}
            </Typography>
            {error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Stack spacing={1}>
                {parsed?.properties &&
                  Object.entries(parsed.properties).map(([field, meta]) => {
                    const isReq = parsed.required?.includes(field);
                    return (
                      <Box key={field} sx={{ p: 1, borderRadius: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', border: `1px solid ${gold.border}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography sx={{ fontFamily: mono, fontWeight: 700, fontSize: '0.8rem', color: isDark ? '#E2E8F0' : '#1E293B' }}>
                            {field}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Chip label={meta.type || 'any'} size="small" sx={{ fontFamily: mono, height: 18, fontSize: '0.65rem', bgcolor: 'rgba(56,189,248,0.15)', color: '#38BDF8' }} />
                            {isReq && <Chip label="REQUIRED" size="small" sx={{ fontFamily: mono, height: 18, fontSize: '0.62rem', bgcolor: 'rgba(239,68,68,0.15)', color: '#EF4444' }} />}
                          </Box>
                        </Box>
                        {meta.description && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                            {meta.description}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/* --------------------------------------------------------------------------
   6. PWA Manifest Builder Workstation
   -------------------------------------------------------------------------- */
function PwaManifestWorkstation({ isDark, gold }) {
  const [appName, setAppName] = useState('Zoth Sovereign Studio');
  const [shortName, setShortName] = useState('ZothStudio');
  const [themeColor, setThemeColor] = useState('#08080B');
  const [copied, setCopied] = useState(false);

  const manifest = {
    name: appName,
    short_name: shortName,
    start_url: '/',
    display: 'standalone',
    background_color: themeColor,
    theme_color: themeColor,
    icons: [
      { src: '/brand/ghostbyte-dark.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/ghostbyte-dark.png', sizes: '512x512', type: 'image/png' },
    ],
  };

  const jsonStr = JSON.stringify(manifest, null, 2);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Grid container spacing={2}>
        <Grid xs={12} sm={4}>
          <TextField fullWidth size="small" label="App Name" value={appName} onChange={(e) => setAppName(e.target.value)} />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField fullWidth size="small" label="Short Name" value={shortName} onChange={(e) => setShortName(e.target.value)} />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField fullWidth size="small" label="Theme Color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} />
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent }}>
            MANIFEST.WEBMANIFEST
          </Typography>
          <Button size="small" variant="outlined" onClick={() => { navigator.clipboard?.writeText(jsonStr); setCopied(true); setTimeout(() => setCopied(false), 2000); }} startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />} sx={{ fontFamily: mono, fontSize: '0.72rem' }}>
            {copied ? 'Copied' : 'Copy JSON'}
          </Button>
        </Box>
        <Box component="pre" sx={{ m: 0, fontFamily: mono, fontSize: '0.8rem', color: isDark ? '#A7F3D0' : '#065F46' }}>
          {jsonStr}
        </Box>
      </Paper>
    </Box>
  );
}

/* --------------------------------------------------------------------------
   Master Interactive Tool Workstation Dispatcher
   -------------------------------------------------------------------------- */
export default function WebGPUToolWorkstation({ tool }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
    wash: isDark ? 'rgba(212,175,55,0.12)' : '#FEF9E7',
    border: isDark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.3)',
  };

  const renderToolComponent = () => {
    switch (tool?.id) {
      case 'jwt-inspector-guard':
        return <JwtInspectorWorkstation isDark={isDark} gold={gold} />;
      case 'payload-entropy-studio':
        return <PayloadEntropyWorkstation isDark={isDark} gold={gold} />;
      case 'polyglot-framework-exporter':
        return <PolyglotExporterWorkstation isDark={isDark} gold={gold} />;
      case 'regex-droid-builder':
        return <RegexDroidWorkstation isDark={isDark} gold={gold} />;
      case 'schema-illustrator-studio':
        return <SchemaIllustratorWorkstation isDark={isDark} gold={gold} />;
      case 'pwa-manifest-builder':
        return <PwaManifestWorkstation isDark={isDark} gold={gold} />;
      default:
        return (
          <PayloadEntropyWorkstation isDark={isDark} gold={gold} />
        );
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 5,
        borderRadius: 3,
        bgcolor: isDark ? '#0A0A10' : '#FFFFFF',
        border: `1.5px solid ${gold.border}`,
        boxShadow: isDark
          ? '0 12px 32px rgba(0,0,0,0.6), 0 0 20px -4px rgba(56,189,248,0.2)'
          : '0 4px 20px rgba(56,189,248,0.12)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? 'rgba(56,189,248,0.15)' : '#F0F9FF', color: '#38BDF8', display: 'flex' }}>
            <SpeedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2 }}>
              Interactive Client-Side Workstation
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8', fontWeight: 700 }}>
              IN-BROWSER WEBGPU / WASM ENGINE · ZERO DATA EGRESS
            </Typography>
          </Box>
        </Box>
        <Chip
          icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important', color: '#10B981' }} />}
          label="RUNNING ON YOUR DEVICE HARDWARE"
          size="small"
          sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.68rem', bgcolor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', color: isDark ? '#34D399' : '#047857' }}
        />
      </Box>

      {renderToolComponent()}
    </Paper>
  );
}
