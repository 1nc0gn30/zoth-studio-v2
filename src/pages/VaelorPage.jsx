import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, Chip, Paper, Button, TextField,
  Unstable_Grid2 as Grid, Table, TableBody, TableCell, TableHead,
  TableRow, Stack, Divider, Alert, CircularProgress, IconButton, Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import BoltIcon from '@mui/icons-material/Bolt';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedIcon from '@mui/icons-material/Verified';
import SpeedIcon from '@mui/icons-material/Speed';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SecurityIcon from '@mui/icons-material/Security';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SavingsIcon from '@mui/icons-material/Savings';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import DaemonStatusStrip from '../components/DaemonStatusStrip';
import SovereignFunnel from '../components/SovereignFunnel';
import { HeroReveal, HeroItem, RevealOnScroll } from '../components/MotionReveal';
import {
  VAELOR_NETWORK_FALLBACK,
  createVaelorReceiptFallback,
  checkVaelorHandleSafetyFallback,
  VAELOR_22_COMPARISON_MATRIX
} from '../data/obsidianWikiData';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const PRESET_ACCOUNTS = [
  { handle: '@citizen', name: 'Sovereign Demo Wallet', balance: 4750.50, badge: 'Passkey Ready' },
  { handle: '@sprig', name: 'Sprig Kitchen • 757 Artisan Merchant', balance: 5157.05, badge: 'Merchant POS' },
  { handle: '@zoth', name: 'Zoth Studio & Compute Node', balance: 29957.77, badge: 'Sovereign Prime' },
  { handle: '@neal', name: 'Neal Frazier (@1nc0gn30)', balance: 25000.00, badge: 'Founder Core' }
];

export default function VaelorPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const gold = {
    accent: '#D4AF37',
    border: 'rgba(212,175,55,0.35)',
    wash: 'rgba(212,175,55,0.12)',
    glow: 'rgba(212,175,55,0.4)'
  };

  // Live Telemetry State
  const [vaelorStatus, setVaelorStatus] = useState(VAELOR_NETWORK_FALLBACK);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Transfer Simulator State
  const [senderHandle, setSenderHandle] = useState('@citizen');
  const [recipientHandle, setRecipientHandle] = useState('@sprig');
  const [transferAmount, setTransferAmount] = useState('15.00');
  const [transferMemo, setTransferMemo] = useState('Artisan Sourdough & Cold Brew Matcha at Sprig Kitchen');
  const [isSending, setIsSending] = useState(false);
  const [transferResult, setTransferResult] = useState(null);
  const [transferError, setTransferError] = useState(null);

  // Anti-Phishing Scanner State
  const [scannerHandle, setScannerHandle] = useState('@z0th');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(() => checkVaelorHandleSafetyFallback('@z0th'));

  // Polling Live Status from port :8140
  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8140/api/status');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.ok) {
            setVaelorStatus(data);
            setIsLiveConnected(true);
          }
        }
      } catch (_) {
        if (isMounted) setIsLiveConnected(false);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Feeless Transfer & Smart Receipt Execution
  const handleSendTransfer = async () => {
    if (isSending) return;
    setIsSending(true);
    setTransferError(null);

    const amt = parseFloat(transferAmount) || 15.0;
    const payload = {
      buyer: senderHandle,
      merchant: recipientHandle,
      items: [
        { name: transferMemo || 'Sovereign Commerce', qty: 1, unitPrice: amt }
      ],
      memo: transferMemo || 'Feeless instant merchant transfer'
    };

    let resultData = null;
    try {
      const res = await fetch('http://127.0.0.1:8140/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) {
          resultData = json;
        }
      }
    } catch (_) {}

    if (!resultData) {
      resultData = createVaelorReceiptFallback({
        buyer: senderHandle,
        merchant: recipientHandle,
        amount: amt,
        memo: transferMemo
      });
    }

    setTransferResult(resultData);
    setIsSending(false);
  };

  // Anti-Phishing Lookalike Scanner Execution
  const handleScanHandle = async (targetHandle) => {
    const handleToTest = (targetHandle || scannerHandle).trim();
    if (!handleToTest) return;
    setIsScanning(true);

    let resData = null;
    try {
      const res = await fetch(`http://127.0.0.1:8140/api/directory/check/${encodeURIComponent(handleToTest)}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) {
          resData = json;
        }
      }
    } catch (_) {}

    if (!resData) {
      resData = checkVaelorHandleSafetyFallback(handleToTest);
    }

    setScanResult(resData);
    setIsScanning(false);
  };

  const calculatedCashback = useMemo(() => {
    const val = parseFloat(transferAmount) || 0;
    return (val * 0.025).toFixed(2);
  }, [transferAmount]);

  return (
    <Box sx={{ minHeight: '100vh', pb: 10, bgcolor: theme.palette.background.default, color: theme.palette.text.primary }}>
      <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 6 } }}>
        
        {/* ==========================================================================
            HERO SECTION & LIVE TELEMETRY STRIP
            ========================================================================== */}
        <HeroReveal>
          <Box id="vaelor-studio-hero" sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
              <Chip
                icon={<BoltIcon sx={{ color: '#FFD700 !important', fontSize: '0.95rem !important' }} />}
                label="VAELOR ACCOUNT-LATTICE L1"
                sx={{
                  bgcolor: 'rgba(212,175,55,0.18)',
                  color: '#FFD700',
                  fontFamily: mono,
                  fontWeight: 900,
                  fontSize: '0.72rem',
                  border: '1.5px solid rgba(212,175,55,0.45)'
                }}
              />
              <Chip
                label="Chain: vaelor-mainnet-1"
                size="small"
                sx={{ bgcolor: 'rgba(56,189,248,0.14)', color: '#38BDF8', fontFamily: mono, fontWeight: 750, fontSize: '0.68rem' }}
              />
              <Chip
                label={isLiveConnected ? "⚡ Port :8140 Connected" : "✦ Client Zero-Cloud Mode"}
                size="small"
                sx={{
                  bgcolor: isLiveConnected ? 'rgba(16,185,129,0.16)' : 'rgba(232,121,249,0.16)',
                  color: isLiveConnected ? '#34D399' : '#E879F9',
                  fontFamily: mono,
                  fontWeight: 750,
                  fontSize: '0.68rem'
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap', gap: 2.5, mb: 3 }}>
              <Box sx={{ maxWidth: 880 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: '"Syne", "Space Grotesk", sans-serif',
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3.0rem' },
                    lineHeight: 1.15,
                    mb: 1.5,
                    background: isDark
                      ? 'linear-gradient(135deg, #FFF 20%, #FFD700 70%, #34D399 100%)'
                      : 'linear-gradient(135deg, #0F172A 20%, #B8860B 70%, #059669 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  ◈ Vaelor Feeless Account-Lattice DAG
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.92rem', md: '1.05rem' }, lineHeight: 1.65 }}>
                  Everyday cryptocurrency engineered to replace credit cards: <strong>$0.00 gas fees</strong>, human <code>@handles</code>, biometric Passkey wallets, native 24–72h Protected-Pay Escrow, sub-15ms 5-validator BFT consensus, and Proof-of-Useful-Work (PoUW) AI compute minting.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  href="http://127.0.0.1:8140"
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<OpenInNewIcon />}
                  sx={{
                    bgcolor: '#D4AF37',
                    color: '#08080B',
                    fontWeight: 900,
                    fontFamily: mono,
                    fontSize: '0.82rem',
                    px: 2.8,
                    py: 1.2,
                    borderRadius: 2,
                    boxShadow: '0 0 24px rgba(212,175,55,0.4)',
                    '&:hover': { bgcolor: '#FDE047', boxShadow: '0 0 32px rgba(253,224,71,0.6)' }
                  }}
                >
                  🌐 OPEN 20-TAB L-1 EXPLORER (:8140)
                </Button>
                <Button
                  component={RouterLink}
                  to="/memory/docs"
                  variant="outlined"
                  startIcon={<BoltIcon />}
                  sx={{
                    borderColor: 'rgba(56,189,248,0.4)',
                    color: '#38BDF8',
                    fontFamily: mono,
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    px: 2.2,
                    borderRadius: 2,
                    '&:hover': { borderColor: '#38BDF8', bgcolor: 'rgba(56,189,248,0.1)' }
                  }}
                >
                  ⚡ PoUW MINING BRIDGE
                </Button>
              </Box>
            </Box>

            {/* 6 Telemetry Cards Bento Grid */}
            <Paper
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 3,
                border: `1.5px solid ${gold.border}`,
                bgcolor: isDark ? 'rgba(8,12,18,0.92)' : '#FFFFFF',
                boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.6)' : '0 6px 20px rgba(212,175,55,0.08)'
              }}
            >
              <Grid container spacing={2}>
                {/* 1. Circulating Supply */}
                <Grid xs={6} sm={4} md={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#05070D' : '#F8FAFC', border: '1px solid rgba(212,175,55,0.3)', height: '100%' }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block', fontWeight: 800 }}>
                      CIRCULATING SUPPLY
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontFamily: mono, color: '#FFD700', fontWeight: 900, mt: 0.3, fontSize: '0.9rem' }}>
                      {Number(vaelorStatus.totalSupplyVlr || vaelorStatus.snapshot?.totalSupplyVlr || 191157.01).toLocaleString(undefined, { maximumFractionDigits: 1 })} ◈ VLR
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.62rem', display: 'block', mt: 0.2 }}>
                      Fixed max issuance
                    </Typography>
                  </Box>
                </Grid>

                {/* 2. Total DAG Blocks */}
                <Grid xs={6} sm={4} md={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#05070D' : '#F8FAFC', border: '1px solid rgba(0,240,255,0.3)', height: '100%' }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block', fontWeight: 800 }}>
                      TOTAL DAG BLOCKS
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontFamily: mono, color: '#00F0FF', fontWeight: 900, mt: 0.3, fontSize: '0.9rem' }}>
                      {Number(vaelorStatus.totalBlocks || vaelorStatus.snapshot?.totalBlocks || 98).toLocaleString()}+ BLOCKS
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.62rem', display: 'block', mt: 0.2 }}>
                      Asynchronous micro-chains
                    </Typography>
                  </Box>
                </Grid>

                {/* 3. <15ms 5-Validator BFT Quorum Finality */}
                <Grid xs={6} sm={4} md={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#05070D' : '#F8FAFC', border: '1px solid rgba(52,211,153,0.3)', height: '100%' }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block', fontWeight: 800 }}>
                      BFT QUORUM FINALITY
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontFamily: mono, color: '#34D399', fontWeight: 900, mt: 0.3, fontSize: '0.78rem' }}>
                      &lt;15ms (5/5 Validators)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.62rem', display: 'block', mt: 0.2 }}>
                      Multi-region attestation
                    </Typography>
                  </Box>
                </Grid>

                {/* 4. $0.00 Gas */}
                <Grid xs={6} sm={4} md={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#05070D' : '#F8FAFC', border: '1px solid rgba(251,191,36,0.3)', height: '100%' }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block', fontWeight: 800 }}>
                      NETWORK GAS FEE
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontFamily: mono, color: '#FBBF24', fontWeight: 900, mt: 0.3, fontSize: '0.9rem' }}>
                      $0.00 Gas
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.62rem', display: 'block', mt: 0.2 }}>
                      Client SHA-256 micro-stamp
                    </Typography>
                  </Box>
                </Grid>

                {/* 5. 8.5% APY Vault */}
                <Grid xs={6} sm={4} md={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#05070D' : '#F8FAFC', border: '1px solid rgba(232,121,249,0.3)', height: '100%' }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block', fontWeight: 800 }}>
                      SAVINGS VAULT
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontFamily: mono, color: '#E879F9', fontWeight: 900, mt: 0.3, fontSize: '0.86rem' }}>
                      8.5% APY Vault
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.62rem', display: 'block', mt: 0.2 }}>
                      Per-second compound yield
                    </Typography>
                  </Box>
                </Grid>

                {/* 6. 2.5% Instant Cashback */}
                <Grid xs={6} sm={4} md={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#05070D' : '#F8FAFC', border: '1px solid rgba(56,189,248,0.3)', height: '100%' }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block', fontWeight: 800 }}>
                      MERCHANT COMMERCE
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontFamily: mono, color: '#38BDF8', fontWeight: 900, mt: 0.3, fontSize: '0.86rem' }}>
                      2.5% Instant Cashback
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.62rem', display: 'block', mt: 0.2 }}>
                      Automatic buyer rewards
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </HeroReveal>

        <Box sx={{ mb: 4 }}>
          <DaemonStatusStrip />
        </Box>

        {/* ==========================================================================
            TWO INTERACTIVE SIMULATORS (TRANSFER & PHISHING)
            ========================================================================== */}
        <Grid container spacing={3.5} sx={{ mb: 5 }}>
          
          {/* SIMULATOR 1: FEELESS TRANSFER & SMART RECEIPT */}
          <Grid xs={12} lg={7}>
            <Paper
              id="vaelor-transfer-sim"
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: `1.5px solid ${isDark ? 'rgba(52,211,153,0.45)' : 'rgba(52,211,153,0.6)'}`,
                bgcolor: isDark ? 'rgba(8,14,12,0.94)' : '#FFFFFF',
                boxShadow: isDark ? '0 12px 32px rgba(16,185,129,0.1)' : '0 6px 20px rgba(0,0,0,0.06)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SwapHorizIcon sx={{ color: '#34D399', fontSize: '1.4rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Syne", sans-serif' }}>
                    Feeless Transfer &amp; Smart Receipt Simulator
                  </Typography>
                </Box>
                <Chip
                  label="Zero Gas • Sub-15ms"
                  size="small"
                  sx={{ bgcolor: 'rgba(52,211,153,0.15)', color: '#34D399', fontFamily: mono, fontWeight: 800, fontSize: '0.68rem' }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '0.84rem' }}>
                Simulate peer-to-peer and merchant payments on the live Account-Lattice. Transactions cost <strong>$0.00 in gas fees</strong> and automatically credit <strong>2.5% instant cashback</strong> to the buyer upon 5-validator BFT finality.
              </Typography>

              {/* Sender & Recipient Pickers */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 700, display: 'block', mb: 0.6 }}>
                    SENDER ACCOUNT (BUYER)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                    {PRESET_ACCOUNTS.map((acc) => (
                      <Chip
                        key={acc.handle}
                        label={`${acc.handle}`}
                        clickable
                        onClick={() => setSenderHandle(acc.handle)}
                        sx={{
                          fontFamily: mono,
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          bgcolor: senderHandle === acc.handle ? '#34D399' : (isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'),
                          color: senderHandle === acc.handle ? '#08080B' : theme.palette.text.primary,
                          border: `1px solid ${senderHandle === acc.handle ? '#34D399' : theme.palette.divider}`
                        }}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid xs={12} sm={6}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 700, display: 'block', mb: 0.6 }}>
                    RECIPIENT ACCOUNT (MERCHANT)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                    {PRESET_ACCOUNTS.map((acc) => (
                      <Chip
                        key={acc.handle}
                        label={`${acc.handle}`}
                        clickable
                        onClick={() => setRecipientHandle(acc.handle)}
                        sx={{
                          fontFamily: mono,
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          bgcolor: recipientHandle === acc.handle ? '#FFD700' : (isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'),
                          color: recipientHandle === acc.handle ? '#08080B' : theme.palette.text.primary,
                          border: `1px solid ${recipientHandle === acc.handle ? '#FFD700' : theme.palette.divider}`
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>

              {/* Amount & Quick Pills */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 700 }}>
                    TRANSFER AMOUNT (◈ VLR)
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#34D399', fontWeight: 800 }}>
                    ✦ Instant Cashback: +{calculatedCashback} ◈ VLR (2.5%)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TextField
                    id="vaelor-amount-input"
                    size="small"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    sx={{ width: 140, '& input': { fontFamily: mono, fontWeight: 800, fontSize: '0.9rem' } }}
                  />
                  {['5.00', '15.00', '25.00', '50.00', '100.00'].map((amt) => (
                    <Chip
                      key={amt}
                      label={`${amt} ◈`}
                      clickable
                      size="small"
                      onClick={() => setTransferAmount(amt)}
                      sx={{ fontFamily: mono, fontWeight: 750, fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Memo */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 700, display: 'block', mb: 0.6 }}>
                  SMART RECEIPT ITEM / MEMO
                </Typography>
                <TextField
                  id="vaelor-memo-input"
                  size="small"
                  fullWidth
                  value={transferMemo}
                  onChange={(e) => setTransferMemo(e.target.value)}
                  sx={{ '& input': { fontFamily: mono, fontSize: '0.82rem' } }}
                />
              </Box>

              {/* Submit Button */}
              <Button
                id="vaelor-send-btn"
                variant="contained"
                fullWidth
                onClick={handleSendTransfer}
                disabled={isSending || senderHandle === recipientHandle}
                startIcon={isSending ? <CircularProgress size={16} sx={{ color: '#08080B' }} /> : <BoltIcon />}
                sx={{
                  bgcolor: '#34D399',
                  color: '#08080B',
                  fontWeight: 900,
                  fontFamily: mono,
                  fontSize: '0.86rem',
                  py: 1.2,
                  borderRadius: 2,
                  boxShadow: '0 0 20px rgba(52,211,153,0.3)',
                  '&:hover': { bgcolor: '#10B981', boxShadow: '0 0 28px rgba(16,185,129,0.5)' }
                }}
              >
                {isSending
                  ? 'FINALIZING 5/5 BFT QUORUM...'
                  : `SEND ${transferAmount} ◈ VLR (${senderHandle} → ${recipientHandle})`}
              </Button>

              {/* Result Container */}
              {transferResult && (
                <Paper
                  id="vaelor-transfer-result"
                  sx={{
                    mt: 2.5,
                    p: 2.2,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(5,12,8,0.95)' : 'rgba(240,253,244,0.95)',
                    border: '1.5px solid #10B981',
                    boxShadow: '0 8px 24px rgba(16,185,129,0.2)'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.2rem' }} />
                      <Typography sx={{ fontFamily: mono, fontWeight: 900, color: '#10B981', fontSize: '0.84rem' }}>
                        ✓ Feeless Transfer Confirmed &amp; 5-Validator BFT Finalized (&lt;15ms)
                      </Typography>
                    </Box>
                    <Chip
                      label={`+$${((parseFloat(transferAmount) || 15) * 0.025).toFixed(2)} ◈ CASHBACK`}
                      size="small"
                      sx={{ bgcolor: 'rgba(212,175,55,0.2)', color: '#FFD700', border: '1px solid #FFD700', fontFamily: mono, fontWeight: 900, fontSize: '0.72rem' }}
                    />
                  </Box>

                  <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                    <Grid xs={12} sm={6}>
                      <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: isDark ? '#05070A' : '#FFFFFF', border: '1px solid rgba(16,185,129,0.25)' }}>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.62rem', display: 'block' }}>
                          SEND BLOCK HASH (SENDER MICROCHAIN)
                        </Typography>
                        <Typography sx={{ fontFamily: mono, color: '#34D399', fontSize: '0.7rem', wordBreak: 'break-all', fontWeight: 700, mt: 0.2 }}>
                          {transferResult.receiptBlock?.hash || '0x...'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: isDark ? '#05070A' : '#FFFFFF', border: '1px solid rgba(212,175,55,0.25)' }}>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.62rem', display: 'block' }}>
                          RECEIPT ID &amp; GAS FEE
                        </Typography>
                        <Typography sx={{ fontFamily: mono, color: '#FFD700', fontSize: '0.76rem', fontWeight: 800, mt: 0.2 }}>
                          {transferResult.receipt?.id || 'rcp_001'} • Gas: $0.00 (0 VLR)
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* 5 Validator Signatures */}
                  <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: isDark ? 'rgba(0,0,0,0.5)' : '#F1F5F9', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#CBD5E1', fontSize: '0.64rem', display: 'block', fontWeight: 800, mb: 0.6 }}>
                      🛡️ 5-VALIDATOR BFT QUORUM SIGNATURES (FINALIZED_BFT)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                      {[
                        { flag: '🇺🇸', name: 'US-East', latency: '1.55ms' },
                        { flag: '🇩🇪', name: 'EU-Central', latency: '15.1ms' },
                        { flag: '🇯🇵', name: 'Asia-East', latency: '22.7ms' },
                        { flag: '⚡', name: 'ZothOS Edge', latency: '0.44ms' },
                        { flag: '🌐', name: 'NullAI Core', latency: '1.04ms' },
                      ].map((v, i) => (
                        <Chip
                          key={i}
                          label={`${v.flag} ${v.name}: ✓ (${v.latency})`}
                          size="small"
                          sx={{ height: 20, fontSize: '0.62rem', fontFamily: mono, fontWeight: 700, bgcolor: 'rgba(16,185,129,0.12)', color: '#10B981' }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Paper>
              )}
            </Paper>
          </Grid>

          {/* SIMULATOR 2: ANTI-PHISHING @HANDLE SCANNER */}
          <Grid xs={12} lg={5}>
            <Paper
              id="vaelor-phishing-scanner"
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: `1.5px solid ${isDark ? 'rgba(56,189,248,0.45)' : 'rgba(56,189,248,0.6)'}`,
                bgcolor: isDark ? 'rgba(8,12,18,0.94)' : '#FFFFFF',
                boxShadow: isDark ? '0 12px 32px rgba(56,189,248,0.1)' : '0 6px 20px rgba(0,0,0,0.06)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon sx={{ color: '#38BDF8', fontSize: '1.4rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Syne", sans-serif' }}>
                    Anti-Phishing Lookalike Scanner
                  </Typography>
                </Box>
                <Chip
                  label="Homoglyph Sentinel"
                  size="small"
                  sx={{ bgcolor: 'rgba(56,189,248,0.15)', color: '#38BDF8', fontFamily: mono, fontWeight: 800, fontSize: '0.68rem' }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.84rem' }}>
                Protects sovereign merchants against typosquatted homoglyphs (e.g. Cyrillic letters, <code>0</code> for <code>O</code>, <code>1</code> for <code>l</code>) before signing transactions.
              </Typography>

              {/* Preset Test Buttons */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 700, display: 'block', mb: 0.6 }}>
                  PRESET TEST CASES
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                  {[
                    { h: '@zoth', label: '@zoth (Authentic)', safe: true },
                    { h: '@z0th', label: '@z0th (Spoofing Zero)', safe: false },
                    { h: '@sprig', label: '@sprig (Authentic)', safe: true },
                    { h: '@spr1g', label: '@spr1g (Spoofing One)', safe: false },
                    { h: '@neal', label: '@neal (Authentic)', safe: true },
                    { h: '@nea1', label: '@nea1 (Spoofing One)', safe: false }
                  ].map((p) => (
                    <Chip
                      key={p.h}
                      label={p.label}
                      clickable
                      size="small"
                      onClick={() => {
                        setScannerHandle(p.h);
                        handleScanHandle(p.h);
                      }}
                      sx={{
                        fontFamily: mono,
                        fontWeight: 750,
                        fontSize: '0.68rem',
                        bgcolor: scannerHandle === p.h ? (p.safe ? 'rgba(52,211,153,0.3)' : 'rgba(244,63,94,0.3)') : (isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'),
                        color: scannerHandle === p.h ? (p.safe ? '#34D399' : '#F43F5E') : theme.palette.text.primary,
                        border: `1px solid ${scannerHandle === p.h ? (p.safe ? '#34D399' : '#F43F5E') : theme.palette.divider}`
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Custom Handle Input & Button */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
                <TextField
                  id="vaelor-handle-input"
                  size="small"
                  fullWidth
                  value={scannerHandle}
                  onChange={(e) => setScannerHandle(e.target.value)}
                  placeholder="@handle..."
                  sx={{ '& input': { fontFamily: mono, fontSize: '0.84rem' } }}
                />
                <Button
                  id="vaelor-scan-handle-btn"
                  variant="contained"
                  onClick={() => handleScanHandle(scannerHandle)}
                  disabled={isScanning}
                  startIcon={isScanning ? <CircularProgress size={16} sx={{ color: '#FFF' }} /> : <SearchIcon />}
                  sx={{
                    bgcolor: '#38BDF8',
                    color: '#08080B',
                    fontWeight: 900,
                    fontFamily: mono,
                    fontSize: '0.78rem',
                    px: 2.5,
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#0284C7' }
                  }}
                >
                  {isScanning ? 'SCANNING...' : 'SCAN'}
                </Button>
              </Box>

              {/* Phishing Scan Result Box */}
              {scanResult && (
                <Paper
                  id="vaelor-scan-result"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: scanResult.safety?.safe
                      ? (isDark ? 'rgba(6,16,12,0.95)' : 'rgba(240,253,244,0.95)')
                      : (isDark ? 'rgba(24,8,12,0.95)' : 'rgba(255,241,242,0.95)'),
                    border: scanResult.safety?.safe ? '1.5px solid #10B981' : '1.5px solid #F43F5E',
                    boxShadow: scanResult.safety?.safe ? '0 6px 20px rgba(16,185,129,0.2)' : '0 6px 20px rgba(244,63,94,0.2)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {scanResult.safety?.safe ? (
                      <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.2rem' }} />
                    ) : (
                      <WarningAmberIcon sx={{ color: '#F43F5E', fontSize: '1.2rem' }} />
                    )}
                    <Typography
                      sx={{
                        fontFamily: mono,
                        fontWeight: 900,
                        fontSize: '0.82rem',
                        color: scanResult.safety?.safe ? '#10B981' : '#F43F5E'
                      }}
                    >
                      {scanResult.safety?.safe
                        ? `✓ VERIFIED AUTHENTIC: ${scanResult.handle}`
                        : `⚠️ PHISHING ATTACK DETECTED: ${scanResult.handle}`}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.74rem', color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.55 }}>
                    {scanResult.safety?.safe ? (
                      <>
                        <strong>{scanResult.safety?.name || 'Verified Merchant'}</strong> • Domain: <code>{scanResult.safety?.domain || 'local'}</code> • Trust Score: <strong>{scanResult.safety?.trustScore || 800}/850</strong>. Zero homoglyphs or lookalike characters detected.
                      </>
                    ) : (
                      <>
                        {scanResult.safety?.warning || 'Lookalike handle detected!'} Adversarial homoglyph attack spoofing <strong>{scanResult.safety?.suggestedHandle || '@zoth'}</strong>. Attack category: <code>{scanResult.safety?.attackType || 'HOMOGLYPH_SUBSTITUTION'}</code>.
                      </>
                    )}
                  </Typography>
                </Paper>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* ==========================================================================
            22-FEATURE SOVEREIGN COMPARISON MATRIX
            ========================================================================== */}
        <RevealOnScroll>
          <Box id="vaelor-comparison-matrix" sx={{ mb: 6 }}>
            <Box sx={{ mb: 3 }}>
              <Typography className="section-kicker">Architectural Superiority</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: '"Syne", sans-serif', mb: 1 }}>
                22-Feature Sovereign Comparison Matrix
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 840, fontSize: '0.94rem' }}>
                Why Vaelor (◈ VLR) defeats legacy payment gateways, credit cards, and congested blockchain networks in everyday life and AI agent economies.
              </Typography>
            </Box>

            <Paper
              sx={{
                borderRadius: 3,
                border: `1.5px solid ${gold.border}`,
                bgcolor: isDark ? '#08080C' : '#FFFFFF',
                overflow: 'hidden',
                boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.6)' : '0 6px 20px rgba(0,0,0,0.06)'
              }}
            >
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead sx={{ bgcolor: isDark ? '#05070A' : '#F1F5F9' }}>
                    <TableRow>
                      <TableCell sx={{ fontFamily: mono, fontWeight: 900, color: '#94A3B8', fontSize: '0.74rem' }}>
                        FEATURE / CAPABILITY
                      </TableCell>
                      <TableCell sx={{ fontFamily: mono, fontWeight: 900, color: '#FFD700', fontSize: '0.78rem', bgcolor: isDark ? 'rgba(212,175,55,0.08)' : 'rgba(212,175,55,0.12)' }}>
                        ◈ VAELOR (VLR)
                      </TableCell>
                      <TableCell sx={{ fontFamily: mono, fontWeight: 900, color: '#94A3B8', fontSize: '0.74rem' }}>
                        VISA / MASTERCARD
                      </TableCell>
                      <TableCell sx={{ fontFamily: mono, fontWeight: 900, color: '#F59E0B', fontSize: '0.74rem' }}>
                        BITCOIN (BTC)
                      </TableCell>
                      <TableCell sx={{ fontFamily: mono, fontWeight: 900, color: '#38BDF8', fontSize: '0.74rem' }}>
                        ETHEREUM / SOLANA
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {VAELOR_22_COMPARISON_MATRIX.map((row, idx) => (
                      <TableRow
                        key={idx}
                        sx={{
                          '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' },
                          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'}`
                        }}
                      >
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.82rem', fontFamily: mono, color: theme.palette.text.primary }}>
                          {row.feature}
                        </TableCell>
                        <TableCell sx={{ bgcolor: isDark ? 'rgba(212,175,55,0.04)' : 'rgba(212,175,55,0.06)', fontFamily: mono, fontWeight: 800, fontSize: '0.8rem', color: '#10B981' }}>
                          ✓ {row.vaelor}
                        </TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.76rem', color: '#94A3B8' }}>
                          {row.visa}
                        </TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.76rem', color: '#94A3B8' }}>
                          {row.bitcoin}
                        </TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.76rem', color: '#94A3B8' }}>
                          {row.ethSol}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </Box>
        </RevealOnScroll>

        {/* ==========================================================================
            SOVEREIGN MONETIZATION & CONVERSION FUNNEL
            ========================================================================== */}
        <Box sx={{ mt: 6 }}>
          <SovereignFunnel />
        </Box>

      </Container>
    </Box>
  );
}
