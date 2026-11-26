import React from 'react';
import LocalSystemDossier from '../components/LocalSystemDossier';

export default function VoiceStationPage() {
  return (
    <LocalSystemDossier
      tone="cyan"
      kicker="LOCAL-FIRST VOICE STATION // v2.6.0"
      badges={['LOCAL DAEMON :8114', 'KOKORO / PIPER / ESPEAK-NG', 'ZERO CLOUD DEFAULT']}
      title="Local-First Neural &"
      accentWord="Offline Voice Station."
      subtitle="Zero-dependency Python 3.9+ loopback voice workstation on 127.0.0.1:8114. Synthesizes replies strictly locally by default (Kokoro :9394 -> offline Piper / espeak-ng -> pure-Python PCM fallback), routes dialogue through local Ollama (:11434), persists 0600 call debriefs, and ships a 4-tool JSON-RPC 2.0 stdio MCP server."
      toolRoute="/tools/agent-voice-call"
      toolLabel="Open Agent Voice Call (:8114)"
      cloneCommand="git clone https://github.com/1nc0gn30/agent-voice-call.git && cd agent-voice-call"
      repoUrl="https://github.com/1nc0gn30/agent-voice-call"
      repoLabel="Get Agent Voice Call Repo"
      docsRoute="/docs"
      docsLabel="Studio Architecture Docs"
      overviewTitle="Zero-Egress Loopback Voice Architecture"
      overviewParagraphs={[
        'Agent Voice Call runs as a zero-dependency Python 3.9+ stdlib HTTP daemon bound to 127.0.0.1:8114 with strict loopback Host and Origin guards. Speech synthesis is strictly local-first by default: Tier 1 queries a local Kokoro ONNX daemon (:9394) when online, Tier 2 falls back to local offline Piper or espeak-ng with safe argument isolation, and Tier 3 synthesizes pure-Python 24 kHz PCM WAV audio. Cloud edge-tts is disabled unless you explicitly set ZOTH_ALLOW_CLOUD_TTS=1.',
        'The dual-theme browser cockpit accepts Web Speech API microphone input or text messages, plays returned base64 WAV audio via Web Audio API, routes open-ended prompts to local Ollama (:11434), and persists completed transcripts with 0600 permissions to ~/.local/share/zoth/voice_calls/debriefs.jsonl.',
      ]}
      pipelineSteps={[
        {
          label: 'Browser Cockpit Input (Web Speech API / Text)',
          detail: 'Dual-theme Editorial Ivory + Obsidian cockpit at 127.0.0.1:8114 captures spoken browser Web Speech API input or Enter-to-send text turns with echo-guarded playback.',
        },
        {
          label: 'Local Ollama (:11434) & Intent Dialogue',
          detail: 'POST /api/call/speak validates scoped session tokens and routes utterances through fast local intents or local Ollama models on 127.0.0.1:11434.',
        },
        {
          label: 'Local-First TTS Synthesis & 0600 Debrief Persistence',
          detail: 'Synthesizes 24 kHz PCM WAV locally (Kokoro :9394 -> offline Piper / espeak-ng -> pure-Python PCM) and persists completed call transcripts locally to debriefs.jsonl (0600).',
        },
      ]}
      specs={[
        { key: 'Loopback Daemon', value: '127.0.0.1:8114 (Python 3.9+ stdlib)' },
        { key: 'CLI & TUI Entrypoints', value: 'agent-voice-call · agent-voice-call-tui' },
        { key: 'Browser Input', value: 'Web Speech API + Text Cockpit (Echo-Guarded)' },
        { key: 'Local-First TTS', value: 'Kokoro (:9394) -> Piper / espeak-ng -> PCM WAV' },
        { key: 'Dialogue Reasoner', value: 'Local Ollama (:11434) + Deterministic Fallback' },
        { key: 'MCP Protocol', value: '4-Tool Stdio JSON-RPC 2.0 (agent-voice-call mcp)' },
      ]}
      quickstartLines={[
        '# Clone standalone Python 3.9+ voice call repository',
        'git clone https://github.com/1nc0gn30/agent-voice-call.git',
        'cd agent-voice-call',
        '',
        '# Start local loopback workstation on 127.0.0.1:8114 (zero external deps)',
        'python3 server.py --port 8114',
        '',
        '# Or run CLI status, live TUI, or 4-tool stdio MCP server',
        './bin/agent-voice-call status --json',
        './bin/agent-voice-call-tui --status',
        './bin/agent-voice-call mcp',
      ]}
      capabilitiesKicker="VOICE & MCP CAPABILITIES"
      capabilitiesTitle="Verified Local Voice Station Features"
      capabilities={[
        {
          tag: 'LOCAL-FIRST TTS',
          title: 'Zero Cloud Egress by Default',
          desc: 'Prioritizes local Kokoro (:9394), offline Piper/espeak-ng, and pure-Python PCM WAV synthesis. Cloud edge-tts is strictly opt-in via ZOTH_ALLOW_CLOUD_TTS=1.',
        },
        {
          tag: '6 VOICE PERSONAS',
          title: 'Multi-Persona Call Cockpit',
          desc: 'Switch live across Azoth, Ghostbyte, Athena, Mercury, Kitsune, and Chronos with per-turn WAV replay and frequency-reactive orb visualization.',
        },
        {
          tag: '0600 PERSISTENCE',
          title: 'Local Debrief Transcripts',
          desc: 'Completed sessions persist to ~/.local/share/zoth/voice_calls/debriefs.jsonl with 0600 permissions, exposed on GET /api/call/history and CLI history.',
        },
        {
          tag: 'STDIO MCP',
          title: '4 Real JSON-RPC 2.0 Tools',
          desc: 'Exposes agent_voice_call_status, agent_voice_call_voices, agent_voice_call_speak, and agent_voice_call_debriefs over stdio.',
        },
      ]}
      funnelToolTitle="Agent Voice Call Station"
      funnelToolTag="LOCAL VOICE DAEMON :8114"
      funnelToolDesc="Zero-dependency Python 3.9+ local-first voice calling station, persisted 0600 debriefs, and 4-tool stdio MCP server."
    />
  );
}
