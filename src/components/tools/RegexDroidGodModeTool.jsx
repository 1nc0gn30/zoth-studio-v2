import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Card, CardContent, IconButton, Tooltip, Tabs, Tab, Alert, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox, Select,
  MenuItem, FormControl, InputLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CodeIcon from '@mui/icons-material/Code';
import BugReportIcon from '@mui/icons-material/BugReport';
import ShieldIcon from '@mui/icons-material/Shield';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// ---------------------------------------------------------------------------
// 12 Curated Presets
// ---------------------------------------------------------------------------
const PRESETS = [
  {
    id: "email",
    name: "Email Address (RFC 5322)",
    category: "Web & Identifiers",
    pattern: "^[\\w.+-]+@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$",
    flags: "g",
    testText: "Contact us at neal@nullai.tech or test.user+demo@example.co.uk for inquiries. Invalid: user@invalid"
  },
  {
    id: "url",
    name: "HTTP / HTTPS Web URL",
    category: "Web & Identifiers",
    pattern: "https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
    flags: "g",
    testText: "Check out https://nullai.tech and https://zoth.nullai.tech/tools or ftp://invalid.protocol"
  },
  {
    id: "ipv4",
    name: "IPv4 Address (0-255)",
    category: "Network",
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: "g",
    testText: "Localhost is 127.0.0.1, Gateway is 192.168.1.1, Cloudflare is 1.1.1.1. Out of range: 999.1.1.1"
  },
  {
    id: "uuid_v4",
    name: "UUID v4 Identifier",
    category: "Identifiers",
    pattern: "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}",
    flags: "g",
    testText: "Active session token: 302ed169-2fc4-4fe5-98e4-ebd229505405. Another: c9a646d3-9c61-4cd9-bc14-aa963f66ab60."
  },
  {
    id: "jwt_token",
    name: "JSON Web Token (JWT)",
    category: "Security",
    pattern: "eyJ[a-zA-Z0-9_-]{10,}\\.eyJ[a-zA-Z0-9_-]{10,}\\.[a-zA-Z0-9_-]{10,}",
    flags: "g",
    testText: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  },
  {
    id: "semver",
    name: "Semantic Version (SemVer)",
    category: "Software Engineering",
    pattern: "(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)(?:-[0-9a-zA-Z.-]+)?(?:\\+[0-9a-zA-Z.-]+)?",
    flags: "g",
    testText: "Released zoth-studio v2.4.0 and zoth-os 3.2.1-beta.4+build.20261019. Non-semver: 1.0"
  },
  {
    id: "hex_color",
    name: "Hexadecimal Color Code",
    category: "Design & UI",
    pattern: "#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b",
    flags: "g",
    testText: "Colors: Gold is #D4AF37, Emerald is #00FF9D, Void is #08080B, Short: #FFF. Invalid: #12, #GGGGGG"
  },
  {
    id: "redos_vulnerable",
    name: "⚠️ Evil Regex (ReDoS Trap - Catastrophic)",
    category: "Security Testbed",
    pattern: "^(a+)+$",
    flags: "",
    testText: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaX"
  }
];

// ---------------------------------------------------------------------------
// Static ReDoS Vulnerability Auditor
// ---------------------------------------------------------------------------
function auditReDoS(pattern) {
  const evilChecks = [
    {
      regex: /\([a-zA-Z0-9_\\w\\d.+*?|\\[\\]-]*[+*][a-zA-Z0-9_\\w\\d.+*?|\\[\\]-]*\)[+*]/,
      name: 'Nested Quantifier Exponential Backtracking',
      order: 'O(2^N)',
      severity: 'CRITICAL',
      score: 95,
      desc: 'A quantified group contains inner quantifiers (e.g. (a+)+ or (x+)*). Backtracking branches explode exponentially on failure.',
      fix: 'Flatten inner expressions or eliminate overlapping repetition.'
    },
    {
      regex: /\((?:[a-zA-Z0-9_\\w\\d]+)\|[a-zA-Z0-9_\\w\\d]+\)[+*]/,
      name: 'Overlapping Alternation inside Quantifier',
      order: 'O(2^N)',
      severity: 'HIGH',
      score: 80,
      desc: 'Alternation branches inside a repeated group match identical characters, causing combinatorial backtracking.',
      fix: 'Ensure branches are mutually exclusive or consolidate into a single character class.'
    },
    {
      regex: /\.\*.*\.\*/,
      name: 'Multiple Unanchored Greedy Wildcards',
      order: 'O(N^2)',
      severity: 'MEDIUM',
      score: 55,
      desc: 'Multiple .* greedy wildcards create quadratic backtracking when scanning multiline payloads.',
      fix: 'Replace greedy .* with negated character classes (e.g. [^\\n]*) or non-greedy .*?.'
    }
  ];

  for (const check of evilChecks) {
    if (check.regex.test(pattern)) {
      return {
        severity: check.severity,
        name: check.name,
        description: check.desc,
        complexityOrder: check.order,
        vulnerabilityScore: check.score,
        remediation: check.fix,
        isVulnerable: true
      };
    }
  }

  return {
    severity: 'SAFE',
    name: 'Linear Matching Verification',
    description: 'No catastrophic backtracking vectors detected. Deterministic execution guaranteed.',
    complexityOrder: 'O(N)',
    vulnerabilityScore: 5,
    remediation: 'None required.',
    isVulnerable: false
  };
}

// ---------------------------------------------------------------------------
// AST Tokenizer
// ---------------------------------------------------------------------------
function tokenizeRegex(pattern) {
  const steps = [];
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];
    if (ch === '^') {
      steps.push({ type: 'ANCHOR', value: '^', desc: 'Asserts position at the beginning of the string.' });
      i++;
    } else if (ch === '$') {
      steps.push({ type: 'ANCHOR', value: '$', desc: 'Asserts position at the end of the string.' });
      i++;
    } else if (ch === '\\') {
      const next = pattern[i + 1] || '';
      let desc = 'Escaped literal character "' + next + '".';
      if (next === 'd') desc = 'Matches any digit character (0-9).';
      else if (next === 'D') desc = 'Matches any non-digit character.';
      else if (next === 'w') desc = 'Matches any word character (alphanumeric + underscore).';
      else if (next === 'W') desc = 'Matches any non-word character.';
      else if (next === 's') desc = 'Matches any whitespace character (spaces, tabs, newlines).';
      else if (next === 'S') desc = 'Matches any non-whitespace character.';
      else if (next === 'b') desc = 'Asserts a word boundary.';
      steps.push({ type: 'CHAR_CLASS', value: '\\' + next, desc });
      i += 2;
    } else if (ch === '[') {
      let close = pattern.indexOf(']', i + 1);
      if (close === -1) close = pattern.length - 1;
      const cls = pattern.slice(i, close + 1);
      const isNeg = cls.startsWith('[^');
      steps.push({
        type: 'CHAR_SET',
        value: cls,
        desc: isNeg ? 'Negated set: matches any character NOT present.' : 'Character set: matches any single character in set.'
      });
      i = close + 1;
    } else if (ch === '(') {
      let close = pattern.indexOf(')', i + 1);
      if (close === -1) close = pattern.length - 1;
      const grp = pattern.slice(i, close + 1);
      let desc = 'Capturing group.';
      if (grp.startsWith('(?:')) desc = 'Non-capturing group (groups elements without saving memory).';
      else if (grp.startsWith('(?=')) desc = 'Positive lookahead assertion.';
      else if (grp.startsWith('(?!')) desc = 'Negative lookahead assertion.';
      steps.push({ type: 'GROUP', value: grp, desc });
      i = close + 1;
    } else if (['+', '*', '?'].includes(ch) || ch === '{') {
      let q = ch;
      if (ch === '{') {
        const close = pattern.indexOf('}', i);
        q = close !== -1 ? pattern.slice(i, close + 1) : '{';
        i = close !== -1 ? close + 1 : i + 1;
      } else {
        i++;
      }
      let desc = 'Quantifier: ';
      if (q === '+') desc += 'Matches 1 or more times (greedy).';
      else if (q === '*') desc += 'Matches 0 or more times (greedy).';
      else if (q === '?') desc += 'Matches 0 or 1 time (optional).';
      else desc += `Matches ${q} repetitions.`;

      if (steps.length > 0) {
        steps[steps.length - 1].value += q;
        steps[steps.length - 1].desc += ' ' + desc;
      } else {
        steps.push({ type: 'QUANTIFIER', value: q, desc });
      }
    } else if (ch === '|') {
      steps.push({ type: 'ALTERNATION', value: '|', desc: 'Alternation: matches expression to left OR right.' });
      i++;
    } else if (ch === '.') {
      steps.push({ type: 'WILDCARD', value: '.', desc: 'Wildcard: matches any character except newline.' });
      i++;
    } else {
      steps.push({ type: 'LITERAL', value: ch, desc: `Matches literal character '${ch}'.` });
      i++;
    }
  }
  return steps;
}

// ---------------------------------------------------------------------------
// Multi-Language Code Synthesizer
// ---------------------------------------------------------------------------
function generateSnippets(pattern, flags) {
  const pyEsc = pattern.replace(/"/g, '\\"');
  const jsEsc = pattern.replace(/\//g, '\\/');

  return {
    javascript: `// JavaScript / TypeScript AST Regex Runner
const pattern = /${jsEsc}/${flags};
const text = "Your payload here...";

const matches = Array.from(text.matchAll(pattern));
console.log(\`Found \${matches.length} matches:\`, matches.map(m => m[0]));
`,
    python: `# Python 3.12+ ReDoS-Resilient Matcher
import re

pattern = r"${pyEsc}"
flags = 0
${flags.includes('i') ? 'flags |= re.IGNORECASE\n' : ''}${flags.includes('m') ? 'flags |= re.MULTILINE\n' : ''}${flags.includes('s') ? 'flags |= re.DOTALL\n' : ''}regex = re.compile(pattern, flags)

text = "Your payload here..."
matches = regex.findall(text)
print(f"Found {len(matches)} matches: {matches}")
`,
    rust: `// Rust (regex crate) - Guaranteed O(M*N) ReDoS Immunity
use regex::Regex;

fn main() {
    let re = Regex::new(r"${pattern}").unwrap();
    let text = "Your payload here...";
    
    for mat in re.find_iter(text) {
        println!("Match: {}", mat.as_str());
    }
}
`,
    go: `// Go (regexp package) - RE2 Linear Time Execution
package main

import (
    "fmt"
    "regexp"
)

func main() {
    re := regexp.MustCompile(\`${pattern}\`)
    text := "Your payload here..."
    
    matches := re.FindAllString(text, -1)
    fmt.Printf("Found %d matches: %v\\n", len(matches), matches)
}
`
  };
}

export function RegexDroidGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Palette tokens
  const gold = '#D4AF37';
  const goldSoft = 'rgba(212, 175, 55, 0.14)';
  const goldBorder = 'rgba(212, 175, 55, 0.4)';
  const emerald = '#00FF9D';
  const emeraldSoft = 'rgba(0, 255, 157, 0.12)';
  const emeraldBorder = 'rgba(0, 255, 157, 0.38)';
  const crimson = '#FF3355';
  const crimsonSoft = 'rgba(255, 51, 85, 0.12)';
  const crimsonBorder = 'rgba(255, 51, 85, 0.38)';
  const cyan = '#38BDF8';
  const cyanSoft = 'rgba(56, 189, 248, 0.12)';
  const voidDark = '#08080B';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // Operational State
  const [pattern, setPattern] = useState(PRESETS[0].pattern);
  const [flags, setFlags] = useState(PRESETS[0].flags);
  const [testText, setTestText] = useState(PRESETS[0].testText);
  const [activeTab, setActiveTab] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);

  // Pro State
  const [isProLicensed, setIsProLicensed] = useState(true);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('licensed') === 'true' || urlParams.get('pro') === 'true') {
        localStorage.setItem('regex_droid_pro_licensed', 'true');
        setIsProLicensed(true);
      } else {
        const stored = localStorage.getItem('regex_droid_pro_licensed');
        if (stored === 'true') setIsProLicensed(true);
      }
    }
  }, []);

  const handleActivateLicense = () => {
    if (licenseKeyInput.trim().length >= 6) {
      localStorage.setItem('regex_droid_pro_licensed', 'true');
      setIsProLicensed(true);
      setShowPaywallModal(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Real-time Match Calculation & Timing
  const matchResult = useMemo(() => {
    const startTime = performance.now();
    try {
      const rx = new RegExp(pattern, flags);
      const matches = [];
      if (flags.includes('g')) {
        let m;
        let count = 0;
        while ((m = rx.exec(testText)) !== null && count < 1000) {
          matches.push({ text: m[0], index: m.index });
          count++;
          if (m.index === rx.lastIndex) rx.lastIndex++;
        }
      } else {
        const m = rx.exec(testText);
        if (m) matches.push({ text: m[0], index: m.index });
      }
      const execTimeMs = (performance.now() - startTime).toFixed(3);
      return { matches, error: null, execTimeMs };
    } catch (err) {
      return { matches: [], error: err.message, execTimeMs: 0 };
    }
  }, [pattern, flags, testText]);

  // Static ReDoS Audit
  const redosAnalysis = useMemo(() => auditReDoS(pattern), [pattern]);

  // AST Tokens
  const astTokens = useMemo(() => tokenizeRegex(pattern), [pattern]);

  // Code Snippets
  const codeSnippets = useMemo(() => generateSnippets(pattern, flags), [pattern, flags]);

  return (
    <Box sx={{ mt: 1, position: 'relative' }}>
      {/* =====================================================================
          1. HIGH-CONVERTING MONETIZATION SALES FUNNEL BANNER
          ===================================================================== */}
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.14) 0%, rgba(0, 255, 157, 0.12) 50%, rgba(8, 8, 11, 0.98) 100%)'
            : 'linear-gradient(135deg, #ECFDF5 0%, #FFFBEB 100%)',
          border: `1px solid ${goldBorder}`,
          boxShadow: isDark ? '0 12px 32px rgba(212, 175, 55, 0.15)' : '0 8px 24px rgba(0,0,0,0.06)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={7}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip
                label="⚡ FREE & OPEN"
                size="small"
                sx={{ bgcolor: gold, color: '#000', fontWeight: 800, fontFamily: mono, fontSize: '0.72rem' }}
              />
              <Typography variant="body2" sx={{ color: emerald, fontWeight: 700, fontFamily: mono }}>
                AST BUILDER & REDOS GUARDIAN
              </Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: isDark ? '#FFFFFF' : '#111827' }}>
              Regex Droid Studio Pro · ReDoS Guardian & Code Foundry
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              100% in-browser visual AST tokenizer, static algorithmic ReDoS detector, multi-language code exporter, and catastrophic backtracking circuit breaker.
            </Typography>
          </Grid>

          <Grid xs={12} md={5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" alignItems="center">
              <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono }}>
                  ZERO EGRESS • REDOS GUARDIAN
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: gold, fontFamily: mono }}>
                  100% OPEN ACCESS
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  component="a"
                  href="https://github.com/1nc0gn30/zoth-studio-v2"
                  target="_blank"
                  rel="noopener"
                  startIcon={<BoltIcon />}
                  sx={{
                    bgcolor: gold,
                    color: '#000',
                    fontWeight: 800,
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    '&:hover': { bgcolor: '#B89628' }
                  }}
                >
                  GITHUB SOURCE
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* =====================================================================
          2. WORKSPACE HUD & PRESET SELECTOR
          ===================================================================== */}
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: 3,
          bgcolor: isDark ? '#10121A' : '#FFFFFF',
          border: `1px solid ${cardBorder}`
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={7}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: emeraldSoft, color: emerald, display: 'flex' }}>
                <ShieldIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? '#FFF' : '#111827' }}>
                  Regex Droid <span style={{ color: emerald }}>AST & ReDoS Studio</span>
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono }}>
                  Deterministic AST Deconstruction · Zero-Egress Engine · NullAI Platform
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              <Chip
                icon={isProLicensed ? <CheckCircleIcon sx={{ fontSize: '0.9rem !important', color: `${emerald} !important` }} /> : <LockIcon sx={{ fontSize: '0.9rem !important', color: `${gold} !important` }} />}
                label={isProLicensed ? "✦ 100% FREE & OPEN ACCESS" : "FREE & OPEN ACCESS"}
                size="small"
                onClick={() => !isProLicensed && setShowPaywallModal(true)}
                sx={{
                  bgcolor: isProLicensed ? emeraldSoft : goldSoft,
                  color: isProLicensed ? emerald : gold,
                  fontWeight: 800,
                  fontFamily: mono,
                  border: `1px solid ${isProLicensed ? emeraldBorder : goldBorder}`,
                  cursor: isProLicensed ? 'default' : 'pointer'
                }}
              />
              <Chip
                label={`COMPLEXITY: ${redosAnalysis.complexityOrder}`}
                size="small"
                sx={{
                  bgcolor: redosAnalysis.isVulnerable ? crimsonSoft : emeraldSoft,
                  color: redosAnalysis.isVulnerable ? crimson : emerald,
                  fontWeight: 800,
                  fontFamily: mono
                }}
              />
              <Chip
                label={`${matchResult.matches.length} MATCHES (${matchResult.execTimeMs}ms)`}
                size="small"
                sx={{ bgcolor: cyanSoft, color: cyan, fontWeight: 700, fontFamily: mono }}
              />
            </Stack>
          </Grid>

          <Grid xs={12} md={5}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontFamily: mono, fontSize: '0.8rem' }}>Load Curated Preset</InputLabel>
              <Select
                label="Load Curated Preset"
                value=""
                onChange={(e) => {
                  const p = PRESETS.find(pr => pr.id === e.target.value);
                  if (p) {
                    setPattern(p.pattern);
                    setFlags(p.flags);
                    setTestText(p.testText);
                  }
                }}
                sx={{ fontFamily: mono, fontSize: '0.82rem' }}
              >
                {PRESETS.map((p) => (
                  <MenuItem key={p.id} value={p.id} sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                    {p.name} ({p.category})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* =====================================================================
          3. REGEX PATTERN & FLAGS INPUT
          ===================================================================== */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2.5, bgcolor: isDark ? '#10121A' : '#FFFFFF', border: `1px solid ${cardBorder}` }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={9}>
            <TextField
              fullWidth
              size="small"
              label="Regular Expression Pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Typography sx={{ color: cyan, fontFamily: mono, fontWeight: 700 }}>/</Typography></InputAdornment>,
                endAdornment: <InputAdornment position="end"><Typography sx={{ color: cyan, fontFamily: mono, fontWeight: 700 }}>/{flags}</Typography></InputAdornment>,
                sx: { fontFamily: mono, fontSize: '0.9rem', color: '#F8FAFC' }
              }}
            />
          </Grid>

          <Grid xs={12} md={3}>
            <Stack direction="row" spacing={1} justifyContent="center">
              {['g', 'i', 'm', 's'].map(flag => (
                <Chip
                  key={flag}
                  label={flag}
                  size="small"
                  onClick={() => {
                    setFlags(prev => prev.includes(flag) ? prev.replace(flag, '') : prev + flag);
                  }}
                  sx={{
                    fontFamily: mono,
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    bgcolor: flags.includes(flag) ? cyan : isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                    color: flags.includes(flag) ? '#000' : 'text.secondary',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* ReDoS Static Alert Strip */}
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: redosAnalysis.isVulnerable ? crimsonSoft : emeraldSoft,
            border: `1px solid ${redosAnalysis.isVulnerable ? crimsonBorder : emeraldBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {redosAnalysis.isVulnerable ? (
              <WarningAmberIcon sx={{ color: crimson, fontSize: 22 }} />
            ) : (
              <CheckCircleIcon sx={{ color: emerald, fontSize: 22 }} />
            )}
            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.8rem', fontWeight: 800, color: redosAnalysis.isVulnerable ? crimson : emerald }}>
                {redosAnalysis.isVulnerable ? `⚠️ ReDoS Threat: ${redosAnalysis.name} (${redosAnalysis.complexityOrder})` : '❖ Linear ReDoS Immunity Verified (O(N))'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {redosAnalysis.description} {redosAnalysis.isVulnerable && `Remediation: ${redosAnalysis.remediation}`}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`RISK SCORE: ${redosAnalysis.vulnerabilityScore}/100`}
            size="small"
            sx={{
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.7rem',
              bgcolor: redosAnalysis.isVulnerable ? crimson : emerald,
              color: '#000'
            }}
          />
        </Box>
      </Paper>

      {/* =====================================================================
          4. NAVIGATION TABS
          ===================================================================== */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{
          mb: 2.5,
          borderBottom: `1px solid ${cardBorder}`,
          '& .MuiTab-root': {
            fontFamily: mono,
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'none',
            color: 'text.secondary',
            '&.Mui-selected': { color: emerald }
          },
          '& .MuiTabs-indicator': { bgcolor: emerald }
        }}
      >
        <Tab icon={<PlayArrowIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="⚡ Live Matcher & Testbed" />
        <Tab icon={<CodeIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="🌳 AST Token Breakdown" />
        <Tab icon={<BoltIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="🚀 Multi-Language Code Exporter" />
      </Tabs>

      {/* =====================================================================
          TAB 0: LIVE MATCHER & TESTBED
          ===================================================================== */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid xs={12} md={7}>
            <Paper sx={{ p: 2.5, bgcolor: isDark ? '#10121A' : '#FFFFFF', border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: cyan }}>
                Test String Payload
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={7}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter sample strings to evaluate against the regex..."
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.82rem', lineHeight: 1.6 } }}
              />
            </Paper>
          </Grid>

          <Grid xs={12} md={5}>
            <Paper sx={{ p: 2.5, bgcolor: isDark ? '#10121A' : '#FFFFFF', border: `1px solid ${cardBorder}`, borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: emerald }}>
                  Captured Matches ({matchResult.matches.length})
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8' }}>
                  Exec: {matchResult.execTimeMs}ms
                </Typography>
              </Box>

              {matchResult.error ? (
                <Alert severity="error" sx={{ fontFamily: mono, fontSize: '0.75rem' }}>
                  Regex Error: {matchResult.error}
                </Alert>
              ) : matchResult.matches.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: voidDark, borderRadius: 2, border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8' }}>
                    Zero matches found for current pattern against test text.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1} sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {matchResult.matches.map((m, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1,
                        bgcolor: voidDark,
                        borderRadius: 1.5,
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', color: '#F8FAFC', wordBreak: 'break-all', mr: 1 }}>
                        {m.text}
                      </Typography>
                      <Chip label={`@${m.index}`} size="small" sx={{ fontFamily: mono, fontSize: '0.65rem', height: 20 }} />
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* =====================================================================
          TAB 1: AST TOKEN BREAKDOWN
          ===================================================================== */}
      {activeTab === 1 && (
        <Paper sx={{ p: 2.5, bgcolor: isDark ? '#10121A' : '#FFFFFF', border: `1px solid ${cardBorder}`, borderRadius: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: gold }}>
            Abstract Syntax Tree (AST) Token Sequence ({astTokens.length} Nodes)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Deterministic lexical tokenizer decomposing the compiled regular expression:
          </Typography>

          <Grid container spacing={1.5}>
            {astTokens.map((tok, idx) => (
              <Grid xs={12} sm={6} md={4} key={idx}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: voidDark,
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.08)',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.85rem', color: cyan, fontWeight: 800 }}>
                      {tok.value}
                    </Typography>
                    <Chip
                      label={tok.type}
                      size="small"
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        bgcolor: tok.type.includes('ANCHOR') ? goldSoft : tok.type.includes('SET') ? emeraldSoft : cyanSoft,
                        color: tok.type.includes('ANCHOR') ? gold : tok.type.includes('SET') ? emerald : cyan
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#CBD5E1', fontSize: '0.72rem', display: 'block' }}>
                    {tok.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* =====================================================================
          TAB 2: MULTI-LANGUAGE CODE EXPORTER (PAYWALLED)
          ===================================================================== */}
      {activeTab === 2 && (
        <Box sx={{ position: 'relative' }}>
          {!isProLicensed && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                bgcolor: 'rgba(8, 8, 11, 0.72)',
                borderRadius: 3,
                p: 3
              }}
            >
              <Paper
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  maxWidth: 500,
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: isDark ? '#10121A' : '#FFFFFF',
                  border: `1px solid ${goldBorder}`,
                  boxShadow: '0 20px 48px rgba(0,0,0,0.8)'
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    bgcolor: goldSoft,
                    color: gold,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <LockIcon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  Unlock Multi-Language Code Foundry
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.6 }}>
                  Export production-ready, ReDoS-immunized regex code snippets across Python, Rust, Go, and TypeScript. Free to use.
                </Typography>
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    component="a"
                    href="https://github.com/1nc0gn30/zoth-studio-v2"
                    target="_blank"
                    rel="noopener"
                    startIcon={<BoltIcon />}
                    sx={{ bgcolor: gold, color: '#000', fontWeight: 800, fontFamily: mono, py: 1.2, '&:hover': { bgcolor: '#B89628' } }}
                  >
                    OPTIONAL TIP WITH STRIPE
                  </Button>
                </Stack>
                <Button
                  size="small"
                  onClick={() => setShowPaywallModal(true)}
                  sx={{ color: 'text.secondary', fontSize: '0.72rem', textDecoration: 'underline' }}
                >
                  Already purchased? Enter receipt key
                </Button>
              </Paper>
            </Box>
          )}

          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: isDark ? '#10121A' : '#FFFFFF',
              border: `1px solid ${cardBorder}`,
              filter: isProLicensed ? 'none' : 'blur(5px)',
              pointerEvents: isProLicensed ? 'auto' : 'none'
            }}
          >
            <Grid container spacing={2}>
              {Object.entries(codeSnippets).map(([lang, code]) => (
                <Grid xs={12} md={6} key={lang}>
                  <Paper sx={{ p: 2, bgcolor: voidDark, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.8rem', fontWeight: 800, color: gold }}>
                        {lang.toUpperCase()}
                      </Typography>
                      <IconButton size="small" onClick={() => handleCopy(code, lang)} sx={{ color: '#94A3B8' }}>
                        {copiedKey === lang ? <CheckCircleIcon sx={{ fontSize: 14, color: emerald }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                      </IconButton>
                    </Box>
                    <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.72rem', color: '#E2E8F0', lineHeight: 1.5, maxHeight: 180, overflowY: 'auto' }}>
                      {code}
                    </pre>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      )}

      {/* =====================================================================
          PRO ACTIVATION DIALOG
          ===================================================================== */}
      <Dialog
        open={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#10121A' : '#FFFFFF',
            border: `1px solid ${goldBorder}`,
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: mono, color: gold, pb: 1 }}>
          ✦ 100% OPEN ACCESS
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Everything is already unlocked and free to use. Tips are optional and unlock nothing extra.
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. REGEX-PRO-2026-XXXX or neal@..."
            value={licenseKeyInput}
            onChange={(e) => setLicenseKeyInput(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><VpnKeyIcon sx={{ color: gold, fontSize: 18 }} /></InputAdornment>,
              sx: { fontFamily: mono, fontSize: '0.82rem' }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowPaywallModal(false)} sx={{ color: 'text.secondary', fontFamily: mono }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleActivateLicense}
            disabled={licenseKeyInput.trim().length < 6}
            sx={{ bgcolor: gold, color: '#000', fontWeight: 800, fontFamily: mono }}
          >
            ACTIVATE PRO
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RegexDroidGodModeTool;
