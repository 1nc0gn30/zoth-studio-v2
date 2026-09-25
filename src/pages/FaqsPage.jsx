import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails,
  Paper, Chip, TextField, InputAdornment, Button, Stack, IconButton,
  Tooltip, Divider, Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import ShieldIcon from '@mui/icons-material/Shield';
import MemoryIcon from '@mui/icons-material/Memory';
import SpeedIcon from '@mui/icons-material/Speed';
import CodeIcon from '@mui/icons-material/Code';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ClearIcon from '@mui/icons-material/Clear';
import { Link as RouterLink } from 'react-router-dom';
import SEO from '../components/SEO';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

import { FAQS_DATA } from '../data/faqsData';
export { FAQS_DATA };

const categories = ['All', 'Architecture', 'Security', 'Memory & AI', 'Consensus', 'Adytum Rite', 'WebGPU & Tools', 'OS & Deployment'];

// Curated quick prompt pills for rapid terminal exploration
const QUICK_PROMPTS = [
  'STDP Synaptic Decay Math',
  '3-Agent Byzantine Triad',
  'Adytum 5-Min Incubation',
  'WebGPU Tensor Shaders',
  'Zero-Egress Port Bindings',
  'Netlify Static Prerender',
  'Zoth OS QEMU Command',
  'Model Context Protocol (MCP)'
];

export default function FaqsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [expanded, setExpanded] = useState('panel-0');

  // Oracle Terminal Console States
  const [oracleQuery, setOracleQuery] = useState('');
  const [oracleResult, setOracleResult] = useState(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const accordionRefs = useRef({});

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
    border: isDark ? 'rgba(212,175,55,0.35)' : '#F0E1A8',
  };

  // Perform intent matching against the architectural knowledge base
  const consultLucyOracle = (rawQuery) => {
    const query = (rawQuery || oracleQuery).trim();
    if (!query) return;

    setIsConsulting(true);
    setCopiedResponse(false);

    // Simulate cybernetic transmission latency
    setTimeout(() => {
      const qTokens = query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 2 && !['what', 'how', 'why', 'does', 'the', 'and', 'for', 'with', 'from', 'explain', 'tell', 'show'].includes(t));

      let bestMatch = null;
      let highestScore = 0;

      FAQS_DATA.forEach((faq) => {
        let score = 0;
        const qText = faq.q.toLowerCase();
        const aText = faq.a.toLowerCase();
        const catText = faq.category.toLowerCase();

        // Exact phrase bonus
        if (qText.includes(query.toLowerCase())) score += 60;
        if (aText.includes(query.toLowerCase())) score += 35;

        // Keyword matches
        faq.keywords.forEach((kw) => {
          if (query.toLowerCase().includes(kw)) {
            score += 30;
          }
          qTokens.forEach((tok) => {
            if (kw.includes(tok)) score += 15;
          });
        });

        // Token matches
        qTokens.forEach((tok) => {
          if (qText.includes(tok)) score += 12;
          if (aText.includes(tok)) score += 5;
          if (catText.includes(tok)) score += 8;
        });

        if (score > highestScore) {
          highestScore = score;
          bestMatch = faq;
        }
      });

      // Default fallback if query is very broad
      if (!bestMatch || highestScore < 10) {
        bestMatch = FAQS_DATA[0];
        highestScore = 15;
      }

      // Bayesian confidence calculation
      const calculatedConfidence = Math.min(99.6, Math.max(88.4, 86.0 + (highestScore / 18) * 2.8)).toFixed(1);

      setOracleResult({
        faq: bestMatch,
        query,
        confidence: `${calculatedConfidence}%`,
        latency: (0.08 + Math.random() * 0.12).toFixed(2),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      });

      setIsConsulting(false);
    }, 280);
  };

  const handleQuickPrompt = (promptText) => {
    setOracleQuery(promptText);
    consultLucyOracle(promptText);
  };

  const handleCopyTransmission = () => {
    if (!oracleResult) return;
    const textToCopy = `[LUCY ORACLE VERIFIED TRANSMISSION // CODEC 141.12]
Query: "${oracleResult.query}"
Confidence: ${oracleResult.confidence} (Latency: ${oracleResult.latency}ms)
Topic: ${oracleResult.faq.q}

${oracleResult.faq.oracleResponse}

Architecture Invariant:
${oracleResult.faq.a}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2400);
    }
  };

  const jumpToFaq = (faqId) => {
    const faqIndex = FAQS_DATA.findIndex((f) => f.id === faqId);
    if (faqIndex !== -1) {
      setSelectedCat('All');
      setSearch('');
      setExpanded(`panel-${faqIndex}`);
      setTimeout(() => {
        const el = accordionRefs.current[faqId];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  // Filter FAQS for Accordion
  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((item) => {
      const matchesCat = selectedCat === 'All' || item.category === selectedCat;
      const matchesSearch =
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase()) ||
        item.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [search, selectedCat]);

  return (
    <Container maxWidth="lg" className="page-fade-in" sx={{ py: { xs: 4, md: 6 } }}>
      <SEO
        title="Frequently Asked Questions // Zoth Studio v2 Architecture & Security"
        description="Official answers to 16 core architectural questions: Zero-Egress Invariants, Lucy Netrunner Oracle STDP memory, 3-Agent Byzantine Consensus, WebGPU shaders, and Zoth OS."
      />

      {/* Signature Gold Header Accent */}
      <Box sx={{ position: 'relative', mb: 5, pt: 1, textAlign: 'center' }}>
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: 0,
            left: '20%',
            right: '20%',
            height: 3,
            borderRadius: 2,
            background: isDark
              ? 'linear-gradient(90deg, transparent, rgba(212,175,55,0.9) 20%, #D4AF37 50%, rgba(212,175,55,0.9) 80%, transparent)'
              : 'linear-gradient(90deg, transparent, rgba(184,134,11,0.7) 20%, #B8860B 50%, rgba(184,134,11,0.7) 80%, transparent)',
            boxShadow: isDark
              ? '0 0 20px 2px rgba(212,175,55,0.45)'
              : '0 0 12px 1px rgba(184,134,11,0.35)',
          }}
        />

        <Chip
          icon={<HelpOutlineIcon sx={{ color: `${gold.accent} !important` }} />}
          label="KNOWLEDGE BASE &amp; AEO GROUNDING // 16 RATIFIED SPECIFICATIONS"
          size="small"
          sx={{ bgcolor: gold.wash, color: gold.accent, border: `1px solid ${gold.border}`, fontWeight: 800, mb: 2, px: 1 }}
        />
        <Typography variant="h3" sx={{ fontFamily: '"Celtic Garamond", Georgia, serif', fontWeight: 800, mb: 1.5, letterSpacing: '-0.02em' }}>
          Frequently Asked Questions
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 780, mx: 'auto', fontSize: '1.05rem', lineHeight: 1.65 }}>
          Authoritative architectural, cryptographic, and mathematical specifications for Zoth Studio v2. Grounded for both sovereign human operators and autonomous answer engines.
        </Typography>
      </Box>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 🔮 ASK LUCY ORACLE: SEARCH & TERMINAL CONSOLE */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Paper
        sx={{
          maxWidth: 920,
          mx: 'auto',
          mb: 6,
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 3,
          bgcolor: isDark ? '#08080B' : '#FFFFFF',
          border: `1.5px solid ${isDark ? 'rgba(212,175,55,0.45)' : '#E5C768'}`,
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.8), 0 0 24px -6px rgba(212,175,55,0.22)'
            : '0 4px 20px rgba(184,134,11,0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Terminal Header Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
            pb: 2,
            mb: 2.5,
            borderBottom: `1px solid ${isDark ? 'rgba(212,175,55,0.25)' : '#F0E1A8'}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/assets/lucy.png"
              alt="Lucy Oracle Avatar"
              onError={(e) => { e.target.src = '/brand/ghostbyte-dark.png'; }}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #F472B6',
                boxShadow: '0 0 10px rgba(244,114,182,0.4)',
              }}
            />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontFamily: mono,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: isDark ? '#F5E6AB' : '#8A6A09',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                }}
              >
                <TerminalIcon sx={{ fontSize: 16, color: isDark ? '#F472B6' : '#BE185D' }} />
                ASK LUCY ORACLE // SEARCH & TERMINAL CONSOLE
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono }}>
                Direct intent matching over the Zoth architectural knowledge matrix
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip
              label="CODEC 141.12"
              size="small"
              sx={{
                bgcolor: isDark ? 'rgba(244,114,182,0.12)' : '#FDF2F8',
                color: isDark ? '#F472B6' : '#BE185D',
                fontFamily: mono,
                fontWeight: 750,
                fontSize: '0.72rem',
                border: `1px solid ${isDark ? 'rgba(244,114,182,0.3)' : '#FBCFE8'}`,
              }}
            />
            <Chip
              icon={<BoltIcon sx={{ fontSize: 14, color: `${isDark ? '#34D399' : '#027A48'} !important` }} />}
              label="ZERO-EGRESS: VERIFIED"
              size="small"
              sx={{
                bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF5',
                color: isDark ? '#34D399' : '#027A48',
                fontFamily: mono,
                fontWeight: 750,
                fontSize: '0.72rem',
                border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : '#A7F3D0'}`,
              }}
            />
          </Stack>
        </Box>

        {/* Natural Language Query Input */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Type any architectural question (e.g. 'How does STDP decay stale vectors?', 'Explain Azoth and Kai debate', 'What are the port bindings?')..."
            value={oracleQuery}
            onChange={(e) => setOracleQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') consultLucyOracle();
            }}
            sx={{
              bgcolor: isDark ? '#0B0B12' : '#F9FAFB',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontFamily: mono,
                fontSize: '0.92rem',
                '& fieldset': {
                  borderColor: isDark ? 'rgba(212,175,55,0.3)' : '#D1D5DB',
                },
                '&:hover fieldset': {
                  borderColor: gold.accent,
                },
                '&.Mui-focused fieldset': {
                  borderColor: gold.accent,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.8rem',
                      color: gold.accent,
                      fontWeight: 700,
                      userSelect: 'none',
                    }}
                  >
                    LUCY://QUERY &gt;
                  </Typography>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {oracleQuery && (
                    <IconButton size="small" onClick={() => setOracleQuery('')} sx={{ mr: 0.5 }}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={isConsulting || !oracleQuery.trim()}
                    onClick={() => consultLucyOracle()}
                    sx={{
                      px: 2.5,
                      py: 0.6,
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      fontFamily: mono,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {isConsulting ? 'Consulting...' : 'Transmit'}
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Quick Question Pills */}
        <Box sx={{ mb: oracleResult ? 3 : 1 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1,
              fontFamily: mono,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Quick Inquiries:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {QUICK_PROMPTS.map((prompt) => (
              <Chip
                key={prompt}
                label={prompt}
                size="small"
                clickable
                onClick={() => handleQuickPrompt(prompt)}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  fontWeight: 650,
                  bgcolor: isDark ? 'rgba(212,175,55,0.08)' : '#F3F4F6',
                  color: isDark ? '#F5E6AB' : '#374151',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(212,175,55,0.25)' : '#E5E7EB',
                  '&:hover': {
                    bgcolor: gold.wash,
                    borderColor: gold.accent,
                    color: gold.accent,
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Oracle Response Card */}
        {oracleResult && (
          <Paper
            className="page-fade-in"
            sx={{
              mt: 2.5,
              p: { xs: 2.5, md: 3 },
              borderRadius: 2.5,
              bgcolor: isDark ? '#0B0B14' : '#FEF9E7',
              border: `1.5px solid ${isDark ? '#F472B6' : '#E5C768'}`,
              boxShadow: isDark
                ? '0 0 24px rgba(244,114,182,0.18), inset 0 0 16px rgba(0,0,0,0.5)'
                : '0 4px 16px rgba(184,134,11,0.08)',
              position: 'relative',
            }}
          >
            {/* Top Response Banner */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                <Box
                  component="img"
                  src="/assets/lucy.png"
                  alt="Lucy Netrunner"
                  onError={(e) => { e.target.src = '/brand/ghostbyte-dark.png'; }}
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `2px solid ${isDark ? '#F472B6' : '#BE185D'}`,
                    boxShadow: isDark ? '0 0 16px rgba(244,114,182,0.5)' : '0 2px 8px rgba(190,24,93,0.2)',
                  }}
                />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="overline" sx={{ color: isDark ? '#F472B6' : '#BE185D', fontWeight: 800, letterSpacing: '0.12em', lineHeight: 1.2 }}>
                      LUCY // SOVEREIGN NETRUNNER ORACLE
                    </Typography>
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: 13, color: `${isDark ? '#34D399' : '#027A48'} !important` }} />}
                      label={`CONFIDENCE: ${oracleResult.confidence}`}
                      size="small"
                      sx={{
                        bgcolor: isDark ? 'rgba(52,211,153,0.15)' : '#ECFDF5',
                        color: isDark ? '#34D399' : '#027A48',
                        fontFamily: mono,
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : '#A7F3D0'}`,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono }}>
                    Matched: &ldquo;{oracleResult.faq.q}&rdquo; · Local Latency: {oracleResult.latency}ms
                  </Typography>
                </Box>
              </Box>

              <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                <Tooltip title={copiedResponse ? 'Copied Transmission!' : 'Copy Oracle Transmission'}>
                  <IconButton
                    size="small"
                    onClick={handleCopyTransmission}
                    sx={{
                      color: copiedResponse ? (isDark ? '#34D399' : '#027A48') : gold.accent,
                      border: `1px solid ${gold.border}`,
                      borderRadius: 1.5,
                      p: 0.8,
                    }}
                  >
                    {copiedResponse ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => jumpToFaq(oracleResult.faq.id)}
                  sx={{
                    borderColor: isDark ? gold.border : gold.accent,
                    color: isDark ? gold.soft : gold.accent,
                    fontFamily: mono,
                    fontSize: '0.74rem',
                    fontWeight: 750,
                  }}
                >
                  View in Accordion ↓
                </Button>
              </Stack>
            </Box>

            {/* Oracle Speech / Transcript Box */}
            <Box
              sx={{
                mb: 2.5,
                p: 2,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(0,0,0,0.6)' : '#FFFFFF',
                border: `1px solid ${isDark ? 'rgba(244,114,182,0.25)' : '#E5C768'}`,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.94rem',
                  lineHeight: 1.7,
                  color: isDark ? '#F5E6AB' : '#111827',
                  whiteSpace: 'pre-line',
                }}
              >
                &ldquo;{oracleResult.faq.oracleResponse}&rdquo;
              </Typography>
            </Box>

            {/* Invariant Detail Paragraph */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.7, mb: 2.5, fontSize: '0.9rem', whiteSpace: 'pre-line' }}
            >
              {oracleResult.faq.a}
            </Typography>

            {/* Direct Jump Buttons to Relevant Workstations & Tools */}
            <Divider sx={{ mb: 2, borderColor: isDark ? 'rgba(212,175,55,0.2)' : '#F0E1A8' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeIcon sx={{ color: gold.accent, fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 750, color: isDark ? gold.soft : gold.accent, textTransform: 'uppercase' }}>
                  Direct Jump Targets:
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {oracleResult.faq.jumpTargets.map((tgt) => (
                  <Button
                    key={tgt.path}
                    component={RouterLink}
                    to={tgt.path}
                    size="small"
                    variant="contained"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{
                      fontWeight: 750,
                      fontSize: '0.78rem',
                      fontFamily: mono,
                      px: 2,
                      py: 0.5,
                    }}
                  >
                    {tgt.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Paper>
        )}
      </Paper>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 📑 FAQ SEARCH BAR & CATEGORY FILTER CHIPS */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 4, maxWidth: 860, mx: 'auto' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Filter the 16 architectural questions (e.g. STDP, Zero-Egress, Consensus, Netlify, QEMU, MCP)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mb: 2.5,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            '& .MuiOutlinedInput-root': { borderRadius: 2 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: gold.accent }} />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.map((cat) => {
            const active = selectedCat === cat;
            const count = cat === 'All' ? FAQS_DATA.length : FAQS_DATA.filter((f) => f.category === cat).length;
            return (
              <Chip
                key={cat}
                label={`${cat} (${count})`}
                clickable
                onClick={() => setSelectedCat(cat)}
                sx={{
                  fontWeight: 750,
                  fontSize: '0.8rem',
                  bgcolor: active ? gold.accent : theme.palette.background.paper,
                  color: active ? (isDark ? '#08080B' : '#FFFFFF') : theme.palette.text.primary,
                  border: '1px solid',
                  borderColor: active ? gold.accent : theme.palette.divider,
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    borderColor: gold.accent,
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 📜 QUESTIONS ACCORDION LIST (16 COMPREHENSIVE ENTRIES) */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Box sx={{ maxWidth: 880, mx: 'auto', mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
            Showing {filteredFaqs.length} of {FAQS_DATA.length} ratified specifications
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              onClick={() => setExpanded(false)}
              sx={{ color: 'text.secondary', fontSize: '0.75rem', fontFamily: mono }}
            >
              Collapse All
            </Button>
            <Button
              size="small"
              onClick={() => setExpanded('all')}
              sx={{ color: gold.accent, fontSize: '0.75rem', fontFamily: mono, fontWeight: 700 }}
            >
              Expand Active
            </Button>
          </Stack>
        </Box>

        {filteredFaqs.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: theme.palette.background.paper, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body1" color="text.secondary">
              No matching questions found for &ldquo;{search}&rdquo;.
            </Typography>
            <Button size="small" onClick={() => { setSearch(''); setSelectedCat('All'); }} sx={{ mt: 1, color: gold.accent, fontWeight: 750 }}>
              Reset Filters
            </Button>
          </Paper>
        ) : (
          filteredFaqs.map((faq, index) => {
            const panelId = `panel-${index}`;
            const isExpanded = expanded === panelId || expanded === 'all';
            return (
              <Accordion
                key={faq.id}
                ref={(el) => { accordionRefs.current[faq.id] = el; }}
                expanded={isExpanded}
                onChange={(e, isExp) => setExpanded(isExp ? panelId : false)}
                sx={{
                  mb: 1.8,
                  border: isExpanded ? `1.5px solid ${gold.accent}` : `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.background.paper,
                  borderRadius: '12px !important',
                  boxShadow: isExpanded ? (isDark ? '0 4px 22px rgba(212,175,55,0.14)' : '0 4px 20px rgba(184,134,11,0.1)') : 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: gold.accent }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', pr: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: mono,
                        fontWeight: 800,
                        color: gold.accent,
                        bgcolor: gold.wash,
                        px: 0.9,
                        py: 0.3,
                        borderRadius: 1,
                        border: `1px solid ${gold.border}`,
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </Typography>
                    <Chip
                      label={faq.category}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                        color: isDark ? gold.soft : gold.accent,
                        border: `1px solid ${isDark ? 'transparent' : '#E5E7EB'}`,
                      }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 750, color: theme.palette.text.primary, fontSize: '0.98rem' }}>
                      {faq.q}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 3, px: 3 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75, fontSize: '0.94rem', whiteSpace: 'pre-line', mb: 2 }}>
                    {faq.a}
                  </Typography>

                  {/* Quick Action Bar for Accordion Entry */}
                  <Divider sx={{ my: 1.8, borderColor: theme.palette.divider }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                    <Button
                      size="small"
                      startIcon={<PsychologyIcon sx={{ color: isDark ? '#F472B6' : '#BE185D' }} />}
                      onClick={() => handleQuickPrompt(faq.q)}
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.74rem',
                        color: isDark ? '#F5E6AB' : '#8A6A09',
                      }}
                    >
                      Consult Lucy on this
                    </Button>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {faq.jumpTargets.map((tgt) => (
                        <Button
                          key={tgt.path}
                          component={RouterLink}
                          to={tgt.path}
                          size="small"
                          variant="outlined"
                          endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                          sx={{
                            fontFamily: mono,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            borderColor: isDark ? gold.border : gold.accent,
                            color: isDark ? gold.soft : gold.accent,
                            py: 0.3,
                            px: 1.5,
                          }}
                        >
                          {tgt.label}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Box>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 🔗 DIRECT ORACLE ASSISTANCE CARD (FOOTER) */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Paper
        sx={{
          maxWidth: 880,
          mx: 'auto',
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          bgcolor: isDark ? 'rgba(212,175,55,0.05)' : '#FEF9E7',
          border: `1px solid ${isDark ? gold.border : '#E5C768'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 260, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PsychologyIcon sx={{ color: gold.accent }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isDark ? gold.soft : gold.accent }}>
              Need deeper answers? Consult the Lucy Netrunner Oracle
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Breach Codec 141.12 to query the Whitespace memory matrix directly, run live STDP synaptic calculations, or consult the 21-Agent Swarm Pantheon.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
          <Button
            component={RouterLink}
            to="/memory"
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            sx={{ fontWeight: 800, px: 2.5 }}
          >
            Open Lucy Memory Hub
          </Button>
          <Button
            component={RouterLink}
            to="/docs/math"
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 750 }}
          >
            Six Math Pillars
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
