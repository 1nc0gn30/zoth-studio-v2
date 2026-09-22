import React from 'react';
import { Box, Paper, Typography, Chip, Tooltip } from '@mui/material';

const partners = [
  { name: 'Google DeepMind', category: 'AI Model Engine', url: 'https://ai.google', color: '#4285F4', iconText: 'G' },
  { name: 'xAI Grok', category: 'Dialectic Synthesizer', url: 'https://x.ai', color: '#1DA1F2', iconText: 'xAI' },
  { name: 'Nous Research', category: 'Hermes Subagent', url: 'https://nousresearch.com', color: '#C084FC', iconText: 'NR' },
  { name: 'OpenAI', category: 'LLM Orchestrator', url: 'https://openai.com', color: '#10A37F', iconText: 'OAI' },
  { name: 'Anthropic', category: 'Claude Intelligence', url: 'https://anthropic.com', color: '#D97706', iconText: 'ANT' },
  { name: 'Meta Llama', category: 'Open Weights LLM', url: 'https://ai.meta.com', color: '#0668E1', iconText: 'META' },
  { name: 'Ollama', category: 'Local WASM/GGUF', url: 'https://ollama.com', color: '#101828', iconText: 'OLM' },
  { name: 'Vite', category: 'Build Engine', url: 'https://vitejs.dev', color: '#646CFF', iconText: 'VITE' },
  { name: 'React 18', category: 'UI Framework', url: 'https://react.dev', color: '#61DAFB', iconText: 'RCT' },
  { name: 'Material-UI', category: 'Design System', url: 'https://mui.com', color: '#007FFF', iconText: 'MUI' },
  { name: 'Tailwind CSS', category: 'Styling Engine', url: 'https://tailwindcss.com', color: '#38BDF8', iconText: 'TW' },
  { name: 'WebGPU (W3C)', category: 'In-Browser Compute', url: 'https://www.w3.org/TR/webgpu/', color: '#D4AF37', iconText: 'GPU' },
  { name: 'Three.js', category: '3D WebGL Rig', url: 'https://threejs.org', color: '#000000', iconText: '3JS' },
];

export default function CompanyTicker() {
  return (
    <Paper
      elevation={0}
      sx={{
        py: 2.5,
        px: 3,
        border: '1px solid #EAECF0',
        borderRadius: 2,
        bg: '#FAFAFA',
        mb: 6,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#101828', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 1 }}>
          ⚡ POWERED BY INDUSTRY-LEADING AI ENGINES &amp; FRAMEWORKS
        </Typography>
        <Chip label="13 ECOSYSTEM PARTNERS" size="small" sx={{ bg: '#FEF9E7', color: '#B8860B', fontWeight: 700, fontSize: '0.75rem' }} />
      </Box>

      {/* Clickable Partners Row */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          py: 1,
          px: 0.5,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bg: '#D4AF37', borderRadius: 2 }
        }}
      >
        {partners.map((p) => (
          <Tooltip title={`Visit ${p.name} (${p.category})`} key={p.name} arrow placement="top">
            <Box
              component="a"
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.2,
                px: 2,
                py: 1,
                borderRadius: 1.5,
                border: '1px solid #EAECF0',
                bg: '#FFFFFF',
                textDecoration: 'none',
                color: '#101828',
                transition: 'all 0.2s ease-in-out',
                flexShrink: 0,
                '&:hover': {
                  borderColor: '#D4AF37',
                  boxShadow: '0 4px 14px rgba(212, 175, 55, 0.2)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  bg: p.color,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.7rem',
                  fontFamily: 'monospace'
                }}
              >
                {p.iconText}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.2 }}>
                  {p.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                  {p.category}
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Paper>
  );
}
