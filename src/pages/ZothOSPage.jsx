import React, { useState } from 'react';
import { Box, Container, Typography, Chip, Paper, Button } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useStudioStatus } from '../studio/useStudioStatus';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const qemu = 'qemu-system-x86_64 -enable-kvm -m 8192 -smp 4 -hda zoth-agent-os.qcow2';

export default function ZothOSPage() {
  const { status } = useStudioStatus();
  const [copied, setCopied] = useState(false);
  const models = status?.services?.ollama?.models || [];

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Chip label="HOST FACTS ONLY" size="small" sx={{ bgcolor: '#FEF9E7', color: '#8A6A09', fontWeight: 700, mb: 1.5 }} />
      <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5 }}>
        Zoth OS
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This studio is not running a virtual machine. The public desk is <Box component="a" href="https://zoth.nullai.tech" sx={{ color: '#8A6A09' }}>zoth.nullai.tech</Box>. There is no ISO download wired up here.
      </Typography>

      <Paper sx={{ p: 2.5, border: '1px solid #EAECF0', mb: 2.5 }}>
        <Typography variant="overline" sx={{ color: '#B8860B', fontWeight: 750 }}>This host</Typography>
        <Typography sx={{ mt: 1 }}>/dev/kvm is {status ? (status.kvm ? 'present' : 'absent') : '…'}.</Typography>
        <Typography sx={{ mt: 1 }}>
          Ollama on 127.0.0.1:11434 is {status?.services?.ollama?.up ? 'up' : 'down'}.
          {models.length > 0 ? ` Local models, cloud tags excluded: ${models.join(', ')}.` : ''}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2.5, bgcolor: '#101828', color: '#F8F4E8' }}>
        <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', letterSpacing: '0.14em', color: '#D4AF37', mb: 1 }}>
          EXAMPLE LAUNCHER · NOT A RUNNING VM
        </Typography>
        <Typography sx={{ fontFamily: mono, fontSize: '0.9rem', mb: 2 }}>{qemu}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ContentCopyIcon />}
          onClick={() => {
            navigator.clipboard.writeText(qemu);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
        >
          {copied ? 'Copied' : 'Copy command'}
        </Button>
      </Paper>
    </Container>
  );
}
