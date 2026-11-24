import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TerminalIcon from '@mui/icons-material/Terminal';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignCodeBlock,
  useCopy,
  downloadText,
  MONO,
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_RAW = '#C084FC';
const ACCENT_LIGHT = '#7E22CE';

const SAMPLE_NOTES = [
  {
    id: 'adr-note',
    label: 'Architecture ADR (With Diagnostics)',
    content: `---
title: Neuro-Memory Daemon Sync Pipeline
tags:
  - architecture
  - memory-vault
  - obsidian
status: active
updated: 2026-11-24
---

# Neuro-Memory Daemon Sync Pipeline

This note tracks bidirectional sync between the local Obsidian vault and [[Neuro-Memory Daemon|Daemon :8094]].

## Core Components

- Event watcher listens on vault writes and forwards diffs to [[Chronicle Vault]]
- Graph index resolves [[STDP Engram Weights#Decay Formula]] and [[Zoth Studio v2]]
- Pending reference placeholder: [[]]

## Implementation Notes

All sync transforms run locally with #local-first and #zero-telemetry guarantees.

## Implementation Notes

Run \`zoth-memory-vault sync-recent\` after bulk frontmatter edits so Bases views stay indexed.
`,
  },
  {
    id: 'clean-note',
    label: 'Clean Research Note',
    content: `---
title: Local LLM Wiki Compilation Spec
tags: [wiki, research, karpathy-loop]
status: verified
updated: 2026-11-24
---

# Local LLM Wiki Compilation Spec

Synthesizes daily technical logs into structured evergreen notes linked from [[Second Brain Index]].

## Extraction Rules

1. Normalize YAML frontmatter keys before indexing into [[Obsidian Bases]].
2. Cross-link recurring architecture patterns via [[Zoth Architecture Atlas|Architecture Atlas]].
3. Tag actionable threads with #adr and #runbook.

## Verification

Confirm zero broken links and clean heading hierarchy before committing to the vault repository.
`,
  },
  {
    id: 'missing-fm',
    label: 'Missing Frontmatter Draft',
    content: `# Unsorted Field Notes

Captured quick notes about [[Edge Inference Benchmarks]] and [[|Broken Alias Link]].

Remember to review #benchmarks and #latency before release.

## Next Steps

- Add YAML frontmatter keys
- Resolve empty links like [[   ]]
`,
  },
];

const REQUIRED_KEYS = ['title', 'tags', 'status', 'updated'];

function parseObsidianNote(rawText) {
  const text = String(rawText || '');
  const normalized = text.replace(/\r\n/g, '\n');

  let hasFrontmatter = false;
  let frontmatterRaw = '';
  let body = normalized;
  const frontmatter = {};

  const fmMatch = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (fmMatch) {
    hasFrontmatter = true;
    frontmatterRaw = fmMatch[1];
    body = normalized.slice(fmMatch[0].length);

    const lines = frontmatterRaw.split('\n');
    let currentListKey = null;

    for (const line of lines) {
      const listItem = line.match(/^\s*-\s+(.+?)\s*$/);
      if (listItem && currentListKey) {
        if (!Array.isArray(frontmatter[currentListKey])) {
          frontmatter[currentListKey] = [];
        }
        frontmatter[currentListKey].push(listItem[1].replace(/^['"]|['"]$/g, '').trim());
        continue;
      }

      const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
      if (kv) {
        const key = kv[1].trim();
        const valRaw = kv[2].trim();
        if (valRaw === '') {
          frontmatter[key] = [];
          currentListKey = key;
        } else if (valRaw.startsWith('[') && valRaw.endsWith(']')) {
          currentListKey = null;
          frontmatter[key] = valRaw
            .slice(1, -1)
            .split(',')
            .map((item) => item.replace(/^['"]|['"]$/g, '').trim())
            .filter(Boolean);
        } else {
          currentListKey = null;
          frontmatter[key] = valRaw.replace(/^['"]|['"]$/g, '').trim();
        }
      } else if (line.trim() !== '') {
        currentListKey = null;
      }
    }
  }

  // Strip fenced code blocks before scanning headings, tags, and links
  const bodyNoCode = body.replace(/```[\s\S]*?```/g, '');
  const bodyNoInlineCode = bodyNoCode.replace(/`[^`\n]+`/g, '');

  // Extract wikilinks & detect broken/empty links
  const wikilinks = [];
  const brokenLinks = [];
  const linkRegex = /\[\[([^\n\]]*)\]\]/g;
  let m;
  while ((m = linkRegex.exec(bodyNoInlineCode)) !== null) {
    const inner = m[1];
    const [targetPart, aliasPart] = inner.split('|');
    const cleanTarget = (targetPart || '').trim();
    const cleanAlias = aliasPart !== undefined ? aliasPart.trim() : null;

    if (!cleanTarget) {
      brokenLinks.push({ raw: m[0], reason: aliasPart !== undefined ? 'Missing target before alias pipe' : 'Empty wikilink target' });
    } else {
      const [noteName, headingRef] = cleanTarget.split('#');
      if (!noteName.trim() && !headingRef?.trim()) {
        brokenLinks.push({ raw: m[0], reason: 'Invalid wikilink syntax' });
      } else {
        wikilinks.push({
          raw: m[0],
          target: noteName.trim() || '(current note)',
          heading: headingRef ? headingRef.trim() : null,
          alias: cleanAlias,
        });
      }
    }
  }

  // Detect unclosed wikilink openers
  const cleanedPairs = bodyNoInlineCode.replace(/\[\[[^\n\]]*\]\]/g, '');
  const unclosedMatches = cleanedPairs.match(/\[\[[^\n]*/g) || [];
  unclosedMatches.forEach((raw) => {
    brokenLinks.push({ raw: raw.slice(0, 40), reason: 'Unclosed [[ wikilink delimiter' });
  });

  // Extract inline #tags
  const inlineTags = new Set();
  const tagRegex = /(?:^|[\s(])#([A-Za-z][A-Za-z0-9_/-]*)/g;
  while ((m = tagRegex.exec(bodyNoInlineCode)) !== null) {
    inlineTags.add(m[1].toLowerCase());
  }

  const fmTags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags.map((t) => String(t).replace(/^#/, '').toLowerCase()).filter(Boolean)
    : typeof frontmatter.tags === 'string' && frontmatter.tags
      ? frontmatter.tags.split(/[,\s]+/).map((t) => t.replace(/^#/, '').toLowerCase()).filter(Boolean)
      : [];

  const allTags = Array.from(new Set([...fmTags, ...inlineTags]));

  // Detect duplicate headings
  const headingCounts = new Map();
  const headings = [];
  const lines = bodyNoCode.split('\n');
  lines.forEach((line, idx) => {
    const hm = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (hm) {
      const textNorm = hm[2].trim();
      const key = textNorm.toLowerCase();
      headings.push({ level: hm[1].length, text: textNorm, line: idx + 1 });
      headingCounts.set(key, (headingCounts.get(key) || 0) + 1);
    }
  });

  const duplicateHeadings = Array.from(headingCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([heading, count]) => ({ heading, count }));

  // Diagnostics
  const diagnostics = [];
  if (!hasFrontmatter) {
    diagnostics.push({
      severity: 'error',
      code: 'FM_MISSING',
      message: 'YAML frontmatter block (--- ... ---) is missing.',
    });
  }

  const missingKeys = REQUIRED_KEYS.filter((k) => {
    const val = frontmatter[k];
    if (val === undefined || val === null) return true;
    if (Array.isArray(val)) return val.length === 0;
    return String(val).trim() === '';
  });

  if (hasFrontmatter && missingKeys.length > 0) {
    diagnostics.push({
      severity: 'warning',
      code: 'FM_KEYS',
      message: `Missing or empty frontmatter key(s): ${missingKeys.join(', ')}.`,
    });
  }

  if (frontmatter.updated && !/^\d{4}-\d{2}-\d{2}/.test(String(frontmatter.updated))) {
    diagnostics.push({
      severity: 'warning',
      code: 'DATE_FORMAT',
      message: `Frontmatter 'updated' value "${frontmatter.updated}" is not ISO YYYY-MM-DD.`,
    });
  }

  brokenLinks.forEach((bl) => {
    diagnostics.push({
      severity: 'error',
      code: 'BROKEN_LINK',
      message: `Broken wikilink ${bl.raw} — ${bl.reason}.`,
    });
  });

  duplicateHeadings.forEach((dh) => {
    diagnostics.push({
      severity: 'warning',
      code: 'DUP_HEADING',
      message: `Duplicate heading "${dh.heading}" appears ${dh.count} times (causes ambiguous [[Note#Heading]] anchors).`,
    });
  });

  // Word count & reading time
  const plainBody = bodyNoCode
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/[#*_>`~]/g, ' ');
  const words = plainBody
    .trim()
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w));
  const wordCount = words.length;
  const readingMinutes = wordCount === 0 ? 0 : Math.max(1, Math.ceil(wordCount / 220));

  const uniqueTargets = Array.from(new Set(wikilinks.map((w) => w.target)));

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;
  const healthScore = Math.max(0, 100 - errorCount * 22 - warningCount * 10);

  return {
    hasFrontmatter,
    frontmatter,
    missingKeys,
    wikilinks,
    uniqueTargets,
    brokenLinks,
    fmTags,
    inlineTags: Array.from(inlineTags),
    allTags,
    headings,
    duplicateHeadings,
    diagnostics,
    errorCount,
    warningCount,
    wordCount,
    readingMinutes,
    healthScore,
  };
}

function slugify(str) {
  return (
    String(str || 'vault-view')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 42) || 'vault-view'
  );
}

export default function ZothObsidianTrackerGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? ACCENT_RAW : ACCENT_LIGHT;
  const { copied, copy } = useCopy();

  const [markdown, setMarkdown] = useState(SAMPLE_NOTES[0].content);
  const [vaultFolder, setVaultFolder] = useState('Notes/Architecture');
  const [tagMatchMode, setTagMatchMode] = useState('or');

  const audit = useMemo(() => parseObsidianNote(markdown), [markdown]);

  const noteSlug = useMemo(
    () => slugify(audit.frontmatter.title || 'obsidian-tracker'),
    [audit.frontmatter.title],
  );

  const basesYaml = useMemo(() => {
    const tags = audit.allTags.length > 0 ? audit.allTags : ['architecture'];
    const tagExprs = tags.map((t) => `file.hasTag("${t}")`);
    const folderExpr = vaultFolder.trim()
      ? `file.inFolder("${vaultFolder.trim().replace(/"/g, '')}")`
      : null;

    const filterLines =
      tagMatchMode === 'and'
        ? [
            'filters:',
            '  and:',
            ...(folderExpr ? [`    - '${folderExpr}'`] : []),
            ...tagExprs.map((e) => `    - '${e}'`),
          ]
        : [
            'filters:',
            '  and:',
            ...(folderExpr ? [`    - '${folderExpr}'`] : []),
            '    - or:',
            ...tagExprs.map((e) => `        - '${e}'`),
          ];

    return [
      ...filterLines,
      'properties:',
      '  title:',
      '    displayName: Title',
      '  status:',
      '    displayName: Status',
      '  updated:',
      '    displayName: Updated',
      '  tags:',
      '    displayName: Tags',
      'views:',
      '  - type: table',
      `    name: "${(audit.frontmatter.title || 'Tracked Notes').replace(/"/g, '')} Index"`,
      '    order:',
      '      - file.name',
      '      - title',
      '      - status',
      '      - updated',
      '      - tags',
      '    sort:',
      '      - property: updated',
      '        direction: DESC',
    ].join('\n');
  }, [audit.allTags, audit.frontmatter.title, vaultFolder, tagMatchMode]);

  const cliSnippet = useMemo(() => {
    const tagFlag = audit.allTags.length > 0 ? ` --tags "${audit.allTags.join(',')}"` : '';
    const folderArg = vaultFolder.trim() || 'Notes';
    return [
      '# 1. Sync recent Obsidian vault changes into Neuro-Memory Daemon (:8094)',
      'zoth-memory-vault sync-recent',
      '',
      '# 2. Run local frontmatter & wikilink verification across the target folder',
      `zoth-obsidian-tracker audit --folder "${folderArg}"${tagFlag} --json`,
      '',
      '# 3. Refresh Bases index and verify zero dangling wikilinks',
      `zoth-obsidian-tracker status --strict`,
    ].join('\n');
  }, [audit.allTags, vaultFolder]);

  const handleInsertFrontmatter = () => {
    if (audit.hasFrontmatter) return;
    const firstHeading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || 'Untitled Vault Note';
    const header = [
      '---',
      `title: ${firstHeading}`,
      'tags:',
      ...(audit.inlineTags.length > 0 ? audit.inlineTags.map((t) => `  - ${t}`) : ['  - vault']),
      'status: draft',
      'updated: 2026-11-24',
      '---',
      '',
    ].join('\n');
    setMarkdown(header + markdown);
  };

  const statusTone =
    audit.errorCount > 0 ? 'offline' : audit.warningCount > 0 ? 'standby' : 'online';
  const statusText =
    audit.errorCount > 0
      ? `${audit.errorCount} ERROR(S) · ${audit.warningCount} WARNING(S)`
      : audit.warningCount > 0
        ? `0 ERRORS · ${audit.warningCount} WARNING(S)`
        : 'CLEAN NOTE · FRONTMATTER & LINKS VERIFIED';

  const kpis = [
    {
      label: 'Audit Health',
      value: `${audit.healthScore}`,
      unit: '/ 100',
      accent: audit.errorCount > 0 ? SOV.crimson : audit.warningCount > 0 ? SOV.amber : SOV.emerald,
    },
    {
      label: 'Wikilinks',
      value: String(audit.uniqueTargets.length),
      unit: `${audit.brokenLinks.length} broken`,
      accent: audit.brokenLinks.length > 0 ? SOV.crimson : ACCENT_RAW,
    },
    {
      label: 'Detected Tags',
      value: String(audit.allTags.length),
      unit: `${audit.fmTags.length} YAML · ${audit.inlineTags.length} inline`,
      accent: SOV.cyber,
    },
    {
      label: 'Length',
      value: `${audit.wordCount}`,
      unit: `words · ~${audit.readingMinutes}m read`,
      accent: SOV.gold,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={statusTone}
        label={statusText}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: copied === 'base' ? 'Copied .base View' : 'Copy .base View',
      icon: copied === 'base' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(basesYaml, 'base'),
      primary: true,
    },
    {
      label: 'Download .base',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadText(basesYaml, `${noteSlug}.base`, 'text/yaml;charset=utf-8'),
    },
    {
      label: copied === 'cli' ? 'Copied Sync CLI' : 'Copy Sync CLI',
      icon: copied === 'cli' ? <CheckIcon fontSize="small" /> : <TerminalIcon fontSize="small" />,
      onClick: () => copy(cliSnippet, 'cli'),
    },
    ...(!audit.hasFrontmatter
      ? [
          {
            label: 'Insert YAML Frontmatter',
            icon: <AutoFixHighIcon fontSize="small" />,
            onClick: handleInsertFrontmatter,
          },
        ]
      : []),
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="INTERACTIVE MARKDOWN NOTE EDITOR"
        title="Audit Obsidian Markdown & Frontmatter"
        subtitle="Edit YAML frontmatter, [[wikilinks]], headings, and #tags to inspect diagnostics in real time"
        accent={ACCENT_RAW}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.75 }}>
          {SAMPLE_NOTES.map((sample) => (
            <Chip
              key={sample.id}
              label={sample.label}
              clickable
              onClick={() => setMarkdown(sample.content)}
              sx={{
                minHeight: 36,
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 600,
                bgcolor: isDark ? rgba(ACCENT_RAW, 0.12) : rgba(accent, 0.08),
                color: accent,
                border: `1px solid ${rgba(accent, 0.35)}`,
              }}
            />
          ))}
        </Box>

        <TextField
          label="Vault Note Markdown (.md)"
          multiline
          minRows={16}
          maxRows={24}
          fullWidth
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          sx={{
            '& textarea': {
              fontFamily: MONO,
              fontSize: '0.78rem',
              lineHeight: 1.55,
            },
          }}
        />
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="PARSED FRONTMATTER & GRAPH ENTITIES"
        title="Extracted Metadata, Wikilinks & Tags"
        subtitle="Parsed strictly client-side with fenced code blocks excluded from tag/heading scans"
        accent={ACCENT_RAW}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.75 }}>
          {REQUIRED_KEYS.map((key) => {
            const val = audit.frontmatter[key];
            const present = Array.isArray(val) ? val.length > 0 : Boolean(val && String(val).trim());
            const col = resolveModeAccent(present ? SOV.emerald : SOV.crimson, isDark);
            return (
              <Chip
                key={key}
                size="small"
                label={`${key}: ${present ? (Array.isArray(val) ? val.join(', ') : val) : 'MISSING'}`}
                sx={{
                  height: 28,
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: rgba(col, 0.12),
                  color: col,
                  border: `1px solid ${rgba(col, 0.35)}`,
                }}
              />
            );
          })}
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          WIKILINKS ({audit.wikilinks.length})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.75 }}>
          {audit.wikilinks.length === 0 ? (
            <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: 'text.secondary' }}>
              No valid [[wikilinks]] detected.
            </Typography>
          ) : (
            audit.wikilinks.map((w, idx) => (
              <Chip
                key={`${w.raw}-${idx}`}
                size="small"
                label={`[[${w.target}${w.heading ? `#${w.heading}` : ''}${w.alias ? ` → ${w.alias}` : ''}]]`}
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  bgcolor: isDark ? rgba(ACCENT_RAW, 0.14) : rgba(accent, 0.08),
                  color: accent,
                }}
              />
            ))
          )}
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          TAGS ({audit.allTags.length})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {audit.allTags.length === 0 ? (
            <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: 'text.secondary' }}>
              No YAML or inline #tags detected.
            </Typography>
          ) : (
            audit.allTags.map((tag) => (
              <Chip
                key={tag}
                size="small"
                label={`#${tag}`}
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  bgcolor: isDark ? rgba(SOV.cyber, 0.14) : rgba('#0369A1', 0.08),
                  color: resolveModeAccent(SOV.cyber, isDark),
                }}
              />
            ))
          )}
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="LIVE AUDIT DIAGNOSTICS"
        title={audit.diagnostics.length === 0 ? 'Zero Issues Found' : `${audit.diagnostics.length} Finding(s) Flagged`}
        subtitle="Checks required YAML keys, ISO dates, empty or malformed [[wikilinks]], and duplicate headings"
        accent={audit.errorCount > 0 ? SOV.crimson : audit.warningCount > 0 ? SOV.amber : SOV.emerald}
      >
        {audit.diagnostics.length === 0 ? (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: isDark ? 'rgba(52,211,153,0.08)' : 'rgba(4,120,87,0.06)',
              border: `1px solid ${rgba(resolveModeAccent(SOV.emerald, isDark), 0.35)}`,
            }}
          >
            <CheckCircleOutlineIcon sx={{ color: resolveModeAccent(SOV.emerald, isDark) }} />
            <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: resolveModeAccent(SOV.emerald, isDark) }}>
              All frontmatter keys present, zero broken wikilinks, and unique heading hierarchy verified.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {audit.diagnostics.map((d, idx) => {
              const col = resolveModeAccent(d.severity === 'error' ? SOV.crimson : SOV.amber, isDark);
              return (
                <Box
                  key={`${d.code}-${idx}`}
                  sx={{
                    p: 1.25,
                    borderRadius: 1.25,
                    borderLeft: `3px solid ${col}`,
                    bgcolor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(16,24,40,0.025)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                  }}
                >
                  {d.severity === 'error' ? (
                    <ErrorOutlineIcon fontSize="small" sx={{ color: col, mt: 0.15 }} />
                  ) : (
                    <WarningAmberIcon fontSize="small" sx={{ color: col, mt: 0.15 }} />
                  )}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 800, color: col }}>
                      {d.severity.toUpperCase()} · {d.code}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
                      {d.message}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="OBSIDIAN BASES (.BASE) VIEW GENERATOR"
        title="Live Table View & Tag Filter Spec"
        subtitle="Generated from your detected tags and folder scope — drop directly into any Obsidian vault"
        accent={ACCENT_RAW}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, alignItems: 'center', mb: 1.5 }}>
          <TextField
            size="small"
            label="Vault Folder Scope"
            value={vaultFolder}
            onChange={(e) => setVaultFolder(e.target.value)}
            sx={{ flex: '1 1 200px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {[
              { id: 'or', label: 'Match ANY Tag (OR)' },
              { id: 'and', label: 'Match ALL Tags (AND)' },
            ].map((mode) => {
              const active = tagMatchMode === mode.id;
              return (
                <Chip
                  key={mode.id}
                  label={mode.label}
                  clickable
                  onClick={() => setTagMatchMode(mode.id)}
                  sx={{
                    minHeight: 36,
                    fontFamily: MONO,
                    fontSize: '0.7rem',
                    fontWeight: active ? 700 : 500,
                    bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                    color: active ? accent : 'text.secondary',
                    border: `1px solid ${active ? accent : 'rgba(148,163,184,0.3)'}`,
                  }}
                />
              );
            })}
          </Box>
        </Box>

        <SovereignCodeBlock
          title={`${noteSlug}.base`}
          badge="OBSIDIAN BASES YAML"
          code={basesYaml}
          filename={`${noteSlug}.base`}
          accent={ACCENT_RAW}
          maxHeight={280}
        />
      </SovereignCard>

      <SovereignCard
        index="05"
        eyebrow="VAULT SYNC & MEMORY CLI"
        title="Synchronize with Neuro-Memory Daemon"
        subtitle="Copyable ZothOS CLI commands to sync vault notes and verify index integrity"
        accent={ACCENT_RAW}
      >
        <SovereignCodeBlock
          title="ZOTH-OBSIDIAN-TRACKER & MEMORY-VAULT CLI"
          badge="BASH"
          code={cliSnippet}
          filename="obsidian-sync.sh"
          accent={ACCENT_RAW}
          maxHeight={200}
        />
      </SovereignCard>
    </Box>
  );

  return (
    <SovereignWorkstationShell
      id="zoth-obsidian-tracker"
      category="KNOWLEDGE GRAPH · OBSIDIAN VAULT"
      title="Zoth Obsidian Tracker & Auditor"
      subtitle="Client-side Markdown frontmatter parser, [[wikilink]] and duplicate-heading auditor, Obsidian Bases (.base) table view generator, and vault sync CLI builder."
      version="1.0.0"
      variant="braille-orbit"
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
