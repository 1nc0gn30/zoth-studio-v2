import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import SEO from '../components/SEO';

const gold = '#D4AF37';

// Typo-tolerant similarity on path words (/galery -> /gallery, /tool/capsule -> /tools/agent-capsule-jail).
function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
function score(target, candidate) {
  const words = (s) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const tw = words(target), cw = words(candidate);
  if (!tw.length || !cw.length) return 0;
  let s = 0;
  for (const t of tw) {
    let best = 0;
    for (const c of cw) {
      const sim = c.startsWith(t) || t.startsWith(c) ? 0.9 : 1 - lev(t, c) / Math.max(t.length, c.length);
      best = Math.max(best, sim);
    }
    if (best >= 0.6) s += best;
  }
  return s / tw.length - cw.length * 0.01;   // prefer shorter, closer paths
}

export default function NotFoundPage() {
  const { pathname } = useLocation();
  const [routes, setRoutes] = useState([]);
  useEffect(() => {
    let alive = true;
    fetch('/sitemap.xml')
      .then((r) => (r.ok ? r.text() : ''))
      .then((xml) => {
        if (!alive) return;
        const paths = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)]
          .map((m) => { try { return new URL(m[1]).pathname; } catch { return null; } })
          .filter(Boolean);
        setRoutes([...new Set(paths)]);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  const suggestions = useMemo(
    () => routes.map((r) => [r, score(pathname, r)]).filter(([, s]) => s > 0.5).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([r]) => r),
    [routes, pathname],
  );
  const popular = ['/tools/', '/workstations/', '/swarm/', '/voice/', '/gallery/', '/docs/'];

  return (
    <Container maxWidth="md" sx={{ py: { xs: 10, md: 16 }, textAlign: 'center' }}>
      <SEO title="Page not found | Zoth Studio" description="This Zoth Studio page does not exist." noindex />
      <Typography sx={{ fontFamily: 'monospace', letterSpacing: '0.3em', color: gold, fontSize: 13, fontWeight: 700 }}>ERROR 404</Typography>
      <Typography variant="h2" sx={{ fontWeight: 800, mt: 1.5, fontSize: { xs: '2.1rem', md: '3rem' } }}>This page isn't in the Studio</Typography>
      <Typography sx={{ mt: 2, color: 'text.secondary' }}>
        <Box component="code" sx={{ color: gold, wordBreak: 'break-all' }}>{pathname}</Box> doesn't exist. Press <b>Ctrl/⌘ + K</b> to search every tool, or try one of these:
      </Typography>
      {suggestions.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>Did you mean</Typography>
          <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1} sx={{ mt: 1 }}>
            {suggestions.map((r) => (
              <Chip key={r} component={RouterLink} to={r} clickable label={r} variant="outlined" sx={{ borderColor: `${gold}88`, color: gold, fontFamily: 'monospace' }} />
            ))}
          </Stack>
        </Box>
      )}
      <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1} sx={{ mt: 4 }}>
        {popular.map((r) => (
          <Button key={r} component={RouterLink} to={r} size="small" variant="text" sx={{ color: 'text.primary' }}>{r.replace(/\//g, '') || 'home'}</Button>
        ))}
      </Stack>
      <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 4, bgcolor: gold, color: '#08080B', fontWeight: 800, '&:hover': { bgcolor: '#F5E6AB' } }}>
        Back to Studio home
      </Button>
    </Container>
  );
}
