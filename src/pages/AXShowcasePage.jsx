import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LocalSystemDossier from '../components/LocalSystemDossier';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const serif = '"Cormorant Garamond", Georgia, serif';

const ENDPOINTS = [
  {
    path: '/.well-known/mcp.json',
    label: 'Model Context Protocol Manifest',
    desc: 'Machine-readable server capabilities, transport bindings, and tool schemas for instant MCP client discovery.',
  },
  {
    path: '/.well-known/agent.json',
    label: 'Agent Identity & Capability Card',
    desc: 'Structured autonomous agent descriptor declaring supported protocols, authentication posture, and repository endpoints.',
  },
  {
    path: '/llms.txt',
    label: 'Concise LLM Index',
    desc: 'Token-efficient architectural map of Zoth Studio, ZothOS, and all local tool repositories for frontier and local agents.',
  },
  {
    path: '/api/tools.json',
    label: '77-Tool Canonical Registry',
    desc: 'Single source of truth declaring every tool ID, GitHub clone URL, local loopback port, CLI command, and execution mode.',
  },
];

export default function AXShowcasePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const cardBg = isDark ? '#0E1016' : '#FFFFFF';
  const textPrimary = isDark ? '#F5F1E6' : '#101828';
  const textSecondary = isDark ? '#A8A29E' : '#334155';
  const hairline = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(16, 24, 40, 0.12)';
  const cyan = isDark ? '#22D3EE' : '#0E7490';

  return (
    <LocalSystemDossier
      tone="cyan"
      kicker="AGENT EXPERIENCE (AX) PROTOCOL"
      badges={['MCP MANIFESTS', 'LLMS.TXT + JSON-LD', '77-TOOL REGISTRY']}
      title="Machine-Readable Discovery for"
      accentWord="Autonomous Agents."
      subtitle="Human interfaces are only half the contract. The Agent Experience (AX) specification equips Zoth Studio and local repositories with deterministic manifests—/.well-known/mcp.json, /.well-known/agent.json, /llms.txt, and /api/tools.json—so coding agents discover, clone, and invoke tools without fragile DOM scraping."
      cloneCommand="git clone https://github.com/NullAITech/zoth-studio-v2.git && cd zoth-studio-v2"
      repoUrl="https://github.com/NullAITech/zoth-studio-v2"
      repoLabel="Get Zoth Studio Repo"
      docsRoute="/ax/docs"
      docsLabel="AX & MCP Specification"
      overviewTitle="Zero-Glue Tool Discovery Across Local Agents"
      overviewParagraphs={[
        'When an autonomous agent inspects a project or documentation domain, HTML styling and interactive widgets are wasted tokens. AX publishes canonical, schema-verified endpoints at predictable paths so agents resolve exact CLI flags, loopback ports, and GitHub clone URLs in a single HTTP or filesystem read.',
        'Cloning Zoth Studio v2 gives local agents (Hermes, Egregore, Claude Code, OpenCode, and Cursor) the complete 77-tool registry and local verification scripts (`npm run registry:check`) out of the box.',
      ]}
      pipelineSteps={[
        {
          label: 'Canonical Manifest Resolution',
          detail: 'Agents read /.well-known/mcp.json and /api/tools.json to enumerate all 77 tools, unique ports, and git repositories.',
        },
        {
          label: 'Typed Schema Binding',
          detail: 'OpenAPI and JSON Schema descriptors define exact CLI flags and MCP tool arguments without custom adapter code.',
        },
        {
          label: 'Local Clone & Execution',
          detail: 'Agents clone only the required standalone repository or invoke the pre-installed binary directly on ZothOS.',
        },
      ]}
      specs={[
        { key: 'MCP Discovery', value: '/.well-known/mcp.json' },
        { key: 'Agent Descriptor', value: '/.well-known/agent.json' },
        { key: 'LLM Context Map', value: '/llms.txt & /llms-full.txt' },
        { key: 'Tool Registry', value: 'public/api/tools.json (77 Tools)' },
        { key: 'Integrity Gate', value: 'python3 scripts/registry-check.py' },
        { key: 'Structured Graph', value: 'Schema.org JSON-LD @graph' },
      ]}
      quickstartLines={[
        '# Clone Zoth Studio v2 & validate the 77-tool AX registry locally',
        'git clone https://github.com/NullAITech/zoth-studio-v2.git',
        'cd zoth-studio-v2',
        'python3 scripts/registry-check.py',
      ]}
      capabilitiesKicker="AX STANDARDS"
      capabilitiesTitle="Four Pillars of Machine-Readable Tooling"
      capabilities={[
        {
          tag: 'DISCOVERY',
          title: 'Well-Known MCP & Agent Cards',
          desc: 'Standardized /.well-known endpoints let any MCP-aware runtime enumerate capabilities and transport contracts immediately.',
        },
        {
          tag: 'TOKEN HYGIENE',
          title: 'Structured /llms.txt Indexes',
          desc: 'Clean Markdown indexes give local and frontier coding models complete architectural grounding in minimal context tokens.',
        },
        {
          tag: 'REGISTRY',
          title: 'Collision-Free Port & Repo Ledger',
          desc: 'Every tool in public/api/tools.json is verified for unique loopback ports, valid schema fields, and live GitHub URLs.',
        },
        {
          tag: 'AEO GRAPH',
          title: 'Semantic JSON-LD Provenance',
          desc: 'Embedded SoftwareApplication and FAQPage graphs ensure accurate citation across search and answer engines.',
        },
      ]}
      funnelToolTitle="Zoth AX & MCP Discovery Suite"
      funnelToolTag="AGENT PROTOCOL"
      funnelToolDesc="Machine-readable MCP manifests, 77-tool JSON registry, and /llms.txt specifications bundled inside Zoth Studio v2."
    >
      {/* Live Machine-Readable Endpoints Table */}
      <Box>
        <Typography
          sx={{
            fontFamily: mono,
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: cyan,
            mb: 0.75,
          }}
        >
          LIVE PROTOCOL ENDPOINTS
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontFamily: serif,
            fontWeight: 600,
            fontSize: { xs: '1.75rem', md: '2.15rem' },
            color: textPrimary,
            mb: 3,
            lineHeight: 1.15,
          }}
        >
          Inspect Machine-Readable Manifests Directly
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {ENDPOINTS.map((ep) => (
            <Paper
              key={ep.path}
              elevation={0}
              sx={{
                p: 2.75,
                borderRadius: 2.5,
                bgcolor: cardBg,
                border: `1px solid ${hairline}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 1.5,
              }}
            >
              <Box>
                <Typography sx={{ fontFamily: mono, fontSize: '0.84rem', fontWeight: 700, color: cyan, mb: 0.5 }}>
                  {ep.path}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.96rem', color: textPrimary, mb: 0.75 }}>
                  {ep.label}
                </Typography>
                <Typography sx={{ fontSize: '0.86rem', lineHeight: 1.6, color: textSecondary }}>
                  {ep.desc}
                </Typography>
              </Box>
              <Box>
                <Button
                  component="a"
                  href={ep.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  variant="outlined"
                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: textPrimary,
                    borderColor: hairline,
                    '&:hover': { borderColor: cyan, color: cyan },
                  }}
                >
                  Open Raw Manifest
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </LocalSystemDossier>
  );
}
