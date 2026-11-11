import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Unstable_Grid2 as Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import GitHubIcon from '@mui/icons-material/GitHub';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ClearIcon from '@mui/icons-material/Clear';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import { microTools } from '../data/toolsData';
import SovereignFunnel from '../components/SovereignFunnel';
import { HeroReveal, HeroItem, GlowLine, StaggerChildren, StaggerItem } from '../components/MotionReveal';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';
const categories = ['All', ...Array.from(new Set(microTools.map((t) => t.category)))];

export default function ToolsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(() => params.get('q') || '');
  const [selectedCat, setSelectedCat] = useState(() => params.get('cat') || 'All');
  const [pinnedOnly, setPinnedOnly] = useState(() => params.get('pinned') === '1');
  const [pinned, setPinned] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem('zoth.pinnedTools') || '[]');
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  });
  const [copiedId, setCopiedId] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (search) next.set('q', search);
    else next.delete('q');
    if (selectedCat !== 'All') next.set('cat', selectedCat);
    else next.delete('cat');
    if (pinnedOnly) next.set('pinned', '1');
    else next.delete('pinned');
    next.delete('mode');
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCat, pinnedOnly]);

  useEffect(() => {
    try {
      localStorage.setItem('zoth.pinnedTools', JSON.stringify(pinned));
    } catch {
      /* private browsing */
    }
  }, [pinned]);

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const togglePin = (id) =>
    setPinned((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleCopy = (cmd, id) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cmd);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const gold = isDark ? '#D4AF37' : '#7A5808';
  const primaryText = isDark ? '#F5F1E6' : '#101828';
  const secondaryText = isDark ? '#A3AAB8' : '#475467';
  const cardBg = isDark ? '#0D0F16' : '#FFFFFF';
  const codeBg = isDark ? '#080A0F' : '#F3F4F6';
  const borderCol = isDark ? 'rgba(245, 241, 230, 0.12)' : 'rgba(16, 24, 40, 0.12)';

  const filtered = microTools
    .filter((t) => {
      const matchesCat = selectedCat === 'All' || t.category === selectedCat;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.repo.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      const matchesPin = !pinnedOnly || pinned.includes(t.id);
      return matchesCat && matchesSearch && matchesPin;
    })
    .sort((a, b) => Number(pinned.includes(b.id)) - Number(pinned.includes(a.id)));

  const daemonCount = microTools.filter((t) => Boolean(t.localPort)).length;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
      {/* Editorial Header */}
      <HeroReveal>
        <Box sx={{ mb: 4.5 }}>
          <GlowLine
            height={2}
            color={gold}
            glowColor={isDark ? 'rgba(212,175,55,0.35)' : 'rgba(122,88,8,0.2)'}
          />
          <HeroItem>
            <Typography
              sx={{
                mt: 2.5,
                mb: 1,
                fontFamily: mono,
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: gold,
              }}
            >
              LOCAL-FIRST REPOSITORY INDEX · CLI, DAEMONS &amp; MCP
            </Typography>
          </HeroItem>

          <HeroItem>
            <Typography
              component="h1"
              sx={{
                fontFamily: display,
                fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.4rem' },
                fontWeight: 400,
                lineHeight: 1.08,
                color: primaryText,
                mb: 1.75,
              }}
            >
              Tool Repositories
            </Typography>
          </HeroItem>

          <HeroItem>
            <Typography
              sx={{
                maxWidth: 780,
                fontSize: { xs: '0.98rem', md: '1.06rem' },
                lineHeight: 1.7,
                color: secondaryText,
              }}
            >
              Every Zoth tool is engineered to run natively on your own hardware via CLI binaries and local loopback daemons rather than constrained browser sandboxes. Inspect what each tool does below, then clone its standalone repository, pull the unified{' '}
              <Box
                component="a"
                href="https://github.com/NullAITech/zoth-studio-v2"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: gold, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Zoth Studio v2 repository
              </Box>
              , or run everything pre-installed on{' '}
              <Box
                component={RouterLink}
                to="/zoth-os"
                sx={{ color: gold, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                ZothOS
              </Box>
              .
            </Typography>
          </HeroItem>
        </Box>
      </HeroReveal>

      {/* Clean 4-Stat Strip */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          gap: 1.75,
          mb: 4,
        }}
      >
        {[
          ['Repositories', microTools.length],
          ['Loopback Daemons', daemonCount],
          ['Categories', categories.length - 1],
          ['WAN Telemetry', '0 Bytes'],
        ].map(([label, value]) => (
          <Box
            key={label}
            sx={{
              p: 2,
              borderRadius: 2,
              border: `1px solid ${borderCol}`,
              bgcolor: cardBg,
            }}
          >
            <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '1.35rem', color: primaryText, lineHeight: 1.15 }}>
              {value}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: mono,
                fontWeight: 600,
                fontSize: '0.68rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: secondaryText,
              }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Search Input */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search 77 local repositories by name, capability, or slug… (press / to focus)"
        inputRef={searchRef}
        inputProps={{ 'aria-label': 'Search tool repositories' }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 2.25,
          '& .MuiOutlinedInput-root': {
            bgcolor: cardBg,
            borderRadius: 2,
            fontFamily: mono,
            fontSize: '0.86rem',
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: gold, fontSize: '1.15rem' }} />
            </InputAdornment>
          ),
          endAdornment: search ? (
            <InputAdornment position="end">
              <IconButton size="small" aria-label="Clear search" onClick={() => setSearch('')}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Category & Pin Filters — High Contrast in Both Light & Dark Modes */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.9, mb: 3 }}>
        {categories.map((cat) => {
          const active = selectedCat === cat;
          const count = cat === 'All' ? microTools.length : microTools.filter((t) => t.category === cat).length;
          return (
            <Chip
              key={cat}
              label={`${cat} · ${count}`}
              clickable
              onClick={() => setSelectedCat(cat)}
              sx={{
                fontFamily: mono,
                fontSize: '0.73rem',
                fontWeight: 700,
                bgcolor: active ? (isDark ? '#D4AF37' : '#101828') : cardBg,
                color: active ? (isDark ? '#08080B' : '#FFFFFF') : primaryText,
                border: `1px solid ${active ? (isDark ? '#D4AF37' : '#101828') : borderCol}`,
                '&:hover': {
                  bgcolor: active ? (isDark ? '#E5C158' : '#1E293B') : (isDark ? '#141824' : '#F3F4F6'),
                },
              }}
            />
          );
        })}

        <Chip
          clickable
          onClick={() => setPinnedOnly((v) => !v)}
          icon={
            <StarIcon
              sx={{
                fontSize: '0.9rem !important',
                color: `${pinnedOnly ? (isDark ? '#08080B' : '#FFFFFF') : gold} !important`,
              }}
            />
          }
          label={`Saved (${pinned.length})`}
          sx={{
            fontFamily: mono,
            fontSize: '0.73rem',
            fontWeight: 700,
            bgcolor: pinnedOnly ? (isDark ? '#D4AF37' : '#101828') : cardBg,
            color: pinnedOnly ? (isDark ? '#08080B' : '#FFFFFF') : primaryText,
            border: `1px solid ${pinnedOnly ? (isDark ? '#D4AF37' : '#101828') : borderCol}`,
          }}
        />
      </Box>

      {/* Result Count */}
      <Typography variant="body2" sx={{ color: secondaryText, mb: 3, fontFamily: mono, fontSize: '0.8rem' }}>
        Showing <strong>{filtered.length}</strong> of <strong>{microTools.length}</strong> local-first repositories
      </Typography>

      {/* Repository Grid */}
      <StaggerChildren>
        <Grid container spacing={2.5}>
          {filtered.map((tool) => {
            const repoUrl =
              ['anderson-security-sentinel', 'wcag-contrast-guard', 'zothnet'].includes(tool.id) || !tool.github
                ? 'https://github.com/NullAITech/zoth-studio-v2'
                : tool.github;
            const cloneCmd = `git clone ${repoUrl.replace(/\.git$/, '')}.git`;

            return (
              <Grid xs={12} sm={6} md={4} key={tool.id} sx={{ display: 'flex' }}>
                <StaggerItem style={{ display: 'flex', width: '100%' }}>
                  <Card
                    elevation={0}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 2.5,
                      border: `1px solid ${borderCol}`,
                      bgcolor: cardBg,
                      transition: 'border-color 0.2s ease, transform 0.2s ease',
                      '&:hover': {
                        borderColor: gold,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5, pb: 1.75 }}>
                      {/* Metadata Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1 }}>
                        <Typography
                          sx={{
                            fontFamily: mono,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: gold,
                          }}
                        >
                          {tool.category}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          {tool.localPort && (
                            <Typography
                              sx={{
                                fontFamily: mono,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                px: 0.75,
                                py: 0.15,
                                borderRadius: 1,
                                bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF5',
                                color: isDark ? '#34D399' : '#047857',
                              }}
                            >
                              :{tool.localPort}
                            </Typography>
                          )}
                          <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: secondaryText }}>
                            v{tool.version}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => togglePin(tool.id)}
                            aria-label={pinned.includes(tool.id) ? `Unsave ${tool.name}` : `Save ${tool.name}`}
                            sx={{ p: 0.25, color: pinned.includes(tool.id) ? gold : secondaryText }}
                          >
                            {pinned.includes(tool.id) ? <StarIcon sx={{ fontSize: '1rem' }} /> : <StarBorderIcon sx={{ fontSize: '1rem' }} />}
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Title */}
                      <Typography
                        variant="h6"
                        component={RouterLink}
                        to={`/tools/${tool.id}`}
                        sx={{
                          fontSize: '1.04rem',
                          fontWeight: 800,
                          lineHeight: 1.32,
                          color: primaryText,
                          textDecoration: 'none',
                          display: 'block',
                          mb: 1,
                          '&:hover': { color: gold },
                        }}
                      >
                        {tool.name}
                      </Typography>

                      {/* Clean 3-line summary */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: secondaryText,
                          fontSize: '0.85rem',
                          lineHeight: 1.58,
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {tool.description}
                      </Typography>

                      {/* Copyable git clone strip */}
                      <Box
                        onClick={() => handleCopy(cloneCmd, tool.id)}
                        sx={{
                          cursor: 'pointer',
                          p: 1,
                          px: 1.25,
                          borderRadius: 1.5,
                          bgcolor: codeBg,
                          border: `1px solid ${borderCol}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: mono,
                            fontSize: '0.7rem',
                            color: primaryText,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {cloneCmd}
                        </Typography>
                        {copiedId === tool.id ? (
                          <CheckIcon sx={{ fontSize: '0.85rem', color: isDark ? '#34D399' : '#047857', flexShrink: 0 }} />
                        ) : (
                          <ContentCopyIcon sx={{ fontSize: '0.8rem', color: secondaryText, flexShrink: 0 }} />
                        )}
                      </Box>
                    </CardContent>

                    <CardActions
                      sx={{
                        px: 2.5,
                        pb: 2.25,
                        pt: 1.25,
                        borderTop: `1px solid ${borderCol}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        component={RouterLink}
                        to={`/tools/${tool.id}`}
                        endIcon={<ArrowForwardIcon sx={{ fontSize: '0.9rem !important' }} />}
                        sx={{
                          bgcolor: isDark ? '#D4AF37' : '#101828',
                          color: isDark ? '#08080B' : '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          textTransform: 'none',
                          px: 1.75,
                          '&:hover': { bgcolor: isDark ? '#E5C158' : '#1E293B' },
                        }}
                      >
                        View Specs
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        href={repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<GitHubIcon sx={{ fontSize: '0.9rem !important' }} />}
                        sx={{
                          borderColor: borderCol,
                          color: primaryText,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          px: 1.4,
                          '&:hover': { borderColor: gold },
                        }}
                      >
                        GitHub
                      </Button>
                    </CardActions>
                  </Card>
                </StaggerItem>
              </Grid>
            );
          })}
        </Grid>
      </StaggerChildren>

      <SovereignFunnel />
    </Container>
  );
}
