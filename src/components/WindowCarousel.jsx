import React, { useState } from 'react';
import { Box, Paper, Typography, IconButton, Chip, Stack, Button, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import TableRowsIcon from '@mui/icons-material/TableRows';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

/**
 * WindowCarousel
 * Replaces cramped 4-in-a-row squished windows with either:
 * 1. A spacious, high-fidelity single-window Carousel with Next/Prev navigation and indicator dots.
 * 2. A clean stacked single-column layout with generous breathing room.
 */
export default function WindowCarousel({
  title = 'Interface Showcase',
  badge = 'Window Carousel',
  items = [],
  renderItem = null,
  initialView = 'carousel', // 'carousel' | 'stacked'
  allowToggleMode = true,
  sx = {}
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#B8860B';
  const goldSoft = isDark ? '#F5E6AB' : '#8A6A09';
  const goldBg = isDark ? 'rgba(212,175,55,0.12)' : '#FEF9E7';
  const goldBorder = isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.25)';

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState(initialView);

  const total = items.length;
  if (total === 0) return null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  };

  const activeItem = items[activeIndex];

  return (
    <Box sx={{ width: '100%', mb: 3, ...sx }}>
      {/* Carousel Top Navigation Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
          flexWrap: 'wrap',
          gap: 1.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {badge && (
            <Chip
              label={badge}
              size="small"
              sx={{
                bgcolor: goldBg,
                color: gold,
                border: `1px solid ${goldBorder}`,
                fontWeight: 800,
                fontSize: '0.72rem',
                fontFamily: mono
              }}
            />
          )}
          {title && (
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
              {title}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {allowToggleMode && (
            <Tooltip title={viewMode === 'carousel' ? 'Switch to Stacked Column Layout' : 'Switch to Carousel View'}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setViewMode(viewMode === 'carousel' ? 'stacked' : 'carousel')}
                startIcon={viewMode === 'carousel' ? <TableRowsIcon /> : <ViewCarouselIcon />}
                sx={{
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  py: 0.3,
                  px: 1.2,
                  '&:hover': { borderColor: gold, color: gold }
                }}
              >
                {viewMode === 'carousel' ? 'Stack Columns' : 'Carousel Mode'}
              </Button>
            </Tooltip>
          )}

          {viewMode === 'carousel' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: theme.palette.text.secondary, mr: 0.5, fontWeight: 700 }}>
                {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </Typography>
              <IconButton
                size="small"
                onClick={handlePrev}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.primary,
                  p: 0.5,
                  '&:hover': { bgcolor: goldBg, borderColor: gold, color: gold }
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleNext}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.primary,
                  p: 0.5,
                  '&:hover': { bgcolor: goldBg, borderColor: gold, color: gold }
                }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>

      {/* Main Content Area: Carousel Slide or Stacked */}
      {viewMode === 'carousel' ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2.5,
            border: `1px solid ${goldBorder}`,
            bgcolor: isDark ? '#08080C' : theme.palette.background.paper,
            boxShadow: isDark
              ? '0 12px 32px rgba(0,0,0,0.6), 0 0 20px -6px rgba(212,175,55,0.18)'
              : '0 8px 24px rgba(184,134,11,0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Active Item Content */}
          <Box sx={{ width: '100%' }}>
            {renderItem ? renderItem(activeItem, activeIndex) : activeItem}
          </Box>

          {/* Indicator Navigation Pills */}
          {total > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.8, mt: 2.5, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
              {items.map((_, idx) => (
                <Box
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  sx={{
                    width: activeIndex === idx ? 24 : 8,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: activeIndex === idx ? gold : (isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)'),
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    '&:hover': { bgcolor: gold }
                  }}
                />
              ))}
            </Box>
          )}
        </Paper>
      ) : (
        /* Stacked Single-Column Layout: Each window gets full width with breathing room */
        <Stack spacing={2.5}>
          {items.map((item, idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2.5,
                border: `1px solid ${idx === activeIndex ? goldBorder : theme.palette.divider}`,
                bgcolor: isDark ? '#08080C' : theme.palette.background.paper,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: goldBorder,
                  boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 4px 16px rgba(184,134,11,0.08)'
                }
              }}
            >
              {renderItem ? renderItem(item, idx) : item}
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
