import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, Chip, Paper, Button, TextField,
  Unstable_Grid2 as Grid, Table, TableBody, TableCell, TableHead,
  TableRow, Stack, Divider, Alert, CircularProgress, IconButton, Tooltip,
  LinearProgress
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import TerminalIcon from '@mui/icons-material/Terminal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WavesIcon from '@mui/icons-material/Waves';
import GroupsIcon from '@mui/icons-material/Groups';
import PieChartIcon from '@mui/icons-material/PieChart';
import LockResetIcon from '@mui/icons-material/LockReset';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import QrCodeIcon from '@mui/icons-material/QrCode';
import NfcIcon from '@mui/icons-material/Nfc';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import DiamondIcon from '@mui/icons-material/Diamond';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DaemonStatusStrip from '../components/DaemonStatusStrip';
import VaelorLatticeVisualizer from '../components/VaelorLatticeVisualizer';
import SovereignFunnel from '../components/SovereignFunnel';
import { HeroReveal, HeroItem, RevealOnScroll } from '../components/MotionReveal';
import {
  VAELOR_NETWORK_FALLBACK,
  createVaelorReceiptFallback,
  checkVaelorHandleSafetyFallback,
  VAELOR_22_COMPARISON_MATRIX,
  VAELOR_MCP_TOOLS,
  stakeVaelorSavingsFallback,
  drawVaelorCreditFallback,
  callVaelorMcpFallback,
  createVaelorStreamFallback,
  createVaelorGroupTabFallback,
  rotateVaelorGuardianRecoveryFallback,
  pingVaelorInheritanceHeartbeatFallback,
  sendVaelorShieldedTransferFallback,
  postVaelorBountyFallback,
  spendVaelorSubaccountFallback,
  issueVaelorVoucherFallback,
  executeVaelorBridgeSwapFallback,
  sendVaelorCreatorTipFallback,
  boostVaelorLoyaltyFallback,
  executeVaelorMerchantFxFallback
} from '../data/obsidianWikiData';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const PRESET_ACCOUNTS = [
  { handle: '@citizen', name: 'Sovereign Demo Wallet', balance: 4750.50, badge: 'Passkey Ready' },
  { handle: '@sprig', name: 'Sprig Kitchen • 757 Artisan Merchant', balance: 5157.05, badge: 'Merchant POS' },
  { handle: '@zoth', name: 'Zoth Studio & Compute Node', balance: 29957.77, badge: 'Sovereign Prime' },
  { handle: '@neal', name: 'Neal Frazier (@1nc0gn30)', balance: 25000.00, badge: 'Founder Core' }
];

const VALIDATORS = [
  { id: 'val-alpha-virginia', name: 'US-East Sovereign Validator', region: 'us-east (N. Virginia)', flag: '🇺🇸' },
  { id: 'val-beta-frankfurt', name: 'EU-Central Sovereign Validator', region: 'eu-central (Frankfurt)', flag: '🇩🇪' },
  { id: 'val-gamma-tokyo', name: 'Asia-East Sovereign Validator', region: 'ap-northeast (Tokyo)', flag: '🇯🇵' },
  { id: 'val-delta-zothos-local', name: 'ZothOS Edge Micro-Validator', region: 'local-edge (:8140)', flag: '⚡' },
  { id: 'val-epsilon-nullai-core', name: 'NullAI Sovereign Consensus Core', region: 'global-anycast', flag: '🌐' }
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

  // Staking Vault Simulator State
  const [stakeHandle, setStakeHandle] = useState('@citizen');
  const [stakeAmount, setStakeAmount] = useState('250.00');
  const [stakeValidator, setStakeValidator] = useState('val-alpha-virginia');
  const [stakedBalance, setStakedBalance] = useState(1250.00);
  const [isStaking, setIsStaking] = useState(false);
  const [stakeResult, setStakeResult] = useState(null);

  // 30-Day Revolving Credit & BNPL Simulator State
  const [creditHandle, setCreditHandle] = useState('@citizen');
  const [creditDrawAmount, setCreditDrawAmount] = useState('120.00');
  const [creditRecipient, setCreditRecipient] = useState('@sprig');
  const [creditMemo, setCreditMemo] = useState('BNPL: Sprig Kitchen Artisan Catering Order');
  const [isDrawingCredit, setIsDrawingCredit] = useState(false);
  const [creditResult, setCreditResult] = useState(null);

  // MCP Playground State
  const [selectedMcpTool, setSelectedMcpTool] = useState(VAELOR_MCP_TOOLS[0]);
  const [mcpArgsInput, setMcpArgsInput] = useState(() => JSON.stringify(VAELOR_MCP_TOOLS[0].defaultArgs, null, 2));
  const [isExecutingMcp, setIsExecutingMcp] = useState(false);
  const [mcpExecutionResult, setMcpExecutionResult] = useState(null);
  const [mcpExecutionTime, setMcpExecutionTime] = useState(null);

  const handleSelectMcpTool = (tool) => {
    setSelectedMcpTool(tool);
    setMcpArgsInput(JSON.stringify(tool.defaultArgs, null, 2));
    setMcpExecutionResult(null);
    setMcpExecutionTime(null);
  };

  // Staking Deposit Execution
  const handleStakeDeposit = async () => {
    if (isStaking) return;
    setIsStaking(true);
    const amt = parseFloat(stakeAmount) || 250.0;
    let resData = null;
    try {
      const res = await fetch('http://127.0.0.1:8140/api/staking/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: stakeHandle,
          amount: amt,
          validatorId: stakeValidator
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) {
          resData = json;
        }
      }
    } catch (_) {}

    if (!resData) {
      resData = stakeVaelorSavingsFallback({
        handle: stakeHandle,
        amount: amt,
        validatorId: stakeValidator
      });
    }

    setStakeResult(resData);
    if (resData?.totalStakedVlr || resData?.account?.stakedBalanceVlr) {
      setStakedBalance(resData.totalStakedVlr || resData.account.stakedBalanceVlr);
    } else {
      setStakedBalance(prev => prev + amt);
    }
    setIsStaking(false);
  };

  // Credit / BNPL Draw Execution
  const handleDrawCredit = async () => {
    if (isDrawingCredit) return;
    setIsDrawingCredit(true);
    const amt = parseFloat(creditDrawAmount) || 120.0;
    let resData = null;
    try {
      const res = await fetch('http://127.0.0.1:8140/api/credit/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: creditHandle,
          amount: amt,
          recipient: creditRecipient,
          memo: creditMemo
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) {
          resData = json;
        }
      }
    } catch (_) {}

    if (!resData) {
      resData = drawVaelorCreditFallback({
        handle: creditHandle,
        amount: amt,
        recipient: creditRecipient,
        memo: creditMemo
      });
    }

    setCreditResult(resData);
    setIsDrawingCredit(false);
  };

  // MCP Execution
  const handleExecVaelorMcp = async () => {
    if (isExecutingMcp) return;
    setIsExecutingMcp(true);
    const startTime = performance.now();
    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(mcpArgsInput);
    } catch (e) {
      parsedArgs = selectedMcpTool.defaultArgs;
    }

    let resData = null;
    try {
      const res = await fetch('http://127.0.0.1:8140/api/mcp/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedMcpTool.name,
          arguments: parsedArgs
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) {
          resData = json;
        }
      }
    } catch (_) {}

    if (!resData) {
      resData = callVaelorMcpFallback(selectedMcpTool.name, parsedArgs);
    }

    const elapsed = Math.round(performance.now() - startTime);
    setMcpExecutionTime(elapsed);
    setMcpExecutionResult(resData);
    setIsExecutingMcp(false);
  };

  const calculatedYield = useMemo(() => {
    const amt = parseFloat(stakeAmount) || 0;
    return {
      minute: ((amt * 0.085) / 525600).toFixed(6),
      daily: ((amt * 0.085) / 365).toFixed(4),
      monthly: ((amt * 0.085) / 12).toFixed(4),
      yearly: (amt * 0.085).toFixed(2)
    };
  }, [stakeAmount]);

  const calculatedCreditLimit = useMemo(() => {
    return 500 + Math.round(0.8 * stakedBalance) + 50;
  }, [stakedBalance]);

  // Feeless Per-Second Money Streaming State
  const STREAM_PRESETS = [
    { label: 'AI Compute Cluster', rate: 0.005, unit: '0.005 ◈/sec', desc: '18.00 ◈/hr continuous inference' },
    { label: 'Contractor Payroll', rate: 0.025, unit: '0.025 ◈/sec', desc: '90.00 ◈/hr per-second payout' },
    { label: 'GPU Node Cluster', rate: 0.100, unit: '0.100 ◈/sec', desc: '360.00 ◈/hr H100 GPU compute' }
  ];
  const [selectedStreamPreset, setSelectedStreamPreset] = useState(STREAM_PRESETS[0]);
  const [streamSender, setStreamSender] = useState('@citizen');
  const [streamRecipient, setStreamRecipient] = useState('@sprig');
  const [streamTotalAmount, setStreamTotalAmount] = useState('50.00');
  const [streamAccrued, setStreamAccrued] = useState(0.000000);
  const [isStreamingActive, setIsStreamingActive] = useState(true);
  const [isLaunchingStream, setIsLaunchingStream] = useState(false);
  const [streamResult, setStreamResult] = useState(null);

  // Live rAF ticker for accrued VLR stream
  useEffect(() => {
    let animId;
    let lastTime = performance.now();
    const tick = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (isStreamingActive) {
        setStreamAccrued((prev) => +(prev + selectedStreamPreset.rate * dt));
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isStreamingActive, selectedStreamPreset]);

  const handleLaunchStream = async () => {
    if (isLaunchingStream) return;
    setIsLaunchingStream(true);
    const totalAmt = parseFloat(streamTotalAmount) || 50.0;
    const duration = Math.round(totalAmt / selectedStreamPreset.rate) || 10000;
    let resData = null;
    try {
      const res = await fetch('http://127.0.0.1:8140/api/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: streamSender,
          recipient: streamRecipient,
          ratePerSecondVlr: selectedStreamPreset.rate,
          totalAmount: totalAmt,
          durationSeconds: duration,
          memo: `Feeless stream: ${selectedStreamPreset.label}`
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) resData = json;
      }
    } catch (_) {}

    if (!resData) {
      resData = createVaelorStreamFallback({
        sender: streamSender,
        recipient: streamRecipient,
        ratePerSecondVlr: selectedStreamPreset.rate,
        totalAmount: totalAmt,
        durationSeconds: duration,
        memo: `Feeless stream: ${selectedStreamPreset.label}`
      });
    }

    setStreamResult(resData);
    setIsLaunchingStream(false);
  };

  // Feeless Social Group Tab & Bill Splitter State
  const GROUP_TAB_PRESETS = [
    { title: 'Team Compute Cluster', totalAmount: 120, memo: 'Monthly GPU inference & hosting' },
    { title: 'Founders Dinner', totalAmount: 64, memo: 'Sprig Kitchen artisan tasting' },
    { title: 'Co-Op Server Rack', totalAmount: 240, memo: 'Local datacenter colocation rack' }
  ];
  const [selectedGroupPreset, setSelectedGroupPreset] = useState(GROUP_TAB_PRESETS[1]);
  const [groupOrganizer, setGroupOrganizer] = useState('@citizen');
  const [groupMerchant, setGroupMerchant] = useState('@sprig');
  const [groupMembers, setGroupMembers] = useState(['@zoth', '@neal', '@sprig', '@citizen']);
  const [isSettlingGroupTab, setIsSettlingGroupTab] = useState(false);
  const [groupTabResult, setGroupTabResult] = useState(null);

  const groupSplitShare = useMemo(() => {
    return (selectedGroupPreset.totalAmount / groupMembers.length).toFixed(2);
  }, [selectedGroupPreset, groupMembers]);

  const groupCashbackPerMember = useMemo(() => {
    return ((selectedGroupPreset.totalAmount * 0.025) / groupMembers.length).toFixed(3);
  }, [selectedGroupPreset, groupMembers]);

  const handleSettleGroupTab = async () => {
    if (isSettlingGroupTab) return;
    setIsSettlingGroupTab(true);
    let resData = null;
    try {
      const res = await fetch('http://127.0.0.1:8140/api/grouptabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizer: groupOrganizer,
          merchant: groupMerchant,
          title: selectedGroupPreset.title,
          totalAmount: selectedGroupPreset.totalAmount,
          participantHandles: groupMembers,
          cashbackBps: 250
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) resData = json;
      }
    } catch (_) {}

    if (!resData) {
      resData = createVaelorGroupTabFallback({
        organizer: groupOrganizer,
        merchant: groupMerchant,
        title: selectedGroupPreset.title,
        totalAmount: selectedGroupPreset.totalAmount,
        participants: groupMembers,
        cashbackBps: 250
      });
    }

    setGroupTabResult(resData);
    setIsSettlingGroupTab(false);
  };

  // Security & Continuity Workbench State
  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const [keyRotateResult, setKeyRotateResult] = useState(null);

  const [isPingingHeartbeat, setIsPingingHeartbeat] = useState(false);
  const [heartbeatResult, setHeartbeatResult] = useState(null);

  const [isSendingShielded, setIsSendingShielded] = useState(false);
  const [shieldedResult, setShieldedResult] = useState(null);

  const handleGuardianKeyRotation = async () => {
    if (isRotatingKey) return;
    setIsRotatingKey(true);
    let resData = null;
    try {
      const res = await fetch('http://127.0.0.1:8140/api/accounts/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: '@citizen',
          approvals: ['@neal', '@zoth'],
          reason: 'Biometric Passkey device rotation'
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) resData = json;
      }
    } catch (_) {}

    if (!resData) {
      resData = rotateVaelorGuardianRecoveryFallback({
        handle: '@citizen',
        approvals: ['@neal', '@zoth'],
        reason: 'Biometric Passkey device rotation'
      });
    }

    setKeyRotateResult(resData);
    setIsRotatingKey(false);
  };

  const handlePingHeartbeat = async () => {
    if (isPingingHeartbeat) return;
    setIsPingingHeartbeat(true);
    let resData = null;
    try {
      const res = await fetch('http://127.0.0.1:8140/api/inheritance/inh_a6c78f542216435e/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caller: '@sprig' })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) resData = json;
      }
    } catch (_) {}

    if (!resData) {
      resData = pingVaelorInheritanceHeartbeatFallback({
        planId: 'inh_neal_continuity_01',
        caller: '@sprig'
      });
    }

    setHeartbeatResult(resData);
    setIsPingingHeartbeat(false);
  };

  const handleSendShielded = async () => {
    if (isSendingShielded) return;
    setIsSendingShielded(true);
    let resData = null;
    try {
      const res = await fetch('http://127.0.0.1:8140/api/shielded/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: '@citizen',
          to: '@neal',
          amount: 25.0,
          memo: 'Confidential Institutional Settlement'
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) resData = json;
      }
    } catch (_) {}

    if (!resData) {
      resData = sendVaelorShieldedTransferFallback({
        from: '@citizen',
        to: '@neal',
        amount: 25.0,
        memo: 'Confidential Institutional Settlement'
      });
    }

    setShieldedResult(resData);
    setIsSendingShielded(false);
  };

  // Autonomous AI Agent M2M Bounty Exchange State
  const BOUNTY_PRESETS = [
    {
      title: 'AEO Schema Audit',
      reward: 25,
      category: 'AI & Search',
      proofType: 'SHA256_AST_PROOF',
      description: 'Audit JSON-LD WebApplication schema and verify 0-lag crawl availability across GPTBot, ClaudeBot, and Googlebot.'
    },
    {
      title: 'STDP Graph Indexing',
      reward: 40,
      category: 'Neural Memory',
      proofType: 'COSINE_EMBEDDING_PROOF',
      description: 'Compute directional synaptic LTP/LTD weight transitions on live 3D memory engrams.'
    },
    {
      title: 'CodeQL Security Scan',
      reward: 15,
      category: 'Code Security',
      proofType: 'SARIF_ATTESTATION_PROOF',
      description: 'Execute static taint analysis and passkey cryptographic invariant checks.'
    }
  ];
  const [selectedBountyPreset, setSelectedBountyPreset] = useState(BOUNTY_PRESETS[0]);
  const [isPostingBounty, setIsPostingBounty] = useState(false);
  const [bountyResult, setBountyResult] = useState(null);

  const handlePostAndSettleBounty = async () => {
    if (isPostingBounty) return;
    setIsPostingBounty(true);
    let resData = null;
    try {
      const postRes = await fetch('http://127.0.0.1:8140/api/bounties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poster: '@neal',
          title: selectedBountyPreset.title,
          category: selectedBountyPreset.category,
          rewardAmount: selectedBountyPreset.reward,
          requiredProofType: selectedBountyPreset.proofType,
          description: selectedBountyPreset.description
        })
      });
      if (postRes.ok) {
        const postJson = await postRes.json();
        if (postJson && postJson.ok && postJson.bounty?.id) {
          const settleRes = await fetch(`http://127.0.0.1:8140/api/bounties/${postJson.bounty.id}/settle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              claimant: '@zoth',
              deliverableSummary: `Verified ${selectedBountyPreset.title} execution payload`,
              deliverablePayload: JSON.stringify({ score: 100, proof: selectedBountyPreset.proofType, verifiedAt: new Date().toISOString() })
            })
          });
          if (settleRes.ok) {
            const settleJson = await settleRes.json();
            if (settleJson && settleJson.ok) {
              resData = {
                ok: true,
                bounty: settleJson.bounty,
                settleBlock: settleJson.settleBlock,
                postBlock: postJson.postBlock
              };
            }
          }
        }
      }
    } catch (_) {}

    if (!resData) {
      resData = postVaelorBountyFallback({
        poster: '@neal',
        claimant: '@zoth',
        title: selectedBountyPreset.title,
        category: selectedBountyPreset.category,
        rewardAmount: selectedBountyPreset.reward,
        requiredProofType: selectedBountyPreset.proofType,
        description: selectedBountyPreset.description
      });
    }

    setBountyResult(resData);
    setIsPostingBounty(false);
  };

  // Delegated AI Virtual Card State
  const [virtualCardData, setVirtualCardData] = useState({
    id: 'sub_hermes_ai_01',
    parentHandle: '@zoth',
    subHandle: '@zoth.hermes01',
    label: 'Hermes Autonomous AI Compute Agent',
    dailyLimitVlr: 50.00,
    spentTodayVlr: 12.50,
    remainingTodayVlr: 37.50,
    utilizationPct: 25,
    isFrozen: false
  });
  const [isAuthorizingVirtualCard, setIsAuthorizingVirtualCard] = useState(false);
  const [virtualCardSpendAmount, setVirtualCardSpendAmount] = useState('12.50');
  const [virtualCardSpendResult, setVirtualCardSpendResult] = useState(null);
  const [isVirtualCardFrozen, setIsVirtualCardFrozen] = useState(false);

  const handleToggleVirtualCardFreeze = async () => {
    const nextFrozen = !isVirtualCardFrozen;
    setIsVirtualCardFrozen(nextFrozen);
    setVirtualCardData(prev => ({ ...prev, isFrozen: nextFrozen }));
    try {
      await fetch('http://127.0.0.1:8140/api/subaccounts/sub_ff9bb625b5e313eb/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caller: '@zoth', frozen: nextFrozen })
      });
    } catch (_) {}
  };

  const handleAuthorizeVirtualCardSpend = async () => {
    if (isAuthorizingVirtualCard || isVirtualCardFrozen) return;
    setIsAuthorizingVirtualCard(true);
    const amt = parseFloat(virtualCardSpendAmount) || 12.50;
    let resData = null;
    try {
      const res = await fetch('http://127.0.0.1:8140/api/subaccounts/sub_ff9bb625b5e313eb/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: '@sprig',
          amount: amt,
          memo: 'Hermes GPU inference quota',
          category: 'AI & Compute'
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) resData = json;
      }
    } catch (_) {}

    if (!resData) {
      resData = spendVaelorSubaccountFallback({
        subAccountId: 'sub_hermes_ai_01',
        parentHandle: '@zoth',
        subHandle: '@zoth.hermes01',
        label: 'Hermes Autonomous AI Compute Agent',
        dailyLimitVlr: 50.00,
        amount: amt,
        recipient: '@sprig',
        memo: 'Hermes GPU inference quota'
      });
    }

    if (resData && resData.subAccount) {
      setVirtualCardData(prev => ({
        ...prev,
        spentTodayVlr: resData.subAccount.spentTodayVlr !== undefined ? resData.subAccount.spentTodayVlr : +(prev.spentTodayVlr + amt).toFixed(2),
        remainingTodayVlr: resData.remainingTodayVlr !== undefined ? resData.remainingTodayVlr : Math.max(0, +(prev.remainingTodayVlr - amt).toFixed(2)),
        utilizationPct: resData.subAccount.utilizationPct !== undefined ? resData.subAccount.utilizationPct : Math.min(100, Math.round(((prev.spentTodayVlr + amt) / prev.dailyLimitVlr) * 100))
      }));
    }
    setVirtualCardSpendResult(resData);
    setIsAuthorizingVirtualCard(false);
  };

  // Offline Tap-to-Pay Bearer Voucher State
  const [voucherAmount, setVoucherAmount] = useState('20.00');
  const [voucherPin, setVoucherPin] = useState('7570');
  const [voucherMemo, setVoucherMemo] = useState('Sub-surface peer mesh token');
  const [isMintingVoucher, setIsMintingVoucher] = useState(false);
  const [voucherResult, setVoucherResult] = useState(null);

  const handleMintOfflineVoucher = async () => {
    if (isMintingVoucher) return;
    setIsMintingVoucher(true);
    const amt = parseFloat(voucherAmount) || 20.0;
    let resData = null;
    try {
      const res = await fetch('http://127.0.0.1:8140/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issuer: '@neal',
          amount: amt,
          claimSecret: voucherPin,
          memo: voucherMemo,
          expiresInHours: 72
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) resData = json;
      }
    } catch (_) {}

    if (!resData) {
      resData = issueVaelorVoucherFallback({
        issuer: '@neal',
        amount: amt,
        claimSecret: voucherPin,
        memo: voucherMemo,
        expiresInHours: 72
      });
    }

    setVoucherResult(resData);
    setIsMintingVoucher(false);
  };

  // Wave 26: Cross-Chain Atomic Bridge State
  const BRIDGE_PRESETS = [
    { label: '100 ◈ ↔ $100.00 USD', fromAsset: 'VLR', toAsset: 'USD', fromAmount: 100, toAmount: 100, desc: 'Zero-spread 1:1 USD fiat settlement' },
    { label: '250 ◈ ↔ 1.66 SOL', fromAsset: 'VLR', toAsset: 'SOL', fromAmount: 250, toAmount: 1.66, desc: 'Solana DePay bridge rail ($150.60/SOL)' },
    { label: '500 ◈ ↔ 0.0052 BTC', fromAsset: 'VLR', toAsset: 'BTC', fromAmount: 500, toAmount: 0.0052, desc: 'Bitcoin L1 atomic settlement ($96,153/BTC)' }
  ];
  const [selectedBridgePreset, setSelectedBridgePreset] = useState(BRIDGE_PRESETS[0]);
  const [isExecutingBridgeSwap, setIsExecutingBridgeSwap] = useState(false);
  const [bridgeSwapResult, setBridgeSwapResult] = useState(null);

  const handleExecuteBridgeSwap = async () => {
    if (isExecutingBridgeSwap) return;
    setIsExecutingBridgeSwap(true);
    let resData = null;
    try {
      const quoteRes = await fetch('http://127.0.0.1:8140/api/bridge/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAsset: selectedBridgePreset.fromAsset,
          toAsset: selectedBridgePreset.toAsset,
          amount: selectedBridgePreset.fromAmount,
          accountHandle: '@zoth'
        })
      });
      if (quoteRes.ok) {
        const quoteJson = await quoteRes.json();
        if (quoteJson && quoteJson.ok && quoteJson.quote?.id) {
          const swapRes = await fetch('http://127.0.0.1:8140/api/bridge/swap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quoteId: quoteJson.quote.id,
              accountHandle: '@zoth',
              depositTxHash: 'pi_atomic_' + Math.random().toString(16).slice(2, 10),
              destinationAddress: 'vlr_bridge_dest_' + Math.random().toString(16).slice(2, 10)
            })
          });
          if (swapRes.ok) {
            const swapJson = await swapRes.json();
            if (swapJson && swapJson.ok) resData = swapJson;
          }
        }
      }
    } catch (_) {}

    if (!resData) {
      resData = executeVaelorBridgeSwapFallback({
        fromAsset: selectedBridgePreset.fromAsset,
        toAsset: selectedBridgePreset.toAsset,
        fromAmount: selectedBridgePreset.fromAmount,
        accountHandle: '@zoth'
      });
    }

    setBridgeSwapResult(resData);
    setIsExecutingBridgeSwap(false);
  };

  // Wave 26: Creator Tip Jar & Patronage Badges State
  const TIP_TIERS = [
    { label: '✨ 5 ◈ SUPPORTER', tier: 'SUPPORTER', amount: 5, badge: 'SUPPORTER', emoji: '✨', desc: 'Back open-source compute micro-tasks' },
    { label: '🌟 25 ◈ PATRON', tier: 'PATRON', amount: 25, badge: 'PATRON', emoji: '🌟', desc: 'Dedicated project patron badge & Discord role' },
    { label: '👑 100 ◈ SOVEREIGN_BACKER', tier: 'SOVEREIGN_BACKER', amount: 100, badge: 'SOVEREIGN_BACKER', emoji: '👑', desc: 'Founding backer on consensus attestation wall' }
  ];
  const TIP_TARGETS = [
    { handle: '@zoth', label: 'Zoth Studio & Compute Node', slug: 'zoth-os' },
    { handle: '@sprig', label: 'Sprig Kitchen • Artisan POS', slug: 'sprig-pos' },
    { handle: '@hatch', label: 'Hatch Sovereign Grants', slug: 'hatch-grants' }
  ];
  const [selectedTipTier, setSelectedTipTier] = useState(TIP_TIERS[1]);
  const [selectedTipTarget, setSelectedTipTarget] = useState(TIP_TARGETS[0]);
  const [isSendingCreatorTip, setIsSendingCreatorTip] = useState(false);
  const [creatorTipResult, setCreatorTipResult] = useState(null);

  const handleSendCreatorTip = async () => {
    if (isSendingCreatorTip) return;
    setIsSendingCreatorTip(true);
    let resData = null;
    try {
      const res = await fetch('http://127.0.0.1:8140/api/tips/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: '@citizen',
          creator: selectedTipTarget.handle,
          amount: selectedTipTier.amount,
          projectSlug: selectedTipTarget.slug,
          message: `Sovereign ${selectedTipTier.tier} patron grant for ${selectedTipTarget.slug}`
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) resData = json;
      }
    } catch (_) {}

    if (!resData) {
      resData = sendVaelorCreatorTipFallback({
        from: '@citizen',
        creator: selectedTipTarget.handle,
        amount: selectedTipTier.amount,
        projectSlug: selectedTipTarget.slug,
        message: `Sovereign ${selectedTipTier.tier} patron grant for ${selectedTipTarget.slug}`
      });
    }

    setCreatorTipResult(resData);
    setIsSendingCreatorTip(false);
  };

  // Wave 26: Consumer Loyalty & Dynamic Cashback Multiplier State
  const LOYALTY_TIERS = [
    { id: 'BRONZE', name: 'BRONZE', pct: '2.5%', bps: 250, threshold: 0, desc: 'Base feeless merchant tier' },
    { id: 'SILVER', name: 'SILVER', pct: '3.0%', bps: 300, threshold: 250, desc: 'Active consumer multiplier' },
    { id: 'GOLD', name: 'GOLD', pct: '3.5%', bps: 350, threshold: 750, desc: 'Institutional trader rebate' },
    { id: 'SOVEREIGN_DIAMOND', name: 'SOVEREIGN_DIAMOND', pct: '5.0%', bps: 500, threshold: 2000, desc: 'Maximum sovereign Diamond rebate' }
  ];
  const [activeLoyaltyTier, setActiveLoyaltyTier] = useState('SOVEREIGN_DIAMOND');
  const [isBoostingLoyalty, setIsBoostingLoyalty] = useState(false);
  const [loyaltyBoostResult, setLoyaltyBoostResult] = useState(null);

  const handleBoostLoyaltyTier = async () => {
    if (isBoostingLoyalty) return;
    setIsBoostingLoyalty(true);
    let resData = null;
    try {
      const res = await fetch('http://127.0.0.1:8140/api/loyalty/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: '@citizen',
          stakeBoostVlr: 250
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) resData = json;
      }
    } catch (_) {}

    if (!resData) {
      resData = boostVaelorLoyaltyFallback({
        handle: '@citizen',
        stakeBoostVlr: 250
      });
    }

    setActiveLoyaltyTier('SOVEREIGN_DIAMOND');
    setLoyaltyBoostResult(resData);
    setIsBoostingLoyalty(false);
  };

  // Wave 27: Programmable Merchant FX Treasury Auto-Sweep State
  const MERCHANT_FX_PRESETS = [
    {
      handle: '@sprig',
      name: 'Sprig Kitchen • 757 Artisan Merchant',
      badge: 'Merchant POS',
      defaultAmount: 50,
      memo: 'Artisan Matcha & Sourdough POS',
      split: { usdPct: 70, vaultStakePct: 20, liquidVlrPct: 10, label: '70% USD / 20% Stake / 10% VLR' },
      desc: 'High USD working capital for culinary inventory & 8.5% yield savings'
    },
    {
      handle: '@zoth',
      name: 'Zoth Studio & Compute Node',
      badge: 'Sovereign Prime',
      defaultAmount: 75,
      memo: 'GPU Inference Quota & Subscriptions',
      split: { usdPct: 40, vaultStakePct: 40, liquidVlrPct: 20, label: '40% USD / 40% Stake / 20% VLR' },
      desc: 'Balanced compute growth: 40% APY savings vault + 40% fiat runway'
    },
    {
      handle: '@hatch',
      name: 'Hatch Sovereign Grants',
      badge: 'Grants Treasury',
      defaultAmount: 100,
      memo: 'Sovereign AI Ecosystem Micro-Grant',
      split: { usdPct: 50, vaultStakePct: 30, liquidVlrPct: 20, label: '50% USD / 30% Stake / 20% VLR' },
      desc: 'Grant endowment sweep: 50% cash reserve + 30% yield accumulation'
    }
  ];

  const [selectedMerchantFx, setSelectedMerchantFx] = useState(MERCHANT_FX_PRESETS[0]);
  const [fxCheckoutAmount, setFxCheckoutAmount] = useState('50.00');
  const [fxCheckoutMemo, setFxCheckoutMemo] = useState('Artisan Matcha & Sourdough POS');
  const [isExecutingFxCheckout, setIsExecutingFxCheckout] = useState(false);
  const [fxCheckoutResult, setFxCheckoutResult] = useState(null);

  const handleExecuteMerchantFxCheckout = async () => {
    if (isExecutingFxCheckout) return;
    setIsExecutingFxCheckout(true);
    const amt = parseFloat(fxCheckoutAmount) || selectedMerchantFx.defaultAmount;
    let resData = null;
    try {
      const res = await fetch('http://127.0.0.1:8140/api/merchant-fx/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer: '@citizen',
          merchant: selectedMerchantFx.handle,
          amount: amt,
          memo: fxCheckoutMemo || selectedMerchantFx.memo
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) resData = json;
      }
    } catch (_) {}

    if (!resData) {
      resData = executeVaelorMerchantFxFallback({
        buyer: '@citizen',
        merchant: selectedMerchantFx.handle,
        amount: amt,
        memo: fxCheckoutMemo || selectedMerchantFx.memo,
        fxSplit: selectedMerchantFx.split
      });
    }

    setFxCheckoutResult(resData);
    setIsExecutingFxCheckout(false);
  };

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
            ACCOUNT-LATTICE DAG & 5-VALIDATOR BFT QUORUM 60FPS VISUALIZER
            ========================================================================== */}
        <RevealOnScroll>
          <Box sx={{ mb: 5 }}>
            <VaelorLatticeVisualizer />
          </Box>
        </RevealOnScroll>

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
            SECTION: 8.5% APY SAVINGS VAULT & 30-DAY REVOLVING CREDIT / BNPL
            ========================================================================== */}
        <RevealOnScroll>
          <Box id="vaelor-vault-credit-sim" sx={{ mb: 6 }}>
            <Box sx={{ mb: 3 }}>
              <Typography className="section-kicker">Autonomous Liquidity &amp; Lending</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: '"Syne", sans-serif', mb: 1 }}>
                Zero-Lockup 8.5% APY Vault &amp; 30-Day Revolving Credit
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 880, fontSize: '0.94rem' }}>
                Instant compound savings backed by real Proof-of-Useful-Work AI compute demand, paired with autonomous on-lattice underwriting: <strong>0% APR, 30-day grace period</strong>, and instant merchant settlement without credit bureaus.
              </Typography>
            </Box>

            <Grid container spacing={3.5}>
              {/* VAULT DEPOSIT SIMULATOR */}
              <Grid xs={12} lg={6}>
                <Paper
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: `1.5px solid ${isDark ? 'rgba(232,121,249,0.45)' : 'rgba(232,121,249,0.6)'}`,
                    bgcolor: isDark ? 'rgba(16,8,20,0.94)' : '#FFFFFF',
                    boxShadow: isDark ? '0 12px 32px rgba(232,121,249,0.1)' : '0 6px 20px rgba(0,0,0,0.06)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SavingsIcon sx={{ color: '#E879F9', fontSize: '1.4rem' }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Syne", sans-serif' }}>
                        8.5% APY Savings Vault
                      </Typography>
                    </Box>
                    <Chip
                      label="Zero-Lockup • Instant Withdraw"
                      size="small"
                      sx={{ bgcolor: 'rgba(232,121,249,0.15)', color: '#E879F9', fontFamily: mono, fontWeight: 800, fontSize: '0.68rem' }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '0.84rem' }}>
                    Deposit ◈ VLR to earn per-second compounding yield. Yield is backed by verified AST parsing and vector indexing micro-bounties paid by autonomous AI agents.
                  </Typography>

                  {/* Account Selector */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 700, display: 'block', mb: 0.6 }}>
                      STAKING ACCOUNT
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                      {PRESET_ACCOUNTS.map((acc) => (
                        <Chip
                          key={acc.handle}
                          label={`${acc.handle}`}
                          clickable
                          onClick={() => setStakeHandle(acc.handle)}
                          sx={{
                            fontFamily: mono,
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            bgcolor: stakeHandle === acc.handle ? '#E879F9' : (isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'),
                            color: stakeHandle === acc.handle ? '#08080B' : theme.palette.text.primary,
                            border: `1px solid ${stakeHandle === acc.handle ? '#E879F9' : theme.palette.divider}`
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Amount & Validator Row */}
                  <Grid container spacing={2} sx={{ mb: 2.5 }}>
                    <Grid xs={12} sm={6}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 700, display: 'block', mb: 0.6 }}>
                        DEPOSIT AMOUNT (◈ VLR)
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="250.00"
                        InputProps={{
                          sx: { fontFamily: mono, fontWeight: 800, fontSize: '0.9rem' },
                          startAdornment: <Typography sx={{ mr: 1, color: '#E879F9', fontWeight: 900 }}>◈</Typography>
                        }}
                      />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 700, display: 'block', mb: 0.6 }}>
                        TARGET VALIDATOR
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                        {VALIDATORS.slice(0, 3).map((v) => (
                          <Chip
                            key={v.id}
                            label={`${v.flag} ${v.id.replace('val-', '').split('-')[0]}`}
                            clickable
                            size="small"
                            onClick={() => setStakeValidator(v.id)}
                            sx={{
                              fontFamily: mono,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              bgcolor: stakeValidator === v.id ? 'rgba(232,121,249,0.2)' : 'transparent',
                              color: stakeValidator === v.id ? '#E879F9' : '#94A3B8',
                              border: `1px solid ${stakeValidator === v.id ? '#E879F9' : 'rgba(255,255,255,0.1)'}`
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Real-Time Compound Yield Breakdown */}
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2.5,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(5,7,12,0.85)' : '#F8FAFC',
                      border: '1px solid rgba(232,121,249,0.25)'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#E879F9', fontWeight: 900, display: 'block', mb: 1, letterSpacing: '0.05em' }}>
                      PROJECTED COMPOUND YIELD FORECAST
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid xs={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.66rem', fontFamily: mono, display: 'block' }}>
                          PER MINUTE
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: '#34D399', fontSize: '0.8rem' }}>
                          +{calculatedYield.minute} ◈
                        </Typography>
                      </Grid>
                      <Grid xs={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.66rem', fontFamily: mono, display: 'block' }}>
                          30-DAY RETURN
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: '#E879F9', fontSize: '0.8rem' }}>
                          +{calculatedYield.monthly} ◈
                        </Typography>
                      </Grid>
                      <Grid xs={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.66rem', fontFamily: mono, display: 'block' }}>
                          ANNUAL (1 YEAR)
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 900, color: '#FFD700', fontSize: '0.86rem' }}>
                          +{calculatedYield.yearly} ◈
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Deposit Button */}
                  <Button
                    id="vaelor-stake-btn"
                    fullWidth
                    variant="contained"
                    onClick={handleStakeDeposit}
                    disabled={isStaking}
                    startIcon={isStaking ? <CircularProgress size={16} sx={{ color: '#08080B' }} /> : <TrendingUpIcon />}
                    sx={{
                      bgcolor: '#E879F9',
                      color: '#08080B',
                      fontWeight: 900,
                      fontFamily: mono,
                      fontSize: '0.82rem',
                      py: 1.2,
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#D946EF' },
                      mb: 2
                    }}
                  >
                    {isStaking ? 'DEPOSITING TO LATTICE...' : `DEPOSIT ${stakeAmount || '250'} ◈ TO 8.5% APY VAULT`}
                  </Button>

                  {/* Deposit Confirmation Card */}
                  {stakeResult && (
                    <Paper
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(12,24,18,0.9)' : 'rgba(240,253,244,0.95)',
                        border: '1.5px solid #10B981',
                        mt: 'auto'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                        <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.1rem' }} />
                        <Typography sx={{ fontFamily: mono, fontWeight: 900, fontSize: '0.78rem', color: '#10B981' }}>
                          STAKE DEPOSITED &amp; FINALIZED (5/5 BFT)
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.72rem', color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.5 }}>
                        Block Hash: <code>{(stakeResult.depositBlock?.hash || stakeResult.hash || 'e89a42..b7').slice(0, 18)}...</code>
                        <br />
                        Staked Balance: <strong>{(stakeResult.totalStakedVlr || stakeResult.account?.stakedBalanceVlr || stakedBalance).toLocaleString()} ◈ VLR</strong>
                        <br />
                        Validator: <code>{stakeResult.depositBlock?.data?.validatorId || stakeValidator}</code> • APY: <strong>8.5% PoUW Yield</strong>
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Grid>

              {/* REVOLVING CREDIT & BNPL SIMULATOR */}
              <Grid xs={12} lg={6}>
                <Paper
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: `1.5px solid ${isDark ? 'rgba(56,189,248,0.45)' : 'rgba(56,189,248,0.6)'}`,
                    bgcolor: isDark ? 'rgba(6,14,24,0.94)' : '#FFFFFF',
                    boxShadow: isDark ? '0 12px 32px rgba(56,189,248,0.1)' : '0 6px 20px rgba(0,0,0,0.06)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCardIcon sx={{ color: '#38BDF8', fontSize: '1.4rem' }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Syne", sans-serif' }}>
                        30-Day 0% APR Revolving Credit
                      </Typography>
                    </Box>
                    <Chip
                      label="835 / 850 SOVEREIGN PRIME"
                      size="small"
                      sx={{ bgcolor: 'rgba(56,189,248,0.15)', color: '#38BDF8', fontFamily: mono, fontWeight: 900, fontSize: '0.68rem', border: '1px solid rgba(56,189,248,0.3)' }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.84rem' }}>
                    Instant BNPL merchant checkout and liquidity draws. 0% APR for 30 days. Limits expand automatically as you stake savings or complete AI Proof-of-Useful-Work tasks.
                  </Typography>

                  {/* Underwriting Formula Banner */}
                  <Paper
                    sx={{
                      p: 1.5,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(5,10,18,0.85)' : '#F0F9FF',
                      border: '1px solid rgba(56,189,248,0.25)'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block', fontWeight: 700 }}>
                          ON-LATTICE UNDERWRITING FORMULA
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: '#38BDF8', fontSize: '0.74rem' }}>
                          500 ◈ Floor + 80% Vault Stake + PoUW Reputation
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block', fontWeight: 700 }}>
                          AVAILABLE LIMIT
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 900, color: '#10B981', fontSize: '0.88rem' }}>
                          {calculatedCreditLimit.toLocaleString()} ◈ VLR
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  {/* Draw Inputs */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid xs={12} sm={6}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 700, display: 'block', mb: 0.6 }}>
                        DRAW AMOUNT (◈ VLR)
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={creditDrawAmount}
                        onChange={(e) => setCreditDrawAmount(e.target.value)}
                        placeholder="120.00"
                        InputProps={{
                          sx: { fontFamily: mono, fontWeight: 800, fontSize: '0.9rem' },
                          startAdornment: <Typography sx={{ mr: 1, color: '#38BDF8', fontWeight: 900 }}>◈</Typography>
                        }}
                      />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 700, display: 'block', mb: 0.6 }}>
                        MERCHANT RECIPIENT
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={creditRecipient}
                        onChange={(e) => setCreditRecipient(e.target.value)}
                        placeholder="@sprig"
                        InputProps={{
                          sx: { fontFamily: mono, fontWeight: 800, fontSize: '0.85rem' }
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Memo */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 700, display: 'block', mb: 0.6 }}>
                      COMMERCE MEMO (RECEIPT ATTESTATION)
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={creditMemo}
                      onChange={(e) => setCreditMemo(e.target.value)}
                      placeholder="BNPL: Sprig Kitchen Artisan Catering Order"
                      InputProps={{
                        sx: { fontFamily: mono, fontSize: '0.8rem' }
                      }}
                    />
                  </Box>

                  {/* BNPL Draw Button */}
                  <Button
                    id="vaelor-bnpl-btn"
                    fullWidth
                    variant="contained"
                    onClick={handleDrawCredit}
                    disabled={isDrawingCredit}
                    startIcon={isDrawingCredit ? <CircularProgress size={16} sx={{ color: '#08080B' }} /> : <SpeedIcon />}
                    sx={{
                      bgcolor: '#38BDF8',
                      color: '#08080B',
                      fontWeight: 900,
                      fontFamily: mono,
                      fontSize: '0.82rem',
                      py: 1.2,
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#0284C7' },
                      mb: 2
                    }}
                  >
                    {isDrawingCredit ? 'UNDERWRITING & DISBURSING...' : `DRAW ${creditDrawAmount || '120'} ◈ BNPL CREDIT`}
                  </Button>

                  {/* BNPL Confirmation Card */}
                  {creditResult && (
                    <Paper
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(12,24,18,0.9)' : 'rgba(240,253,244,0.95)',
                        border: '1.5px solid #10B981',
                        mt: 'auto'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                        <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.1rem' }} />
                        <Typography sx={{ fontFamily: mono, fontWeight: 900, fontSize: '0.78rem', color: '#10B981' }}>
                          0% APR BNPL SETTLED AT 5-VALIDATOR BFT FINALITY
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.72rem', color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.5 }}>
                        Draw Block: <code>{(creditResult.drawBlock?.hash || creditResult.hash || '55cb36..79').slice(0, 18)}...</code>
                        <br />
                        Recipient: <strong>{creditRecipient}</strong> • Disbursed: <strong>{creditDrawAmount} ◈ VLR</strong>
                        <br />
                        Grace Period: <strong>30 Days (0% APR)</strong> • Due: <code>{new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}</code>
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </RevealOnScroll>

        {/* ==========================================================================
            SECTION: FEELSS PER-SECOND MONEY STREAMING & SOCIAL GROUP BILL-SPLIT
            ========================================================================== */}
        <RevealOnScroll>
          <Box id="vaelor-stream-split-sim" sx={{ mb: 6 }}>
            <Box sx={{ mb: 3 }}>
              <Typography className="section-kicker">Continuous Nano-Finance &amp; Social Commerce</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: '"Syne", sans-serif', mb: 1 }}>
                Feeless Money Streaming &amp; Social Group Bill-Splitter
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 880, fontSize: '0.94rem' }}>
                Continuous real-time nano-payments with <strong>$0.00 gas per tick</strong>, paired with automated multi-party group bill splitting and pro-rata <strong>2.5% instant cashback rebates</strong> for every participant.
              </Typography>
            </Box>

            <Grid container spacing={3.5}>
              {/* LEFT PANE: PER-SECOND MONEY STREAMING */}
              <Grid xs={12} lg={6}>
                <Paper
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: `1.5px solid ${isDark ? 'rgba(56,189,248,0.45)' : 'rgba(56,189,248,0.6)'}`,
                    bgcolor: isDark ? 'rgba(6,12,20,0.94)' : '#FFFFFF',
                    boxShadow: isDark ? '0 12px 32px rgba(56,189,248,0.1)' : '0 6px 20px rgba(0,0,0,0.06)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WavesIcon sx={{ color: '#38BDF8', fontSize: '1.4rem' }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Syne", sans-serif' }}>
                        Feeless Per-Second Money Streaming
                      </Typography>
                    </Box>
                    <Chip
                      label="$0.00 Gas Per Tick"
                      size="small"
                      sx={{ bgcolor: 'rgba(56,189,248,0.15)', color: '#38BDF8', fontFamily: mono, fontWeight: 800, fontSize: '0.68rem' }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.84rem' }}>
                    Stream ◈ VLR continuously by the millisecond for autonomous AI compute, contractor payroll, or GPU cluster time with zero gas fees per micro-increment.
                  </Typography>

                  {/* Rate Presets */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 800, display: 'block', mb: 0.8, letterSpacing: '0.05em' }}>
                      STREAMING RATE PRESETS
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                      {STREAM_PRESETS.map((p) => {
                        const isSelected = selectedStreamPreset.label === p.label;
                        return (
                          <Chip
                            key={p.label}
                            label={`${p.unit} (${p.label.split(' ')[0]})`}
                            clickable
                            onClick={() => setSelectedStreamPreset(p)}
                            sx={{
                              fontFamily: mono,
                              fontWeight: isSelected ? 900 : 700,
                              fontSize: '0.72rem',
                              bgcolor: isSelected ? '#38BDF8' : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
                              color: isSelected ? '#08080B' : theme.palette.text.primary,
                              border: `1px solid ${isSelected ? '#38BDF8' : 'rgba(56,189,248,0.2)'}`
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Live Accrued Counter Banner */}
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2.5,
                      borderRadius: 2,
                      bgcolor: isDark ? '#020408' : '#F0F9FF',
                      border: '1.5px solid rgba(56,189,248,0.3)',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.65rem', display: 'block', fontWeight: 800, mb: 0.5 }}>
                      REAL-TIME ACCRUED ◈ VLR (FEELSS SUB-SECOND TICKER)
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: mono,
                        fontWeight: 900,
                        color: '#34D399',
                        letterSpacing: '0.04em',
                        textShadow: '0 0 20px rgba(52,211,153,0.35)'
                      }}
                    >
                      ◈ {streamAccrued.toFixed(6)}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#64748B', fontSize: '0.66rem', display: 'block', mt: 0.5 }}>
                      {selectedStreamPreset.unit} • {selectedStreamPreset.desc} • $0.00 Gas
                    </Typography>
                  </Paper>

                  {/* Stream Sender & Recipient Pickers */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid xs={6}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 700, display: 'block', mb: 0.6 }}>
                        SENDER ACCOUNT
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={streamSender}
                        onChange={(e) => setStreamSender(e.target.value)}
                        placeholder="@citizen"
                        InputProps={{ sx: { fontFamily: mono, fontSize: '0.85rem' } }}
                      />
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 700, display: 'block', mb: 0.6 }}>
                        RECIPIENT ACCOUNT
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={streamRecipient}
                        onChange={(e) => setStreamRecipient(e.target.value)}
                        placeholder="@sprig"
                        InputProps={{ sx: { fontFamily: mono, fontSize: '0.85rem' } }}
                      />
                    </Grid>
                  </Grid>

                  {/* Launch Stream Button */}
                  <Button
                    id="vaelor-stream-btn"
                    fullWidth
                    variant="contained"
                    onClick={handleLaunchStream}
                    disabled={isLaunchingStream}
                    startIcon={isLaunchingStream ? <CircularProgress size={16} sx={{ color: '#08080B' }} /> : <WavesIcon />}
                    sx={{
                      bgcolor: '#38BDF8',
                      color: '#08080B',
                      fontWeight: 900,
                      fontFamily: mono,
                      fontSize: '0.82rem',
                      py: 1.2,
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#0284C7' },
                      mb: 2
                    }}
                  >
                    {isLaunchingStream ? 'LAUNCHING STREAM ON LATTICE...' : `🌊 LAUNCH FEELSS STREAM (${selectedStreamPreset.unit})`}
                  </Button>

                  {/* Stream Result Card */}
                  {streamResult && (
                    <Paper
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(12,24,18,0.9)' : 'rgba(240,253,244,0.95)',
                        border: '1.5px solid #10B981',
                        mt: 'auto'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                        <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.1rem' }} />
                        <Typography sx={{ fontFamily: mono, fontWeight: 900, fontSize: '0.78rem', color: '#10B981' }}>
                          FEELSS STREAM ACTIVE &amp; DISBURSING (5/5 BFT)
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.72rem', color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.5 }}>
                        Stream ID: <code>{(streamResult.stream?.id || 'strm_9f82..').slice(0, 16)}</code> • Block: <code>{(streamResult.createBlock?.hash || '88a4..').slice(0, 14)}...</code>
                        <br />
                        Rate: <strong>{streamResult.stream?.ratePerSecondVlr || selectedStreamPreset.rate} ◈/sec</strong> • Total Cap: <strong>{streamResult.stream?.totalAmountVlr || 50} ◈ VLR</strong>
                        <br />
                        Recipient: <strong>{streamRecipient}</strong> • Claim Status: <strong>Instant Unilateral Claimable</strong>
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Grid>

              {/* RIGHT PANE: SOCIAL GROUP TAB & BILL SPLITTER */}
              <Grid xs={12} lg={6}>
                <Paper
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: `1.5px solid ${isDark ? 'rgba(245,158,11,0.45)' : 'rgba(245,158,11,0.6)'}`,
                    bgcolor: isDark ? 'rgba(20,14,6,0.94)' : '#FFFFFF',
                    boxShadow: isDark ? '0 12px 32px rgba(245,158,11,0.1)' : '0 6px 20px rgba(0,0,0,0.06)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupsIcon sx={{ color: '#F59E0B', fontSize: '1.4rem' }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Syne", sans-serif' }}>
                        Feeless Social Group Bill-Splitter
                      </Typography>
                    </Box>
                    <Chip
                      label="2.5% Group Cashback"
                      size="small"
                      sx={{ bgcolor: 'rgba(245,158,11,0.15)', color: '#F59E0B', fontFamily: mono, fontWeight: 800, fontSize: '0.68rem' }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.84rem' }}>
                    Create shared tabs for compute clusters, dinners, or hardware racks. Vaelor automatically collects equal micro-shares and credits <strong>2.5% instant cashback</strong> to all participants.
                  </Typography>

                  {/* Group Bill Presets */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 800, display: 'block', mb: 0.8, letterSpacing: '0.05em' }}>
                      GROUP BILL PRESETS
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                      {GROUP_TAB_PRESETS.map((p) => {
                        const isSelected = selectedGroupPreset.title === p.title;
                        return (
                          <Chip
                            key={p.title}
                            label={`${p.title} — ${p.totalAmount} ◈`}
                            clickable
                            onClick={() => setSelectedGroupPreset(p)}
                            sx={{
                              fontFamily: mono,
                              fontWeight: isSelected ? 900 : 700,
                              fontSize: '0.72rem',
                              bgcolor: isSelected ? '#F59E0B' : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
                              color: isSelected ? '#08080B' : theme.palette.text.primary,
                              border: `1px solid ${isSelected ? '#F59E0B' : 'rgba(245,158,11,0.2)'}`
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Bill Split Breakdown Box */}
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2.5,
                      borderRadius: 2,
                      bgcolor: isDark ? '#080502' : '#FFFBEB',
                      border: '1.5px solid rgba(245,158,11,0.3)'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block', fontWeight: 800 }}>
                          TOTAL INVOICE AMOUNT
                        </Typography>
                        <Typography variant="h6" sx={{ fontFamily: mono, fontWeight: 900, color: '#F59E0B' }}>
                          {selectedGroupPreset.totalAmount}.00 ◈ VLR
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block', fontWeight: 800 }}>
                          PER-MEMBER SHARE (4 WAYS)
                        </Typography>
                        <Typography variant="h6" sx={{ fontFamily: mono, fontWeight: 900, color: '#10B981' }}>
                          {groupSplitShare} ◈ each
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#FDE68A' }} />

                    {/* Member split badges */}
                    <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.66rem' }}>
                        Members:
                      </Typography>
                      {groupMembers.map((m) => (
                        <Chip
                          key={m}
                          label={`${m} (${groupSplitShare} ◈)`}
                          size="small"
                          sx={{
                            fontFamily: mono,
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#FEF3C7',
                            color: isDark ? '#FDE68A' : '#92400E'
                          }}
                        />
                      ))}
                    </Box>

                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#34D399', fontSize: '0.68rem', display: 'block', fontWeight: 800, mt: 0.8 }}>
                      ✦ Cashback Reward: +{groupCashbackPerMember} ◈ VLR minted per member (2.5% feeless rebate)
                    </Typography>
                  </Paper>

                  {/* Settle Group Tab Button */}
                  <Button
                    id="vaelor-grouptab-btn"
                    fullWidth
                    variant="contained"
                    onClick={handleSettleGroupTab}
                    disabled={isSettlingGroupTab}
                    startIcon={isSettlingGroupTab ? <CircularProgress size={16} sx={{ color: '#08080B' }} /> : <PieChartIcon />}
                    sx={{
                      bgcolor: '#F59E0B',
                      color: '#08080B',
                      fontWeight: 900,
                      fontFamily: mono,
                      fontSize: '0.82rem',
                      py: 1.2,
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#D97706' },
                      mb: 2
                    }}
                  >
                    {isSettlingGroupTab ? 'SPLITTING & ATTESTING ON LATTICE...' : `🍕 SETTLE GROUP TAB & MINT 2.5% CASHBACK`}
                  </Button>

                  {/* Group Tab Result Card */}
                  {groupTabResult && (
                    <Paper
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(12,24,18,0.9)' : 'rgba(240,253,244,0.95)',
                        border: '1.5px solid #10B981',
                        mt: 'auto'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                        <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.1rem' }} />
                        <Typography sx={{ fontFamily: mono, fontWeight: 900, fontSize: '0.78rem', color: '#10B981' }}>
                          GROUP TAB SETTLED • 2.5% CASHBACK DISTRIBUTED (5/5 BFT)
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.72rem', color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.5 }}>
                        Tab ID: <code>{(groupTabResult.tab?.id || 'tab_2f8e..').slice(0, 16)}</code> • Block: <code>{(groupTabResult.createBlock?.hash || '6cb7..').slice(0, 14)}...</code>
                        <br />
                        Split: <strong>{groupSplitShare} ◈ VLR × 4 members</strong> • Cashback: <strong>+{(selectedGroupPreset.totalAmount * 0.025).toFixed(3)} ◈ total rebate</strong>
                        <br />
                        Status: <strong>OPEN (Organizer Paid • 3 Micro-shares Authorized)</strong> • Gas Fee: <strong>$0.00</strong>
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </RevealOnScroll>

        {/* ==========================================================================
            SECTION: SEEDLESS GUARDIAN RECOVERY, DEAD-MAN'S SWITCH & SHIELDED WORKBENCH
            ========================================================================== */}
        <RevealOnScroll>
          <Box id="vaelor-security-continuity-sim" sx={{ mb: 6 }}>
            <Box sx={{ mb: 3 }}>
              <Typography className="section-kicker">Sovereign Continuity &amp; Privacy</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: '"Syne", sans-serif', mb: 1 }}>
                Seedless Social Recovery, Dead-Man's Switch &amp; Shielded Privacy
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 880, fontSize: '0.94rem' }}>
                Zero seed phrase vulnerability. Recover biometric passkeys via 2-of-3 multi-party social consensus, automate estate continuity via on-chain liveness switches, and settle confidential balances using zero-knowledge Pedersen commitments.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {/* CARD 1: SEEDLESS 2-OF-3 SOCIAL GUARDIAN RECOVERY */}
              <Grid xs={12} md={4}>
                <Paper
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: `1.5px solid ${isDark ? 'rgba(56,189,248,0.45)' : 'rgba(56,189,248,0.6)'}`,
                    bgcolor: isDark ? 'rgba(6,12,20,0.94)' : '#FFFFFF',
                    boxShadow: isDark ? '0 12px 32px rgba(56,189,248,0.1)' : '0 6px 20px rgba(0,0,0,0.06)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LockResetIcon sx={{ color: '#38BDF8', fontSize: '1.4rem' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, fontFamily: '"Syne", sans-serif' }}>
                        2-of-3 Social Recovery
                      </Typography>
                    </Box>
                    <Chip
                      label="Threshold: 2 of 3"
                      size="small"
                      sx={{ bgcolor: 'rgba(56,189,248,0.15)', color: '#38BDF8', fontFamily: mono, fontWeight: 800, fontSize: '0.64rem' }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem', lineHeight: 1.5 }}>
                    Rotate compromised passkeys without seed phrases. Account handle <code>@citizen</code>, balances, and on-lattice credit history remain 100% intact.
                  </Typography>

                  {/* Designated Guardians List */}
                  <Paper
                    sx={{
                      p: 1.5,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: isDark ? '#020408' : '#F0F9FF',
                      border: '1px solid rgba(56,189,248,0.2)'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.62rem', display: 'block', fontWeight: 800, mb: 0.8 }}>
                      DESIGNATED SOCIAL GUARDIANS
                    </Typography>
                    <Stack spacing={0.6}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8' }}>
                          @neal (Founder Core)
                        </Typography>
                        <Chip label="Approved ✓" size="small" sx={{ height: 18, fontSize: '0.6rem', fontFamily: mono, bgcolor: 'rgba(16,185,129,0.15)', color: '#34D399' }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8' }}>
                          @zoth (Compute Node)
                        </Typography>
                        <Chip label="Approved ✓" size="small" sx={{ height: 18, fontSize: '0.6rem', fontFamily: mono, bgcolor: 'rgba(16,185,129,0.15)', color: '#34D399' }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#94A3B8' }}>
                          @passkey_backup_757
                        </Typography>
                        <Chip label="Standby" size="small" sx={{ height: 18, fontSize: '0.6rem', fontFamily: mono, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0', color: '#94A3B8' }} />
                      </Box>
                    </Stack>
                  </Paper>

                  {/* Key Rotation Button */}
                  <Button
                    id="vaelor-guardian-btn"
                    fullWidth
                    variant="contained"
                    onClick={handleGuardianKeyRotation}
                    disabled={isRotatingKey}
                    startIcon={isRotatingKey ? <CircularProgress size={16} sx={{ color: '#08080B' }} /> : <LockResetIcon />}
                    sx={{
                      bgcolor: '#38BDF8',
                      color: '#08080B',
                      fontWeight: 900,
                      fontFamily: mono,
                      fontSize: '0.78rem',
                      py: 1.1,
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#0284C7' },
                      mb: 2
                    }}
                  >
                    {isRotatingKey ? 'ROTATING ON LATTICE...' : `🔐 2-of-3 GUARDIAN KEY ROTATION`}
                  </Button>

                  {/* Recovery Result Card */}
                  {keyRotateResult && (
                    <Paper
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(12,24,18,0.9)' : 'rgba(240,253,244,0.95)',
                        border: '1.5px solid #10B981',
                        mt: 'auto'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.6 }}>
                        <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.0rem' }} />
                        <Typography sx={{ fontFamily: mono, fontWeight: 900, fontSize: '0.74rem', color: '#10B981' }}>
                          NEW KEY ROTATED • BALANCE PRESERVED
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.7rem', color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.5 }}>
                        New Ed25519 Pub: <code>{(keyRotateResult.newPublicKeyHex || '302a30..b02').slice(0, 16)}...</code>
                        <br />
                        Handle: <strong>@citizen (Unchanged)</strong> • Nonce: <strong>#{keyRotateResult.account?.recoveryNonce || 2}</strong>
                        <br />
                        Balance: <strong>{(keyRotateResult.account?.balanceVlr || 10956).toLocaleString()} ◈ VLR</strong> (Zero Seed Loss)
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Grid>

              {/* CARD 2: DEAD-MAN'S SWITCH CONTINUITY & INHERITANCE */}
              <Grid xs={12} md={4}>
                <Paper
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: `1.5px solid ${isDark ? 'rgba(232,121,249,0.45)' : 'rgba(232,121,249,0.6)'}`,
                    bgcolor: isDark ? 'rgba(16,8,20,0.94)' : '#FFFFFF',
                    boxShadow: isDark ? '0 12px 32px rgba(232,121,249,0.1)' : '0 6px 20px rgba(0,0,0,0.06)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FavoriteIcon sx={{ color: '#E879F9', fontSize: '1.4rem' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, fontFamily: '"Syne", sans-serif' }}>
                        Dead-Man's Switch
                      </Typography>
                    </Box>
                    <Chip
                      label="180-Day Inactivity Vault"
                      size="small"
                      sx={{ bgcolor: 'rgba(232,121,249,0.15)', color: '#E879F9', fontFamily: mono, fontWeight: 800, fontSize: '0.64rem' }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem', lineHeight: 1.5 }}>
                    Decentralized estate bequest. If the owner account fails to broadcast on-lattice for 180 days, designated beneficiaries unlock the vault automatically.
                  </Typography>

                  {/* Continuity Plan Specs */}
                  <Paper
                    sx={{
                      p: 1.5,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: isDark ? '#050308' : '#FDF4FF',
                      border: '1px solid rgba(232,121,249,0.2)'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.62rem', display: 'block', fontWeight: 800, mb: 0.8 }}>
                      CONTINUITY BENEFICIARY SPEC
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: '#E879F9' }}>
                        Beneficiary: @neal
                      </Typography>
                      <Chip label="100% Bequest" size="small" sx={{ height: 18, fontSize: '0.6rem', fontFamily: mono, bgcolor: 'rgba(232,121,249,0.15)', color: '#E879F9' }} />
                    </Box>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#64748B', fontSize: '0.66rem', display: 'block' }}>
                      Timer Window: 180 Days • Inactivity Status: <strong>ACTIVE (ARMED)</strong>
                    </Typography>
                  </Paper>

                  {/* Heartbeat Ping Button */}
                  <Button
                    id="vaelor-heartbeat-btn"
                    fullWidth
                    variant="contained"
                    onClick={handlePingHeartbeat}
                    disabled={isPingingHeartbeat}
                    startIcon={isPingingHeartbeat ? <CircularProgress size={16} sx={{ color: '#08080B' }} /> : <FavoriteIcon />}
                    sx={{
                      bgcolor: '#E879F9',
                      color: '#08080B',
                      fontWeight: 900,
                      fontFamily: mono,
                      fontSize: '0.78rem',
                      py: 1.1,
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#D946EF' },
                      mb: 2
                    }}
                  >
                    {isPingingHeartbeat ? 'RESETTING TIMER...' : `💓 PING CONTINUITY HEARTBEAT`}
                  </Button>

                  {/* Heartbeat Result Card */}
                  {heartbeatResult && (
                    <Paper
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(12,24,18,0.9)' : 'rgba(240,253,244,0.95)',
                        border: '1.5px solid #10B981',
                        mt: 'auto'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.6 }}>
                        <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.0rem' }} />
                        <Typography sx={{ fontFamily: mono, fontWeight: 900, fontSize: '0.74rem', color: '#10B981' }}>
                          HEARTBEAT CONFIRMED (180 DAYS RESET)
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.7rem', color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.5 }}>
                        Heartbeat Block: <code>{(heartbeatResult.heartbeatBlock?.hash || '871102..').slice(0, 16)}...</code>
                        <br />
                        Plan: <code>{(heartbeatResult.plan?.id || 'inh_sprig..').slice(0, 16)}</code> • Timer: <strong>180 Days</strong>
                        <br />
                        Unlocks At: <code>{(heartbeatResult.plan?.unlocksAt || new Date(Date.now() + 180 * 86400000).toISOString()).split('T')[0]}</code>
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Grid>

              {/* CARD 3: SHIELDED PEDERSEN COMMITMENT & SELECTIVE VIEW-KEY */}
              <Grid xs={12} md={4}>
                <Paper
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: `1.5px solid ${isDark ? 'rgba(192,132,252,0.45)' : 'rgba(192,132,252,0.6)'}`,
                    bgcolor: isDark ? 'rgba(12,8,22,0.94)' : '#FFFFFF',
                    boxShadow: isDark ? '0 12px 32px rgba(192,132,252,0.1)' : '0 6px 20px rgba(0,0,0,0.06)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VpnKeyIcon sx={{ color: '#C084FC', fontSize: '1.4rem' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, fontFamily: '"Syne", sans-serif' }}>
                        Shielded Pedersen Privacy
                      </Typography>
                    </Box>
                    <Chip
                      label="Zero Plaintext Leak"
                      size="small"
                      sx={{ bgcolor: 'rgba(192,132,252,0.15)', color: '#C084FC', fontFamily: mono, fontWeight: 800, fontSize: '0.64rem' }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem', lineHeight: 1.5 }}>
                    Confidential institutional settlements. Amounts are blinded with Pedersen commitments ($C = rG + vH$), decodable only by selective auditor view-keys.
                  </Typography>

                  {/* Shielded Transfer Specs */}
                  <Paper
                    sx={{
                      p: 1.5,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: isDark ? '#040206' : '#FAF5FF',
                      border: '1px solid rgba(192,132,252,0.2)'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.62rem', display: 'block', fontWeight: 800, mb: 0.8 }}>
                      INSTITUTIONAL SHIELDED PAYLOAD
                    </Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: '#C084FC', mb: 0.4 }}>
                      @citizen → @neal (25.00 ◈ VLR)
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#64748B', fontSize: '0.66rem', display: 'block' }}>
                      Payload: <code>🔒 Encrypted Stealth Payload</code> • Gas: $0.00
                    </Typography>
                  </Paper>

                  {/* Mint Shielded Commitment Button */}
                  <Button
                    id="vaelor-shielded-btn"
                    fullWidth
                    variant="contained"
                    onClick={handleSendShielded}
                    disabled={isSendingShielded}
                    startIcon={isSendingShielded ? <CircularProgress size={16} sx={{ color: '#08080B' }} /> : <VpnKeyIcon />}
                    sx={{
                      bgcolor: '#C084FC',
                      color: '#08080B',
                      fontWeight: 900,
                      fontFamily: mono,
                      fontSize: '0.78rem',
                      py: 1.1,
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#A855F7' },
                      mb: 2
                    }}
                  >
                    {isSendingShielded ? 'BLINDING COMMITMENT...' : `🛡️ MINT SHIELDED COMMITMENT & VIEW KEY`}
                  </Button>

                  {/* Shielded Result Card */}
                  {shieldedResult && (
                    <Paper
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(12,24,18,0.9)' : 'rgba(240,253,244,0.95)',
                        border: '1.5px solid #10B981',
                        mt: 'auto'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.6 }}>
                        <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.0rem' }} />
                        <Typography sx={{ fontFamily: mono, fontWeight: 900, fontSize: '0.74rem', color: '#10B981' }}>
                          PEDERSEN COMMITMENT ATTESTED (5/5 BFT)
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.7rem', color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.5 }}>
                        Commitment: <code>{(shieldedResult.commitment || 'cmt_f06400..').slice(0, 18)}...</code>
                        <br />
                        Auditor View-Key: <code>{(shieldedResult.viewKey || 'vk_0d742b..').slice(0, 18)}...</code>
                        <br />
                        Block: <code>{(shieldedResult.sendBlock?.hash || 'b000c2..').slice(0, 14)}...</code> (0 Plaintext Leak)
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </RevealOnScroll>

        {/* ==========================================================================
            SECTION: AI AGENT M2M BOUNTY, DELEGATED VIRTUAL CARDS & BEARER VOUCHER SIM
            ========================================================================== */}
        <RevealOnScroll>
          <Box id="vaelor-agent-fintech-sim" sx={{ mb: 6 }}>
            <Box sx={{ mb: 3 }}>
              <Typography className="section-kicker">Autonomous Fintech &amp; Agent Economy</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: '"Syne", sans-serif', mb: 1 }}>
                AI M2M Bounties, Delegated Virtual Cards &amp; Offline Bearer Vouchers
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 880, fontSize: '0.94rem' }}>
                Test machine-to-machine smart bounties settled with cryptographic SHA-256 AST proofs, manage spend-capped delegated sub-account virtual cards with 1-click freeze protection, and mint offline NFC/QR bearer vouchers operable without internet connectivity.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {/* Card 1: AI Agent M2M Micro-Contract & Bounty Exchange */}
              <Grid xs={12} lg={4}>
                <Paper
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: `1.5px solid ${gold.border}`,
                    bgcolor: isDark ? '#08080E' : '#FFFFFF',
                    boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.6)' : '0 6px 20px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: gold.wash,
                        border: `1px solid ${gold.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <SmartToyIcon sx={{ color: gold.accent, fontSize: '1.4rem' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Syne", sans-serif', fontSize: '1.05rem', lineHeight: 1.2 }}>
                        M2M Bounty Exchange
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono, fontSize: '0.72rem' }}>
                        BOUNTY_POST • BOUNTY_SETTLE
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '0.85rem', flexGrow: 0 }}>
                    AI agents post machine-to-machine task contracts with deterministic escrow rewards, settled automatically upon verifiable SHA-256 deliverable payload attestation.
                  </Typography>

                  {/* Preset Selector */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 800, display: 'block', mb: 1, letterSpacing: '0.04em' }}>
                      SELECT CONTRACT PRESET
                    </Typography>
                    <Stack spacing={1}>
                      {BOUNTY_PRESETS.map((p) => {
                        const isSelected = selectedBountyPreset.title === p.title;
                        return (
                          <Paper
                            key={p.title}
                            onClick={() => setSelectedBountyPreset(p)}
                            sx={{
                              p: 1.2,
                              borderRadius: 2,
                              cursor: 'pointer',
                              border: `1px solid ${isSelected ? gold.accent : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
                              bgcolor: isSelected ? (isDark ? 'rgba(212,175,55,0.1)' : '#FEF9C3') : 'transparent',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: gold.accent,
                                bgcolor: isDark ? 'rgba(212,175,55,0.06)' : '#FEF9C3'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem' }}>
                                {p.title}
                              </Typography>
                              <Chip
                                label={`${p.reward} ◈`}
                                size="small"
                                sx={{
                                  fontFamily: mono,
                                  fontWeight: 900,
                                  bgcolor: isSelected ? gold.accent : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'),
                                  color: isSelected ? '#08080B' : theme.palette.text.primary,
                                  fontSize: '0.72rem',
                                  height: 20
                                }}
                              />
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', display: 'block', mt: 0.3 }}>
                              {p.description}
                            </Typography>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Box>

                  {/* Contract Spec Box */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#F8FAFC',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      mb: 2.5
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.72rem' }}>
                        Poster:
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: gold.accent, fontSize: '0.72rem' }}>
                        @neal (Founder Core)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.72rem' }}>
                        Settles To:
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: '#10B981', fontSize: '0.72rem' }}>
                        @zoth (Autonomous Agent)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.72rem' }}>
                        Required Proof:
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: '#38BDF8', fontSize: '0.72rem' }}>
                        {selectedBountyPreset.proofType}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    id="vaelor-bounty-btn"
                    variant="contained"
                    fullWidth
                    onClick={handlePostAndSettleBounty}
                    disabled={isPostingBounty}
                    startIcon={isPostingBounty ? <CircularProgress size={16} color="inherit" /> : <SmartToyIcon />}
                    sx={{
                      py: 1.2,
                      fontWeight: 900,
                      fontFamily: mono,
                      fontSize: '0.82rem',
                      borderRadius: 2,
                      bgcolor: gold.accent,
                      color: '#08080B',
                      boxShadow: `0 4px 16px ${gold.glow}`,
                      '&:hover': {
                        bgcolor: '#E5C158',
                        boxShadow: `0 6px 20px ${gold.glow}`
                      },
                      mt: 'auto'
                    }}
                  >
                    {isPostingBounty ? 'Executing M2M Settle...' : '🤖 Post & Settle M2M Bounty'}
                  </Button>

                  {/* Bounty Execution Result */}
                  {bountyResult && (
                    <Paper
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(16,185,129,0.08)' : '#ECFDF5',
                        border: '1px solid rgba(16,185,129,0.3)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                        <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.1rem' }} />
                        <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 900, color: '#10B981', fontSize: '0.76rem' }}>
                          M2M CONTRACT SETTLED • 0 FEE
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.7rem', color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.5 }}>
                        Bounty ID: <code>{bountyResult.bounty?.id || 'bty_...'}</code>
                        <br />
                        Proof: <code>{(bountyResult.bounty?.deliverableProofHash || 'prf_ef17c4..').slice(0, 18)}...</code> (AST Verified)
                        <br />
                        Feeless Reward: <code>{bountyResult.bounty?.rewardVlr || selectedBountyPreset.reward} ◈ VLR</code> → <code>@zoth</code>
                        <br />
                        BFT Quorum: <code>5/5 Validators Finalized</code>
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Grid>

              {/* Card 2: Delegated AI & Team Virtual Cards */}
              <Grid xs={12} lg={4}>
                <Paper
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: `1.5px solid ${gold.border}`,
                    bgcolor: isDark ? '#08080E' : '#FFFFFF',
                    boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.6)' : '0 6px 20px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: gold.wash,
                        border: `1px solid ${gold.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CreditCardIcon sx={{ color: gold.accent, fontSize: '1.4rem' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Syne", sans-serif', fontSize: '1.05rem', lineHeight: 1.2 }}>
                        Delegated Virtual Cards
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono, fontSize: '0.72rem' }}>
                        SUBACCOUNT_CREATE • SUBACCOUNT_SPEND
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem', flexGrow: 0 }}>
                    Issue cryptographic child sub-accounts with strict daily spend allowances, policy rules, and instant 1-click sovereign freeze controls for autonomous agents.
                  </Typography>

                  {/* Virtual Card Graphic */}
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: `1.5px solid ${isVirtualCardFrozen ? 'rgba(239,68,68,0.5)' : gold.border}`,
                      background: isVirtualCardFrozen
                        ? 'linear-gradient(135deg, #1e1014 0%, #11080b 100%)'
                        : isDark
                          ? 'linear-gradient(135deg, #13141f 0%, #0d0e14 100%)'
                          : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
                      boxShadow: isVirtualCardFrozen
                        ? '0 8px 24px rgba(239,68,68,0.2)'
                        : `0 8px 24px ${gold.wash}`,
                      mb: 2,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                          DELEGATED VIRTUAL CARD
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, fontFamily: '"Syne", sans-serif', fontSize: '0.9rem', color: theme.palette.text.primary }}>
                          {virtualCardData.label}
                        </Typography>
                      </Box>
                      <Chip
                        label={isVirtualCardFrozen ? 'FROZEN' : 'ACTIVE'}
                        size="small"
                        icon={isVirtualCardFrozen ? <AcUnitIcon sx={{ fontSize: '0.85rem !important' }} /> : <CheckCircleIcon sx={{ fontSize: '0.85rem !important' }} />}
                        sx={{
                          fontFamily: mono,
                          fontWeight: 900,
                          fontSize: '0.68rem',
                          height: 22,
                          bgcolor: isVirtualCardFrozen ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                          color: isVirtualCardFrozen ? '#EF4444' : '#10B981',
                          border: `1px solid ${isVirtualCardFrozen ? '#EF4444' : '#10B981'}`
                        }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700, fontSize: '0.82rem', color: gold.accent, mb: 1.2 }}>
                      <code>sub_hermes_ai_01</code>
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem', display: 'block' }}>
                          Parent Handle
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.78rem' }}>
                          @zoth
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem', display: 'block' }}>
                          Daily Limit / Remaining
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: theme.palette.text.primary, fontSize: '0.78rem' }}>
                          {virtualCardData.remainingTodayVlr.toFixed(2)} ◈ / {virtualCardData.dailyLimitVlr.toFixed(2)} ◈
                        </Typography>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={virtualCardData.utilizationPct}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: isVirtualCardFrozen ? '#EF4444' : virtualCardData.utilizationPct > 80 ? '#F59E0B' : '#10B981'
                          }
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.65rem' }}>
                          Utilization: {virtualCardData.utilizationPct}%
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.65rem' }}>
                          Spent Today: {virtualCardData.spentTodayVlr.toFixed(2)} ◈
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  {/* Freeze Toggle & Spend Control */}
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleToggleVirtualCardFreeze}
                      startIcon={isVirtualCardFrozen ? <WhatshotIcon sx={{ color: '#F59E0B' }} /> : <AcUnitIcon sx={{ color: '#38BDF8' }} />}
                      sx={{
                        flex: 1,
                        fontFamily: mono,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        py: 0.8,
                        borderColor: isVirtualCardFrozen ? '#F59E0B' : 'rgba(56,189,248,0.5)',
                        color: isVirtualCardFrozen ? '#F59E0B' : '#38BDF8',
                        '&:hover': {
                          borderColor: isVirtualCardFrozen ? '#F59E0B' : '#38BDF8',
                          bgcolor: isVirtualCardFrozen ? 'rgba(245,158,11,0.08)' : 'rgba(56,189,248,0.08)'
                        }
                      }}
                    >
                      {isVirtualCardFrozen ? 'Unfreeze Card' : 'Instant Freeze'}
                    </Button>
                    <TextField
                      size="small"
                      label="Spend (◈ VLR)"
                      value={virtualCardSpendAmount}
                      onChange={(e) => setVirtualCardSpendAmount(e.target.value)}
                      disabled={isVirtualCardFrozen}
                      sx={{
                        width: 130,
                        '& input': { fontFamily: mono, fontSize: '0.82rem', fontWeight: 700 }
                      }}
                    />
                  </Box>

                  <Button
                    id="vaelor-subaccount-btn"
                    variant="contained"
                    fullWidth
                    onClick={handleAuthorizeVirtualCardSpend}
                    disabled={isAuthorizingVirtualCard || isVirtualCardFrozen}
                    startIcon={isAuthorizingVirtualCard ? <CircularProgress size={16} color="inherit" /> : <CreditCardIcon />}
                    sx={{
                      py: 1.2,
                      fontWeight: 900,
                      fontFamily: mono,
                      fontSize: '0.82rem',
                      borderRadius: 2,
                      bgcolor: isVirtualCardFrozen ? 'rgba(255,255,255,0.1)' : gold.accent,
                      color: isVirtualCardFrozen ? 'text.disabled' : '#08080B',
                      boxShadow: isVirtualCardFrozen ? 'none' : `0 4px 16px ${gold.glow}`,
                      '&:hover': {
                        bgcolor: '#E5C158',
                        boxShadow: `0 6px 20px ${gold.glow}`
                      },
                      mt: 'auto'
                    }}
                  >
                    {isAuthorizingVirtualCard ? 'Authorizing Spend...' : '💳 Authorize Capped Virtual Card Spend'}
                  </Button>

                  {/* Virtual Card Spend Result */}
                  {virtualCardSpendResult && (
                    <Paper
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(16,185,129,0.08)' : '#ECFDF5',
                        border: '1px solid rgba(16,185,129,0.3)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                        <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.1rem' }} />
                        <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 900, color: '#10B981', fontSize: '0.76rem' }}>
                          SPEND AUTHORIZED • SUBACCOUNT
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.7rem', color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.5 }}>
                        Authorized: <code>{virtualCardSpendAmount} ◈ VLR</code> → <code>@sprig</code>
                        <br />
                        Remaining Allowance: <code>{virtualCardData.remainingTodayVlr.toFixed(2)} ◈</code> / <code>50.00 ◈ VLR</code>
                        <br />
                        Policy: <code>Category 'AI & Compute' Verified</code>
                        <br />
                        Status: <code>FINALIZED_BFT (0 gas fee)</code>
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Grid>

              {/* Card 3: Offline Tap-to-Pay Cryptographic Bearer Voucher */}
              <Grid xs={12} lg={4}>
                <Paper
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: `1.5px solid ${gold.border}`,
                    bgcolor: isDark ? '#08080E' : '#FFFFFF',
                    boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.6)' : '0 6px 20px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: gold.wash,
                        border: `1px solid ${gold.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <ConfirmationNumberIcon sx={{ color: gold.accent, fontSize: '1.4rem' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Syne", sans-serif', fontSize: '1.05rem', lineHeight: 1.2 }}>
                        Offline Tap-to-Pay Voucher
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono, fontSize: '0.72rem' }}>
                        VOUCHER_ISSUE • NFC / QR BEARER
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '0.85rem', flexGrow: 0 }}>
                    Mint cryptographic offline bearer vouchers redeemable via NFC tap or QR scan. Protected with an optional SHA-256 PIN digest operable without internet.
                  </Typography>

                  {/* Voucher Form Fields */}
                  <Stack spacing={2} sx={{ mb: 2.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Voucher Face Value (◈ VLR)"
                      value={voucherAmount}
                      onChange={(e) => setVoucherAmount(e.target.value)}
                      sx={{
                        '& input': { fontFamily: mono, fontSize: '0.82rem', fontWeight: 700 }
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <TextField
                        size="small"
                        label="PIN Lock Digest"
                        value={voucherPin}
                        onChange={(e) => setVoucherPin(e.target.value)}
                        sx={{
                          width: '45%',
                          '& input': { fontFamily: mono, fontSize: '0.82rem', fontWeight: 700 }
                        }}
                      />
                      <TextField
                        size="small"
                        label="Memo / Purpose"
                        value={voucherMemo}
                        onChange={(e) => setVoucherMemo(e.target.value)}
                        sx={{
                          width: '55%',
                          '& input': { fontFamily: mono, fontSize: '0.82rem' }
                        }}
                      />
                    </Box>
                  </Stack>

                  {/* Offline Capability Banner */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#F8FAFC',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      mb: 2.5
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <NfcIcon sx={{ color: gold.accent, fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent, fontSize: '0.72rem' }}>
                        AIR-GAPPED TAP-TO-PAY BEARER PROTOCOL
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', display: 'block', lineHeight: 1.4 }}>
                      Issuer balance is locked into a bearer secret at issuance. Redeemable instantly over Bluetooth LE, NFC, or QR mesh.
                    </Typography>
                  </Box>

                  <Button
                    id="vaelor-voucher-btn"
                    variant="contained"
                    fullWidth
                    onClick={handleMintOfflineVoucher}
                    disabled={isMintingVoucher}
                    startIcon={isMintingVoucher ? <CircularProgress size={16} color="inherit" /> : <ConfirmationNumberIcon />}
                    sx={{
                      py: 1.2,
                      fontWeight: 900,
                      fontFamily: mono,
                      fontSize: '0.82rem',
                      borderRadius: 2,
                      bgcolor: gold.accent,
                      color: '#08080B',
                      boxShadow: `0 4px 16px ${gold.glow}`,
                      '&:hover': {
                        bgcolor: '#E5C158',
                        boxShadow: `0 6px 20px ${gold.glow}`
                      },
                      mt: 'auto'
                    }}
                  >
                    {isMintingVoucher ? 'Minting Voucher...' : '🎫 Mint Offline NFC / QR Bearer Voucher'}
                  </Button>

                  {/* Voucher Pass Result */}
                  {voucherResult && (
                    <Paper
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(212,175,55,0.08)' : '#FEF9C3',
                        border: `1px solid ${gold.border}`
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                        <QrCodeIcon sx={{ color: gold.accent, fontSize: '1.1rem' }} />
                        <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 900, color: gold.accent, fontSize: '0.76rem' }}>
                          OFFLINE BEARER VOUCHER MINTED
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.7rem', color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.5 }}>
                        Voucher Code: <code>{voucherResult.voucher?.id || 'vch_...'}</code>
                        <br />
                        URI: <code>{(voucherResult.voucher?.uri || 'vaelor://voucher?id=vch_..').slice(0, 36)}...</code>
                        <br />
                        PIN Lock Digest: <code>{(voucherResult.voucher?.pinHash || voucherResult.voucher?.secretHash || 'pin_4d898..').slice(0, 18)}...</code>
                        <br />
                        Redemption: <code>NFC / QR Ready (72-Hr Expiry • Offline Active)</code>
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </RevealOnScroll>

        {/* ==========================================================================
            SECTION: CROSS-CHAIN ATOMIC BRIDGE, CREATOR TIP JAR & LOYALTY MULTIPLIER SIM
            ========================================================================== */}
        <RevealOnScroll>
          <Box id="vaelor-bridge-patronage-sim" sx={{ mb: 6 }}>
            <Box sx={{ mb: 3 }}>
              <Typography className="section-kicker">Cross-Chain &amp; Creator Economy</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: '"Syne", sans-serif', mb: 1 }}>
                Atomic Bridge, Feeless Creator Tip Jar &amp; Loyalty Cashback Ladder
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 880, fontSize: '0.94rem' }}>
                Execute zero-slippage cross-chain swaps between ◈ VLR and USD, SOL, or BTC; send feeless micro-tips to open-source creators with dynamic supporter badges; and boost your wallet to the 5.00% Sovereign Diamond cashback tier.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {/* Card 1: Cross-Chain & Fiat Atomic Settlement Bridge */}
              <Grid xs={12} lg={4}>
                <Paper
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: `1.5px solid ${gold.border}`,
                    bgcolor: isDark ? '#08080E' : '#FFFFFF',
                    boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.6)' : '0 6px 20px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: gold.wash,
                        border: `1px solid ${gold.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CurrencyExchangeIcon sx={{ color: gold.accent, fontSize: '1.4rem' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Syne", sans-serif', fontSize: '1.05rem', lineHeight: 1.2 }}>
                        Atomic Cross-Chain Bridge
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono, fontSize: '0.72rem' }}>
                        ◈ VLR ↔ USD / SOL / BTC
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '0.85rem', flexGrow: 0 }}>
                    Instant bidirectional settlement across fiat USD, Solana DePay, and Bitcoin rails with 0.00% spread guarantee for Zoth ecosystem accounts.
                  </Typography>

                  {/* Asset Pair Presets */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 800, display: 'block', mb: 1, letterSpacing: '0.04em' }}>
                      SELECT SETTLEMENT PAIR
                    </Typography>
                    <Stack spacing={1}>
                      {BRIDGE_PRESETS.map((p) => {
                        const isSelected = selectedBridgePreset.label === p.label;
                        return (
                          <Paper
                            key={p.label}
                            onClick={() => setSelectedBridgePreset(p)}
                            sx={{
                              p: 1.2,
                              borderRadius: 2,
                              cursor: 'pointer',
                              border: `1px solid ${isSelected ? gold.accent : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
                              bgcolor: isSelected ? (isDark ? 'rgba(212,175,55,0.1)' : '#FEF9C3') : 'transparent',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: gold.accent,
                                bgcolor: isDark ? 'rgba(212,175,55,0.06)' : '#FEF9C3'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem' }}>
                                {p.label}
                              </Typography>
                              <Chip
                                label="0.00% SPREAD"
                                size="small"
                                sx={{
                                  fontFamily: mono,
                                  fontWeight: 900,
                                  bgcolor: isSelected ? gold.accent : (isDark ? 'rgba(16,185,129,0.15)' : '#DCFCE7'),
                                  color: isSelected ? '#08080B' : '#10B981',
                                  fontSize: '0.68rem',
                                  height: 20
                                }}
                              />
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', display: 'block', mt: 0.3 }}>
                              {p.desc}
                            </Typography>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Box>

                  {/* Bridge Specs Box */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#F8FAFC',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      mb: 2.5
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.72rem' }}>
                        Account Handle:
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: gold.accent, fontSize: '0.72rem' }}>
                        @zoth (Sovereign Prime)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.72rem' }}>
                        Protocol Spread:
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: '#10B981', fontSize: '0.72rem' }}>
                        0.00% (Guaranteed Zero Slippage)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.72rem' }}>
                        Execution Guarantee:
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: '#38BDF8', fontSize: '0.72rem' }}>
                        HTLC Atomic Hash-Lock • 0 Gas
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    id="vaelor-bridge-btn"
                    variant="contained"
                    fullWidth
                    onClick={handleExecuteBridgeSwap}
                    disabled={isExecutingBridgeSwap}
                    startIcon={isExecutingBridgeSwap ? <CircularProgress size={16} color="inherit" /> : <CurrencyExchangeIcon />}
                    sx={{
                      py: 1.2,
                      fontWeight: 900,
                      fontFamily: mono,
                      fontSize: '0.82rem',
                      borderRadius: 2,
                      bgcolor: gold.accent,
                      color: '#08080B',
                      boxShadow: `0 4px 16px ${gold.glow}`,
                      '&:hover': {
                        bgcolor: '#E5C158',
                        boxShadow: `0 6px 20px ${gold.glow}`
                      },
                      mt: 'auto'
                    }}
                  >
                    {isExecutingBridgeSwap ? 'Executing Swap...' : '🌉 Execute Atomic Cross-Chain Swap'}
                  </Button>

                  {/* Bridge Swap Result */}
                  {bridgeSwapResult && (
                    <Paper
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(16,185,129,0.08)' : '#ECFDF5',
                        border: '1px solid rgba(16,185,129,0.3)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                        <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.1rem' }} />
                        <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 900, color: '#10B981', fontSize: '0.76rem' }}>
                          ATOMIC SWAP EXECUTED • 0% SPREAD
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.7rem', color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.5 }}>
                        Swap ID: <code>{bridgeSwapResult.swap?.id || 'swp_...'}</code>
                        <br />
                        Exchanged: <code>{selectedBridgePreset.fromAmount} ◈ VLR</code> ➔ <code>{selectedBridgePreset.toAmount} {selectedBridgePreset.toAsset}</code>
                        <br />
                        Spread: <code>0.00% Zero-Slippage Guaranteed</code>
                        <br />
                        Settlement: <code>{(bridgeSwapResult.swap?.settlementHash || bridgeSwapResult.block?.hash || 'pi_atomic_71a0..').slice(0, 18)}...</code>
                        <br />
                        Quorum: <code>5/5 Validators BFT Finalized</code>
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Grid>

              {/* Card 2: Feeless Creator Tip Jar & Patronage Badges */}
              <Grid xs={12} lg={4}>
                <Paper
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: `1.5px solid ${gold.border}`,
                    bgcolor: isDark ? '#08080E' : '#FFFFFF',
                    boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.6)' : '0 6px 20px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: gold.wash,
                        border: `1px solid ${gold.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <LocalCafeIcon sx={{ color: gold.accent, fontSize: '1.4rem' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Syne", sans-serif', fontSize: '1.05rem', lineHeight: 1.2 }}>
                        Feeless Creator Tip Jar
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono, fontSize: '0.72rem' }}>
                        TIP_JAR_SEND • PATRONAGE BADGES
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem', flexGrow: 0 }}>
                    Support open-source builders and public AI nodes directly with $0.00 gas fees. Automatically mints an on-chain Patronage Badge and disburses instant cashback.
                  </Typography>

                  {/* Creator Selection */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 800, display: 'block', mb: 0.8, letterSpacing: '0.04em' }}>
                      SELECT CREATOR TARGET
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {TIP_TARGETS.map((t) => {
                        const isSelected = selectedTipTarget.handle === t.handle;
                        return (
                          <Chip
                            key={t.handle}
                            label={`${t.handle} (${t.slug})`}
                            clickable
                            onClick={() => setSelectedTipTarget(t)}
                            sx={{
                              fontFamily: mono,
                              fontWeight: isSelected ? 900 : 600,
                              fontSize: '0.72rem',
                              bgcolor: isSelected ? gold.accent : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
                              color: isSelected ? '#08080B' : theme.palette.text.primary,
                              border: `1px solid ${isSelected ? gold.accent : 'rgba(212,175,55,0.2)'}`
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Patronage Tier Buttons */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 800, display: 'block', mb: 0.8, letterSpacing: '0.04em' }}>
                      SELECT PATRONAGE TIER
                    </Typography>
                    <Stack spacing={1}>
                      {TIP_TIERS.map((tier) => {
                        const isSelected = selectedTipTier.tier === tier.tier;
                        return (
                          <Paper
                            key={tier.tier}
                            onClick={() => setSelectedTipTier(tier)}
                            sx={{
                              p: 1.2,
                              borderRadius: 2,
                              cursor: 'pointer',
                              border: `1px solid ${isSelected ? gold.accent : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
                              bgcolor: isSelected ? (isDark ? 'rgba(212,175,55,0.1)' : '#FEF9C3') : 'transparent',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: gold.accent,
                                bgcolor: isDark ? 'rgba(212,175,55,0.06)' : '#FEF9C3'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem' }}>
                                {tier.label}
                              </Typography>
                              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: '#10B981', fontSize: '0.72rem' }}>
                                +{(tier.amount * 0.025).toFixed(3)} ◈ Rebate
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block', mt: 0.2 }}>
                              {tier.desc}
                            </Typography>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Box>

                  <Button
                    id="vaelor-tipjar-btn"
                    variant="contained"
                    fullWidth
                    onClick={handleSendCreatorTip}
                    disabled={isSendingCreatorTip}
                    startIcon={isSendingCreatorTip ? <CircularProgress size={16} color="inherit" /> : <LocalCafeIcon />}
                    sx={{
                      py: 1.2,
                      fontWeight: 900,
                      fontFamily: mono,
                      fontSize: '0.82rem',
                      borderRadius: 2,
                      bgcolor: gold.accent,
                      color: '#08080B',
                      boxShadow: `0 4px 16px ${gold.glow}`,
                      '&:hover': {
                        bgcolor: '#E5C158',
                        boxShadow: `0 6px 20px ${gold.glow}`
                      },
                      mt: 'auto'
                    }}
                  >
                    {isSendingCreatorTip ? 'Disbursing Tip...' : '☕ Send Feeless Creator Tip'}
                  </Button>

                  {/* Creator Tip Result */}
                  {creatorTipResult && (
                    <Paper
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(212,175,55,0.08)' : '#FEF9C3',
                        border: `1px solid ${gold.border}`
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                        <EmojiEventsIcon sx={{ color: gold.accent, fontSize: '1.1rem' }} />
                        <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 900, color: gold.accent, fontSize: '0.76rem' }}>
                          PATRONAGE BADGE MINTED • 0 GAS
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.7rem', color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.5 }}>
                        Tip ID: <code>{creatorTipResult.tip?.id || 'tip_...'}</code>
                        <br />
                        Patronage Badge: <strong>{creatorTipResult.badgeEmoji || selectedTipTier.emoji} {creatorTipResult.badge || selectedTipTier.badge}</strong>
                        <br />
                        Recipient: <code>{selectedTipTarget.handle}</code> ({selectedTipTier.amount} ◈ VLR)
                        <br />
                        Cashback Rebate: <code>+{(creatorTipResult.cashbackVlr || (selectedTipTier.amount * 0.025)).toFixed(4)} ◈ VLR (2.50%)</code>
                        <br />
                        Status: <code>5/5 Validators Finalized (0 gas fee)</code>
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Grid>

              {/* Card 3: Sovereign Consumer Loyalty & Dynamic Cashback Multiplier */}
              <Grid xs={12} lg={4}>
                <Paper
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: `1.5px solid ${gold.border}`,
                    bgcolor: isDark ? '#08080E' : '#FFFFFF',
                    boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.6)' : '0 6px 20px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: gold.wash,
                        border: `1px solid ${gold.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <DiamondIcon sx={{ color: gold.accent, fontSize: '1.4rem' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Syne", sans-serif', fontSize: '1.05rem', lineHeight: 1.2 }}>
                        Loyalty Cashback Ladder
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono, fontSize: '0.72rem' }}>
                        2.5% → 5.0% DYNAMIC MULTIPLIER
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem', flexGrow: 0 }}>
                    Climb the sovereign consumer loyalty ladder to scale from 2.50% base cashback up to the 5.00% Diamond tier across all merchant POS orders and creator tips.
                  </Typography>

                  {/* 4-Tier Ladder Visual */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 800, display: 'block', mb: 1, letterSpacing: '0.04em' }}>
                      CASHBACK TIER LADDER
                    </Typography>
                    <Stack spacing={1}>
                      {LOYALTY_TIERS.map((tier) => {
                        const isDiamond = tier.id === 'SOVEREIGN_DIAMOND';
                        return (
                          <Box
                            key={tier.id}
                            sx={{
                              p: 1.2,
                              borderRadius: 2,
                              border: `1.5px solid ${isDiamond ? gold.accent : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
                              bgcolor: isDiamond ? (isDark ? 'rgba(212,175,55,0.12)' : '#FEF9C3') : 'transparent',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ fontSize: '1.0rem' }}>
                                {isDiamond ? '💎' : tier.id === 'GOLD' ? '🥇' : tier.id === 'SILVER' ? '🥈' : '🥉'}
                              </Typography>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.8rem', lineHeight: 1.2 }}>
                                  {tier.name.replace('_', ' ')}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                                  {tier.desc}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label={tier.pct}
                              size="small"
                              sx={{
                                fontFamily: mono,
                                fontWeight: 900,
                                bgcolor: isDiamond ? gold.accent : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'),
                                color: isDiamond ? '#08080B' : theme.palette.text.primary,
                                fontSize: '0.74rem',
                                height: 22
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>

                  {/* Active Wallet Callout */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#F8FAFC',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      mb: 2.5
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.72rem' }}>
                        Active Wallet:
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: gold.accent, fontSize: '0.72rem' }}>
                        @citizen (Passkey Ready)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.72rem' }}>
                        Current Multiplier:
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#10B981', fontSize: '0.72rem' }}>
                        5.00% SOVEREIGN_DIAMOND
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    id="vaelor-loyalty-btn"
                    variant="contained"
                    fullWidth
                    onClick={handleBoostLoyaltyTier}
                    disabled={isBoostingLoyalty}
                    startIcon={isBoostingLoyalty ? <CircularProgress size={16} color="inherit" /> : <DiamondIcon />}
                    sx={{
                      py: 1.2,
                      fontWeight: 900,
                      fontFamily: mono,
                      fontSize: '0.82rem',
                      borderRadius: 2,
                      bgcolor: gold.accent,
                      color: '#08080B',
                      boxShadow: `0 4px 16px ${gold.glow}`,
                      '&:hover': {
                        bgcolor: '#E5C158',
                        boxShadow: `0 6px 20px ${gold.glow}`
                      },
                      mt: 'auto'
                    }}
                  >
                    {isBoostingLoyalty ? 'Boosting Tier...' : '💎 Boost Loyalty Cashback Tier'}
                  </Button>

                  {/* Loyalty Boost Result */}
                  {loyaltyBoostResult && (
                    <Paper
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(16,185,129,0.08)' : '#ECFDF5',
                        border: '1px solid rgba(16,185,129,0.3)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                        <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.1rem' }} />
                        <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 900, color: '#10B981', fontSize: '0.76rem' }}>
                          LOYALTY TIER BOOSTED • DIAMOND ACTIVE
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.7rem', color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.5 }}>
                        Active Wallet: <code>{loyaltyBoostResult.handle || '@citizen'}</code>
                        <br />
                        Tier Status: <strong>💎 SOVEREIGN_DIAMOND (5.00% Max Cashback)</strong>
                        <br />
                        Rate Multiplier: <code>500 bps (2x Base Tier)</code>
                        <br />
                        Quorum Attestation: <code>5/5 Validators BFT Finalized</code>
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </RevealOnScroll>

        {/* ==========================================================================
            SECTION: PROGRAMMABLE MERCHANT FX TREASURY AUTO-SWEEP SIMULATOR (#vaelor-merchant-fx-sim)
            ========================================================================== */}
        <RevealOnScroll>
          <Box id="vaelor-merchant-fx-sim" sx={{ mb: 6 }}>
            <Box sx={{ mb: 3 }}>
              <Typography className="section-kicker">Treasury & Merchant Automation</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: '"Syne", sans-serif', mb: 1 }}>
                Programmable Merchant FX Treasury Auto-Sweep Simulator
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 880, fontSize: '0.94rem' }}>
                Zero-spread (0.00% FX fee) real-time treasury allocation. Merchants automatically split incoming customer ◈ VLR payments across 1:1 USD Reserves, 8.5% APY Staked Savings Vaults, and Liquid VLR micro-chains without intermediary fees or delayed bank clearing.
              </Typography>
            </Box>

            <Paper
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: 3,
                border: `1.5px solid ${gold.border}`,
                bgcolor: isDark ? '#08080E' : '#FFFFFF',
                boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.6)' : '0 6px 20px rgba(0,0,0,0.06)'
              }}
            >
              {/* Preset Merchant Policies Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 800, display: 'block', mb: 1.2, letterSpacing: '0.05em' }}>
                  SELECT MERCHANT TREASURY POLICY PRESET
                </Typography>
                <Grid container spacing={2}>
                  {MERCHANT_FX_PRESETS.map((m) => {
                    const isSelected = selectedMerchantFx.handle === m.handle;
                    return (
                      <Grid xs={12} sm={4} key={m.handle}>
                        <Paper
                          onClick={() => {
                            setSelectedMerchantFx(m);
                            setFxCheckoutAmount(m.defaultAmount.toFixed(2));
                            setFxCheckoutMemo(m.memo);
                          }}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            cursor: 'pointer',
                            border: `1.5px solid ${isSelected ? '#FFD700' : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0')}`,
                            bgcolor: isSelected ? (isDark ? 'rgba(212,175,55,0.12)' : 'rgba(212,175,55,0.08)') : (isDark ? '#05070B' : '#F8FAFC'),
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: '#FFD700',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography sx={{ fontFamily: mono, fontWeight: 900, color: isSelected ? '#FFD700' : theme.palette.text.primary, fontSize: '0.9rem' }}>
                              {m.handle}
                            </Typography>
                            <Chip
                              label={m.badge}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                fontFamily: mono,
                                bgcolor: isSelected ? '#FFD700' : 'rgba(255,255,255,0.08)',
                                color: isSelected ? '#08080B' : '#94A3B8'
                              }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary, mb: 1, fontSize: '0.74rem' }}>
                            {m.name}
                          </Typography>
                          <Chip
                            label={m.split.label}
                            size="small"
                            sx={{
                              width: '100%',
                              fontFamily: mono,
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              bgcolor: isSelected ? 'rgba(56,189,248,0.2)' : 'rgba(56,189,248,0.1)',
                              color: '#38BDF8',
                              border: '1px solid rgba(56,189,248,0.3)'
                            }}
                          />
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

              {/* Checkout Interactive Workbench */}
              <Grid container spacing={3}>
                {/* Left Column: Input Form & Split Allocation Preview */}
                <Grid xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      bgcolor: isDark ? '#05070B' : '#F8FAFC',
                      border: '1px solid rgba(255,255,255,0.08)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CurrencyExchangeIcon sx={{ color: '#FFD700', fontSize: '1.2rem' }} />
                        <Typography sx={{ fontFamily: mono, fontWeight: 900, fontSize: '0.92rem', color: theme.palette.text.primary }}>
                          Point-of-Sale Checkout Simulator
                        </Typography>
                      </Box>

                      <Stack spacing={2} sx={{ mb: 2.5 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#080C14' : '#FFFFFF', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: mono, display: 'block', fontSize: '0.68rem' }}>
                            BUYER WALLET
                          </Typography>
                          <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.84rem', color: '#10B981' }}>
                            @citizen (Sovereign Demo Wallet • Passkey Ready)
                          </Typography>
                        </Box>

                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#080C14' : '#FFFFFF', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: mono, display: 'block', fontSize: '0.68rem' }}>
                            SETTLEMENT MERCHANT
                          </Typography>
                          <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.84rem', color: '#38BDF8' }}>
                            {selectedMerchantFx.handle} ({selectedMerchantFx.name})
                          </Typography>
                        </Box>

                        <TextField
                          label="Payment Amount (◈ VLR)"
                          type="number"
                          size="small"
                          fullWidth
                          value={fxCheckoutAmount}
                          onChange={(e) => setFxCheckoutAmount(e.target.value)}
                          InputProps={{
                            sx: { fontFamily: mono, fontWeight: 800, fontSize: '0.9rem' }
                          }}
                          InputLabelProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
                        />

                        <TextField
                          label="Invoice Memo / Reference"
                          size="small"
                          fullWidth
                          value={fxCheckoutMemo}
                          onChange={(e) => setFxCheckoutMemo(e.target.value)}
                          InputProps={{
                            sx: { fontFamily: mono, fontSize: '0.82rem' }
                          }}
                          InputLabelProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
                        />
                      </Stack>

                      {/* Split Allocation Preview Cards */}
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 800, display: 'block', mb: 1, letterSpacing: '0.04em' }}>
                        REAL-TIME AUTO-SWEEP ALLOCATION (0.00% SPREAD)
                      </Typography>
                      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                        <Grid xs={4}>
                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(16,185,129,0.08)' : '#ECFDF5', border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ fontFamily: mono, color: '#10B981', fontWeight: 800, fontSize: '0.64rem', display: 'block' }}>
                              1:1 USD RESERVE ({selectedMerchantFx.split.usdPct}%)
                            </Typography>
                            <Typography sx={{ fontFamily: mono, fontWeight: 900, color: '#10B981', fontSize: '0.88rem', mt: 0.3 }}>
                              ${((parseFloat(fxCheckoutAmount) || 0) * (selectedMerchantFx.split.usdPct / 100)).toFixed(2)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.58rem' }}>
                              Instant Fiat
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid xs={4}>
                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(212,175,55,0.08)' : '#FEFCE8', border: '1px solid rgba(212,175,55,0.3)', textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ fontFamily: mono, color: '#D4AF37', fontWeight: 800, fontSize: '0.64rem', display: 'block' }}>
                              8.5% APY VAULT ({selectedMerchantFx.split.vaultStakePct}%)
                            </Typography>
                            <Typography sx={{ fontFamily: mono, fontWeight: 900, color: '#D4AF37', fontSize: '0.88rem', mt: 0.3 }}>
                              ◈ {((parseFloat(fxCheckoutAmount) || 0) * (selectedMerchantFx.split.vaultStakePct / 100)).toFixed(2)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.58rem' }}>
                              PoUW Yield
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid xs={4}>
                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(56,189,248,0.08)' : '#F0F9FF', border: '1px solid rgba(56,189,248,0.3)', textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8', fontWeight: 800, fontSize: '0.64rem', display: 'block' }}>
                              LIQUID VLR ({selectedMerchantFx.split.liquidVlrPct}%)
                            </Typography>
                            <Typography sx={{ fontFamily: mono, fontWeight: 900, color: '#38BDF8', fontSize: '0.88rem', mt: 0.3 }}>
                              ◈ {((parseFloat(fxCheckoutAmount) || 0) * (selectedMerchantFx.split.liquidVlrPct / 100)).toFixed(2)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.58rem' }}>
                              Working Capital
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Action Button */}
                    <Button
                      id="vaelor-fx-checkout-btn"
                      variant="contained"
                      fullWidth
                      disabled={isExecutingFxCheckout}
                      onClick={handleExecuteMerchantFxCheckout}
                      sx={{
                        py: 1.4,
                        fontFamily: mono,
                        fontWeight: 900,
                        fontSize: '0.86rem',
                        bgcolor: '#FFD700',
                        color: '#08080B',
                        borderRadius: 2,
                        textTransform: 'none',
                        boxShadow: '0 4px 18px rgba(255,215,0,0.35)',
                        '&:hover': {
                          bgcolor: '#E6C200',
                          boxShadow: '0 6px 24px rgba(255,215,0,0.5)'
                        }
                      }}
                    >
                      {isExecutingFxCheckout ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={16} sx={{ color: '#08080B' }} />
                          <span>Routing 5/5 BFT Quorum FX Sweep...</span>
                        </Box>
                      ) : (
                        '[⚡ Execute Auto-Split FX Checkout]'
                      )}
                    </Button>
                  </Paper>
                </Grid>

                {/* Right Column: Live Treasury Audit & Cryptographic Settlement */}
                <Grid xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      bgcolor: isDark ? '#05070B' : '#F8FAFC',
                      border: '1px solid rgba(255,255,255,0.08)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ShieldIcon sx={{ color: '#10B981', fontSize: '1.2rem' }} />
                          <Typography sx={{ fontFamily: mono, fontWeight: 900, fontSize: '0.92rem', color: theme.palette.text.primary }}>
                            L1 Settlement & Quorum Certificate
                          </Typography>
                        </Box>
                        <Chip
                          label="5/5 BFT ONLINE"
                          size="small"
                          sx={{ height: 20, fontSize: '0.62rem', fontWeight: 800, fontFamily: mono, bgcolor: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
                        />
                      </Box>

                      {fxCheckoutResult ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Alert severity="success" sx={{ py: 0.5, fontFamily: mono, fontSize: '0.78rem', bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                            Settlement Finalized in 6.8ms • Zero Gas ($0.00) • 0.00% FX Spread
                          </Alert>

                          <Paper sx={{ p: 1.8, borderRadius: 2, bgcolor: isDark ? '#030508' : '#FFFFFF', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: mono }}>
                                SETTLEMENT ID:
                              </Typography>
                              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#FFD700' }}>
                                {fxCheckoutResult.settlementId}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: mono }}>
                                MERCHANT SWEEP:
                              </Typography>
                              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#38BDF8' }}>
                                {fxCheckoutResult.merchant}
                              </Typography>
                            </Box>
                            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                              <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: mono }}>
                                💵 1:1 USD Reserve Credited:
                              </Typography>
                              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#10B981' }}>
                                +${fxCheckoutResult.fxSplit?.usdAmount?.toFixed(2)} (Total: ${fxCheckoutResult.merchantUsdReserve?.toFixed(2)})
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                              <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: mono }}>
                                ⚡ 8.5% APY Staked Savings:
                              </Typography>
                              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#D4AF37' }}>
                                +◈ {fxCheckoutResult.fxSplit?.vaultStakeVlr?.toFixed(2)} VLR (Total: ◈ {fxCheckoutResult.merchantStakedVlr?.toFixed(2)})
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                              <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: mono }}>
                                🌊 Liquid Micro-Chain Spendable:
                              </Typography>
                              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#38BDF8' }}>
                                +◈ {fxCheckoutResult.fxSplit?.liquidVlr?.toFixed(2)} VLR
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: mono }}>
                                💎 Instant Buyer Cashback:
                              </Typography>
                              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#EC4899' }}>
                                +◈ {fxCheckoutResult.cashback?.cashbackVlr?.toFixed(4)} VLR (5.00% SOVEREIGN_DIAMOND)
                              </Typography>
                            </Box>
                          </Paper>

                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#030508' : '#F1F5F9', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', display: 'block', mb: 0.5, fontSize: '0.64rem' }}>
                              BYZANTINE QUORUM VALIDATOR SIGNATURES (5/5 ATTESTED)
                            </Typography>
                            <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? '#E2E8F0' : '#334155', display: 'block', fontSize: '0.62rem', wordBreak: 'break-all' }}>
                              Block: {fxCheckoutResult.fxBlock?.hash || '905bbc367844234e50ba078afc57def1e7d4fbf8f15779ac4b742650d89def70'}
                              <br />
                              Validators: 🇺🇸 us-east • 🇩🇪 eu-central • 🇯🇵 ap-northeast • ⚡ edge-8140 • 🌐 nullai-core
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ p: 3, textAlign: 'center', my: 'auto' }}>
                          <LocalAtmIcon sx={{ fontSize: '2.5rem', color: '#D4AF37', mb: 1, opacity: 0.8 }} />
                          <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.88rem', color: theme.palette.text.primary, mb: 0.5 }}>
                            Awaiting POS Checkout Trigger
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 360, mx: 'auto', fontSize: '0.74rem' }}>
                            Click <strong>[⚡ Execute Auto-Split FX Checkout]</strong> to simulate an instantaneous point-of-sale customer settlement with 0.00% FX spread and immediate 5/5 validator BFT quorum finality.
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#64748B', fontSize: '0.66rem' }}>
                        Protocol: Vaelor Account-Lattice L1 (:8140)
                      </Typography>
                      <Chip
                        icon={<VerifiedIcon sx={{ fontSize: '0.75rem !important', color: '#10B981 !important' }} />}
                        label="0.00% FX Spread Guaranteed"
                        size="small"
                        sx={{ height: 18, fontSize: '0.58rem', fontWeight: 800, fontFamily: mono, bgcolor: 'transparent', color: '#10B981' }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </RevealOnScroll>

        {/* ==========================================================================
            SECTION: 12-TOOL LAYER-1 MODEL CONTEXT PROTOCOL (MCP) PLAYGROUND
            ========================================================================== */}
        <RevealOnScroll>
          <Box id="vaelor-mcp-playground" sx={{ mb: 6 }}>
            <Box sx={{ mb: 3 }}>
              <Typography className="section-kicker">Agent-to-Lattice Protocol</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: '"Syne", sans-serif', mb: 1 }}>
                Layer-1 Model Context Protocol (MCP) Playground
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 880, fontSize: '0.94rem' }}>
                Test all 12 native JSON-RPC Model Context Protocol tools. Claude, GPT, and autonomous agent swarms call these methods directly to mint compute bounties, execute merchant FX treasury sweeps, send creator tips, disburse feeless micro-payments, and verify lookalike phishing handles.
              </Typography>
            </Box>

            <Paper
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: `1.5px solid ${gold.border}`,
                bgcolor: isDark ? '#08080E' : '#FFFFFF',
                boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.6)' : '0 6px 20px rgba(0,0,0,0.06)'
              }}
            >
              {/* Tool Chips Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 800, display: 'block', mb: 1.2, letterSpacing: '0.05em' }}>
                  SELECT LAYER-1 MCP TOOL ({VAELOR_MCP_TOOLS.length} TOOLS AVAILABLE)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {VAELOR_MCP_TOOLS.map((t) => {
                    const isSelected = selectedMcpTool.name === t.name;
                    return (
                      <Chip
                        key={t.name}
                        label={t.name}
                        clickable
                        onClick={() => handleSelectMcpTool(t)}
                        sx={{
                          fontFamily: mono,
                          fontWeight: isSelected ? 900 : 700,
                          fontSize: '0.74rem',
                          bgcolor: isSelected ? '#D4AF37' : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
                          color: isSelected ? '#08080B' : theme.palette.text.primary,
                          border: `1px solid ${isSelected ? '#D4AF37' : 'rgba(212,175,55,0.2)'}`,
                          '&:hover': {
                            bgcolor: isSelected ? '#D4AF37' : 'rgba(212,175,55,0.15)'
                          }
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>

              {/* Tool Description Bar */}
              <Paper
                sx={{
                  p: 1.8,
                  mb: 3,
                  borderRadius: 2,
                  bgcolor: isDark ? '#040508' : '#F8FAFC',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1.5
                }}
              >
                <Box sx={{ maxWidth: 750 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontFamily: mono, fontWeight: 900, color: '#FFD700', fontSize: '0.86rem' }}>
                      {selectedMcpTool.name}
                    </Typography>
                    <Chip
                      label={selectedMcpTool.category}
                      size="small"
                      sx={{ bgcolor: 'rgba(56,189,248,0.15)', color: '#38BDF8', fontFamily: mono, fontWeight: 800, fontSize: '0.64rem' }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                    {selectedMcpTool.description}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => setMcpArgsInput(JSON.stringify(selectedMcpTool.defaultArgs, null, 2))}
                  sx={{ fontFamily: mono, fontSize: '0.7rem', color: '#94A3B8', textTransform: 'none' }}
                >
                  Reset Defaults
                </Button>
              </Paper>

              {/* Two Column Playground: Editor & Response */}
              <Grid container spacing={3}>
                {/* Arguments Editor */}
                <Grid xs={12} lg={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 800 }}>
                      JSON-RPC ARGUMENTS PAYLOAD
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#64748B', fontSize: '0.66rem' }}>
                      POST /api/mcp/call
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={11}
                    value={mcpArgsInput}
                    onChange={(e) => setMcpArgsInput(e.target.value)}
                    sx={{
                      mb: 2,
                      '& .MuiInputBase-root': {
                        bgcolor: isDark ? '#020306' : '#FFFFFF',
                        fontFamily: mono,
                        fontSize: '0.78rem',
                        lineHeight: 1.6,
                        color: isDark ? '#38BDF8' : '#0369A1',
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.1)'
                      }
                    }}
                  />
                  <Button
                    id="vaelor-mcp-exec-btn"
                    fullWidth
                    variant="contained"
                    onClick={handleExecVaelorMcp}
                    disabled={isExecutingMcp}
                    startIcon={isExecutingMcp ? <CircularProgress size={16} sx={{ color: '#08080B' }} /> : <TerminalIcon />}
                    sx={{
                      bgcolor: '#D4AF37',
                      color: '#08080B',
                      fontWeight: 900,
                      fontFamily: mono,
                      fontSize: '0.82rem',
                      py: 1.2,
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#B8860B' }
                    }}
                  >
                    {isExecutingMcp ? 'DISPATCHING MCP CALL...' : `EXECUTE ${selectedMcpTool.name}`}
                  </Button>
                </Grid>

                {/* Execution Response */}
                <Grid xs={12} lg={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 800 }}>
                      JSON-RPC EXECUTION RESPONSE
                    </Typography>
                    {mcpExecutionTime !== null && (
                      <Chip
                        label={`${mcpExecutionTime}ms • 200 OK`}
                        size="small"
                        sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#34D399', fontFamily: mono, fontWeight: 800, fontSize: '0.66rem' }}
                      />
                    )}
                  </Box>
                  <Paper
                    sx={{
                      p: 2,
                      height: { xs: 260, lg: 'calc(100% - 32px)' },
                      minHeight: 260,
                      maxHeight: 380,
                      overflow: 'auto',
                      bgcolor: isDark ? '#020306' : '#0F172A',
                      color: '#34D399',
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontFamily: mono,
                      fontSize: '0.74rem',
                      lineHeight: 1.55,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all'
                    }}
                  >
                    {mcpExecutionResult ? (
                      JSON.stringify(mcpExecutionResult, null, 2)
                    ) : (
                      <Typography sx={{ fontFamily: mono, color: '#64748B', fontSize: '0.74rem', pt: 4, textAlign: 'center' }}>
                        Click "EXECUTE {selectedMcpTool.name}" to dispatch live JSON-RPC request to Vaelor Layer-1 daemon or instant client substrate.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </RevealOnScroll>

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
