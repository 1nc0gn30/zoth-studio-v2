import React from 'react';
import TechnicalReferencePage from '../components/TechnicalReferencePage';

export default function ZothOSPage() {
  return (
    <TechnicalReferencePage
      tone="gold"
      parentRoute="/zoth-os"
      parentLabel="ZothOS Overview"
      kicker="ZOTHOS v3.4.0 & ZOTHOS-LITE v1.2 // ISO & CLI MANUAL"
      title="ZothOS Live-Build & Host Administration Reference"
      summary="Technical manual for building ZothOS v3.4.0 (Debian 13 + KDE Plasma 6) or ZothOS-Lite v1.2 (Amnesic Monotone Edition) from source, managing loopback AI daemons, and operating zoth-heal, zoth-vault, and zoth ghost."
      repoUrl="https://github.com/NullAITech/zoth-os"
      repoLabel="Clone ZothOS Repository"
      cloneCommand="git clone https://github.com/NullAITech/zoth-os.git && cd zoth-os"
      installSteps={[
        '# 1. Clone ZothOS v3.4.0 live-build repository',
        'git clone https://github.com/NullAITech/zoth-os.git',
        'cd zoth-os',
        '',
        '# 2. Inspect chroot hooks, desktop folders, and tool wrappers',
        'ls -la config/includes.chroot/usr/local/bin/',
        '',
        '# 3. Optional: Clone ZothOS-Lite v1.2 (Amnesic RAM-Only Edition)',
        'git clone https://github.com/1nc0gn30/zothos-lite.git',
      ]}
      cliCommands={[
        { cmd: 'zoth status --json', desc: 'Report loopback daemon health (:3000 Studio, :8094 Neuro-Memory, :8141 Swarm, :11434 Ollama).' },
        { cmd: 'zoth-heal --check', desc: 'Run non-destructive diagnostics across network, UFW firewall, audio, display, and package state.' },
        { cmd: 'zoth-vault init', desc: 'Initialize local Argon2id + AES-256 encrypted credential store with zero cloud sync.' },
        { cmd: 'zoth ghost enable', desc: 'Route outbound host traffic through Tor and enforce ephemeral session hygiene.' },
      ]}
      contractTitle="Default Host Security & Port Posture"
      contractLanguage="json"
      contractCode={JSON.stringify(
        {
          osRelease: 'ZothOS 3.4.0 (Debian 13 Trixie / KDE Plasma 6)',
          liteEdition: 'ZothOS-Lite 1.2 (Amnesic toram Live ISO)',
          ufwPolicy: 'default deny incoming / allow lo & tailscale0',
          loopbackServices: {
            studio: '127.0.0.1:3000',
            neuroMemory: '127.0.0.1:8094',
            pantheonSwarm: '127.0.0.1:8141',
            ollama: '127.0.0.1:11434',
          },
          mcpCatalog: '163 servers indexed (0 enabled by default)',
        },
        null,
        2
      )}
      architectureNotes={[
        {
          heading: 'Deterministic 4-Folder Plasma Desktop',
          body: 'Ships organized into 01-AI-Agents-and-Dev, 02-Security-and-Privacy, 03-ZothOS-Daemons, and 04-Media-and-Utilities with SWCursor hardware/VM cursor visibility.',
        },
        {
          heading: 'All 77 Arsenal Tools Pre-Installed',
          body: 'Every CLI binary and loopback daemon cataloged on zoth.nullai.tech is pre-wired in /usr/local/bin on ZothOS.',
        },
        {
          heading: 'Dedicated OS Portals',
          body: 'Visit https://zothos.nullai.tech for full workstation ISO documentation and https://zothos-lite.nullai.tech for the amnesic monotone edition.',
        },
      ]}
    />
  );
}
