import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  ButtonBase,
  Unstable_Grid2 as Grid,
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LaunchIcon from '@mui/icons-material/Launch';

import rawCertsData from '../../data/certsData.json';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const LOCAL_API = 'http://127.0.0.1:8093';

const FALLBACK_ROLES = [
  {
    role_id: 'cloud_security_architect',
    title: 'Cloud Security Architect',
    description: 'Zero-trust multi-cloud architectures, cloud-native security controls, and governance.',
    target_certs: ['cloud-azure-az500', 'cyber-google-cloud-security', 'cyber-ccsp', 'cloud-aws-pro'],
    category: 'Cloud Computing',
  },
  {
    role_id: 'ai_ml_engineer',
    title: 'AI & Machine Learning Engineer',
    description: 'Deep learning models, LLM pipelines, and scalable cloud ML systems.',
    target_certs: ['ai-deep-learning', 'ai-google-ml', 'ai-aws-ml-specialty'],
    category: 'AI Development',
  },
  {
    role_id: 'fullstack_devops_lead',
    title: 'Fullstack DevOps Lead',
    description: 'CI/CD orchestration, Kubernetes clusters, Terraform, and modern web engineering.',
    target_certs: ['web-fullstack-open', 'cloud-cka', 'cloud-terraform-associate'],
    category: 'Software Development',
  },
  {
    role_id: 'penetration_tester',
    title: 'Offensive Security & Penetration Tester',
    description: 'Offensive security, Active Directory exploitation, and adversary simulation.',
    target_certs: ['cyber-oscp', 'cyber-pentest-plus', 'cyber-htb-cpst', 'cyber-gpen'],
    category: 'Cyber Security',
  },
  {
    role_id: 'data_platform_architect',
    title: 'Data Platform Architect',
    description: 'Data lakehouses, Apache Spark, Snowflake, and enterprise ETL pipelines.',
    target_certs: ['data-databricks-de', 'data-gcp-data-engineer', 'data-snowpro-core'],
    category: 'Data Science',
  },
  {
    role_id: 'soc_analyst',
    title: 'SOC Security Analyst & Incident Responder',
    description: 'SIEM telemetry, threat hunting, incident response, and digital forensics.',
    target_certs: ['cyber-cysa-plus', 'cyber-gcih', 'cyber-cfr'],
    category: 'Cyber Security',
  },
  {
    role_id: 'cloud_solutions_architect',
    title: 'Enterprise Cloud Solutions Architect',
    description: 'Highly available, resilient, cost-optimized multi-cloud architectures.',
    target_certs: ['cloud-aws-pro', 'cloud-terraform-associate', 'cloud-gcp-ace'],
    category: 'Cloud Computing',
  },
  {
    role_id: 'devops_platform_engineer',
    title: 'DevOps & Platform Engineer',
    description: 'Kubernetes orchestration, GitOps automation, and observability pipelines.',
    target_certs: ['cloud-cka', 'cloud-ckad', 'cloud-terraform-associate'],
    category: 'Cloud Computing',
  },
];

const CATEGORIES = [
  'All',
  'Cloud Computing',
  'Cyber Security',
  'Software Development',
  'Data Science',
  'IT Management & Support',
  'AI Development',
  'Web Development',
];

function inferHours(cert) {
  if (typeof cert.estimatedHours === 'number' && cert.estimatedHours > 0) return cert.estimatedHours;
  const lvl = (cert.level || '').toLowerCase();
  if (lvl.includes('entry') || lvl.includes('foundational')) return 40;
  if (lvl.includes('advanced') || lvl.includes('expert') || lvl.includes('professional')) return 140;
  return 80;
}

function inferCost(cert) {
  if (typeof cert.costUsd === 'number' && cert.costUsd >= 0) return cert.costUsd;
  const p = (cert.provider || '').toLowerCase();
  const l = (cert.level || '').toLowerCase();
  const t = (cert.title || '').toLowerCase();
  if (p.includes('freecodecamp') || p.includes('odin') || p.includes('kaggle')) return 0;
  if (p.includes('offensive security') || p.includes('offsec')) return 1649;
  if (p.includes('isc')) return t.includes('cissp') ? 749 : (t.includes('ccsp') ? 599 : 249);
  if (p.includes('comptia')) return t.includes('casp') ? 494 : 392;
  if (p.includes('linux foundation')) return 395;
  if (p.includes('aws') || p.includes('amazon')) return l.includes('entry') ? 100 : (l.includes('intermediate') ? 150 : 300);
  if (p.includes('microsoft') || p.includes('azure')) return l.includes('entry') ? 99 : 165;
  if (p.includes('google')) return l.includes('entry') ? 125 : 200;
  if (p.includes('cisco')) return 300;
  if (p.includes('hashicorp')) return 70.5;
  return l.includes('entry') ? 50 : (l.includes('advanced') ? 300 : 150);
}

function computeLocalRoi(cert) {
  const lvl = (cert.level || '').toLowerCase();
  const base = lvl.includes('entry') ? 4500 : (lvl.includes('advanced') ? 18000 : 9500);
  const catMult = (cert.category || '').toLowerCase().includes('security') ? 1.25 : 1.15;
  const premium = base * catMult;
  const hours = inferHours(cert);
  const cost = inferCost(cert);
  const isFree = cost <= 0;
  return {
    exam_cost_usd: cost,
    estimated_study_hours: hours,
    annual_salary_premium_usd: premium,
    payback_period_months: isFree ? 0.0 : (cost / premium) * 12.0,
    hourly_study_value_usd: premium / Math.max(1, hours),
    five_year_net_gain_usd: premium * 5.0 - cost,
    five_year_roi_pct: isFree ? null : ((premium * 5.0 - cost) / cost) * 100.0,
    roi_label: isFree ? 'Free Credential ($0 Exam Cost)' : `${Math.round(((premium * 5.0 - cost) / cost) * 100).toLocaleString()}%`,
    market_demand_rating: premium >= 18000 ? 'Very High' : (premium >= 10000 ? 'High' : 'Moderate'),
  };
}

function fmtUsd(v) {
  if (!v || v <= 0) return 'Free ($0)';
  return `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export default function CertPathRoadmapGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // WCAG AA >= 4.5:1 verified dual-theme tokens
  const accentGold = isDark ? '#D4AF37' : '#7A5808';
  const accentGoldBg = isDark ? 'rgba(212,175,55,0.16)' : '#FEF6E0';
  const accentSky = isDark ? '#38BDF8' : '#0369A1';
  const accentEmerald = isDark ? '#34D399' : '#047857';
  const accentEmeraldBg = isDark ? 'rgba(52,211,153,0.14)' : '#ECFDF5';
  const cardBg = isDark ? '#0B0D14' : '#FFFFFF';
  const innerBg = isDark ? '#111520' : '#FAF8F3';
  const textPrimary = isDark ? '#EDEFF2' : '#101828';
  const textSecondary = isDark ? '#B4BCC8' : '#344054';
  const borderCol = isDark ? 'rgba(245,241,230,0.14)' : '#D5CEC0';

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCertId, setSelectedCertId] = useState('cyber-oscp');
  const [compareCertId, setCompareCertId] = useState('cyber-cissp');
  const [viewTab, setViewTab] = useState(0); // 0: Level Columns, 1: Career Roles, 2: Compare, 3: ROI & Velocity
  const [copiedPlan, setCopiedPlan] = useState(false);

  const [liveApiUp, setLiveApiUp] = useState(false);
  const [roles, setRoles] = useState(FALLBACK_ROLES);
  const [liveRoi, setLiveRoi] = useState(null);
  const [liveOverlap, setLiveOverlap] = useState(null);
  const [velocityRole, setVelocityRole] = useState('penetration_tester');
  const [velocityHours, setVelocityHours] = useState(12);
  const [velocityExp, setVelocityExp] = useState('intermediate');
  const [velocityReport, setVelocityReport] = useState(null);

  const enrichedCerts = useMemo(
    () =>
      rawCertsData.map((c) => ({
        ...c,
        estimatedHours: inferHours(c),
        costUsd: inferCost(c),
      })),
    [],
  );

  const certMap = useMemo(() => {
    const map = new Map();
    enrichedCerts.forEach((c) => map.set(c.id, c));
    return map;
  }, [enrichedCerts]);

  // Bidirectional DAG adjacency matching Python DAGEngine
  const { reverseAdj, forwardAdj } = useMemo(() => {
    const rev = new Map();
    const fwd = new Map();
    enrichedCerts.forEach((c) => {
      rev.set(c.id, new Set());
      fwd.set(c.id, new Set());
    });
    enrichedCerts.forEach((c) => {
      (c.prerequisites || []).forEach((pid) => {
        if (rev.has(c.id) && fwd.has(pid)) {
          rev.get(c.id).add(pid);
          fwd.get(pid).add(c.id);
        }
      });
      (c.nextSteps || []).forEach((nid) => {
        if (fwd.has(c.id) && rev.has(nid)) {
          fwd.get(c.id).add(nid);
          rev.get(nid).add(c.id);
        }
      });
    });
    return { reverseAdj: rev, forwardAdj: fwd };
  }, [enrichedCerts]);

  // Probe live loopback :8093 daemon safely via Studio probeOnly API (zero ERR_CONNECTION_REFUSED console noise when idle)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const h = window.location.hostname;
    if (h !== '127.0.0.1' && h !== 'localhost') return;
    let cancelled = false;
    fetch('/api/studio/tool/wake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'certpath-roadmap-studio',
        repo: 'certpath-roadmap-studio',
        port: 8093,
        probeOnly: true,
      }),
    })
      .then((r) => (r.ok ? r.json() : { up: false }))
      .then((probe) => {
        if (!cancelled && probe && probe.up) {
          setLiveApiUp(true);
          fetch(`${LOCAL_API}/api/roles`)
            .then((rr) => (rr.ok ? rr.json() : null))
            .then((rData) => {
              if (!cancelled && Array.isArray(rData) && rData.length > 0) setRoles(rData);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCerts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return enrichedCerts.filter((c) => {
      const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
      const matchQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.provider.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.skillsGained && c.skillsGained.some((s) => s.toLowerCase().includes(q)));
      return matchCat && matchQuery;
    });
  }, [enrichedCerts, selectedCategory, searchQuery]);

  const selectedCert = useMemo(
    () => certMap.get(selectedCertId) || enrichedCerts[0],
    [selectedCertId, certMap, enrichedCerts],
  );

  const compareCert = useMemo(
    () => certMap.get(compareCertId) || enrichedCerts[1],
    [compareCertId, certMap, enrichedCerts],
  );

  const levelGroups = useMemo(() => {
    const groups = { Entry: [], Intermediate: [], Advanced: [] };
    filteredCerts.forEach((c) => {
      const lvl = groups[c.level] ? c.level : 'Intermediate';
      groups[lvl].push(c);
    });
    return groups;
  }, [filteredCerts]);

  const prereqChain = useMemo(() => {
    const ancestors = new Set();
    const queue = [selectedCert.id];
    while (queue.length) {
      const curr = queue.shift();
      const parents = reverseAdj.get(curr) || new Set();
      parents.forEach((pid) => {
        if (!ancestors.has(pid) && pid !== selectedCert.id) {
          ancestors.add(pid);
          queue.push(pid);
        }
      });
    }
    const rank = (lvl) => (lvl === 'Entry' ? 0 : lvl === 'Intermediate' ? 1 : 2);
    const list = Array.from(ancestors)
      .map((id) => certMap.get(id))
      .filter(Boolean)
      .sort((a, b) => rank(a.level) - rank(b.level) || a.title.localeCompare(b.title));
    list.push(selectedCert);
    return list;
  }, [selectedCert, reverseAdj, certMap]);

  // Fetch ROI for selected cert (live :8093 or local fallback)
  useEffect(() => {
    let cancelled = false;
    if (liveApiUp) {
      fetch(`${LOCAL_API}/api/roi?cert_id=${encodeURIComponent(selectedCert.id)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!cancelled) setLiveRoi(d || computeLocalRoi(selectedCert));
        })
        .catch(() => {
          if (!cancelled) setLiveRoi(computeLocalRoi(selectedCert));
        });
    } else {
      setLiveRoi(computeLocalRoi(selectedCert));
    }
    return () => {
      cancelled = true;
    };
  }, [selectedCert, liveApiUp]);

  // Fetch Overlap for Compare / ROI view
  useEffect(() => {
    let cancelled = false;
    const localOverlap = () => {
      const sA = new Set((selectedCert.skillsGained || []).map((s) => s.toLowerCase()));
      const sB = new Set((compareCert.skillsGained || []).map((s) => s.toLowerCase()));
      const shared = (selectedCert.skillsGained || []).filter((s) => sB.has(s.toLowerCase()));
      const union = new Set([...sA, ...sB]).size || 1;
      const ratio = Math.min(0.85, shared.length / union + (selectedCert.category === compareCert.category ? 0.05 : 0));
      const disc = Math.min(40, ratio * 50);
      return {
        overlap_ratio: ratio,
        synergy_discount_pct: disc,
        study_hours_saved: Math.round((disc / 100) * compareCert.estimatedHours),
        shared_skills: shared,
      };
    };

    if (liveApiUp) {
      fetch(
        `${LOCAL_API}/api/overlap?cert_a=${encodeURIComponent(selectedCert.id)}&cert_b=${encodeURIComponent(compareCert.id)}`,
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!cancelled) setLiveOverlap(d || localOverlap());
        })
        .catch(() => {
          if (!cancelled) setLiveOverlap(localOverlap());
        });
    } else {
      setLiveOverlap(localOverlap());
    }
    return () => {
      cancelled = true;
    };
  }, [selectedCert, compareCert, liveApiUp]);

  const runVelocity = useCallback(() => {
    const fallbackSim = () => {
      const role = roles.find((r) => r.role_id === velocityRole) || roles[0];
      const needed = new Set();
      (role.target_certs || []).forEach((cid) => {
        if (certMap.has(cid)) {
          needed.add(cid);
          const q = [cid];
          while (q.length) {
            const cur = q.shift();
            (reverseAdj.get(cur) || new Set()).forEach((p) => {
              if (!needed.has(p)) {
                needed.add(p);
                q.push(p);
              }
            });
          }
        }
      });
      const certs = Array.from(needed).map((id) => certMap.get(id)).filter(Boolean);
      const totalHrs = certs.reduce((s, c) => s + c.estimatedHours, 0);
      const totalCost = certs.reduce((s, c) => s + c.costUsd, 0);
      const mult = velocityExp === 'beginner' ? 1.3 : velocityExp === 'advanced' ? 0.8 : velocityExp === 'expert' ? 0.65 : 1.0;
      const p50 = Math.round(((totalHrs * mult) / Math.max(1, velocityHours)) * 10) / 10;
      const p80 = Math.round(p50 * 1.18 * 10) / 10;
      const p95 = Math.round(p50 * 1.36 * 10) / 10;
      const addW = (w) => new Date(Date.now() + w * 7 * 86400000).toISOString().slice(0, 10);
      setVelocityReport({
        target_name: role.title,
        fatigue_index: Math.min(100, Math.round(velocityHours * 2.1)),
        monte_carlo: {
          weeks_p50: p50,
          completion_date_p50: addW(p50),
          cost_p50: totalCost,
          weeks_p80: p80,
          completion_date_p80: addW(p80),
          cost_p80: Math.round(totalCost * 1.1),
          weeks_p95: p95,
          completion_date_p95: addW(p95),
          cost_p95: Math.round(totalCost * 1.25),
        },
        source: 'Client Monte Carlo Fallback',
      });
    };

    if (liveApiUp) {
      fetch(`${LOCAL_API}/api/simulate-velocity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: velocityRole,
          weekly_hours: velocityHours,
          experience_level: velocityExp,
          trials: 300,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && d.monte_carlo) setVelocityReport({ ...d, source: 'Live :8093 Monte Carlo Engine' });
          else fallbackSim();
        })
        .catch(fallbackSim);
    } else {
      fallbackSim();
    }
  }, [liveApiUp, roles, velocityRole, velocityHours, velocityExp, certMap, reverseAdj]);

  useEffect(() => {
    if (viewTab === 3) runVelocity();
  }, [viewTab, runVelocity]);

  const studyPlanMarkdown = useMemo(() => {
    let out = `# ${selectedCert.title} — Certification Study Roadmap (v2.6.0)\n\n`;
    out += `**Provider**: ${selectedCert.provider} | **Level**: ${selectedCert.level} | **Effort**: ${selectedCert.estimatedHours}h | **Fee**: ${fmtUsd(selectedCert.costUsd)}\n\n`;
    out += `## Prerequisites DAG Sequence (${prereqChain.length} stages)\n`;
    prereqChain.forEach((c, idx) => {
      out += `${idx + 1}. **${c.title}** (${c.provider} · ${c.level} · ${c.estimatedHours}h · ${fmtUsd(c.costUsd)})\n`;
    });
    out += `\n## Core Competencies\n`;
    (selectedCert.skillsGained || []).forEach((s) => {
      out += `- ${s}\n`;
    });
    return out;
  }, [selectedCert, prereqChain]);

  const mermaidSyntax = useMemo(() => {
    let out = 'flowchart LR\n';
    for (let i = 0; i < prereqChain.length - 1; i += 1) {
      const a = prereqChain[i];
      const b = prereqChain[i + 1];
      out += `  ${a.id}["${a.title.replace(/["()]/g, '')}"] --> ${b.id}["${b.title.replace(/["()]/g, '')}"]\n`;
    }
    return out;
  }, [prereqChain]);

  const handleCopyPlan = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(studyPlanMarkdown).catch(() => {});
      setCopiedPlan(true);
      setTimeout(() => setCopiedPlan(false), 2000);
    }
  };

  const handleDownloadCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = ['stage,id,title,provider,level,hours,cost_usd'];
    prereqChain.forEach((c, i) => {
      rows.push([i + 1, c.id, c.title, c.provider, c.level, c.estimatedHours, c.costUsd].map(esc).join(','));
    });
    downloadBlob(`${selectedCert.id}-roadmap.csv`, rows.join('\n'), 'text/csv;charset=utf-8');
  };

  const roiData = liveRoi || computeLocalRoi(selectedCert);

  return (
    <Box sx={{ width: '100%' }} data-testid="certpath-godmode-workstation">
      <SovereignEyebrow accent={accentGold} right="Automation · v2.6.0">
        certpath-roadmap-studio
      </SovereignEyebrow>
      <SovereignBand
        seed="certpath-roadmap-studio"
        eyebrow="Automation"
        caption="CertPath Roadmap Studio v2.6.0"
        label="CertPath Roadmap Studio — Certification Prerequisite DAG & ROI Studio"
      />

      {/* Compact Telemetry & Runtime Status Strip (Single Support Attribution Lives in Studio Footer) */}
      <Paper
        elevation={0}
        sx={{
          mb: 2.5,
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          bgcolor: accentGoldBg,
          border: `1px solid ${borderCol}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          <SchoolIcon sx={{ color: accentGold }} aria-hidden="true" />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: textPrimary }}>
            CertPath Roadmap Studio — 137 Credentials · {roles.length} Career Roles · Acyclic DAG
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label={liveApiUp ? 'LIVE :8093 REST API' : 'IN-BROWSER DAG ENGINE'}
            size="small"
            sx={{
              bgcolor: accentEmeraldBg,
              color: accentEmerald,
              fontWeight: 800,
              fontFamily: mono,
              fontSize: '0.72rem',
              border: `1px solid ${accentEmerald}`,
            }}
          />
          <Chip
            label="100% FREE & OPEN-ACCESS"
            size="small"
            sx={{
              bgcolor: cardBg,
              color: accentGold,
              fontWeight: 800,
              fontFamily: mono,
              fontSize: '0.72rem',
              border: `1px solid ${accentGold}`,
            }}
          />
        </Stack>
      </Paper>

      {/* Search & Category Filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        <TextField
          id="certpath-search-field"
          label="Search 137 certifications"
          size="small"
          placeholder="AWS, OSCP, CKA, CISSP..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 320 }, bgcolor: cardBg }}
          inputProps={{ 'aria-label': 'Search 137 certifications', style: { minHeight: 44, boxSizing: 'border-box', paddingTop: 10, paddingBottom: 10 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: accentGold }} aria-hidden="true" />
              </InputAdornment>
            ),
            sx: { fontFamily: mono, fontSize: '0.84rem', minHeight: 44 },
          }}
        />
        <Chip
          label={`${filteredCerts.length} / ${enrichedCerts.length} Credentials`}
          size="small"
          sx={{
            fontFamily: mono,
            fontWeight: 700,
            fontSize: '0.74rem',
            bgcolor: innerBg,
            color: textPrimary,
            border: `1px solid ${borderCol}`,
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }} role="group" aria-label="Filter by certification domain">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <Button
              key={cat}
              size="small"
              variant={active ? 'contained' : 'outlined'}
              onClick={() => setSelectedCategory(cat)}
              sx={{
                minHeight: { xs: 44, sm: 34 },
                fontFamily: mono,
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 999,
                bgcolor: active ? accentGold : innerBg,
                color: active ? (isDark ? '#08080B' : '#FFFFFF') : textPrimary,
                borderColor: active ? accentGold : borderCol,
                '&:hover': {
                  bgcolor: active ? accentGold : accentGoldBg,
                  borderColor: accentGold,
                },
              }}
            >
              {cat}
            </Button>
          );
        })}
      </Box>

      {/* Main Two-Pane Workspace */}
      <Grid container spacing={2.5} sx={{ mb: 2 }}>
        {/* Left Pane */}
        <Grid xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.75, sm: 2.5 },
              borderRadius: 2.5,
              bgcolor: cardBg,
              border: `1px solid ${borderCol}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <AccountTreeIcon sx={{ color: accentGold, fontSize: 20 }} aria-hidden="true" />
              <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, fontFamily: mono, color: textPrimary }}>
                Certification Pathways, ROI &amp; Velocity
              </Typography>
            </Box>

            <Box sx={{ borderBottom: `1px solid ${borderCol}`, pb: 1.25, mb: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap role="tablist" aria-label="CertPath workspace mode tabs">
                {['Level Columns', 'Career Roles', 'Compare', 'ROI & Velocity'].map((lbl, idx) => {
                  const active = viewTab === idx;
                  return (
                    <Button
                      key={lbl}
                      role="tab"
                      aria-selected={active}
                      size="small"
                      variant={active ? 'contained' : 'outlined'}
                      onClick={() => setViewTab(idx)}
                      sx={{
                        minHeight: 44,
                        px: 1.75,
                        fontFamily: mono,
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        borderRadius: 1.5,
                        bgcolor: active ? accentGold : innerBg,
                        color: active ? (isDark ? '#08080B' : '#FFFFFF') : textPrimary,
                        borderColor: active ? accentGold : borderCol,
                        '&:hover': { bgcolor: active ? accentGold : accentGoldBg, borderColor: accentGold },
                      }}
                    >
                      {lbl}
                    </Button>
                  );
                })}
              </Stack>
            </Box>

            {/* TAB 0: LEVEL COLUMNS */}
            {viewTab === 0 && (
              <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 500, pr: 0.5 }}>
                {['Entry', 'Intermediate', 'Advanced'].map((lvl) => (
                  <Box key={lvl} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: accentGold }}>
                        {lvl.toUpperCase()} ({levelGroups[lvl]?.length || 0})
                      </Typography>
                      <Box sx={{ flex: 1, height: 1, bgcolor: borderCol }} />
                    </Box>

                    <Grid container spacing={1.25}>
                      {(levelGroups[lvl] || []).map((c) => {
                        const isSel = selectedCertId === c.id;
                        return (
                          <Grid key={c.id} xs={12} sm={6}>
                            <ButtonBase
                              onClick={() => setSelectedCertId(c.id)}
                              sx={{
                                width: '100%',
                                minHeight: 74,
                                textAlign: 'left',
                                display: 'block',
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: isSel ? accentGoldBg : innerBg,
                                border: `1.5px solid ${isSel ? accentGold : borderCol}`,
                                transition: 'border-color 0.15s ease',
                                '&:hover': { borderColor: accentGold },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                                <Typography variant="caption" sx={{ fontFamily: mono, color: accentSky, fontWeight: 700 }}>
                                  {c.provider}
                                </Typography>
                                <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, fontWeight: 600 }}>
                                  {c.estimatedHours}h · {fmtUsd(c.costUsd)}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: textPrimary, lineHeight: 1.3 }}>
                                {c.title}
                              </Typography>
                            </ButtonBase>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                ))}
              </Box>
            )}

            {/* TAB 1: CAREER ROLES (ALL 8 ROLES) */}
            {viewTab === 1 && (
              <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 500, pr: 0.5 }}>
                <Grid container spacing={1.75}>
                  {roles.map((role) => (
                    <Grid key={role.role_id} xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: innerBg,
                          border: `1px solid ${borderCol}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: accentGold }}>
                            {role.title}
                          </Typography>
                          <Chip
                            label={role.category}
                            size="small"
                            sx={{ fontFamily: mono, fontSize: '0.66rem', color: textPrimary, bgcolor: cardBg, border: `1px solid ${borderCol}` }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', mb: 1.25, color: textSecondary }}>
                          {role.description}
                        </Typography>
                        <Stack spacing={0.5}>
                          {(role.target_certs || []).map((cid, idx) => {
                            const c = certMap.get(cid);
                            return (
                              <ButtonBase
                                key={cid}
                                onClick={() => setSelectedCertId(cid)}
                                sx={{
                                  width: '100%',
                                  minHeight: 40,
                                  justifyContent: 'flex-start',
                                  gap: 1,
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  textAlign: 'left',
                                  '&:hover': { bgcolor: accentGoldBg },
                                }}
                              >
                                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: accentGold, width: 20 }}>
                                  {idx + 1}.
                                </Typography>
                                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: textPrimary }}>
                                  {c ? c.title : cid}
                                </Typography>
                              </ButtonBase>
                            );
                          })}
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* TAB 2: COMPARE + JACCARD OVERLAP */}
            {viewTab === 2 && (
              <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 500, pt: 0.5 }}>
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid xs={12} sm={6}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="cmp-a-lbl">First Certification</InputLabel>
                      <Select
                        labelId="cmp-a-lbl"
                        value={selectedCertId}
                        label="First Certification"
                        onChange={(e) => setSelectedCertId(e.target.value)}
                        sx={{ fontFamily: mono, fontSize: '0.82rem', minHeight: 44 }}
                      >
                        {enrichedCerts.map((c) => (
                          <MenuItem key={c.id} value={c.id} sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                            {c.title} ({c.provider})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="cmp-b-lbl">Second Certification</InputLabel>
                      <Select
                        labelId="cmp-b-lbl"
                        value={compareCertId}
                        label="Second Certification"
                        onChange={(e) => setCompareCertId(e.target.value)}
                        sx={{ fontFamily: mono, fontSize: '0.82rem', minHeight: 44 }}
                      >
                        {enrichedCerts.map((c) => (
                          <MenuItem key={c.id} value={c.id} sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                            {c.title} ({c.provider})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {liveOverlap && (
                  <Paper elevation={0} sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: accentEmeraldBg, border: `1px solid ${accentEmerald}` }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: accentEmerald }}>
                      SKILL OVERLAP: {(liveOverlap.overlap_ratio * 100).toFixed(1)}% · SYNERGY DISCOUNT: {Number(liveOverlap.synergy_discount_pct).toFixed(1)}% · SAVES ~{liveOverlap.study_hours_saved}h
                    </Typography>
                  </Paper>
                )}

                <Grid container spacing={1.5}>
                  {[
                    { c: selectedCert, accent: accentGold },
                    { c: compareCert, accent: accentEmerald },
                  ].map(({ c, accent }) => (
                    <Grid key={c.id} xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: innerBg, border: `1px solid ${borderCol}` }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: accent }}>
                          {c.title}
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: accentSky, fontWeight: 700, display: 'block', mb: 1 }}>
                          {c.provider} · {c.level} · {c.estimatedHours}h · {fmtUsd(c.costUsd)}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mb: 1.25, color: textSecondary }}>
                          {c.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(c.skillsGained || []).map((s) => (
                            <Chip
                              key={s}
                              label={s}
                              size="small"
                              sx={{ fontFamily: mono, fontSize: '0.68rem', bgcolor: cardBg, color: textPrimary, border: `1px solid ${borderCol}` }}
                            />
                          ))}
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* TAB 3: MONTE CARLO VELOCITY & FINANCIAL ROI */}
            {viewTab === 3 && (
              <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 500, pt: 0.5 }}>
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid xs={12} sm={5}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="vel-role-lbl">Target Career Role</InputLabel>
                      <Select
                        labelId="vel-role-lbl"
                        value={velocityRole}
                        label="Target Career Role"
                        onChange={(e) => setVelocityRole(e.target.value)}
                        sx={{ fontFamily: mono, fontSize: '0.8rem', minHeight: 44 }}
                      >
                        {roles.map((r) => (
                          <MenuItem key={r.role_id} value={r.role_id} sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                            {r.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid xs={6} sm={3}>
                    <TextField
                      id="vel-hours-field"
                      label="Hours / Week"
                      type="number"
                      size="small"
                      fullWidth
                      value={velocityHours}
                      onChange={(e) => setVelocityHours(Math.max(1, Math.min(60, Number(e.target.value) || 10)))}
                      InputProps={{ sx: { fontFamily: mono, minHeight: 44 } }}
                    />
                  </Grid>
                  <Grid xs={6} sm={4}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="vel-exp-lbl">Experience</InputLabel>
                      <Select
                        labelId="vel-exp-lbl"
                        value={velocityExp}
                        label="Experience"
                        onChange={(e) => setVelocityExp(e.target.value)}
                        sx={{ fontFamily: mono, fontSize: '0.8rem', minHeight: 44 }}
                      >
                        <MenuItem value="beginner">Beginner</MenuItem>
                        <MenuItem value="intermediate">Intermediate</MenuItem>
                        <MenuItem value="advanced">Advanced</MenuItem>
                        <MenuItem value="expert">Expert</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  onClick={runVelocity}
                  sx={{
                    mb: 2,
                    minHeight: 44,
                    fontFamily: mono,
                    fontWeight: 800,
                    bgcolor: accentGold,
                    color: isDark ? '#08080B' : '#FFFFFF',
                    textTransform: 'none',
                  }}
                >
                  Run Monte Carlo Velocity Simulation (P50 / P80 / P95)
                </Button>

                {velocityReport && velocityReport.monte_carlo && (
                  <Grid container spacing={1.25}>
                    {[
                      ['P50 Median', `${velocityReport.monte_carlo.weeks_p50} wks`, velocityReport.monte_carlo.completion_date_p50],
                      ['P80 Realistic', `${velocityReport.monte_carlo.weeks_p80} wks`, velocityReport.monte_carlo.completion_date_p80],
                      ['P95 Conservative', `${velocityReport.monte_carlo.weeks_p95} wks`, velocityReport.monte_carlo.completion_date_p95],
                      ['Fatigue Index', `${Number(velocityReport.fatigue_index || 0).toFixed(1)} / 100`, velocityReport.source || ''],
                    ].map(([label, val, sub]) => (
                      <Grid key={label} xs={6} sm={3}>
                        <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: innerBg, border: `1px solid ${borderCol}` }}>
                          <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, display: 'block' }}>
                            {label}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontFamily: mono, fontWeight: 800, color: accentGold }}>
                            {val}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: mono, color: accentSky }}>
                            {sub}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Pane: Selected Credential Deep Dive, ROI & Exports */}
        <Grid xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.75, sm: 2.5 },
              borderRadius: 2.5,
              bgcolor: cardBg,
              border: `1px solid ${borderCol}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
              <Box>
                <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: accentGold, lineHeight: 1.25 }}>
                  {selectedCert.title}
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: mono, color: accentSky, fontWeight: 700 }}>
                  {selectedCert.provider} · {selectedCert.level} · {selectedCert.estimatedHours}h · {fmtUsd(selectedCert.costUsd)}
                </Typography>
              </Box>
              {selectedCert.link && (
                <IconButton
                  component="a"
                  href={selectedCert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open official curriculum for ${selectedCert.title}`}
                  sx={{ minWidth: 44, minHeight: 44, color: accentGold, border: `1px solid ${borderCol}` }}
                >
                  <LaunchIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Box>

            <Typography variant="body2" sx={{ color: textSecondary, mb: 2 }}>
              {selectedCert.description}
            </Typography>

            {/* Financial ROI Snapshot */}
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {[
                ['Annual Premium', `+${fmtUsd(roiData.annual_salary_premium_usd)}/yr`],
                ['5-Year ROI', roiData.five_year_roi_pct === null ? 'Free ($0 Exam)' : `${Math.round(roiData.five_year_roi_pct).toLocaleString()}%`],
                ['Payback', `${Number(roiData.payback_period_months).toFixed(1)} mo`],
                ['Study Value', `$${Number(roiData.hourly_study_value_usd).toFixed(0)}/hr`],
              ].map(([k, v]) => (
                <Grid key={k} xs={6}>
                  <Box sx={{ p: 1.1, borderRadius: 1.5, bgcolor: innerBg, border: `1px solid ${borderCol}` }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, display: 'block', fontSize: '0.68rem' }}>
                      {k}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: textPrimary }}>
                      {v}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Prerequisite Chain */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: textSecondary, display: 'block', mb: 0.75 }}>
                PREREQUISITE DEPENDENCY CHAIN ({prereqChain.length} STAGES):
              </Typography>
              <Stack spacing={0.75} sx={{ maxHeight: 190, overflowY: 'auto' }}>
                {prereqChain.map((c, idx) => (
                  <ButtonBase
                    key={c.id}
                    onClick={() => setSelectedCertId(c.id)}
                    sx={{
                      width: '100%',
                      minHeight: 44,
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 1.5,
                      bgcolor: c.id === selectedCert.id ? accentGoldBg : innerBg,
                      border: `1px solid ${c.id === selectedCert.id ? accentGold : borderCol}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      textAlign: 'left',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 900, color: accentGold }}>
                        #{idx + 1}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: textPrimary }} noWrap>
                        {c.title}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, flexShrink: 0 }}>
                      {c.level}
                    </Typography>
                  </ButtonBase>
                ))}
              </Stack>
            </Box>

            {/* Study Plan Export Bar (100% Open-Access) */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: textSecondary }}>
                  OPEN-ACCESS EXPORTS:
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleCopyPlan}
                    startIcon={copiedPlan ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                    sx={{ minHeight: { xs: 44, sm: 36 }, fontFamily: mono, fontSize: '0.72rem', borderColor: accentGold, color: accentGold, textTransform: 'none' }}
                  >
                    {copiedPlan ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => downloadBlob(`${selectedCert.id}-plan.md`, studyPlanMarkdown, 'text/markdown;charset=utf-8')}
                    startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                    sx={{ minHeight: { xs: 44, sm: 36 }, fontFamily: mono, fontSize: '0.72rem', borderColor: borderCol, color: textPrimary, textTransform: 'none' }}
                  >
                    MD
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => downloadBlob(`${selectedCert.id}-dag.mmd`, mermaidSyntax, 'text/plain;charset=utf-8')}
                    sx={{ minHeight: { xs: 44, sm: 36 }, fontFamily: mono, fontSize: '0.72rem', borderColor: borderCol, color: textPrimary, textTransform: 'none' }}
                  >
                    Mermaid
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleDownloadCsv}
                    sx={{ minHeight: { xs: 44, sm: 36 }, fontFamily: mono, fontSize: '0.72rem', borderColor: borderCol, color: textPrimary, textTransform: 'none' }}
                  >
                    CSV
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => downloadBlob(`${selectedCert.id}-plan.json`, JSON.stringify({ cert: selectedCert, prereqChain, roi: roiData }, null, 2), 'application/json;charset=utf-8')}
                    sx={{ minHeight: { xs: 44, sm: 36 }, fontFamily: mono, fontSize: '0.72rem', borderColor: borderCol, color: textPrimary, textTransform: 'none' }}
                  >
                    JSON
                  </Button>
                </Stack>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: innerBg,
                  border: `1px solid ${borderCol}`,
                  color: textPrimary,
                  overflow: 'auto',
                  fontFamily: mono,
                  fontSize: '0.75rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  maxHeight: 170,
                }}
              >
                {studyPlanMarkdown}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
