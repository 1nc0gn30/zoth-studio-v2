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
import ShareIcon from '@mui/icons-material/Share';
import BoltIcon from '@mui/icons-material/Bolt';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckIcon from '@mui/icons-material/Check';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const STRIPE_URL = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';

const DEFAULT_ESSAY = `Why modern AI agents fail in production: 90% of context bloat comes from unminified MCP tool schemas and cloud telemetry round-trips.

We built Zoth Studio v2 and ZothOS v3.4.0 to run 77 sovereign developer tools 100% locally on 127.0.0.1 loopback sockets and WebGPU shaders.

1. Zero Cloud Egress: Every AST parser, Shannon entropy analyzer, and HNSW vector index runs directly inside your browser or bare-metal Linux enclave.

2. Tri-Agent Sovereign Conductor: Dispatch tasks across Hermes Agent, Grok CLI, and local Ollama 1.5B with automatic <60°C laptop thermal throttling.

3. Try all 43 workstations live: https://zoth.nullai.tech`;

export default function OmniPostSocialGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [rawContent, setRawContent] = useState(DEFAULT_ESSAY);
  const [platformTab, setPlatformTab] = useState(0); // 0: X Thread, 1: LinkedIn, 2: Bluesky, 3: MCP Payload
  const [copied, setCopied] = useState(false);

  // Real Client-Side Thread Splitter & Virality Scorer
  const analysis = useMemo(() => {
    const paragraphs = rawContent
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    // Split into X posts <= 265 chars
    const tweets = [];
    paragraphs.forEach((p) => {
      if (p.length <= 260) {
        tweets.push(p);
      } else {
        const sentences = p.match(/[^.!?]+[.!?]+/g) || [p];
        let buf = '';
        sentences.forEach((s) => {
          if ((buf + ' ' + s).trim().length <= 260) {
            buf = (buf + ' ' + s).trim();
          } else {
            if (buf) tweets.push(buf);
            buf = s.trim().slice(0, 260);
          }
        });
        if (buf) tweets.push(buf);
      }
    });

    const numberedTweets = tweets.map((t, i) => `${i + 1}/${tweets.length} ${t}`);
    const firstHook = tweets[0] || '';
    const hasNumbers = /\d+%?/.test(firstHook);
    const hasColonOrQuestion = /[:?]/.test(firstHook);
    const linkInFirstTweet = /https?:\/\//i.test(firstHook);

    let viralityScore = 74;
    if (hasNumbers) viralityScore += 9;
    if (hasColonOrQuestion) viralityScore += 8;
    if (!linkInFirstTweet) viralityScore += 6; // X algorithm penalizes external links in Post #1
    if (tweets.length >= 3 && tweets.length <= 8) viralityScore += 3;
    viralityScore = Math.min(99, Math.max(40, viralityScore));

    const linkedInPost = paragraphs.join('\n\n') + '\n\n#SovereignAI #LocalFirst #MCP #WebGPU #DevTools';
    const blueskyPosts = tweets.map((t, i) => `[${i + 1}/${tweets.length}] ${t.slice(0, 285)}`);

    const exportBundle = JSON.stringify(
      {
        generator: 'OmniPost Social Engine v2.5.0',
        viralityScore,
        hookDiagnostics: {
          quantifiedHook: hasNumbers,
          curiosityGap: hasColonOrQuestion,
          zeroFirstPostLinkPenalty: !linkInFirstTweet,
        },
        xThread: numberedTweets,
        linkedInPost,
        blueskyPosts,
      },
      null,
      2
    );

    return {
      numberedTweets,
      linkedInPost,
      blueskyPosts,
      viralityScore,
      hasNumbers,
      hasColonOrQuestion,
      linkInFirstTweet,
      exportBundle,
    };
  }, [rawContent]);

  const handleCopyAll = () => {
    navigator.clipboard?.writeText(analysis.exportBundle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2.2,
          borderRadius: 2.5,
          bgcolor: isDark ? 'rgba(212,175,55,0.09)' : '#FEF9E7',
          border: `1.5px solid ${isDark ? 'rgba(212,175,55,0.4)' : '#F5E6AB'}`,
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
            sx={{ bgcolor: '#D4AF37', color: '#08080B', fontWeight: 900, fontFamily: mono }}
          />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Algorithmic Thread Splitter, X/LinkedIn/Bluesky Virality Scorer & Multi-Channel JSON-RPC Dispatcher
          </Typography>
        </Box>
      </Paper>

      <SovereignEyebrow accent="#38BDF8" right="Automation">
        {"omnipost-social-engine"}
      </SovereignEyebrow>
      <SovereignBand
        seed={"omnipost-social-engine"}
        eyebrow={"Automation"}
        caption={"OmniPost Social Engine"}
        label={"OmniPost Social Engine — Zoth sovereign visualisation"}
      />
      <Grid container spacing={3}>
        {/* Left: Long-Form Composer & Algorithmic Virality Audit */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2.5, borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? '#08080C' : '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                1. Long-Form Technical Essay / Launch Draft
              </Typography>
              <Chip
                icon={<TrendingUpIcon sx={{ fontSize: '15px !important', color: '#10B981 !important' }} />}
                label={`Virality Score: ${analysis.viralityScore}/100`}
                size="small"
                sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#34D399', fontFamily: mono, fontWeight: 800 }}
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={9}
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              sx={{ mb: 2, '& .MuiInputBase-input': { fontSize: '0.86rem', lineHeight: 1.6 } }}
            />
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#D4AF37', display: 'block', mb: 1 }}>
              ALGORITHMIC FEED HEURISTICS:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={analysis.hasNumbers ? '✓ Quantified Hook Metric' : '⚠ Add Number/Metric in Hook'}
                size="small"
                sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, bgcolor: analysis.hasNumbers ? 'rgba(16,185,129,0.14)' : 'rgba(245,158,11,0.15)', color: analysis.hasNumbers ? '#34D399' : '#FBBF24' }}
              />
              <Chip
                label={!analysis.linkInFirstTweet ? '✓ Zero Post #1 Link Penalty' : '⚠ Move Link to Final Post'}
                size="small"
                sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, bgcolor: !analysis.linkInFirstTweet ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.15)', color: !analysis.linkInFirstTweet ? '#34D399' : '#F87171' }}
              />
              <Chip
                label={`${analysis.numberedTweets.length} Thread Cards Synthesized`}
                size="small"
                sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700 }}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Right: Multi-Platform Live Preview & Pro Export */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2.5, height: '100%', borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? '#08080C' : '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
            <Tabs value={platformTab} onChange={(_, v) => setPlatformTab(v)} sx={{ mb: 2, minHeight: 36 }}>
              <Tab label={`X Thread (${analysis.numberedTweets.length})`} sx={{ fontSize: '0.76rem', fontWeight: 800, minHeight: 36 }} />
              <Tab label="LinkedIn" sx={{ fontSize: '0.76rem', fontWeight: 800, minHeight: 36 }} />
              <Tab label="Bluesky" sx={{ fontSize: '0.76rem', fontWeight: 800, minHeight: 36 }} />
              <Tab label="Pro JSON Pack" sx={{ fontSize: '0.76rem', fontWeight: 800, minHeight: 36 }} />
            </Tabs>

            {platformTab === 0 && (
              <Stack spacing={1.5} sx={{ flexGrow: 1, maxHeight: 320, overflowY: 'auto', pr: 0.5 }}>
                {analysis.numberedTweets.map((tweet, idx) => (
                  <Paper
                    key={idx}
                    sx={{
                      p: 1.75,
                      borderRadius: 2,
                      bgcolor: isDark ? '#050508' : '#F8FAFC',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#D4AF37', fontFamily: mono }}>
                        @1nc0gn30 · Post #{idx + 1}
                      </Typography>
                      <Chip label={`${tweet.length}/280`} size="small" sx={{ height: 18, fontSize: '0.62rem', fontFamily: mono }} />
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.84rem', lineHeight: 1.55 }}>
                      {tweet}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            )}

            {platformTab === 1 && (
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? '#050508' : '#F8FAFC', border: `1px solid ${theme.palette.divider}`, flexGrow: 1 }}>
                <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8', fontWeight: 800, display: 'block', mb: 1 }}>
                  LINKEDIN TECHNICAL AUTHORITY FORMAT ({analysis.linkedInPost.length} chars)
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.84rem', lineHeight: 1.6 }}>
                  {analysis.linkedInPost}
                </Typography>
              </Paper>
            )}

            {platformTab === 2 && (
              <Stack spacing={1.2} sx={{ flexGrow: 1, maxHeight: 320, overflowY: 'auto' }}>
                {analysis.blueskyPosts.map((bp, idx) => (
                  <Paper key={idx} sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#050508' : '#F8FAFC', border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8', fontWeight: 800 }}>
                      bsky.app · Skeet #{idx + 1} ({bp.length}/300)
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.84rem', mt: 0.5 }}>{bp}</Typography>
                  </Paper>
                ))}
              </Stack>
            )}

            {platformTab === 3 && (
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
                    fontSize: '0.73rem',
                    overflowX: 'auto',
                    maxHeight: 280,
                    filter: 'none',
                    userSelect: 'auto',
                  }}
                >
                  {analysis.exportBundle}
                </Box>
              </Box>
            )}

            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                onClick={handleCopyAll}
                sx={{ bgcolor: '#D4AF37', color: '#08080B', fontWeight: 800, fontFamily: mono, fontSize: '0.75rem' }}
              >
                {copied ? 'Copied Campaign Bundle!' : 'Export Full Thread Pack'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
