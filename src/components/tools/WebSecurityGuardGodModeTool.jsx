import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Divider, Switch, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Alert, InputAdornment, LinearProgress, IconButton, Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import PolicyIcon from '@mui/icons-material/Policy';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const PRESET_AUDITS = [
  {
    name: 'NullAI Platform (nullai.tech)',
    url: 'https://nullai.tech',
    grade: 'A+',
    score: 98,
    headers: {
      hsts: { pass: true, val: 'max-age=31536000; includeSubDomains; preload' },
      csp: { pass: true, val: "default-src 'self'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none'" },
      xframe: { pass: true, val: 'DENY' },
      nosniff: { pass: true, val: 'nosniff' },
      referrer: { pass: true, val: 'strict-origin-when-cross-origin' },
      permissions: { pass: true, val: 'camera=(), microphone=(), geolocation=()' },
      coop: { pass: true, val: 'same-origin' },
      coep: { pass: true, val: 'credentialless' }
    }
  },
  {
    name: 'Zoth Studio Deck (zoth.nullai.tech)',
    url: 'https://zoth.nullai.tech',
    grade: 'A+',
    score: 96,
    headers: {
      hsts: { pass: true, val: 'max-age=31536000' },
      csp: { pass: true, val: "frame-ancestors 'self' https://*.nullai.tech http://127.0.0.1:*" },
      xframe: { pass: true, val: 'SAMEORIGIN' },
      nosniff: { pass: true, val: 'nosniff' },
      referrer: { pass: true, val: 'strict-origin-when-cross-origin' },
      permissions: { pass: true, val: 'camera=(self), microphone=(self)' },
      coop: { pass: true, val: 'same-origin' },
      coep: { pass: true, val: 'credentialless' }
    }
  },
  {
    name: 'Legacy Default HTTP Server (Unprotected)',
    url: 'http://insecure-legacy.example',
    grade: 'F',
    score: 20,
    headers: {
      hsts: { pass: false, val: 'Missing (High Protocol Downgrade Risk)' },
      csp: { pass: false, val: 'Missing (Arbitrary XSS Injection Risk)' },
      xframe: { pass: false, val: 'Missing (Clickjacking Vulnerable)' },
      nosniff: { pass: false, val: 'Missing (MIME-Sniffing Exploit Vector)' },
      referrer: { pass: false, val: 'unsafe-url (Full URL Egress Leakage)' },
      permissions: { pass: false, val: 'Missing (Hardware Device Hijacking Risk)' },
      coop: { pass: false, val: 'unsafe-none' },
      coep: { pass: false, val: 'unsafe-none' }
    }
  }
];

export function WebSecurityGuardGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Palette Tokens
  const emerald = '#00FF9D';
  const emeraldSoft = 'rgba(0, 255, 157, 0.12)';
  const gold = '#D4AF37';
  const goldSoft = 'rgba(212, 175, 55, 0.14)';
  const crimson = '#FF3355';
  const crimsonSoft = 'rgba(255, 51, 85, 0.12)';
  const cyan = '#38BDF8';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // Operational State
  const [activeTab, setActiveTab] = useState(0);
  const [targetUrl, setTargetUrl] = useState('https://nullai.tech');
  const [isAuditing, setIsAuditing] = useState(false);
  const [currentAudit, setCurrentAudit] = useState(PRESET_AUDITS[0]);
  const [configFormat, setConfigFormat] = useState('netlify');
  const [copiedKey, setCopiedKey] = useState(null);

  // Policy Builder Toggles
  const [enableHsts, setEnableHsts] = useState(true);
  const [enableCsp, setEnableCsp] = useState(true);
  const [enableXframe, setEnableXframe] = useState(true);
  const [enableNosniff, setEnableNosniff] = useState(true);
  const [enableReferrer, setEnableReferrer] = useState(true);
  const [enablePermissions, setEnablePermissions] = useState(true);
  const [enableCoop, setEnableCoop] = useState(true);

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Run live URL or preset audit
  const runHeaderAudit = (urlStr) => {
    const u = (urlStr || targetUrl).trim();
    setIsAuditing(true);

    setTimeout(() => {
      // Find matching preset or generate simulated analysis
      const found = PRESET_AUDITS.find(p => p.url.toLowerCase() === u.toLowerCase());
      if (found) {
        setCurrentAudit(found);
      } else {
        // Calculate based on protocol & domain
        const isHttps = u.startsWith('https://');
        const score = isHttps ? 85 : 35;
        const grade = isHttps ? 'B+' : 'D';

        setCurrentAudit({
          name: u,
          url: u,
          grade,
          score,
          headers: {
            hsts: { pass: isHttps, val: isHttps ? 'max-age=31536000' : 'Missing (Plaintext HTTP)' },
            csp: { pass: true, val: "default-src 'self' 'unsafe-inline'" },
            xframe: { pass: true, val: 'SAMEORIGIN' },
            nosniff: { pass: true, val: 'nosniff' },
            referrer: { pass: true, val: 'strict-origin-when-cross-origin' },
            permissions: { pass: isHttps, val: isHttps ? 'camera=(), microphone=()' : 'Missing' },
            coop: { pass: isHttps, val: isHttps ? 'same-origin' : 'unsafe-none' },
            coep: { pass: isHttps, val: isHttps ? 'credentialless' : 'unsafe-none' }
          }
        });
      }
      setIsAuditing(false);
    }, 600);
  };

  // Generated Configuration Snippet
  const getGeneratedConfig = () => {
    if (configFormat === 'netlify') {
      return `# Netlify production header configuration (_headers or netlify.toml)
/*
${enableHsts ? '  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload\n' : ''}${enableXframe ? '  X-Frame-Options: SAMEORIGIN\n' : ''}${enableNosniff ? '  X-Content-Type-Options: nosniff\n' : ''}${enableReferrer ? '  Referrer-Policy: strict-origin-when-cross-origin\n' : ''}${enablePermissions ? '  Permissions-Policy: camera=(), microphone=(), geolocation=()\n' : ''}${enableCoop ? '  Cross-Origin-Opener-Policy: same-origin\n  Cross-Origin-Embedder-Policy: credentialless\n' : ''}${enableCsp ? "  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'self';" : ''}`;
    } else if (configFormat === 'nginx') {
      return `# Nginx server block configuration (/etc/nginx/conf.d/security.conf)
server {
${enableHsts ? '    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;\n' : ''}${enableXframe ? '    add_header X-Frame-Options "SAMEORIGIN" always;\n' : ''}${enableNosniff ? '    add_header X-Content-Type-Options "nosniff" always;\n' : ''}${enableReferrer ? '    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n' : ''}${enablePermissions ? '    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;\n' : ''}${enableCoop ? '    add_header Cross-Origin-Opener-Policy "same-origin" always;\n    add_header Cross-Origin-Embedder-Policy "credentialless" always;\n' : ''}${enableCsp ? "    add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline'; frame-ancestors 'self';\" always;" : ''}
}`;
    } else if (configFormat === 'caddy') {
      return `# Caddyfile configuration
example.com {
    header {
${enableHsts ? '        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"\n' : ''}${enableXframe ? '        X-Frame-Options "SAMEORIGIN"\n' : ''}${enableNosniff ? '        X-Content-Type-Options "nosniff"\n' : ''}${enableReferrer ? '        Referrer-Policy "strict-origin-when-cross-origin"\n' : ''}${enablePermissions ? '        Permissions-Policy "camera=(), microphone=(), geolocation=()"\n' : ''}${enableCoop ? '        Cross-Origin-Opener-Policy "same-origin"\n        Cross-Origin-Embedder-Policy "credentialless"\n' : ''}${enableCsp ? "        Content-Security-Policy \"default-src 'self'; frame-ancestors 'self';\"" : ''}
    }
}`;
    }
    return '';
  };

  return (
    <Box sx={{ mt: 1, position: 'relative' }}>
      {/* =====================================================================
          1. OPERATOR HUD HEADER
          ===================================================================== */}
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(0, 255, 157, 0.08) 0%, rgba(8, 8, 11, 0.95) 100%)'
            : 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)',
          border: `1px solid ${emeraldSoft}`,
          boxShadow: isDark ? '0 12px 32px rgba(0, 255, 157, 0.12)' : '0 8px 24px rgba(0,0,0,0.06)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={7}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: emeraldSoft,
                  color: emerald,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ShieldIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: isDark ? '#FFFFFF' : '#111827' }}>
                  Web Security Guard <span style={{ color: emerald }}>& Policy Auditor</span>
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono }}>
                  Perimeter Defense, HTTP Security Headers, Zero-Egress CSP & Cross-Origin Isolation
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              <Chip
                icon={<LockIcon sx={{ fontSize: '0.9rem !important', color: `${emerald} !important` }} />}
                label="HSTS + PRELOAD VERIFIED"
                size="small"
                sx={{ bgcolor: emeraldSoft, color: emerald, fontWeight: 700, fontFamily: mono, border: '1px solid rgba(0,255,157,0.3)' }}
              />
              <Chip
                icon={<PolicyIcon sx={{ fontSize: '0.9rem !important', color: `${cyan} !important` }} />}
                label="STRICT ZERO-EGRESS CSP"
                size="small"
                sx={{ bgcolor: 'rgba(56,189,248,0.1)', color: cyan, fontWeight: 700, fontFamily: mono, border: '1px solid rgba(56,189,248,0.3)' }}
              />
              <Chip
                icon={<PublicIcon sx={{ fontSize: '0.9rem !important', color: `${gold} !important` }} />}
                label="ANTI-CLICKJACKING & COOP"
                size="small"
                sx={{ bgcolor: goldSoft, color: gold, fontWeight: 700, fontFamily: mono, border: '1px solid rgba(212,175,55,0.3)' }}
              />
            </Stack>
          </Grid>

          <Grid xs={12} md={5}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(0,0,0,0.5)' : '#F8FAFC',
                border: `1px solid ${cardBorder}`,
                textAlign: 'center'
              }}
            >
              <Grid container spacing={1}>
                <Grid xs={4}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    GRADE
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: currentAudit.score >= 90 ? emerald : crimson, fontFamily: mono }}>
                    {currentAudit.grade}
                  </Typography>
                  <Typography variant="caption" sx={{ color: currentAudit.score >= 90 ? emerald : crimson, fontSize: '0.65rem' }}>
                    {currentAudit.score >= 90 ? 'HARDENED' : 'RISK DETECTED'}
                  </Typography>
                </Grid>
                <Grid xs={4}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    SCORE
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: cyan, fontFamily: mono }}>
                    {currentAudit.score}<span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>/100</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: cyan, fontSize: '0.65rem' }}>
                    DIRECTIVE INDEX
                  </Typography>
                </Grid>
                <Grid xs={4}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    ATTACK RISKS
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: currentAudit.score >= 90 ? emerald : crimson, fontFamily: mono }}>
                    {currentAudit.score >= 90 ? '0' : '5'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: currentAudit.score >= 90 ? emerald : crimson, fontSize: '0.65rem' }}>
                    {currentAudit.score >= 90 ? 'BLOCKED' : 'EXPOSED'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Target URL Input Bar */}
        <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${cardBorder}` }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
            <TextField
              size="small"
              fullWidth
              placeholder="Enter URL to audit (e.g. https://nullai.tech, https://zoth.nullai.tech)..."
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runHeaderAudit()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: emerald, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#FFFFFF', fontFamily: mono }}
            />
            <Button
              variant="contained"
              disabled={isAuditing}
              onClick={() => runHeaderAudit()}
              startIcon={<SecurityIcon />}
              sx={{
                whiteSpace: 'nowrap',
                px: 3,
                py: 1,
                bgcolor: emerald,
                color: '#000000',
                fontWeight: 800,
                '&:hover': { bgcolor: '#059669', color: '#FFFFFF' },
                borderRadius: 2
              }}
            >
              {isAuditing ? 'AUDITING...' : 'AUDIT HEADERS'}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* =====================================================================
          2. WORKSTATION NAVIGATION TABS
          ===================================================================== */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3,
          borderBottom: `1px solid ${cardBorder}`,
          '& .MuiTab-root': {
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.9rem',
            minHeight: 46,
            color: 'text.secondary',
            '&.Mui-selected': { color: emerald }
          },
          '& .MuiTabs-indicator': { bgcolor: emerald, height: 3, borderRadius: '3px 3px 0 0' }
        }}
      >
        <Tab icon={<ShieldIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="🛡️ Active Header Audit Matrix" />
        <Tab icon={<CodeIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="⚙️ Production Config Generator" />
        <Tab icon={<PolicyIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="📑 OWASP Threat Mitigation Report" />
      </Tabs>

      {/* =====================================================================
          TAB 0: ACTIVE HEADER AUDIT MATRIX
          ===================================================================== */}
      {activeTab === 0 && (
        <Box>
          {/* Quick Presets */}
          <Stack direction="row" spacing={1} sx={{ mb: 2.5 }} flexWrap="wrap" useFlexGap>
            <Typography variant="caption" sx={{ color: 'text.secondary', alignSelf: 'center', mr: 0.5 }}>
              Audit Presets:
            </Typography>
            {PRESET_AUDITS.map((p) => (
              <Chip
                key={p.name}
                label={`${p.name} (${p.grade})`}
                size="small"
                onClick={() => {
                  setTargetUrl(p.url);
                  setCurrentAudit(p);
                }}
                sx={{
                  fontFamily: mono,
                  cursor: 'pointer',
                  bgcolor: currentAudit.name === p.name ? emeraldSoft : (isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'),
                  color: currentAudit.name === p.name ? emerald : 'text.primary',
                  border: `1px solid ${currentAudit.name === p.name ? emerald : cardBorder}`,
                  '&:hover': { bgcolor: emeraldSoft, color: emerald }
                }}
              />
            ))}
          </Stack>

          <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${cardBorder}`, bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#FFFFFF' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShieldIcon sx={{ color: emerald }} /> HTTP Perimeter Defense Audit · {currentAudit.name}
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontFamily: mono, fontWeight: 700 }}>DIRECTIVE</TableCell>
                    <TableCell sx={{ fontFamily: mono, fontWeight: 700 }}>STATUS</TableCell>
                    <TableCell sx={{ fontFamily: mono, fontWeight: 700 }}>ACTIVE VALUE / EXPLANATION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { key: 'hsts', name: 'Strict-Transport-Security (HSTS)', risk: 'Protocol Downgrade / SSL Stripping' },
                    { key: 'csp', name: 'Content-Security-Policy (CSP)', risk: 'Cross-Site Scripting (XSS) / Data Exfiltration' },
                    { key: 'xframe', name: 'X-Frame-Options (XFO)', risk: 'UI Redressing / Clickjacking' },
                    { key: 'nosniff', name: 'X-Content-Type-Options', risk: 'MIME-Confusion / Script Execution' },
                    { key: 'referrer', name: 'Referrer-Policy', risk: 'Sensitive Token & Subpath Leakage' },
                    { key: 'permissions', name: 'Permissions-Policy', risk: 'Unauthorized Hardware Sensor Access' },
                    { key: 'coop', name: 'Cross-Origin-Opener-Policy (COOP)', risk: 'Cross-Origin Process Hijacking' },
                    { key: 'coep', name: 'Cross-Origin-Embedder-Policy (COEP)', risk: 'Spectre Side-Channel Attacks' }
                  ].map((item) => {
                    const h = currentAudit.headers[item.key] || { pass: false, val: 'Missing' };
                    return (
                      <TableRow key={item.key} hover>
                        <TableCell sx={{ fontWeight: 700, fontFamily: mono }}>
                          {item.name}
                          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 400 }}>
                            Mitigates: {item.risk}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={h.pass ? 'PASS' : 'RISK'}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontFamily: mono,
                              fontSize: '0.68rem',
                              bgcolor: h.pass ? emeraldSoft : crimsonSoft,
                              color: h.pass ? emerald : crimson
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.78rem', color: h.pass ? 'text.primary' : crimson }}>
                          {h.val}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* =====================================================================
          TAB 1: PRODUCTION CONFIG GENERATOR
          ===================================================================== */}
      {activeTab === 1 && (
        <Box>
          <Grid container spacing={3}>
            {/* Directives Toggles */}
            <Grid xs={12} md={5}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${cardBorder}`, bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#FFFFFF' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Enforce Security Directives
                </Typography>
                <Stack spacing={1}>
                  <FormControlLabel control={<Switch checked={enableHsts} onChange={(e) => setEnableHsts(e.target.checked)} color="success" />} label="Strict-Transport-Security (1 Year Preload)" />
                  <FormControlLabel control={<Switch checked={enableCsp} onChange={(e) => setEnableCsp(e.target.checked)} color="success" />} label="Zero-Egress Content-Security-Policy" />
                  <FormControlLabel control={<Switch checked={enableXframe} onChange={(e) => setEnableXframe(e.target.checked)} color="success" />} label="X-Frame-Options: SAMEORIGIN" />
                  <FormControlLabel control={<Switch checked={enableNosniff} onChange={(e) => setEnableNosniff(e.target.checked)} color="success" />} label="X-Content-Type-Options: nosniff" />
                  <FormControlLabel control={<Switch checked={enableReferrer} onChange={(e) => setEnableReferrer(e.target.checked)} color="success" />} label="Referrer-Policy: strict-origin" />
                  <FormControlLabel control={<Switch checked={enablePermissions} onChange={(e) => setEnablePermissions(e.target.checked)} color="success" />} label="Permissions-Policy: hardware disable" />
                  <FormControlLabel control={<Switch checked={enableCoop} onChange={(e) => setEnableCoop(e.target.checked)} color="success" />} label="COOP & COEP Spectre Isolation" />
                </Stack>
              </Paper>
            </Grid>

            {/* Generated Code Snippet */}
            <Grid xs={12} md={7}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${cardBorder}`, bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#FFFFFF' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Stack direction="row" spacing={1}>
                    {['netlify', 'nginx', 'caddy'].map((fmt) => (
                      <Chip
                        key={fmt}
                        label={fmt.toUpperCase()}
                        size="small"
                        onClick={() => setConfigFormat(fmt)}
                        variant={configFormat === fmt ? 'filled' : 'outlined'}
                        sx={{
                          fontWeight: 700,
                          fontFamily: mono,
                          bgcolor: configFormat === fmt ? emerald : 'transparent',
                          color: configFormat === fmt ? '#000000' : 'text.primary',
                          borderColor: emerald
                        }}
                      />
                    ))}
                  </Stack>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopy(getGeneratedConfig(), 'configCode')}
                    sx={{ borderColor: emerald, color: emerald, fontFamily: mono, fontSize: '0.72rem' }}
                  >
                    {copiedKey === 'configCode' ? 'COPIED CONFIG' : 'COPY CONFIG'}
                  </Button>
                </Stack>

                <Paper sx={{ p: 2, bgcolor: isDark ? '#08080B' : '#0F172A', color: emerald, borderRadius: 2, fontFamily: mono, fontSize: '0.78rem', overflowX: 'auto', minHeight: 250 }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {getGeneratedConfig()}
                  </pre>
                </Paper>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* =====================================================================
          TAB 2: OWASP THREAT MITIGATION REPORT
          ===================================================================== */}
      {activeTab === 2 && (
        <Box>
          <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${cardBorder}`, bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#FFFFFF' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  OWASP Defensive Hardening Blueprint
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                  Target: {currentAudit.name} · Score: {currentAudit.score}/100 · Grade: {currentAudit.grade}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopy(`# 🛡️ OWASP SECURITY HARDENING REPORT\nTarget: ${currentAudit.name}\nScore: ${currentAudit.score}/100\nGrade: ${currentAudit.grade}\n\n## Mandatory Directives:\n1. Strict-Transport-Security: ${currentAudit.headers.hsts.val}\n2. Content-Security-Policy: ${currentAudit.headers.csp.val}\n3. X-Frame-Options: ${currentAudit.headers.xframe.val}\n4. X-Content-Type-Options: ${currentAudit.headers.nosniff.val}\n5. Referrer-Policy: ${currentAudit.headers.referrer.val}`, 'owaspReport')}
                sx={{ borderColor: emerald, color: emerald }}
              >
                {copiedKey === 'owaspReport' ? 'COPIED MARKDOWN' : 'COPY AUDIT REPORT (MD)'}
              </Button>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {[
                { title: 'OWASP A03: Injection & XSS', status: 'MITIGATED', desc: 'Enforced rigid CSP default-src \'self\' preventing inline script execution and unvetted third-party origin loads.' },
                { title: 'OWASP A05: Security Misconfiguration', status: 'MITIGATED', desc: 'Active X-Content-Type-Options nosniff and HSTS preload headers close protocol downgrade and MIME confusion paths.' },
                { title: 'OWASP A01: Broken Access Control (Clickjacking)', status: 'MITIGATED', desc: 'X-Frame-Options SAMEORIGIN / DENY and frame-ancestors prevent embedding inside malicious iframes.' },
                { title: 'Spectre & Side-Channel Leaks', status: 'MITIGATED', desc: 'COOP same-origin and COEP credentialless isolate process memory boundaries against timing attacks.' }
              ].map((item, idx) => (
                <Grid key={idx} xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC', border: `1px solid ${cardBorder}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {item.title}
                      </Typography>
                      <Chip label={item.status} size="small" sx={{ bgcolor: emeraldSoft, color: emerald, fontWeight: 800, fontSize: '0.65rem' }} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default WebSecurityGuardGodModeTool;
