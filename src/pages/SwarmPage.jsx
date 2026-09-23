import React, { useState } from 'react';
import {
  Box, Container, Typography, Chip, Card, CardContent, Grid, Avatar, Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GroupsIcon from '@mui/icons-material/Groups';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SecurityIcon from '@mui/icons-material/Security';
import SwarmCanvasVisualizer from '../components/SwarmCanvasVisualizer';
import SwarmTaskDispatcher from '../components/SwarmTaskDispatcher';
import { pantheonAgents, pantheonCadres } from '../data/pantheon';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function SwarmPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#B8860B';
  const goldSoft = isDark ? '#F5E6AB' : '#8A6A09';
  const [cadre, setCadre] = useState('All');
  const visible = pantheonAgents.filter((agent) => cadre === 'All' || agent.cadre === cadre);

  return (
    <Container maxWidth="lg" sx={{ py: 6, position: 'relative' }}>
      {/* Unique gold radial glow behind the page header */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(760px, 92%)',
          height: 300,
          pointerEvents: 'none',
          zIndex: 0,
          background: isDark
            ? 'radial-gradient(ellipse 60% 55% at 50% 40%, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.08) 45%, transparent 72%)'
            : 'radial-gradient(ellipse 60% 55% at 50% 40%, rgba(212,175,55,0.20) 0%, rgba(212,175,55,0.07) 45%, transparent 72%)',
        }}
      />

      {/* Header */}
      <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
        <Chip
          label="PANtheon AGENT ROSTER"
          size="small"
          sx={{
            bgcolor: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
            color: goldSoft,
            border: isDark ? '1px solid rgba(212,175,55,0.42)' : '1px solid #F5E6AB',
            fontWeight: 800,
            mb: 1.5,
          }}
        />
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5 }}>
          Pantheon Multi-Agent <span className="text-gradient-gold">Swarm Roster</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 820, lineHeight: 1.65, fontSize: '1.05rem' }}>
          Explore the <span className="text-highlight-gold">{pantheonAgents.length} specialized agent roles</span> defined in Zoth Studio. These agents run as autonomous local processes using <span className="text-highlight-dark">Ollama</span>, <span className="text-highlight-dark">vLLM</span>, or local script runners. Live process heartbeats are surfaced when the bridge daemon responds on <span className="text-highlight-gold">127.0.0.1:8789</span>.
        </Typography>
      </Box>

      {/* Architecture Highlights */}
      <Grid container spacing={2.5} sx={{ mb: 5, position: 'relative', zIndex: 1 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <GroupsIcon sx={{ color: gold }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Role Specialization</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Each agent has a strictly scoped system prompt, tool access contract, and mathematical priority vector to prevent task hallucination.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PrecisionManufacturingIcon sx={{ color: gold }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Zero Cloud Roundtrips</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Inter-agent communication uses <span className="text-highlight-gold">Simplex Unix Sockets</span> and local HTTP bridges with zero external API key requirements.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SecurityIcon sx={{ color: gold }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Socratic Debate Engine</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Decisions pass through Proponent, Skeptic, and Arbitrator roles before output execution is approved.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Cadres */}
      <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
        <Typography className="section-kicker">Filter Agent Cadres</Typography>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {pantheonCadres.map((name) => (
            <Chip
              key={name}
              label={name === 'All' ? `All Cadres (${pantheonAgents.length})` : name}
              clickable
              onClick={() => setCadre(name)}
              sx={{
                fontWeight: 750,
                px: 1,
                bgcolor: cadre === name ? gold : theme.palette.background.paper,
                color: cadre === name ? (isDark ? '#101828' : '#FFFFFF') : theme.palette.text.primary,
                border: '1px solid',
                borderColor: cadre === name ? (isDark ? '#D4AF37' : '#D4AF37') : theme.palette.divider,
                '&:hover': {
                  bgcolor: cadre === name ? (isDark ? '#C9A227' : '#9A7209') : theme.palette.action.hover,
                },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Task Dispatcher */}
      <Box sx={{ mb: 5, position: 'relative', zIndex: 1 }}>
        <Typography className="section-kicker">Interactive Task Dispatcher</Typography>
        <SwarmTaskDispatcher />
      </Box>

      {/* Visual Canvas Monitor */}
      <Box sx={{ mb: 5, position: 'relative', zIndex: 1 }}>
        <Typography className="section-kicker">Agent Mesh Network Visualizer</Typography>
        <SwarmCanvasVisualizer />
      </Box>

      {/* Agent Roster Card Grid */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography className="section-kicker">Agent Catalog Ledger</Typography>
        <Grid container spacing={2.5}>
          {visible.map((agent) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={agent.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2.5,
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease',
                  '&:hover': {
                    borderColor: gold,
                    transform: 'translateY(-3px)',
                    boxShadow: isDark
                      ? '0 14px 30px -8px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.4), 0 0 26px -4px rgba(212,175,55,0.30)'
                      : '0 14px 28px -8px rgba(212,175,55,0.30), 0 0 0 1px rgba(212,175,55,0.35), 0 0 22px -4px rgba(212,175,55,0.22)',
                  },
                }}
              >
                <Avatar
                  src={agent.img}
                  alt={agent.id}
                  variant="rounded"
                  sx={{
                    width: 84,
                    height: 84,
                    mb: 1.5,
                    bgcolor: theme.palette.background.paper,
                    border: `2px solid ${gold}`,
                    boxShadow: `0 0 0 3px ${isDark ? 'rgba(212,175,55,0.18)' : 'rgba(184,134,11,0.16)'}, 0 6px 18px -4px ${isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.30)'}`,
                    '& img': { objectFit: 'cover' },
                  }}
                />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, fontFamily: mono, color: goldSoft, letterSpacing: '0.02em', lineHeight: 1.2 }}
                >
                  {agent.id}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, mb: 1.5, lineHeight: 1.45, minHeight: '2.9em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {agent.role}
                </Typography>
                <Chip
                  label={agent.cadre}
                  size="small"
                  sx={{
                    bgcolor: isDark ? 'rgba(212,175,55,0.14)' : '#F2F4F7',
                    color: goldSoft,
                    border: isDark ? '1px solid rgba(212,175,55,0.42)' : '1px solid #EAECF0',
                    fontWeight: 700,
                  }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
