/**
 * SovereignWorkstationShell — reusable multi-pane shell for Zoth Studio tools & pages.
 *
 * Eliminates boilerplate across workstations: mounts the open-access support bar,
 * provenance header + optional tutorial modal, seeded SovereignBand canvas,
 * SovereignKpiStrip, SovereignActionBar, and responsive 12-col split panes.
 */

import React, { useState } from 'react';
import { Box, Button, Chip, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SovereignBand from './SovereignBand.jsx';
import { SovereignEyebrow } from './typography.jsx';
import { SOV, MONO, rgba, bandAccent } from './palette.js';
import {
  SovereignActionBar,
  SovereignKpiStrip,
  SovereignSupportBar,
  resolveModeAccent,
} from './SovereignPrimitives.jsx';
import SovereignTutorialModal from '../SovereignTutorialModal.jsx';

const SERIF = '"Celtic Garamond", Georgia, "Times New Roman", serif';

export default function SovereignWorkstationShell({
  id = 'zoth-workstation',
  category = 'SOVEREIGN WORKSTATION',
  title,
  subtitle,
  version = '1.0.0',
  variant,
  accent,
  metrics = [],
  tutorialSteps = [],
  actions = [],
  status,
  leftPane,
  rightPane,
  leftCols = 5,
  rightCols = 7,
  bottomPane,
  showSupportBar = true,
  bandHeight,
  children,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const resolvedRawAccent = accent || bandAccent(id);
  const modeAccent = resolveModeAccent(resolvedRawAccent, isDark);
  const textPrimary = isDark ? '#F5F1E6' : '#101828';
  const textSecondary = isDark ? SOV.slate : '#475467';

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      {showSupportBar && <SovereignSupportBar />}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 1.75,
        }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 320px' }}>
          <SovereignEyebrow accent={modeAccent} right={category} sx={{ mb: 0.75 }}>
            {id}
          </SovereignEyebrow>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, alignItems: 'center' }}>
            {title && (
              <Typography
                component="h2"
                sx={{
                  fontFamily: SERIF,
                  fontWeight: 400,
                  fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.1rem' },
                  lineHeight: 1.15,
                  color: textPrimary,
                }}
              >
                {title}
              </Typography>
            )}
            <Chip
              label={`v${version}`}
              size="small"
              sx={{
                fontFamily: MONO,
                fontSize: '0.68rem',
                fontWeight: 700,
                bgcolor: isDark ? rgba(resolvedRawAccent, 0.14) : rgba(modeAccent, 0.08),
                color: modeAccent,
                border: `1px solid ${rgba(modeAccent, 0.35)}`,
              }}
            />
          </Box>

          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                mt: 0.75,
                maxWidth: '72ch',
                color: textSecondary,
                fontSize: { xs: '0.88rem', md: '0.95rem' },
                lineHeight: 1.6,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {tutorialSteps.length > 0 && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => setTutorialOpen(true)}
            startIcon={<HelpOutlineIcon fontSize="small" />}
            sx={{
              minHeight: 44,
              px: 1.75,
              fontFamily: MONO,
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'none',
              color: modeAccent,
              borderColor: rgba(modeAccent, 0.45),
              '&:hover': {
                borderColor: modeAccent,
                bgcolor: rgba(modeAccent, 0.08),
              },
            }}
          >
            Quickstart
          </Button>
        )}
      </Box>

      <SovereignBand
        seed={id}
        variant={variant}
        eyebrow={category}
        caption={title}
        height={bandHeight}
        label={`${title || id} — Zoth sovereign canvas`}
      />

      {metrics.length > 0 && <SovereignKpiStrip items={metrics} />}

      {(actions.length > 0 || status) && (
        <SovereignActionBar actions={actions} status={status} statusAccent={resolvedRawAccent} />
      )}

      {(leftPane || rightPane) && (
        <Grid container spacing={2.5} sx={{ mb: bottomPane || children ? 2.5 : 0 }}>
          {leftPane && (
            <Grid xs={12} md={leftCols}>
              {leftPane}
            </Grid>
          )}
          {rightPane && (
            <Grid xs={12} md={rightCols}>
              {rightPane}
            </Grid>
          )}
        </Grid>
      )}

      {bottomPane && <Box sx={{ mt: 2.5 }}>{bottomPane}</Box>}

      {children}

      {tutorialSteps.length > 0 && (
        <SovereignTutorialModal
          toolId={id}
          toolName={title || id}
          tagline={subtitle || category}
          steps={tutorialSteps}
          accentColor={resolvedRawAccent}
          open={tutorialOpen}
          onClose={() => setTutorialOpen(false)}
        />
      )}
    </Box>
  );
}
