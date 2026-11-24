import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Slider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TerminalIcon from '@mui/icons-material/Terminal';
import HubIcon from '@mui/icons-material/Hub';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  useCopy,
  downloadText,
  MONO,
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_DARK = '#34D399';
const ACCENT_LIGHT = '#047857';
const GUIDE_PORT_DEFAULT = 8144;
const RELAY_MOBILE_PORT = 8766;
const BASE_WPM = 155;

const MOONDREAM_TIERS = [
  {
    id: 'moondream:1.8b-q4_K_M',
    label: 'Q4_K_M · Fast Edge',
    vramGb: '1.4 GB',
    estLatencyMs: 420,
    notes: 'Lowest thermal draw for continuous wearable capture on CPU/iGPU.',
  },
  {
    id: 'moondream:1.8b-q8_0',
    label: 'Q8_0 · Balanced OCR',
    vramGb: '2.1 GB',
    estLatencyMs: 680,
    notes: 'Sharper fine-print PCB silkscreen, terminal text, and badge reading.',
  },
  {
    id: 'moondream:1.8b-fp16',
    label: 'FP16 · High Precision',
    vramGb: '3.6 GB',
    estLatencyMs: 1120,
    notes: 'Maximum visual fidelity for workstation GPUs with thermal headroom.',
  },
];

const KOKORO_VOICES = [
  { id: 'af_heart', label: 'af_heart · Warm Neutral (US Female)', sampleRate: '24 kHz PCM16LE' },
  { id: 'af_bella', label: 'af_bella · Crisp Direct (US Female)', sampleRate: '24 kHz PCM16LE' },
  { id: 'am_michael', label: 'am_michael · Steady Technical (US Male)', sampleRate: '24 kHz PCM16LE' },
  { id: 'am_adam', label: 'am_adam · Low Cadence (US Male)', sampleRate: '24 kHz PCM16LE' },
  { id: 'bf_emma', label: 'bf_emma · Calm Concise (UK Female)', sampleRate: '24 kHz PCM16LE' },
  { id: 'bm_george', label: 'bm_george · Field Brief (UK Male)', sampleRate: '24 kHz PCM16LE' },
];

const MISSION_PRESETS = [
  {
    id: 'field-hardware-repair',
    name: 'Field Hardware Repair',
    badge: 'HARDWARE',
    frameIntervalSec: 3,
    moondreamTier: 'moondream:1.8b-q8_0',
    kokoroVoice: 'af_heart',
    speechSpeed: 1.1,
    systemPrompt:
      'You are Zela, a hands-free hardware repair coach streaming over Ray-Ban Meta glasses. Give one actionable step per utterance under 22 words. Verify power disconnection, polarity, and fastener order before instructing the next move.',
    cues: [
      {
        scene: 'Moondream: Open motherboard chassis, 24-pin ATX harness seated near corner capacitor.',
        spoken: 'Confirm PSU switch is off and discharge caps before pulling the 24-pin ATX latch.',
      },
      {
        scene: 'Moondream: Multimeter probes near voltage regulator U12 and ground pad.',
        spoken: 'Hold black probe on chassis ground and check pin three of U12 for 3.3 volts steady.',
      },
      {
        scene: 'Moondream: Re-seated ribbon cable slightly skewed on left retainer clip.',
        spoken: 'Pause. Left ribbon edge sits two millimeters high. Unlock the bail and seat flush.',
      },
    ],
  },
  {
    id: 'live-event-networking',
    name: 'Live Event Networking',
    badge: 'LIVE EVENT',
    frameIntervalSec: 5,
    moondreamTier: 'moondream:1.8b-q4_K_M',
    kokoroVoice: 'bf_emma',
    speechSpeed: 1.05,
    systemPrompt:
      'You are Zela, a discreet conference companion. Summarize visible booth banners, speaker slides, or schedule boards in under 18 words. Never narrate unprompted chatter while the wearer is speaking.',
    cues: [
      {
        scene: 'Moondream: Expo aisle sign reading "Edge AI & Local Inference — Hall B, Booth 412".',
        spoken: 'Booth 412 ahead covers local inference benchmarks. Ask about quantized latency on ARM.',
      },
      {
        scene: 'Moondream: Keynote slide showing 42ms p95 WebSocket audio chunking diagram.',
        spoken: 'Slide notes 42 millisecond p95 streaming audio. Matches our Kokoro 200ms chunk budget.',
      },
      {
        scene: 'Moondream: Printed hallway schedule showing Lightning Demos at 15:30.',
        spoken: 'Lightning demos start in twelve minutes at Stage Two on your left.',
      },
    ],
  },
  {
    id: 'codebase-walkthrough',
    name: 'Codebase Walkthrough',
    badge: 'DEVOPS',
    frameIntervalSec: 4,
    moondreamTier: 'moondream:1.8b-q8_0',
    kokoroVoice: 'am_michael',
    speechSpeed: 1.15,
    systemPrompt:
      'You are Zela, a live architecture pair reviewer observing a workstation display. Call out file paths, failing assertions, or risky shell flags in concise technical cues under 24 words.',
    cues: [
      {
        scene: 'Moondream: Terminal showing pytest failure in test_sandbox.py line 48 AssertionError.',
        spoken: 'Test sandbox line forty-eight failed symlink escape check. Verify Path.resolve runs before prefix match.',
      },
      {
        scene: 'Moondream: Editor open on netlify.toml missing SPA catch-all redirect rule.',
        spoken: 'Add the star to index dot html 200 redirect in netlify.toml so deep links never 404.',
      },
      {
        scene: 'Moondream: Git diff highlighting build output synced to /opt/zoth-studio/dist.',
        spoken: 'Diff is clean. Run route smoke checks before committing.',
      },
    ],
  },
  {
    id: 'security-physical-audit',
    name: 'Security Physical Audit',
    badge: 'SECURITY',
    frameIntervalSec: 2,
    moondreamTier: 'moondream:1.8b-q8_0',
    kokoroVoice: 'am_adam',
    speechSpeed: 1.1,
    systemPrompt:
      'You are Zela, a physical security & server rack inspection assistant. Flag unlocked enclosures, unlabelled patch cables, exposed serial consoles, or thermal hazards concisely in under 20 words.',
    cues: [
      {
        scene: 'Moondream: 42U rack cabinet door ajar with amber fault LED blinking on top switch.',
        spoken: 'Top switch port seven shows amber fault and rack latch is unsecured. Log asset tag.',
      },
      {
        scene: 'Moondream: Unlabelled blue Cat6 jumper spanning management VLAN port to floor drop.',
        spoken: 'Trace unlabelled blue jumper on management switch before closing audit section two.',
      },
      {
        scene: 'Moondream: Badge reader LED green with door prop wedge visible on lower hinge.',
        spoken: 'Door wedge detected on server room entry. Remove prop and verify magnetic lock engages.',
      },
    ],
  },
];

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

function formatOffset(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `+${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ZelaGlassesGuideGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;
  const { copied, copy } = useCopy();

  // Optional localhost-only daemon health check (zero remote calls)
  const [daemonState, setDaemonState] = useState('browser_only');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(-1);
  const sequenceRef = useRef(false);

  // 1. Wearable Mission Profile Composer state
  const [presetId, setPresetId] = useState(MISSION_PRESETS[0].id);
  const [systemPrompt, setSystemPrompt] = useState(MISSION_PRESETS[0].systemPrompt);
  const [frameIntervalSec, setFrameIntervalSec] = useState(MISSION_PRESETS[0].frameIntervalSec);
  const [moondreamTier, setMoondreamTier] = useState(MISSION_PRESETS[0].moondreamTier);
  const [kokoroVoice, setKokoroVoice] = useState(MISSION_PRESETS[0].kokoroVoice);
  const [speechSpeed, setSpeechSpeed] = useState(MISSION_PRESETS[0].speechSpeed);

  // 2. Audio Cue & HUD Prompt Simulator state
  const [cues, setCues] = useState(MISSION_PRESETS[0].cues);
  const [newScene, setNewScene] = useState('');
  const [newSpoken, setNewSpoken] = useState('');

  // 3. Tailscale / zoth-relay-mobile Connection Kit state
  const [tailscaleHost, setTailscaleHost] = useState('zoth-workstation.tailnet.ts.net');
  const [guidePort, setGuidePort] = useState(GUIDE_PORT_DEFAULT);
  const [kitTab, setKitTab] = useState('mission_json'); // 'mission_json' | 'relay_yaml' | 'cli'

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const hasSpeech =
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance !== 'undefined' &&
      typeof window.speechSynthesis?.speak === 'function';
    setSpeechSupported(hasSpeech);

    const host = window.location.hostname;
    if (host !== '127.0.0.1' && host !== 'localhost') {
      setDaemonState('browser_only');
      return () => {
        if (hasSpeech) {
          try {
            window.speechSynthesis.cancel();
          } catch {
            // ignore headless cancellation error
          }
        }
      };
    }

    const ctrl = new AbortController();
    fetch(`http://127.0.0.1:${GUIDE_PORT_DEFAULT}/health`, { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('not ok'))))
      .then((data) => setDaemonState(data && data.ok ? 'online' : 'offline'))
      .catch(() => {
        if (!ctrl.signal.aborted) setDaemonState('offline');
      });

    return () => {
      ctrl.abort();
      if (hasSpeech) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const stopSpeech = () => {
    sequenceRef.current = false;
    setSpeakingIndex(-1);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  };

  const handleSelectPreset = (nextPresetId) => {
    const preset = MISSION_PRESETS.find((p) => p.id === nextPresetId);
    if (!preset) return;
    stopSpeech();
    setPresetId(preset.id);
    setSystemPrompt(preset.systemPrompt);
    setFrameIntervalSec(preset.frameIntervalSec);
    setMoondreamTier(preset.moondreamTier);
    setKokoroVoice(preset.kokoroVoice);
    setSpeechSpeed(preset.speechSpeed);
    setCues(preset.cues);
  };

  const speakCueAt = (index, continueSequence = false) => {
    if (!speechSupported || typeof window === 'undefined') return;
    const cue = cues[index];
    if (!cue) {
      sequenceRef.current = false;
      setSpeakingIndex(-1);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new window.SpeechSynthesisUtterance(cue.spoken);
      utter.rate = speechSpeed;
      utter.pitch = kokoroVoice.startsWith('am_') || kokoroVoice.startsWith('bm_') ? 0.92 : 1.04;
      utter.onstart = () => setSpeakingIndex(index);
      utter.onend = () => {
        if (continueSequence && sequenceRef.current && index + 1 < cues.length) {
          speakCueAt(index + 1, true);
        } else {
          sequenceRef.current = false;
          setSpeakingIndex(-1);
        }
      };
      utter.onerror = () => {
        sequenceRef.current = false;
        setSpeakingIndex(-1);
      };
      sequenceRef.current = continueSequence;
      setSpeakingIndex(index);
      window.speechSynthesis.speak(utter);
    } catch {
      sequenceRef.current = false;
      setSpeakingIndex(-1);
    }
  };

  const handleAddCue = () => {
    const spokenClean = newSpoken.trim();
    if (!spokenClean) return;
    const sceneClean = newScene.trim() || 'Moondream: Live wearable camera frame captured.';
    setCues((prev) => [...prev, { scene: sceneClean, spoken: spokenClean }]);
    setNewScene('');
    setNewSpoken('');
  };

  const effectiveWpm = Math.round(BASE_WPM * speechSpeed);
  const selectedTier = useMemo(
    () => MOONDREAM_TIERS.find((t) => t.id === moondreamTier) || MOONDREAM_TIERS[0],
    [moondreamTier],
  );
  const activePreset = useMemo(
    () => MISSION_PRESETS.find((p) => p.id === presetId) || MISSION_PRESETS[0],
    [presetId],
  );

  // Deterministic timeline metrics per cue
  const cueTimeline = useMemo(() => {
    let cursorSec = 0;
    return cues.map((cue, idx) => {
      const words = countWords(cue.spoken);
      const durationSec = words === 0 ? 0 : Number(((words / effectiveWpm) * 60).toFixed(1));
      const startSec = cursorSec;
      cursorSec += Math.max(frameIntervalSec, Math.ceil(durationSec + 1));
      return {
        ...cue,
        idx,
        words,
        chars: cue.spoken.length,
        durationSec,
        offsetLabel: formatOffset(startSec),
        exceedsBudget: words > 45,
      };
    });
  }, [cues, effectiveWpm, frameIntervalSec]);

  const totalWords = cueTimeline.reduce((acc, c) => acc + c.words, 0);
  const totalAudioSec = Number(cueTimeline.reduce((acc, c) => acc + c.durationSec, 0).toFixed(1));
  const framesPerMin = Number((60 / frameIntervalSec).toFixed(1));

  const cleanHost = (tailscaleHost || 'zoth-workstation.tailnet.ts.net')
    .trim()
    .replace(/^wss?:\/\//i, '')
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '');
  const cleanPort = Math.max(1024, Math.min(65535, Number(guidePort) || GUIDE_PORT_DEFAULT));
  const wsGuideUrl = `wss://${cleanHost}:${cleanPort}/ws/guide`;
  const wsRelayStreamUrl = `ws://${cleanHost}:${RELAY_MOBILE_PORT}/v1/guide/stream`;

  const missionJson = useMemo(
    () =>
      JSON.stringify(
        {
          schema: 'zela-glasses-guide/mission/v1',
          version: '0.5.0',
          preset: activePreset.id,
          title: activePreset.name,
          connection: {
            tailscale_host: cleanHost,
            guide_port: cleanPort,
            websocket_url: wsGuideUrl,
            mobile_relay_port: RELAY_MOBILE_PORT,
            mobile_relay_stream_url: wsRelayStreamUrl,
          },
          vision: {
            provider: 'ollama',
            base_url: 'http://127.0.0.1:11434',
            model: moondreamTier,
            frame_interval_sec: frameIntervalSec,
            frames_per_minute: framesPerMin,
            keep_alive: '10m',
            thermal_ceiling_c: 88,
          },
          tts: {
            engine: 'kokoro-v1.0-onnx',
            voice: kokoroVoice,
            speed: speechSpeed,
            effective_wpm: effectiveWpm,
            sample_rate_hz: 24000,
            chunk_ms: 200,
            barge_in_cancel: true,
          },
          system_prompt: systemPrompt,
          cue_script: cueTimeline.map((c) => ({
            offset: c.offsetLabel,
            scene_caption: c.scene,
            spoken_cue: c.spoken,
            words: c.words,
            est_audio_sec: c.durationSec,
          })),
        },
        null,
        2,
      ),
    [
      activePreset.id,
      activePreset.name,
      cleanHost,
      cleanPort,
      wsGuideUrl,
      wsRelayStreamUrl,
      moondreamTier,
      frameIntervalSec,
      framesPerMin,
      kokoroVoice,
      speechSpeed,
      effectiveWpm,
      systemPrompt,
      cueTimeline,
    ],
  );

  const relayYaml = useMemo(
    () =>
      [
        '# ~/.config/zoth-relay/mobile/config.yaml (Zela Glasses Guide v0.5.0)',
        'hosts:',
        '  - 127.0.0.1',
        `  - ${cleanHost}`,
        `port: ${RELAY_MOBILE_PORT}`,
        'agents_file: ~/.config/zoth-relay/mobile/agents.yaml',
        'audit_log: ~/.local/state/zoth-relay-mobile/audit.log',
        'guide:',
        '  max_tokens: 80',
        '  transcript_len: 12',
        '  local_vision:',
        '    base_url: http://127.0.0.1:11434',
        `    model: ${moondreamTier}`,
        '    num_thread: 4',
        '    keep_alive: 10m',
        '    hot_c: 88',
        '  stream:',
        `    batch_interval: ${frameIntervalSec.toFixed(1)}`,
        `    caption_interval: ${Math.max(1.0, frameIntervalSec / 2).toFixed(1)}`,
        '    roll_turns: 14',
        '    chunk_ms: 200',
        '  tts:',
        '    engine: kokoro',
        '    model: ~/.local/share/zoth-tts/kokoro-v1.0.onnx',
        `    voice: ${kokoroVoice}`,
        `    speed: ${speechSpeed}`,
      ].join('\n'),
    [cleanHost, moondreamTier, frameIntervalSec, kokoroVoice, speechSpeed],
  );

  const cliCommands = useMemo(
    () =>
      [
        '# 1. Launch Zela Glasses Guide local workstation on ZothOS',
        `cd ~/NullAITech/zela-glasses-guide && python3 server.py --port ${cleanPort} --tailscale-ip ${cleanHost}`,
        '',
        '# 2. Inspect daemon health, presets, and relay status via ZothOS CLI',
        'zela-glasses-guide --status',
        'zela-glasses-guide --presets --json',
        `zela-glasses-guide --config --tailscale-ip ${cleanHost}`,
        '',
        '# 3. Pull selected Moondream quantization locally in Ollama',
        `ollama pull ${moondreamTier}`,
      ].join('\n'),
    [cleanPort, cleanHost, moondreamTier],
  );

  const activeKitSnippet = useMemo(() => {
    if (kitTab === 'relay_yaml') {
      return { title: 'config.yaml', badge: 'ZOTH-RELAY-MOBILE YAML', code: relayYaml };
    }
    if (kitTab === 'cli') {
      return { title: 'zela-launch.sh', badge: 'ZELA CLI & SERVER', code: cliCommands };
    }
    return { title: 'zela-mission.json', badge: 'MISSION PROFILE JSON', code: missionJson };
  }, [kitTab, missionJson, relayYaml, cliCommands]);

  const kpis = [
    {
      label: 'Vision Cadence',
      value: `${frameIntervalSec}s`,
      unit: `${framesPerMin} frames/min`,
      accent: ACCENT_DARK,
    },
    {
      label: 'Moondream Tier',
      value: selectedTier.vramGb,
      unit: `~${selectedTier.estLatencyMs}ms caption`,
      accent: SOV.cyber,
    },
    {
      label: 'Kokoro Voice',
      value: kokoroVoice,
      unit: `${speechSpeed.toFixed(2)}x · ${effectiveWpm} wpm`,
      accent: SOV.gold,
    },
    {
      label: 'Cue Script',
      value: `${totalWords}w`,
      unit: `${cues.length} cues · ~${totalAudioSec}s audio`,
      accent: SOV.emerald,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={daemonState === 'online' ? 'online' : 'standby'}
        label={
          daemonState === 'online'
            ? `LOCALHOST :${GUIDE_PORT_DEFAULT} WORKSTATION LIVE`
            : speechSupported
              ? 'WEB SPEECH SYNTHESIS READY · CLIENT MISSION DECK'
              : 'CLIENT MISSION DECK · AUDIO PREVIEW TIMED'
        }
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: copied === 'ws_url' ? 'Copied WebSocket URL' : 'Copy WebSocket URL',
      icon: copied === 'ws_url' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(wsGuideUrl, 'ws_url'),
      primary: true,
    },
    {
      label: 'Download zela-mission.json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadText(missionJson, 'zela-mission.json', 'application/json;charset=utf-8'),
    },
    {
      label: copied === 'cli' ? 'Copied CLI Commands' : 'Copy Launch CLI',
      icon: copied === 'cli' ? <CheckIcon fontSize="small" /> : <TerminalIcon fontSize="small" />,
      onClick: () => copy(cliCommands, 'cli'),
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignAlertBanner
        severity={daemonState === 'online' ? 'success' : 'info'}
        title="Runtime Scope Disclosure"
        message={
          daemonState === 'online'
            ? 'Detected local zela-glasses-guide daemon on 127.0.0.1:8144. Mission profile composition, spoken cue timing, and browser Web Speech preview run client-side; live Ray-Ban Meta video streams route through zoth-relay-mobile (:8766) + Ollama Moondream + Kokoro ONNX.'
            : 'Mission profile editing, WPM audio duration math, Tailscale config generation, and optional Web Speech API cue playback run 100% in-browser with zero external calls. Start python3 server.py --port 8144 on your ZothOS host for live glasses streaming.'
        }
      />

      <SovereignCard
        index="01"
        eyebrow="WEARABLE MISSION PROFILE COMPOSER"
        title="Preset, Vision Cadence & Kokoro Voice"
        subtitle="Configure Ray-Ban Meta coaching persona, Ollama Moondream quantization, and Kokoro v1.0 TTS output"
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {MISSION_PRESETS.map((preset) => {
            const active = preset.id === presetId;
            return (
              <Chip
                key={preset.id}
                label={preset.name}
                clickable
                onClick={() => handleSelectPreset(preset.id)}
                sx={{
                  minHeight: 38,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, isDark ? 0.2 : 0.12) : 'transparent',
                  color: active ? accent : 'text.secondary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.32)'}`,
                }}
              />
            );
          })}
        </Box>

        <TextField
          label="Coaching System Prompt"
          multiline
          minRows={3}
          maxRows={6}
          fullWidth
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          sx={{
            mb: 2,
            '& textarea': { fontFamily: MONO, fontSize: '0.76rem', lineHeight: 1.5 },
          }}
        />

        {/* Frame Interval Slider (1-15s) */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', fontWeight: 700 }}>
              Vision Frame Interval: {frameIntervalSec}s ({framesPerMin} frames/min)
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: 'text.secondary' }}>
              Thermal ceiling: 88°C
            </Typography>
          </Box>
          <Slider
            value={frameIntervalSec}
            min={1}
            max={15}
            step={1}
            marks={[
              { value: 1, label: '1s' },
              { value: 5, label: '5s' },
              { value: 10, label: '10s' },
              { value: 15, label: '15s' },
            ]}
            onChange={(_, v) => setFrameIntervalSec(Number(v))}
            sx={{ color: accent }}
          />
        </Box>

        {/* Moondream Quantization Tier */}
        <FormControl size="small" fullWidth sx={{ mb: 1.25 }}>
          <InputLabel id="moondream-tier-lbl">Moondream Quantization Tier (Ollama)</InputLabel>
          <Select
            labelId="moondream-tier-lbl"
            label="Moondream Quantization Tier (Ollama)"
            value={moondreamTier}
            onChange={(e) => setMoondreamTier(e.target.value)}
            sx={{ fontFamily: MONO, fontSize: '0.77rem' }}
          >
            {MOONDREAM_TIERS.map((tier) => (
              <MenuItem key={tier.id} value={tier.id} sx={{ fontFamily: MONO, fontSize: '0.76rem' }}>
                {tier.label} — {tier.id} ({tier.vramGb})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontFamily: MONO, mb: 2 }}>
          {selectedTier.notes} Est. caption latency: ~{selectedTier.estLatencyMs}ms.
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        {/* Kokoro TTS Voice & Speed */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel id="kokoro-voice-lbl">Kokoro v1.0 ONNX TTS Voice</InputLabel>
          <Select
            labelId="kokoro-voice-lbl"
            label="Kokoro v1.0 ONNX TTS Voice"
            value={kokoroVoice}
            onChange={(e) => setKokoroVoice(e.target.value)}
            sx={{ fontFamily: MONO, fontSize: '0.77rem' }}
          >
            {KOKORO_VOICES.map((voice) => (
              <MenuItem key={voice.id} value={voice.id} sx={{ fontFamily: MONO, fontSize: '0.76rem' }}>
                {voice.label} ({voice.sampleRate})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', fontWeight: 700 }}>
              TTS Speech Speed: {speechSpeed.toFixed(2)}x
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: accent }}>
              Effective Rate: {effectiveWpm} WPM
            </Typography>
          </Box>
          <Slider
            value={speechSpeed}
            min={0.8}
            max={1.5}
            step={0.05}
            marks={[
              { value: 0.8, label: '0.8x' },
              { value: 1.0, label: '1.0x' },
              { value: 1.25, label: '1.25x' },
              { value: 1.5, label: '1.5x' },
            ]}
            onChange={(_, v) => setSpeechSpeed(Number(v))}
            sx={{ color: accent }}
          />
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="TAILSCALE & ZOTH-RELAY-MOBILE CONNECTION KIT"
        title="Mesh Endpoint & Transport Config"
        subtitle="Configure your Tailscale MagicDNS hostname to generate WebSocket URLs and deployable manifests"
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.5 }}>
          <TextField
            size="small"
            label="Tailscale MagicDNS Hostname / IP"
            value={tailscaleHost}
            onChange={(e) => setTailscaleHost(e.target.value)}
            sx={{ flex: '1 1 220px', '& input': { fontFamily: MONO, fontSize: '0.77rem' } }}
          />
          <TextField
            size="small"
            type="number"
            label="Guide Port"
            inputProps={{ min: 1024, max: 65535 }}
            value={guidePort}
            onChange={(e) => setGuidePort(Number(e.target.value) || GUIDE_PORT_DEFAULT)}
            sx={{ width: 120, '& input': { fontFamily: MONO, fontSize: '0.77rem' } }}
          />
        </Box>

        <Box
          sx={{
            p: 1.25,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(52,211,153,0.08)' : 'rgba(4,120,87,0.06)',
            border: `1px solid ${rgba(accent, 0.35)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <HubIcon fontSize="small" sx={{ color: accent }} />
              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: accent }}>
                WEARABLE GUIDE WEBSOCKET URL
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => copy(wsGuideUrl, 'ws_inline')}
              startIcon={copied === 'ws_inline' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              sx={{ fontFamily: MONO, fontSize: '0.68rem', textTransform: 'none', minHeight: 30, color: accent }}
            >
              {copied === 'ws_inline' ? 'Copied' : 'Copy'}
            </Button>
          </Box>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, wordBreak: 'break-all' }}>
            {wsGuideUrl}
          </Typography>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: 'text.secondary', wordBreak: 'break-all' }}>
            zoth-relay-mobile stream: {wsRelayStreamUrl}
          </Typography>
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="AUDIO CUE & HUD PROMPT SIMULATOR"
        title="Optical HUD Transcript & Web Speech Playback"
        subtitle="Preview exact spoken coaching cues, word counts, and estimated earpiece duration with browser speech synthesis"
        accent={ACCENT_DARK}
      >
        {/* Simulated Smart-Glasses Optical HUD Frame */}
        <Box
          sx={{
            p: 1.75,
            mb: 1.75,
            borderRadius: 2,
            bgcolor: isDark ? '#05080D' : '#101828',
            color: '#F5F1E6',
            border: `1px solid ${rgba(ACCENT_DARK, 0.45)}`,
            position: 'relative',
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85 }}>
              <VisibilityIcon fontSize="small" sx={{ color: ACCENT_DARK }} />
              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: ACCENT_DARK, letterSpacing: '0.08em' }}>
                OPTICAL HUD · {activePreset.badge} · {frameIntervalSec}S CADENCE
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.67rem', color: '#94A3B8' }}>
              {kokoroVoice} @ {effectiveWpm} WPM
            </Typography>
          </Box>

          <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: '#94A3B8', mb: 0.6 }}>
            {speakingIndex >= 0 && cueTimeline[speakingIndex]
              ? cueTimeline[speakingIndex].scene
              : cueTimeline[0]?.scene || 'Awaiting vision frame...'}
          </Typography>
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#F8FAFC',
              lineHeight: 1.45,
              borderLeft: `3px solid ${ACCENT_DARK}`,
              pl: 1.25,
            }}
          >
            “
            {speakingIndex >= 0 && cueTimeline[speakingIndex]
              ? cueTimeline[speakingIndex].spoken
              : cueTimeline[0]?.spoken || 'Add a coaching cue below.'}
            ”
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mt: 1.5 }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<PlayArrowIcon />}
              disabled={!speechSupported || cues.length === 0}
              onClick={() => speakCueAt(0, true)}
              sx={{
                minHeight: 36,
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: ACCENT_DARK,
                color: '#05080D',
                '&:hover': { bgcolor: '#10B981' },
                '&.Mui-disabled': { bgcolor: 'rgba(148,163,184,0.22)', color: '#94A3B8' },
              }}
            >
              Play All Cues
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<StopCircleIcon />}
              disabled={speakingIndex < 0}
              onClick={stopSpeech}
              sx={{
                minHeight: 36,
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'none',
                borderColor: rgba(SOV.crimson, 0.7),
                color: SOV.crimson,
              }}
            >
              Barge-In Stop
            </Button>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: '#94A3B8' }}>
              {speechSupported
                ? speakingIndex >= 0
                  ? `Speaking cue #${speakingIndex + 1} of ${cues.length}...`
                  : 'Browser Web Speech API ready'
                : 'Web Speech unavailable in this browser (timing metrics still live)'}
            </Typography>
          </Box>
        </Box>

        {/* Timed Cue Transcript List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.75 }}>
          {cueTimeline.map((cue) => {
            const isSpeaking = speakingIndex === cue.idx;
            const rowCol = isSpeaking
              ? accent
              : cue.exceedsBudget
                ? resolveModeAccent(SOV.amber, isDark)
                : accent;
            return (
              <Box
                key={`${cue.idx}-${cue.offsetLabel}`}
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  borderLeft: `3px solid ${rowCol}`,
                  bgcolor: isSpeaking
                    ? rgba(accent, isDark ? 0.14 : 0.1)
                    : isDark
                      ? 'rgba(255,255,255,0.025)'
                      : 'rgba(16,24,40,0.025)',
                  border: `1px solid ${isSpeaking ? rgba(accent, 0.5) : 'rgba(148,163,184,0.18)'}`,
                }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={cue.offsetLabel}
                      sx={{ fontFamily: MONO, fontSize: '0.67rem', fontWeight: 800, height: 22, color: accent, bgcolor: rgba(accent, 0.12) }}
                    />
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: 'text.secondary' }}>
                      {cue.words} words · ~{cue.durationSec}s @ {effectiveWpm} wpm
                    </Typography>
                    {cue.exceedsBudget && (
                      <Chip
                        size="small"
                        label="LONG CUE (>45w)"
                        sx={{
                          fontFamily: MONO,
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          height: 20,
                          color: resolveModeAccent(SOV.amber, isDark),
                          bgcolor: rgba(SOV.amber, 0.14),
                        }}
                      />
                    )}
                  </Box>
                  <Button
                    size="small"
                    startIcon={<VolumeUpIcon fontSize="small" />}
                    disabled={!speechSupported}
                    onClick={() => speakCueAt(cue.idx, false)}
                    sx={{ fontFamily: MONO, fontSize: '0.68rem', textTransform: 'none', minHeight: 28, color: accent }}
                  >
                    Speak
                  </Button>
                </Box>

                <Typography sx={{ fontFamily: MONO, fontSize: '0.69rem', color: 'text.secondary', mb: 0.35 }}>
                  {cue.scene}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, lineHeight: 1.45 }}>
                  {cue.spoken}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Append custom cue */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextField
            size="small"
            label="Custom Vision Caption (Optional)"
            placeholder="Moondream: Oscilloscope probe connected to SPI clock pin..."
            value={newScene}
            onChange={(e) => setNewScene(e.target.value)}
            sx={{ '& input': { fontFamily: MONO, fontSize: '0.76rem' } }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              label="Spoken Coaching Cue"
              placeholder="Check SPI clock frequency; expected 4 megahertz square wave."
              value={newSpoken}
              onChange={(e) => setNewSpoken(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCue();
              }}
              sx={{ flex: '1 1 240px', '& input': { fontFamily: MONO, fontSize: '0.76rem' } }}
            />
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              disabled={!newSpoken.trim()}
              onClick={handleAddCue}
              sx={{
                minHeight: 40,
                fontFamily: MONO,
                fontSize: '0.73rem',
                fontWeight: 700,
                textTransform: 'none',
                borderColor: rgba(accent, 0.5),
                color: accent,
              }}
            >
              Add Cue
            </Button>
          </Box>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="EXPORTABLE MISSION BUNDLE & CLI"
        title="zela-mission.json, Relay YAML & Launch Commands"
        subtitle="Drop into ~/NullAITech/zela-glasses-guide or ~/.config/zoth-relay/mobile/config.yaml"
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {[
            { id: 'mission_json', label: 'zela-mission.json' },
            { id: 'relay_yaml', label: 'relay-mobile config.yaml' },
            { id: 'cli', label: 'Server & CLI Commands' },
          ].map((tab) => {
            const active = kitTab === tab.id;
            return (
              <Chip
                key={tab.id}
                label={tab.label}
                clickable
                onClick={() => setKitTab(tab.id)}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                  color: active ? accent : 'text.secondary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.32)'}`,
                }}
              />
            );
          })}
        </Box>

        <SovereignCodeBlock
          title={activeKitSnippet.title}
          badge={activeKitSnippet.badge}
          code={activeKitSnippet.code}
          filename={activeKitSnippet.title}
          accent={ACCENT_DARK}
          maxHeight={300}
        />
      </SovereignCard>
    </Box>
  );

  return (
    <SovereignWorkstationShell
      id="zela-glasses-guide"
      category="SWARM & CORE · WEARABLE AI MISSION COACH"
      title="Zela Glasses Guide Mission Studio"
      subtitle="Wearable mission profile composer for Ray-Ban Meta smart glasses, timed optical HUD & Web Speech audio cue simulator, and Tailscale / zoth-relay-mobile deployment kit on port 8144."
      version="0.5.0"
      variant="waveform-harmonics"
      accent={ACCENT_DARK}
      metrics={kpis}
      status={statusNode}
      actions={actions}
      leftPane={leftPane}
      rightPane={rightPane}
      leftCols={5}
      rightCols={7}
    />
  );
}
