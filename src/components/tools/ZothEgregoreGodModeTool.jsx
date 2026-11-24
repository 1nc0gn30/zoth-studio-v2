import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import GavelIcon from '@mui/icons-material/Gavel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignCodeBlock,
  useCopy,
  downloadJson,
  downloadText,
  MONO,
  DISPLAY,
  SOV,
  rgba,
  hashSeed,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_RAW = '#38BDF8';

const VOTE_OPTIONS = [
  { id: 'APPROVE', label: 'APPROVE', colorDark: SOV.emerald, colorLight: '#047857' },
  { id: 'CONCERN', label: 'CONCERN', colorDark: SOV.amber, colorLight: '#B45309' },
  { id: 'BLOCK', label: 'BLOCK', colorDark: SOV.crimson, colorLight: '#B91C1C' },
];

const INITIAL_VOTERS = [
  {
    id: 'architect',
    name: 'Architect',
    domain: 'Systems & Contracts',
    weight: 2,
    vote: 'APPROVE',
    rationale: 'API boundaries remain backwards-compatible and rollback path is stateless.',
  },
  {
    id: 'security',
    name: 'Security',
    domain: 'Threat Model & Auth',
    weight: 3,
    vote: 'APPROVE',
    rationale: 'Signed payloads verified with Ed25519; no elevated privileges added to worker loop.',
  },
  {
    id: 'skeptic',
    name: 'Skeptic',
    domain: 'Failure Modes & Rollback',
    weight: 2,
    vote: 'CONCERN',
    rationale: 'Retry backoff should be capped at 30s to avoid queue amplification during partial outages.',
  },
  {
    id: 'finops',
    name: 'FinOps',
    domain: 'Cost & Compute Bounds',
    weight: 1,
    vote: 'APPROVE',
    rationale: 'Execution stays within local CPU budget; zero metered external API calls added.',
  },
  {
    id: 'operator',
    name: 'Operator',
    domain: 'Runbooks & Observability',
    weight: 2,
    vote: 'APPROVE',
    rationale: 'Health checks and structured JSON logs emit clear exit codes for systemd supervision.',
  },
  {
    id: 'ethics',
    name: 'Ethics',
    domain: 'Privacy & User Consent',
    weight: 2,
    vote: 'APPROVE',
    rationale: 'All telemetry stays local-first with explicit opt-in before any remote export.',
  },
];

const SCENARIO_PRESETS = [
  {
    id: 'runtime-patch',
    label: 'Runtime Patch (Pass w/ Concern)',
    threshold: 67,
    hardVeto: true,
    title: 'RFC-042: Enable Deterministic Local Cache Compaction on Idle Workers',
    body: 'Schedule SQLite WAL checkpoint and stale artifact pruning every 6 hours when worker CPU utilization stays under 15%. No external network egress; atomic snapshot retained for 24h rollback.',
    votes: INITIAL_VOTERS,
  },
  {
    id: 'webhook-exposure',
    label: 'Public Webhook (Security Block)',
    threshold: 67,
    hardVeto: true,
    title: 'RFC-051: Expose Unauthenticated Trigger Endpoint on Local Daemon :8094',
    body: 'Allow third-party browser tabs to invoke memory-sync jobs via a plain POST endpoint without bearer token verification or origin allowlist.',
    votes: [
      { ...INITIAL_VOTERS[0], vote: 'CONCERN', rationale: 'Requires strict CORS allowlist and rate limiting before exposure.' },
      { ...INITIAL_VOTERS[1], vote: 'BLOCK', rationale: 'Unauthenticated localhost trigger enables CSRF and DNS-rebinding abuse.' },
      { ...INITIAL_VOTERS[2], vote: 'BLOCK', rationale: 'Single misconfigured tab could flood disk writes or poison index state.' },
      { ...INITIAL_VOTERS[3], vote: 'APPROVE', rationale: 'Negligible compute overhead on local hardware.' },
      { ...INITIAL_VOTERS[4], vote: 'CONCERN', rationale: 'Needs audit logging of caller origin and payload digest.' },
      { ...INITIAL_VOTERS[5], vote: 'BLOCK', rationale: 'Violates user consent boundary for local vault mutations.' },
    ],
  },
  {
    id: 'key-rotation',
    label: 'Key Rotation (Unanimous)',
    threshold: 75,
    hardVeto: true,
    title: 'RFC-058: Rotate Local Release Signing Keys with 14-Day Dual-Verify Window',
    body: 'Generate a fresh Ed25519 release keypair, publish the public key fingerprint in the repository ledger, and accept signatures from both old and new keys for 14 days.',
    votes: INITIAL_VOTERS.map((v) => ({
      ...v,
      vote: 'APPROVE',
      rationale: v.id === 'skeptic'
        ? '14-day dual-verify window eliminates sudden update breakage for offline nodes.'
        : v.rationale,
    })),
  },
];

const THRESHOLD_MARKS = [
  { value: 51, label: '51%' },
  { value: 67, label: '67%' },
  { value: 75, label: '75%' },
  { value: 90, label: '90%' },
];

export default function ZothEgregoreGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = resolveModeAccent(ACCENT_RAW, isDark);
  const { copied, copy } = useCopy();

  const [proposalTitle, setProposalTitle] = useState(SCENARIO_PRESETS[0].title);
  const [proposalBody, setProposalBody] = useState(SCENARIO_PRESETS[0].body);
  const [quorumThreshold, setQuorumThreshold] = useState(67);
  const [hardVeto, setHardVeto] = useState(true);
  const [voters, setVoters] = useState(INITIAL_VOTERS);
  const [exportFormat, setExportFormat] = useState('json');

  const applyPreset = (preset) => {
    setProposalTitle(preset.title);
    setProposalBody(preset.body);
    setQuorumThreshold(preset.threshold);
    setHardVeto(preset.hardVeto);
    setVoters(preset.votes.map((v) => ({ ...v })));
  };

  const updateVoter = (id, patch) => {
    setVoters((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const resetArena = () => applyPreset(SCENARIO_PRESETS[0]);

  const quorum = useMemo(() => {
    const totalWeight = voters.reduce((sum, v) => sum + v.weight, 0) || 1;
    const approveWeight = voters.filter((v) => v.vote === 'APPROVE').reduce((sum, v) => sum + v.weight, 0);
    const concernWeight = voters.filter((v) => v.vote === 'CONCERN').reduce((sum, v) => sum + v.weight, 0);
    const blockWeight = voters.filter((v) => v.vote === 'BLOCK').reduce((sum, v) => sum + v.weight, 0);

    const approvalPct = Number(((approveWeight / totalWeight) * 100).toFixed(1));
    const concernPct = Number(((concernWeight / totalWeight) * 100).toFixed(1));
    const blockPct = Number(((blockWeight / totalWeight) * 100).toFixed(1));

    const blockers = voters.filter((v) => v.vote === 'BLOCK');
    const concerns = voters.filter((v) => v.vote === 'CONCERN');
    const approvers = voters.filter((v) => v.vote === 'APPROVE');

    const vetoTriggered = hardVeto && blockers.length > 0;
    const thresholdMet = approvalPct >= quorumThreshold;

    let verdict = 'PASSED';
    let verdictReason = `Weighted approval (${approvalPct}%) meets or exceeds ${quorumThreshold}% BFT threshold with zero blocks.`;
    let verdictTone = 'online';

    if (vetoTriggered) {
      verdict = 'BLOCKED';
      verdictReason = `Hard veto triggered by ${blockers.map((b) => b.name).join(', ')} (${blockWeight}/${totalWeight} weight).`;
      verdictTone = 'offline';
    } else if (!thresholdMet) {
      verdict = 'BLOCKED';
      verdictReason = `Weighted approval (${approvalPct}%) fell short of the ${quorumThreshold}% BFT quorum requirement.`;
      verdictTone = 'offline';
    } else if (concerns.length > 0) {
      verdict = 'PASSED WITH CONCERNS';
      verdictReason = `Quorum reached (${approvalPct}% >= ${quorumThreshold}%), with ${concerns.length} recorded concern(s) to track.`;
      verdictTone = 'standby';
    }

    const digestInput = JSON.stringify({
      t: proposalTitle.trim(),
      b: proposalBody.trim(),
      q: quorumThreshold,
      v: hardVeto,
      votes: voters.map((x) => [x.id, x.vote, x.weight, x.rationale.trim()]),
    });
    const decisionId = `EGR-${hashSeed(digestInput).toString(16).toUpperCase().padStart(8, '0')}`;

    const dissentEntries = [...blockers, ...concerns].map((v) => ({
      agent: v.name,
      domain: v.domain,
      vote: v.vote,
      weight: v.weight,
      rationale: v.rationale.trim() || 'No rationale recorded.',
    }));

    return {
      decisionId,
      totalWeight,
      approveWeight,
      concernWeight,
      blockWeight,
      approvalPct,
      concernPct,
      blockPct,
      approvers,
      concerns,
      blockers,
      vetoTriggered,
      thresholdMet,
      verdict,
      verdictReason,
      verdictTone,
      dissentEntries,
    };
  }, [voters, quorumThreshold, hardVeto, proposalTitle, proposalBody]);

  const ledgerObject = useMemo(
    () => ({
      schema: 'zoth.egregore.ledger.v1',
      decision_id: quorum.decisionId,
      verdict: quorum.verdict,
      verdict_reason: quorum.verdictReason,
      quorum_policy: {
        bft_threshold_pct: quorumThreshold,
        hard_veto_on_block: hardVeto,
        veto_triggered: quorum.vetoTriggered,
        threshold_met: quorum.thresholdMet,
      },
      proposal: {
        title: proposalTitle.trim() || 'Untitled Proposal',
        body: proposalBody.trim(),
      },
      tally: {
        total_weight: quorum.totalWeight,
        approve_weight: quorum.approveWeight,
        concern_weight: quorum.concernWeight,
        block_weight: quorum.blockWeight,
        weighted_approval_pct: quorum.approvalPct,
      },
      pantheon_votes: voters.map((v) => ({
        agent: v.name,
        domain: v.domain,
        vote: v.vote,
        weight: v.weight,
        rationale: v.rationale.trim(),
      })),
      dissent_summary: quorum.dissentEntries,
    }),
    [quorum, quorumThreshold, hardVeto, proposalTitle, proposalBody, voters],
  );

  const ledgerJson = useMemo(() => JSON.stringify(ledgerObject, null, 2), [ledgerObject]);

  const ledgerMarkdown = useMemo(() => {
    const lines = [
      `# Governance Decision Ledger — ${quorum.decisionId}`,
      '',
      `- **Proposal:** ${proposalTitle.trim() || 'Untitled Proposal'}`,
      `- **Verdict:** \`${quorum.verdict}\``,
      `- **Weighted Approval:** ${quorum.approvalPct}% (${quorum.approveWeight}/${quorum.totalWeight} weight; threshold ${quorumThreshold}%)`,
      `- **Veto Policy:** ${hardVeto ? 'Hard veto enabled on BLOCK' : 'Threshold-only (no single-agent veto)'}`,
      `- **Summary:** ${quorum.verdictReason}`,
      '',
      '## Proposal Body',
      '',
      proposalBody.trim() || '_No proposal details provided._',
      '',
      '## Pantheon Votes',
      '',
      '| Agent | Domain | Vote | Weight | Rationale |',
      '|---|---|---|---:|---|',
      ...voters.map(
        (v) =>
          `| ${v.name} | ${v.domain} | **${v.vote}** | ${v.weight} | ${(v.rationale || '').replace(/\|/g, '\\|')} |`,
      ),
      '',
      '## Dissent & Risk Summary',
      '',
      ...(quorum.dissentEntries.length === 0
        ? ['- None. All participating Pantheon voters approved without reservations.']
        : quorum.dissentEntries.map(
            (d) => `- **[${d.vote}] ${d.agent} (w=${d.weight}, ${d.domain}):** ${d.rationale}`,
          )),
    ];
    return lines.join('\n');
  }, [quorum, proposalTitle, proposalBody, quorumThreshold, hardVeto, voters]);

  const verdictAccent =
    quorum.verdict === 'BLOCKED'
      ? SOV.crimson
      : quorum.verdict === 'PASSED WITH CONCERNS'
        ? SOV.amber
        : SOV.emerald;

  const kpis = [
    {
      label: 'Quorum Verdict',
      value: quorum.verdict === 'PASSED WITH CONCERNS' ? 'PASS (WARN)' : quorum.verdict,
      unit: quorum.decisionId,
      accent: verdictAccent,
    },
    {
      label: 'Weighted Approval',
      value: `${quorum.approvalPct}%`,
      unit: `${quorum.approveWeight}/${quorum.totalWeight} wt`,
      accent: quorum.thresholdMet ? SOV.emerald : SOV.crimson,
    },
    {
      label: 'BFT Threshold',
      value: `${quorumThreshold}%`,
      unit: hardVeto ? 'Hard veto ON' : 'Veto OFF',
      accent: ACCENT_RAW,
    },
    {
      label: 'Active Blocks',
      value: String(quorum.blockers.length),
      unit: `${quorum.concerns.length} concern(s)`,
      accent: quorum.blockers.length > 0 ? SOV.crimson : SOV.gold,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={quorum.verdictTone}
        label={`${quorum.verdict} · ${quorum.approvalPct}% OF ${quorumThreshold}% QUORUM`}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: copied === 'json' ? 'Copied JSON Ledger' : 'Copy Ledger JSON',
      icon: copied === 'json' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(ledgerJson, 'json'),
      primary: true,
    },
    {
      label: 'Download .json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadJson(ledgerObject, `${quorum.decisionId.toLowerCase()}-ledger.json`),
    },
    {
      label: 'Download .md',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () =>
        downloadText(
          ledgerMarkdown,
          `${quorum.decisionId.toLowerCase()}-ledger.md`,
          'text/markdown;charset=utf-8',
        ),
    },
    {
      label: 'Reset Arena',
      icon: <RestartAltIcon fontSize="small" />,
      onClick: resetArena,
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="PROPOSAL & QUORUM POLICY"
        title="Configure Deliberation"
        subtitle="Load a preset scenario or write a custom RFC and tune the BFT quorum threshold"
        accent={ACCENT_RAW}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {SCENARIO_PRESETS.map((preset) => (
            <Chip
              key={preset.id}
              label={preset.label}
              clickable
              onClick={() => applyPreset(preset)}
              sx={{
                minHeight: 36,
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 600,
                bgcolor: isDark ? rgba(ACCENT_RAW, 0.1) : rgba(accent, 0.08),
                color: accent,
                border: `1px solid ${rgba(accent, 0.35)}`,
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <TextField
            size="small"
            label="Proposal Title"
            fullWidth
            value={proposalTitle}
            onChange={(e) => setProposalTitle(e.target.value)}
            sx={{ '& input': { fontFamily: MONO, fontSize: '0.82rem' } }}
          />
          <TextField
            label="Proposal Specification / Impact Summary"
            multiline
            minRows={3}
            fullWidth
            value={proposalBody}
            onChange={(e) => setProposalBody(e.target.value)}
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.79rem', lineHeight: 1.55 } }}
          />

          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(16,24,40,0.02)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700 }}>
                BFT QUORUM THRESHOLD
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.82rem', fontWeight: 800, color: accent }}>
                {quorumThreshold}%
              </Typography>
            </Box>
            <Slider
              value={quorumThreshold}
              min={51}
              max={90}
              step={1}
              marks={THRESHOLD_MARKS}
              onChange={(_, val) => setQuorumThreshold(Number(val))}
              aria-label="BFT Quorum Threshold Percentage"
              sx={{
                color: accent,
                '& .MuiSlider-markLabel': { fontFamily: MONO, fontSize: '0.68rem' },
              }}
            />
            <FormControlLabel
              sx={{ mt: 0.5 }}
              control={
                <Switch
                  size="small"
                  checked={hardVeto}
                  onChange={(e) => setHardVeto(e.target.checked)}
                />
              }
              label={
                <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem' }}>
                  Enforce hard veto when any Pantheon voter casts BLOCK
                </Typography>
              }
            />
          </Box>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="6 PANTHEON AGENT VOTERS"
        title="Cast Votes, Weights & Rationales"
        subtitle="Adjust each role's vote (APPROVE / CONCERN / BLOCK), voting weight (1–3), and rationale"
        accent={ACCENT_RAW}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {voters.map((voter) => {
            const activeVoteMeta = VOTE_OPTIONS.find((o) => o.id === voter.vote) || VOTE_OPTIONS[0];
            const voteColor = isDark ? activeVoteMeta.colorDark : activeVoteMeta.colorLight;

            return (
              <Box
                key={voter.id}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: `1px solid ${rgba(voteColor, isDark ? 0.35 : 0.28)}`,
                  bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(16,24,40,0.015)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.1,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.92rem' }}>
                      {voter.name}
                    </Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: 'text.secondary' }}>
                      {voter.domain}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.66rem', color: 'text.secondary' }}>
                      WT:
                    </Typography>
                    {[1, 2, 3].map((w) => {
                      const active = voter.weight === w;
                      return (
                        <Chip
                          key={w}
                          label={`${w}×`}
                          size="small"
                          clickable
                          onClick={() => updateVoter(voter.id, { weight: w })}
                          sx={{
                            minWidth: 34,
                            height: 28,
                            fontFamily: MONO,
                            fontSize: '0.7rem',
                            fontWeight: active ? 800 : 500,
                            bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                            color: active ? accent : 'text.secondary',
                            border: `1px solid ${active ? accent : 'rgba(148,163,184,0.3)'}`,
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {VOTE_OPTIONS.map((opt) => {
                    const selected = voter.vote === opt.id;
                    const c = isDark ? opt.colorDark : opt.colorLight;
                    return (
                      <Chip
                        key={opt.id}
                        label={opt.label}
                        clickable
                        onClick={() => updateVoter(voter.id, { vote: opt.id })}
                        sx={{
                          minHeight: 34,
                          fontFamily: MONO,
                          fontSize: '0.7rem',
                          fontWeight: selected ? 800 : 500,
                          bgcolor: selected ? rgba(c, isDark ? 0.2 : 0.12) : 'transparent',
                          color: selected ? c : 'text.secondary',
                          border: `1px solid ${selected ? c : 'rgba(148,163,184,0.28)'}`,
                        }}
                      />
                    );
                  })}
                </Box>

                <TextField
                  size="small"
                  fullWidth
                  label={`${voter.name} Rationale`}
                  value={voter.rationale}
                  onChange={(e) => updateVoter(voter.id, { rationale: e.target.value })}
                  sx={{ '& input': { fontFamily: MONO, fontSize: '0.76rem' } }}
                />
              </Box>
            );
          })}
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="LIVE BFT QUORUM ENGINE"
        title={`Verdict: ${quorum.verdict}`}
        subtitle={quorum.verdictReason}
        badge={quorum.decisionId}
        accent={verdictAccent}
      >
        <Box
          sx={{
            p: 1.75,
            borderRadius: 1.5,
            border: `1px solid ${rgba(verdictAccent, 0.35)}`,
            bgcolor: isDark ? rgba(verdictAccent, 0.08) : rgba(resolveModeAccent(verdictAccent, false), 0.06),
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
            {quorum.verdict === 'BLOCKED' ? (
              <ErrorOutlineIcon sx={{ color: resolveModeAccent(SOV.crimson, isDark) }} />
            ) : quorum.verdict === 'PASSED WITH CONCERNS' ? (
              <WarningAmberIcon sx={{ color: resolveModeAccent(SOV.amber, isDark) }} />
            ) : (
              <CheckCircleOutlineIcon sx={{ color: resolveModeAccent(SOV.emerald, isDark) }} />
            )}
            <Typography sx={{ fontFamily: MONO, fontSize: '0.8rem', fontWeight: 800 }}>
              WEIGHTED TALLY BAR · THRESHOLD {quorumThreshold}%
            </Typography>
          </Box>

          <Box
            sx={{
              position: 'relative',
              height: 24,
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: isDark ? '#0B0E17' : '#E2E8F0',
              display: 'flex',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                width: `${quorum.approvalPct}%`,
                bgcolor: isDark ? SOV.emerald : '#047857',
                transition: 'width 200ms ease',
              }}
            />
            <Box
              sx={{
                width: `${quorum.concernPct}%`,
                bgcolor: isDark ? SOV.amber : '#D97706',
                transition: 'width 200ms ease',
              }}
            />
            <Box
              sx={{
                width: `${quorum.blockPct}%`,
                bgcolor: isDark ? SOV.crimson : '#DC2626',
                transition: 'width 200ms ease',
              }}
            />
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${quorumThreshold}%`,
                width: 2,
                bgcolor: isDark ? '#FFFFFF' : '#101828',
                boxShadow: '0 0 6px rgba(0,0,0,0.55)',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1.25 }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: resolveModeAccent(SOV.emerald, isDark) }}>
              APPROVE: {quorum.approvalPct}% ({quorum.approveWeight} wt)
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: resolveModeAccent(SOV.amber, isDark) }}>
              CONCERN: {quorum.concernPct}% ({quorum.concernWeight} wt)
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: resolveModeAccent(SOV.crimson, isDark) }}>
              BLOCK: {quorum.blockPct}% ({quorum.blockWeight} wt)
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, mb: 1, color: 'text.secondary' }}>
          DISSENT & RISK SUMMARY ({quorum.dissentEntries.length})
        </Typography>
        {quorum.dissentEntries.length === 0 ? (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: isDark ? 'rgba(52,211,153,0.06)' : 'rgba(4,120,87,0.04)',
            }}
          >
            <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: resolveModeAccent(SOV.emerald, isDark) }}>
              Zero dissent recorded. All 6 Pantheon voters cast APPROVE.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {quorum.dissentEntries.map((entry) => {
              const col = resolveModeAccent(entry.vote === 'BLOCK' ? SOV.crimson : SOV.amber, isDark);
              return (
                <Box
                  key={entry.agent}
                  sx={{
                    p: 1.25,
                    borderRadius: 1.25,
                    borderLeft: `3px solid ${col}`,
                    bgcolor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(16,24,40,0.025)',
                  }}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mb: 0.35 }}>
                    <Chip
                      label={entry.vote}
                      size="small"
                      sx={{
                        height: 20,
                        fontFamily: MONO,
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        bgcolor: rgba(col, 0.14),
                        color: col,
                      }}
                    />
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700 }}>
                      {entry.agent} ({entry.domain}) · {entry.weight}×
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                    {entry.rationale}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="DETERMINISTIC GOVERNANCE DECISION LEDGER"
        title="Export Decision Artifact (.json / .md)"
        subtitle="Deterministic hash ID derived from proposal text, threshold policy, and all 6 Pantheon votes"
        accent={ACCENT_RAW}
        right={
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {['json', 'md'].map((fmt) => {
              const active = exportFormat === fmt;
              return (
                <Chip
                  key={fmt}
                  label={fmt === 'json' ? '.JSON' : '.MD'}
                  clickable
                  onClick={() => setExportFormat(fmt)}
                  sx={{
                    minHeight: 32,
                    fontFamily: MONO,
                    fontSize: '0.7rem',
                    fontWeight: active ? 800 : 500,
                    bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                    color: active ? accent : 'text.secondary',
                    border: `1px solid ${active ? accent : 'rgba(148,163,184,0.3)'}`,
                  }}
                />
              );
            })}
          </Box>
        }
      >
        <SovereignCodeBlock
          title={exportFormat === 'json' ? `${quorum.decisionId}.json` : `${quorum.decisionId}.md`}
          badge={exportFormat.toUpperCase()}
          code={exportFormat === 'json' ? ledgerJson : ledgerMarkdown}
          filename={`${quorum.decisionId.toLowerCase()}-ledger.${exportFormat}`}
          accent={ACCENT_RAW}
          maxHeight={360}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={copied === 'active' ? <CheckIcon fontSize="small" /> : <GavelIcon fontSize="small" />}
            onClick={() => copy(exportFormat === 'json' ? ledgerJson : ledgerMarkdown, 'active')}
            sx={{
              minHeight: 42,
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: '0.74rem',
              textTransform: 'none',
              bgcolor: isDark ? ACCENT_RAW : '#101828',
              color: isDark ? '#08080B' : '#FFFFFF',
            }}
          >
            {copied === 'active' ? 'Copied Decision Ledger' : `Copy ${exportFormat.toUpperCase()} Ledger`}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={() =>
              exportFormat === 'json'
                ? downloadJson(ledgerObject, `${quorum.decisionId.toLowerCase()}-ledger.json`)
                : downloadText(
                    ledgerMarkdown,
                    `${quorum.decisionId.toLowerCase()}-ledger.md`,
                    'text/markdown;charset=utf-8',
                  )
            }
            sx={{ minHeight: 42, fontFamily: MONO, fontSize: '0.74rem', textTransform: 'none' }}
          >
            Download {exportFormat === 'json' ? 'ledger.json' : 'ledger.md'}
          </Button>
        </Box>
      </SovereignCard>
    </Box>
  );

  return (
    <SovereignWorkstationShell
      id="zoth-egregore"
      category="MULTI-AGENT GOVERNANCE · BFT QUORUM"
      title="Zoth Egregore Consensus Arena"
      subtitle="Weighted 6-agent Pantheon quorum engine with configurable BFT approval thresholds, hard-veto blocking, dissent capture, and deterministic JSON/Markdown decision ledgers."
      version="1.0.0"
      variant="hex-lattice"
      accent={ACCENT_RAW}
      metrics={kpis}
      status={statusNode}
      actions={actions}
      leftPane={leftPane}
      rightPane={rightPane}
      leftCols={6}
      rightCols={6}
    />
  );
}
