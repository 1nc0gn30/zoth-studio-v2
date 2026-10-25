import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import BoltIcon from '@mui/icons-material/Bolt';

const mono = '"JetBrains Mono", "IBM Plex Mono", monospace';

export default function ZothFoundryGodModeTool() {
  const [idea, setIdea] = useState('Sprig Neighborhood Pantry — 15-Minute Organic Drops');
  const [templateId, setTemplateId] = useState('hermes-sprig');
  const [accent, setAccent] = useState('#22C55E');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('/api/studio/webgen/templates')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.templates)) setTemplates(d.templates);
      })
      .catch(() => {});
    runQuickBuild(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runQuickBuild(deployNow = false) {
    setLoading(true);
    try {
      const res = await fetch('/api/studio/webgen/oneshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          templateId: templateId || undefined,
          shader: 'braille',
          accent,
          deploy: Boolean(deployNow),
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        bgcolor: '#0A0B10',
        border: '1px solid rgba(212, 175, 55, 0.28)',
        color: '#F8FAFC',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        <Box>
          <Chip
            label="SIMPLE 3-STEP STATIC LAUNCHER (:8092)"
            size="small"
            sx={{ fontFamily: mono, fontSize: '0.66rem', fontWeight: 800, bgcolor: 'rgba(212,175,55,0.15)', color: '#D4AF37', mb: 0.5 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#F5E6AB' }}>
            Zoth QuickSite Starter
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="contained"
            href="/tools/bolt.diy"
            startIcon={<BoltIcon />}
            sx={{ bgcolor: '#D4AF37', color: '#08080B', fontFamily: mono, fontWeight: 900, fontSize: '0.72rem', textTransform: 'none' }}
          >
            Switch to Zoth Bolt (Main AI &amp; Motion Architect)
          </Button>
          <Button
            size="small"
            variant="outlined"
            href="http://127.0.0.1:8092"
            target="_blank"
            rel="noopener"
            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
            sx={{ fontFamily: mono, fontSize: '0.72rem', borderColor: 'rgba(255,255,255,0.2)', color: '#CBD5E1', textTransform: 'none' }}
          >
            Open :8092
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, borderRadius: 2, bgcolor: '#10121B', border: '1px solid rgba(255,255,255,0.08)' }}>
          <TextField
            size="small"
            label="1. Site Title / Short Idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#07080D', color: '#FFF', fontSize: '0.82rem' } }}
          />

          <FormControl size="small">
            <InputLabel sx={{ color: '#94A3B8', fontFamily: mono, fontSize: '0.72rem' }}>2. Pick Starter Template</InputLabel>
            <Select
              value={templateId}
              label="2. Pick Starter Template"
              onChange={(e) => setTemplateId(e.target.value)}
              sx={{ bgcolor: '#07080D', color: '#FFF', fontFamily: mono, fontSize: '0.74rem' }}
            >
              <MenuItem value="">✨ Auto-Match Template</MenuItem>
              {templates.map((t) => (
                <MenuItem key={t.id} value={t.id} sx={{ fontFamily: mono, fontSize: '0.74rem' }}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#94A3B8' }}>3. Accent:</Typography>
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              style={{ width: 44, height: 32, border: 'none', background: 'transparent', cursor: 'pointer' }}
            />
          </Box>

          <Button
            variant="contained"
            disabled={loading}
            startIcon={<AutoAwesomeIcon />}
            onClick={() => runQuickBuild(false)}
            sx={{ bgcolor: '#D4AF37', color: '#08080B', fontFamily: mono, fontWeight: 900, fontSize: '0.75rem', textTransform: 'none' }}
          >
            Preview Starter Page
          </Button>

          <Button
            variant="contained"
            disabled={loading}
            startIcon={<RocketLaunchIcon />}
            onClick={() => runQuickBuild(true)}
            sx={{ bgcolor: '#38BDF8', color: '#08080B', fontFamily: mono, fontWeight: 900, fontSize: '0.75rem', textTransform: 'none' }}
          >
            1-Click Deploy to Netlify
          </Button>

          {loading && <LinearProgress sx={{ bgcolor: 'rgba(212,175,55,0.15)', '& .MuiLinearProgress-bar': { bgcolor: '#D4AF37' } }} />}

          {result?.deploy?.liveUrl && (
            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)' }}>
              <a
                href={result.deploy.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: mono, fontSize: '0.72rem', color: '#34D399', fontWeight: 700 }}
              >
                ✅ Live: {result.deploy.liveUrl} ↗
              </a>
            </Box>
          )}

          {result?.outputDir && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadIcon />}
              href={`http://127.0.0.1:8092/api/download-zip?dir=${encodeURIComponent(result.outputDir)}`}
              sx={{ fontFamily: mono, fontSize: '0.7rem', borderColor: 'rgba(255,255,255,0.2)', color: '#CBD5E1', textTransform: 'none' }}
            >
              Download .ZIP
            </Button>
          )}
        </Box>

        <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(212,175,55,0.25)', minHeight: 460, bgcolor: '#05060A' }}>
          {result?.html ? (
            <iframe
              title="QuickSite Starter Preview"
              srcDoc={result.html}
              style={{ width: '100%', height: 460, border: 'none', background: '#08080B' }}
            />
          ) : (
            <Box sx={{ p: 4, color: '#64748B', fontFamily: mono, fontSize: '0.8rem' }}>Loading preview...</Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
