import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Unstable_Grid2 as Grid,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LaunchIcon from '@mui/icons-material/Launch';
import TableViewIcon from '@mui/icons-material/TableView';
import CalculateIcon from '@mui/icons-material/Calculate';
import CodeIcon from '@mui/icons-material/Code';
import TerminalIcon from '@mui/icons-material/Terminal';

import {
  CITY_DESK_VERSION,
  CITY_DESK_LOCAL_API,
  CANONICAL_TRADES,
  CANONICAL_CITIES,
  DISPATCH_MULTIPLIERS,
  calculateWrittenQuote,
  buildPreviewPath,
  synthesizeStandaloneHtml,
  buildOffersManifest,
  exportOffersCsv,
} from '../../lib/cityDeskEngine.js';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function CityDeskGodModeTool() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const tokens = useMemo(
    () => ({
      surface: isLight ? '#FFFFFF' : '#0E1017',
      subtle: isLight ? '#F3EFE6' : '#141824',
      codeBg: isLight ? '#F6F2E9' : '#090B12',
      ink: isLight ? '#101828' : '#F5F5F7',
      secondary: isLight ? '#475467' : '#B4BCC9',
      accent: isLight ? '#9A6F0B' : '#F5D77F',
      accentSolidBg: isLight ? '#101828' : '#D4AF37',
      accentSolidInk: isLight ? '#FFFFFF' : '#08080B',
      emerald: isLight ? '#047857' : '#6EE7B7',
      emeraldBg: isLight ? '#DCFCE7' : 'rgba(16, 185, 129, 0.16)',
      border: isLight ? 'rgba(16, 24, 40, 0.14)' : 'rgba(255, 255, 255, 0.12)',
      accentBorder: isLight ? 'rgba(154, 111, 11, 0.35)' : 'rgba(212, 175, 55, 0.35)',
    }),
    [isLight]
  );

  const [tab, setTab] = useState(0);
  const [tradeSlug, setTradeSlug] = useState('painters');
  const [citySlug, setCitySlug] = useState('boise-id');
  const [bizName, setBizName] = useState('Apex Craftsman');
  const [bizPhone, setBizPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [scopeIdx, setScopeIdx] = useState(0);
  const [dispatchId, setDispatchId] = useState('standard');
  const [matrixFilter, setMatrixFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [copiedKey, setCopiedKey] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [daemonState, setDaemonState] = useState({ online: false, version: null, pages: 1000 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const h = window.location.hostname;
    if (h !== '127.0.0.1' && h !== 'localhost') return;
    let active = true;
    const ctrl = new AbortController();
    fetch('/api/studio/tool/wake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'city-desk', repo: 'city-desk', port: 8087, probeOnly: true }),
      signal: ctrl.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((probe) => {
        if (!active || !probe || !probe.online) return null;
        return fetch(`${CITY_DESK_LOCAL_API}/health`, { signal: ctrl.signal })
          .then((r) => (r.ok ? r.json() : null));
      })
      .then((data) => {
        if (active && data && data.status === 'ok') {
          setDaemonState({
            online: true,
            version: data.version || CITY_DESK_VERSION,
            pages: data.total_pages || 1000,
          });
        }
      })
      .catch(() => {
        if (active) setDaemonState({ online: false, version: null, pages: 1000 });
      });
    return () => {
      active = false;
      ctrl.abort();
    };
  }, []);

  const selectedTrade = useMemo(
    () => CANONICAL_TRADES.find((t) => t.slug === tradeSlug) || CANONICAL_TRADES[0],
    [tradeSlug]
  );
  const selectedCity = useMemo(
    () => CANONICAL_CITIES.find((c) => c.slug === citySlug) || CANONICAL_CITIES[0],
    [citySlug]
  );
  const selectedDispatch = useMemo(
    () => DISPATCH_MULTIPLIERS.find((d) => d.id === dispatchId) || DISPATCH_MULTIPLIERS[0],
    [dispatchId]
  );

  const quote = useMemo(
    () => calculateWrittenQuote(selectedTrade.slug, scopeIdx, selectedDispatch.mult),
    [selectedTrade.slug, scopeIdx, selectedDispatch.mult]
  );

  const standaloneHtml = useMemo(
    () =>
      synthesizeStandaloneHtml({
        tradeSlug: selectedTrade.slug,
        citySlug: selectedCity.slug,
        biz: bizName,
        phone: bizPhone,
        email: bizEmail,
      }),
    [selectedTrade.slug, selectedCity.slug, bizName, bizPhone, bizEmail]
  );

  const previewPath = useMemo(
    () =>
      buildPreviewPath(selectedCity.slug, selectedTrade.slug, {
        biz: bizName,
        phone: bizPhone,
        email: bizEmail,
      }),
    [selectedCity.slug, selectedTrade.slug, bizName, bizPhone, bizEmail]
  );

  const allOffers = useMemo(() => buildOffersManifest(), []);
  const allStates = useMemo(
    () => ['ALL', ...Array.from(new Set(CANONICAL_CITIES.map((c) => c.state))).sort()],
    []
  );

  const filteredOffers = useMemo(() => {
    const q = matrixFilter.trim().toLowerCase();
    return allOffers.filter((o) => {
      if (stateFilter !== 'ALL' && o.state !== stateFilter) return false;
      if (!q) return true;
      return (
        o.city.toLowerCase().includes(q) ||
        o.state.toLowerCase().includes(q) ||
        o.service.toLowerCase().includes(q) ||
        o.service_name.toLowerCase().includes(q)
      );
    });
  }, [allOffers, matrixFilter, stateFilter]);

  const handleCopy = useCallback((key, text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    setStatusMessage(`Copied ${key} to clipboard.`);
    setTimeout(() => setCopiedKey(''), 1800);
  }, []);

  const handleDownloadHtml = useCallback(() => {
    const safeSlug = (bizName || selectedTrade.slug)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    downloadTextFile(
      `${safeSlug || 'city-desk'}-${selectedCity.slug}-${selectedTrade.slug}.html`,
      standaloneHtml,
      'text/html;charset=utf-8'
    );
    setStatusMessage(`Exported standalone HTML for ${selectedTrade.name} in ${selectedCity.name}, ${selectedCity.state}.`);
  }, [bizName, selectedCity, selectedTrade, standaloneHtml]);

  const handleDownloadOffersJson = useCallback(() => {
    downloadTextFile('city-desk-offers.json', JSON.stringify(allOffers, null, 2) + '\n', 'application/json;charset=utf-8');
    setStatusMessage('Exported canonical 1,000-page offers.json manifest.');
  }, [allOffers]);

  const handleDownloadCsv = useCallback(() => {
    downloadTextFile('city-desk-offers.csv', exportOffersCsv(allOffers), 'text/csv;charset=utf-8');
    setStatusMessage('Exported 1,000-row city-desk-offers.csv.');
  }, [allOffers]);

  const liveBridgeHref = daemonState.online
    ? `${CITY_DESK_LOCAL_API}${previewPath}`
    : `https://city-desk.netlify.app${previewPath}`;

  return (
    <Box
      data-testid="city-desk-workstation"
      sx={{
        width: '100%',
        color: tokens.ink,
      }}
    >
      {/* Top Status & Bridge Strip */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2.5,
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderTop: `3px solid ${tokens.accent}`,
          borderRadius: 2.5,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
              <Chip
                label={`CITY DESK v${CITY_DESK_VERSION}`}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: tokens.subtle,
                  color: tokens.accent,
                  border: `1px solid ${tokens.accentBorder}`,
                }}
              />
              <Chip
                label={daemonState.online ? `LIVE :8087 BRIDGE (${daemonState.pages} PAGES)` : 'OFFLINE IN-BROWSER ENGINE (1,000 PAGES)'}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: tokens.emeraldBg,
                  color: tokens.emerald,
                }}
              />
              <Chip
                label="20 TRADES × 50 US CITIES"
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: tokens.subtle,
                  color: tokens.ink,
                  border: `1px solid ${tokens.border}`,
                }}
              />
            </Stack>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: tokens.ink,
                lineHeight: 1.25,
                wordBreak: 'break-word',
              }}
            >
              Local Trade Offer Page Compiler &amp; Standalone HTML Synthesizer
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.secondary, mt: 0.5 }}>
              Deterministic single-page HTML + Schema.org JSON-LD generator, 60-second written quote estimator, and 1,000-route catalog exporter. Runs 100% client-side even when <code>127.0.0.1:8087</code> is idle.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', md: 'auto' }, flexShrink: 0 }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadHtml}
              sx={{
                minHeight: 44,
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: tokens.accentSolidBg,
                color: tokens.accentSolidInk,
                '&:hover': { bgcolor: tokens.accentSolidBg, opacity: 0.92 },
              }}
            >
              Export Standalone HTML
            </Button>
            <Button
              variant="outlined"
              endIcon={<LaunchIcon />}
              href={liveBridgeHref}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                minHeight: 44,
                fontWeight: 600,
                textTransform: 'none',
                borderColor: tokens.border,
                color: tokens.ink,
              }}
            >
              {daemonState.online ? 'Open :8087 Page' : 'Open Live Spec'}
            </Button>
          </Stack>
        </Stack>

        {statusMessage && (
          <Typography
            role="status"
            aria-live="polite"
            sx={{
              mt: 1.5,
              px: 1.5,
              py: 0.75,
              borderRadius: 1.5,
              fontFamily: mono,
              fontSize: '0.78rem',
              bgcolor: tokens.emeraldBg,
              color: tokens.emerald,
            }}
          >
            {statusMessage}
          </Typography>
        )}
      </Paper>

      {/* Responsive Tabs */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: 2.5,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="City Desk workstation views"
          sx={{
            borderBottom: `1px solid ${tokens.border}`,
            bgcolor: tokens.subtle,
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 700,
              color: tokens.secondary,
              '&.Mui-selected': { color: tokens.accent },
            },
            '& .MuiTabs-indicator': { backgroundColor: tokens.accent },
          }}
        >
          <Tab icon={<CodeIcon fontSize="small" />} iconPosition="start" label="Offer Page Synthesizer" />
          <Tab icon={<TableViewIcon fontSize="small" />} iconPosition="start" label="20 Trades × 50 Cities Matrix" />
          <Tab icon={<CalculateIcon fontSize="small" />} iconPosition="start" label="60s Written Price Estimator" />
          <Tab icon={<TerminalIcon fontSize="small" />} iconPosition="start" label="Export & CLI Reference" />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* TAB 0: OFFER PAGE SYNTHESIZER */}
          {tab === 0 && (
            <Grid container spacing={2.5}>
              <Grid xs={12} md={5}>
                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="cd-trade-label">Canonical Trade (20)</InputLabel>
                    <Select
                      labelId="cd-trade-label"
                      label="Canonical Trade (20)"
                      value={tradeSlug}
                      onChange={(e) => {
                        setTradeSlug(e.target.value);
                        setScopeIdx(0);
                      }}
                    >
                      {CANONICAL_TRADES.map((t) => (
                        <MenuItem key={t.slug} value={t.slug}>
                          {t.name} (${t.price.toLocaleString('en-US')})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel id="cd-city-label">Target US City (50)</InputLabel>
                    <Select
                      labelId="cd-city-label"
                      label="Target US City (50)"
                      value={citySlug}
                      onChange={(e) => setCitySlug(e.target.value)}
                    >
                      {CANONICAL_CITIES.map((c) => (
                        <MenuItem key={c.slug} value={c.slug}>
                          {c.name}, {c.state}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Owner Business Name"
                    size="small"
                    fullWidth
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    placeholder="Your business name"
                  />

                  <TextField
                    label="Business Phone (optional — stays blank by default)"
                    size="small"
                    fullWidth
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                    placeholder="Your business phone"
                  />

                  <TextField
                    label="Owner Email (optional)"
                    size="small"
                    fullWidth
                    value={bizEmail}
                    onChange={(e) => setBizEmail(e.target.value)}
                    placeholder="owner@yourdomain.com"
                  />

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: tokens.subtle,
                      border: `1px solid ${tokens.border}`,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontFamily: mono, color: tokens.accent, fontWeight: 700, display: 'block', mb: 0.5 }}>
                      ROUTE &amp; REFERENCE VALUATION
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: mono, color: tokens.ink, wordBreak: 'break-all', mb: 1 }}>
                      {previewPath}
                    </Typography>
                    <Typography variant="body2" sx={{ color: tokens.secondary }}>
                      Page valuation anchor: <strong>${selectedTrade.price.toLocaleString('en-US')}</strong> · Standalone export: <strong>$0 Free</strong>
                    </Typography>
                  </Paper>
                </Stack>
              </Grid>

              <Grid xs={12} md={7}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: tokens.subtle,
                    border: `1px solid ${tokens.border}`,
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: tokens.accent }}>
                      LIVE PAGE PREVIEW SPEC
                    </Typography>
                    <Chip
                      label={`${selectedTrade.name} · ${selectedCity.name}, ${selectedCity.state}`}
                      size="small"
                      sx={{ fontFamily: mono, fontSize: '0.72rem', bgcolor: tokens.surface, color: tokens.ink, border: `1px solid ${tokens.border}` }}
                    />
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: tokens.ink, mb: 0.75 }}>
                    {selectedTrade.name} in {selectedCity.name}, {selectedCity.state} — Written Price Upfront
                  </Typography>
                  <Typography variant="body2" sx={{ color: tokens.secondary, mb: 1.5 }}>
                    {selectedTrade.line}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {selectedTrade.scopes.map((sc) => (
                      <Chip
                        key={sc}
                        label={sc}
                        size="small"
                        sx={{ bgcolor: tokens.surface, color: tokens.ink, border: `1px solid ${tokens.border}` }}
                      />
                    ))}
                  </Stack>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: tokens.codeBg,
                    border: `1px solid ${tokens.border}`,
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: tokens.accent }}>
                      ESCAPED STANDALONE HTML + SCHEMA.ORG JSON-LD ({standaloneHtml.length.toLocaleString('en-US')} B)
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={copiedKey === 'HTML' ? <CheckIcon /> : <ContentCopyIcon />}
                        onClick={() => handleCopy('HTML', standaloneHtml)}
                        sx={{ minHeight: 38, textTransform: 'none', color: tokens.ink, borderColor: tokens.border }}
                      >
                        {copiedKey === 'HTML' ? 'Copied' : 'Copy HTML'}
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadHtml}
                        sx={{
                          minHeight: 38,
                          textTransform: 'none',
                          bgcolor: tokens.accentSolidBg,
                          color: tokens.accentSolidInk,
                          '&:hover': { bgcolor: tokens.accentSolidBg, opacity: 0.92 },
                        }}
                      >
                        .html
                      </Button>
                    </Stack>
                  </Stack>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 1.5,
                      maxHeight: 280,
                      overflow: 'auto',
                      fontFamily: mono,
                      fontSize: '0.75rem',
                      lineHeight: 1.55,
                      color: tokens.ink,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      borderRadius: 1.5,
                      border: `1px solid ${tokens.border}`,
                      bgcolor: tokens.surface,
                    }}
                  >
                    {standaloneHtml}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* TAB 1: 20 TRADES x 50 CITIES MATRIX */}
          {tab === 1 && (
            <Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                <TextField
                  size="small"
                  label="Filter city, state, or trade"
                  value={matrixFilter}
                  onChange={(e) => setMatrixFilter(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel id="cd-state-filter-label">State</InputLabel>
                  <Select
                    labelId="cd-state-filter-label"
                    label="State"
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                  >
                    {allStates.map((st) => (
                      <MenuItem key={st} value={st}>
                        {st === 'ALL' ? 'All States (30)' : st}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadOffersJson}
                  sx={{ minHeight: 44, textTransform: 'none', borderColor: tokens.border, color: tokens.ink }}
                >
                  offers.json ({allOffers.length})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadCsv}
                  sx={{ minHeight: 44, textTransform: 'none', borderColor: tokens.border, color: tokens.ink }}
                >
                  Export CSV
                </Button>
              </Stack>

              <Typography variant="body2" sx={{ color: tokens.secondary, mb: 1.5 }}>
                Showing {Math.min(filteredOffers.length, 60)} of <strong>{filteredOffers.length}</strong> matching compiled pages (select any row to load it into the synthesizer):
              </Typography>

              <Grid container spacing={1.25}>
                {filteredOffers.slice(0, 60).map((offer) => (
                  <Grid xs={12} sm={6} md={4} key={offer.path}>
                    <Paper
                      elevation={0}
                      onClick={() => {
                        setCitySlug(offer.city_slug);
                        setTradeSlug(offer.service);
                        setTab(0);
                        setStatusMessage(`Loaded ${offer.service_name} in ${offer.city}, ${offer.state}.`);
                      }}
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        bgcolor: tokens.subtle,
                        border: `1px solid ${tokens.border}`,
                        borderRadius: 2,
                        '&:hover': { borderColor: tokens.accent },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: tokens.ink }}>
                          {offer.service_name}
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: tokens.accent }}>
                          ${offer.price.toLocaleString('en-US')}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: tokens.secondary, fontSize: '0.82rem' }}>
                        {offer.city}, {offer.state}
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: tokens.secondary, display: 'block', mt: 0.5, wordBreak: 'break-all' }}>
                        {offer.path}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* TAB 2: 60s WRITTEN PRICE ESTIMATOR */}
          {tab === 2 && (
            <Grid container spacing={2.5} alignItems="stretch">
              <Grid xs={12} md={6}>
                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="est-trade-label">Trade Category</InputLabel>
                    <Select
                      labelId="est-trade-label"
                      label="Trade Category"
                      value={tradeSlug}
                      onChange={(e) => {
                        setTradeSlug(e.target.value);
                        setScopeIdx(0);
                      }}
                    >
                      {CANONICAL_TRADES.map((t) => (
                        <MenuItem key={t.slug} value={t.slug}>
                          {t.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel id="est-scope-label">Job Scope</InputLabel>
                    <Select
                      labelId="est-scope-label"
                      label="Job Scope"
                      value={scopeIdx}
                      onChange={(e) => setScopeIdx(Number(e.target.value))}
                    >
                      {selectedTrade.scopes.map((sc, idx) => (
                        <MenuItem key={sc} value={idx}>
                          0{idx + 1} · {sc}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel id="est-dispatch-label">Dispatch &amp; Size Multiplier</InputLabel>
                    <Select
                      labelId="est-dispatch-label"
                      label="Dispatch & Size Multiplier"
                      value={dispatchId}
                      onChange={(e) => setDispatchId(e.target.value)}
                    >
                      {DISPATCH_MULTIPLIERS.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.label} ({d.mult}×)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>

              <Grid xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: '100%',
                    bgcolor: tokens.subtle,
                    border: `1px solid ${tokens.border}`,
                    borderLeft: `4px solid ${tokens.accent}`,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: tokens.accent }}>
                      WRITTEN BALLPARK LEDGER · {selectedCity.name.toUpperCase()}, {selectedCity.state}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: tokens.ink, my: 1 }}>
                      {quote.formatted}
                    </Typography>
                    <Typography variant="body2" sx={{ color: tokens.secondary }}>
                      Scope: <strong>{quote.scopeName}</strong> ({quote.tradeName}) · {selectedDispatch.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: tokens.secondary, mt: 1 }}>
                      Final written price is confirmed by the local contractor before work begins. Zero ads, zero fabricated reviews, zero rank claims.
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2, borderColor: tokens.border }} />
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadHtml}
                    sx={{
                      minHeight: 44,
                      fontWeight: 700,
                      textTransform: 'none',
                      bgcolor: tokens.accentSolidBg,
                      color: tokens.accentSolidInk,
                      '&:hover': { bgcolor: tokens.accentSolidBg, opacity: 0.92 },
                    }}
                  >
                    Download Personalized Page with Estimator
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* TAB 3: EXPORT & CLI REFERENCE */}
          {tab === 3 && (
            <Grid container spacing={2.5}>
              <Grid xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: tokens.subtle,
                    border: `1px solid ${tokens.border}`,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 700, color: tokens.accent, mb: 1.5 }}>
                    ZOTHOS CLI &amp; LOOPBACK SERVER (:8087)
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 1.5,
                      fontFamily: mono,
                      fontSize: '0.78rem',
                      lineHeight: 1.6,
                      color: tokens.ink,
                      bgcolor: tokens.codeBg,
                      borderRadius: 1.5,
                      border: `1px solid ${tokens.border}`,
                      overflowX: 'auto',
                    }}
                  >
{`# Compile all 1,000 pages + legal + JSON discovery
city-desk --build

# Start hardened 127.0.0.1:8087 server (on-demand)
city-desk --serve

# Inspect live catalog, health & TUI inventory
city-desk --status --json
city-desk --trades --json
city-desk --cities --json
city-desk-tui --json`}
                  </Box>
                </Paper>
              </Grid>

              <Grid xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: tokens.subtle,
                    border: `1px solid ${tokens.border}`,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 700, color: tokens.accent, mb: 1.5 }}>
                    HARDENED REST API &amp; BUNDLE EXPORTS
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: tokens.secondary }}>
                      • <code>GET /health</code> — live version (<code>2.6.0</code>), uptime, 20 trades, 50 cities, 1,000 pages
                    </Typography>
                    <Typography variant="body2" sx={{ color: tokens.secondary }}>
                      • <code>GET /api/trades</code>, <code>/api/cities</code>, <code>/api/offers</code> — dynamic JSON parity with <code>site/</code>
                    </Typography>
                    <Typography variant="body2" sx={{ color: tokens.secondary }}>
                      • <code>POST /api/synth</code> — validated, URL-encoded preview URL generator
                    </Typography>
                    <Typography variant="body2" sx={{ color: tokens.secondary }}>
                      • <code>POST /api/lead</code> — validated lead receipt logger (1 MiB cap, strict Host/Origin)
                    </Typography>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadOffersJson}
                      sx={{
                        minHeight: 44,
                        textTransform: 'none',
                        bgcolor: tokens.accentSolidBg,
                        color: tokens.accentSolidInk,
                        '&:hover': { bgcolor: tokens.accentSolidBg, opacity: 0.92 },
                      }}
                    >
                      Download offers.json
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadCsv}
                      sx={{ minHeight: 44, textTransform: 'none', borderColor: tokens.border, color: tokens.ink }}
                    >
                      Download CSV
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
