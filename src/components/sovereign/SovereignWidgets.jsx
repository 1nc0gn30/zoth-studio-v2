/**
 * SovereignWidgets — interactive telemetry, table, preset, alert, and FAQ primitives.
 *
 * Designed for reuse across Zoth Studio v2 tools and showcase pages.
 * 100% SSR-safe, dual-theme (Obsidian Dark / Editorial Ivory Light), 44px touch targets.
 */

import React, { useId, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { SOV, MONO, DISPLAY, rgba } from './palette.js';
import { resolveModeAccent } from './SovereignPrimitives.jsx';
import { copyText, downloadText } from './hooks.js';

const SERIF = '"Celtic Garamond", Georgia, "Times New Roman", serif';

function copyString(text, onSuccess) {
  copyText(text).then((ok) => {
    if (ok && onSuccess) onSuccess();
  });
}

function resolveSemanticColor(value, { warn = 65, danger = 85 } = {}, invert = false) {
  if (invert) {
    if (value < danger) return SOV.crimson;
    if (value < warn) return SOV.amber;
    return SOV.emerald;
  }
  if (value >= danger) return SOV.crimson;
  if (value >= warn) return SOV.amber;
  return SOV.emerald;
}

/**
 * SovereignPresetBar — sample preset selector + optional local file uploader + reset.
 */
export function SovereignPresetBar({
  presets = [],
  activeId,
  onSelect,
  onUploadText,
  onReset,
  accent = SOV.gold,
  uploadLabel = 'Upload File',
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const fileRef = useRef(null);
  const modeAccent = resolveModeAccent(accent, isDark);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadText) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUploadText({
        name: file.name,
        size: file.size,
        text: typeof reader.result === 'string' ? reader.result : '',
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        alignItems: 'center',
        ...sx,
      }}
    >
      {presets.map((p) => {
        const active = activeId === p.id;
        return (
          <Button
            key={p.id}
            size="small"
            variant={active ? 'contained' : 'outlined'}
            onClick={() => onSelect && onSelect(p)}
            sx={{
              minHeight: 44,
              px: 1.5,
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              ...(active
                ? {
                    bgcolor: isDark ? accent : modeAccent,
                    color: isDark ? '#08080B' : '#FFFFFF',
                    '&:hover': { bgcolor: isDark ? accent : modeAccent },
                  }
                : {
                    color: isDark ? '#EDEFF2' : '#101828',
                    borderColor: isDark ? rgba(accent, 0.35) : 'rgba(16,24,40,0.2)',
                    '&:hover': { borderColor: modeAccent, bgcolor: rgba(modeAccent, 0.08) },
                  }),
            }}
          >
            {p.label}
            {p.badge ? ` · ${p.badge}` : ''}
          </Button>
        );
      })}

      {onUploadText && (
        <>
          <input
            ref={fileRef}
            type="file"
            hidden
            onChange={handleFileChange}
            aria-label={uploadLabel}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<UploadFileIcon fontSize="small" />}
            onClick={() => fileRef.current?.click()}
            sx={{
              minHeight: 44,
              px: 1.5,
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              color: isDark ? SOV.cyber : '#0369A1',
              borderColor: isDark ? 'rgba(56,189,248,0.4)' : 'rgba(3,105,161,0.35)',
            }}
          >
            {uploadLabel}
          </Button>
        </>
      )}

      {onReset && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<RestartAltIcon fontSize="small" />}
          onClick={onReset}
          sx={{
            minHeight: 44,
            px: 1.4,
            fontFamily: MONO,
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'none',
            color: isDark ? SOV.slate : '#475467',
            borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(16,24,40,0.18)',
          }}
        >
          Reset
        </Button>
      )}
    </Box>
  );
}

/**
 * SovereignGauge — 240-degree radial SVG telemetry gauge with semantic status coloring.
 */
export function SovereignGauge({
  value = 0,
  min = 0,
  max = 100,
  label = 'INDEX',
  unit = '',
  status,
  thresholds = { warn: 65, danger: 85 },
  invertThresholds = false,
  accent,
  size = 148,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const span = Math.max(1e-6, max - min);
  const clamped = Math.min(max, Math.max(min, Number(value) || 0));
  const ratio = (clamped - min) / span;

  const rawCol = accent || resolveSemanticColor(clamped, thresholds, invertThresholds);
  const strokeCol = resolveModeAccent(rawCol, isDark);

  const r = 52;
  const c = 2 * Math.PI * r;
  const arcLen = c * (240 / 360);
  const fillLen = arcLen * ratio;

  const displayVal = Number.isInteger(clamped) ? String(clamped) : clamped.toFixed(1);

  return (
    <Box
      sx={{
        bgcolor: isDark ? SOV.obsidian2 : '#FFFFFF',
        border: `1px solid ${isDark ? rgba(rawCol, 0.28) : 'rgba(16,24,40,0.12)'}`,
        borderRadius: 2,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        height: '100%',
        ...sx,
      }}
    >
      <Box sx={{ position: 'relative', width: size, height: size * 0.86 }}>
        <svg viewBox="0 0 132 114" width="100%" height="100%" role="img" aria-label={`${label} gauge: ${displayVal}${unit}`}>
          <g transform="translate(66, 66) rotate(150)">
            <circle
              r={r}
              cx={0}
              cy={0}
              fill="none"
              stroke={isDark ? 'rgba(255,255,255,0.09)' : 'rgba(16,24,40,0.1)'}
              strokeWidth={10}
              strokeDasharray={`${arcLen} ${c}`}
              strokeLinecap="round"
            />
            <circle
              r={r}
              cx={0}
              cy={0}
              fill="none"
              stroke={strokeCol}
              strokeWidth={10}
              strokeDasharray={`${fillLen} ${c}`}
              strokeLinecap="round"
            />
          </g>
        </svg>

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pt: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: '1.5rem',
              lineHeight: 1.05,
              color: isDark ? '#F5F1E6' : '#101828',
            }}
          >
            {displayVal}
            {unit && (
              <Box component="span" sx={{ fontFamily: MONO, fontSize: '0.72rem', ml: 0.35, color: strokeCol }}>
                {unit}
              </Box>
            )}
          </Typography>
        </Box>
      </Box>

      <Typography
        sx={{
          mt: 0.25,
          fontFamily: MONO,
          fontSize: '0.66rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: isDark ? SOV.slate : '#475467',
        }}
      >
        {label}
      </Typography>

      {status && (
        <Chip
          label={status}
          size="small"
          sx={{
            mt: 0.5,
            fontFamily: MONO,
            fontSize: '0.64rem',
            fontWeight: 700,
            bgcolor: isDark ? rgba(rawCol, 0.14) : rgba(strokeCol, 0.08),
            color: strokeCol,
            border: `1px solid ${rgba(strokeCol, 0.35)}`,
          }}
        />
      )}
    </Box>
  );
}

/**
 * SovereignSparkline — responsive SVG trend line + area gradient + threshold line.
 */
export function SovereignSparkline({
  data = [],
  title = 'TELEMETRY STREAM',
  value,
  unit = '',
  threshold,
  thresholdLabel,
  height = 96,
  accent = SOV.cyber,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gradId = useId().replace(/:/g, '');
  const strokeCol = resolveModeAccent(accent, isDark);

  const series = data.length > 1 ? data : data.length === 1 ? [data[0], data[0]] : [0, 0];
  const allVals = threshold != null ? [...series, threshold] : series;
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const range = Math.max(1e-6, maxVal - minVal);

  const W = 280;
  const H = 90;
  const padX = 6;
  const padY = 10;

  const pts = series.map((v, idx) => {
    const x = padX + (idx / Math.max(1, series.length - 1)) * (W - padX * 2);
    const y = H - padY - ((v - minVal) / range) * (H - padY * 2);
    return { x, y, v };
  });

  const linePoints = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPoints = `${padX},${H - 2} ${linePoints} ${W - padX},${H - 2}`;
  const last = pts[pts.length - 1];
  const threshY =
    threshold != null ? H - padY - ((threshold - minVal) / range) * (H - padY * 2) : null;
  const latestVal = value != null ? value : series[series.length - 1];

  return (
    <Box
      sx={{
        bgcolor: isDark ? SOV.obsidian2 : '#FFFFFF',
        border: `1px solid ${isDark ? rgba(accent, 0.25) : 'rgba(16,24,40,0.12)'}`,
        borderRadius: 2,
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
        <Typography
          sx={{
            fontFamily: MONO,
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: isDark ? SOV.slate : '#475467',
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: '1.15rem',
            color: strokeCol,
          }}
        >
          {latestVal}
          {unit && (
            <Box component="span" sx={{ fontFamily: MONO, fontSize: '0.7rem', ml: 0.4 }}>
              {unit}
            </Box>
          )}
        </Typography>
      </Box>

      <Box sx={{ width: '100%', height }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height="100%" role="img" aria-label={`${title} trend`}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeCol} stopOpacity={isDark ? 0.35 : 0.22} />
              <stop offset="100%" stopColor={strokeCol} stopOpacity={0} />
            </linearGradient>
          </defs>

          {threshY != null && (
            <>
              <line
                x1={padX}
                y1={threshY}
                x2={W - padX}
                y2={threshY}
                stroke={isDark ? SOV.crimson : '#B91C1C'}
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              {thresholdLabel && (
                <text
                  x={padX + 2}
                  y={threshY < 20 ? threshY + 11 : threshY - 5}
                  fill={isDark ? SOV.crimson : '#B91C1C'}
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  {thresholdLabel}
                </text>
              )}
            </>
          )}

          <polygon points={areaPoints} fill={`url(#${gradId})`} />
          <polyline
            fill="none"
            stroke={strokeCol}
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={linePoints}
          />
          {last && <circle cx={last.x} cy={last.y} r="3.5" fill={strokeCol} />}
        </svg>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: '0.66rem', color: isDark ? SOV.slateDim : '#667085' }}>
        <span>MIN {minVal.toFixed(1)}{unit}</span>
        <span>SAMPLES {series.length}</span>
        <span>MAX {maxVal.toFixed(1)}{unit}</span>
      </Box>
    </Box>
  );
}

function getStatusTone(val) {
  const s = String(val || '').toUpperCase();
  if (/(PASS|OK|ONLINE|NOMINAL|SAFE|LOCAL|VERIFIED|LOW)/.test(s)) return SOV.emerald;
  if (/(WARN|MED|MODERATE|DEGRADED|CAUTION)/.test(s)) return SOV.amber;
  if (/(FAIL|CRIT|HIGH|ERR|TRIPPED|BLOCK|EXPIRED|NONE)/.test(s)) return SOV.crimson;
  return null;
}

/**
 * SovereignDataTable — searchable diagnostic table with CSV & JSON export.
 */
export function SovereignDataTable({
  title = 'TELEMETRY MATRIX',
  eyebrow,
  columns = [],
  rows = [],
  searchPlaceholder = 'Filter records...',
  filename = 'zoth-records.csv',
  accent = SOV.gold,
  maxHeight = 320,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);

  const [query, setQuery] = useState('');
  const [copiedJson, setCopiedJson] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      columns.some((col) => String(row[col.key] ?? '').toLowerCase().includes(q))
    );
  }, [columns, query, rows]);

  const exportCsv = () => {
    const header = columns.map((c) => `"${String(c.label).replace(/"/g, '""')}"`).join(',');
    const lines = filtered.map((r) =>
      columns.map((c) => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    downloadText([header, ...lines].join('\n'), filename, 'text/csv;charset=utf-8');
  };

  return (
    <Box
      sx={{
        bgcolor: isDark ? SOV.obsidian2 : '#FFFFFF',
        border: `1px solid ${isDark ? rgba(accent, 0.25) : 'rgba(16,24,40,0.12)'}`,
        borderRadius: 2,
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Box
        sx={{
          p: 1.75,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.25,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)'}`,
        }}
      >
        <Box>
          {eyebrow && (
            <Typography sx={{ fontFamily: MONO, fontSize: '0.66rem', letterSpacing: '0.16em', color: modeAccent, fontWeight: 700 }}>
              {eyebrow}
            </Typography>
          )}
          <Typography sx={{ fontFamily: SERIF, fontSize: '1.15rem', color: isDark ? '#F5F1E6' : '#101828' }}>
            {title} ({filtered.length})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            inputProps={{ 'aria-label': `${title || 'Table'} ${searchPlaceholder}` }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: '100%', sm: 210 } }}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={exportCsv}
            sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: modeAccent, borderColor: rgba(modeAccent, 0.45) }}
          >
            CSV
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={copiedJson ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            onClick={() => copyString(JSON.stringify(filtered, null, 2), () => {
              setCopiedJson(true);
              setTimeout(() => setCopiedJson(false), 1600);
            })}
            sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: isDark ? '#EDEFF2' : '#101828', borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(16,24,40,0.22)' }}
          >
            {copiedJson ? 'Copied' : 'JSON'}
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ maxHeight, overflowX: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align || 'left'}
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    bgcolor: isDark ? '#0B0F1A' : '#F6F3EC',
                    color: modeAccent,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row, rIdx) => (
              <TableRow key={row.id || rIdx} hover>
                {columns.map((col) => {
                  const val = row[col.key];
                  const isStatusCol = /status|severity|state|tier|health/i.test(col.key);
                  const tone = isStatusCol ? getStatusTone(val) : null;
                  const chipCol = tone ? resolveModeAccent(tone, isDark) : null;

                  return (
                    <TableCell
                      key={col.key}
                      align={col.align || 'left'}
                      sx={{
                        fontFamily: col.mono ? MONO : 'inherit',
                        fontSize: col.mono ? '0.76rem' : '0.84rem',
                        color: isDark ? '#EDEFF2' : '#101828',
                      }}
                    >
                      {tone ? (
                        <Chip
                          label={String(val ?? '')}
                          size="small"
                          sx={{
                            height: 22,
                            fontFamily: MONO,
                            fontSize: '0.64rem',
                            fontWeight: 800,
                            bgcolor: isDark ? rgba(tone, 0.14) : rgba(chipCol, 0.1),
                            color: chipCol,
                            border: `1px solid ${rgba(chipCol, 0.35)}`,
                          }}
                        />
                      ) : (
                        String(val ?? '')
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={Math.max(1, columns.length)} sx={{ textAlign: 'center', py: 3, fontFamily: MONO, fontSize: '0.78rem' }}>
                  No matching records.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

/**
 * SovereignKeyValueGrid — structured attribute readout with per-cell copy buttons.
 */
export function SovereignKeyValueGrid({ items = [], cols = 2, accent = SOV.gold, sx }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);
  const [copiedIdx, setCopiedIdx] = useState(null);

  return (
    <Grid container spacing={1.5} sx={sx}>
      {items.map((item, idx) => {
        const copied = copiedIdx === idx;
        return (
          <Grid key={`${item.label}-${idx}`} xs={12} sm={6} md={cols === 3 ? 4 : 6}>
            <Box
              sx={{
                bgcolor: isDark ? '#080A11' : '#F8F5EE',
                border: `1px solid ${isDark ? rgba(accent, 0.2) : 'rgba(16,24,40,0.1)'}`,
                borderRadius: 1.5,
                px: 1.5,
                py: 1.15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                height: '100%',
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mb: 0.35 }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: modeAccent }}>
                    {item.label}
                  </Typography>
                  {item.badge && (
                    <Chip label={item.badge} size="small" sx={{ height: 18, fontFamily: MONO, fontSize: '0.6rem' }} />
                  )}
                </Box>
                <Typography
                  sx={{
                    fontFamily: item.mono !== false ? MONO : 'inherit',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: isDark ? '#F5F1E6' : '#101828',
                    wordBreak: 'break-word',
                  }}
                >
                  {item.value}
                </Typography>
              </Box>

              {item.copyable !== false && (
                <IconButton
                  aria-label={`Copy ${item.label}`}
                  onClick={() => copyString(item.value, () => {
                    setCopiedIdx(idx);
                    setTimeout(() => setCopiedIdx(null), 1500);
                  })}
                  sx={{ minWidth: 44, minHeight: 44, color: copied ? (isDark ? SOV.emerald : '#047857') : modeAccent }}
                >
                  {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              )}
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}

/**
 * SovereignAlertBanner — semantic callout strip (success / warning / error / info).
 */
export function SovereignAlertBanner({
  severity = 'info',
  title,
  message,
  actionLabel,
  onAction,
  href,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const rawMap = {
    success: SOV.emerald,
    warning: SOV.amber,
    error: SOV.crimson,
    info: SOV.cyber,
  };
  const raw = rawMap[severity] || SOV.cyber;
  const col = resolveModeAccent(raw, isDark);

  return (
    <Box
      role={severity === 'error' ? 'alert' : 'status'}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        px: 2,
        py: 1.4,
        borderRadius: 1.75,
        border: `1px solid ${rgba(col, 0.35)}`,
        borderLeft: `4px solid ${col}`,
        bgcolor: isDark ? rgba(raw, 0.08) : rgba(col, 0.06),
        ...sx,
      }}
    >
      <Box sx={{ minWidth: 0, flex: '1 1 260px' }}>
        {title && (
          <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.08em', color: col, textTransform: 'uppercase' }}>
            {title}
          </Typography>
        )}
        {message && (
          <Typography variant="body2" sx={{ mt: title ? 0.35 : 0, color: isDark ? '#EDEFF2' : '#101828', lineHeight: 1.55 }}>
            {message}
          </Typography>
        )}
      </Box>

      {actionLabel && (
        <Button
          size="small"
          variant="outlined"
          onClick={onAction}
          {...(href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})}
          sx={{ minHeight: 44, px: 1.75, fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: col, borderColor: rgba(col, 0.45) }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

/**
 * SovereignFaqAccordion — accessible dual-theme FAQ & specification accordion.
 */
export function SovereignFaqAccordion({ items = [], accent = SOV.gold, defaultOpenIndex = 0, sx }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);
  const [openIdx, setOpenIdx] = useState(defaultOpenIndex);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, ...sx }}>
      {items.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <Box
            key={`${item.question}-${idx}`}
            sx={{
              bgcolor: isDark ? SOV.obsidian2 : '#FFFFFF',
              border: `1px solid ${isOpen ? modeAccent : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(16,24,40,0.12)'}`,
              borderRadius: 1.75,
              overflow: 'hidden',
            }}
          >
            <Box
              component="button"
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIdx(isOpen ? -1 : idx)}
              sx={{
                width: '100%',
                minHeight: 48,
                px: 2,
                py: 1.25,
                border: 'none',
                background: 'transparent',
                color: isDark ? '#F5F1E6' : '#101828',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                {item.tag && (
                  <Chip
                    label={item.tag}
                    size="small"
                    sx={{
                      height: 20,
                      fontFamily: MONO,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      bgcolor: rgba(modeAccent, 0.12),
                      color: modeAccent,
                    }}
                  />
                )}
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
                  {item.question}
                </Typography>
              </Box>
              <ExpandMoreIcon
                sx={{
                  color: modeAccent,
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.18s ease',
                  flexShrink: 0,
                }}
              />
            </Box>

            {isOpen && (
              <Box
                sx={{
                  px: 2,
                  pb: 1.75,
                  pt: 0.5,
                  borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.08)'}`,
                }}
              >
                <Typography variant="body2" sx={{ color: isDark ? SOV.slate : '#475467', lineHeight: 1.65 }}>
                  {item.answer}
                </Typography>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

/**
 * SovereignJsonTree — collapsible, syntax-highlighted, searchable JSON/AST inspector.
 * Replaces unstyled JSON.stringify dumps with interactive tree navigation.
 */
function JsonTreeNode({
  nodeKey,
  value,
  depth = 0,
  maxDepth = 3,
  searchTerm = '',
  path = '',
  accent = SOV.gold,
  isDark = true,
  expandedPaths,
  setExpandedPaths,
}) {
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const currentPath = path ? (nodeKey !== undefined ? `${path}.${nodeKey}` : path) : String(nodeKey ?? 'root');
  
  const isExpanded = expandedPaths.has(currentPath);

  const toggleExpand = (e) => {
    e.stopPropagation();
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(currentPath)) next.delete(currentPath);
      else next.add(currentPath);
      return next;
    });
  };

  const [copied, setCopied] = useState(false);
  const handleCopyNode = (e) => {
    e.stopPropagation();
    copyText(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)).then((ok) => {
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }
    });
  };

  const keyCol = resolveModeAccent(accent, isDark);
  const stringCol = resolveModeAccent(SOV.emerald, isDark);
  const numCol = resolveModeAccent(SOV.cyber, isDark);
  const boolCol = resolveModeAccent('#C084FC', isDark);
  const nullCol = isDark ? SOV.slate : '#94A3B8';

  const matchesSearch = Boolean(
    searchTerm &&
    ((nodeKey && String(nodeKey).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (!isObject && String(value).toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (!isObject) {
    let renderedValue = null;
    if (typeof value === 'string') {
      renderedValue = <Typography component="span" sx={{ fontFamily: MONO, fontSize: '0.78rem', color: stringCol }}>"{value}"</Typography>;
    } else if (typeof value === 'number') {
      renderedValue = <Typography component="span" sx={{ fontFamily: MONO, fontSize: '0.78rem', color: numCol }}>{value}</Typography>;
    } else if (typeof value === 'boolean') {
      renderedValue = <Typography component="span" sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 700, color: boolCol }}>{String(value)}</Typography>;
    } else {
      renderedValue = <Typography component="span" sx={{ fontFamily: MONO, fontSize: '0.78rem', fontStyle: 'italic', color: nullCol }}>{value === null ? 'null' : 'undefined'}</Typography>;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 0.25,
          pl: depth * 1.75,
          bgcolor: matchesSearch ? rgba(accent, 0.15) : 'transparent',
          borderRadius: 0.5,
          '&:hover .node-copy-btn': { opacity: 1 },
        }}
      >
        {nodeKey !== undefined && (
          <Typography component="span" sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 700, color: keyCol }}>
            {nodeKey}:
          </Typography>
        )}
        {renderedValue}
        <IconButton
          size="small"
          className="node-copy-btn"
          aria-label="Copy node value"
          onClick={handleCopyNode}
          sx={{ opacity: 0, p: 0.25, transition: 'opacity 0.15s ease', color: copied ? SOV.emerald : keyCol }}
        >
          {copied ? <CheckIcon sx={{ fontSize: 13 }} /> : <ContentCopyIcon sx={{ fontSize: 13 }} />}
        </IconButton>
      </Box>
    );
  }

  const keys = Object.keys(value || {});
  const count = keys.length;
  const brackets = isArray ? ['[', ']'] : ['{', '}'];

  return (
    <Box sx={{ pl: depth > 0 ? 1.75 : 0, py: 0.15 }}>
      <Box
        onClick={toggleExpand}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          userSelect: 'none',
          py: 0.25,
          borderRadius: 0.5,
          bgcolor: matchesSearch ? rgba(accent, 0.15) : 'transparent',
          '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
          '&:hover .node-copy-btn': { opacity: 1 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', color: keyCol }}>
          {isExpanded ? <ArrowDropDownIcon sx={{ fontSize: 18 }} /> : <ArrowRightIcon sx={{ fontSize: 18 }} />}
        </Box>
        {nodeKey !== undefined && (
          <Typography component="span" sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 700, color: keyCol }}>
            {nodeKey}:
          </Typography>
        )}
        <Typography component="span" sx={{ fontFamily: MONO, fontSize: '0.76rem', color: isDark ? SOV.slate : '#64748B' }}>
          {isExpanded ? brackets[0] : `${brackets[0]} ... ${brackets[1]} (${count} ${isArray ? 'items' : 'keys'})`}
        </Typography>
        <IconButton
          size="small"
          className="node-copy-btn"
          aria-label="Copy JSON fragment"
          onClick={handleCopyNode}
          sx={{ opacity: 0, p: 0.25, transition: 'opacity 0.15s ease', color: copied ? SOV.emerald : keyCol }}
        >
          {copied ? <CheckIcon sx={{ fontSize: 13 }} /> : <ContentCopyIcon sx={{ fontSize: 13 }} />}
        </IconButton>
      </Box>

      {isExpanded && (
        <Box sx={{ borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`, ml: 1, pl: 0.5 }}>
          {keys.map((k) => (
            <JsonTreeNode
              key={k}
              nodeKey={isArray ? Number(k) : k}
              value={value[k]}
              depth={depth + 1}
              maxDepth={maxDepth}
              searchTerm={searchTerm}
              path={currentPath}
              accent={accent}
              isDark={isDark}
              expandedPaths={expandedPaths}
              setExpandedPaths={setExpandedPaths}
            />
          ))}
          <Box sx={{ pl: 1, py: 0.1 }}>
            <Typography component="span" sx={{ fontFamily: MONO, fontSize: '0.76rem', color: isDark ? SOV.slate : '#64748B' }}>
              {brackets[1]}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export function SovereignJsonTree({
  data,
  title = 'STRUCTURED JSON INSPECTOR',
  initialDepth = 2,
  searchable = true,
  copyable = true,
  accent = SOV.gold,
  maxHeight = 440,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);

  const allPaths = useMemo(() => {
    const paths = new Set();
    function walk(val, path, depth) {
      if (val !== null && typeof val === 'object') {
        paths.add(path);
        if (depth < initialDepth) {
          Object.keys(val).forEach((k) => walk(val[k], `${path}.${k}`, depth + 1));
        }
      }
    }
    walk(data, 'root', 0);
    return paths;
  }, [data, initialDepth]);

  const [expandedPaths, setExpandedPaths] = useState(allPaths);

  const expandAll = () => {
    const paths = new Set();
    function walk(val, path) {
      if (val !== null && typeof val === 'object') {
        paths.add(path);
        Object.keys(val).forEach((k) => walk(val[k], `${path}.${k}`));
      }
    }
    walk(data, 'root');
    setExpandedPaths(paths);
  };

  const collapseAll = () => {
    setExpandedPaths(new Set());
  };

  const handleCopyAll = () => {
    copyText(JSON.stringify(data, null, 2)).then((ok) => {
      if (ok) {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 1600);
      }
    });
  };

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.12)'}`,
        bgcolor: isDark ? '#08080C' : '#FAF8F3',
        overflow: 'hidden',
        position: 'relative',
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          px: 2,
          py: 1.25,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.08)'}`,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(16,24,40,0.02)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DataObjectIcon sx={{ fontSize: 18, color: modeAccent }} />
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: isDark ? SOV.cream : '#101828',
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {searchable && (
            <TextField
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter keys or values..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 14, color: isDark ? SOV.slate : '#94A3B8' }} />
                  </InputAdornment>
                ),
                sx: {
                  height: 32,
                  fontSize: '0.74rem',
                  fontFamily: MONO,
                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                  borderRadius: 1,
                },
              }}
            />
          )}

          <Button
            size="small"
            onClick={expandAll}
            startIcon={<UnfoldMoreIcon sx={{ fontSize: 14 }} />}
            sx={{
              minHeight: 32,
              fontFamily: MONO,
              fontSize: '0.7rem',
              textTransform: 'none',
              color: isDark ? SOV.slate : '#64748B',
            }}
          >
            Expand
          </Button>

          <Button
            size="small"
            onClick={collapseAll}
            startIcon={<UnfoldLessIcon sx={{ fontSize: 14 }} />}
            sx={{
              minHeight: 32,
              fontFamily: MONO,
              fontSize: '0.7rem',
              textTransform: 'none',
              color: isDark ? SOV.slate : '#64748B',
            }}
          >
            Collapse
          </Button>

          {copyable && (
            <Button
              size="small"
              variant="outlined"
              onClick={handleCopyAll}
              startIcon={copiedAll ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
              sx={{
                minHeight: 32,
                px: 1.25,
                fontFamily: MONO,
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'none',
                borderColor: rgba(modeAccent, 0.4),
                color: modeAccent,
                '&:hover': { borderColor: modeAccent, bgcolor: rgba(modeAccent, 0.08) },
              }}
            >
              {copiedAll ? 'Copied' : 'Copy All'}
            </Button>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          p: 2,
          maxHeight,
          overflowY: 'auto',
          fontFamily: MONO,
        }}
      >
        <JsonTreeNode
          value={data}
          depth={0}
          searchTerm={searchTerm}
          path="root"
          accent={accent}
          isDark={isDark}
          expandedPaths={expandedPaths}
          setExpandedPaths={setExpandedPaths}
        />
      </Box>
    </Box>
  );
}

/**
 * SovereignFileDropzone — zero-dependency in-browser drag & drop file processor.
 * Automatically parses text/JSON/code or binary buffers with size validation.
 */
export function SovereignFileDropzone({
  onFilesLoaded,
  accept = '*/*',
  multiple = false,
  maxSizeMb = 25,
  title = 'DROP FILES OR DIRECTORIES HERE',
  subtitle = 'Drag & drop text, JSON, code, or binary files — processed 100% in-browser',
  accent = SOV.gold,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadedFiles, setLoadedFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const processFileList = (fileList) => {
    setErrorMsg('');
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const accepted = [];
    let pending = files.length;

    files.forEach((file) => {
      if (file.size > maxSizeMb * 1024 * 1024) {
        setErrorMsg(`File "${file.name}" exceeds ${maxSizeMb} MB limit.`);
        pending -= 1;
        return;
      }

      const isText = file.type.startsWith('text/') ||
        /\.(json|txt|md|csv|js|jsx|ts|tsx|py|html|css|xml|yaml|yml|toml|sql|sh)$/i.test(file.name);

      const reader = new FileReader();
      if (isText) {
        reader.onload = (e) => {
          accepted.push({
            name: file.name,
            size: file.size,
            type: file.type || 'text/plain',
            content: e.target.result,
          });
          pending -= 1;
          if (pending === 0) finish();
        };
        reader.readAsText(file);
      } else {
        reader.onload = (e) => {
          accepted.push({
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            buffer: e.target.result,
          });
          pending -= 1;
          if (pending === 0) finish();
        };
        reader.readAsArrayBuffer(file);
      }
    });

    function finish() {
      setLoadedFiles(accepted);
      if (onFilesLoaded) onFilesLoaded(accepted);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      processFileList(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (idx) => {
    const next = loadedFiles.filter((_, i) => i !== idx);
    setLoadedFiles(next);
    if (onFilesLoaded) onFilesLoaded(next);
  };

  const handleClearAll = () => {
    setLoadedFiles([]);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFilesLoaded) onFilesLoaded([]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ...sx }}>
      <Box
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 2,
          border: `2px dashed ${isDragOver ? modeAccent : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(16,24,40,0.20)')}`,
          bgcolor: isDragOver
            ? rgba(modeAccent, 0.08)
            : (isDark ? 'rgba(255,255,255,0.015)' : 'rgba(16,24,40,0.02)'),
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.18s ease',
          '&:hover': {
            borderColor: modeAccent,
            bgcolor: rgba(modeAccent, 0.04),
          },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={(e) => processFileList(e.target.files)}
        />
        <UploadFileIcon sx={{ fontSize: 36, color: modeAccent, mb: 1 }} />
        <Typography sx={{ fontFamily: MONO, fontSize: '0.84rem', fontWeight: 700, color: isDark ? SOV.cream : '#101828', mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: isDark ? SOV.slate : '#64748B', maxWidth: 480, mx: 'auto', mb: 1 }}>
          {subtitle}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={`MAX ${maxSizeMb} MB`}
            sx={{ fontFamily: MONO, fontSize: '0.66rem', fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
          />
          <Chip
            size="small"
            label={multiple ? 'MULTIPLE FILES' : 'SINGLE FILE'}
            sx={{ fontFamily: MONO, fontSize: '0.66rem', fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
          />
        </Box>
      </Box>

      {errorMsg && (
        <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: SOV.crimson }}>
          ✖ {errorMsg}
        </Typography>
      )}

      {loadedFiles.length > 0 && (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(16,24,40,0.02)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)'}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: isDark ? SOV.cream : '#101828' }}>
              LOADED ARTIFACTS ({loadedFiles.length})
            </Typography>
            <Button
              size="small"
              onClick={handleClearAll}
              sx={{ minHeight: 32, fontFamily: MONO, fontSize: '0.68rem', color: SOV.crimson, textTransform: 'none' }}
            >
              Clear All
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {loadedFiles.map((file, idx) => (
              <Box
                key={`${file.name}-${idx}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 1,
                  bgcolor: isDark ? '#0D0E15' : '#FFFFFF',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.08)'}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  <InsertDriveFileIcon sx={{ fontSize: 16, color: modeAccent }} />
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 600, color: isDark ? SOV.cream : '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: isDark ? SOV.slate : '#94A3B8' }}>
                    ({(file.size / 1024).toFixed(1)} KB)
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  aria-label="Remove file"
                  onClick={() => handleRemoveFile(idx)}
                  sx={{ color: isDark ? SOV.slate : '#94A3B8', '&:hover': { color: SOV.crimson } }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

/**
 * SovereignMediaHUD — sovereign audio player, waveform engine & media telemetry.
 * Displays animated waveform canvas, playback controls, scrubber, speed & volume.
 */
export function SovereignMediaHUD({
  src,
  title = 'SOVEREIGN AUDIO ENGINE',
  subtitle = 'Procedural synthesis & waveform telemetry',
  duration = 120,
  bars = 48,
  accent = SOV.gold,
  onPlayStateChange,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const modeAccent = resolveModeAccent(accent, isDark);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef(null);

  const waveformPeaks = useMemo(() => {
    const peaks = [];
    for (let i = 0; i < bars; i++) {
      const v = Math.sin(i * 0.28) * 0.35 + Math.sin(i * 0.65 + 1.2) * 0.35 + 0.55;
      peaks.push(Math.max(0.12, Math.min(1.0, v)));
    }
    return peaks;
  }, [bars]);

  const togglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    if (audioRef.current) {
      if (next) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
    if (onPlayStateChange) onPlayStateChange(next);
  };

  const handleSeek = (_, val) => {
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  };

  const formatTime = (secs) => {
    const s = Math.floor(secs || 0);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const progressFraction = duration > 0 ? currentTime / duration : 0;

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.12)'}`,
        bgcolor: isDark ? '#08080D' : '#FAF8F3',
        p: { xs: 2, md: 2.5 },
        ...sx,
      }}
    >
      {src && (
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header Info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 800, color: modeAccent, letterSpacing: '0.06em' }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: isDark ? SOV.slate : '#64748B', display: 'block' }}>
            {subtitle}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={isPlaying ? 'PLAYING' : 'IDLE'}
          sx={{
            fontFamily: MONO,
            fontSize: '0.66rem',
            fontWeight: 800,
            bgcolor: isPlaying ? rgba(SOV.emerald, 0.15) : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
            color: isPlaying ? SOV.emerald : (isDark ? SOV.slate : '#64748B'),
            border: `1px solid ${isPlaying ? rgba(SOV.emerald, 0.3) : 'transparent'}`,
          }}
        />
      </Box>

      {/* Waveform Visualization Bars */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: '2px', sm: '3px' },
          height: 64,
          px: 1,
          mb: 1.5,
          borderRadius: 1.5,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(16,24,40,0.03)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(16,24,40,0.06)'}`,
        }}
      >
        {waveformPeaks.map((peak, i) => {
          const barFraction = i / bars;
          const isPlayed = barFraction <= progressFraction;
          return (
            <Box
              key={i}
              sx={{
                flex: 1,
                height: `${peak * 100}%`,
                bgcolor: isPlayed ? modeAccent : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(16,24,40,0.15)'),
                borderRadius: '2px',
                transition: 'background-color 0.1s ease',
              }}
            />
          );
        })}
      </Box>

      {/* Scrubber Slider */}
      <Box sx={{ px: 0.5, mb: 1 }}>
        <Slider
          size="small"
          value={currentTime}
          min={0}
          max={duration}
          onChange={handleSeek}
          aria-label="Audio scrubber"
          sx={{
            color: modeAccent,
            height: 4,
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
              '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 6px ${rgba(modeAccent, 0.2)}` },
            },
          }}
        />
      </Box>

      {/* Controls Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            sx={{
              minWidth: 44,
              minHeight: 44,
              bgcolor: modeAccent,
              color: isDark ? '#08080B' : '#FFFFFF',
              '&:hover': { bgcolor: isDark ? '#F5F1E6' : '#1E293B', color: isDark ? '#08080B' : '#FFFFFF' },
            }}
          >
            {isPlaying ? <PauseIcon sx={{ fontSize: 22 }} /> : <PlayArrowIcon sx={{ fontSize: 22 }} />}
          </IconButton>

          <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: isDark ? SOV.cream : '#101828' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            size="small"
            onClick={cycleSpeed}
            sx={{
              minHeight: 36,
              px: 1,
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 800,
              color: modeAccent,
              border: `1px solid ${rgba(modeAccent, 0.3)}`,
            }}
          >
            {speed}x
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: 110 }}>
            <IconButton
              size="small"
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              sx={{ color: isDark ? SOV.slate : '#64748B' }}
            >
              {isMuted || volume === 0 ? <VolumeOffIcon sx={{ fontSize: 18 }} /> : <VolumeUpIcon sx={{ fontSize: 18 }} />}
            </IconButton>
            <Slider
              size="small"
              value={isMuted ? 0 : volume}
              min={0}
              max={100}
              onChange={(_, v) => { setVolume(v); setIsMuted(false); }}
              aria-label="Volume slider"
              sx={{
                color: modeAccent,
                '& .MuiSlider-thumb': { width: 10, height: 10 },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
