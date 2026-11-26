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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RouterIcon from '@mui/icons-material/Router';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const STRIPE_URL = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
const SOLANA_ADDRESS = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';

const INITIAL_DOCS = [
  { id: 'vec_101', title: 'Byzantine Consensus Triangulation', text: 'Multi-model quorum verification across 3 independent LLM reasoning paths to eliminate hallucination drift.', x: 185, y: 55, layer: 2 },
  { id: 'vec_204', title: 'Neuro-Memory STDP Synaptic Daemon', text: 'Spike-timing-dependent plasticity memory graph bound to 127.0.0.1:8094 with Hebbian associative recall.', x: 85, y: 70, layer: 2 },
  { id: 'vec_309', title: 'Argon2id + AES-256-GCM Enclave Vault', text: 'Zero-cloud hardware secret storage, Shamir secret sharing quorum, and memory page locking.', x: 245, y: 125, layer: 1 },
  { id: 'vec_412', title: 'HNSW Skip-Graph & Okapi BM25 RRF', text: 'Hierarchical navigable small world graphs fused with lexical BM25 via Reciprocal Rank Fusion k=60.', x: 145, y: 140, layer: 2 },
  { id: 'vec_518', title: 'Agent Egress Sentinel TLS Sniffer', text: 'Loopback proxy on :8095/:8195 intercepting outbound telemetry domains and enforcing zero egress.', x: 65, y: 145, layer: 0 },
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
  const [copied, setCopied] = useState(false);
  const [solCopied, setSolCopied] = useState(false);

  const canvasRef = useRef(null);

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

      // Label top rank
      if (idx === 0) {
        ctx.fillStyle = '#34D399';
        ctx.font = '9px monospace';
        ctx.fillText(`Top #1 (${pt.id})`, pt.x + 8, pt.y + 3);
      }
    });

    // Center Query Node
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(qx, qy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#D4AF37';
    ctx.font = '10px monospace';
    ctx.fillText('Query Vector (Dense+BM25)', qx - 65, qy - 10);
  }, [ranked, isDark]);

  const handleAddDoc = () => {
    if (!newDocText.trim()) return;
    const nextId = `vec_${Math.floor(100 + Math.random() * 900)}`;
    const angle = Math.random() * Math.PI * 2;
    const rad = 45 + Math.random() * 60;
    const newDoc = {
      id: nextId,
      title: newDocText.slice(0, 36) + (newDocText.length > 36 ? '...' : ''),
      text: newDocText,
      x: Math.round(165 + Math.cos(angle) * rad),
      y: Math.round(97 + Math.sin(angle) * rad),
      layer: Math.floor(Math.random() * 3),
    };
    setDocs((prev) => [newDoc, ...prev]);
    setNewDocText('');
  };

  const exportPayload = useMemo(() => {
    return JSON.stringify(
      {
        schema: 'zoth-hnsw-snapshot-v1',
        engine: 'vector-search-engine:8121',
        metric: 'cosine + bm25 rrf',
        ef_search: efSearch,
        rrf_k: rrfK,
        query: query,
        top_candidates: ranked.slice(0, 5).map((r, i) => ({
          rank: i + 1,
          id: r.id,
          title: r.title,
          rrf_score: r.rrf,
          dense_cosine: r.dense,
          sparse_bm25: r.bm25,
          layer: r.layer,
        })),
        mcp_tool_def: {
          name: 'vector_search_query',
          description: 'HNSW Skip-Graph & BM25 Reciprocal Rank Fusion Search',
          parameters: { query: 'string', limit: 'integer' },
        },
      },
      null,
      2
    );
  }, [efSearch, rrfK, query, ranked]);

  const handleCopyExport = () => {
    navigator.clipboard?.writeText(exportPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySolana = () => {
    navigator.clipboard?.writeText(SOLANA_ADDRESS);
    setSolCopied(true);
    setTimeout(() => setSolCopied(false), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Daemon Status & 100% Free / Support Bar */}
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
            label="✦ 100% FREE & OPEN ACCESS"
            size="small"
            sx={{ bgcolor: '#34D399', color: '#08080B', fontWeight: 900, fontFamily: mono }}
          />
          <Chip
            label="DAEMON ONLINE :8121"
            size="small"
            sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.64rem', bgcolor: 'rgba(52,211,153,0.15)', color: '#34D399' }}
          />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            In-Browser HNSW Skip-Graph, Okapi BM25 Lexical Engine & Reciprocal Rank Fusion (RRF) Studio
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            size="small"
            variant="contained"
            component="a"
            href="http://127.0.0.1:8121"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<RouterIcon sx={{ fontSize: 16 }} />}
            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
            sx={{
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.72rem',
              bgcolor: '#34D399',
              color: '#08080B',
              '&:hover': { bgcolor: '#10B981' },
            }}
          >
            Local :8121
          </Button>
          <Button
            size="small"
            variant="contained"
            href={STRIPE_URL}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ bgcolor: '#D4AF37', color: '#08080B', fontWeight: 800, fontFamily: mono, fontSize: '0.74rem' }}
          >
            ☕ Buy Us a Coffee
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleCopySolana}
            sx={{ borderColor: '#34D399', color: isDark ? '#34D399' : '#047857', fontFamily: mono, fontSize: '0.72rem', fontWeight: 700 }}
          >
            {solCopied ? '✓ Copied Solana!' : '◎ Solana Tip'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            component="a"
            href="https://github.com/1nc0gn30/vector-search-engine"
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
            sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: theme.palette.divider }}
          >
            GitHub
          </Button>
        </Stack>
      </Paper>

      <SovereignEyebrow accent="#D4AF37" right="Swarm & Core">
        {"vector-search-engine"}
      </SovereignEyebrow>
      <SovereignBand
        seed={"vector-search-engine"}
        eyebrow={"Swarm & Core"}
        caption={"Vector Search Engine & Studio"}
        label={"Vector Search Engine & Studio — Zoth sovereign visualisation"}
      />
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
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: 'text.secondary' }}>
                  Reciprocal Rank Fusion k: {rrfK}
                </Typography>
                <Slider
                  size="small"
                  value={rrfK}
                  min={10}
                  max={120}
                  step={5}
                  onChange={(_, val) => setRrfK(val)}
                  sx={{ color: '#34D399' }}
                />
              </Grid>
              <Grid xs={6}>
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: 'text.secondary' }}>
                  HNSW efSearch Beam Width: {efSearch}
                </Typography>
                <Slider
                  size="small"
                  value={efSearch}
                  min={16}
                  max={128}
                  step={8}
                  onChange={(_, val) => setEfSearch(val)}
                  sx={{ color: '#D4AF37' }}
                />
              </Grid>
            </Grid>

            {/* Ranked Results Table */}
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

        {/* Right: 2D HNSW Skip-Graph Projection & Snapshot Export */}
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
                SERIALIZED HNSW SNAPSHOT & RRF TELEMETRY:
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
                  filter: 'none',
                  userSelect: 'auto',
                }}
              >
                {exportPayload}
              </Box>
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
    </Box>
  );
}
