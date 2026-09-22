import React, { useState } from 'react';
import {
  Box, Container, Typography, Chip, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Stack
} from '@mui/material';
import SwarmCanvasVisualizer from '../components/SwarmCanvasVisualizer';
import { pantheonAgents, pantheonCadres } from '../data/pantheon';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function SwarmPage() {
  const [cadre, setCadre] = useState('All');
  const visible = pantheonAgents.filter((agent) => cadre === 'All' || agent.cadre === cadre);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Chip label="ROSTER, NOT TELEMETRY" size="small" sx={{ bgcolor: '#FEF9E7', color: '#8A6A09', fontWeight: 700, mb: 1.5 }} />
      <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1 }}>
        Pantheon roster
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760, mb: 3 }}>
        These {pantheonAgents.length} names and roles come from the legacy agent index. This page does not invent workloads, and it does not mark anyone active unless a process says so. Heartbeats show up on the bridge page when 127.0.0.1:8789 is answering.
      </Typography>

      <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 3, flexWrap: 'wrap' }}>
        {pantheonCadres.map((name) => (
          <Chip
            key={name}
            label={name === 'All' ? `All ${pantheonAgents.length}` : name}
            clickable
            onClick={() => setCadre(name)}
            sx={{
              fontWeight: 700,
              bgcolor: cadre === name ? '#B8860B' : '#F2F4F7',
              color: cadre === name ? '#FFFFFF' : '#344054',
              border: '1px solid',
              borderColor: cadre === name ? '#D4AF37' : 'transparent',
            }}
          />
        ))}
      </Stack>

      <SwarmCanvasVisualizer />

      <TableContainer component={Paper} sx={{ border: '1px solid #EAECF0' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F9FAFB' }}>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Cadre</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((agent) => (
              <TableRow key={agent.id} hover>
                <TableCell sx={{ fontFamily: mono, fontWeight: 700, color: '#8A6A09' }}>{agent.id}</TableCell>
                <TableCell>{agent.role}</TableCell>
                <TableCell>{agent.cadre}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
