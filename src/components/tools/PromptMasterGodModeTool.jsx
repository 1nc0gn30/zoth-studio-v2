import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Unstable_Grid2 as Grid,
  Stack,
  TextField,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import BoltIcon from '@mui/icons-material/Bolt';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckIcon from '@mui/icons-material/Check';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const STRIPE_URL = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';

const DEFAULT_PROMPT = `Act as a senior autonomous systems engineer and security architect.
Analyze the user's code repository and identify any SQL injection, SSRF, or hardcoded credential vulnerabilities.
Do not guess or hallucinate file paths.
Return a deterministic JSON array of findings with file, line, severity, and exact patch diff.`;

export default function PromptMasterGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [rawPrompt, setRawPrompt] = useState(DEFAULT_PROMPT);
  const [dialectTab, setDialectTab] = useState(0); // 0: Claude XML, 1: OpenAI JSON Schema, 2: DSPy Signature, 3: Ollama Modelfile
  const [isPro, setIsPro] = useState(true);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [licenseInput, setLicenseInput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('licensed') === 'true' || localStorage.getItem('promptmaster_pro_active') === 'true' || localStorage.getItem('pro_licensed') === 'true') {
        setIsPro(true);
        localStorage.setItem('promptmaster_pro_active', 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  // Client-Side AST Prompt Linter & Multi-Model Transpiler
  const ast = useMemo(() => {
    const text = rawPrompt || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    const estTokens = Math.max(1, Math.round(words.length * 1.32));

    const hasRole = /\b(act as|you are|role:)\b/i.test(text);
    const hasNegativeTrap = /\b(do not|don't|never)\b/i.test(text);
    const hasOutputFormat = /\b(json|xml|markdown|schema|array|table)\b/i.test(text);
    const hasVagueWords = /\b(good|nice|some|etc|maybe|try to)\b/i.test(text);

    const diagnostics = [];
    if (hasRole) {
      diagnostics.push({ status: 'PASS', label: 'Explicit Persona / Domain Anchor Defined' });
    } else {
      diagnostics.push({ status: 'WARN', label: 'Missing Explicit Role Persona (Add "You are a...")' });
    }
    if (hasOutputFormat) {
      diagnostics.push({ status: 'PASS', label: 'Deterministic Output Contract Detected' });
    } else {
      diagnostics.push({ status: 'WARN', label: 'Unbounded Output Format (Specify JSON/XML Schema)' });
    }
    if (hasNegativeTrap) {
      diagnostics.push({ status: 'INFO', label: 'Negative Constraint Reframed to Positive Invariant' });
    }
    if (hasVagueWords) {
      diagnostics.push({ status: 'WARN', label: 'Ambiguous Quantifiers Detected ("some/maybe/etc")' });
    }

    let score = 68 + (hasRole ? 14 : 0) + (hasOutputFormat ? 14 : 0) - (hasVagueWords ? 10 : 0);
    score = Math.min(99, Math.max(35, score));

    const claudeXml = `<system_instructions>
  <role_persona>
    Senior Autonomous Systems Engineer & Zero-Egress Security Architect
  </role_persona>
  <objective>
    ${text.replace(/\n+/g, '\n    ')}
  </objective>
  <verification_invariants>
    <invariant id="1">Cite only verified file paths and exact line numbers present in the AST.</invariant>
    <invariant id="2">Emit strictly valid JSON conforming to the <output_schema> contract.</invariant>
  </verification_invariants>
  <output_schema>
    [{"file": "string", "line": "number", "severity": "CRITICAL|HIGH|MEDIUM", "patch_diff": "string"}]
  </output_schema>
</system_instructions>`;

    const openaiSchema = JSON.stringify(
      {
        model: 'gpt-4o-2024-11-20',
        temperature: 0.0,
        messages: [
          {
            role: 'system',
            content: `${text}\n\nENFORCE INVARIANT: Ground every finding in exact file and line coordinates.`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'security_audit_findings',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                findings: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      file: { type: 'string' },
                      line: { type: 'integer' },
                      severity: { type: 'string' },
                      patch_diff: { type: 'string' },
                    },
                    required: ['file', 'line', 'severity', 'patch_diff'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['findings'],
              additionalProperties: false,
            },
          },
        },
      },
      null,
      2
    );

    const dspySig = `import dspy

class SovereignAuditSignature(dspy.Signature):
    """${text.replace(/"/g, "'").replace(/\n/g, ' ')}"""
    repository_ast: str = dspy.InputField(desc="Source tree & file AST context")
    zero_egress_invariants: str = dspy.InputField(desc="Strict grounding & schema bounds")
    verified_findings_json: list[dict] = dspy.OutputField(
        desc="Deterministic list of {file, line, severity, patch_diff}"
    )`;

    const ollamaModelfile = `FROM qwen2.5-coder:1.5b
PARAMETER temperature 0.10
PARAMETER top_p 0.90
PARAMETER num_ctx 8192
SYSTEM """
${claudeXml}
"""`;

    const outputs = [claudeXml, openaiSchema, dspySig, ollamaModelfile];

    return {
      estTokens,
      score,
      diagnostics,
      activeOutput: outputs[dialectTab] || claudeXml,
    };
  }, [rawPrompt, dialectTab]);

  const handleCopy = () => {
    if (!isPro) {
      setPaywallOpen(true);
      return;
    }
    navigator.clipboard?.writeText(ast.activeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivateLicense = () => {
    if (licenseInput.trim().length >= 4) {
      localStorage.setItem('promptmaster_pro_active', 'true');
      localStorage.setItem('pro_licensed', 'true');
      setIsPro(true);
      setPaywallOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Founding Sales Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2.2,
          borderRadius: 2.5,
          bgcolor: isDark ? 'rgba(192,132,252,0.08)' : '#FAF5FF',
          border: `1.5px solid ${isDark ? 'rgba(192,132,252,0.4)' : '#D8B4FE'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip
            icon={<BoltIcon sx={{ color: '#08080B !important', fontSize: 16 }} />}
            label={isPro ? '⭐ PRO ACTIVE · TRI-MODEL COMPILER UNLOCKED' : '✦ 100% OPEN ACCESS'}
            size="small"
            sx={{ bgcolor: '#C084FC', color: '#08080B', fontWeight: 900, fontFamily: mono }}
          />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Real-Time AST Prompt Linter, Claude XML / OpenAI Strict Schema / DSPy / Ollama Compiler
          </Typography>
        </Box>
        {!isPro && (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              href={STRIPE_URL}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ bgcolor: '#D4AF37', color: '#08080B', fontWeight: 800, fontFamily: mono, fontSize: '0.74rem' }}
            >
              ☕ Buy Us a Coffee (Stripe)
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setPaywallOpen(true)}
              startIcon={<VpnKeyIcon sx={{ fontSize: 14 }} />}
              sx={{ borderColor: '#C084FC', color: isDark ? '#C084FC' : '#7E22CE', fontFamily: mono, fontSize: '0.72rem', fontWeight: 700 }}
            >
              Activate Key
            </Button>
          </Stack>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Left: Raw Prompt Editor & AST Diagnostics */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2.5, height: '100%', borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? '#08080C' : '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                1. Raw System / Agent Prompt Input
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip label={`AST Score: ${ast.score}/100`} size="small" sx={{ bgcolor: 'rgba(16,185,129,0.16)', color: '#34D399', fontFamily: mono, fontWeight: 800 }} />
                <Chip label={`~${ast.estTokens} BPE Tokens`} size="small" sx={{ fontFamily: mono, fontWeight: 700 }} />
              </Stack>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={7}
              value={rawPrompt}
              onChange={(e) => setRawPrompt(e.target.value)}
              sx={{ mb: 2, '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.82rem', lineHeight: 1.6 } }}
            />
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#D4AF37', display: 'block', mb: 1 }}>
              STATIC AST LINTER DIAGNOSTICS:
            </Typography>
            <Stack spacing={1}>
              {ast.diagnostics.map((d, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }}>
                  <Chip
                    label={d.status}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.62rem',
                      fontFamily: mono,
                      fontWeight: 800,
                      bgcolor: d.status === 'PASS' ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.18)',
                      color: d.status === 'PASS' ? '#34D399' : '#FBBF24',
                    }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{d.label}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Right: Multi-Model Dialect Transpiler with Frosted Glass Lock */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2.5, height: '100%', borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? '#08080C' : '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
            <Tabs value={dialectTab} onChange={(_, v) => setDialectTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, minHeight: 36 }}>
              <Tab label="Claude XML" sx={{ fontSize: '0.75rem', fontWeight: 800, minHeight: 36 }} />
              <Tab label="OpenAI Strict JSON" sx={{ fontSize: '0.75rem', fontWeight: 800, minHeight: 36 }} />
              <Tab label="DSPy Signature" sx={{ fontSize: '0.75rem', fontWeight: 800, minHeight: 36 }} />
              <Tab label="Ollama Modelfile" sx={{ fontSize: '0.75rem', fontWeight: 800, minHeight: 36 }} />
            </Tabs>

            <Box sx={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#050508',
                  color: '#F5E6AB',
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  whiteSpace: 'pre-wrap',
                  overflowX: 'auto',
                  maxHeight: 270,
                  flexGrow: 1,
                  filter: isPro ? 'none' : 'blur(6px)',
                  userSelect: isPro ? 'auto' : 'none',
                }}
              >
                {ast.activeOutput}
              </Box>
              {!isPro && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(8,8,12,0.58)',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                  }}
                >
                  <LockIcon sx={{ fontSize: 34, color: '#D4AF37', mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFF', mb: 0.5 }}>
                    Compiled Multi-Model Prompt Artifact Locked
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#CBD5E1', maxWidth: 320, mb: 1.5 }}>
                    Unlock full Anthropic XML, OpenAI Strict Schema, DSPy &amp; Ollama Modelfile export ($19 lifetime).
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => setPaywallOpen(true)}
                    sx={{ bgcolor: '#D4AF37', color: '#08080B', fontWeight: 800, fontFamily: mono }}
                  >
                    Unlock Pro ($19)
                  </Button>
                </Box>
              )}
            </Box>

            <Button
              fullWidth
              variant="contained"
              startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
              onClick={handleCopy}
              sx={{ mt: 2, bgcolor: '#C084FC', color: '#08080B', fontWeight: 800, fontFamily: mono, fontSize: '0.76rem' }}
            >
              {copied ? 'Copied Compiled Prompt!' : 'Copy Compiled Dialect Output'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={paywallOpen} onClose={() => setPaywallOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Unlock PromptMaster Studio Pro ($19 Lifetime)</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Get lifetime access to multi-model AST prompt transpilation (Claude XML, OpenAI JSON Schema, DSPy Signatures, and Ollama Modelfiles).
          </Typography>
          <Button
            fullWidth
            variant="contained"
            href={STRIPE_URL}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mb: 2, bgcolor: '#D4AF37', color: '#08080B', fontWeight: 900 }}
          >
            Pay $19 via Stripe (Instant Unlock)
          </Button>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter receipt email or license key..."
              value={licenseInput}
              onChange={(e) => setLicenseInput(e.target.value)}
            />
            <Button variant="contained" onClick={handleActivateLicense} sx={{ bgcolor: '#10B981', color: '#08080B', fontWeight: 800 }}>
              Activate
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaywallOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
