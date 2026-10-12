import React, { useEffect, useState } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';

const gold = '#D4AF37';
const SHORTCUTS = [
  ['Ctrl / ⌘ + K', 'Search every page and tool (command palette)'],
  ['Ctrl + ~', 'Open the 21-terminal Swarm matrix'],
  ['/', 'Focus search (Tools catalog)'],
  ['?', 'Show this list'],
  ['Esc', 'Close dialogs and palettes'],
  ['Tab / Shift + Tab', 'Move between controls'],
];

// Press "?" anywhere outside a text field to see the Studio's keyboard shortcuts.
export default function ShortcutsHelp() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); setOpen((v) => !v); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth
      PaperProps={{ sx: { border: `1px solid ${gold}55`, borderRadius: 3, backgroundImage: 'none' } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center' }}>
        <Box component="span" sx={{ flex: 1 }}>Keyboard shortcuts</Box>
        <IconButton aria-label="Close" size="small" onClick={() => setOpen(false)}>✕</IconButton>
      </DialogTitle>
      <DialogContent>
        {SHORTCUTS.map(([k, d]) => (
          <Box key={k} sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box component="kbd" sx={{ minWidth: 120, fontFamily: 'monospace', fontSize: 12.5, color: gold, border: `1px solid ${gold}66`, borderRadius: 1, px: 1, py: 0.4, textAlign: 'center' }}>{k}</Box>
            <Typography variant="body2">{d}</Typography>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
}
