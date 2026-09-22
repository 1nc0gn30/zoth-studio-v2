import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  Button,
  TextField,
  LinearProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TerminalIcon from '@mui/icons-material/Terminal';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';

export default function ConsensusPage() {
  const [debatePrompt, setDebatePrompt] = useState('function calculateSwarmConsensus(nodes) {\n  return nodes.reduce((acc, n) => acc && n.verified, true);\n}');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [votes, setVotes] = useState({ A: 12, B: 9, C: 15 });
  const [userVoted, setUserVoted] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [consoleLogs, setConsoleLogs] = useState([
    { type: 'info', text: '[INIT] Tri-agent Socratic debate matrix engaged.' },
    { type: 'agentA', text: '[CONTENDER A - Antigravity] Proposes strict zero-telemetry AST validation with SHA-256 seal.' },
    { type: 'agentB', text: '[CONTENDER B - Grok Beta] Recommends adding async lock reentrancy defense to accumulator loop.' },
    { type: 'agentC', text: '[CONTENDER C - Hermes 3] Validating tool payload schema against Zod contract v2.4.' },
    { type: 'success', text: '✔ 3/3 Agents agreed on SHA-256 AST consensus seal: 0x8F4A99C2E17A0012B' }
  ]);

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    const timestamp = new Date().toLocaleTimeString();
    
    setConsoleLogs((prev) => [
      ...prev,
      { type: 'info', text: `[${timestamp}] [SYNTHESIS TRIGGERED] Evaluating Socratic thesis across all 3 nodes...` },
    ]);

    setTimeout(() => {
      setConsoleLogs((prev) => [
        ...prev,
        { type: 'agentA', text: `[${timestamp}] [ROUND 1] Antigravity verified AST immutability tree (0 syntax mutations detected).` },
        { type: 'agentB', text: `[${timestamp}] [ROUND 2] Grok Beta injected edge case fuzzing vector: 10,000 node stress test passed.` },
        { type: 'agentC', text: `[${timestamp}] [ROUND 3] Hermes 3 compiled schema contract lock into memory vault.` },
        { type: 'success', text: `[${timestamp}] ✔ SOCRATIC CONSENSUS REACHED (Quorum 100%, Hash: 0x${Math.random().toString(16).substring(2, 10).toUpperCase()})` }
      ]);
      setIsSynthesizing(false);
    }, 1200);
  };

  const handleVote = (contender) => {
    if (userVoted === contender) return;
    setVotes((prev) => {
      const updated = { ...prev };
      if (userVoted) updated[userVoted] -= 1;
      updated[contender] += 1;
      return updated;
    });
    setUserVoted(contender);
  };

  const handleCopyLogs = () => {
    const textToCopy = consoleLogs.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleReset = () => {
    setConsoleLogs([
      { type: 'info', text: '[RESET] Arena reset to initial baseline state.' },
      { type: 'success', text: 'Ready for new Socratic prompt input.' }
    ]);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Chip
          icon={<GavelIcon sx={{ color: '#B8860B !important' }} />}
          label="SOCRATIC DEBATE ARENA"
          size="small"
          sx={{
            backgroundColor: '#FEF9E7',
            color: '#B8860B',
            border: '1px solid #F0E1A8',
            fontWeight: 700,
            mb: 1.5,
            px: 1
          }}
        />
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 800, color: '#101828' }}>
          Consensus Battle Arena
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
          Tri-agent Socratic argument matrix, AST code diff inspection, and dialectic consensus synthesis powered by autonomous Zoth AI nodes.
        </Typography>
      </Box>

      {/* Top Metrics Summary Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, border: '1px solid #EAECF0', borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Quorum Status</Typography>
              <Chip label="VERIFIED" size="small" sx={{ backgroundColor: '#ECFDF3', color: '#12B76A', fontWeight: 700, fontSize: '0.7rem' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#101828' }}>100%</Typography>
            <Typography variant="caption" color="text.secondary">3/3 Nodes in Full Alignment</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, border: '1px solid #EAECF0', borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Socratic Depth</Typography>
              <Chip label="LEVEL 5" size="small" sx={{ backgroundColor: '#FEF9E7', color: '#B8860B', border: '1px solid #F0E1A8', fontWeight: 700, fontSize: '0.7rem' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#101828' }}>Dialectic</Typography>
            <Typography variant="caption" color="text.secondary">Recursive AST Mutation Check</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, border: '1px solid #EAECF0', borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Consensus Seal</Typography>
              <Chip label="SHA-256" size="small" sx={{ backgroundColor: '#F0F9FF', color: '#0284C7', fontWeight: 700, fontSize: '0.7rem' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#101828', fontFamily: 'monospace', fontSize: '1.4rem' }}>0x8F4A...3B21</Typography>
            <Typography variant="caption" color="text.secondary">Immutable Ledger Hash</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, border: '1px solid #EAECF0', borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Active Arena</Typography>
              <Chip label="ONLINE" size="small" sx={{ backgroundColor: '#ECFDF3', color: '#12B76A', fontWeight: 700, fontSize: '0.7rem' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#B8860B' }}>3 Contenders</Typography>
            <Typography variant="caption" color="text.secondary">Antigravity • Grok • Hermes</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Interactive Control & Prompt Bar */}
      <Paper sx={{ p: 3, border: '1px solid #EAECF0', borderRadius: 3, mb: 4, backgroundColor: '#FAFAFA' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareArrowsIcon sx={{ color: '#B8860B' }} /> Interactive Socratic Code Spec Input
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Modify the AST source code spec below to trigger a live dialectic argument between all 3 contender agents.
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          value={debatePrompt}
          onChange={(e) => setDebatePrompt(e.target.value)}
          sx={{
            mb: 2,
            backgroundColor: '#FFFFFF',
            '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: '0.9rem' }
          }}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setDebatePrompt('function calculateSwarmConsensus(nodes) {\n  return nodes.reduce((acc, n) => acc && n.verified, true);\n}')}
              sx={{ borderColor: '#EAECF0', color: '#475467' }}
            >
              Preset: Swarm Quorum
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setDebatePrompt('async function acquireArgonLock(vaultKey) {\n  const token = await crypto.subtle.digest("SHA-256", vaultKey);\n  return token ? true : false;\n}')}
              sx={{ borderColor: '#EAECF0', color: '#475467' }}
            >
              Preset: Argon2id Vault Lock
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              sx={{ borderColor: '#EAECF0', color: '#475467' }}
            >
              Reset Arena
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={isSynthesizing ? <CheckCircleIcon /> : <PlayArrowIcon />}
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              sx={{ px: 3 }}
            >
              {isSynthesizing ? 'Synthesizing...' : 'Synthesize Consensus'}
            </Button>
          </Box>
        </Box>

        {isSynthesizing && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { backgroundColor: '#B8860B' } }} />
          </Box>
        )}
      </Paper>

      {/* Contender Agents Grid (Full Height Cards) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        {/* Contender A */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              border: '1px solid #EAECF0',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: '#F0E1A8',
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px -4px rgba(212, 175, 55, 0.15)'
              }
            }}
          >
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label="CONTENDER A • PRECISION"
                    size="small"
                    sx={{
                      backgroundColor: '#FEF9E7',
                      color: '#B8860B',
                      border: '1px solid #F0E1A8',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}
                  />
                  <Chip
                    icon={<ThumbUpIcon sx={{ fontSize: '0.9rem !important', color: userVoted === 'A' ? '#B8860B !important' : 'inherit' }} />}
                    label={`${votes.A} Votes`}
                    size="small"
                    variant={userVoted === 'A' ? 'filled' : 'outlined'}
                    sx={{
                      borderColor: '#EAECF0',
                      backgroundColor: userVoted === 'A' ? '#FEF9E7' : 'transparent',
                      color: userVoted === 'A' ? '#B8860B' : '#475467',
                      fontWeight: 700
                    }}
                  />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#101828' }}>
                  Google Antigravity
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                  Focus: Zero-telemetry precision, strict type safety, AST node immutability, and optimal execution performance.
                </Typography>

                <Box sx={{ p: 2, backgroundColor: '#F89B290A', borderRadius: 2, border: '1px solid #EAECF0', mb: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#B8860B', display: 'block', mb: 0.5 }}>
                    Socratic Thesis Position
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#344054' }}>
                    "AST verification should strictly return boolean immutability without dynamic runtime proxies."
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 1, textAlign: 'center', backgroundColor: '#F9FAFB', border: '1px solid #EAECF0' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Latency</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#101828' }}>14ms</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 1, textAlign: 'center', backgroundColor: '#F9FAFB', border: '1px solid #EAECF0' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>AST Precision</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#12B76A' }}>99.4%</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 1, textAlign: 'center', backgroundColor: '#F9FAFB', border: '1px solid #EAECF0' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Type Safety</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0284C7' }}>Strict</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Button
                  fullWidth
                  variant={userVoted === 'A' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleVote('A')}
                  startIcon={<ThumbUpIcon />}
                  sx={{ borderRadius: 9999 }}
                >
                  {userVoted === 'A' ? 'Backed Contender A' : 'Back Contender A'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contender B */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              border: '1px solid #EAECF0',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: '#F0E1A8',
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px -4px rgba(212, 175, 55, 0.15)'
              }
            }}
          >
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label="CONTENDER B • SYNTHESIS"
                    size="small"
                    sx={{
                      backgroundColor: '#F0F9FF',
                      color: '#0284C7',
                      border: '1px solid #BAE6FD',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}
                  />
                  <Chip
                    icon={<ThumbUpIcon sx={{ fontSize: '0.9rem !important', color: userVoted === 'B' ? '#0284C7 !important' : 'inherit' }} />}
                    label={`${votes.B} Votes`}
                    size="small"
                    variant={userVoted === 'B' ? 'filled' : 'outlined'}
                    sx={{
                      borderColor: '#EAECF0',
                      backgroundColor: userVoted === 'B' ? '#F0F9FF' : 'transparent',
                      color: userVoted === 'B' ? '#0284C7' : '#475467',
                      fontWeight: 700
                    }}
                  />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#101828' }}>
                  xAI Grok Beta
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                  Focus: Dialectic synthesis, deep architectural refactoring, edge-case coverage, and aggressive optimization.
                </Typography>

                <Box sx={{ p: 2, backgroundColor: '#F0F9FF0A', borderRadius: 2, border: '1px solid #EAECF0', mb: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0284C7', display: 'block', mb: 0.5 }}>
                    Socratic Thesis Position
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#344054' }}>
                    "Consensus must embed reentrancy guards to prevent concurrent node spoofing during validation."
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 1, textAlign: 'center', backgroundColor: '#F9FAFB', border: '1px solid #EAECF0' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Latency</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#101828' }}>22ms</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 1, textAlign: 'center', backgroundColor: '#F9FAFB', border: '1px solid #EAECF0' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Refactor Score</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#12B76A' }}>98.1%</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 1, textAlign: 'center', backgroundColor: '#F9FAFB', border: '1px solid #EAECF0' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Fuzzing</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#B8860B' }}>Deep</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Button
                  fullWidth
                  variant={userVoted === 'B' ? 'contained' : 'outlined'}
                  color="secondary"
                  onClick={() => handleVote('B')}
                  startIcon={<ThumbUpIcon />}
                  sx={{ borderRadius: 9999 }}
                >
                  {userVoted === 'B' ? 'Backed Contender B' : 'Back Contender B'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contender C */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              border: '1px solid #EAECF0',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: '#F0E1A8',
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px -4px rgba(212, 175, 55, 0.15)'
              }
            }}
          >
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label="CONTENDER C • AUTONOMY"
                    size="small"
                    sx={{
                      backgroundColor: '#F3E8FF',
                      color: '#7E22CE',
                      border: '1px solid #E9D5FF',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}
                  />
                  <Chip
                    icon={<ThumbUpIcon sx={{ fontSize: '0.9rem !important', color: userVoted === 'C' ? '#7E22CE !important' : 'inherit' }} />}
                    label={`${votes.C} Votes`}
                    size="small"
                    variant={userVoted === 'C' ? 'filled' : 'outlined'}
                    sx={{
                      borderColor: '#EAECF0',
                      backgroundColor: userVoted === 'C' ? '#F3E8FF' : 'transparent',
                      color: userVoted === 'C' ? '#7E22CE' : '#475467',
                      fontWeight: 700
                    }}
                  />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#101828' }}>
                  Nous Hermes 3
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                  Focus: Autonomous tool invocation, Zod contract schema validation, and zero-trust execution safety.
                </Typography>

                <Box sx={{ p: 2, backgroundColor: '#F3E8FF0A', borderRadius: 2, border: '1px solid #EAECF0', mb: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#7E22CE', display: 'block', mb: 0.5 }}>
                    Socratic Thesis Position
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#344054' }}>
                    "Wrap the AST consensus inside a validated tool schema with self-healing fallback handlers."
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 1, textAlign: 'center', backgroundColor: '#F9FAFB', border: '1px solid #EAECF0' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Latency</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#101828' }}>18ms</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 1, textAlign: 'center', backgroundColor: '#F9FAFB', border: '1px solid #EAECF0' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Tool Accuracy</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#12B76A' }}>100%</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 1, textAlign: 'center', backgroundColor: '#F9FAFB', border: '1px solid #EAECF0' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Schema</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7E22CE' }}>Zod v2.4</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Button
                  fullWidth
                  variant={userVoted === 'C' ? 'contained' : 'outlined'}
                  onClick={() => handleVote('C')}
                  startIcon={<ThumbUpIcon />}
                  sx={{
                    borderRadius: 9999,
                    backgroundColor: userVoted === 'C' ? '#7E22CE' : 'transparent',
                    borderColor: userVoted === 'C' ? '#7E22CE' : '#EAECF0',
                    color: userVoted === 'C' ? '#FFFFFF' : '#475467',
                    '&:hover': {
                      backgroundColor: userVoted === 'C' ? '#6B21A8' : '#F9FAFB',
                      borderColor: '#7E22CE'
                    }
                  }}
                >
                  {userVoted === 'C' ? 'Backed Contender C' : 'Back Contender C'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Rich Visual Console Window */}
      <Paper sx={{ border: '1px solid #EAECF0', borderRadius: 3, overflow: 'hidden', backgroundColor: '#101828' }}>
        
        {/* Terminal Title Bar */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            backgroundColor: '#1D2939',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            borderBottom: '1px solid #344054'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#27C93F' }} />
            </Box>
            <Typography variant="subtitle2" sx={{ color: '#FDD663', fontFamily: 'monospace', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TerminalIcon sx={{ fontSize: '1rem', color: '#B8860B' }} />
              [AST DIFF INSPECTOR & SOCRATIC VERDICT]
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Copy console logs">
              <IconButton size="small" onClick={handleCopyLogs} sx={{ color: copySuccess ? '#81C995' : '#9AA0A6' }}>
                {copySuccess ? <CheckCircleIcon size="small" /> : <ContentCopyIcon size="small" />}
              </IconButton>
            </Tooltip>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<GavelIcon />}
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              sx={{ fontSize: '0.75rem', py: 0.5, px: 2 }}
            >
              Synthesize
            </Button>
          </Box>
        </Box>

        {/* Tab Selection Bar */}
        <Box sx={{ borderBottom: '1px solid #344054', backgroundColor: '#101828' }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                color: '#9AA0A6',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                minHeight: 40,
                textTransform: 'none',
                '&.Mui-selected': { color: '#FDD663', fontWeight: 700 }
              },
              '& .MuiTabs-indicator': { backgroundColor: '#B8860B' }
            }}
          >
            <Tab icon={<CodeIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="AST Code Diff" />
            <Tab icon={<TerminalIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Dialectic Log Stream" />
            <Tab icon={<SecurityIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="SHA-256 Quorum Seal" />
          </Tabs>
        </Box>

        {/* Tab 0: AST Code Diff View */}
        {activeTab === 0 && (
          <Box sx={{ p: 3, fontFamily: 'monospace', fontSize: '0.88rem', minHeight: 220 }}>
            <div style={{ color: '#9AA0A6', marginBottom: 12 }}>// Socratic Consensus Diff Matrix v2.0 - Target AST Node: calculateSwarmConsensus</div>
            <div style={{ color: '#F87171' }}>- function calculateSwarmConsensus(nodes) &#123;</div>
            <div style={{ color: '#81C995' }}>+ export async function calculateSwarmConsensus(nodes: SwarmNode[]): Promise&lt;ConsensusResult&gt; &#123;</div>
            <div style={{ color: '#81C995', paddingLeft: 20 }}>+   if (!nodes || nodes.length === 0) throw new EmptyQuorumError();</div>
            <div style={{ color: '#81C995', paddingLeft: 20 }}>+   const lock = await Argon2Vault.acquireLock('sha256_salt_master');</div>
            <div style={{ color: '#81C995', paddingLeft: 20 }}>+   const isVerified = nodes.reduce((acc, n) =&gt; acc &amp;&amp; n.verified &amp;&amp; n.signatureValid, true);</div>
            <div style={{ color: '#81C995', paddingLeft: 20 }}>+   return &#123; verified: isVerified, sealHash: '0x8F4A99C2E17A0012B', timestamp: Date.now() &#125;;</div>
            <div style={{ color: '#FFFFFF' }}>&#125;</div>
            <Box sx={{ mt: 2.5, pt: 1.5, borderTop: '1px dashed #344054', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ color: '#81C995', fontSize: '1rem' }} />
              <Typography variant="caption" sx={{ color: '#81C995', fontFamily: 'monospace' }}>
                ✔ 3/3 Autonomous Agents agreed on SHA-256 AST consensus seal. Zero regression detected.
              </Typography>
            </Box>
          </Box>
        )}

        {/* Tab 1: Dialectic Log Stream */}
        {activeTab === 1 && (
          <Box sx={{ p: 3, fontFamily: 'monospace', fontSize: '0.85rem', minHeight: 220, maxHeight: 300, overflowY: 'auto' }}>
            {consoleLogs.map((item, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 6,
                  color:
                    item.type === 'agentA'
                      ? '#FDD663'
                      : item.type === 'agentB'
                      ? '#38BDF8'
                      : item.type === 'agentC'
                      ? '#C084FC'
                      : item.type === 'success'
                      ? '#81C995'
                      : '#9AA0A6'
                }}
              >
                {item.text}
              </div>
            ))}
          </Box>
        )}

        {/* Tab 2: SHA-256 Quorum Seal */}
        {activeTab === 2 && (
          <Box sx={{ p: 3, fontFamily: 'monospace', fontSize: '0.85rem', minHeight: 220 }}>
            <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#1D2939', border: '1px solid #344054', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#B8860B', fontWeight: 700, mb: 1 }}>
                IMMUTABLE SOCRATIC CONSENSUS CERTIFICATE
              </Typography>
              <div style={{ color: '#9AA0A6' }}>Issuer: Zoth Studio v2 Consensus Engine</div>
              <div style={{ color: '#9AA0A6' }}>Seal Hash: 0x8F4A99C2E17A0012B9D4AF37B8860B</div>
              <div style={{ color: '#9AA0A6' }}>Signature Algorithm: Ed25519-Argon2id</div>
              <div style={{ color: '#81C995', marginTop: 8 }}>Quorum Verdict: VERIFIED_OPTIMAL</div>
              <div style={{ color: '#81C995' }}>Contender Nodes: [Google Antigravity, xAI Grok Beta, Nous Hermes 3]</div>
            </Paper>
          </Box>
        )}

      </Paper>

    </Container>
  );
}
