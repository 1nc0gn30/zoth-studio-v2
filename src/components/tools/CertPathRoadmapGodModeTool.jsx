import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Card, CardContent, IconButton, Tooltip, Tabs, Tab, Alert, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  LinearProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CodeIcon from '@mui/icons-material/Code';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckIcon from '@mui/icons-material/Check';
import LaunchIcon from '@mui/icons-material/Launch';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TimelineIcon from '@mui/icons-material/Timeline';

import rawCertsData from '../../data/certsData.json';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// ---------------------------------------------------------------------------
// 6 Career Role Presets
// ---------------------------------------------------------------------------
const CAREER_ROLES = [
  {
    id: 'cloud_security_architect',
    title: 'Cloud Security Architect',
    desc: 'Zero-trust multi-cloud infrastructure and governance.',
    certs: ['net-plus', 'sec-plus', 'aws-csaa', 'aws-sec-spec', 'gcp-pca', 'ccsp'],
    category: 'Cyber Security'
  },
  {
    id: 'ai_ml_engineer',
    title: 'AI & ML Engineer',
    desc: 'Deploy and monitor scalable LLMs and ML pipelines.',
    certs: ['python-pcap', 'ds-ibm-data-science', 'ai-tf-developer', 'aws-mla', 'gcp-pde'],
    category: 'AI Development'
  },
  {
    id: 'fullstack_devops_lead',
    title: 'Full-Stack DevOps Lead',
    desc: 'CI/CD orchestration, Kubernetes clusters, and microservices.',
    certs: ['web-html-css', 'web-js-algorithms', 'linux-lpic1', 'k8s-cka', 'hashi-terraform-assoc', 'aws-dop'],
    category: 'Cloud Computing'
  },
  {
    id: 'penetration_tester',
    title: 'Penetration Tester / Red Team',
    desc: 'Offensive security, network exploitation, and vulnerability assessment.',
    certs: ['net-plus', 'sec-plus', 'pentest-plus', 'ejpt', 'oscp'],
    category: 'Cyber Security'
  },
  {
    id: 'data_platform_architect',
    title: 'Data Platform Architect',
    desc: 'Data lakes, real-time analytics, and enterprise ETL pipelines.',
    certs: ['sql-standalone', 'data-dbt-cert', 'snowflake-snowpro-core', 'databricks-de-assoc', 'aws-das'],
    category: 'Data Science'
  },
  {
    id: 'soc_analyst',
    title: 'SOC & Incident Response Analyst',
    desc: 'Threat hunting, telemetry analysis, and incident remediation.',
    certs: ['a-plus', 'net-plus', 'sec-plus', 'cysa-plus', 'splunk-core-power-user'],
    category: 'Cyber Security'
  }
];

const CATEGORIES = [
  'All',
  'Cloud Computing',
  'Cyber Security',
  'Software Development',
  'Data Science',
  'IT Management & Support',
  'AI Development',
  'Web Development'
];

export default function CertPathRoadmapGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // License State
  const [isLicensed, setIsLicensed] = useState(true);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [licenseStatusMsg, setLicenseStatusMsg] = useState('');

  // Tool State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCertId, setSelectedCertId] = useState('aws-csaa');
  const [viewTab, setViewTab] = useState(0); // 0: DAG Pathway Explorer, 1: Career Track Solver, 2: Cert Comparison
  const [compareCertId, setCompareCertId] = useState('gcp-pca');
  const [copiedPlan, setCopiedPlan] = useState(false);

  // License detection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramLicensed = urlParams.get('licensed') === 'true' || urlParams.get('session_id') !== null;
    const localLicensed = localStorage.getItem('pro_licensed') === 'true' ||
                          localStorage.getItem('certpath_pro_licensed') === 'true';

    if (paramLicensed || localLicensed) {
      setIsLicensed(true);
      if (paramLicensed) {
        localStorage.setItem('certpath_pro_licensed', 'true');
        localStorage.setItem('pro_licensed', 'true');
      }
    }
  }, []);

  const handleActivateLicense = () => {
    const clean = licenseKeyInput.trim();
    if (clean.length >= 4 || clean.toUpperCase().includes('CERTPATH') || clean.toUpperCase().includes('PRO') || clean.includes('@')) {
      setIsLicensed(true);
      localStorage.setItem('certpath_pro_licensed', 'true');
      localStorage.setItem('pro_licensed', 'true');
      setLicenseStatusMsg('⭐ License successfully activated! All CertPath features unlocked.');
      setTimeout(() => {
        setLicenseModalOpen(false);
        setLicenseStatusMsg('');
      }, 1200);
    } else {
      setLicenseStatusMsg('⚠️ Please enter a valid license key or receipt order ID.');
    }
  };

  // Certs Map index
  const certMap = useMemo(() => {
    const map = new Map();
    rawCertsData.forEach(c => map.set(c.id, c));
    return map;
  }, []);

  // Filtered Certs
  const filteredCerts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return rawCertsData.filter(c => {
      const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
      const matchQuery = !q || (
        c.title.toLowerCase().includes(q) ||
        c.provider.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.skillsGained && c.skillsGained.some(s => s.toLowerCase().includes(q)))
      );
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Selected Cert details
  const selectedCert = useMemo(() => {
    return certMap.get(selectedCertId) || rawCertsData[0];
  }, [selectedCertId, certMap]);

  // Comparison Cert details
  const compareCert = useMemo(() => {
    return certMap.get(compareCertId) || rawCertsData[1];
  }, [compareCertId, certMap]);

  // Grouped by level
  const levelGroups = useMemo(() => {
    const groups = { Entry: [], Intermediate: [], Advanced: [] };
    filteredCerts.forEach(c => {
      const lvl = c.level || 'Intermediate';
      if (groups[lvl]) groups[lvl].push(c);
      else groups.Intermediate.push(c);
    });
    return groups;
  }, [filteredCerts]);

  // Prerequisite chain calculation
  const prereqChain = useMemo(() => {
    const chain = [];
    const visited = new Set();
    function walk(id) {
      if (visited.has(id)) return;
      visited.add(id);
      const c = certMap.get(id);
      if (!c) return;
      if (c.prerequisites && c.prerequisites.length > 0) {
        c.prerequisites.forEach(pId => walk(pId));
      }
      chain.push(c);
    }
    walk(selectedCert.id);
    return chain;
  }, [selectedCert, certMap]);

  // Study Roadmap Markdown Generator
  const studyPlanMarkdown = useMemo(() => {
    let out = `# ${selectedCert.title} — Sovereign Career Study Plan\n\n`;
    out += `**Provider**: ${selectedCert.provider} | **Level**: ${selectedCert.level} | **Category**: ${selectedCert.category}\n\n`;
    out += `## Prerequisites DAG Pathway\n`;
    prereqChain.forEach((c, idx) => {
      out += `${idx + 1}. **${c.title}** (${c.provider} · ${c.level})\n`;
    });
    out += `\n## Core Competencies & Skills\n`;
    (selectedCert.skillsGained || []).forEach(s => {
      out += `- ${s}\n`;
    });
    out += `\n## Recommended Next Specializations\n`;
    (selectedCert.nextSteps || []).forEach(nid => {
      const nextC = certMap.get(nid);
      if (nextC) out += `- **${nextC.title}** (${nextC.provider})\n`;
    });
    return out;
  }, [selectedCert, prereqChain, certMap]);

  const handleCopyPlan = () => {
    if (!isLicensed) {
      setLicenseModalOpen(true);
      return;
    }
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(studyPlanMarkdown);
      setCopiedPlan(true);
      setTimeout(() => setCopiedPlan(false), 2000);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* --------------------------------------------------------------------- */}
      {/* HIGH-CONVERTING SALES BANNER ABOVE MAIN SECTION                       */}
      {/* --------------------------------------------------------------------- */}
      {!isLicensed && (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2.5,
            background: isDark
              ? 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(16,185,129,0.08) 100%)'
              : 'linear-gradient(135deg, #FEF9E7 0%, #ECFDF5 100%)',
            border: '1.5px solid rgba(212,175,55,0.4)',
            boxShadow: '0 8px 32px rgba(212,175,55,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'rgba(212,175,55,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D4AF37',
              }}
            >
              <SchoolIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                  CertPath Roadmap Pro — Lifetime Founding Pass
                </Typography>
                <Chip
                  label="68% OFF · $19 LIFETIME"
                  size="small"
                  sx={{
                    bgcolor: '#10B981',
                    color: '#08080B',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    fontFamily: mono,
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                Regular <span style={{ textDecoration: 'line-through' }}>$79</span>. Prerequisite DAG solver for 137 certifications, career track planners, side-by-side matrices, and study roadmap exports.
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Button
              variant="contained"
              href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                bgcolor: '#D4AF37',
                color: '#08080B',
                fontWeight: 800,
                fontSize: '0.82rem',
                fontFamily: mono,
                '&:hover': { bgcolor: '#F5E6AB' },
              }}
            >
              Stripe $19 USD 💳
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                const sol = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';
                navigator.clipboard?.writeText(sol);
                alert('Solana Receiver Address copied: ' + sol);
              }}
              sx={{
                borderColor: '#10B981',
                color: '#10B981',
                fontWeight: 800,
                fontSize: '0.82rem',
                fontFamily: mono,
                '&:hover': { borderColor: '#34D399', bgcolor: 'rgba(16,185,129,0.08)' },
              }}
            >
              Solana DePay ⚡
            </Button>
            <Button
              size="small"
              onClick={() => setLicenseModalOpen(true)}
              startIcon={<VpnKeyIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.78rem',
                fontFamily: mono,
                '&:hover': { color: '#D4AF37' },
              }}
            >
              Activate Key
            </Button>
          </Stack>
        </Paper>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* FILTER CONTROLS & SEARCH BAR                                          */}
      {/* --------------------------------------------------------------------- */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search 137 certifications (AWS, OSCP, CKA...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: '#D4AF37' }} />
                </InputAdornment>
              ),
              sx: { fontFamily: mono, fontSize: '0.82rem', minWidth: 280, bgcolor: isDark ? '#08080C' : '#FFFFFF' }
            }}
          />

          <Chip
            label={`${filteredCerts.length} / 137 Certs in Catalog`}
            size="small"
            sx={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.72rem',
              bgcolor: isDark ? '#161B22' : '#E2E8F0',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isLicensed ? (
            <Chip
              label="⭐ PRO ACTIVE"
              size="small"
              sx={{
                bgcolor: 'rgba(16,185,129,0.15)',
                color: '#10B981',
                fontWeight: 800,
                fontFamily: mono,
                fontSize: '0.72rem',
                border: '1px solid #10B981',
              }}
            />
          ) : (
            <Chip
              label="FREE EVALUATION"
              size="small"
              sx={{
                bgcolor: isDark ? 'rgba(212,175,55,0.12)' : '#FEF9E7',
                color: '#D4AF37',
                fontWeight: 800,
                fontFamily: mono,
                fontSize: '0.72rem',
                border: '1px solid rgba(212,175,55,0.3)',
              }}
            />
          )}
        </Box>
      </Box>

      {/* Category Pills */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            size="small"
            onClick={() => setSelectedCategory(cat)}
            sx={{
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              bgcolor: selectedCategory === cat ? (isDark ? 'rgba(212,175,55,0.2)' : '#FEF9E7') : (isDark ? '#08080C' : '#F1F5F9'),
              borderColor: selectedCategory === cat ? '#D4AF37' : theme.palette.divider,
              borderWidth: 1,
              borderStyle: 'solid',
              color: selectedCategory === cat ? '#D4AF37' : 'inherit',
            }}
          />
        ))}
      </Box>

      {/* --------------------------------------------------------------------- */}
      {/* MAIN TWO-PANE WORKSPACE: LEFT DAG CATALOG & RIGHT DETAILS / SOLVER    */}
      {/* --------------------------------------------------------------------- */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Left Column: Certifications by Level */}
        <Grid xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: isDark ? '#08080C' : '#FFFFFF',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountTreeIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: mono }}>
                  Certification Pathways & Prerequisites
                </Typography>
              </Box>

              <Tabs
                value={viewTab}
                onChange={(e, v) => setViewTab(v)}
                sx={{
                  minHeight: 32,
                  '& .MuiTab-root': { fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, minHeight: 32, py: 0.3, px: 1.2 }
                }}
              >
                <Tab label="Level Columns" />
                <Tab label="Career Roles" />
                <Tab label="Compare" />
              </Tabs>
            </Box>

            {/* TAB 0: LEVEL COLUMNS */}
            {viewTab === 0 && (
              <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 460 }}>
                {['Entry', 'Intermediate', 'Advanced'].map((lvl) => (
                  <Box key={lvl} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#D4AF37' }}>
                        {lvl.toUpperCase()} ({levelGroups[lvl]?.length || 0})
                      </Typography>
                      <Box sx={{ flex: 1, height: 1, bgcolor: theme.palette.divider }} />
                    </Box>

                    <Grid container spacing={1.5}>
                      {(levelGroups[lvl] || []).map((c) => (
                        <Grid key={c.id} xs={12} sm={6}>
                          <Paper
                            elevation={0}
                            onClick={() => setSelectedCertId(c.id)}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              cursor: 'pointer',
                              bgcolor: selectedCertId === c.id ? (isDark ? 'rgba(212,175,55,0.15)' : '#FEF9E7') : (isDark ? '#050508' : '#F8FAFC'),
                              borderColor: selectedCertId === c.id ? '#D4AF37' : theme.palette.divider,
                              borderWidth: 1.5,
                              borderStyle: 'solid',
                              transition: 'all 0.15s ease',
                              '&:hover': { borderColor: '#D4AF37' },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8', fontWeight: 700 }}>
                                {c.provider}
                              </Typography>
                              <Chip
                                label={c.category}
                                size="small"
                                sx={{ fontFamily: mono, fontSize: '0.58rem', height: 18 }}
                              />
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                              {c.title}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </Box>
            )}

            {/* TAB 1: CAREER ROLES PRESETS */}
            {viewTab === 1 && (
              <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 460 }}>
                <Grid container spacing={2}>
                  {CAREER_ROLES.map((role) => (
                    <Grid key={role.id} xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor: isDark ? '#050508' : '#F8FAFC',
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#D4AF37' }}>
                            {role.title}
                          </Typography>
                          <Chip label={role.category} size="small" sx={{ fontFamily: mono, fontSize: '0.62rem', height: 20 }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                          {role.desc}
                        </Typography>

                        <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                          RECOMMENDED MILESTONES:
                        </Typography>
                        <Stack spacing={0.5}>
                          {role.certs.map((cid, idx) => {
                            const c = certMap.get(cid);
                            return (
                              <Box
                                key={cid}
                                onClick={() => setSelectedCertId(cid)}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  p: 0.5,
                                  borderRadius: 1,
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: 'rgba(212,175,55,0.1)' }
                                }}
                              >
                                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#D4AF37', width: 18 }}>
                                  {idx + 1}.
                                </Typography>
                                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 600 }}>
                                  {c ? c.title : cid}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* TAB 2: CERT COMPARISON */}
            {viewTab === 2 && (
              <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 460 }}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid xs={6}>
                    <FormControl size="small" fullWidth>
                      <InputLabel sx={{ fontFamily: mono, fontSize: '0.8rem' }}>First Certification</InputLabel>
                      <Select
                        value={selectedCertId}
                        label="First Certification"
                        onChange={(e) => setSelectedCertId(e.target.value)}
                        sx={{ fontFamily: mono, fontSize: '0.82rem' }}
                      >
                        {rawCertsData.slice(0, 40).map(c => (
                          <MenuItem key={c.id} value={c.id} sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                            {c.title} ({c.provider})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid xs={6}>
                    <FormControl size="small" fullWidth>
                      <InputLabel sx={{ fontFamily: mono, fontSize: '0.8rem' }}>Second Certification</InputLabel>
                      <Select
                        value={compareCertId}
                        label="Second Certification"
                        onChange={(e) => setCompareCertId(e.target.value)}
                        sx={{ fontFamily: mono, fontSize: '0.82rem' }}
                      >
                        {rawCertsData.slice(0, 40).map(c => (
                          <MenuItem key={c.id} value={c.id} sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                            {c.title} ({c.provider})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid xs={6}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? '#050508' : '#F8FAFC' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#D4AF37' }}>
                        {selectedCert.title}
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8', display: 'block', mb: 1 }}>
                        {selectedCert.provider} · {selectedCert.level}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mb: 1.5 }}>
                        {selectedCert.description}
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, display: 'block', mb: 0.5 }}>
                        SKILLS GAINED:
                      </Typography>
                      {(selectedCert.skillsGained || []).map(s => (
                        <Chip key={s} label={s} size="small" sx={{ mr: 0.5, mb: 0.5, fontFamily: mono, fontSize: '0.62rem' }} />
                      ))}
                    </Paper>
                  </Grid>
                  <Grid xs={6}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? '#050508' : '#F8FAFC' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10B981' }}>
                        {compareCert.title}
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8', display: 'block', mb: 1 }}>
                        {compareCert.provider} · {compareCert.level}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mb: 1.5 }}>
                        {compareCert.description}
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, display: 'block', mb: 0.5 }}>
                        SKILLS GAINED:
                      </Typography>
                      {(compareCert.skillsGained || []).map(s => (
                        <Chip key={s} label={s} size="small" sx={{ mr: 0.5, mb: 0.5, fontFamily: mono, fontSize: '0.62rem' }} />
                      ))}
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Selected Cert Deep Dive & Prerequisite Tree */}
        <Grid xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: isDark ? '#08080C' : '#FFFFFF',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#D4AF37', lineHeight: 1.2 }}>
                  {selectedCert.title}
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8' }}>
                  {selectedCert.provider} · {selectedCert.level} · {selectedCert.category}
                </Typography>
              </Box>

              {selectedCert.link && (
                <IconButton
                  component="a"
                  href={selectedCert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{ color: '#D4AF37' }}
                >
                  <LaunchIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedCert.description}
            </Typography>

            {/* Prerequisite Chain Deck */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
                PREREQUISITE DEPENDENCY CHAIN ({prereqChain.length} STAGES):
              </Typography>
              <Stack spacing={1}>
                {prereqChain.map((c, idx) => (
                  <Box
                    key={c.id}
                    sx={{
                      p: 1.2,
                      borderRadius: 1.5,
                      bgcolor: c.id === selectedCert.id ? (isDark ? 'rgba(212,175,55,0.15)' : '#FEF9E7') : (isDark ? '#050508' : '#F8FAFC'),
                      border: `1px solid ${c.id === selectedCert.id ? '#D4AF37' : theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 900, color: '#D4AF37' }}>
                        #{idx + 1}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {c.title}
                      </Typography>
                    </Box>
                    <Chip label={c.level} size="small" sx={{ fontFamily: mono, fontSize: '0.62rem', height: 18 }} />
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Skills Gained */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.8 }}>
                VERIFIED SKILLS & CAPABILITIES:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {(selectedCert.skillsGained || []).map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    size="small"
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      bgcolor: isDark ? '#161B22' : '#E2E8F0',
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Study Plan Exporter (with blur if unpaying) */}
            <Box sx={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: 'text.secondary' }}>
                  STUDY ROADMAP EXPORT:
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleCopyPlan}
                  startIcon={copiedPlan ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    borderColor: 'rgba(212,175,55,0.4)',
                    color: '#D4AF37',
                  }}
                >
                  {copiedPlan ? 'Copied' : 'Copy Plan'}
                </Button>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: isDark ? '#040406' : '#F8FAFC',
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: 'auto',
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  filter: !isLicensed ? 'blur(5px)' : 'none',
                  userSelect: !isLicensed ? 'none' : 'text',
                  maxHeight: 180,
                }}
              >
                {studyPlanMarkdown}
              </Box>

              {!isLicensed && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0,0,0,0.3)',
                    borderRadius: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setLicenseModalOpen(true)}
                    startIcon={<LockIcon />}
                    sx={{
                      bgcolor: '#D4AF37',
                      color: '#08080B',
                      fontWeight: 800,
                      fontFamily: mono,
                      fontSize: '0.72rem',
                      '&:hover': { bgcolor: '#F5E6AB' },
                    }}
                  >
                    Unlock Study Roadmap ($19)
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* --------------------------------------------------------------------- */}
      {/* LICENSE ACTIVATION DIALOG                                             */}
      {/* --------------------------------------------------------------------- */}
      <Dialog
        open={licenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#0D0D12' : '#FFFFFF',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: mono, display: 'flex', alignItems: 'center', gap: 1 }}>
          <VpnKeyIcon sx={{ color: '#D4AF37' }} />
          Activate Pro License
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your receipt order ID, Stripe email, or custom license key to immediately unlock all features.
          </Typography>
          <TextField
            fullWidth
            autoFocus
            size="small"
            placeholder="e.g. CERTPATH-PRO-XXXX or receipt email"
            value={licenseKeyInput}
            onChange={(e) => setLicenseKeyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleActivateLicense();
            }}
            InputProps={{
              sx: { fontFamily: mono, fontSize: '0.88rem' }
            }}
          />
          {licenseStatusMsg && (
            <Alert
              severity={licenseStatusMsg.includes('⭐') ? 'success' : 'warning'}
              sx={{ mt: 2, fontFamily: mono, fontSize: '0.78rem' }}
            >
              {licenseStatusMsg}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLicenseModalOpen(false)} sx={{ color: 'text.secondary', fontFamily: mono }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleActivateLicense}
            sx={{
              bgcolor: '#D4AF37',
              color: '#08080B',
              fontWeight: 800,
              fontFamily: mono,
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            Activate Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
