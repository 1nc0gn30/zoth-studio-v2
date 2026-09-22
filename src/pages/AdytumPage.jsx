import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Container, Paper, Stack, TextField, Typography } from '@mui/material';
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
    if (remaining == null) return '5:00';
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
      setError('Write the intention for this key before the incubation clock starts.');
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
      setError('No local model is available.');
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
    const lines = ['# Adytum plan', '', 'Zoth Studio · NullAI', ''];
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
    link.download = 'adytum-plan.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Chip label="NULLAI · ADYTUM" size="small" sx={{ bgcolor: '#FEF9E7', color: '#8A6A09', fontWeight: 700, mb: 1.5 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end', mb: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>Adytum planner</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 680, mt: 1 }}>
            The 22-key architectural rite from the original studio. Each key keeps the intention you write, a five-minute incubation clock, and a reading from a local model. A gate opens only when that reading contains [GATE OPENED].
          </Typography>
        </Box>
        <Button variant="outlined" color="primary" onClick={exportBrief}>Export plan</Button>
      </Box>

      <Stack direction="row" useFlexGap spacing={0.75} sx={{ flexWrap: 'wrap', mb: 3 }}>
        {keys.map((item) => {
          const saved = plan.entries[item.key];
          const open = item.key <= plan.current;
          return (
            <Chip
              key={item.key}
              label={`${item.key}`}
              clickable={open}
              onClick={() => open && setPlan((prev) => ({ ...prev, current: item.key, startedAt: item.key === prev.current ? prev.startedAt : null }))}
              sx={{
                fontFamily: mono,
                fontWeight: 700,
                bgcolor: item.key === plan.current ? '#B8860B' : saved?.gate ? '#ECFDF3' : '#F2F4F7',
                color: item.key === plan.current ? '#FFFFFF' : '#344054',
                opacity: open ? 1 : 0.45,
              }}
            />
          );
        })}
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 2, border: '1px solid #EAECF0' }}>
          <Box component="img" src={card.image} alt={card.name} sx={{ width: '100%', borderRadius: 1, display: 'block', mb: 1.5 }} />
          <Typography variant="overline" sx={{ color: '#B8860B', fontWeight: 750 }}>Key {card.key}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{card.name}</Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#667085' }}>{card.attribution}</Typography>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper sx={{ p: 2.5, border: '1px solid #EAECF0' }}>
            <Typography variant="body1" sx={{ mb: 1.5 }}>{card.lesson}</Typography>
            <Typography variant="body2" sx={{ color: '#8A6A09', fontWeight: 650 }}>{card.question}</Typography>
          </Paper>

          <TextField
            label="Intention for this key"
            multiline
            minRows={3}
            value={intention}
            onChange={(event) => setIntention(event.target.value)}
          />

          <Paper sx={{ p: 2, border: '1px solid #EAECF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="overline" sx={{ color: '#B8860B' }}>Incubation</Typography>
              <Typography sx={{ fontFamily: mono, fontSize: '1.8rem', fontWeight: 700 }}>{clock}</Typography>
            </Box>
            <Button variant="contained" color="primary" onClick={beginIncubation} disabled={Boolean(plan.startedAt) && !incubated}>
              {plan.startedAt ? (incubated ? 'Incubation finished' : 'Clock running') : 'Start five minutes'}
            </Button>
          </Paper>

          <Box component="form" onSubmit={askModel} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              label="Reflection"
              multiline
              minRows={4}
              value={reflection}
              disabled={!incubated}
              onChange={(event) => setReflection(event.target.value)}
              placeholder={incubated ? 'Write what the key changes in the plan.' : 'The reflection opens when the clock reaches 00:00.'}
            />
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                select
                label="Local model"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                SelectProps={{ native: true }}
                sx={{ minWidth: 240 }}
                disabled={!models.length}
              >
                {models.map((name) => <option key={name} value={name}>{name}</option>)}
              </TextField>
              <Button type="submit" variant="contained" color="primary" disabled={!incubated || busy || !reflection.trim() || !models.length}>
                {busy ? 'Reading…' : 'Ask the local model'}
              </Button>
              <Button variant="outlined" color="primary" disabled={!entry.gate || plan.current === 21} onClick={advance}>
                {plan.current === 21 && entry.gate ? 'Rite complete' : 'Next key'}
              </Button>
            </Box>
          </Box>

          {!models.length && (
            <Typography color="text.secondary">Ollama has no local model on 127.0.0.1:11434, so the gate cannot be read.</Typography>
          )}
          {error && <Typography sx={{ color: '#B42318' }}>{error}</Typography>}
          {reading && (
            <Paper sx={{ p: 2.5, bgcolor: '#101828', color: '#F8F4E8', whiteSpace: 'pre-wrap', fontFamily: mono, fontSize: '0.85rem' }}>
              {reading}
            </Paper>
          )}
        </Box>
      </Box>
    </Container>
  );
}
