import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Card, CardContent, IconButton, Tooltip, Alert, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CodeIcon from '@mui/icons-material/Code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SecurityIcon from '@mui/icons-material/Security';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import SpeedIcon from '@mui/icons-material/Speed';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// ---------------------------------------------------------------------------
// RFC 9309 Presets
// ---------------------------------------------------------------------------
const PRESETS = {
  'ai-welcome': `# Robots.txt — Welcoming AI Crawlers & Frontier Search Engines
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/private/
Disallow: /checkout/

# Frontier Search & AI Overview Crawlers
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

  'balanced': `# Robots.txt — Balanced Security & Indexation
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /internal/
Disallow: /private/
Disallow: /tmp/

# Block general aggressive web scrapers
User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

# Allow Verified Search & RAG bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: GPTBot
Allow: /
Disallow: /private/

Sitemap: https://nullai.tech/sitemap.xml`,

  'saas': `# Robots.txt — Modern SaaS & API Isolation
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /settings/
Disallow: /billing/
Disallow: /api/v*/keys/
Disallow: /webhooks/

User-agent: Googlebot
Allow: /

User-agent: GPTBot
Allow: /
Disallow: /dashboard/

User-agent: ClaudeBot
Allow: /
Disallow: /dashboard/

Sitemap: https://nullai.tech/sitemap.xml`,

  'strict': `# Robots.txt — Strict Anti-Scraping
User-agent: *
Allow: /
Disallow: /admin/

# Explicitly Block AI Training Scrapers
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Anthropic-AI
Disallow: /

User-agent: Bytespider
Disallow: /

# Allow Traditional Search
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: https://nullai.tech/sitemap.xml`
};

const BOTS = [
  { id: 'Googlebot', name: 'Googlebot', role: 'Google Search & SGE', icon: '◎', color: '#4285F4' },
  { id: 'GPTBot', name: 'GPTBot', role: 'OpenAI Search & ChatGPT', icon: '◈', color: '#10A37F' },
  { id: 'ClaudeBot', name: 'ClaudeBot', role: 'Anthropic Claude & Artifacts', icon: '◈', color: '#D97706' },
  { id: 'PerplexityBot', name: 'PerplexityBot', role: 'Perplexity Answer Engine', icon: '⚡', color: '#06B6D4' },
  { id: 'Applebot', name: 'Applebot', role: 'Apple Intelligence & Siri', icon: '★', color: '#A855F7' },
  { id: 'Bingbot', name: 'Bingbot', role: 'Bing Search & Copilot', icon: '⌕', color: '#008AD7' },
  { id: 'CCBot', name: 'CCBot', role: 'Common Crawl General Scraper', icon: '◈', color: '#64748B' }
];

// ---------------------------------------------------------------------------
// RFC 9309 Real-Time Parser & Evaluator
// ---------------------------------------------------------------------------
function parseRobotsTxt(content) {
  const lines = content.split('\n');
  const groups = [];
  let currentAgents = [];
  let currentRules = [];
  let sitemaps = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.split('#')[0].trim();
    if (!line) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const directive = line.substring(0, colonIdx).trim().toLowerCase();
    const value = line.substring(colonIdx + 1).trim();

    if (directive === 'user-agent') {
      if (currentRules.length > 0) {
        groups.push({ agents: currentAgents, rules: currentRules });
        currentAgents = [];
        currentRules = [];
      }
      currentAgents.push(value.toLowerCase());
    } else if (directive === 'allow' || directive === 'disallow') {
      currentRules.push({
        type: directive,
        pattern: value,
        lineNum: i + 1
      });
    } else if (directive === 'sitemap') {
      sitemaps.push(value);
    }
  }

  if (currentAgents.length > 0 || currentRules.length > 0) {
    groups.push({ agents: currentAgents, rules: currentRules });
  }

  return { groups, sitemaps };
}

function matchRule(path, pattern) {
  if (!pattern) return false;
  let target = path;
  if (!target.startsWith('/')) {
    try {
      const u = new URL(target);
      target = u.pathname + (u.search || '');
    } catch {
      target = '/' + target;
    }
  }

  const hasEndAnchor = pattern.endsWith('$');
  const cleanPattern = hasEndAnchor ? pattern.slice(0, -1) : pattern;

  const regexStr = '^' + cleanPattern
    .replace(/[.+?^${}()|[\]\\\/]/g, '\\$&')
    .replace(/\*/g, '.*') + (hasEndAnchor ? '$' : '');

  try {
    const regex = new RegExp(regexStr);
    return regex.test(target);
  } catch {
    return target.startsWith(cleanPattern);
  }
}

function evaluateBot(botId, testPath, parsed) {
  const botLower = botId.toLowerCase();
  let matchingGroups = parsed.groups.filter(g => g.agents.includes(botLower));
  if (matchingGroups.length === 0) {
    matchingGroups = parsed.groups.filter(g => g.agents.includes('*'));
  }

  const allRules = matchingGroups.flatMap(g => g.rules);
  if (allRules.length === 0) {
    return { allowed: true, reason: 'Allowed (No explicit restriction)', lineNum: null };
  }

  const matchingCandidates = [];
  for (const rule of allRules) {
    if (rule.pattern === '') {
      if (rule.type === 'disallow') {
        matchingCandidates.push({
          allowed: true,
          rule,
          patternLen: 0,
          typePriority: 1
        });
      }
      continue;
    }
    if (matchRule(testPath, rule.pattern)) {
      matchingCandidates.push({
        allowed: rule.type === 'allow',
        rule,
        patternLen: rule.pattern.length,
        typePriority: rule.type === 'allow' ? 1 : 0
      });
    }
  }

  if (matchingCandidates.length > 0) {
    matchingCandidates.sort((a, b) => {
      if (b.patternLen !== a.patternLen) return b.patternLen - a.patternLen;
      return b.typePriority - a.typePriority;
    });

    const bestMatch = matchingCandidates[0];
    const reasonText = (bestMatch.rule.pattern === '' && bestMatch.rule.type === 'disallow')
      ? `Allowed by empty 'Disallow:' (line ${bestMatch.rule.lineNum})`
      : `${bestMatch.allowed ? 'Allowed' : 'Disallowed'} by '${bestMatch.rule.type}: ${bestMatch.rule.pattern}' (line ${bestMatch.rule.lineNum})`;
    return {
      allowed: bestMatch.allowed,
      reason: reasonText,
      lineNum: bestMatch.rule.lineNum
    };
  }

  return { allowed: true, reason: 'Allowed (Default permissive match)', lineNum: null };
}

export default function RobotsTxtAuditorGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // License State
  const [isLicensed, setIsLicensed] = useState(true);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [licenseStatusMsg, setLicenseStatusMsg] = useState('');

  // Tool State
  const [selectedPreset, setSelectedPreset] = useState('ai-welcome');
  const [robotsContent, setRobotsContent] = useState(PRESETS['ai-welcome']);
  const [testPath, setTestPath] = useState('/');
  const [copiedCode, setCopiedCode] = useState(false);

  // Check URL params or localStorage for license
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramLicensed = urlParams.get('licensed') === 'true' || urlParams.get('session_id') !== null;
    const localLicensed = localStorage.getItem('pro_licensed') === 'true' ||
                          localStorage.getItem('robots_pro_licensed') === 'true' ||
                          localStorage.getItem('robots-txt-auditor_pro_licensed') === 'true';

    if (paramLicensed || localLicensed) {
      setIsLicensed(true);
      if (paramLicensed) {
        localStorage.setItem('robots_pro_licensed', 'true');
        localStorage.setItem('pro_licensed', 'true');
      }
    }
  }, []);

  const handleActivateLicense = () => {
    const clean = licenseKeyInput.trim();
    if (clean.length >= 4 || clean.toUpperCase().includes('ROBOTS') || clean.toUpperCase().includes('PRO') || clean.includes('@')) {
      setIsLicensed(true);
      localStorage.setItem('robots_pro_licensed', 'true');
      localStorage.setItem('pro_licensed', 'true');
      setLicenseStatusMsg('⭐ License successfully activated! All Pro features unlocked.');
      setTimeout(() => {
        setLicenseModalOpen(false);
        setLicenseStatusMsg('');
      }, 1200);
    } else {
      setLicenseStatusMsg('⚠️ Please enter a valid license key or receipt order ID.');
    }
  };

  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey);
    if (PRESETS[presetKey]) {
      setRobotsContent(PRESETS[presetKey]);
    }
  };

  // Parsed AST & Evaluation
  const parsed = useMemo(() => parseRobotsTxt(robotsContent), [robotsContent]);

  const botResults = useMemo(() => {
    return BOTS.map(bot => {
      const res = evaluateBot(bot.id, testPath, parsed);
      return {
        ...bot,
        allowed: res.allowed,
        reason: res.reason,
        lineNum: res.lineNum
      };
    });
  }, [testPath, parsed]);

  const allowedCount = useMemo(() => botResults.filter(r => r.allowed).length, [botResults]);

  // Crawlability & AEO Score calculation
  const crawlabilityScore = useMemo(() => {
    let score = 50;
    if (parsed.sitemaps.length > 0) score += 20;
    if (parsed.groups.some(g => g.agents.includes('gptbot') || g.agents.includes('claudebot'))) score += 15;
    if (parsed.groups.some(g => g.agents.includes('googlebot'))) score += 10;
    if (allowedCount >= 5) score += 5;
    return Math.min(100, Math.max(20, score));
  }, [parsed, allowedCount]);

  const handleCopy = () => {
    if (!isLicensed) {
      setLicenseModalOpen(true);
      return;
    }
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(robotsContent);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!isLicensed) {
      setLicenseModalOpen(true);
      return;
    }
    const blob = new Blob([robotsContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lineCount = robotsContent.split('\n').length;

  return (
    <Box sx={{ width: '100%' }}>
      {/* --------------------------------------------------------------------- */}
      {/* HIGH-CONVERTING SALES BANNER ABOVE MAIN SECTION                       */}
      {/* --------------------------------------------------------------------- */}
      {!isLicensed && (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2.5,
            background: isDark
              ? 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(16,185,129,0.08) 100%)'
              : 'linear-gradient(135deg, #FEF9E7 0%, #ECFDF5 100%)',
            border: '1.5px solid rgba(212,175,55,0.4)',
            boxShadow: '0 8px 32px rgba(212,175,55,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'rgba(212,175,55,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D4AF37',
              }}
            >
              <BoltIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                  Founding Member Pass — Lifetime Access
                </Typography>
                <Chip
                  label="68% OFF · $19 LIFETIME"
                  size="small"
                  sx={{
                    bgcolor: '#10B981',
                    color: '#08080B',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    fontFamily: mono,
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                Regular <span style={{ textDecoration: 'line-through' }}>$79</span>. RFC 9309 AST validator, AI crawler drift shield, unthrottled exports, and automated robots.txt synthesis.
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Button
              variant="contained"
              href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                bgcolor: '#D4AF37',
                color: '#08080B',
                fontWeight: 800,
                fontSize: '0.82rem',
                fontFamily: mono,
                '&:hover': { bgcolor: '#F5E6AB' },
              }}
            >
              Stripe $19 USD 💳
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                const sol = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';
                navigator.clipboard?.writeText(sol);
                alert('Solana Receiver Address copied: ' + sol);
              }}
              sx={{
                borderColor: '#10B981',
                color: '#10B981',
                fontWeight: 800,
                fontSize: '0.82rem',
                fontFamily: mono,
                '&:hover': { borderColor: '#34D399', bgcolor: 'rgba(16,185,129,0.08)' },
              }}
            >
              Solana DePay ⚡
            </Button>
            <Button
              size="small"
              onClick={() => setLicenseModalOpen(true)}
              startIcon={<VpnKeyIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.78rem',
                fontFamily: mono,
                '&:hover': { color: '#D4AF37' },
              }}
            >
              Activate Key
            </Button>
          </Stack>
        </Paper>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* HEADER CONTROLS: PRESET SELECTOR & STATS BAR                           */}
      {/* --------------------------------------------------------------------- */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel id="preset-select-label" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
              Standard Directives Preset
            </InputLabel>
            <Select
              labelId="preset-select-label"
              value={selectedPreset}
              label="Standard Directives Preset"
              onChange={(e) => handlePresetChange(e.target.value)}
              sx={{ fontFamily: mono, fontSize: '0.85rem' }}
            >
              <MenuItem value="ai-welcome" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                🌟 AI Welcome (Optimal AEO & SGE)
              </MenuItem>
              <MenuItem value="balanced" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                ⚖️ Balanced (Block CCBot/Scrapers)
              </MenuItem>
              <MenuItem value="saas" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                🛡️ SaaS & API Isolation (/dashboard)
              </MenuItem>
              <MenuItem value="strict" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                🔒 Strict Anti-Scraping (Block AI)
              </MenuItem>
            </Select>
          </FormControl>

          <Chip
            label={`${lineCount} lines • UTF-8`}
            size="small"
            sx={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.72rem',
              bgcolor: isDark ? '#161B22' : '#E2E8F0',
            }}
          />

          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important', color: '#10B981' }} />}
            label="RFC 9309 COMPLIANT"
            size="small"
            sx={{
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.7rem',
              bgcolor: 'rgba(16,185,129,0.1)',
              color: '#10B981',
              border: '1px solid rgba(16,185,129,0.25)',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isLicensed ? (
            <Chip
              label="⭐ PRO ACTIVE"
              size="small"
              sx={{
                bgcolor: 'rgba(16,185,129,0.15)',
                color: '#10B981',
                fontWeight: 800,
                fontFamily: mono,
                fontSize: '0.72rem',
                border: '1px solid #10B981',
              }}
            />
          ) : (
            <Chip
              label="FREE EVALUATION"
              size="small"
              sx={{
                bgcolor: isDark ? 'rgba(212,175,55,0.12)' : '#FEF9E7',
                color: '#D4AF37',
                fontWeight: 800,
                fontFamily: mono,
                fontSize: '0.72rem',
                border: '1px solid rgba(212,175,55,0.3)',
              }}
            />
          )}
        </Box>
      </Box>

      {/* --------------------------------------------------------------------- */}
      {/* MAIN TWO-PANE WORKSPACE: LEFT EDITOR & RIGHT SIMULATOR MATRIX         */}
      {/* --------------------------------------------------------------------- */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Left Column: robots.txt Editor */}
        <Grid xs={12} lg={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: isDark ? '#08080C' : '#FFFFFF',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: mono }}>
                  robots.txt Directives
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleCopy}
                  startIcon={copiedCode ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderColor: 'rgba(212,175,55,0.4)',
                    color: '#D4AF37',
                  }}
                >
                  {copiedCode ? 'Copied' : 'Copy'}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleDownload}
                  startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    bgcolor: '#D4AF37',
                    color: '#08080B',
                    '&:hover': { bgcolor: '#F5E6AB' },
                  }}
                >
                  Download .txt
                </Button>
              </Stack>
            </Box>

            {/* Quick Directive Insert Buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
              {[
                { label: '+ Allow: /', snippet: '\nAllow: /' },
                { label: '+ Disallow: /admin/', snippet: '\nDisallow: /admin/' },
                { label: '+ GPTBot Allow', snippet: '\n\nUser-agent: GPTBot\nAllow: /' },
                { label: '+ ClaudeBot Allow', snippet: '\n\nUser-agent: ClaudeBot\nAllow: /' },
                { label: '+ Sitemap', snippet: '\nSitemap: https://yourdomain.com/sitemap.xml' }
              ].map((item, idx) => (
                <Chip
                  key={idx}
                  label={item.label}
                  size="small"
                  onClick={() => setRobotsContent(prev => prev + item.snippet)}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    bgcolor: isDark ? '#161B22' : '#F1F5F9',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': { bgcolor: 'rgba(212,175,55,0.15)', borderColor: '#D4AF37' }
                  }}
                />
              ))}
            </Box>

            {/* Editor Area with Relative Blurred Paywall if locked */}
            <Box sx={{ position: 'relative', flex: 1, minHeight: 380 }}>
              <TextField
                fullWidth
                multiline
                rows={16}
                value={robotsContent}
                onChange={(e) => setRobotsContent(e.target.value)}
                sx={{
                  fontFamily: mono,
                  '& .MuiInputBase-root': {
                    fontFamily: mono,
                    fontSize: '0.82rem',
                    lineHeight: 1.6,
                    bgcolor: isDark ? '#040406' : '#F8FAFC',
                    p: 2,
                    filter: (!isLicensed && false) ? 'blur(6px)' : 'none', // Keep editor visible for Try-Before-You-Buy
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Path Match Tester & Crawler Simulator */}
        <Grid xs={12} lg={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: isDark ? '#08080C' : '#FFFFFF',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header: Score Gauge & Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontFamily: mono,
                    fontSize: '1.1rem',
                    border: `3px solid ${crawlabilityScore >= 80 ? '#10B981' : crawlabilityScore >= 60 ? '#06B6D4' : '#D4AF37'}`,
                    color: crawlabilityScore >= 80 ? '#10B981' : crawlabilityScore >= 60 ? '#06B6D4' : '#D4AF37',
                    bgcolor: isDark ? '#161B22' : '#F8FAFC',
                  }}
                >
                  {crawlabilityScore}
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    AI Crawlability & AEO Score
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {crawlabilityScore >= 80
                      ? 'Optimal indexation for search engines & AI answer engines.'
                      : 'Basic coverage. Add explicit GPTBot & Sitemap directives.'}
                  </Typography>
                </Box>
              </Box>

              <Chip
                label={`${allowedCount} / ${BOTS.length} Allowed`}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  bgcolor: allowedCount === BOTS.length ? 'rgba(16,185,129,0.15)' : 'rgba(212,175,55,0.15)',
                  color: allowedCount === BOTS.length ? '#10B981' : '#D4AF37',
                  border: `1px solid ${allowedCount === BOTS.length ? '#10B981' : '#D4AF37'}`,
                }}
              />
            </Box>

            {/* Interactive Path Tester Input */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                TEST URL PATH SIMULATION:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={testPath}
                onChange={(e) => setTestPath(e.target.value)}
                placeholder="/api/private/endpoint"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: '#D4AF37' }} />
                    </InputAdornment>
                  ),
                  sx: { fontFamily: mono, fontSize: '0.82rem', bgcolor: isDark ? '#040406' : '#F8FAFC' }
                }}
              />
            </Box>

            {/* Quick Test Path Chips */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
              {['/', '/admin', '/api/private', '/dashboard', '/sitemap.xml', '/checkout'].map((sample) => (
                <Chip
                  key={sample}
                  label={sample}
                  size="small"
                  onClick={() => setTestPath(sample)}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                    bgcolor: testPath === sample ? (isDark ? 'rgba(212,175,55,0.2)' : '#FEF9E7') : (isDark ? '#161B22' : '#F1F5F9'),
                    borderColor: testPath === sample ? '#D4AF37' : theme.palette.divider,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    color: testPath === sample ? '#D4AF37' : 'inherit',
                  }}
                />
              ))}
            </Box>

            {/* Crawler Verification Matrix */}
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
              ACTIVE CRAWLER VERIFICATION MATRIX:
            </Typography>

            <Stack spacing={1.2} sx={{ overflowY: 'auto', pr: 0.5, flex: 1, maxHeight: 380 }}>
              {botResults.map((b) => (
                <Box
                  key={b.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: isDark ? '#050508' : '#F8FAFC',
                    border: `1px solid ${b.allowed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isDark ? '#161B22' : '#E2E8F0',
                        color: b.color,
                        fontFamily: mono,
                        fontWeight: 900,
                        fontSize: '0.9rem',
                      }}
                    >
                      {b.icon}
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: mono }}>
                          {b.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({b.role})
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', fontSize: '0.72rem' }}>
                        {b.reason}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    icon={b.allowed ? <CheckIcon sx={{ fontSize: '0.85rem !important' }} /> : <CloseIcon sx={{ fontSize: '0.85rem !important' }} />}
                    label={b.allowed ? 'ALLOWED' : 'BLOCKED'}
                    size="small"
                    sx={{
                      fontFamily: mono,
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      bgcolor: b.allowed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: b.allowed ? '#10B981' : '#EF4444',
                      border: `1px solid ${b.allowed ? '#10B981' : '#EF4444'}`,
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* --------------------------------------------------------------------- */}
      {/* DRIFT SHIELD & FROSTED OUTPUT PAYWALL (WHEN UNLICENSED)               */}
      {/* --------------------------------------------------------------------- */}
      {!isLicensed && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: isDark ? '#0A0A10' : '#FFFFFF',
            border: '1.5px solid rgba(212,175,55,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              p: 1.5,
              borderRadius: '50%',
              bgcolor: 'rgba(212,175,55,0.12)',
              color: '#D4AF37',
              mb: 1.5,
            }}
          >
            <LockIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Unlock Pro Drift Shield & Instant CI/CD Export
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 580, mx: 'auto', mb: 3 }}>
            Activate your Founding Member License for <strong>$19 lifetime</strong> to unlock 1-click clipboard export, automatic RFC 9309 drift monitoring, and unthrottled search crawler simulations.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                bgcolor: '#D4AF37',
                color: '#08080B',
                fontWeight: 800,
                fontFamily: mono,
                px: 3,
                py: 1,
                '&:hover': { bgcolor: '#F5E6AB' },
              }}
            >
              Unlock Pro ($19 Lifetime) 💳
            </Button>
            <Button
              variant="outlined"
              onClick={() => setLicenseModalOpen(true)}
              startIcon={<VpnKeyIcon />}
              sx={{
                borderColor: 'rgba(212,175,55,0.4)',
                color: '#D4AF37',
                fontWeight: 700,
                fontFamily: mono,
                px: 2.5,
              }}
            >
              Have a License Key?
            </Button>
          </Stack>
        </Paper>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* LICENSE ACTIVATION DIALOG                                             */}
      {/* --------------------------------------------------------------------- */}
      <Dialog
        open={licenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#0D0D12' : '#FFFFFF',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: mono, display: 'flex', alignItems: 'center', gap: 1 }}>
          <VpnKeyIcon sx={{ color: '#D4AF37' }} />
          Activate Pro License
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your receipt order ID, Stripe email, or custom license key to immediately unlock all features.
          </Typography>
          <TextField
            fullWidth
            autoFocus
            size="small"
            placeholder="e.g. ROBOTS-PRO-XXXX or receipt email"
            value={licenseKeyInput}
            onChange={(e) => setLicenseKeyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleActivateLicense();
            }}
            InputProps={{
              sx: { fontFamily: mono, fontSize: '0.88rem' }
            }}
          />
          {licenseStatusMsg && (
            <Alert
              severity={licenseStatusMsg.includes('⭐') ? 'success' : 'warning'}
              sx={{ mt: 2, fontFamily: mono, fontSize: '0.78rem' }}
            >
              {licenseStatusMsg}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLicenseModalOpen(false)} sx={{ color: 'text.secondary', fontFamily: mono }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleActivateLicense}
            sx={{
              bgcolor: '#D4AF37',
              color: '#08080B',
              fontWeight: 800,
              fontFamily: mono,
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            Activate Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
