import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Container, Paper, Stack, TextField, Typography, Grid, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TimerIcon from '@mui/icons-material/Timer';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import keys from '../data/adytumKeys.json';
import { useStudioStatus } from '../studio/useStudioStatus';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const STORAGE_KEY = 'zoth-adytum-plan-v1';
const INCUBATION_MS = 5 * 60 * 1000;

function emptyPlan() {
  return { current: 0, startedAt: null, entries: {} };
}

function loadPlan() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || typeof saved.current !== 'number') return emptyPlan();
    return { ...emptyPlan(), ...saved, entries: saved.entries || {} };
  } catch {
    return emptyPlan();
  }
}

export default function AdytumPage() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const gold = dark ? '#D4AF37' : '#B8860B';
  const goldLight = dark ? '#F5E6AB' : '#8A6A09';
  const goldBg = dark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';
  const surface = theme.palette.background.paper;
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const divider = theme.palette.divider;

  const { status } = useStudioStatus();
  const models = status?.services?.ollama?.models || [];
  const [plan, setPlan] = useState(loadPlan);
  const [model, setModel] = useState('');
  const [intention, setIntention] = useState('');
  const [reflection, setReflection] = useState('');
  const [reading, setReading] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  const card = keys[plan.current];
  const entry = plan.entries[card.key] || {};
  const remaining = plan.startedAt ? Math.max(0, INCUBATION_MS - (now - plan.startedAt)) : null;
  const incubated = remaining === 0;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    if (!plan.startedAt || incubated) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [plan.startedAt, incubated]);

  useEffect(() => {
    setIntention(entry.intention || '');
    setReflection(entry.reflection || '');
    setReading(entry.reading || '');
    setError('');
  }, [card.key]);

  useEffect(() => {
    if (!model && models.length) setModel(models[0]);
  }, [models, model]);

  const clock = useMemo(() => {
    if (remaining == null) return '05:00';
    const seconds = Math.ceil(remaining / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }, [remaining]);

  const saveEntry = (patch) => {
    setPlan((prev) => ({
      ...prev,
      entries: {
        ...prev.entries,
        [card.key]: { ...(prev.entries[card.key] || {}), ...patch },
      },
    }));
  };

  const beginIncubation = () => {
    if (!intention.trim()) {
      setError('Write your architectural intention for this key before starting the incubation clock.');
      return;
    }
    saveEntry({ intention: intention.trim() });
    setPlan((prev) => ({ ...prev, startedAt: Date.now() }));
    setNow(Date.now());
    setError('');
  };

  const askModel = async (event) => {
    event.preventDefault();
    if (!model) {
      setError('No local Ollama model is available on 127.0.0.1:11434.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/studio/adytum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: `You are Adytum, the hermetic planning rite in Zoth Studio by NullAI. Stay on Key ${card.key}: ${card.name}. Attribution: ${card.attribution}. Lesson: ${card.lesson}. Question: ${card.question}. If the reflection names a concrete mechanism from the lesson and applies it to the stated intention, begin with [GATE OPENED]. Otherwise begin with [REFLECTION NEEDED] and say what is missing. Do not invent a project the user did not write.`,
            },
            {
              role: 'user',
              content: `Intention:\n${intention.trim()}\n\nReflection:\n${reflection.trim()}`,
            },
          ],
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
      setReading(body.text);
      saveEntry({
        intention: intention.trim(),
        reflection: reflection.trim(),
        reading: body.text,
        gate: Boolean(body.gateOpened),
        model,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const advance = () => {
    if (!entry.gate) return;
    setPlan((prev) => ({
      ...prev,
      current: Math.min(21, prev.current + 1),
      startedAt: null,
    }));
  };

  const exportBrief = () => {
    const lines = ['# Adytum Planning Brief', '', 'Zoth Studio v2 · Sovereign Architectural Plan', ''];
    keys.forEach((item) => {
      const saved = plan.entries[item.key];
      if (!saved) return;
      lines.push(`## Key ${item.key} — ${item.name}`);
      lines.push(saved.intention ? `Intention: ${saved.intention}` : 'Intention: (none)');
      lines.push(saved.reflection ? `Reflection: ${saved.reflection}` : 'Reflection: (none)');
      if (saved.reading) lines.push('', saved.reading);
      lines.push('');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'adytum-sovereign-plan.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header with gold radial glow */}
      <Box
        sx={{
          position: 'relative',
          mb: 4,
          borderRadius: 3,
          p: { xs: 2, md: 3 },
          background: dark
            ? 'radial-gradient(ellipse 70% 90% at 50% 0%, rgba(212,175,55,0.16) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 70% 90% at 50% 0%, rgba(212,175,55,0.10) 0%, transparent 70%)',
        }}
      >
        <Chip label="NULLAI • ARCHITECTURAL RITE" size="small" sx={{ bgcolor: goldBg, color: goldLight, fontWeight: 800, mb: 1.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
              Adytum Hermetic <span className="text-gradient-gold">Planning Rite</span>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 740, mt: 1, lineHeight: 1.6, fontSize: '1.05rem' }}>
              A 22-key ritualistic planning methodology for software architecture. Write your intention, observe a <span className="text-highlight-gold">5-minute incubation pause</span>, and submit a reflection to your local LLM. The gate unlocks when your reading returns <span className="text-highlight-dark">[GATE OPENED]</span>.
            </Typography>
          </Box>
          <Button variant="outlined" color="primary" onClick={exportBrief} sx={{ fontWeight: 750 }}>
            Export Markdown Plan
          </Button>
        </Box>
      </Box>

      {/* Feature Summary Grid — gold-tinted ritual cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: surface, border: `1px solid ${dark ? 'rgba(212,175,55,0.35)' : '#F0E1A8'}`, boxShadow: dark ? '0 0 24px -8px rgba(212,175,55,0.25)' : '0 0 20px -10px rgba(212,175,55,0.25)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TimerIcon sx={{ color: gold }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>5-Minute Incubation</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Enforces a strict 300-second quiet contemplation window before reflection submission is permitted.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: surface, border: `1px solid ${dark ? 'rgba(212,175,55,0.35)' : '#F0E1A8'}`, boxShadow: dark ? '0 0 24px -8px rgba(212,175,55,0.25)' : '0 0 20px -10px rgba(212,175,55,0.25)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AutoAwesomeIcon sx={{ color: gold }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Local Model Gatekeeper</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Your local Ollama model verifies that your reflection applies concrete mechanisms from the key's lesson.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: surface, border: `1px solid ${dark ? 'rgba(212,175,55,0.35)' : '#F0E1A8'}`, boxShadow: dark ? '0 0 24px -8px rgba(212,175,55,0.25)' : '0 0 20px -10px rgba(212,175,55,0.25)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LockOpenIcon sx={{ color: gold }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>22 Sequential Gates</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Progression unlocks sequentially from Key 0 (The Fool) through Key 21 (The World).
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Key Selectors */}
      <Box sx={{ mb: 4 }}>
        <Typography className="section-kicker">22 Arcana Key Selectors</Typography>
        <Stack direction="row" useFlexGap spacing={0.75} sx={{ flexWrap: 'wrap' }}>
          {keys.map((item) => {
            const saved = plan.entries[item.key];
            const open = item.key <= plan.current;
            return (
              <Chip
                key={item.key}
                label={`Key ${item.key}`}
                clickable={open}
                onClick={() => open && setPlan((prev) => ({ ...prev, current: item.key, startedAt: item.key === prev.current ? prev.startedAt : null }))}
                sx={{
                  fontFamily: mono,
                  fontWeight: 750,
                  bgcolor: item.key === plan.current ? gold : saved?.gate ? (dark ? 'rgba(52,211,153,0.16)' : '#ECFDF3') : (dark ? '#1A1A24' : '#F2F4F7'),
                  color: item.key === plan.current ? '#FFFFFF' : saved?.gate ? (dark ? '#34D399' : '#027A48') : textSecondary,
                  border: '1px solid',
                  borderColor: item.key === plan.current ? gold : saved?.gate ? (dark ? 'rgba(52,211,153,0.4)' : '#ABE5C6') : divider,
                  opacity: open ? 1 : 0.45,
                }}
              />
            );
          })}
        </Stack>
      </Box>

      {/* Main Workspace Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 2.5, border: `1px solid ${divider}`, borderRadius: 2, bgcolor: surface }}>
          <Box component="img" src={card.image} alt={card.name} sx={{ width: '100%', borderRadius: 1.5, display: 'block', mb: 2 }} />
          <Typography className="section-kicker">Arcana Key {card.key}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{card.name}</Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: textSecondary, fontWeight: 600 }}>{card.attribution}</Typography>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Paper sx={{ p: 3, border: `1px solid ${dark ? 'rgba(212,175,55,0.4)' : '#F0E1A8'}`, borderRadius: 2, bgcolor: goldBg, boxShadow: dark ? '0 0 24px -8px rgba(212,175,55,0.22)' : 'none' }}>
            <Typography variant="body1" sx={{ mb: 1.5, color: textPrimary, fontWeight: 500, lineHeight: 1.6 }}>{card.lesson}</Typography>
            <Typography variant="body2" sx={{ color: goldLight, fontWeight: 750 }}>{card.question}</Typography>
          </Paper>

          <TextField
            label="Intention Statement for this Key"
            multiline
            minRows={3}
            value={intention}
            onChange={(event) => setIntention(event.target.value)}
            placeholder="Define the precise architectural goal or engineering intention for this stage..."
          />

          <Paper sx={{ p: 2.5, border: `1px solid ${divider}`, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', bgcolor: surface }}>
            <Box>
              <Typography className="section-kicker">5-Minute Incubation Timer</Typography>
              <Typography sx={{ fontFamily: mono, fontSize: '2rem', fontWeight: 800, color: textPrimary }}>{clock}</Typography>
            </Box>
            <Button variant="contained" color="primary" onClick={beginIncubation} disabled={Boolean(plan.startedAt) && !incubated} sx={{ px: 3 }}>
              {plan.startedAt ? (incubated ? 'Incubation Complete' : 'Incubating Intention...') : 'Start 5-Minute Timer'}
            </Button>
          </Paper>

          <Box component="form" onSubmit={askModel} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Reflection & Synthesis"
              multiline
              minRows={4}
              value={reflection}
              disabled={!incubated}
              onChange={(event) => setReflection(event.target.value)}
              placeholder={incubated ? 'Synthesize how this key unlocks your intention...' : 'The reflection field unlocks when incubation reaches 00:00.'}
            />
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                select
                label="Local Ollama Model"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                SelectProps={{ native: true }}
                sx={{ minWidth: 260 }}
                disabled={!models.length}
              >
                {models.map((name) => <option key={name} value={name}>{name}</option>)}
              </TextField>
              <Button type="submit" variant="contained" color="primary" disabled={!incubated || busy || !reflection.trim() || !models.length} sx={{ px: 3 }}>
                {busy ? 'Evaluating Gate…' : 'Submit Reflection to Local Model'}
              </Button>
              <Button variant="outlined" color="primary" disabled={!entry.gate || plan.current === 21} onClick={advance} sx={{ fontWeight: 750 }}>
                {plan.current === 21 && entry.gate ? 'Rite Completed' : 'Proceed to Next Key →'}
              </Button>
            </Box>
          </Box>

          {!models.length && (
            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Ollama is offline or has no active local models on 127.0.0.1:11434. Start Ollama to evaluate gate readings.
            </Typography>
          )}
          {error && <Typography sx={{ color: theme.palette.error?.main || '#B42318', fontWeight: 700 }}>Error: {error}</Typography>}
          {reading && (
            <Box>
              <Typography className="section-kicker">Model Gatekeeper Reading</Typography>
              <Paper sx={{ p: 3, bgcolor: '#0F172A', color: '#F8FAFC', whiteSpace: 'pre-wrap', fontFamily: mono, fontSize: '0.85rem', lineHeight: 1.6, borderRadius: 2, border: '1px solid #1E293B' }}>
                {reading}
              </Paper>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}
