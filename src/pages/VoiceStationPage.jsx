import React from 'react';
import LocalSystemDossier from '../components/LocalSystemDossier';

export default function VoiceStationPage() {
  return (
    <LocalSystemDossier
      tone="cyan"
      kicker="VOICE STATION DSP PIPELINE"
      badges={['LOCAL DAEMON :8114', 'WHISPER + KOKORO/PIPER', 'ZERO CLOUD AUDIO']}
      title="Low-Latency Local Neural"
      accentWord="Speech & Voice."
      subtitle="Real-time voice interaction with coding agents requires local hardware audio capture, VAD endpointing, and neural TTS synthesis—not simulated browser call timers. Clone the Agent Voice Call repository or boot ZothOS to run full-duplex local STT and TTS with zero cloud audio uploads."
      cloneCommand="git clone https://github.com/1nc0gn30/agent-voice-call.git && cd agent-voice-call"
      repoUrl="https://github.com/1nc0gn30/agent-voice-call"
      repoLabel="Get Agent Voice Call Repo"
      docsRoute="/docs"
      docsLabel="Studio Architecture Docs"
      overviewTitle="Full-Duplex Speech Over Loopback Sockets"
      overviewParagraphs={[
        'Streaming microphone audio to third-party cloud APIs introduces hundreds of milliseconds of network jitter and exposes private workspace conversations. Voice Station binds ALSA/PipeWire audio streams directly to local Whisper.cpp speech recognition and Kokoro/Piper neural speech synthesis.',
        'Transcribed utterances dispatch straight to your local Hermes, Ollama, or Pantheon Swarm session over loopback IPC, returning synthesized audio frames with barge-in interruption support.',
      ]}
      pipelineSteps={[
        {
          label: 'Hardware VAD & Frame Capture',
          detail: 'Silero VAD segments speech boundaries locally over PipeWire/PulseAudio with sub-30ms turn detection.',
        },
        {
          label: 'Local Whisper.cpp Transcription',
          detail: 'Quantized local acoustic models transcribe technical vocabulary and CLI commands offline.',
        },
        {
          label: 'Neural TTS & Barge-In Playback',
          detail: 'Kokoro and Piper ONNX voices stream PCM audio chunks back immediately while monitoring for user interruption.',
        },
      ]}
      specs={[
        { key: 'Loopback Daemon', value: '127.0.0.1:8114' },
        { key: 'CLI Entrypoint', value: 'agent-voice-call' },
        { key: 'STT Engine', value: 'Whisper.cpp / Faster-Whisper (Local)' },
        { key: 'TTS Engine', value: 'Kokoro-82M / Piper ONNX' },
        { key: 'Audio Stack', value: 'PipeWire / ALSA / WebRTC Loopback' },
        { key: 'Privacy Guarantee', value: 'Zero External Audio Transmission' },
      ]}
      quickstartLines={[
        '# Clone standalone local voice call repository',
        'git clone https://github.com/1nc0gn30/agent-voice-call.git',
        'cd agent-voice-call',
        '',
        '# Inspect local daemon & audio device flags',
        'npm install && node server.js --help',
      ]}
      capabilitiesKicker="AUDIO PIPELINE"
      capabilitiesTitle="Native Local Speech Capabilities"
      capabilities={[
        {
          tag: 'SPEECH-TO-TEXT',
          title: 'Offline Technical Transcription',
          desc: 'Runs quantized Whisper models locally to transcribe code symbols, terminal flags, and architectural prompts accurately.',
        },
        {
          tag: 'NEURAL TTS',
          title: 'Multi-Persona ONNX Voices',
          desc: 'Synthesizes crisp, natural acoustic output locally via Kokoro and Piper voice packs without per-character API billing.',
        },
        {
          tag: 'BARGE-IN VAD',
          title: 'Interruptible Turn-Taking',
          desc: 'Voice Activity Detection halts playback immediately when you speak, matching natural pair-programming cadence.',
        },
        {
          tag: 'AGENT BRIDGE',
          title: 'Direct CLI & MCP Dispatch',
          desc: 'Routes spoken intents into local Hermes Agent, Pantheon Swarm (:8141), or Neuro-Memory (:8094) sessions.',
        },
      ]}
      funnelToolTitle="Agent Voice Call Station"
      funnelToolTag="LOCAL SPEECH & DSP"
      funnelToolDesc="Full-duplex local Whisper STT and Kokoro/Piper neural TTS voice bridge for autonomous coding agents."
    />
  );
}
