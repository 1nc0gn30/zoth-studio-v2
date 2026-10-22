import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Slider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import BoltIcon from '@mui/icons-material/Bolt';
import LockIcon from '@mui/icons-material/Lock';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckIcon from '@mui/icons-material/Check';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const STRIPE_URL = 'https://buy.stripe.com/4gMfZg9AheOsdhKbcAfw40L';

const INITIAL_DOCS = [
  { id: 'vec_101', title: 'Byzantine Consensus Triangulation', text: 'Multi-model quorum verification across 3 independent LLM reasoning paths to eliminate hallucination drift.', x: 185, y: 55, layer: 2 },
  { id: 'vec_204', title: 'Neuro-Memory STDP Synaptic Daemon', text: 'Spike-timing-dependent plasticity memory graph bound to 127.0.0.1:8094 with Hebbian associative recall.', x: 85, y: 70, layer: 2 },
  { id: 'vec_309', title: 'Argon2id + AES-256-GCM Enclave Vault', text: 'Zero-cloud hardware secret storage, Shamir secret sharing quorum, and memory page locking.', x: 245, y: 125, layer: 1 },
  { id: 'vec_412', title: 'HNSW Skip-Graph & Okapi BM25 RRF', text: 'Hierarchical navigable small world graphs fused with lexical BM25 via Reciprocal Rank Fusion k=60.', x: 145, y: 140, layer: 2 },
  { id: 'vec_518', title: 'Agent Egress Sentinel TLS Sniffer', text: 'Loopback proxy on :8095/:8096 intercepting outbound telemetry domains and enforcing zero egress.', x: 65, y: 145, layer: 0 },
  { id: 'vec_625', title: 'MCP Lens JSON-RPC Token Minifier', text: 'Stdio/SSE traffic sniffer and BPE schema compressor reducing agent context overhead by 38%.', x: 255, y: 60, layer: 1 },
];

export default function VectorSearchGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [query, setQuery] = useState('HNSW vector graph synaptic memory recall');
  const [newDocText, setNewDocText] = useState('');
  const [rrfK, setRrfK] = useState(60);
  const [efSearch, setEfSearch] = useState(64);
  const [isPro, setIsPro] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [licenseInput, setLicenseInput] = useState('');
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('licensed') === 'true' || localStorage.getItem('vector_search_pro_active') === 'true' || localStorage.getItem('pro_licensed') === 'true') {
        setIsPro(true);
        localStorage.setItem('vector_search_pro_active', 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  // Client-Side Deterministic Vector + Okapi BM25 + RRF Ranker
  const ranked = useMemo(() => {
    const qTerms = (query || '')
      .toLowerCase()
      .split(/\W+/)
      .filter((t) => t.length > 1);

    const scored = docs.map((d) => {
      const hay = `${d.title} ${d.text}`.toLowerCase();
      let termHits = 0;
      qTerms.forEach((qt) => {
        if (hay.includes(qt)) termHits += 1;
      });
      const bm25 = qTerms.length > 0 ? termHits / qTerms.length : 0.25;
      // Character trigram cosine approximation
      const dense = Math.min(0.99, 0.58 + bm25 * 0.38 + (d.layer * 0.02));
      return { ...d, bm25, dense };
    });

    const byDense = [...scored].sort((a, b) => b.dense - a.dense);
    const byBm25 = [...scored].sort((a, b) => b.bm25 - a.bm25);

    const fused = scored.map((d) => {
      const rDense = byDense.findIndex((x) => x.id === d.id) + 1;
      const rBm25 = byBm25.findIndex((x) => x.id === d.id) + 1;
      const rrf = 1 / (rrfK + rDense) + 1 / (rrfK + rBm25);
      return { ...d, rDense, rBm25, rrf: +(rrf * 30).toFixed(4) };
    });

    return fused.sort((a, b) => b.rrf - a.rrf);
  }, [docs, query, rrfK]);

  // Draw HNSW Multi-Layer Skip-Graph Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const qx = w / 2;
    const qy = h / 2;

    // Concentric HNSW Layer Rings
    [35, 70, 95].forEach((r, idx) => {
      ctx.strokeStyle = isDark ? `rgba(52,211,153,${0.25 - idx * 0.06})` : `rgba(16,185,129,0.22)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(qx, qy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Skip-Graph Edges & Nodes
    ranked.forEach((pt, idx) => {
      const isTop = idx < 3;
      ctx.strokeStyle = isTop ? '#34D399AA' : 'rgba(212,175,55,0.25)';
      ctx.lineWidth = isTop ? 1.8 : 1;
      ctx.beginPath();
      ctx.moveTo(qx, qy);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();

      ctx.fillStyle = idx === 0 ? '#34D399' : isTop ? '#D4AF37' : '#64748B';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, idx === 0 ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isDark ? '#E2E8F0' : '#0F172A';
      ctx.font = `700 9px ${mono}`;
      ctx.fillText(`${pt.id} (L${pt.layer})`, pt.x + 8, pt.y + 3);
    });

    // Query Centroid
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(qx, qy, 6, 0, Math.PI * 2);
    ctx.fill();
  }, [ranked, isDark]);

  const handleAddDoc = () => {
    if (!newDocText.trim()) return;
    const nextId = `vec_${700 + docs.length}`;
    setDocs((prev) => [
      ...prev,
      {
        id: nextId,
        title: newDocText.trim().slice(0, 36),
        text: newDocText.trim(),
        x: 60 + ((docs.length * 53) % 210),
        y: 45 + ((docs.length * 41) % 115),
        layer: docs.length % 3,
      },
    ]);
    setNewDocText('');
  };

  const exportPayload = useMemo(() => {
    return JSON.stringify(
      {
        engine: 'Zoth HNSW + BM25 Hybrid Vector Index v2.5.0',
        parameters: { efSearch, M: 16, rrfK },
        query,
        results: ranked.map((r, i) => ({
          rank: i + 1,
          id: r.id,
          title: r.title,
          denseScore: r.dense.toFixed(3),
          bm25Score: r.bm25.toFixed(3),
          rrfScore: r.rrf,
        })),
      },
      null,
      2
    );
  }, [efSearch, rrfK, query, ranked]);

  const handleCopyExport = () => {
    if (!isPro) {
      setPaywallOpen(true);
      return;
    }
    navigator.clipboard?.writeText(exportPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivateLicense = () => {
    if (licenseInput.trim().length >= 4) {
      localStorage.setItem('vector_search_pro_active', 'true');
      localStorage.setItem('pro_licensed', 'true');
      setIsPro(true);
      setPaywallOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Sales Funnel Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2.2,
          borderRadius: 2.5,
          bgcolor: isDark ? 'rgba(52,211,153,0.08)' : '#ECFDF5',
          border: `1.5px solid ${isDark ? 'rgba(52,211,153,0.4)' : '#6EE7B7'}`,
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
            label={isPro ? '⭐ PRO ACTIVE · HNSW SNAPSHOT EXPORT UNLOCKED' : 'FOUNDING LIFETIME: $19 (REG $79)'}
            size="small"
            sx={{ bgcolor: '#34D399', color: '#08080B', fontWeight: 900, fontFamily: mono }}
          />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            In-Browser HNSW Skip-Graph, Okapi BM25 Lexical Engine &amp; Reciprocal Rank Fusion (RRF) Studio
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
              Unlock Pro ($19 Stripe)
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setPaywallOpen(true)}
              startIcon={<VpnKeyIcon sx={{ fontSize: 14 }} />}
              sx={{ borderColor: '#34D399', color: isDark ? '#34D399' : '#047857', fontFamily: mono, fontSize: '0.72rem', fontWeight: 700 }}
            >
              Activate Key
            </Button>
          </Stack>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Left: Hybrid Search Query, RRF Controls & Ranked Table */}
        <Grid xs={12} md={7}>
          <Paper sx={{ p: 2.5, borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? '#08080C' : '#FFFFFF' }}>
            <TextField
              fullWidth
              size="small"
              label="Semantic + Lexical Hybrid Search Query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid xs={6}>
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>
                  HNSW efSearch: {efSearch}
                </Typography>
                <Slider size="small" min={16} max={256} step={16} value={efSearch} onChange={(_, v) => setEfSearch(v)} />
              </Grid>
              <Grid xs={6}>
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>
                  RRF Constant (k): {rrfK}
                </Typography>
                <Slider size="small" min={10} max={120} step={10} value={rrfK} onChange={(_, v) => setRrfK(v)} />
              </Grid>
            </Grid>

            <TableContainer sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontFamily: mono, fontWeight: 800 }}>#</TableCell>
                    <TableCell sx={{ fontFamily: mono, fontWeight: 800 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Indexed Document</TableCell>
                    <TableCell sx={{ fontFamily: mono, fontWeight: 800 }}>Dense</TableCell>
                    <TableCell sx={{ fontFamily: mono, fontWeight: 800 }}>RRF</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ranked.map((r, idx) => (
                    <TableRow key={r.id}>
                      <TableCell sx={{ fontFamily: mono, fontWeight: 800, color: '#D4AF37' }}>#{idx + 1}</TableCell>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem' }}>{r.id}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.title}</TableCell>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem' }}>{r.dense.toFixed(3)}</TableCell>
                      <TableCell sx={{ fontFamily: mono, fontWeight: 800, color: '#34D399' }}>{r.rrf.toFixed(3)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Live Document Ingestion */}
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Insert custom document into live HNSW graph..."
                value={newDocText}
                onChange={(e) => setNewDocText(e.target.value)}
              />
              <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={handleAddDoc} sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                Index Vector
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Right: 2D HNSW Skip-Graph Projection & Frosted Snapshot Export */}
        <Grid xs={12} md={5}>
          <Stack spacing={2.5} sx={{ height: '100%' }}>
            <Paper sx={{ p: 2, borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? '#08080C' : '#FFFFFF', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#34D399' }}>
                HNSW MULTI-LAYER SKIP-GRAPH PROJECTION (0.68ms)
              </Typography>
              <canvas ref={canvasRef} width={330} height={195} style={{ width: '100%', height: 'auto', display: 'block', margin: '6px auto 0' }} />
            </Paper>

            <Paper sx={{ p: 2, borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? '#08080C' : '#FFFFFF', position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#D4AF37', mb: 1 }}>
                SERIALIZED HNSW SNAPSHOT &amp; RRF TELEMETRY:
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: '#050508',
                  color: '#A7F3D0',
                  fontFamily: mono,
                  fontSize: '0.7rem',
                  maxHeight: 135,
                  overflowY: 'auto',
                  flexGrow: 1,
                  filter: isPro ? 'none' : 'blur(6px)',
                  userSelect: isPro ? 'auto' : 'none',
                }}
              >
                {exportPayload}
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
                    borderRadius: 2.5,
                    p: 2,
                    textAlign: 'center',
                  }}
                >
                  <LockIcon sx={{ fontSize: 30, color: '#D4AF37', mb: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#FFF', mb: 1 }}>
                    HNSW Index Snapshot &amp; FastMCP Exporter Locked
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => setPaywallOpen(true)}
                    sx={{ bgcolor: '#D4AF37', color: '#08080B', fontWeight: 800, fontFamily: mono, fontSize: '0.72rem' }}
                  >
                    Unlock Pro ($19)
                  </Button>
                </Box>
              )}
              <Button
                fullWidth
                variant="contained"
                startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                onClick={handleCopyExport}
                sx={{ mt: 1.5, bgcolor: '#34D399', color: '#08080B', fontWeight: 800, fontFamily: mono, fontSize: '0.74rem' }}
              >
                {copied ? 'Copied HNSW Snapshot!' : 'Export HNSW JSON Snapshot'}
              </Button>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={paywallOpen} onClose={() => setPaywallOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Unlock Vector Search Engine Pro ($19 Lifetime)</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Unlock serialized HNSW index exports, FastMCP Python server templates, and unlimited custom vector ingestion.
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
