import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  Slider,
  Unstable_Grid2 as Grid,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BoltIcon from '@mui/icons-material/Bolt';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const INITIAL_MEMORIES = [
  {
    id: 'mem-01',
    tier: 'Semantic Vault',
    content: 'ZothOS Sovereign Conductor orchestrates 22 local loopback daemons (:8094–:8121, :9393) with <60°C thermal governor.',
    tags: ['zothos', 'conductor', 'daemons', 'thermals'],
    salience: 0.96,
    ageHours: 2.0,
    recalls: 14,
  },
  {
    id: 'mem-02',
    tier: 'Procedural Skill',
    content: 'Aperture Seam route handoff uses cubic-bezier(0.76, 0, 0.24, 1) and gates whileInView entrance animations via useIntroReleased().',
    tags: ['motion', 'aperture', 'choreography', 'react'],
    salience: 0.92,
    ageHours: 6.5,
    recalls: 9,
  },
  {
    id: 'mem-03',
    tier: 'Episodic Trace',
    content: 'Verified studio contact invariant: Neal Frazier (Neal Frazier Tech) • (555) 555-0199 • neal@nealfrazier.tech.',
    tags: ['identity', 'contact', 'invariant', 'nealfrazier'],
    salience: 0.99,
    ageHours: 0.5,
    recalls: 21,
  },
  {
    id: 'mem-04',
    tier: 'Semantic Vault',
    content: 'Hybrid STDP synaptic scoring combines cosine vector similarity (w=0.50), BM25 lexical match (w=0.30), and Ebbinghaus decay (w=0.20).',
    tags: ['stdp', 'memory', 'bm25', 'vector', 'ebbinghaus'],
    salience: 0.89,
    ageHours: 18.0,
    recalls: 6,
  },
  {
    id: 'mem-05',
    tier: 'Working Buffer',
    content: 'Zero-egress air-gap policy blocks external telemetry calls and binds all MCP transports to 127.0.0.1 loopback.',
    tags: ['opsec', 'airgap', 'mcp', 'loopback'],
    salience: 0.85,
    ageHours: 32.0,
    recalls: 4,
  },
];

export default function NeuroMemoryGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [memories, setMemories] = useState(INITIAL_MEMORIES);
  const [query, setQuery] = useState('zothos conductor daemons');
  const [vectorWeight, setVectorWeight] = useState(0.5);
  const [bm25Weight, setBm25Weight] = useState(0.3);
  const [halfLifeHours, setHalfLifeHours] = useState(48);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newMemoryTags, setNewMemoryTags] = useState('sovereign, memory, stdp');

  const canvasRef = useRef(null);

  const rankedMemories = useMemo(() => {
    const tokens = query
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean);
    const temporalWeight = Math.max(0, Number((1 - vectorWeight - bm25Weight).toFixed(2)));

    return memories
      .map((m) => {
        const textLower = `${m.content} ${m.tags.join(' ')}`.toLowerCase();
        let matchCount = 0;
        tokens.forEach((tok) => {
          if (textLower.includes(tok)) matchCount += 1;
        });
        const bm25Score = tokens.length > 0 ? Math.min(1, matchCount / tokens.length) : 0.65;
        const pseudoVecScore = Math.min(
          1,
          m.salience * 0.7 + bm25Score * 0.3
        );
        // Ebbinghaus retention R = exp(-t / S) where S scales with recalls * halfLife
        const stability = halfLifeHours * (1 + Math.log1p(m.recalls) * 0.45);
        const retention = Math.exp(-m.ageHours / Math.max(1, stability));

        const composite =
          pseudoVecScore * vectorWeight +
          bm25Score * bm25Weight +
          retention * temporalWeight;

        return {
          ...m,
          bm25Score: Number((bm25Score * 100).toFixed(1)),
          vecScore: Number((pseudoVecScore * 100).toFixed(1)),
          retention: Number((retention * 100).toFixed(1)),
          composite: Number((composite * 100).toFixed(1)),
        };
      })
      .sort((a, b) => b.composite - a.composite);
  }, [memories, query, vectorWeight, bm25Weight, halfLifeHours]);

  const handlePotentiate = (id) => {
    setMemories((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              recalls: m.recalls + 1,
              ageHours: Math.max(0.1, Number((m.ageHours * 0.5).toFixed(1))),
              salience: Math.min(0.99, Number((m.salience + 0.02).toFixed(2))),
            }
          : m
      )
    );
  };

  const handleAddMemory = () => {
    if (!newMemoryText.trim()) return;
    const tags = newMemoryTags
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    setMemories((prev) => [
      {
        id: `mem-0${prev.length + 1}`,
        tier: 'Semantic Vault',
        content: newMemoryText.trim(),
        tags: tags.length ? tags : ['custom'],
        salience: 0.94,
        ageHours: 0.1,
        recalls: 1,
      },
      ...prev,
    ]);
    setNewMemoryText('');
  };

  // 60fps STDP Synaptic Nebula Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      t += 0.02;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 480;
      const h = canvas.clientHeight || 200;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const nodes = rankedMemories.slice(0, 5).map((m, i, arr) => {
        const angle = (i / arr.length) * Math.PI * 2 + t * 0.25;
        const rad = 52 + (100 - m.composite) * 0.45;
        return {
          ...m,
          x: cx + Math.cos(angle) * rad * 1.45,
          y: cy + Math.sin(angle) * rad * 0.72,
        };
      });

      // Synaptic links
      nodes.forEach((n, idx) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = idx === 0 ? 'rgba(192,132,252,0.65)' : 'rgba(56,189,248,0.25)';
        ctx.lineWidth = idx === 0 ? 2.2 : 1.2;
        ctx.stroke();

        const pulse = (t * 0.65 + idx * 0.2) % 1;
        const px = cx + (n.x - cx) * pulse;
        const py = cy + (n.y - cy) * pulse;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = idx === 0 ? '#C084FC' : '#38BDF8';
        ctx.fill();
      });

      // Central query nucleus
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(192,132,252,0.22)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#C084FC';
      ctx.stroke();
      ctx.fillStyle = '#EDEFF2';
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('QUERY', cx, cy + 3);

      // Memory engram nodes
      nodes.forEach((n, idx) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 13, 0, Math.PI * 2);
        ctx.fillStyle = '#090910';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = idx === 0 ? '#34D399' : '#C084FC';
        ctx.stroke();
        ctx.fillStyle = '#EDEFF2';
        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.fillText(`${Math.round(n.composite)}%`, n.x, n.y + 3);
      });

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [rankedMemories]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 4,
        borderRadius: 3,
        bgcolor: isDark ? 'rgba(10,10,18,0.92)' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(192,132,252,0.35)' : 'rgba(147,51,234,0.28)'}`,
        boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.65)' : '0 12px 32px rgba(15,23,42,0.06)',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
            <Chip
              icon={<PsychologyIcon sx={{ fontSize: '0.95rem !important', color: '#C084FC !important' }} />}
              label="NEURO-MEMORY DAEMON · STDP SYNAPTIC WORKSTATION"
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: 'rgba(192,132,252,0.14)',
                color: '#C084FC',
                border: '1px solid rgba(192,132,252,0.35)',
              }}
            />
            <Chip
              label={`${memories.length} ACTIVE ENGRAMS`}
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: 'rgba(52,211,153,0.14)',
                color: '#34D399',
                border: '1px solid rgba(52,211,153,0.35)',
              }}
            />
          </Stack>
          <Typography variant="h5" sx={{ fontFamily: display, fontWeight: 400 }}>
            Hybrid Vector + BM25 + <span style={{ color: '#C084FC' }}>Ebbinghaus STDP</span> Recall Engine
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Left Column: Query + Weights + Ingest */}
        <Grid xs={12} md={5}>
          <Stack spacing={2.25}>
            <TextField
              fullWidth
              size="small"
              label="Semantic & Lexical Recall Query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.025)' : '#F8FAFC',
                border: '1px solid rgba(192,132,252,0.22)',
              }}
            >
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: '#C084FC', mb: 1.5 }}>
                HYBRID RECALL WEIGHT COEFFICIENTS
              </Typography>
              <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: 'text.secondary' }}>
                Cosine Vector Weight: {(vectorWeight * 100).toFixed(0)}%
              </Typography>
              <Slider
                size="small"
                min={0.1}
                max={0.8}
                step={0.05}
                value={vectorWeight}
                onChange={(_, v) => setVectorWeight(v)}
                sx={{ color: '#C084FC' }}
              />
              <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: 'text.secondary' }}>
                BM25 Lexical Weight: {(bm25Weight * 100).toFixed(0)}%
              </Typography>
              <Slider
                size="small"
                min={0.1}
                max={0.6}
                step={0.05}
                value={bm25Weight}
                onChange={(_, v) => setBm25Weight(v)}
                sx={{ color: '#38BDF8' }}
              />
              <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: 'text.secondary' }}>
                Ebbinghaus Half-Life Stability: {halfLifeHours}h
              </Typography>
              <Slider
                size="small"
                min={6}
                max={168}
                step={6}
                value={halfLifeHours}
                onChange={(_, v) => setHalfLifeHours(v)}
                sx={{ color: '#34D399' }}
              />
            </Box>

            <Box
              sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '1px solid rgba(192,132,252,0.28)',
                bgcolor: '#06060C',
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderBottom: '1px solid rgba(192,132,252,0.18)',
                  bgcolor: 'rgba(192,132,252,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#C084FC', fontWeight: 700 }}>
                  STDP SYNAPTIC CONSOLIDATION LATTICE
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>
                  LIVE 60 FPS
                </Typography>
              </Box>
              <Box component="canvas" ref={canvasRef} sx={{ width: '100%', height: 180, display: 'block' }} />
            </Box>

            {/* Ingest new memory engram */}
            <Box
              sx={{
                p: 1.75,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                border: '1px solid rgba(148,163,184,0.2)',
              }}
            >
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, mb: 1 }}>
                ENCODE NEW MEMORY ENGRAM
              </Typography>
              <Stack spacing={1.25}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter new episodic or semantic observation..."
                  value={newMemoryText}
                  onChange={(e) => setNewMemoryText(e.target.value)}
                />
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Tags"
                    value={newMemoryTags}
                    onChange={(e) => setNewMemoryTags(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAddMemory}
                    sx={{
                      bgcolor: '#C084FC',
                      color: '#08080B',
                      fontFamily: mono,
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Encode
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Grid>

        {/* Right Column: Ranked Memory Engrams */}
        <Grid xs={12} md={7}>
          <Stack spacing={1.5}>
            {rankedMemories.map((m, idx) => (
              <Box
                key={m.id}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: isDark ? 'rgba(255,255,255,0.025)' : '#F8FAFC',
                  border: `1px solid ${
                    idx === 0 ? 'rgba(52,211,153,0.45)' : 'rgba(148,163,184,0.18)'
                  }`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={`#${idx + 1} · ${m.tier.toUpperCase()}`}
                      size="small"
                      sx={{
                        height: 20,
                        fontFamily: mono,
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        bgcolor: idx === 0 ? 'rgba(52,211,153,0.16)' : 'rgba(192,132,252,0.14)',
                        color: idx === 0 ? '#34D399' : '#C084FC',
                      }}
                    />
                    <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary' }}>
                      Age: {m.ageHours}h · Recalls: {m.recalls}
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<BoltIcon />}
                    onClick={() => handlePotentiate(m.id)}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.66rem',
                      py: 0.2,
                      color: '#D4AF37',
                      borderColor: 'rgba(212,175,55,0.4)',
                    }}
                  >
                    STDP Potentiate ({m.composite}%)
                  </Button>
                </Stack>

                <Typography variant="body2" sx={{ mb: 1.25, lineHeight: 1.55 }}>
                  {m.content}
                </Typography>

                <Grid container spacing={1} alignItems="center">
                  <Grid xs={4}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.65rem', color: '#C084FC' }}>
                      Vector: {m.vecScore}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={m.vecScore}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        '& .MuiLinearProgress-bar': { bgcolor: '#C084FC' },
                      }}
                    />
                  </Grid>
                  <Grid xs={4}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.65rem', color: '#38BDF8' }}>
                      BM25: {m.bm25Score}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={m.bm25Score}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        '& .MuiLinearProgress-bar': { bgcolor: '#38BDF8' },
                      }}
                    />
                  </Grid>
                  <Grid xs={4}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.65rem', color: '#34D399' }}>
                      Retention: {m.retention}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={m.retention}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        '& .MuiLinearProgress-bar': { bgcolor: '#34D399' },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
