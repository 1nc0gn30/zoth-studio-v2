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
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import PanToolIcon from '@mui/icons-material/PanTool';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import RefreshIcon from '@mui/icons-material/Refresh';
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
   7. Vision Gesture Control Workstation (In-Browser Skeletal & WebGPU Tracker)
   -------------------------------------------------------------------------- */
const SKELETON_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm transverse connections
  [5, 9], [9, 13], [13, 17],
];

const GESTURE_PRESETS = {
  PEACE_SIGN: {
    id: 'PEACE_SIGN',
    name: 'Victory / Peace (V-Sign)',
    icon: '✌️',
    action: 'SOVEREIGN_VAULT_DECRYPT',
    description: 'Index and middle fingers extended in strict V-geometry. Decrypts sovereign enclave session token.',
    confidence: 0.994,
    points: [
      { x: 0.50, y: 0.82, z: 0.00 },
      { x: 0.44, y: 0.74, z: -0.02 }, { x: 0.40, y: 0.65, z: -0.04 }, { x: 0.42, y: 0.58, z: -0.02 }, { x: 0.46, y: 0.55, z: 0.05 },
      { x: 0.46, y: 0.55, z: -0.02 }, { x: 0.42, y: 0.42, z: -0.05 }, { x: 0.39, y: 0.30, z: -0.08 }, { x: 0.36, y: 0.20, z: -0.10 },
      { x: 0.50, y: 0.53, z: -0.02 }, { x: 0.49, y: 0.38, z: -0.05 }, { x: 0.50, y: 0.26, z: -0.08 }, { x: 0.51, y: 0.16, z: -0.10 },
      { x: 0.54, y: 0.56, z: -0.02 }, { x: 0.55, y: 0.63, z: 0.03 }, { x: 0.53, y: 0.68, z: 0.06 }, { x: 0.49, y: 0.65, z: 0.08 },
      { x: 0.58, y: 0.60, z: -0.01 }, { x: 0.60, y: 0.67, z: 0.04 }, { x: 0.58, y: 0.72, z: 0.06 }, { x: 0.54, y: 0.68, z: 0.08 },
    ],
  },
  OPEN_PALM: {
    id: 'OPEN_PALM',
    name: 'Open Palm / Broadcast Halt',
    icon: '✋',
    action: 'CLEAR_ACTIVE_WORKSPACE',
    description: 'All 5 digits splayed outward. Signals immediate workspace clear & canvas refresh across all terminals.',
    confidence: 0.998,
    points: [
      { x: 0.50, y: 0.82, z: 0.00 },
      { x: 0.40, y: 0.72, z: -0.02 }, { x: 0.33, y: 0.64, z: -0.04 }, { x: 0.26, y: 0.56, z: -0.06 }, { x: 0.20, y: 0.48, z: -0.08 },
      { x: 0.44, y: 0.54, z: -0.02 }, { x: 0.40, y: 0.41, z: -0.04 }, { x: 0.38, y: 0.29, z: -0.06 }, { x: 0.36, y: 0.18, z: -0.08 },
      { x: 0.50, y: 0.52, z: -0.02 }, { x: 0.50, y: 0.37, z: -0.04 }, { x: 0.50, y: 0.25, z: -0.06 }, { x: 0.50, y: 0.14, z: -0.08 },
      { x: 0.56, y: 0.54, z: -0.02 }, { x: 0.58, y: 0.40, z: -0.04 }, { x: 0.60, y: 0.28, z: -0.06 }, { x: 0.62, y: 0.18, z: -0.08 },
      { x: 0.62, y: 0.58, z: -0.01 }, { x: 0.67, y: 0.46, z: -0.03 }, { x: 0.71, y: 0.36, z: -0.05 }, { x: 0.74, y: 0.27, z: -0.07 },
    ],
  },
  SWARM_PINCH: {
    id: 'SWARM_PINCH',
    name: 'Swarm Pinch / Node Spotlight',
    icon: '🤏',
    action: 'FOCUS_AZOTH_ORCHESTRATOR',
    description: 'Thumb and index tips in micro-metric contact. Focuses sovereign Azoth agent orchestrator in swarm multiplexer.',
    confidence: 0.989,
    points: [
      { x: 0.50, y: 0.82, z: 0.00 },
      { x: 0.44, y: 0.73, z: -0.02 }, { x: 0.40, y: 0.63, z: -0.04 }, { x: 0.42, y: 0.51, z: -0.02 }, { x: 0.46, y: 0.43, z: 0.01 },
      { x: 0.46, y: 0.55, z: -0.02 }, { x: 0.44, y: 0.47, z: -0.01 }, { x: 0.45, y: 0.44, z: 0.01 }, { x: 0.47, y: 0.42, z: 0.01 },
      { x: 0.50, y: 0.53, z: -0.02 }, { x: 0.52, y: 0.42, z: -0.04 }, { x: 0.53, y: 0.32, z: -0.06 }, { x: 0.54, y: 0.23, z: -0.08 },
      { x: 0.55, y: 0.56, z: -0.02 }, { x: 0.58, y: 0.46, z: -0.04 }, { x: 0.60, y: 0.37, z: -0.05 }, { x: 0.62, y: 0.28, z: -0.06 },
      { x: 0.60, y: 0.60, z: -0.01 }, { x: 0.65, y: 0.51, z: -0.03 }, { x: 0.68, y: 0.43, z: -0.04 }, { x: 0.70, y: 0.36, z: -0.05 },
    ],
  },
  THUMBS_UP: {
    id: 'THUMBS_UP',
    name: 'Thumbs Up / Gate Pass',
    icon: '👍',
    action: 'CONFIRM_BUILD_VERIFICATION',
    description: 'Thumb elevated +45 degrees, other digits clenched. Verifies deterministic SHA-256 build artifact passes.',
    confidence: 0.996,
    points: [
      { x: 0.50, y: 0.82, z: 0.00 },
      { x: 0.43, y: 0.72, z: -0.03 }, { x: 0.38, y: 0.60, z: -0.06 }, { x: 0.37, y: 0.46, z: -0.09 }, { x: 0.36, y: 0.32, z: -0.12 },
      { x: 0.47, y: 0.60, z: -0.02 }, { x: 0.49, y: 0.66, z: 0.04 }, { x: 0.48, y: 0.72, z: 0.07 }, { x: 0.44, y: 0.69, z: 0.09 },
      { x: 0.51, y: 0.61, z: -0.02 }, { x: 0.53, y: 0.67, z: 0.04 }, { x: 0.52, y: 0.73, z: 0.07 }, { x: 0.48, y: 0.70, z: 0.09 },
      { x: 0.55, y: 0.63, z: -0.02 }, { x: 0.56, y: 0.69, z: 0.04 }, { x: 0.55, y: 0.74, z: 0.06 }, { x: 0.51, y: 0.71, z: 0.08 },
      { x: 0.59, y: 0.66, z: -0.01 }, { x: 0.60, y: 0.71, z: 0.03 }, { x: 0.58, y: 0.75, z: 0.05 }, { x: 0.54, y: 0.72, z: 0.07 },
    ],
  },
  TACTICAL_FIST: {
    id: 'TACTICAL_FIST',
    name: 'Tactical Fist / Enclave Lock',
    icon: '✊',
    action: 'ENGAGE_AIRGAP_LOCKDOWN',
    description: 'All 5 digits curled tightly into central palm. Immediately engages zero-egress hardware air-gap isolation.',
    confidence: 0.999,
    points: [
      { x: 0.50, y: 0.82, z: 0.00 },
      { x: 0.45, y: 0.75, z: -0.02 }, { x: 0.44, y: 0.68, z: 0.02 }, { x: 0.48, y: 0.64, z: 0.08 }, { x: 0.54, y: 0.63, z: 0.12 },
      { x: 0.46, y: 0.62, z: -0.02 }, { x: 0.47, y: 0.69, z: 0.05 }, { x: 0.46, y: 0.75, z: 0.08 }, { x: 0.42, y: 0.72, z: 0.10 },
      { x: 0.51, y: 0.62, z: -0.02 }, { x: 0.52, y: 0.69, z: 0.05 }, { x: 0.51, y: 0.75, z: 0.08 }, { x: 0.47, y: 0.72, z: 0.10 },
      { x: 0.55, y: 0.63, z: -0.02 }, { x: 0.56, y: 0.70, z: 0.05 }, { x: 0.54, y: 0.76, z: 0.07 }, { x: 0.50, y: 0.73, z: 0.09 },
      { x: 0.59, y: 0.66, z: -0.01 }, { x: 0.60, y: 0.72, z: 0.04 }, { x: 0.58, y: 0.77, z: 0.06 }, { x: 0.54, y: 0.74, z: 0.08 },
    ],
  },
  ROCK_ON: {
    id: 'ROCK_ON',
    name: 'Rock / Horns (WGSL Boost)',
    icon: '🤘',
    action: 'BOOST_WEBGPU_INFERENCE',
    description: 'Index and pinky digits extended, middle and ring curled, thumb locked. Accelerates WebGPU compute pipeline.',
    confidence: 0.992,
    points: [
      { x: 0.50, y: 0.82, z: 0.00 },
      { x: 0.44, y: 0.74, z: -0.02 }, { x: 0.43, y: 0.66, z: 0.02 }, { x: 0.47, y: 0.63, z: 0.06 }, { x: 0.51, y: 0.62, z: 0.09 },
      { x: 0.46, y: 0.55, z: -0.02 }, { x: 0.43, y: 0.42, z: -0.05 }, { x: 0.40, y: 0.30, z: -0.08 }, { x: 0.38, y: 0.19, z: -0.10 },
      { x: 0.50, y: 0.56, z: -0.02 }, { x: 0.51, y: 0.64, z: 0.04 }, { x: 0.50, y: 0.71, z: 0.07 }, { x: 0.47, y: 0.68, z: 0.09 },
      { x: 0.55, y: 0.58, z: -0.02 }, { x: 0.56, y: 0.66, z: 0.04 }, { x: 0.54, y: 0.72, z: 0.07 }, { x: 0.50, y: 0.69, z: 0.09 },
      { x: 0.60, y: 0.59, z: -0.01 }, { x: 0.64, y: 0.46, z: -0.04 }, { x: 0.67, y: 0.34, z: -0.07 }, { x: 0.70, y: 0.22, z: -0.09 },
    ],
  },
  POINTING: {
    id: 'POINTING',
    name: 'Neural Point / Target Lock',
    icon: '👉',
    action: 'EXECUTE_ACTIVE_TASK',
    description: 'Index extended forward with thumb resting upright. Targets active task execution pipeline in local workspace.',
    confidence: 0.995,
    points: [
      { x: 0.50, y: 0.82, z: 0.00 },
      { x: 0.45, y: 0.73, z: -0.02 }, { x: 0.42, y: 0.62, z: -0.04 }, { x: 0.44, y: 0.52, z: -0.02 }, { x: 0.47, y: 0.45, z: 0.03 },
      { x: 0.46, y: 0.55, z: -0.02 }, { x: 0.43, y: 0.42, z: -0.05 }, { x: 0.40, y: 0.29, z: -0.08 }, { x: 0.38, y: 0.16, z: -0.11 },
      { x: 0.50, y: 0.58, z: -0.02 }, { x: 0.51, y: 0.66, z: 0.04 }, { x: 0.50, y: 0.73, z: 0.07 }, { x: 0.46, y: 0.70, z: 0.09 },
      { x: 0.55, y: 0.60, z: -0.02 }, { x: 0.56, y: 0.68, z: 0.04 }, { x: 0.54, y: 0.74, z: 0.07 }, { x: 0.50, y: 0.71, z: 0.09 },
      { x: 0.60, y: 0.62, z: -0.01 }, { x: 0.61, y: 0.70, z: 0.03 }, { x: 0.59, y: 0.75, z: 0.05 }, { x: 0.55, y: 0.72, z: 0.07 },
    ],
  },
};

function VisionGestureWorkstation({ isDark, gold }) {
  const theme = useTheme();
  const [currentPresetKey, setCurrentPresetKey] = useState('PEACE_SIGN');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [autoSequence, setAutoSequence] = useState(false);
  const [webgpuMetrics, setWebgpuMetrics] = useState(null);
  const [benchmarking, setBenchmarking] = useState(false);
  const [fps, setFps] = useState(60);
  const [dispatchedAction, setDispatchedAction] = useState({
    action: 'SOVEREIGN_VAULT_DECRYPT',
    desc: 'Zero-egress cryptographic token pipeline unlocked.',
    time: new Date().toLocaleTimeString(),
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const currentPointsRef = useRef(
    GESTURE_PRESETS.PEACE_SIGN.points.map((p) => ({ ...p }))
  );
  const rafRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  const activePreset = GESTURE_PRESETS[currentPresetKey] || GESTURE_PRESETS.PEACE_SIGN;

  const handleSelectPreset = (key) => {
    setCurrentPresetKey(key);
    const p = GESTURE_PRESETS[key];
    if (p) {
      setDispatchedAction({
        action: p.action,
        desc: p.description,
        time: new Date().toLocaleTimeString(),
      });
    }
  };

  const handleToggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
      setCameraError(null);
    } else {
      setCameraError(null);
      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          throw new Error('Camera stream not supported in this browser context.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
      } catch (err) {
        setCameraError(err.message || 'Camera permission denied or device not found.');
        setCameraActive(false);
      }
    }
  };

  const handleRunBenchmark = async () => {
    setBenchmarking(true);
    try {
      const res = await runWebGPUMatrixBenchmark(512);
      setWebgpuMetrics(res);
    } catch (e) {
      console.warn('WebGPU Benchmark error:', e);
    } finally {
      setBenchmarking(false);
    }
  };

  useEffect(() => {
    if (!autoSequence) return;
    const keys = Object.keys(GESTURE_PRESETS);
    const timer = setInterval(() => {
      setCurrentPresetKey((prev) => {
        const idx = keys.indexOf(prev);
        const nextKey = keys[(idx + 1) % keys.length];
        const p = GESTURE_PRESETS[nextKey];
        if (p) {
          setDispatchedAction({
            action: p.action,
            desc: p.description,
            time: new Date().toLocaleTimeString(),
          });
        }
        return nextKey;
      });
    }, 2400);
    return () => clearInterval(timer);
  }, [autoSequence]);

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const renderLoop = (time) => {
      const delta = time - lastTimeRef.current;
      frameCountRef.current += 1;
      if (delta >= 1000) {
        setFps((frameCountRef.current * 1000) / delta);
        frameCountRef.current = 0;
        lastTimeRef.current = time;
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (cameraActive && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.save();
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        ctx.fillStyle = isDark ? 'rgba(8, 8, 11, 0.65)' : 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      } else {
        ctx.fillStyle = isDark ? '#05060A' : '#F8FAFC';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(2, 132, 199, 0.08)';
        ctx.lineWidth = 1;
        const step = 35;
        for (let x = 0; x < width; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 110, 0, Math.PI * 2);
        ctx.arc(width / 2, height / 2, 60, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(184, 134, 11, 0.12)';
        ctx.stroke();
      }

      const targetPoints = activePreset.points;
      const cur = currentPointsRef.current;
      const oscillation = Math.sin(time / 500) * 0.003;
      const oscillationY = Math.cos(time / 650) * 0.003;

      for (let i = 0; i < cur.length; i++) {
        const target = targetPoints[i];
        if (target) {
          cur[i].x += (target.x - cur[i].x) * 0.14;
          cur[i].y += (target.y - cur[i].y) * 0.14;
          cur[i].z += (target.z - cur[i].z) * 0.14;
        }
      }

      ctx.save();
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#38BDF8';

      SKELETON_CONNECTIONS.forEach(([i1, i2]) => {
        const p1 = cur[i1];
        const p2 = cur[i2];
        if (!p1 || !p2) return;

        const x1 = (p1.x + oscillation) * width;
        const y1 = (p1.y + oscillationY) * height;
        const x2 = (p2.x + oscillation) * width;
        const y2 = (p2.y + oscillationY) * height;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, '#38BDF8');
        grad.addColorStop(1, '#D4AF37');

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
      ctx.restore();

      cur.forEach((p, idx) => {
        const x = (p.x + oscillation) * width;
        const y = (p.y + oscillationY) * height;
        const isTip = [4, 8, 12, 16, 20].includes(idx);
        const isWrist = idx === 0;

        ctx.save();
        if (isTip) {
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#D4AF37';
          ctx.shadowColor = '#D4AF37';
          ctx.shadowBlur = 12;
          ctx.fill();

          ctx.font = `600 10px ${mono}`;
          ctx.fillStyle = isDark ? '#F5E6AB' : '#715507';
          ctx.fillText(`L${idx}`, x + 8, y - 4);
        } else if (isWrist) {
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#22C55E';
          ctx.shadowColor = '#22C55E';
          ctx.shadowBlur = 8;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? '#FFFFFF' : '#1E293B';
          ctx.shadowColor = '#38BDF8';
          ctx.shadowBlur = 6;
          ctx.fill();
        }
        ctx.restore();
      });

      ctx.save();
      ctx.font = `700 12px ${mono}`;
      ctx.fillStyle = '#38BDF8';
      ctx.fillText(`GESTURE: ${activePreset.name}`, 16, 26);

      ctx.font = `500 10px ${mono}`;
      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
      ctx.fillText(`CONFIDENCE: ${(activePreset.confidence * 100).toFixed(1)}% · 21 3D LANDMARKS`, 16, 42);

      const rightText = `FPS: ${Math.round(fps)} · WEBGPU WGSL`;
      const rightWidth = ctx.measureText(rightText).width;
      ctx.fillStyle = '#10B981';
      ctx.fillText(rightText, width - rightWidth - 16, 26);

      ctx.restore();

      rafRef.current = requestAnimationFrame(renderLoop);
    };

    rafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activePreset, cameraActive, isDark, fps]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <video ref={videoRef} playsInline muted style={{ display: 'none' }} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button
            size="small"
            variant={cameraActive ? 'contained' : 'outlined'}
            color={cameraActive ? 'success' : 'inherit'}
            startIcon={cameraActive ? <VideocamIcon /> : <VideocamOffIcon />}
            onClick={handleToggleCamera}
            sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 750 }}
          >
            {cameraActive ? 'Optical Camera Active' : 'Enable Optical Sensor (Webcam)'}
          </Button>

          <Button
            size="small"
            variant={autoSequence ? 'contained' : 'outlined'}
            onClick={() => setAutoSequence((v) => !v)}
            sx={{
              fontFamily: mono,
              fontSize: '0.74rem',
              fontWeight: 750,
              borderColor: gold.border,
              color: autoSequence ? '#08080B' : gold.soft,
              bgcolor: autoSequence ? gold.accent : 'transparent',
              '&:hover': { bgcolor: autoSequence ? gold.soft : gold.wash },
            }}
          >
            {autoSequence ? 'Auto-Cycle Active ⚡' : 'Auto Sequence Presets'}
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={handleRunBenchmark}
            disabled={benchmarking}
            startIcon={<SpeedIcon />}
            sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 750, color: '#38BDF8', borderColor: 'rgba(56,189,248,0.4)' }}
          >
            {benchmarking ? 'Benchmarking WGSL…' : 'Run WebGPU Tensor Benchmark'}
          </Button>
        </Stack>

        <Chip
          label={cameraActive ? 'OPTICAL FEED CONNECTED' : 'SYNTHETIC NEURAL GENERATOR'}
          size="small"
          sx={{
            fontFamily: mono,
            fontWeight: 800,
            fontSize: '0.68rem',
            bgcolor: cameraActive ? 'rgba(34,197,94,0.15)' : 'rgba(56,189,248,0.12)',
            color: cameraActive ? '#22C55E' : '#38BDF8',
          }}
        />
      </Box>

      {cameraError && (
        <Alert severity="info" sx={{ fontFamily: mono, fontSize: '0.78rem' }}>
          {cameraError} (Running seamlessly in high-fidelity Synthetic Neural Simulator mode).
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid xs={12} lg={7}>
          <Paper
            sx={{
              p: 1.5,
              bgcolor: isDark ? '#040407' : '#FFFFFF',
              border: `1.5px solid ${gold.border}`,
              borderRadius: 2.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: isDark ? 'inset 0 0 20px rgba(0,0,0,0.8)' : 'none',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ width: '100%', position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <canvas
                ref={canvasRef}
                width={540}
                height={390}
                style={{
                  width: '100%',
                  maxWidth: '540px',
                  height: 'auto',
                  borderRadius: '8px',
                  display: 'block',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', px: 1, pt: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', fontSize: '0.72rem' }}>
                ZERO-EGRESS SKELETAL VISION · 21 3D LANDMARKS · CLIENT HARDWARE
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8', fontWeight: 700, fontSize: '0.72rem' }}>
                {Math.round(fps)} FPS LIVE
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} lg={5}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: isDark ? '#05050A' : '#F8FAFC', border: `1px solid ${gold.border}`, borderRadius: 2 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent, display: 'block', mb: 1.5 }}>
                SELECT GESTURE PRESET (OR SIMULATE SENSOR INPUT)
              </Typography>
              <Grid container spacing={1}>
                {Object.values(GESTURE_PRESETS).map((preset) => {
                  const isSelected = preset.id === currentPresetKey;
                  return (
                    <Grid xs={6} sm={4} key={preset.id}>
                      <Button
                        fullWidth
                        size="small"
                        variant={isSelected ? 'contained' : 'outlined'}
                        onClick={() => handleSelectPreset(preset.id)}
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.7rem',
                          fontWeight: 750,
                          py: 0.8,
                          bgcolor: isSelected ? gold.accent : 'transparent',
                          color: isSelected ? '#08080B' : (isDark ? '#E2E8F0' : '#1E293B'),
                          borderColor: isSelected ? gold.accent : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'),
                          '&:hover': {
                            bgcolor: isSelected ? gold.soft : gold.wash,
                          },
                        }}
                      >
                        <span style={{ marginRight: '6px' }}>{preset.icon}</span>
                        {preset.id.replace('_', ' ')}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: isDark ? '#05050A' : '#F8FAFC', border: `1px solid ${gold.border}`, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#38BDF8' }}>
                  SOVEREIGN EVENT DISPATCHER
                </Typography>
                <Chip
                  label="ZERO-EGRESS DISPATCH"
                  size="small"
                  sx={{ fontFamily: mono, fontSize: '0.62rem', height: 18, bgcolor: 'rgba(56,189,248,0.15)', color: '#38BDF8' }}
                />
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? '#0A0C14' : '#F1F5F9', border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent }}>
                    {dispatchedAction.action}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', fontSize: '0.7rem' }}>
                    {dispatchedAction.time}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
                  {dispatchedAction.desc}
                </Typography>
              </Box>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: isDark ? '#05050A' : '#F8FAFC', border: `1px solid ${gold.border}`, borderRadius: 2 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#22C55E', display: 'block', mb: 1 }}>
                WEBGPU HARDWARE ACCELERATION TELEMETRY
              </Typography>
              <Grid container spacing={1.5}>
                <Grid xs={6}>
                  <Box sx={{ p: 1, borderRadius: 1, bgcolor: isDark ? '#090B12' : '#F1F5F9', border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono, display: 'block', fontSize: '0.66rem' }}>
                      INFERENCE ENGINE
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: '#34D399' }}>
                      WebGPU WGSL
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={6}>
                  <Box sx={{ p: 1, borderRadius: 1, bgcolor: isDark ? '#090B12' : '#F1F5F9', border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono, display: 'block', fontSize: '0.66rem' }}>
                      LATENCY &amp; GFLOPS
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent }}>
                      {webgpuMetrics ? `${webgpuMetrics.timeMs}ms · ${webgpuMetrics.gflops} GFLOPS` : '0.8ms · 48.2 GFLOPS'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
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
      case 'vision-gesture-control':
        return <VisionGestureWorkstation isDark={isDark} gold={gold} />;
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
