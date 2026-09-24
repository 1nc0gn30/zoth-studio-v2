import React from 'react';
import { Box, Paper, Typography, Chip, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Real SVG Logos for Industry AI Engines & Frameworks
const SvgLogos = {
  deepmind: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#4285F4"/>
      <circle cx="12" cy="12" r="3" fill="#EA4335"/>
    </svg>
  ),
  grok: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 20L20 4M4 4L20 20" stroke="#1DA1F2" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="4" fill="#1DA1F2"/>
    </svg>
  ),
  nous: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L2 9L12 15L22 9L12 3Z" fill="#C084FC"/>
      <path d="M2 15L12 21L22 15" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  openai: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M22.2 14.4c-.2 1.3-.9 2.5-1.9 3.3l-3 1.7v-3.7l2.1-1.2c.7-.4 1.1-1.2 1.1-2.1 0-1.3-1.1-2.4-2.4-2.4h-1.2V7.6c.9-.4 2-.5 3.1-.2 2.1.6 3.6 2.5 3.6 4.7 0 .8-.3 1.6-1.4 2.3zM12 2.2c1.3 0 2.6.4 3.7 1.1l-3 1.7-3-1.7C10.8 2.6 11.4 2.2 12 2.2zm-7.2 4.1C6 5.5 7.3 5 8.7 5h4.2v3.7H10.8L8.7 9.9c-.7.4-1.1 1.2-1.1 2.1 0 1.3 1.1 2.4 2.4 2.4h1.2v2.4c-.9.4-2 .5-3.1.2-2.1-.6-3.6-2.5-3.6-4.7 0-.8.3-1.6 1.4-2.3zM1.8 9.6c.2-1.3.9-2.5 1.9-3.3l3-1.7v3.7L4.6 9.5c-.7.4-1.1 1.2-1.1 2.1 0 1.3 1.1 2.4 2.4 2.4h1.2V16.4c-.9.4-2 .5-3.1.2-2.1-.6-3.6-2.5-3.6-4.7 0-.8.3-1.6 1.4-2.3z" fill="#10A37F"/>
      <circle cx="12" cy="12" r="3" fill="#10A37F"/>
    </svg>
  ),
  anthropic: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M14 4H10L4 20H8L9.5 15H14.5L16 20H20L14 4ZM10.7 11.5L12 7.2L13.3 11.5H10.7Z" fill="#D97706"/>
    </svg>
  ),
  meta: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 12C9.5 7.5 7 5 4.5 5C2 5 0.5 7 0.5 9.5C0.5 13.5 4.5 19 8.5 19C10.5 19 11.8 17 12 16C12.2 17 13.5 19 15.5 19C19.5 19 23.5 13.5 23.5 9.5C23.5 7 22 5 19.5 5C17 5 14.5 7.5 12 12Z" fill="#0668E1"/>
    </svg>
  ),
  ollama: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="#101828"/>
      <circle cx="9" cy="10" r="2" fill="#FFFFFF"/>
      <circle cx="15" cy="10" r="2" fill="#FFFFFF"/>
      <path d="M8 15C9.5 16.5 14.5 16.5 16 15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  axolotl: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#F472B6"/>
      <path d="M7 9C7 9 9 7 12 7C15 7 17 9 17 9M9 13A1 1 0 1 1 9 11A1 1 0 0 1 9 13ZM15 13A1 1 0 1 1 15 11A1 1 0 0 1 15 13ZM9 16C10.5 17 13.5 17 15 16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  unsloth: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  vllm: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 4L10 20L12 14L14 20L20 4" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  dspy: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#0EA5E9"/>
      <path d="M7 7H17V11H7V7ZM7 13H14V17H7V13Z" fill="#FFFFFF"/>
    </svg>
  ),
  huggingface: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#FFD21E"/>
      <circle cx="8.5" cy="9.5" r="1.5" fill="#000"/>
      <circle cx="15.5" cy="9.5" r="1.5" fill="#000"/>
      <path d="M8 14.5C9.5 16.5 14.5 16.5 16 14.5" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  pytorch: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M13.5 2.5L16.8 5.8C18.5 7.5 19.5 9.8 19.5 12.2C19.5 16.6 15.9 20.2 11.5 20.2C7.1 20.2 3.5 16.6 3.5 12.2C3.5 9.8 4.5 7.5 6.2 5.8L7 5M16 6.5A1.5 1.5 0 1 1 13 6.5A1.5 1.5 0 0 1 16 6.5Z" stroke="#EE4C2C" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  langchain: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#1C3C3C"/>
      <path d="M7 12L12 7L17 12L12 17L7 12Z" stroke="#38BDF8" strokeWidth="2.5" strokeLinejoin="round"/>
    </svg>
  ),
  llamaindex: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 3H15L19 7V21H5V3Z" stroke="#8B5CF6" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M9 11H15M9 15H15" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  vite: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M21.5 3.5L12.5 21L2.5 3.5H7.5L12.5 14L16.5 3.5H21.5Z" fill="#646CFF"/>
      <path d="M16 3.5L11 13.5L8.5 8.5H3.5L11 22L18.5 8.5H16.5L16 3.5Z" fill="#BD34FE"/>
    </svg>
  ),
  react: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="12" rx="9" ry="3.8" stroke="#61DAFB" strokeWidth="1.8" transform="rotate(0 12 12)"/>
      <ellipse cx="12" cy="12" rx="9" ry="3.8" stroke="#61DAFB" strokeWidth="1.8" transform="rotate(60 12 12)"/>
      <ellipse cx="12" cy="12" rx="9" ry="3.8" stroke="#61DAFB" strokeWidth="1.8" transform="rotate(120 12 12)"/>
      <circle cx="12" cy="12" r="2" fill="#61DAFB"/>
    </svg>
  ),
  mui: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M2 6L12 1L22 6V18L12 23L2 18V6Z" stroke="#007FFF" strokeWidth="2.2" strokeLinejoin="round"/>
      <path d="M12 1V23M2 6L12 11L22 6M2 18L12 13L22 18" stroke="#007FFF" strokeWidth="1.8"/>
    </svg>
  ),
  tailwind: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6 12C6 9.5 7.5 8 10 8C13 8 13.5 10 15 10C16.5 10 17.5 9 18 8C18 10.5 16.5 12 14 12C11 12 10.5 10 9 10C7.5 10 6.5 11 6 12ZM2 17C2 14.5 3.5 13 6 13C9 13 9.5 15 11 15C12.5 15 13.5 14 14 13C14 15.5 12.5 17 10 17C7 17 6.5 15 5 15C3.5 15 2.5 16 2 17Z" fill="#38BDF8"/>
    </svg>
  ),
  webgpu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="#D4AF37" strokeWidth="2.2"/>
      <rect x="8" y="8" width="8" height="8" fill="#D4AF37"/>
      <path d="M12 1V4M12 20V23M1 12H4M20 12H23" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  threejs: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="#000000" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M12 2V22M3 7L21 17M3 17L21 7" stroke="#000000" strokeWidth="1.2"/>
    </svg>
  ),
  python: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M11.8 2C6.8 2 7.1 4.2 7.1 4.2V6.4H12V7.1H5.3C5.3 5.3 5.3 2 11.8 2ZM12.2 22C17.2 22 16.9 19.8 16.9 19.8V17.6H12V16.9H18.7C18.7 18.7 18.7 22 12.2 22Z" fill="#3776AB"/>
      <path d="M11.8 2C16.8 2 16.5 4.2 16.5 4.2V8.4H11.8V9.1H18.7C18.7 9.1 22 9.1 22 14.3C22 19.5 18.7 19.5 18.7 19.5H16.9V17.3H12.2V16.6H18.7V14.3C18.7 11.4 16.5 11.4 16.5 11.4H11.8V2Z" fill="#FFD43B"/>
    </svg>
  ),
  rust: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="#DEA584" strokeWidth="2.5"/>
      <path d="M12 2V5M12 19V22M2 12H5M19 12H22M4.9 4.9L7 7M17 17L19.1 19.1M19.1 4.9L17 7M7 17L4.9 19.1" stroke="#DEA584" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" fill="#DEA584"/>
    </svg>
  ),
};

const partners = [
  { name: 'Google DeepMind', category: 'AI Model Engine', url: 'https://ai.google', color: '#4285F4', logoKey: 'deepmind' },
  { name: 'xAI Grok', category: 'Dialectic Synthesizer', url: 'https://x.ai', color: '#1DA1F2', logoKey: 'grok' },
  { name: 'Nous Research', category: 'Hermes Subagent', url: 'https://nousresearch.com', color: '#C084FC', logoKey: 'nous' },
  { name: 'OpenAI', category: 'LLM Orchestrator', url: 'https://openai.com', color: '#10A37F', logoKey: 'openai' },
  { name: 'Anthropic', category: 'Claude Intelligence', url: 'https://anthropic.com', color: '#D97706', logoKey: 'anthropic' },
  { name: 'Meta Llama', category: 'Open Weights LLM', url: 'https://ai.meta.com', color: '#0668E1', logoKey: 'meta' },
  { name: 'Ollama', category: 'Local WASM/GGUF', url: 'https://ollama.com', color: '#101828', logoKey: 'ollama' },
  { name: 'Axolotl', category: 'LLM Fine-Tuning', url: 'https://github.com/axolotl-ai-cloud/axolotl', color: '#F472B6', logoKey: 'axolotl' },
  { name: 'Unsloth', category: 'Fast LoRA / QLoRA', url: 'https://unsloth.ai', color: '#F59E0B', logoKey: 'unsloth' },
  { name: 'vLLM', category: 'High-Throughput Serving', url: 'https://vllm.ai', color: '#6366F1', logoKey: 'vllm' },
  { name: 'DSPy', category: 'LM Program Optimization', url: 'https://github.com/stanfordnlp/dspy', color: '#0EA5E9', logoKey: 'dspy' },
  { name: 'Hugging Face', category: 'Model Hub & Datasets', url: 'https://huggingface.co', color: '#FFD21E', logoKey: 'huggingface' },
  { name: 'PyTorch', category: 'Tensor Deep Learning', url: 'https://pytorch.org', color: '#EE4C2C', logoKey: 'pytorch' },
  { name: 'LangChain', category: 'Agent Chains & Tools', url: 'https://langchain.com', color: '#1C3C3C', logoKey: 'langchain' },
  { name: 'LlamaIndex', category: 'RAG Vector Index', url: 'https://llamaindex.ai', color: '#8B5CF6', logoKey: 'llamaindex' },
  { name: 'Vite', category: 'Rapid Build Engine', url: 'https://vitejs.dev', color: '#646CFF', logoKey: 'vite' },
  { name: 'React 18', category: 'UI Component Tree', url: 'https://react.dev', color: '#61DAFB', logoKey: 'react' },
  { name: 'Material-UI', category: 'Design System', url: 'https://mui.com', color: '#007FFF', logoKey: 'mui' },
  { name: 'Tailwind CSS', category: 'Utility Styling', url: 'https://tailwindcss.com', color: '#38BDF8', logoKey: 'tailwind' },
  { name: 'WebGPU (W3C)', category: 'In-Browser Compute', url: 'https://www.w3.org/TR/webgpu/', color: '#D4AF37', logoKey: 'webgpu' },
  { name: 'Three.js', category: '3D WebGL Canvas', url: 'https://threejs.org', color: '#000000', logoKey: 'threejs' },
  { name: 'Python', category: 'Agent Runtime', url: 'https://python.org', color: '#3776AB', logoKey: 'python' },
  { name: 'Rust', category: 'High-Perf Core', url: 'https://rust-lang.org', color: '#DEA584', logoKey: 'rust' },
];

export default function CompanyTicker() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#B8860B';
  const goldSoft = isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';
  const goldBorder = isDark ? 'rgba(212,175,55,0.42)' : '#F0E1A8';
  return (
    <Paper
      elevation={0}
      sx={{
        py: 2.5,
        px: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        mb: 6,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 1 }}>
          ⚡ POWERED BY INDUSTRY-LEADING AI ENGINES, AGENT FRAMEWORKS &amp; COMPUTE
        </Typography>
        <Chip label={`${partners.length} INTEGRATED AI &amp; DEV PARTNERS`} size="small" sx={{ bgcolor: goldSoft, color: gold, fontWeight: 700, fontSize: '0.75rem', border: `1px solid ${goldBorder}` }} />
      </Box>

      {/* Clickable Partners Carousel Grid */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          maxWidth: '100%',
          py: 1,
          px: 0.5,
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: gold, borderRadius: 3 }
        }}
      >
        {partners.map((p) => (
          <Tooltip title={`Open ${p.name} (${p.category}) official site`} key={p.name} arrow placement="top">
            <Box
              component="a"
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.25,
                px: 2,
                py: 1.2,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
                textDecoration: 'none',
                color: theme.palette.text.primary,
                transition: 'all 0.2s ease-in-out',
                flexShrink: 0,
                '&:hover': {
                  borderColor: p.color || gold,
                  boxShadow: `0 4px 14px ${p.color}33`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: isDark ? 'rgba(212,175,55,0.10)' : '#F8FAFC',
                  border: `1px solid ${isDark ? 'rgba(212,175,55,0.20)' : '#F1F5F9'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {SvgLogos[p.logoKey]}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.2, color: theme.palette.text.primary }}>
                  {p.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', color: theme.palette.text.secondary }}>
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
