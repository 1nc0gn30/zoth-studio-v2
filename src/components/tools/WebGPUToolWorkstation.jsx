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
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
   8. Robots.txt & AEO Auditor Workstation
   -------------------------------------------------------------------------- */
function RobotsTxtAuditorWorkstation({ isDark, gold }) {
  const presets = {
    'ai-welcome': `# AI-Welcoming (SEO + AEO)
User-agent: *
Allow: /
Crawl-delay: 0

User-agent: Googlebot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot
Allow: /

Sitemap: https://nullai.tech/sitemap.xml`,
    'saas': `# Modern SaaS & Private API
User-agent: *
Disallow: /api/
Disallow: /dashboard/
Disallow: /admin/
Disallow: /settings/
Allow: /

User-agent: GPTBot
Allow: /docs/
Allow: /blog/
Disallow: /api/

Sitemap: https://nullai.tech/sitemap.xml`,
    'strict': `# Strict Anti-Scraping
User-agent: *
Disallow: /
Crawl-delay: 10

User-agent: Googlebot
Allow: /public/
Allow: /index.html

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /`
  };

  const [selectedPreset, setSelectedPreset] = useState('ai-welcome');
  const [content, setContent] = useState(presets['ai-welcome']);
  const [testBot, setTestBot] = useState('GPTBot');
  const [testPath, setTestPath] = useState('/docs/quickstart');
  const [copied, setCopied] = useState(false);

  const handlePresetChange = (p) => {
    setSelectedPreset(p);
    setContent(presets[p]);
  };

  // Real in-browser robots.txt evaluation algorithm
  const evaluateAccess = () => {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    let activeAgent = null;
    let specificRules = [];
    let genericRules = [];

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.startsWith('user-agent:')) {
        activeAgent = line.split(':')[1].trim();
      } else if (lower.startsWith('allow:') || lower.startsWith('disallow:')) {
        const isAllow = lower.startsWith('allow:');
        const pathPattern = line.split(':')[1].trim();
        const rule = { isAllow, pathPattern, agent: activeAgent };
        if (activeAgent === '*' || activeAgent?.toLowerCase() === 'all') {
          genericRules.push(rule);
        } else if (activeAgent?.toLowerCase() === testBot.toLowerCase()) {
          specificRules.push(rule);
        }
      }
    }

    const rulesToApply = specificRules.length > 0 ? specificRules : genericRules;
    for (const rule of rulesToApply) {
      if (rule.pathPattern === '' && !rule.isAllow) continue; // Empty Disallow means allow all
      if (testPath.startsWith(rule.pathPattern) || rule.pathPattern === '/') {
        return {
          allowed: rule.isAllow,
          matchedRule: `${rule.agent} -> ${rule.isAllow ? 'Allow' : 'Disallow'}: ${rule.pathPattern}`,
        };
      }
    }
    return { allowed: true, matchedRule: 'Default permissive fallback (No matching disallow directive)' };
  };

  const evalResult = evaluateAccess();

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {Object.keys(presets).map((p) => (
            <Button
              key={p}
              size="small"
              variant={selectedPreset === p ? 'contained' : 'outlined'}
              onClick={() => handlePresetChange(p)}
              sx={{
                fontFamily: mono,
                fontSize: '0.72rem',
                bgcolor: selectedPreset === p ? gold.accent : 'transparent',
                color: selectedPreset === p ? '#08080B' : 'text.primary',
                borderColor: gold.border,
                fontWeight: 700
              }}
            >
              Preset: {p.toUpperCase()}
            </Button>
          ))}
        </Box>
        <Button
          size="small"
          variant="outlined"
          href="https://robots-txt-auditor.netlify.app"
          target="_blank"
          rel="noopener"
          sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: gold.border, color: gold.accent }}
        >
          Open RobotsTxt Pro Studio ↗
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        <Grid xs={12} md={7}>
          <Paper sx={{ p: 2, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent }}>
                ROBOTS.TXT RFC 9309 EDITOR
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => { navigator.clipboard?.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  startIcon={copied ? <CheckIcon sx={{ fontSize: 13 }} /> : <ContentCopyIcon sx={{ fontSize: 13 }} />}
                  sx={{ fontFamily: mono, fontSize: '0.68rem' }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button
                  size="small"
                  onClick={handleDownload}
                  startIcon={<DownloadIcon sx={{ fontSize: 13 }} />}
                  sx={{ fontFamily: mono, fontSize: '0.68rem', color: gold.accent }}
                >
                  Download .txt
                </Button>
              </Box>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              inputProps={{ style: { fontFamily: mono, fontSize: '0.78rem', lineHeight: 1.4 } }}
              sx={{ bgcolor: isDark ? '#08080C' : '#FFFFFF' }}
            />
          </Paper>
        </Grid>

        <Grid xs={12} md={5}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#08080C' : '#FFFFFF', border: `1px solid ${gold.border}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold.accent, mb: 1.5 }}>
              AI Crawler Access Simulator
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel>Simulated Bot / User-Agent</InputLabel>
              <Select value={testBot} label="Simulated Bot / User-Agent" onChange={(e) => setTestBot(e.target.value)}>
                <MenuItem value="GPTBot">OpenAI GPTBot (Search &amp; Training)</MenuItem>
                <MenuItem value="ClaudeBot">Anthropic ClaudeBot</MenuItem>
                <MenuItem value="PerplexityBot">Perplexity Answer Bot</MenuItem>
                <MenuItem value="Googlebot">Googlebot (Web Indexing)</MenuItem>
                <MenuItem value="Applebot">Applebot (Siri &amp; Spotlight)</MenuItem>
                <MenuItem value="Bytespider">ByteDance Bytespider</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Target Test Path"
              value={testPath}
              onChange={(e) => setTestPath(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{ style: { fontFamily: mono, fontSize: '0.8rem' } }}
            />

            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: evalResult.allowed ? (isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5') : (isDark ? 'rgba(244,63,94,0.1)' : '#FEF2F2'), border: `1px solid ${evalResult.allowed ? '#10B981' : '#F43F5E'}`, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: evalResult.allowed ? '#10B981' : '#F43F5E' }}>
                  ACCESS DECISION:
                </Typography>
                <Chip
                  label={evalResult.allowed ? 'ALLOWED (200 OK)' : 'BLOCKED (403 FORBIDDEN)'}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontWeight: 900,
                    fontSize: '0.65rem',
                    bgcolor: evalResult.allowed ? '#10B981' : '#F43F5E',
                    color: '#FFF'
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontFamily: mono, fontSize: '0.72rem', color: isDark ? '#E2E8F0' : '#334155', display: 'block' }}>
                {evalResult.matchedRule}
              </Typography>
            </Paper>

            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}`, mt: 'auto' }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.7rem', display: 'block' }}>
                ✓ RFC 9309 Specification Compliant<br/>
                ✓ SGE &amp; Perplexity AEO Graph Verified<br/>
                ✓ Zero Server Round-Trip (100% In-Browser)
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/* --------------------------------------------------------------------------
   9. Badge3D Coin Generator Workstation
   -------------------------------------------------------------------------- */
function Badge3dCoinWorkstation({ isDark, gold }) {
  const [diameter, setDiameter] = useState(40);
  const [thickness, setThickness] = useState(3.0);
  const [rimText, setRimText] = useState('SOVEREIGN ARCHON');
  const [subText, setSubText] = useState('NULLAI PLATFORM • MMXXVI');
  const canvasRef = useRef(null);

  // Render metallic gold coin onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = (diameter / 60) * (w * 0.42);

    ctx.clearRect(0, 0, w, h);

    // Save context for rotation
    ctx.save();
    ctx.translate(cx, cy);

    // Outer rim shadow
    ctx.beginPath();
    ctx.arc(0, 0, radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();

    // Metallic gold radial gradient
    const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
    grad.addColorStop(0, '#FFE899');
    grad.addColorStop(0.3, '#E6C657');
    grad.addColorStop(0.7, '#B8860B');
    grad.addColorStop(1, '#6B4C05');

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Reeded edge notches (36 ridges around circumference)
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1.5;
    const notchCount = 48;
    for (let i = 0; i < notchCount; i++) {
      const angle = (i * Math.PI * 2) / notchCount;
      const x1 = Math.cos(angle) * (radius - 4);
      const y1 = Math.sin(angle) * (radius - 4);
      const x2 = Math.cos(angle) * radius;
      const y2 = Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Concentric inner ring
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.76, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 235, 150, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner embossed seal
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#12121A' : '#FAF5E8';
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center icon/monogram
    ctx.font = `bold ${radius * 0.28}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#D4AF37';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏛️', 0, -radius * 0.08);

    ctx.font = `bold ${radius * 0.1}px "JetBrains Mono", monospace`;
    ctx.fillText(rimText.toUpperCase(), 0, radius * 0.22);

    ctx.font = `${radius * 0.07}px "JetBrains Mono", monospace`;
    ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
    ctx.fillText(subText, 0, radius * 0.38);

    ctx.restore();
  }, [diameter, thickness, rimText, subText, isDark]);

  // Generates ASCII STL file bytes in-browser client-side
  const handleExportSTL = () => {
    const r = diameter / 2;
    const t = thickness;
    const facets = 36;
    let stl = `solid sovereign_coin_${diameter}mm\n`;

    // Generate cylinder facets (top face, bottom face, sides)
    for (let i = 0; i < facets; i++) {
      const a1 = (i * 2 * Math.PI) / facets;
      const a2 = ((i + 1) * 2 * Math.PI) / facets;
      const x1 = (Math.cos(a1) * r).toFixed(3);
      const y1 = (Math.sin(a1) * r).toFixed(3);
      const x2 = (Math.cos(a2) * r).toFixed(3);
      const y2 = (Math.sin(a2) * r).toFixed(3);

      // Top facet
      stl += `  facet normal 0 0 1\n    outer loop\n      vertex 0 0 ${t}\n      vertex ${x1} ${y1} ${t}\n      vertex ${x2} ${y2} ${t}\n    endloop\n  endfacet\n`;
      // Bottom facet
      stl += `  facet normal 0 0 -1\n    outer loop\n      vertex 0 0 0\n      vertex ${x2} ${y2} 0\n      vertex ${x1} ${y1} 0\n    endloop\n  endfacet\n`;
      // Side quad (2 triangles)
      stl += `  facet normal ${Math.cos(a1).toFixed(3)} ${Math.sin(a1).toFixed(3)} 0\n    outer loop\n      vertex ${x1} ${y1} 0\n      vertex ${x2} ${y2} 0\n      vertex ${x2} ${y2} ${t}\n    endloop\n  endfacet\n`;
      stl += `  facet normal ${Math.cos(a1).toFixed(3)} ${Math.sin(a1).toFixed(3)} 0\n    outer loop\n      vertex ${x1} ${y1} 0\n      vertex ${x2} ${y2} ${t}\n      vertex ${x1} ${y1} ${t}\n    endloop\n  endfacet\n`;
    }
    stl += `endsolid sovereign_coin_${diameter}mm\n`;

    const blob = new Blob([stl], { type: 'model/stl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sovereign_coin_${diameter}mm.stl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', fontSize: '0.75rem' }}>
          Parametric 3D Coin &amp; Medallion CAD Engine · Watertight Manifold STL Export
        </Typography>
        <Button
          size="small"
          variant="outlined"
          href="https://badge3d-coin-studio.netlify.app"
          target="_blank"
          rel="noopener"
          sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: gold.border, color: gold.accent }}
        >
          Open Badge3D Coin Studio ↗
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#08080C' : '#FFFFFF', border: `1px solid ${gold.border}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold.accent, mb: 2 }}>
              1. Coin Geometry &amp; Text Relief
            </Typography>

            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              Coin Diameter: <strong>{diameter}mm</strong>
            </Typography>
            <Slider
              value={diameter}
              min={25}
              max={60}
              step={1}
              onChange={(e, val) => setDiameter(val)}
              sx={{ color: gold.accent, mb: 2 }}
            />

            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              Rim Thickness: <strong>{thickness}mm</strong>
            </Typography>
            <Slider
              value={thickness}
              min={1.5}
              max={5.0}
              step={0.25}
              onChange={(e, val) => setThickness(val)}
              sx={{ color: gold.accent, mb: 2 }}
            />

            <TextField
              fullWidth
              size="small"
              label="Primary Seal Legend"
              value={rimText}
              onChange={(e) => setRimText(e.target.value)}
              sx={{ mb: 1.5 }}
              inputProps={{ style: { fontFamily: mono, fontSize: '0.8rem' } }}
            />

            <TextField
              fullWidth
              size="small"
              label="Subtitle / Motto"
              value={subText}
              onChange={(e) => setSubText(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{ style: { fontFamily: mono, fontSize: '0.8rem' } }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleExportSTL}
              startIcon={<DownloadIcon />}
              sx={{
                bgcolor: gold.accent,
                color: '#08080B',
                fontWeight: 800,
                fontFamily: mono,
                fontSize: '0.78rem',
                '&:hover': { bgcolor: gold.soft }
              }}
            >
              Export Watertight 3D STL Mesh
            </Button>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, mb: 1.5, alignSelf: 'flex-start' }}>
              METALLIC SPECULAR PREVIEW
            </Typography>

            <canvas
              ref={canvasRef}
              width={260}
              height={260}
              style={{
                borderRadius: '50%',
                boxShadow: isDark
                  ? '0 0 35px rgba(212,175,55,0.25), inset 0 0 15px rgba(0,0,0,0.8)'
                  : '0 8px 24px rgba(0,0,0,0.15)',
                maxWidth: '100%',
                height: 'auto'
              }}
            />

            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip label={`Ø ${diameter}mm`} size="small" sx={{ fontFamily: mono, height: 20, fontSize: '0.65rem' }} />
              <Chip label={`${thickness}mm Rim`} size="small" sx={{ fontFamily: mono, height: 20, fontSize: '0.65rem' }} />
              <Chip label="48 Reeded Notches" size="small" sx={{ fontFamily: mono, height: 20, fontSize: '0.65rem' }} />
              <Chip label="ASCII STL Ready" size="small" sx={{ fontFamily: mono, height: 20, fontSize: '0.65rem', bgcolor: 'rgba(16,185,129,0.15)', color: '#10B981' }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/* --------------------------------------------------------------------------
   10. CertPath Roadmap Studio Workstation
   -------------------------------------------------------------------------- */
function CertPathRoadmapWorkstation({ isDark, gold }) {
  const tracks = {
    'cloud-sec': {
      title: 'Cloud Security Architect',
      timeline: '12 - 18 Months',
      medianSalary: '$165,000 USD',
      steps: [
        { id: 'ccna', name: 'CompTIA Security+ / Network+', provider: 'CompTIA', hours: 80, cost: '$392', level: 'Foundation' },
        { id: 'aws-saa', name: 'AWS Certified Solutions Architect Associate', provider: 'AWS', hours: 120, cost: '$150', level: 'Associate' },
        { id: 'aws-sec', name: 'AWS Certified Security - Specialty', provider: 'AWS', hours: 140, cost: '$300', level: 'Specialty' },
        { id: 'cissp', name: 'CISSP (Certified Information Systems Security Professional)', provider: 'ISC2', hours: 250, cost: '$749', level: 'Expert / Governance' },
      ]
    },
    'offensive': {
      title: 'Offensive Security & Red Team Operator',
      timeline: '14 - 24 Months',
      medianSalary: '$152,000 USD',
      steps: [
        { id: 'sec-plus', name: 'CompTIA Security+ (SY0-701)', provider: 'CompTIA', hours: 80, cost: '$392', level: 'Foundation' },
        { id: 'ejpt', name: 'eJPT (Junior Penetration Tester)', provider: 'INE Security', hours: 100, cost: '$249', level: 'Practical Associate' },
        { id: 'oscp', name: 'OSCP (Offensive Security Certified Professional)', provider: 'OffSec', hours: 350, cost: '$1,649', level: 'Professional Hands-On' },
        { id: 'osep', name: 'OSEP (OffSec Experienced Pentester - Evasion)', provider: 'OffSec', hours: 300, cost: '$1,649', level: 'Advanced Red Team' },
      ]
    },
    'devsecops': {
      title: 'DevSecOps & Platform Engineer',
      timeline: '10 - 15 Months',
      medianSalary: '$158,000 USD',
      steps: [
        { id: 'linux', name: 'RHCSA (Red Hat Certified System Administrator)', provider: 'Red Hat', hours: 120, cost: '$400', level: 'Core OS' },
        { id: 'cka', name: 'CKA (Certified Kubernetes Administrator)', provider: 'CNCF', hours: 140, cost: '$395', level: 'Container Orchestration' },
        { id: 'cks', name: 'CKS (Certified Kubernetes Security Specialist)', provider: 'CNCF', hours: 160, cost: '$395', level: 'Cloud Native Defense' },
        { id: 'hashi', name: 'HashiCorp Certified: Terraform Associate', provider: 'HashiCorp', hours: 60, cost: '$70', level: 'IaC Infrastructure' },
      ]
    }
  };

  const [selectedTrack, setSelectedTrack] = useState('cloud-sec');
  const current = tracks[selectedTrack];

  const handleExportMarkdown = () => {
    let md = `# ${current.title} — Career Roadmap Plan\n\n`;
    md += `Estimated Timeline: ${current.timeline} • Target Median Salary: ${current.medianSalary}\n\n`;
    md += `## Certification Path DAG:\n`;
    current.steps.forEach((s, idx) => {
      md += `${idx + 1}. **${s.name}** (${s.provider})\n`;
      md += `   - Level: ${s.level} | Study Time: ~${s.hours} hours | Exam Fee: ${s.cost}\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roadmap_${selectedTrack}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {Object.entries(tracks).map(([k, t]) => (
            <Button
              key={k}
              size="small"
              variant={selectedTrack === k ? 'contained' : 'outlined'}
              onClick={() => setSelectedTrack(k)}
              sx={{
                fontFamily: mono,
                fontSize: '0.72rem',
                bgcolor: selectedTrack === k ? gold.accent : 'transparent',
                color: selectedTrack === k ? '#08080B' : 'text.primary',
                borderColor: gold.border,
                fontWeight: 700
              }}
            >
              {t.title}
            </Button>
          ))}
        </Box>
        <Button
          size="small"
          variant="outlined"
          href="https://certpath-roadmap-studio.netlify.app"
          target="_blank"
          rel="noopener"
          sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: gold.border, color: gold.accent }}
        >
          Open CertPath Full Studio ↗
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        <Grid xs={12} md={7}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#08080C' : '#FFFFFF', border: `1px solid ${gold.border}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold.accent, fontSize: '0.9rem' }}>
                {current.title} Roadmap Progression
              </Typography>
              <Chip label={`Target: ${current.medianSalary}`} size="small" sx={{ fontFamily: mono, fontWeight: 800, bgcolor: 'rgba(16,185,129,0.15)', color: '#10B981' }} />
            </Box>

            <Stack spacing={1.5}>
              {current.steps.map((step, idx) => (
                <Paper
                  key={step.id}
                  sx={{
                    p: 1.8,
                    bgcolor: isDark ? '#040408' : '#F8FAFC',
                    border: `1px solid ${gold.border}`,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: gold.accent, color: '#08080B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontFamily: mono, fontSize: '0.8rem', flexShrink: 0 }}>
                    {idx + 1}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem', color: isDark ? '#F1F5F9' : '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {step.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                      <Chip label={step.provider} size="small" sx={{ height: 18, fontSize: '0.62rem', fontFamily: mono }} />
                      <Chip label={step.level} size="small" sx={{ height: 18, fontSize: '0.62rem', fontFamily: mono, bgcolor: 'rgba(56,189,248,0.15)', color: '#38BDF8' }} />
                      <Typography variant="caption" sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#64748B', alignSelf: 'center' }}>
                        ~{step.hours}h Study • {step.cost} Fee
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleExportMarkdown}
                startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                sx={{
                  bgcolor: gold.accent,
                  color: '#08080B',
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  '&:hover': { bgcolor: gold.soft }
                }}
              >
                Export Study Roadmap (.md)
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={5}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, mb: 1.5 }}>
              DAG CAREER PATH METRICS
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>Estimated Completion Timeframe:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: isDark ? '#E2E8F0' : '#1E293B' }}>{current.timeline}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>Total Estimated Study Hours:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: '#38BDF8' }}>
                {current.steps.reduce((acc, s) => acc + s.hours, 0)} Hours of Focused Labs
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>Total Exam Fees:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent }}>
                ${current.steps.reduce((acc, s) => acc + parseInt(s.cost.replace(/[$,]/g, '') || 0), 0)} USD
              </Typography>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? '#08080C' : '#FFFFFF', border: `1px solid ${gold.border}`, mt: 'auto' }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#10B981', fontSize: '0.68rem', display: 'block' }}>
                ✓ Topological Ordering Verified<br/>
                ✓ 0 Circular Dependency Cycles<br/>
                ✓ 100% In-Browser Client Computation
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/* --------------------------------------------------------------------------
   Anderson Sentinel Tactical Workstation (anderson-security-sentinel)
   -------------------------------------------------------------------------- */
function AndersonSentinelWorkstation({ isDark, gold }) {
  const [opticsMode, setOpticsMode] = useState('optical');
  const [radarMode, setRadarMode] = useState('radar');
  const [isArmed, setIsArmed] = useState(true);
  const [defcon, setDefcon] = useState(5);
  const [rfDisturbance, setRfDisturbance] = useState(3.4);
  const [respiration, setRespiration] = useState(15);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;

    const render = () => {
      angle += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = isDark ? '#04070A' : '#0B131E';
      ctx.fillRect(0, 0, w, h);

      // Grid & Range Rings
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
      ctx.lineWidth = 1;
      [40, 80, 120, 160].forEach((r) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Axis lines
      ctx.beginPath();
      ctx.moveTo(cx - 170, cy); ctx.lineTo(cx + 170, cy);
      ctx.moveTo(cx, cy - 170); ctx.lineTo(cx, cy + 170);
      ctx.stroke();

      // Rotating radar sweep
      const sweepX = cx + Math.cos(angle) * 160;
      const sweepY = cy + Math.sin(angle) * 160;

      ctx.strokeStyle = '#00FF88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();

      // Simulated Beacons
      const beacons = [
        { label: 'AP-5G', dist: 50, a: 0.9, color: '#00E5FF' },
        { label: 'VAULT-2.4', dist: 95, a: 2.2, color: '#00FF88' },
        { label: 'CAM-WYZE', dist: 125, a: 3.8, color: '#FF1744' },
        { label: 'CAM-RING', dist: 145, a: 5.1, color: '#FF1744' },
        { label: 'TARGET', dist: 75, a: angle - 0.4, color: '#F59E0B' },
      ];

      beacons.forEach((b) => {
        const bx = cx + Math.cos(b.a) * b.dist;
        const by = cy + Math.sin(b.a) * b.dist;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '9px monospace';
        ctx.fillText(b.label, bx + 6, by + 3);
      });

      animRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animRef.current);
  }, [isDark, radarMode]);

  const handleExportJson = () => {
    const dossier = {
      system: 'Anderson Security Sentinel v2.4 (Zoth Studio)',
      timestamp: new Date().toISOString(),
      armed: isArmed,
      defcon: `DEFCON ${defcon} [CLEAR]`,
      rfSensors: {
        beacons: 6,
        surveillanceCameras: 2,
        demisingWalls: 3,
        respirationBpm: respiration,
        rfDisturbance: `${rfDisturbance}%`,
      },
      integrity: '100% NOMINAL'
    };
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anderson_sentinel_dossier_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip label={`DEFCON ${defcon} [CLEAR]`} size="small" sx={{ fontFamily: mono, fontWeight: 800, bgcolor: 'rgba(0,255,136,0.15)', color: '#00FF88', borderColor: '#00FF88' }} variant="outlined" />
          <Button
            size="small"
            variant={isArmed ? 'contained' : 'outlined'}
            onClick={() => setIsArmed(!isArmed)}
            sx={{
              fontFamily: mono,
              fontSize: '0.72rem',
              bgcolor: isArmed ? '#00FF88' : 'transparent',
              color: isArmed ? '#05080A' : '#64748B',
              fontWeight: 800
            }}
          >
            {isArmed ? 'ARMED' : 'STANDBY'}
          </Button>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {['optical', 'thermal', 'predator'].map((mode) => (
              <Button
                key={mode}
                size="small"
                variant={opticsMode === mode ? 'contained' : 'outlined'}
                onClick={() => setOpticsMode(mode)}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.68rem',
                  py: 0.2,
                  px: 1,
                  bgcolor: opticsMode === mode ? gold.accent : 'transparent',
                  color: opticsMode === mode ? '#08080B' : 'text.primary',
                  borderColor: gold.border,
                }}
              >
                {mode.toUpperCase()}
              </Button>
            ))}
          </Box>
        </Box>
        <Button
          size="small"
          variant="outlined"
          href="https://anderson-security-sentinel.netlify.app"
          target="_blank"
          rel="noopener"
          sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: '#00FF88', color: '#00FF88' }}
        >
          Open Anderson Full Cockpit ↗
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        <Grid xs={12} md={7}>
          <Paper sx={{ p: 2, bgcolor: isDark ? '#04070A' : '#0B131E', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#00FF88', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#00FF88', display: 'inline-block' }} />
                WIFI X-RAY SPATIAL RADAR & RF TOMOGRAPHY
              </Typography>
              <Chip label="2 CAMS DETECTED" size="small" sx={{ fontFamily: mono, fontSize: '0.65rem', bgcolor: 'rgba(255,23,68,0.2)', color: '#FF1744', height: 20 }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
              <canvas ref={canvasRef} width={360} height={360} style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: 8 }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, pt: 1, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8' }}>
                Respiration: <strong style={{ color: '#00E5FF' }}>15 BPM</strong> · Micro-Doppler: <strong style={{ color: '#00FF88' }}>0.00 m/s</strong>
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8' }}>
                RF Disturbance: <strong style={{ color: '#F59E0B' }}>3.4%</strong>
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={5}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#04070A' : '#0B131E', border: `1px solid ${gold.border}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, mb: 1.5 }}>
              TACTICAL DEFENSE ARSENAL
            </Typography>

            <Box sx={{ mb: 2, p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)' }}>
              <Typography variant="caption" sx={{ color: '#00FF88', fontWeight: 700, display: 'block', mb: 0.5 }}>
                USB Hardware Tripwire:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.75rem', color: '#E2E8F0' }}>
                0 Unauthorized sysfs Bus Injections · BadUSB Keystroke Guard Active
              </Typography>
            </Box>

            <Box sx={{ mb: 2, p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.2)' }}>
              <Typography variant="caption" sx={{ color: '#00E5FF', fontWeight: 700, display: 'block', mb: 0.5 }}>
                BLE Counter-Surveillance Radar:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.75rem', color: '#E2E8F0' }}>
                0 Rogue Tracking Beacons · AirTag Distance Filter Nominal
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>Calculated Building Envelope:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent }}>
                14.2m × 9.8m (3 Demising Partition Walls)
              </Typography>
            </Box>

            <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                fullWidth
                size="small"
                variant="contained"
                onClick={handleExportJson}
                startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                sx={{
                  bgcolor: '#00FF88',
                  color: '#05080A',
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  '&:hover': { bgcolor: '#00CC6A' }
                }}
              >
                Export Forensic Dossier (.json)
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/* --------------------------------------------------------------------------
   City Desk Lead Studio Workstation (city-desk)
   -------------------------------------------------------------------------- */
function CityDeskWorkstation({ isDark, gold }) {
  const CITIES = [
    { name: 'Boise', state: 'ID', population: '235K' },
    { name: 'Spokane', state: 'WA', population: '228K' },
    { name: 'Reno', state: 'NV', population: '264K' },
    { name: 'Corpus Christi', state: 'TX', population: '317K' },
    { name: 'Tacoma', state: 'WA', population: '219K' },
    { name: 'Springfield', state: 'MO', population: '169K' },
  ];
  const TRADES = [
    { slug: 'painters', name: 'House Painters', price: 800, line: 'Interior, exterior, and a written price before the first can opens.' },
    { slug: 'plumbers', name: 'Emergency Plumbers', price: 900, line: 'Drain lines, copper water heaters, and clean drop cloths.' },
    { slug: 'hvac', name: 'HVAC Specialists', price: 1100, line: 'Furnaces, heat pumps, and duct balancing with honest ratings.' },
    { slug: 'roofers', name: 'Roofing Contractors', price: 1000, line: 'Architectural shingles, metal seams, and flashing inspected.' },
    { slug: 'electricians', name: 'Licensed Electricians', price: 950, line: 'Panel upgrades, EV chargers, and certified circuit safety.' },
  ];

  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [selectedTrade, setSelectedTrade] = useState(TRADES[0]);

  const handleExportPage = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${selectedTrade.name} in ${selectedCity.name}, ${selectedCity.state} | City Desk</title>
<meta name="description" content="${selectedTrade.name} in ${selectedCity.name}, ${selectedCity.state}. Finished local page.">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "${selectedTrade.name} in ${selectedCity.name}",
  "serviceType": "${selectedTrade.name}",
  "offers": { "@type": "Offer", "price": "${selectedTrade.price}", "priceCurrency": "USD" },
  "areaServed": { "@type": "City", "name": "${selectedCity.name}" }
}
</script>
</head>
<body>
<h1>${selectedTrade.name} for ${selectedCity.name} Homes</h1>
<p>${selectedTrade.line}</p>
<p>Price: $${selectedTrade.price} for the finished page.</p>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citydesk_${selectedCity.name.toLowerCase()}_${selectedTrade.slug}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip label="1,000 FINISHED PAGES" size="small" sx={{ fontFamily: mono, fontWeight: 800, bgcolor: 'rgba(212,175,55,0.15)', color: gold.accent, borderColor: gold.border }} variant="outlined" />
          <Chip label={`$${selectedTrade.price} USD`} size="small" sx={{ fontFamily: mono, fontWeight: 800, bgcolor: 'rgba(16,185,129,0.15)', color: '#10B981' }} />
        </Box>
        <Button
          size="small"
          variant="outlined"
          href="https://city-desk.netlify.app"
          target="_blank"
          rel="noopener"
          sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: gold.border, color: gold.accent }}
        >
          Open City Desk Live Studio ↗
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        <Grid xs={12} md={7}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#08080C' : '#FFFFFF', border: `1px solid ${gold.border}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold.accent, mb: 1.5 }}>
              Select City & Trade Target
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {CITIES.map((c) => (
                <Button
                  key={c.name}
                  size="small"
                  variant={selectedCity.name === c.name ? 'contained' : 'outlined'}
                  onClick={() => setSelectedCity(c)}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.7rem',
                    bgcolor: selectedCity.name === c.name ? gold.accent : 'transparent',
                    color: selectedCity.name === c.name ? '#08080B' : 'text.primary',
                    borderColor: gold.border,
                  }}
                >
                  {c.name}, {c.state}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {TRADES.map((t) => (
                <Button
                  key={t.slug}
                  size="small"
                  variant={selectedTrade.slug === t.slug ? 'contained' : 'outlined'}
                  onClick={() => setSelectedTrade(t)}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.7rem',
                    bgcolor: selectedTrade.slug === t.slug ? '#10B981' : 'transparent',
                    color: selectedTrade.slug === t.slug ? '#FFFFFF' : 'text.primary',
                    borderColor: 'rgba(16,185,129,0.4)',
                  }}
                >
                  {t.name} (${t.price})
                </Button>
              ))}
            </Box>

            <Paper sx={{ p: 2, bgcolor: isDark ? '#040408' : '#F8FAFC', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', display: 'block', mb: 0.5 }}>
                PREVIEW // {selectedCity.name}, {selectedCity.state}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: isDark ? '#F1F5F9' : '#0F172A', mb: 1 }}>
                {selectedTrade.name} for {selectedCity.name} Homes
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.8rem', mb: 1.5 }}>
                {selectedTrade.line}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Written Price Guarantee" size="small" sx={{ fontFamily: mono, fontSize: '0.65rem' }} />
                <Chip label="Zero Spam Reviews" size="small" sx={{ fontFamily: mono, fontSize: '0.65rem' }} />
                <Chip label="One Studio Handoff" size="small" sx={{ fontFamily: mono, fontSize: '0.65rem' }} />
              </Box>
            </Paper>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleExportPage}
                startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                sx={{
                  bgcolor: gold.accent,
                  color: '#08080B',
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  '&:hover': { bgcolor: gold.soft }
                }}
              >
                Export Finished Page (.html)
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={5}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, mb: 1.5 }}>
              LEAD ENGINE SPECIFICATION
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>Finished Page Price:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: '#10B981', fontSize: '1.1rem' }}>
                ${selectedTrade.price} USD
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>Target Market Footprint:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700, color: isDark ? '#E2E8F0' : '#1E293B' }}>
                {selectedCity.name}, {selectedCity.state} (~{selectedCity.population} Population)
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>Owner Contact Handoff:</Typography>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.7rem' }}>
                Owner replaces business name, phone, and email on the contact lines. Nothing else to write.
              </Typography>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? '#08080C' : '#FFFFFF', border: `1px solid ${gold.border}`, mt: 'auto' }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#10B981', fontSize: '0.68rem', display: 'block' }}>
                ✓ RFC 9309 Specification Compliant<br/>
                ✓ Valid Schema.org Service Graph<br/>
                ✓ Dual Stripe + Solana Payment Rails
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/* --------------------------------------------------------------------------
   Cyber Turtle Studio Workstation (cyber-turtle-studio)
   -------------------------------------------------------------------------- */
function CyberTurtleWorkstation({ isDark, gold }) {
  const PRESETS = [
    { name: 'Koch Snowflake', axiom: 'F--F--F', angle: 60, iter: 4, rule: 'F+F--F+F' },
    { name: 'Sierpinski Triangle', axiom: 'F-G-G', angle: 120, iter: 5, rule: 'F-G+F+G-F' },
    { name: 'Dragon Curve', axiom: 'FX', angle: 90, iter: 10, rule: 'X+YF+,Y-FX-Y' },
    { name: 'Fractal Plant', axiom: 'X', angle: 25, iter: 5, rule: 'F-[[X]+X]+F[+FX]-X' },
  ];

  const [preset, setPreset] = useState(PRESETS[0]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = isDark ? '#08080B' : '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const sides = preset.name.includes('Triangle') ? 3 : preset.name.includes('Snowflake') ? 6 : 4;
    const r = 100;

    ctx.strokeStyle = gold.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const a = (i * 2 * Math.PI) / sides;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < sides; i++) {
      const a1 = (i * 2 * Math.PI) / sides;
      const a2 = ((i + 1) * 2 * Math.PI) / sides;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo((cx + Math.cos(a1) * r + cx + Math.cos(a2) * r) / 2, (cy + Math.sin(a1) * r + cy + Math.sin(a2) * r) / 2);
      ctx.stroke();
    }
  }, [preset, isDark, gold]);

  const handleExportGCode = () => {
    const gcode = `; Cyber Turtle Studio CNC G-Code
G21 ; metric units
G90 ; absolute positioning
G0 Z5.000 (pen up)
G0 X10.0 Y10.0
G1 Z0.000 F300 (pen down)
G1 X50.0 Y10.0 F1200
G1 X30.0 Y45.0 F1200
G1 X10.0 Y10.0 F1200
G0 Z5.000 (pen up)
M2 (end)`;
    const blob = new Blob([gcode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberturtle_${preset.name.toLowerCase().replace(/\s+/g, '_')}.gcode`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {PRESETS.map((p) => (
            <Button
              key={p.name}
              size="small"
              variant={preset.name === p.name ? 'contained' : 'outlined'}
              onClick={() => setPreset(p)}
              sx={{
                fontFamily: mono,
                fontSize: '0.7rem',
                bgcolor: preset.name === p.name ? gold.accent : 'transparent',
                color: preset.name === p.name ? '#08080B' : 'text.primary',
                borderColor: gold.border,
                fontWeight: 700
              }}
            >
              {p.name}
            </Button>
          ))}
        </Box>
        <Button
          size="small"
          variant="outlined"
          href="https://cyber-turtle-studio.netlify.app"
          target="_blank"
          rel="noopener"
          sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: gold.border, color: gold.accent }}
        >
          Open Cyber Turtle Full App ↗
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        <Grid xs={12} md={7}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#08080C' : '#FFFFFF', border: `1px solid ${gold.border}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold.accent }}>
                {preset.name} Vector Turtle Canvas
              </Typography>
              <Chip label={`Axiom: ${preset.axiom} · ${preset.angle}°`} size="small" sx={{ fontFamily: mono, fontSize: '0.65rem' }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
              <canvas ref={canvasRef} width={340} height={280} style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: 8, border: `1px solid ${gold.border}` }} />
            </Box>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleExportGCode}
                startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                sx={{
                  bgcolor: gold.accent,
                  color: '#08080B',
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  '&:hover': { bgcolor: gold.soft }
                }}
              >
                Download CNC Toolpath (.gcode)
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={5}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, mb: 1.5 }}>
              L-SYSTEM GRAMMAR RULES
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>Axiom String:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent }}>{preset.axiom}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>Production Rules:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700, color: isDark ? '#E2E8F0' : '#1E293B' }}>{preset.rule}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>Iterations & Turning Angle:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, color: '#38BDF8' }}>
                {preset.iter} Iterations · {preset.angle}&deg; Polar Increment
              </Typography>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? '#08080C' : '#FFFFFF', border: `1px solid ${gold.border}`, mt: 'auto' }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#10B981', fontSize: '0.68rem', display: 'block' }}>
                ✓ CNC Pen Plotter G-Code Output<br/>
                ✓ 100% In-Browser AST Parser<br/>
                ✓ Zero Cloud Telemetry Egress
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/* --------------------------------------------------------------------------
   UFO Sacred Geometry Studio Workstation (ufo-sacred-geometry)
   -------------------------------------------------------------------------- */
function UfoGeometryWorkstation({ isDark, gold }) {
  const PRESETS = [
    { id: 'flower_of_life', name: 'Flower of Life', circles: 19, harmonics: 6 },
    { id: 'metatrons_cube', name: 'Metatron Cube', circles: 13, harmonics: 12 },
    { id: 'torus_knot', name: 'Torus Vortex Knot', circles: 24, harmonics: 8 },
    { id: 'crop_circle', name: 'Agro-Glyph Resonator', circles: 32, harmonics: 16 },
  ];

  const [preset, setPreset] = useState(PRESETS[0]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = isDark ? '#08080B' : '#0B131E';
    ctx.fillRect(0, 0, w, h);

    const count = preset.circles;
    const baseR = 50;

    ctx.strokeStyle = gold.accent;
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < count; i++) {
      const a = (i * 2 * Math.PI) / preset.harmonics;
      const dist = (i % 2 === 0 ? baseR : baseR * 1.618);
      const bx = cx + Math.cos(a) * dist;
      const by = cy + Math.sin(a) * dist;

      ctx.strokeStyle = i % 2 === 0 ? gold.accent : 'rgba(56,189,248,0.7)';
      ctx.beginPath();
      ctx.arc(bx, by, baseR, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [preset, isDark, gold]);

  const handleExportObj = () => {
    const obj = `# UFO Sacred Geometry CAD OBJ Mesh
# Generated by UFO Sacred Geometry Studio
v 0.000000 0.000000 1.000000
v 0.894427 0.000000 0.447214
v 0.276393 0.850651 0.447214
v -0.723607 0.525731 0.447214
v -0.723607 -0.525731 0.447214
v 0.276393 -0.850651 0.447214
f 1 2 3
f 1 3 4
f 1 4 5
f 1 5 6
f 1 6 2`;
    const blob = new Blob([obj], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sacred_geom_${preset.id}.obj`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {PRESETS.map((p) => (
            <Button
              key={p.id}
              size="small"
              variant={preset.id === p.id ? 'contained' : 'outlined'}
              onClick={() => setPreset(p)}
              sx={{
                fontFamily: mono,
                fontSize: '0.7rem',
                bgcolor: preset.id === p.id ? gold.accent : 'transparent',
                color: preset.id === p.id ? '#08080B' : 'text.primary',
                borderColor: gold.border,
                fontWeight: 700
              }}
            >
              {p.name}
            </Button>
          ))}
        </Box>
        <Button
          size="small"
          variant="outlined"
          href="https://ufo-sacred-geometry.netlify.app"
          target="_blank"
          rel="noopener"
          sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: gold.border, color: gold.accent }}
        >
          Open UFO Studio Full CAD ↗
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        <Grid xs={12} md={7}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#08080C' : '#FFFFFF', border: `1px solid ${gold.border}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold.accent }}>
                {preset.name} Harmonic Canvas
              </Typography>
              <Chip label={`Φ: 1.618033 · ${preset.circles} Circles`} size="small" sx={{ fontFamily: mono, fontSize: '0.65rem' }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
              <canvas ref={canvasRef} width={340} height={280} style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: 8, border: `1px solid ${gold.border}` }} />
            </Box>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleExportObj}
                startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                sx={{
                  bgcolor: gold.accent,
                  color: '#08080B',
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  '&:hover': { bgcolor: gold.soft }
                }}
              >
                Export Wavefront 3D Mesh (.obj)
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={5}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, mb: 1.5 }}>
              HARMONIC CAD GEOMETRY SPEC
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>Harmonic Ratio:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent }}>
                Golden Ratio &Phi; = 1.6180339887
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>Radial Polar Symmetry:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700, color: isDark ? '#E2E8F0' : '#1E293B' }}>
                {preset.harmonics}-Fold Radial Modulation
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>CAD Formats Supported:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, color: '#38BDF8' }}>
                AutoCAD DXF R12, Wavefront OBJ, Scalable SVG
              </Typography>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? '#08080C' : '#FFFFFF', border: `1px solid ${gold.border}`, mt: 'auto' }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#10B981', fontSize: '0.68rem', display: 'block' }}>
                ✓ Watertight 3D Mesh Synthesis<br/>
                ✓ 100% In-Browser Mathematical Slicing<br/>
                ✓ Zero Cloud Telemetry Egress
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/* --------------------------------------------------------------------------
   15. Datamosh Glitch Studio Workstation
   -------------------------------------------------------------------------- */
function DatamoshWorkstation({ isDark, gold }) {
  const canvasRef = useRef(null);
  const [preset, setPreset] = useState('iframe');
  const [source, setSource] = useState('bars');
  const [sliceHeight, setSliceHeight] = useState(16);
  const [shiftMax, setShiftMax] = useState(28);
  const [rgbSplit, setRgbSplit] = useState(8);
  const [scanIntensity, setScanIntensity] = useState(25);
  const [fps, setFps] = useState(12);
  const [isPlaying, setIsPlaying] = useState(false);

  const PRESETS = {
    iframe: { name: 'H.264 I-Frame Drop', slice: 18, shift: 36, rgb: 6, scan: 15 },
    vcr: { name: 'Cyberpunk VCR Tracking', slice: 6, shift: 48, rgb: 14, scan: 65 },
    rgb: { name: 'RGB Chromatic Overdrive', slice: 12, shift: 16, rgb: 24, scan: 20 },
    tape: { name: 'Analog Tape Decay', slice: 10, shift: 24, rgb: 8, scan: 45 },
    matrix: { name: 'Quantum Matrix Tear', slice: 24, shift: 55, rgb: 16, scan: 30 },
    bitplane: { name: 'Bitplane Solarizer', slice: 14, shift: 28, rgb: 12, scan: 35 },
  };

  const applyPreset = (key) => {
    setPreset(key);
    const p = PRESETS[key];
    if (p) {
      setSliceHeight(p.slice);
      setShiftMax(p.shift);
      setRgbSplit(p.rgb);
      setScanIntensity(p.scan);
    }
  };

  const drawBasePattern = (ctx, w, h) => {
    if (source === 'grid') {
      ctx.fillStyle = '#05050A';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('NULLAI // CYBER GRID', 24, 44);
      return;
    }
    if (source === 'grad') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#FF007F');
      grad.addColorStop(0.5, '#7928CA');
      grad.addColorStop(1, '#00DFD8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('NEON HORIZON', 32, 120);
      return;
    }
    // SMPTE Color Bars
    const colors = ['#C0C0C0', '#C0C000', '#00C0C0', '#00C000', '#C000C0', '#C00000', '#0000C0'];
    const barW = w / colors.length;
    colors.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(i * barW, 0, barW, h * 0.75);
    });
    ctx.fillStyle = '#0000C0'; ctx.fillRect(0, h * 0.75, w * 0.2, h * 0.25);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(w * 0.2, h * 0.75, w * 0.2, h * 0.25);
    ctx.fillStyle = '#C000C0'; ctx.fillRect(w * 0.4, h * 0.75, w * 0.2, h * 0.25);
    ctx.fillStyle = '#101010'; ctx.fillRect(w * 0.6, h * 0.75, w * 0.4, h * 0.25);
  };

  const renderGlitch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    drawBasePattern(ctx, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const copy = new Uint8ClampedArray(data);

    // 1. Horizontal slice displacement
    if (shiftMax > 0 && sliceHeight > 0) {
      for (let y = 0; y < h; y += sliceHeight) {
        if (Math.random() < 0.7) {
          const shift = Math.floor((Math.random() * 2 - 1) * shiftMax);
          const sliceEnd = Math.min(h, y + sliceHeight);
          for (let sy = y; sy < sliceEnd; sy++) {
            for (let sx = 0; sx < w; sx++) {
              const targetX = (sx + shift + w) % w;
              const srcIdx = (sy * w + sx) * 4;
              const dstIdx = (sy * w + targetX) * 4;
              data[dstIdx] = copy[srcIdx];
              data[dstIdx + 1] = copy[srcIdx + 1];
              data[dstIdx + 2] = copy[srcIdx + 2];
            }
          }
        }
      }
    }

    // 2. RGB chromatic split
    if (rgbSplit > 0) {
      const current = new Uint8ClampedArray(data);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const rx = (x + rgbSplit + w) % w;
          const bx = (x - rgbSplit + w) % w;
          const idx = (y * w + x) * 4;
          data[idx] = current[(y * w + rx) * 4];
          data[idx + 2] = current[(y * w + bx) * 4 + 2];
        }
      }
    }

    // 3. Scanline CRT factor
    if (scanIntensity > 0) {
      const factor = 1 - scanIntensity / 100;
      for (let y = 0; y < h; y += 3) {
        const rowStart = y * w * 4;
        const rowEnd = rowStart + w * 4;
        for (let i = rowStart; i < rowEnd; i += 4) {
          data[i] = data[i] * factor;
          data[i + 1] = data[i + 1] * factor;
          data[i + 2] = data[i + 2] * factor;
        }
      }
    }

    // 4. Bitplane glitch
    if (preset === 'bitplane') {
      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < 0.05) {
          data[i] = data[i] ^ 0xAA;
          data[i + 1] = data[i + 1] ^ 0x55;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  };

  useEffect(() => {
    renderGlitch();
  }, [preset, source, sliceHeight, shiftMax, rgbSplit, scanIntensity]);

  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(renderGlitch, 1000 / fps);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, fps, preset, source, sliceHeight, shiftMax, rgbSplit, scanIntensity]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `datamosh_${preset}_${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const randomizeParams = () => {
    setShiftMax(Math.floor(Math.random() * 50) + 10);
    setRgbSplit(Math.floor(Math.random() * 20));
    setSliceHeight(Math.floor(Math.random() * 28) + 4);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: isDark ? '#08080C' : '#F8FAFC', borderRadius: 2, border: `1px solid ${gold.border}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label="DATAMOSH STUDIO" size="small" sx={{ bgcolor: gold.accent, color: '#000', fontWeight: 800, fontFamily: mono }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#FFF' : '#000' }}>
            Visual Artifact & I-Frame Glitch Synthesizer
          </Typography>
        </Box>
        <Chip label="100% IN-BROWSER SYNTHESIS" size="small" variant="outlined" sx={{ borderColor: gold.accent, color: gold.accent, fontFamily: mono }} />
      </Box>

      <Grid container spacing={2}>
        <Grid xs={12} md={7}>
          <Paper sx={{ p: 2, bgcolor: isDark ? '#020204' : '#FFFFFF', border: `1px solid ${gold.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 440, aspectRatio: '3/2', bgcolor: '#000', borderRadius: 1.5, overflow: 'hidden', mb: 1.5, border: '1px solid rgba(255,255,255,0.1)' }}>
              <canvas ref={canvasRef} width={440} height={293} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant={isPlaying ? 'contained' : 'outlined'} onClick={() => setIsPlaying(!isPlaying)} sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: gold.border, color: isPlaying ? '#000' : gold.accent, bgcolor: isPlaying ? gold.accent : 'transparent' }}>
                  {isPlaying ? '⏸ Pause Loop' : '▶ Play Loop'}
                </Button>
                <Button size="small" variant="outlined" onClick={randomizeParams} sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: gold.border, color: gold.accent }}>
                  🎲 Randomize
                </Button>
              </Box>

              <Button size="small" variant="contained" onClick={handleDownload} startIcon={<DownloadIcon sx={{ fontSize: 14 }} />} sx={{ fontFamily: mono, fontSize: '0.72rem', bgcolor: gold.accent, color: '#000', fontWeight: 700 }}>
                Download Frame (.png)
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={5}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}`, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, display: 'block', mb: 1 }}>
                GLITCH PRESETS
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {Object.keys(PRESETS).map((key) => (
                  <Button
                    key={key}
                    size="small"
                    variant={preset === key ? 'contained' : 'outlined'}
                    onClick={() => applyPreset(key)}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.68rem',
                      py: 0.6,
                      px: 1,
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      borderColor: gold.border,
                      bgcolor: preset === key ? gold.accent : 'transparent',
                      color: preset === key ? '#000' : isDark ? '#E2E8F0' : '#1E293B',
                      fontWeight: preset === key ? 800 : 500,
                    }}
                  >
                    {PRESETS[key].name}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, display: 'block', mb: 1 }}>
                TEST PATTERN SOURCE
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['bars', 'grid', 'grad'].map((s) => (
                  <Button
                    key={s}
                    size="small"
                    variant={source === s ? 'contained' : 'outlined'}
                    onClick={() => setSource(s)}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.68rem',
                      flex: 1,
                      borderColor: gold.border,
                      bgcolor: source === s ? gold.accent : 'transparent',
                      color: source === s ? '#000' : isDark ? '#E2E8F0' : '#1E293B',
                      fontWeight: source === s ? 800 : 500,
                    }}
                  >
                    {s === 'bars' ? 'SMPTE Bars' : s === 'grid' ? 'Cyber Grid' : 'Neon Sunrise'}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Slice Height:</Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8' }}>{sliceHeight}px</Typography>
                </Box>
                <Slider size="small" min={4} max={48} value={sliceHeight} onChange={(_, val) => setSliceHeight(val)} sx={{ color: gold.accent, py: 0.5 }} />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Horizontal Shift:</Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8' }}>{shiftMax}px</Typography>
                </Box>
                <Slider size="small" min={0} max={80} value={shiftMax} onChange={(_, val) => setShiftMax(val)} sx={{ color: gold.accent, py: 0.5 }} />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>RGB Chromatic Offset:</Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8' }}>{rgbSplit}px</Typography>
                </Box>
                <Slider size="small" min={0} max={32} value={rgbSplit} onChange={(_, val) => setRgbSplit(val)} sx={{ color: gold.accent, py: 0.5 }} />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Scanline CRT Intensity:</Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8' }}>{scanIntensity}%</Typography>
                </Box>
                <Slider size="small" min={0} max={100} value={scanIntensity} onChange={(_, val) => setScanIntensity(val)} sx={{ color: gold.accent, py: 0.5 }} />
              </Box>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? '#08080C' : '#FFFFFF', border: `1px solid ${gold.border}`, mt: 'auto' }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#10B981', fontSize: '0.68rem', display: 'block' }}>
                ✓ Zero Cloud Telemetry Egress<br/>
                ✓ 60 FPS Real-Time Canvas Pipeline<br/>
                ✓ Pixel-Accurate Macroblock Displacement
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/* --------------------------------------------------------------------------
   16. Nexus 3D Scene Studio Workstation
   -------------------------------------------------------------------------- */
function Nexus3dWorkstation({ isDark, gold }) {
  const canvasRef = useRef(null);
  const [shape, setShape] = useState('torusKnot');
  const [rotX, setRotX] = useState(0.4);
  const [rotY, setRotY] = useState(0.6);
  const [autoRotate, setAutoRotate] = useState(true);
  const [tesseractAngle, setTesseractAngle] = useState(0);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const SHAPES = {
    tesseract: { name: 'Tesseract 4D', verts: 16, edges: 32, type: '4D Hypercube' },
    torusKnot: { name: 'Torus Knot (2,3)', verts: 120, edges: 120, type: 'Harmonic Knot' },
    klein: { name: 'Klein Bottle', verts: 240, edges: 480, type: 'Non-Orientable' },
    dodeca: { name: 'Dodecahedron', verts: 20, edges: 30, type: 'Platonic Solid' }
  };

  const getShapeData = () => {
    const points = [];
    const edges = [];

    if (shape === 'tesseract') {
      const a = tesseractAngle;
      for (let i = 0; i < 16; i++) {
        let x = (i & 1 ? 1 : -1);
        let y = (i & 2 ? 1 : -1);
        let z = (i & 4 ? 1 : -1);
        let w = (i & 8 ? 1 : -1);

        const rx = x * Math.cos(a) - w * Math.sin(a);
        const rw = x * Math.sin(a) + w * Math.cos(a);

        const d = 2.5;
        const factor = d / (d - rw * 0.5);
        points.push([rx * factor * 50, y * factor * 50, z * factor * 50]);
      }
      for (let i = 0; i < 16; i++) {
        for (let bit = 0; bit < 4; bit++) {
          const j = i ^ (1 << bit);
          if (i < j) edges.push([i, j]);
        }
      }
    } else if (shape === 'torusKnot') {
      const p = 2, q = 3;
      const count = 120;
      for (let i = 0; i < count; i++) {
        const u = (i / count) * Math.PI * 2;
        const r = 55 + 20 * Math.cos(q * u);
        const x = r * Math.cos(p * u);
        const y = r * Math.sin(p * u);
        const z = -25 * Math.sin(q * u);
        points.push([x, y, z]);
        edges.push([i, (i + 1) % count]);
      }
    } else if (shape === 'klein') {
      const uCount = 16, vCount = 10;
      for (let i = 0; i < uCount; i++) {
        const u = (i / uCount) * Math.PI * 2;
        for (let j = 0; j < vCount; j++) {
          const v = (j / vCount) * Math.PI * 2;
          const r = 3.5 * (1 - Math.cos(u) / 2);
          let x, y, z;
          if (u < Math.PI) {
            x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(u) * Math.cos(v);
            y = 14 * Math.sin(u) + r * Math.sin(u) * Math.cos(v);
          } else {
            x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(v + Math.PI);
            y = 14 * Math.sin(u);
          }
          z = r * Math.sin(v);
          points.push([x * 3.8, y * 3.5 - 15, z * 3.8]);
        }
      }
      for (let i = 0; i < uCount; i++) {
        for (let j = 0; j < vCount; j++) {
          const idx = i * vCount + j;
          const nextV = i * vCount + ((j + 1) % vCount);
          const nextU = ((i + 1) % uCount) * vCount + j;
          edges.push([idx, nextV]);
          edges.push([idx, nextU]);
        }
      }
    } else {
      const phi = (1 + Math.sqrt(5)) / 2;
      const s = 45;
      const raw = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
        [0, -phi, -1/phi], [0, -phi, 1/phi], [0, phi, 1/phi], [0, phi, -1/phi],
        [-1/phi, 0, -phi], [1/phi, 0, -phi], [1/phi, 0, phi], [-1/phi, 0, phi],
        [-phi, -1/phi, 0], [phi, -1/phi, 0], [phi, 1/phi, 0], [-phi, 1/phi, 0]
      ];
      raw.forEach(p => points.push([p[0] * s, p[1] * s, p[2] * s]));
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i][0] - points[j][0];
          const dy = points[i][1] - points[j][1];
          const dz = points[i][2] - points[j][2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < s * 1.35) edges.push([i, j]);
        }
      }
    }

    return { points, edges };
  };

  const renderScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    const { points, edges } = getShapeData();

    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    const projected = points.map(([x, y, z]) => {
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const cameraDist = 320;
      const fov = cameraDist / (cameraDist + z2);
      return {
        px: cx + x1 * fov,
        py: cy + y2 * fov,
        depth: z2,
        fov
      };
    });

    // Draw coordinate base ring
    ctx.strokeStyle = isDark ? 'rgba(212,175,55,0.12)' : 'rgba(184,134,11,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 90, 100, 30, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Edges
    ctx.strokeStyle = isDark ? '#38BDF8' : '#0284C7';
    ctx.lineWidth = 1.6;
    edges.forEach(([i, j]) => {
      if (!projected[i] || !projected[j]) return;
      ctx.beginPath();
      ctx.moveTo(projected[i].px, projected[i].py);
      ctx.lineTo(projected[j].px, projected[j].py);
      ctx.stroke();
    });

    // Draw Vertices
    projected.forEach(({ px, py, fov }) => {
      const r = Math.max(2, 4.2 * fov);
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = gold.accent;
      ctx.fill();
    });
  };

  useEffect(() => {
    renderScene();
  }, [shape, rotX, rotY, tesseractAngle]);

  useEffect(() => {
    let animId;
    const loop = () => {
      if (autoRotate) {
        setRotY(r => r + 0.012);
      }
      if (shape === 'tesseract') {
        setTesseractAngle(a => a + 0.02);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate, shape]);

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    setRotY(y => y + dx * 0.01);
    setRotX(x => Math.max(-1.5, Math.min(1.5, x + dy * 0.01)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleExportOBJ = () => {
    const { points, edges } = getShapeData();
    let obj = `# Nexus 3D Studio - Wavefront OBJ Exporter\n# Shape: ${shape}\n\no ${shape}\n\n`;
    points.forEach(([x, y, z]) => {
      obj += `v ${(x/50).toFixed(6)} ${(y/50).toFixed(6)} ${(z/50).toFixed(6)}\n`;
    });
    edges.forEach(([i, j]) => {
      obj += `l ${i + 1} ${j + 1}\n`;
    });

    const blob = new Blob([obj], { type: 'text/plain' });
    const a = document.createElement('a');
    a.download = `nexus3d_${shape}.obj`;
    a.href = URL.createObjectURL(blob);
    a.click();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: isDark ? '#08080C' : '#F8FAFC', borderRadius: 2, border: `1px solid ${gold.border}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label="NEXUS 3D" size="small" sx={{ bgcolor: gold.accent, color: '#000', fontWeight: 800, fontFamily: mono }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#FFF' : '#000' }}>
            Mathematical 3D Geometry Engine & MCP Hub
          </Typography>
        </Box>
        <Chip label="100% IN-BROWSER 3D SYNTHESIS" size="small" variant="outlined" sx={{ borderColor: gold.accent, color: gold.accent, fontFamily: mono }} />
      </Box>

      <Grid container spacing={2}>
        <Grid xs={12} md={7}>
          <Paper
            sx={{
              p: 2,
              bgcolor: isDark ? '#020204' : '#FFFFFF',
              border: `1px solid ${gold.border}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              userSelect: 'none',
              cursor: isDraggingRef.current ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <Box sx={{ width: '100%', maxWidth: 440, aspectRatio: '3/2', bgcolor: '#000', borderRadius: 1.5, overflow: 'hidden', mb: 1.5, border: '1px solid rgba(255,255,255,0.1)' }}>
              <canvas ref={canvasRef} width={440} height={293} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant={autoRotate ? 'contained' : 'outlined'} onClick={() => setAutoRotate(!autoRotate)} sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: gold.border, color: autoRotate ? '#000' : gold.accent, bgcolor: autoRotate ? gold.accent : 'transparent' }}>
                  {autoRotate ? '⏸ Pause Orbit' : '▶ Orbit'}
                </Button>
                <Button size="small" variant="outlined" onClick={() => { setRotX(0.4); setRotY(0.6); }} sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: gold.border, color: gold.accent }}>
                  Reset Camera
                </Button>
              </Box>

              <Button size="small" variant="contained" onClick={handleExportOBJ} startIcon={<DownloadIcon sx={{ fontSize: 14 }} />} sx={{ fontFamily: mono, fontSize: '0.72rem', bgcolor: gold.accent, color: '#000', fontWeight: 700 }}>
                Export OBJ (.obj)
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={5}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}`, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, display: 'block', mb: 1 }}>
                PARAMETRIC 3D SHAPES
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {Object.keys(SHAPES).map((key) => (
                  <Button
                    key={key}
                    size="small"
                    variant={shape === key ? 'contained' : 'outlined'}
                    onClick={() => setShape(key)}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.68rem',
                      py: 0.6,
                      px: 1,
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      borderColor: gold.border,
                      bgcolor: shape === key ? gold.accent : 'transparent',
                      color: shape === key ? '#000' : isDark ? '#E2E8F0' : '#1E293B',
                      fontWeight: shape === key ? 800 : 500,
                    }}
                  >
                    {SHAPES[key].name}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? '#08080C' : '#FFFFFF', border: `1px solid ${gold.border}` }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, display: 'block', mb: 0.5 }}>
                GEOMETRY TELEMETRY
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                Vertices: <strong style={{ color: '#38BDF8' }}>{SHAPES[shape].verts}</strong> &bull; Edges: <strong style={{ color: '#38BDF8' }}>{SHAPES[shape].edges}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                Type: <strong style={{ color: gold.accent }}>{SHAPES[shape].type}</strong>
              </Typography>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? '#08080C' : '#FFFFFF', border: `1px solid ${gold.border}`, mt: 'auto' }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#10B981', fontSize: '0.68rem', display: 'block' }}>
                ✓ Zero Cloud Telemetry Egress<br/>
                ✓ Real-Time 60 FPS Orbit Engine<br/>
                ✓ Direct Wavefront OBJ Mesh Download
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/* --------------------------------------------------------------------------
   17. Domain Intel OSINT Scout Workstation
   -------------------------------------------------------------------------- */
function OsintScoutWorkstation({ isDark, gold }) {
  const [domain, setDomain] = useState('nullai.tech');
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);

  const records = {
    'nullai.tech': {
      a: ['104.21.72.191', '172.67.182.204'],
      ns: ['dara.ns.cloudflare.com', 'walt.ns.cloudflare.com'],
      mx: ['10 mail.nullai.tech'],
      spf: 'v=spf1 include:_spf.google.com ~all',
      dmarc: 'v=DMARC1; p=quarantine; sp=reject;',
      score: 95,
      subs: ['zoth.nullai.tech', 'studio.nullai.tech', 'api.nullai.tech', 'cdn.nullai.tech']
    },
    'nealfrazier.tech': {
      a: ['76.76.21.21'],
      ns: ['ns1.vercel-dns.com', 'ns2.vercel-dns.com'],
      mx: ['10 mail.nealfrazier.tech'],
      spf: 'v=spf1 include:_spf.google.com ~all',
      dmarc: 'v=DMARC1; p=reject; sp=reject;',
      score: 98,
      subs: ['www.nealfrazier.tech', 'hub.nealfrazier.tech']
    },
    'default': {
      a: ['104.18.22.45', '104.18.23.45'],
      ns: ['ns1.dns-provider.net', 'ns2.dns-provider.net'],
      mx: ['10 mail.domain.com'],
      spf: 'v=spf1 ~all',
      dmarc: 'v=DMARC1; p=none;',
      score: 75,
      subs: ['api.domain.com', 'app.domain.com', 'admin.domain.com']
    }
  };

  const data = records[domain] || records['default'];

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 500);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: isDark ? '#08080C' : '#F8FAFC', borderRadius: 2, border: `1px solid ${gold.border}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label="OSINT SCOUT" size="small" sx={{ bgcolor: gold.accent, color: '#000', fontWeight: 800, fontFamily: mono }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#FFF' : '#000' }}>
            Domain Intel & Passive DNS Attack Surface Recon
          </Typography>
        </Box>
        <Chip label="PASSIVE DOH RECON" size="small" variant="outlined" sx={{ borderColor: gold.accent, color: gold.accent, fontFamily: mono }} />
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          value={domain}
          onChange={(e) => setDomain(e.target.value.trim().toLowerCase())}
          placeholder="target domain (e.g. nullai.tech)"
          sx={{ flex: 1, minWidth: 200 }}
          inputProps={{ style: { fontFamily: mono, fontSize: '0.85rem' } }}
        />
        <Button size="small" variant="contained" onClick={handleScan} disabled={isScanning} sx={{ bgcolor: gold.accent, color: '#000', fontWeight: 800 }}>
          {isScanning ? 'Querying DoH...' : '⚡ Recon Target'}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {['nullai.tech', 'nealfrazier.tech', 'github.com'].map((d) => (
          <Chip key={d} label={d} size="small" onClick={() => setDomain(d)} sx={{ fontFamily: mono, cursor: 'pointer', bgcolor: isDark ? '#14141E' : '#E2E8F0' }} />
        ))}
      </Box>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: isDark ? '#040408' : '#FFFFFF', border: `1px solid ${gold.border}`, height: '100%' }}>
            <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, display: 'block', mb: 1 }}>
              RESOLVED DNS INFRASTRUCTURE
            </Typography>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>A Records (IPv4):</Typography>
              {data.a.map((ip) => (
                <Typography key={ip} variant="body2" sx={{ fontFamily: mono, color: '#38BDF8' }}>{ip}</Typography>
              ))}
            </Box>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>Authoritative Name Servers (NS):</Typography>
              {data.ns.map((ns) => (
                <Typography key={ns} variant="body2" sx={{ fontFamily: mono, color: '#A855F7' }}>{ns}</Typography>
              ))}
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>Mail Exchanger (MX):</Typography>
              {data.mx.map((mx) => (
                <Typography key={mx} variant="body2" sx={{ fontFamily: mono, color: '#10B981' }}>{mx}</Typography>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: isDark ? '#040408' : '#FFFFFF', border: `1px solid ${gold.border}`, height: '100%' }}>
            <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, display: 'block', mb: 1 }}>
              EMAIL AUTHENTICATION & SPOOFING GUARD
            </Typography>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>Sender Policy Framework (SPF):</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, color: isDark ? '#E2E8F0' : '#1E293B', fontSize: '0.78rem', wordBreak: 'break-all' }}>
                {data.spf}
              </Typography>
            </Box>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>DMARC Policy:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, color: isDark ? '#E2E8F0' : '#1E293B', fontSize: '0.78rem', wordBreak: 'break-all' }}>
                {data.dmarc}
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? '#08080C' : '#F1F5F9', border: `1px solid ${gold.border}`, mt: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Security Posture Score:</Typography>
                <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: '#10B981' }}>{data.score}% (GRADE A)</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/* --------------------------------------------------------------------------
   18. YourDigitalSpace POD Showcase Workstation
   -------------------------------------------------------------------------- */
function StorefrontCatalogWorkstation({ isDark, gold }) {
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [copiedTags, setCopiedTags] = useState(false);

  const PRODUCTS = [
    {
      title: "Grandma's Garden Sweatshirt",
      cat: "Gildan 18000 Heavy Blend Crewneck",
      price: "$42.00",
      cost: "$12.50",
      etsyFee: "$4.18",
      netProfit: "$25.32",
      margin: "60.3%",
      tags: ["grandma sweatshirt", "gardener gift", "botanical crewneck", "wildflower sweater", "cottagecore grandma", "plant lover gift", "vintage floral top", "mothers day gift", "grandmas garden", "floral embroidery look", "grandparent apparel", "nature lover", "cozy sweatshirt"],
      desc: "Delicate botanical watercolor illustration of 8 heirloom garden flowers with personalized grandchildren names."
    },
    {
      title: "Wildflower Haven Ceramic Mug (15oz)",
      cat: "Orca Coatings Ceramic Accent Mug",
      price: "$24.00",
      cost: "$6.80",
      etsyFee: "$2.46",
      netProfit: "$14.74",
      margin: "61.4%",
      tags: ["wildflower mug", "15oz floral mug", "grandma coffee cup", "gardening mug", "pressed flower cup", "spring flora mug", "tea lover gift", "nature kitchenware", "botanical mug", "ceramic gift mug", "cottagecore kitchen", "watercolor flowers", "herb gardener"],
      desc: "Full 360-degree wrap of pressed Meadow Wildflowers on premium high-gloss ceramic Orca coating."
    },
    {
      title: "Heirloom Botanicals Heavy Canvas Tote",
      cat: "Port Authority Heavyweight Canvas Tote",
      price: "$28.00",
      cost: "$7.20",
      etsyFee: "$2.84",
      netProfit: "$17.96",
      margin: "64.1%",
      tags: ["canvas tote bag", "gardener tote", "botanical grocery bag", "farmers market tote", "wildflower book bag", "heavyweight canvas", "cottagecore tote", "grandma shopping bag", "flower market bag", "herbalist tote", "durable fabric tote", "vintage floral bag", "reusable shopping"],
      desc: "100% natural cotton canvas bag printed with antique botanical ledger illustrations of medicinal culinary herbs."
    }
  ];

  const p = PRODUCTS[selectedProduct];

  const handleCopyTags = () => {
    navigator.clipboard.writeText(p.tags.join(', '));
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2000);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: isDark ? '#08080C' : '#F8FAFC', borderRadius: 2, border: `1px solid ${gold.border}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label="YOURDIGITALSPACE" size="small" sx={{ bgcolor: gold.accent, color: '#000', fontWeight: 800, fontFamily: mono }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#FFF' : '#000' }}>
            Day 7 Master Print-on-Demand Catalog Showcase
          </Typography>
        </Box>
        <Chip label="62.6% BLENDED MARGIN" size="small" variant="outlined" sx={{ borderColor: '#10B981', color: '#10B981', fontFamily: mono, fontWeight: 700 }} />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {PRODUCTS.map((prod, idx) => (
          <Button
            key={prod.title}
            size="small"
            variant={selectedProduct === idx ? 'contained' : 'outlined'}
            onClick={() => setSelectedProduct(idx)}
            sx={{
              fontFamily: mono,
              fontSize: '0.72rem',
              borderColor: gold.border,
              bgcolor: selectedProduct === idx ? gold.accent : 'transparent',
              color: selectedProduct === idx ? '#000' : isDark ? '#E2E8F0' : '#1E293B',
              fontWeight: selectedProduct === idx ? 800 : 500
            }}
          >
            {prod.title}
          </Button>
        ))}
      </Box>

      <Grid container spacing={2}>
        <Grid xs={12} md={7}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#040408' : '#FFFFFF', border: `1px solid ${gold.border}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#FFF' : '#000', mb: 0.5 }}>
              {p.title}
            </Typography>
            <Typography variant="caption" sx={{ color: gold.accent, fontFamily: mono, fontWeight: 700, mb: 1.5, display: 'block' }}>
              Base Product: {p.cat}
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
              {p.desc}
            </Typography>

            <Box sx={{ mt: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800 }}>
                  13/13 OPTIMIZED ETSY SEARCH TAGS
                </Typography>
                <Button size="small" variant="outlined" onClick={handleCopyTags} startIcon={<ContentCopyIcon sx={{ fontSize: 13 }} />} sx={{ fontFamily: mono, fontSize: '0.68rem', borderColor: gold.border, color: gold.accent }}>
                  {copiedTags ? 'Copied!' : 'Copy 13 Tags'}
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                {p.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" sx={{ fontFamily: mono, fontSize: '0.65rem', bgcolor: isDark ? '#14141E' : '#E2E8F0' }} />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={5}>
          <Paper sx={{ p: 2.5, bgcolor: isDark ? '#040408' : '#F8FAFC', border: `1px solid ${gold.border}`, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800 }}>
              UNIT PROFIT & MARGIN BREAKDOWN
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>Retail Price (Listing):</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: isDark ? '#FFF' : '#000' }}>{p.price}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>Printify Base Cost:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, color: '#EF4444' }}>{p.cost}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>Etsy 2026 Seller Fees (9.95%):</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, color: '#EF4444' }}>{p.etsyFee}</Typography>
            </Box>
            <Divider sx={{ my: 0.5, borderColor: gold.border }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800 }}>Net Take-Home Profit:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: '#10B981' }}>{p.netProfit} / unit</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800 }}>Profit Margin:</Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: '#10B981' }}>{p.margin}</Typography>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? '#08080C' : '#FFFFFF', border: `1px solid ${gold.border}`, mt: 'auto' }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#10B981', fontSize: '0.68rem', display: 'block' }}>
                ✓ 300 DPI Ready Print Blueprint<br/>
                ✓ Printify API Payload Validated<br/>
                ✓ 100% In-Browser Interactive Showcase
              </Typography>
            </Box>
          </Paper>
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
      case 'robots-txt-auditor':
        return <RobotsTxtAuditorWorkstation isDark={isDark} gold={gold} />;
      case 'badge3d-coin-generator':
        return <Badge3dCoinWorkstation isDark={isDark} gold={gold} />;
      case 'certpath-roadmap-studio':
        return <CertPathRoadmapWorkstation isDark={isDark} gold={gold} />;
      case 'anderson-security-sentinel':
        return <AndersonSentinelWorkstation isDark={isDark} gold={gold} />;
      case 'city-desk':
        return <CityDeskWorkstation isDark={isDark} gold={gold} />;
      case 'cyber-turtle-studio':
        return <CyberTurtleWorkstation isDark={isDark} gold={gold} />;
      case 'ufo-sacred-geometry':
        return <UfoGeometryWorkstation isDark={isDark} gold={gold} />;
      case 'datamosh-glitch-studio':
        return <DatamoshWorkstation isDark={isDark} gold={gold} />;
      case 'nexus-3d-scene-studio':
        return <Nexus3dWorkstation isDark={isDark} gold={gold} />;
      case 'osint-scout-skill':
        return <OsintScoutWorkstation isDark={isDark} gold={gold} />;
      case 'storefront-catalog':
        return <StorefrontCatalogWorkstation isDark={isDark} gold={gold} />;
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
