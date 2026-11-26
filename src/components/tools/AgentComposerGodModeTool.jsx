import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Stack,
  Alert,
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import LinkIcon from '@mui/icons-material/Link';
import VisibilityIcon from '@mui/icons-material/Visibility';

import {
  DAG_PROVIDERS,
  TRANSFORM_MODES,
  STARTER_TEMPLATES,
  validateDag,
  topologicalWaves,
  interpolateTemplate,
  executeTransformNode,
  computeAutoLayout,
  exportDagJson,
  importDagJson,
  exportDagYaml,
  exportDagPython,
} from '../../utils/dagEngine';
import { useCopy, downloadText, downloadJson, SovereignSupportBar } from '../sovereign';

const MONO = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DISPLAY = '"Celtic Garamond", Georgia, "Times New Roman", serif';
const STORAGE_KEY = 'zoth_agent_composer_v2';

function makeNodeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `node_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `node_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function hydrateTemplate(tpl) {
  const layout = computeAutoLayout(tpl.nodes, tpl.edges);
  return {
    templateId: tpl.id,
    name: tpl.name,
    pipelineInput: tpl.pipelineInput,
    nodes: tpl.nodes.map((n) => ({
      ...n,
      x: layout.positions[n.id]?.x ?? 48,
      y: layout.positions[n.id]?.y ?? 48,
    })),
    edges: tpl.edges.map((e) => ({ ...e })),
  };
}

function loadInitialState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.nodes) && parsed.nodes.length > 0 && Array.isArray(parsed.edges)) {
        const layout = computeAutoLayout(parsed.nodes, parsed.edges);
        return {
          templateId: parsed.templateId || 'custom',
          name: parsed.name || 'Custom Agent DAG',
          pipelineInput: String(parsed.pipelineInput ?? ''),
          nodes: parsed.nodes.map((n) => ({
            ...n,
            x: typeof n.x === 'number' ? n.x : layout.positions[n.id]?.x ?? 48,
            y: typeof n.y === 'number' ? n.y : layout.positions[n.id]?.y ?? 48,
          })),
          edges: parsed.edges,
        };
      }
    }
  } catch {
    /* fall through to starter template */
  }
  return hydrateTemplate(STARTER_TEMPLATES[0]);
}

function getProviderMeta(providerId) {
  return DAG_PROVIDERS.find((p) => p.id === providerId) || DAG_PROVIDERS[4];
}

export default function AgentComposerGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Dual-theme Editorial Ivory Light + Obsidian Dark tokens
  const T = useMemo(
    () => ({
      outerBg: isDark ? '#090B10' : '#FAF7F0',
      surface: isDark ? '#121621' : '#FFFFFF',
      subtle: isDark ? '#171C2A' : '#F5F1E8',
      consoleBg: isDark ? '#07090E' : '#F5F1E8',
      consoleInk: isDark ? '#E2E8F0' : '#1C1917',
      canvasBg: isDark ? '#0B0E16' : '#FBF9F4',
      gridDot: isDark ? 'rgba(212, 175, 55, 0.16)' : 'rgba(154, 114, 9, 0.18)',
      ink: isDark ? '#F5F1E6' : '#1C1917',
      muted: isDark ? '#A3AAB8' : '#57534E',
      border: isDark ? 'rgba(245, 241, 230, 0.14)' : 'rgba(28, 25, 23, 0.13)',
      borderStrong: isDark ? 'rgba(212, 175, 55, 0.45)' : 'rgba(154, 114, 9, 0.42)',
      gold: isDark ? '#D4AF37' : '#9A7209',
      goldBg: isDark ? 'rgba(212, 175, 55, 0.14)' : '#FEF9E7',
      emerald: isDark ? '#34D399' : '#047857',
      emeraldBg: isDark ? 'rgba(52, 211, 153, 0.14)' : '#ECFDF5',
      crimson: isDark ? '#F87171' : '#BE123C',
      crimsonBg: isDark ? 'rgba(248, 113, 113, 0.14)' : '#FFF1F2',
      sky: isDark ? '#38BDF8' : '#0369A1',
      skyBg: isDark ? 'rgba(56, 189, 248, 0.14)' : '#F0F9FF',
      amber: isDark ? '#FBBF24' : '#B45309',
      amberBg: isDark ? 'rgba(251, 191, 36, 0.14)' : '#FFFBEB',
    }),
    [isDark],
  );

  const initial = useMemo(() => loadInitialState(), []);
  const [templateId, setTemplateId] = useState(initial.templateId);
  const [dagName, setDagName] = useState(initial.name);
  const [pipelineInput, setPipelineInput] = useState(initial.pipelineInput);
  const [nodes, setNodes] = useState(initial.nodes);
  const [edges, setEdges] = useState(initial.edges);
  const [selectedNodeId, setSelectedNodeId] = useState(initial.nodes[0]?.id || null);

  // Live provider probe state
  const [providerData, setProviderData] = useState(null);
  const [probingProviders, setProbingProviders] = useState(false);
  const [providerError, setProviderError] = useState('');

  // Interactive graph state
  const [zoom, setZoom] = useState(1);
  const [connectSourceId, setConnectSourceId] = useState(null);
  const [dragging, setDragging] = useState(null);
  const svgRef = useRef(null);

  // Execution state
  const [running, setRunning] = useState(false);
  const [runMode, setRunMode] = useState(null); // 'live' | 'dry-run' | null
  const [nodeStates, setNodeStates] = useState({}); // id -> { status, output, error, durationMs, provider, model, tokenEstimate, wave }
  const [runLogs, setRunLogs] = useState([]);
  const abortRef = useRef(null);
  const providerAbortRef = useRef(null);

  // Export / Import UI state
  const [exportTab, setExportTab] = useState(0); // 0=JSON, 1=YAML, 2=Python
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const { copied: copiedExport, copy: copyExport } = useCopy(2000);

  // Persist to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ templateId, name: dagName, pipelineInput, nodes, edges }),
      );
    } catch {
      /* ignore quota errors */
    }
  }, [templateId, dagName, pipelineInput, nodes, edges]);

  // Abort any in-flight run or provider probe on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (providerAbortRef.current) providerAbortRef.current.abort();
    };
  }, []);

  const fetchProviders = useCallback(async () => {
    if (providerAbortRef.current) providerAbortRef.current.abort();
    const ctrl = new AbortController();
    providerAbortRef.current = ctrl;
    setProbingProviders(true);
    setProviderError('');
    try {
      const timer = setTimeout(() => ctrl.abort(), 3500);
      const res = await fetch('/api/studio/composer/providers', { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!ctrl.signal.aborted) setProviderData(json);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setProviderError('Loopback Studio API not detected (static/offline mode — Deterministic Transform & Dry-Run remain fully active).');
      setProviderData(null);
    } finally {
      if (!ctrl.signal.aborted) setProbingProviders(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const validation = useMemo(() => validateDag(nodes, edges), [nodes, edges]);
  const topo = useMemo(() => topologicalWaves(nodes, edges), [nodes, edges]);
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || nodes[0] || null,
    [nodes, selectedNodeId],
  );

  // Compute SVG canvas extents
  const canvasBounds = useMemo(() => {
    const NODE_W = 224;
    const NODE_H = 104;
    let maxX = 760;
    let maxY = 360;
    for (const n of nodes) {
      maxX = Math.max(maxX, (n.x || 0) + NODE_W + 60);
      maxY = Math.max(maxY, (n.y || 0) + NODE_H + 60);
    }
    return { width: maxX, height: maxY, nodeW: NODE_W, nodeH: NODE_H };
  }, [nodes]);

  const dagObj = useMemo(
    () => ({ name: dagName, pipelineInput, nodes, edges }),
    [dagName, pipelineInput, nodes, edges],
  );

  const exportCode = useMemo(() => {
    if (exportTab === 0) return exportDagJson(dagObj);
    if (exportTab === 1) return exportDagYaml(dagObj);
    return exportDagPython(dagObj);
  }, [exportTab, dagObj]);

  const appendLog = useCallback((line) => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    setRunLogs((prev) => [...prev.slice(-80), `[${ts}] ${line}`]);
  }, []);

  const handleLoadTemplate = (tpl) => {
    if (running) return;
    const hydrated = hydrateTemplate(tpl);
    setTemplateId(hydrated.templateId);
    setDagName(hydrated.name);
    setPipelineInput(hydrated.pipelineInput);
    setNodes(hydrated.nodes);
    setEdges(hydrated.edges);
    setSelectedNodeId(hydrated.nodes[0]?.id || null);
    setNodeStates({});
    setRunLogs([]);
    setConnectSourceId(null);
  };

  const handleAutoLayout = () => {
    const layout = computeAutoLayout(nodes, edges);
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        x: layout.positions[n.id]?.x ?? n.x ?? 48,
        y: layout.positions[n.id]?.y ?? n.y ?? 48,
      })),
    );
  };

  const handleAddNode = () => {
    const id = makeNodeId();
    const last = nodes[nodes.length - 1];
    const newNode = {
      id,
      name: `Stage ${nodes.length + 1}`,
      role: 'Autonomous Pipeline Worker',
      provider: 'transform',
      model: 'markdown-brief',
      prompt: last ? `Process upstream output from ${last.name}:\n{{${last.id}.output}}` : 'Process input:\n{{input}}',
      x: last ? Math.min(960, (last.x || 48) + 270) : 48,
      y: last ? (last.y || 48) : 48,
    };
    const nextNodes = [...nodes, newNode];
    const nextEdges = last ? [...edges, { id: `e-${last.id}-${id}`, source: last.id, target: id }] : edges;
    const layout = computeAutoLayout(nextNodes, nextEdges);
    setNodes(
      nextNodes.map((n) => ({
        ...n,
        x: layout.positions[n.id]?.x ?? n.x,
        y: layout.positions[n.id]?.y ?? n.y,
      })),
    );
    setEdges(nextEdges);
    setSelectedNodeId(id);
  };

  const handleDeleteNode = (nodeId) => {
    if (nodes.length <= 1 || running) return;
    const nextNodes = nodes.filter((n) => n.id !== nodeId);
    const nextEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
    setNodes(nextNodes);
    setEdges(nextEdges);
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(nextNodes[0]?.id || null);
    }
    if (connectSourceId === nodeId) setConnectSourceId(null);
  };

  const updateSelectedNode = (patch) => {
    if (!selectedNode) return;
    setNodes((prev) => prev.map((n) => (n.id === selectedNode.id ? { ...n, ...patch } : n)));
  };

  const toggleDependency = (sourceId, targetId) => {
    if (sourceId === targetId) return;
    const exists = edges.some((e) => e.source === sourceId && e.target === targetId);
    if (exists) {
      setEdges((prev) => prev.filter((e) => !(e.source === sourceId && e.target === targetId)));
    } else {
      setEdges((prev) => [...prev, { id: `e-${sourceId}-${targetId}`, source: sourceId, target: targetId }]);
    }
  };

  const handlePortClick = (nodeId, portType, e) => {
    e.stopPropagation();
    if (portType === 'out') {
      setConnectSourceId((prev) => (prev === nodeId ? null : nodeId));
    } else if (portType === 'in' && connectSourceId && connectSourceId !== nodeId) {
      toggleDependency(connectSourceId, nodeId);
      setConnectSourceId(null);
    }
  };

  const handlePointerDownNode = (node, e) => {
    if (e.button !== 0) return;
    setSelectedNodeId(node.id);
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = canvasBounds.width / (rect.width * zoom);
    const scaleY = canvasBounds.height / (rect.height * zoom);
    setDragging({
      id: node.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: node.x || 0,
      origY: node.y || 0,
      scaleX,
      scaleY,
    });
  };

  const handleSvgPointerMove = (e) => {
    if (!dragging) return;
    const dx = (e.clientX - dragging.startClientX) * dragging.scaleX;
    const dy = (e.clientY - dragging.startClientY) * dragging.scaleY;
    const nx = Math.max(16, Math.round(dragging.origX + dx));
    const ny = Math.max(16, Math.round(dragging.origY + dy));
    setNodes((prev) => prev.map((n) => (n.id === dragging.id ? { ...n, x: nx, y: ny } : n)));
  };

  const handleSvgPointerUp = () => {
    if (dragging) setDragging(null);
  };

  // Execute a single node via real loopback Studio API or deterministic Transform
  const executeSingleNode = useCallback(
    async (node, resolvedPrompt, mode, signal) => {
      if (mode === 'dry-run') {
        return {
          ok: true,
          provider: node.provider,
          model: node.model,
          output: `[DRY-RUN PREVIEW · ${node.provider}/${node.model}]\nResolved Prompt (${resolvedPrompt.length} chars):\n${resolvedPrompt}`,
          durationMs: 1,
          tokenEstimate: Math.max(1, Math.round(resolvedPrompt.length / 4)),
          error: null,
          isDryRun: true,
        };
      }

      if (node.provider === 'transform' && !providerData) {
        return executeTransformNode(node, resolvedPrompt);
      }

      try {
        const res = await fetch('/api/studio/composer/step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({
            id: node.id,
            name: node.name,
            role: node.role,
            provider: node.provider,
            model: node.model,
            prompt: resolvedPrompt,
            timeoutMs: 30000,
          }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) {
          return {
            ok: false,
            provider: node.provider,
            model: node.model,
            output: '',
            durationMs: data?.durationMs || 0,
            tokenEstimate: 0,
            error: data?.error || `HTTP ${res.status} from /api/studio/composer/step`,
          };
        }
        return data;
      } catch (err) {
        if (err?.name === 'AbortError') {
          return {
            ok: false,
            provider: node.provider,
            model: node.model,
            output: '',
            durationMs: 0,
            tokenEstimate: 0,
            error: 'Execution cancelled by user.',
            cancelled: true,
          };
        }
        if (node.provider === 'transform') {
          return executeTransformNode(node, resolvedPrompt);
        }
        return {
          ok: false,
          provider: node.provider,
          model: node.model,
          output: '',
          durationMs: 0,
          tokenEstimate: 0,
          error: `Local Studio API unreachable (${err.message}). Start Zoth Studio on 127.0.0.1:3000 or use Transform / Dry-Run.`,
        };
      }
    },
    [providerData],
  );

  const handleStopRun = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      appendLog('ABORT requested — cancelling in-flight wave requests.');
    }
  };

  const handleRunPipeline = async (mode = 'live') => {
    if (!topo.ok) {
      appendLog(`BLOCKED: ${validation.errors.map((e) => e.message).join(' ')}`);
      return;
    }
    if (running) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setRunMode(mode);
    setRunLogs([]);

    const freshStates = {};
    for (const n of nodes) {
      freshStates[n.id] = {
        status: 'pending',
        output: '',
        error: null,
        durationMs: 0,
        provider: n.provider,
        model: n.model,
        tokenEstimate: 0,
        wave: (topo.waveByNodeId[n.id] ?? 0) + 1,
      };
    }
    setNodeStates(freshStates);
    appendLog(
      `START [${mode.toUpperCase()}] "${dagName}" — ${nodes.length} nodes across ${topo.waves.length} topological wave(s).`,
    );

    const outputsById = {};
    let hadError = false;

    for (let wIdx = 0; wIdx < topo.waves.length; wIdx += 1) {
      if (controller.signal.aborted) break;
      const wave = topo.waves[wIdx];
      appendLog(`WAVE ${wIdx + 1}/${topo.waves.length}: dispatching [${wave.map((n) => n.name).join(', ')}] in parallel`);

      setNodeStates((prev) => {
        const next = { ...prev };
        for (const n of wave) {
          next[n.id] = { ...next[n.id], status: 'running', error: null };
        }
        return next;
      });

      const waveResults = await Promise.all(
        wave.map(async (node) => {
          const resolvedPrompt = interpolateTemplate(node.prompt, outputsById, pipelineInput);
          const result = await executeSingleNode(node, resolvedPrompt, mode, controller.signal);
          return { node, result };
        }),
      );

      for (const { node, result } of waveResults) {
        if (result.ok) {
          outputsById[node.id] = result.output;
          setNodeStates((prev) => ({
            ...prev,
            [node.id]: {
              ...prev[node.id],
              status: mode === 'dry-run' ? 'dry-run' : 'completed',
              output: result.output,
              error: null,
              durationMs: result.durationMs,
              provider: result.provider,
              model: result.model,
              tokenEstimate: result.tokenEstimate,
            },
          }));
          appendLog(
            `OK [${node.name}] (${result.provider}/${result.model}) in ${result.durationMs}ms (~${result.tokenEstimate} tok)`,
          );
        } else {
          hadError = true;
          setNodeStates((prev) => ({
            ...prev,
            [node.id]: {
              ...prev[node.id],
              status: result.cancelled ? 'cancelled' : 'error',
              output: '',
              error: result.error,
              durationMs: result.durationMs,
            },
          }));
          appendLog(`ERROR [${node.name}] (${node.provider}): ${result.error}`);
        }
      }

      if (hadError || controller.signal.aborted) {
        if (hadError) appendLog('HALTED: Downstream waves skipped after upstream node error (fail-fast invariant).');
        break;
      }
    }

    if (!hadError && !controller.signal.aborted) {
      appendLog(`COMPLETE [${mode.toUpperCase()}]: All ${nodes.length} nodes finished cleanly.`);
    }
    setRunning(false);
    abortRef.current = null;
  };

  const handleRunSelectedStep = async () => {
    if (!selectedNode || running) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setRunMode('live');

    const outputsById = {};
    for (const [nid, st] of Object.entries(nodeStates)) {
      if (st?.output) outputsById[nid] = st.output;
    }

    setNodeStates((prev) => ({
      ...prev,
      [selectedNode.id]: {
        ...(prev[selectedNode.id] || {}),
        status: 'running',
        error: null,
        provider: selectedNode.provider,
        model: selectedNode.model,
      },
    }));

    const resolvedPrompt = interpolateTemplate(selectedNode.prompt, outputsById, pipelineInput);
    appendLog(`SINGLE-STEP [${selectedNode.name}] -> ${selectedNode.provider}/${selectedNode.model}`);
    const result = await executeSingleNode(selectedNode, resolvedPrompt, 'live', controller.signal);

    setNodeStates((prev) => ({
      ...prev,
      [selectedNode.id]: {
        ...(prev[selectedNode.id] || {}),
        status: result.ok ? 'completed' : result.cancelled ? 'cancelled' : 'error',
        output: result.output || '',
        error: result.error || null,
        durationMs: result.durationMs || 0,
        provider: result.provider || selectedNode.provider,
        model: result.model || selectedNode.model,
        tokenEstimate: result.tokenEstimate || 0,
      },
    }));
    appendLog(
      result.ok
        ? `OK [${selectedNode.name}] in ${result.durationMs}ms`
        : `ERROR [${selectedNode.name}]: ${result.error}`,
    );
    setRunning(false);
    abortRef.current = null;
  };

  const handleImportSubmit = () => {
    const res = importDagJson(importText);
    if (!res.ok) {
      setImportError(res.error);
      return;
    }
    const layout = computeAutoLayout(res.dag.nodes, res.dag.edges);
    setTemplateId('imported');
    setDagName(res.dag.name);
    setPipelineInput(res.dag.pipelineInput);
    setNodes(
      res.dag.nodes.map((n) => ({
        ...n,
        x: typeof n.x === 'number' ? n.x : layout.positions[n.id]?.x ?? 48,
        y: typeof n.y === 'number' ? n.y : layout.positions[n.id]?.y ?? 48,
      })),
    );
    setEdges(res.dag.edges);
    setSelectedNodeId(res.dag.nodes[0]?.id || null);
    setNodeStates({});
    setImportOpen(false);
    setImportError('');
    setImportText('');
  };

  // Model suggestions based on selected node's provider and live provider probe
  const modelOptions = useMemo(() => {
    if (!selectedNode) return [];
    const p = selectedNode.provider;
    if (p === 'transform') return TRANSFORM_MODES.map((m) => m.id);
    if (p === 'ollama' && providerData?.providers?.ollama?.models?.length) {
      return providerData.providers.ollama.models;
    }
    if (p === 'agy-hermes' && providerData?.providers?.['agy-hermes']?.models?.length) {
      return providerData.providers['agy-hermes'].models;
    }
    return [getProviderMeta(p).defaultModel];
  }, [selectedNode, providerData]);

  const providerPills = useMemo(() => {
    const p = providerData?.providers;
    const c = providerData?.cli;
    return [
      {
        id: 'ollama',
        label: p?.ollama?.up ? `Ollama · ${p.ollama.models.length} models` : 'Ollama (:11434)',
        online: Boolean(p?.ollama?.up),
      },
      {
        id: 'agy-hermes',
        label: p?.['agy-hermes']?.up ? `AGY-Hermes · ${p['agy-hermes'].models.length} models` : 'AGY-Hermes (:18000)',
        online: Boolean(p?.['agy-hermes']?.up),
      },
      { id: 'azoth', label: 'Azoth (:8136)', online: Boolean(p?.azoth?.up) },
      { id: 'neuro-memory', label: 'Neuro-Memory (:8094)', online: Boolean(p?.['neuro-memory']?.up) },
      { id: 'sovereign-bridge', label: 'Bridge (:8102)', online: Boolean(p?.['sovereign-bridge']?.up) },
      { id: 'transform', label: 'Transform (Local JS)', online: true },
      { id: 'hermes', label: 'Hermes CLI', online: Boolean(c?.hermes?.detected) },
      { id: 'agy', label: 'AGY CLI', online: Boolean(c?.agy?.detected) },
      { id: 'codex', label: 'Codex CLI', online: Boolean(c?.codex?.detected) },
      { id: 'claude-code', label: 'Claude Code', online: Boolean(c?.['claude-code']?.detected) },
    ];
  }, [providerData]);

  const cycleNodeSet = useMemo(() => new Set(validation.cyclePath || []), [validation.cyclePath]);

  const statusColor = (status) => {
    if (status === 'completed') return T.emerald;
    if (status === 'running') return T.gold;
    if (status === 'error') return T.crimson;
    if (status === 'dry-run') return T.sky;
    if (status === 'cancelled') return T.amber;
    return T.muted;
  };

  return (
    <Box
      data-testid="agent-composer-foundry"
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2.5,
        bgcolor: T.outerBg,
        color: T.ink,
        border: `1px solid ${T.border}`,
      }}
    >
      {/* 1. Live Provider Strip */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.75, md: 2.25 },
          mb: 2.5,
          borderRadius: 2,
          bgcolor: T.surface,
          border: `1px solid ${T.border}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.25,
            mb: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountTreeIcon sx={{ color: T.gold, fontSize: 20 }} />
            <Typography
              component="h3"
              sx={{
                fontFamily: MONO,
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: T.ink,
              }}
            >
              Live Loopback &amp; CLI Provider Matrix
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={fetchProviders}
            disabled={probingProviders}
            startIcon={probingProviders ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon sx={{ fontSize: 16 }} />}
            sx={{
              minHeight: 44,
              px: 1.75,
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              color: T.ink,
              borderColor: T.border,
              '&:hover': { borderColor: T.gold },
            }}
          >
            {probingProviders ? 'Probing Loopback…' : 'Refresh Providers'}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.9 }}>
          {providerPills.map((pill) => (
            <Chip
              key={pill.id}
              size="small"
              label={`${pill.online ? '●' : '○'} ${pill.label}`}
              sx={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 28,
                bgcolor: pill.online ? T.emeraldBg : T.subtle,
                color: pill.online ? T.emerald : T.muted,
                border: `1px solid ${pill.online ? T.emerald : T.border}`,
              }}
            />
          ))}
        </Box>
        {providerError && (
          <Typography sx={{ mt: 1.25, fontFamily: MONO, fontSize: '0.72rem', color: T.amber }}>
            {providerError}
          </Typography>
        )}
      </Paper>

      {/* 2. Starter Templates & Execution Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.75, md: 2.25 },
          mb: 2.5,
          borderRadius: 2,
          bgcolor: T.surface,
          border: `1px solid ${T.border}`,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
          <Box>
            <Typography
              component="h3"
              sx={{ fontFamily: DISPLAY, fontSize: { xs: '1.25rem', md: '1.45rem' }, color: T.ink, lineHeight: 1.2 }}
            >
              Pipeline Templates &amp; Execution Controls
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: T.muted }}>
              Select a multi-wave starter DAG or compose custom directed edges below. Auto-saved to localStorage.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {STARTER_TEMPLATES.map((tpl) => {
              const active = templateId === tpl.id;
              return (
                <Button
                  key={tpl.id}
                  size="small"
                  variant={active ? 'contained' : 'outlined'}
                  onClick={() => handleLoadTemplate(tpl)}
                  disabled={running}
                  sx={{
                    minHeight: 44,
                    px: 1.6,
                    fontFamily: MONO,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: active ? T.gold : 'transparent',
                    color: active ? (isDark ? '#090B10' : '#FFFFFF') : T.ink,
                    borderColor: active ? T.gold : T.border,
                    '&:hover': { borderColor: T.gold, bgcolor: active ? T.gold : T.subtle },
                  }}
                >
                  {tpl.name}
                </Button>
              );
            })}
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={12} md={4}>
            <TextField
              id="composer-pipeline-name"
              label="Pipeline Name"
              fullWidth
              size="small"
              value={dagName}
              onChange={(e) => setDagName(e.target.value)}
              inputProps={{ 'aria-label': 'Pipeline Name' }}
              sx={{
                '& .MuiInputBase-root': { fontFamily: MONO, fontSize: '0.82rem', bgcolor: T.subtle, color: T.ink },
              }}
            />
          </Grid>
          <Grid xs={12} md={8}>
            <TextField
              id="composer-pipeline-input"
              label="Global Pipeline Input ({{input}})"
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              size="small"
              value={pipelineInput}
              onChange={(e) => setPipelineInput(e.target.value)}
              inputProps={{ 'aria-label': 'Global Pipeline Input' }}
              sx={{
                '& .MuiInputBase-root': { fontFamily: MONO, fontSize: '0.78rem', bgcolor: T.subtle, color: T.ink },
              }}
            />
          </Grid>
        </Grid>

        {/* Primary Action Bar */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={() => handleRunPipeline('live')}
            disabled={running || !validation.valid}
            startIcon={running && runMode === 'live' ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
            data-testid="composer-run-live"
            sx={{
              minHeight: 44,
              px: 2.2,
              fontFamily: MONO,
              fontSize: '0.76rem',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: T.emerald,
              color: isDark ? '#07090E' : '#FFFFFF',
              '&:hover': { bgcolor: isDark ? '#6EE7B7' : '#065F46' },
              '&.Mui-disabled': {
                bgcolor: isDark ? 'rgba(52,211,153,0.22)' : 'rgba(4,120,87,0.22)',
                color: isDark ? '#ECFDF5' : '#064E3B',
              },
            }}
          >
            {running && runMode === 'live' ? 'Running Live Waves…' : 'Run Live Pipeline'}
          </Button>

          <Button
            variant="outlined"
            onClick={() => handleRunPipeline('dry-run')}
            disabled={running || !validation.valid}
            startIcon={<VisibilityIcon />}
            data-testid="composer-run-dry"
            sx={{
              minHeight: 44,
              px: 2,
              fontFamily: MONO,
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'none',
              color: T.sky,
              borderColor: T.sky,
              '&:hover': { bgcolor: T.skyBg },
            }}
          >
            Dry-Run Preview
          </Button>

          {running && (
            <Button
              variant="contained"
              onClick={handleStopRun}
              startIcon={<StopIcon />}
              data-testid="composer-stop"
              sx={{
                minHeight: 44,
                px: 2,
                fontFamily: MONO,
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: T.crimson,
                color: '#FFFFFF',
              }}
            >
              Stop / Cancel
            </Button>
          )}

          <Button
            variant="outlined"
            onClick={handleAddNode}
            disabled={running}
            startIcon={<AddCircleOutlineIcon />}
            data-testid="composer-add-node"
            sx={{
              minHeight: 44,
              px: 1.8,
              fontFamily: MONO,
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'none',
              color: T.gold,
              borderColor: T.borderStrong,
              '&:hover': { bgcolor: T.goldBg },
            }}
          >
            Add Node
          </Button>

          <Button
            variant="outlined"
            onClick={handleAutoLayout}
            startIcon={<AutoFixHighIcon />}
            sx={{
              minHeight: 44,
              px: 1.8,
              fontFamily: MONO,
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'none',
              color: T.ink,
              borderColor: T.border,
            }}
          >
            Auto-Layout
          </Button>

          <Button
            variant="outlined"
            onClick={() => setImportOpen(true)}
            startIcon={<UploadFileIcon />}
            sx={{
              minHeight: 44,
              px: 1.8,
              fontFamily: MONO,
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'none',
              color: T.ink,
              borderColor: T.border,
            }}
          >
            Import JSON
          </Button>

          <Button
            variant="outlined"
            onClick={() => handleLoadTemplate(STARTER_TEMPLATES.find((t) => t.id === templateId) || STARTER_TEMPLATES[0])}
            disabled={running}
            startIcon={<RestartAltIcon />}
            sx={{
              minHeight: 44,
              px: 1.6,
              fontFamily: MONO,
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'none',
              color: T.muted,
              borderColor: T.border,
            }}
          >
            Reset
          </Button>
        </Box>
      </Paper>

      {/* 3. DAG Validation & Topological Wave Banner */}
      {validation.valid ? (
        <Alert
          severity="success"
          icon={<CheckCircleOutlineIcon sx={{ color: T.emerald }} />}
          sx={{
            mb: 2.5,
            borderRadius: 2,
            bgcolor: T.emeraldBg,
            color: T.ink,
            border: `1px solid ${T.emerald}`,
            '& .MuiAlert-message': { fontFamily: MONO, fontSize: '0.75rem', width: '100%' },
          }}
        >
          <strong>VALID ACYCLIC DAG</strong> · {nodes.length} nodes · {edges.length} directed edges ·{' '}
          {topo.waves.length} parallel wave(s):{' '}
          {topo.waves.map((w, i) => `W${i + 1}[${w.map((n) => n.name).join(' + ')}]`).join(' → ')}
        </Alert>
      ) : (
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon sx={{ color: T.crimson }} />}
          data-testid="composer-cycle-alert"
          sx={{
            mb: 2.5,
            borderRadius: 2,
            bgcolor: T.crimsonBg,
            color: T.ink,
            border: `1px solid ${T.crimson}`,
            '& .MuiAlert-message': { fontFamily: MONO, fontSize: '0.76rem' },
          }}
        >
          <strong>DAG VALIDATION ERROR — EXECUTION BLOCKED:</strong>{' '}
          {validation.errors.map((e) => e.message).join(' | ')}
        </Alert>
      )}

      {/* 4. Main Split: Interactive SVG Graph Canvas + Node Inspector */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Left: Interactive SVG Directed Node-Graph Canvas */}
        <Grid xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.75, md: 2.25 },
              borderRadius: 2,
              bgcolor: T.surface,
              border: `1px solid ${T.border}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
                mb: 1.5,
              }}
            >
              <Box>
                <Typography
                  component="h3"
                  sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: T.ink }}
                >
                  Interactive Directed Graph Canvas
                </Typography>
                <Typography sx={{ fontSize: '0.74rem', color: T.muted }}>
                  {connectSourceId
                    ? `Connecting from "${nodes.find((n) => n.id === connectSourceId)?.name}" — click any target node's left IN port.`
                    : 'Drag nodes to arrange · Click right OUT port then left IN port to connect · Click an edge to remove.'}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.75}>
                <IconButton
                  aria-label="Zoom out DAG canvas"
                  onClick={() => setZoom((z) => Math.max(0.65, Number((z - 0.15).toFixed(2))))}
                  sx={{ minWidth: 44, minHeight: 44, border: `1px solid ${T.border}`, color: T.ink }}
                >
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label="Reset DAG canvas zoom"
                  onClick={() => setZoom(1)}
                  sx={{ minWidth: 44, minHeight: 44, border: `1px solid ${T.border}`, color: T.ink }}
                >
                  <CenterFocusStrongIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label="Zoom in DAG canvas"
                  onClick={() => setZoom((z) => Math.min(1.45, Number((z + 0.15).toFixed(2))))}
                  sx={{ minWidth: 44, minHeight: 44, border: `1px solid ${T.border}`, color: T.ink }}
                >
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>

            <Box
              sx={{
                position: 'relative',
                width: '100%',
                overflowX: 'auto',
                borderRadius: 2,
                bgcolor: T.canvasBg,
                border: `1px solid ${T.border}`,
                minHeight: 340,
              }}
            >
              <svg
                ref={svgRef}
                data-testid="composer-dag-svg"
                role="img"
                aria-label={`Multi-Agent DAG canvas with ${nodes.length} nodes and ${edges.length} directed edges`}
                viewBox={`0 0 ${canvasBounds.width} ${canvasBounds.height}`}
                width="100%"
                style={{
                  minWidth: Math.round(canvasBounds.width * 0.72 * zoom),
                  height: Math.max(340, Math.round(canvasBounds.height * zoom)),
                  display: 'block',
                  userSelect: 'none',
                  cursor: dragging ? 'grabbing' : 'default',
                }}
                onPointerMove={handleSvgPointerMove}
                onPointerUp={handleSvgPointerUp}
                onPointerLeave={handleSvgPointerUp}
              >
                <defs>
                  <pattern id="dag-dot-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.2" fill={T.gridDot} />
                  </pattern>
                  <marker
                    id="dag-arrow"
                    viewBox="0 0 10 10"
                    refX="8.5"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={T.gold} />
                  </marker>
                  <marker
                    id="dag-arrow-error"
                    viewBox="0 0 10 10"
                    refX="8.5"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={T.crimson} />
                  </marker>
                </defs>

                <rect width="100%" height="100%" fill="url(#dag-dot-grid)" />

                {/* Directed Cubic Bézier Edges */}
                {edges.map((edge) => {
                  const src = nodes.find((n) => n.id === edge.source);
                  const tgt = nodes.find((n) => n.id === edge.target);
                  if (!src || !tgt) return null;
                  const x1 = (src.x || 0) + canvasBounds.nodeW;
                  const y1 = (src.y || 0) + canvasBounds.nodeH / 2;
                  const x2 = tgt.x || 0;
                  const y2 = (tgt.y || 0) + canvasBounds.nodeH / 2;
                  const dx = Math.max(48, Math.abs(x2 - x1) * 0.48);
                  const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2 - 4} ${y2}`;
                  const isCycleEdge = cycleNodeSet.has(edge.source) && cycleNodeSet.has(edge.target);
                  const isActiveEdge =
                    nodeStates[edge.source]?.status === 'completed' ||
                    nodeStates[edge.target]?.status === 'running';

                  return (
                    <g
                      key={edge.id || `${edge.source}->${edge.target}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleDependency(edge.source, edge.target)}
                    >
                      <title>{`Edge ${src.name} -> ${tgt.name} (click to disconnect)`}</title>
                      <path d={pathD} fill="none" stroke="transparent" strokeWidth="14" />
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isCycleEdge ? T.crimson : isActiveEdge ? T.emerald : T.gold}
                        strokeWidth={isCycleEdge || isActiveEdge ? 2.6 : 1.9}
                        strokeDasharray={nodeStates[edge.target]?.status === 'running' ? '6 4' : undefined}
                        markerEnd={isCycleEdge ? 'url(#dag-arrow-error)' : 'url(#dag-arrow)'}
                        opacity={0.92}
                      />
                    </g>
                  );
                })}

                {/* Interactive Node Cards */}
                {nodes.map((node) => {
                  const prov = getProviderMeta(node.provider);
                  const accent = isDark ? prov.accentDark : prov.accentLight;
                  const st = nodeStates[node.id];
                  const isSelected = selectedNode?.id === node.id;
                  const isCycle = cycleNodeSet.has(node.id);
                  const isConnecting = connectSourceId === node.id;
                  const waveIdx = topo.ok ? (topo.waveByNodeId[node.id] ?? 0) + 1 : '?';
                  const stColor = statusColor(st?.status);

                  return (
                    <g
                      key={node.id}
                      data-testid={`dag-node-${node.id}`}
                      transform={`translate(${node.x || 0}, ${node.y || 0})`}
                      onPointerDown={(e) => handlePointerDownNode(node, e)}
                      style={{ cursor: 'grab' }}
                    >
                      {/* Outer Selection / Status Frame */}
                      <rect
                        width={canvasBounds.nodeW}
                        height={canvasBounds.nodeH}
                        rx="12"
                        fill={T.surface}
                        stroke={isCycle ? T.crimson : isSelected ? T.gold : isConnecting ? T.sky : T.border}
                        strokeWidth={isCycle || isSelected || isConnecting ? 2.4 : 1.25}
                      />
                      {/* Top Accent Bar */}
                      <rect
                        x="1"
                        y="1"
                        width={canvasBounds.nodeW - 2}
                        height="5"
                        rx="4"
                        fill={isCycle ? T.crimson : accent}
                      />

                      {/* Wave Badge */}
                      <rect
                        x="12"
                        y="14"
                        width="32"
                        height="18"
                        rx="5"
                        fill={T.subtle}
                        stroke={T.border}
                        strokeWidth="0.9"
                      />
                      <text
                        x="28"
                        y="26.5"
                        textAnchor="middle"
                        fill={T.gold}
                        fontFamily={MONO}
                        fontSize="10"
                        fontWeight="800"
                      >
                        {`W${waveIdx}`}
                      </text>

                      {/* Provider Pill */}
                      <text
                        x="52"
                        y="26.5"
                        fill={accent}
                        fontFamily={MONO}
                        fontSize="10"
                        fontWeight="800"
                      >
                        {prov.shortLabel.toUpperCase()}
                      </text>

                      {/* Status Dot */}
                      <circle cx={canvasBounds.nodeW - 18} cy="23" r="5" fill={stColor} />

                      {/* Node Display Title */}
                      <text
                        x="12"
                        y="51"
                        fill={T.ink}
                        fontFamily='"Space Grotesk", "Inter", system-ui, sans-serif'
                        fontSize="13"
                        fontWeight="700"
                      >
                        {node.name.length > 23 ? `${node.name.slice(0, 22)}…` : node.name}
                      </text>

                      {/* Model / Transform Mode Subtitle */}
                      <text
                        x="12"
                        y="70"
                        fill={T.muted}
                        fontFamily={MONO}
                        fontSize="10"
                      >
                        {(node.model || prov.defaultModel).slice(0, 28)}
                      </text>

                      {/* Status Footer Line */}
                      <text
                        x="12"
                        y="90"
                        fill={st?.status ? stColor : T.muted}
                        fontFamily={MONO}
                        fontSize="9.5"
                        fontWeight="700"
                      >
                        {st?.status
                          ? `${st.status.toUpperCase()}${st.durationMs ? ` · ${st.durationMs}ms` : ''}`
                          : `ID: ${node.id.slice(0, 18)}`}
                      </text>

                      {/* Left Input Port */}
                      <circle
                        cx="0"
                        cy={canvasBounds.nodeH / 2}
                        r="7"
                        fill={connectSourceId && connectSourceId !== node.id ? T.sky : T.surface}
                        stroke={connectSourceId && connectSourceId !== node.id ? T.sky : T.gold}
                        strokeWidth="2"
                        style={{ cursor: 'crosshair' }}
                        onClick={(e) => handlePortClick(node.id, 'in', e)}
                      >
                        <title>Input port (click after selecting a source OUT port)</title>
                      </circle>

                      {/* Right Output Port */}
                      <circle
                        cx={canvasBounds.nodeW}
                        cy={canvasBounds.nodeH / 2}
                        r="7"
                        fill={isConnecting ? T.sky : T.gold}
                        stroke={T.surface}
                        strokeWidth="2"
                        style={{ cursor: 'crosshair' }}
                        onClick={(e) => handlePortClick(node.id, 'out', e)}
                      >
                        <title>Output port (click to start connecting an edge)</title>
                      </circle>
                    </g>
                  );
                })}
              </svg>
            </Box>

            {/* Accessible Keyboard & Touch Node Quick-Selector */}
            <Box sx={{ mt: 1.75, display: 'flex', flexWrap: 'wrap', gap: 0.9, alignItems: 'center' }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: T.muted, mr: 0.5 }}>
                NODES:
              </Typography>
              {nodes.map((n) => {
                const active = selectedNode?.id === n.id;
                const st = nodeStates[n.id]?.status;
                return (
                  <Button
                    key={n.id}
                    size="small"
                    variant={active ? 'contained' : 'outlined'}
                    onClick={() => setSelectedNodeId(n.id)}
                    sx={{
                      minHeight: 44,
                      px: 1.4,
                      fontFamily: MONO,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      bgcolor: active ? T.gold : 'transparent',
                      color: active ? (isDark ? '#090B10' : '#FFFFFF') : T.ink,
                      borderColor: st === 'error' ? T.crimson : active ? T.gold : T.border,
                    }}
                  >
                    {n.name}
                  </Button>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Right: Node Inspector & Editor Panel */}
        <Grid xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.75, md: 2.25 },
              borderRadius: 2,
              bgcolor: T.surface,
              border: `1px solid ${T.border}`,
              height: '100%',
            }}
          >
            {selectedNode && (
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography
                      component="h3"
                      sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold }}
                    >
                      Node Inspector · {selectedNode.id}
                    </Typography>
                    <Typography sx={{ fontSize: '0.76rem', color: T.muted }}>
                      Configure provider, model, prompt template, and upstream edges.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleRunSelectedStep}
                      disabled={running}
                      startIcon={<PlayArrowIcon />}
                      data-testid="composer-run-step"
                      sx={{
                        minHeight: 44,
                        fontFamily: MONO,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        color: T.emerald,
                        borderColor: T.emerald,
                      }}
                    >
                      Run Step
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleDeleteNode(selectedNode.id)}
                      disabled={nodes.length <= 1 || running}
                      startIcon={<DeleteOutlineIcon />}
                      sx={{
                        minHeight: 44,
                        fontFamily: MONO,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        color: T.crimson,
                        borderColor: T.border,
                        '&:hover': { borderColor: T.crimson },
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Box>

                <TextField
                  id="composer-node-name"
                  label="Node Name"
                  fullWidth
                  size="small"
                  value={selectedNode.name}
                  onChange={(e) => updateSelectedNode({ name: e.target.value })}
                  inputProps={{ 'aria-label': 'Node Name' }}
                  sx={{ '& .MuiInputBase-root': { fontFamily: MONO, fontSize: '0.8rem', bgcolor: T.subtle, color: T.ink } }}
                />

                <TextField
                  id="composer-node-role"
                  label="Agent Role / System Persona"
                  fullWidth
                  size="small"
                  value={selectedNode.role || ''}
                  onChange={(e) => updateSelectedNode({ role: e.target.value })}
                  inputProps={{ 'aria-label': 'Agent Role or System Persona' }}
                  sx={{ '& .MuiInputBase-root': { fontFamily: MONO, fontSize: '0.8rem', bgcolor: T.subtle, color: T.ink } }}
                />

                <Grid container spacing={1.5}>
                  <Grid xs={12} sm={6}>
                    <TextField
                      id="composer-node-provider"
                      select
                      label="Execution Provider"
                      fullWidth
                      size="small"
                      value={selectedNode.provider}
                      onChange={(e) => {
                        const nextProv = e.target.value;
                        const liveModels =
                          nextProv === 'ollama'
                            ? providerData?.providers?.ollama?.models
                            : nextProv === 'agy-hermes'
                            ? providerData?.providers?.['agy-hermes']?.models
                            : null;
                        const defaultModel = liveModels?.[0] || getProviderMeta(nextProv).defaultModel;
                        updateSelectedNode({ provider: nextProv, model: defaultModel });
                      }}
                      inputProps={{ 'aria-label': 'Execution Provider' }}
                      SelectProps={{ inputProps: { 'aria-label': 'Execution Provider' } }}
                      sx={{ '& .MuiInputBase-root': { fontFamily: MONO, fontSize: '0.78rem', bgcolor: T.subtle, color: T.ink } }}
                    >
                      {DAG_PROVIDERS.map((p) => (
                        <MenuItem key={p.id} value={p.id} sx={{ fontFamily: MONO, fontSize: '0.78rem' }}>
                          {p.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <TextField
                      id="composer-node-model"
                      select={modelOptions.length > 1 || selectedNode.provider === 'transform'}
                      label={selectedNode.provider === 'transform' ? 'Transform Mode' : 'Model Identifier'}
                      fullWidth
                      size="small"
                      value={selectedNode.model || ''}
                      onChange={(e) => updateSelectedNode({ model: e.target.value })}
                      inputProps={{ 'aria-label': 'Model Identifier or Transform Mode' }}
                      SelectProps={{ inputProps: { 'aria-label': 'Model Identifier or Transform Mode' } }}
                      sx={{ '& .MuiInputBase-root': { fontFamily: MONO, fontSize: '0.78rem', bgcolor: T.subtle, color: T.ink } }}
                    >
                      {modelOptions.map((m) => (
                        <MenuItem key={m} value={m} sx={{ fontFamily: MONO, fontSize: '0.76rem' }}>
                          {m}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                <Box>
                  <TextField
                    id="composer-node-prompt"
                    label="Prompt Template ({{input}}, {{nodeId.output}})"
                    fullWidth
                    multiline
                    minRows={4}
                    maxRows={7}
                    size="small"
                    value={selectedNode.prompt}
                    onChange={(e) => updateSelectedNode({ prompt: e.target.value })}
                    inputProps={{ 'aria-label': 'Node Prompt Template' }}
                    sx={{ '& .MuiInputBase-root': { fontFamily: MONO, fontSize: '0.76rem', bgcolor: T.subtle, color: T.ink } }}
                  />
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.66rem', color: T.muted }}>INSERT:</Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => updateSelectedNode({ prompt: `${selectedNode.prompt}\n{{input}}`.trim() })}
                      sx={{ minHeight: 44, px: 1.2, fontFamily: MONO, fontSize: '0.68rem', textTransform: 'none', color: T.gold, borderColor: T.border }}
                    >
                      {'{{input}}'}
                    </Button>
                    {nodes
                      .filter((n) => n.id !== selectedNode.id)
                      .map((other) => (
                        <Button
                          key={other.id}
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            updateSelectedNode({ prompt: `${selectedNode.prompt}\n{{${other.id}.output}}`.trim() })
                          }
                          sx={{ minHeight: 44, px: 1.2, fontFamily: MONO, fontSize: '0.68rem', textTransform: 'none', color: T.ink, borderColor: T.border }}
                        >
                          {`{{${other.id}.output}}`}
                        </Button>
                      ))}
                  </Box>
                </Box>

                {/* Upstream Edge Toggle Matrix */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                    <LinkIcon sx={{ fontSize: 16, color: T.gold }} />
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: T.ink }}>
                      UPSTREAM DEPENDENCIES (EDGES INTO {selectedNode.name.toUpperCase()})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.85 }}>
                    {nodes
                      .filter((n) => n.id !== selectedNode.id)
                      .map((other) => {
                        const linked = edges.some((e) => e.source === other.id && e.target === selectedNode.id);
                        return (
                          <Button
                            key={other.id}
                            size="small"
                            variant={linked ? 'contained' : 'outlined'}
                            onClick={() => toggleDependency(other.id, selectedNode.id)}
                            data-testid={`dep-toggle-${other.id}-to-${selectedNode.id}`}
                            sx={{
                              minHeight: 44,
                              px: 1.4,
                              fontFamily: MONO,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              bgcolor: linked ? T.gold : 'transparent',
                              color: linked ? (isDark ? '#090B10' : '#FFFFFF') : T.ink,
                              borderColor: linked ? T.gold : T.border,
                            }}
                          >
                            {linked ? `✓ ${other.name} →` : `+ ${other.name}`}
                          </Button>
                        );
                      })}
                  </Box>
                </Box>
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 5. Wave Execution Outputs & Export Foundry */}
      <Grid container spacing={2.5}>
        {/* Left: Live Execution Output & Wave Log */}
        <Grid xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.75, md: 2.25 },
              borderRadius: 2,
              bgcolor: T.surface,
              border: `1px solid ${T.border}`,
            }}
          >
            <Typography
              component="h3"
              sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: T.ink, mb: 1.5 }}
            >
              Execution Outputs &amp; Wave Telemetry
            </Typography>

            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {nodes.map((n) => {
                const st = nodeStates[n.id];
                const col = statusColor(st?.status);
                return (
                  <Box
                    key={n.id}
                    data-testid={`node-output-${n.id}`}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.75,
                      bgcolor: T.consoleBg,
                      border: `1px solid ${st?.status === 'error' ? T.crimson : st?.status === 'completed' ? T.emerald : T.border}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.75 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 800, color: T.consoleInk }}>
                        {n.name}{' '}
                        <Box component="span" sx={{ color: T.muted, fontWeight: 500 }}>
                          ({n.provider} / {n.model})
                        </Box>
                      </Typography>
                      <Chip
                        size="small"
                        label={
                          st?.status
                            ? `${st.status.toUpperCase()}${st.durationMs ? ` · ${st.durationMs}ms` : ''}${st.tokenEstimate ? ` · ~${st.tokenEstimate} tok` : ''}`
                            : 'IDLE'
                        }
                        sx={{
                          fontFamily: MONO,
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          color: col,
                          bgcolor: T.surface,
                          border: `1px solid ${col}`,
                        }}
                      />
                    </Box>
                    {st?.error ? (
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: T.crimson, whiteSpace: 'pre-wrap' }}>
                        ERROR: {st.error}
                      </Typography>
                    ) : st?.output ? (
                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          p: 1.25,
                          borderRadius: 1.25,
                          bgcolor: T.surface,
                          border: `1px solid ${T.border}`,
                          color: T.consoleInk,
                          fontFamily: MONO,
                          fontSize: '0.73rem',
                          lineHeight: 1.55,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          maxHeight: 220,
                          overflowY: 'auto',
                        }}
                      >
                        {st.output}
                      </Box>
                    ) : (
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: T.muted }}>
                        Awaiting wave execution — click &ldquo;Run Live Pipeline&rdquo; or &ldquo;Dry-Run Preview&rdquo;.
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Stack>

            {runLogs.length > 0 && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: T.consoleBg,
                  border: `1px solid ${T.border}`,
                  maxHeight: 150,
                  overflowY: 'auto',
                }}
              >
                <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 800, color: T.gold, mb: 0.5 }}>
                  DISPATCH TIMELINE LOG
                </Typography>
                {runLogs.map((line, i) => (
                  <Typography key={i} sx={{ fontFamily: MONO, fontSize: '0.7rem', color: T.consoleInk, lineHeight: 1.5 }}>
                    {line}
                  </Typography>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right: Portable JSON / YAML / Python 3 Export Deck */}
        <Grid xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.75, md: 2.25 },
              borderRadius: 2,
              bgcolor: T.surface,
              border: `1px solid ${T.border}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1.25 }}>
              <Typography
                component="h3"
                sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: T.ink }}
              >
                Export Pipeline Foundry
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => copyExport(exportCode)}
                  startIcon={copiedExport ? <CheckIcon /> : <ContentCopyIcon />}
                  sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', color: T.ink, borderColor: T.border }}
                >
                  {copiedExport ? 'Copied' : 'Copy'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const slug = dagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'agent-dag';
                    if (exportTab === 0) downloadJson(`${slug}.dag.json`, JSON.parse(exportCode));
                    else if (exportTab === 1) downloadText(`${slug}.dag.yaml`, exportCode, 'text/yaml');
                    else downloadText(`${slug}_pipeline.py`, exportCode, 'text/x-python');
                  }}
                  startIcon={<DownloadIcon />}
                  sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', color: T.gold, borderColor: T.borderStrong }}
                >
                  Download
                </Button>
              </Stack>
            </Box>

            <Tabs
              value={exportTab}
              onChange={(_, v) => setExportTab(v)}
              aria-label="Export format selector"
              sx={{
                mb: 1.5,
                minHeight: 44,
                borderBottom: `1px solid ${T.border}`,
                '& .MuiTab-root': {
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: T.muted,
                },
                '& .Mui-selected': { color: `${T.gold} !important` },
              }}
            >
              <Tab label="JSON Schema" />
              <Tab label="Zoth YAML" />
              <Tab label="Runnable Python 3" />
            </Tabs>

            <Box
              component="pre"
              data-testid="composer-export-preview"
              sx={{
                m: 0,
                p: 1.5,
                flex: 1,
                borderRadius: 1.5,
                bgcolor: T.consoleBg,
                border: `1px solid ${T.border}`,
                color: T.consoleInk,
                fontFamily: MONO,
                fontSize: '0.72rem',
                lineHeight: 1.55,
                overflow: 'auto',
                maxHeight: 380,
              }}
            >
              {exportCode}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Open-Access Attribution & Support Strip */}
      <Divider sx={{ my: 2.5, borderColor: T.border }} />
      <SovereignSupportBar compact />

      {/* Import JSON Modal */}
      <Dialog open={importOpen} onClose={() => setImportOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontFamily: DISPLAY, fontSize: '1.35rem' }}>
          Import Agent DAG JSON (`zoth/agent-dag/v2`)
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: T.muted, mb: 1.5 }}>
            Paste a valid DAG JSON document. Schema validation rejects missing fields, dangling edges, and cycles.
          </Typography>
          <TextField
            id="composer-import-json-input"
            label="DAG JSON Payload"
            fullWidth
            multiline
            minRows={8}
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setImportError('');
            }}
            inputProps={{ 'aria-label': 'DAG JSON Payload to Import' }}
            sx={{ '& .MuiInputBase-root': { fontFamily: MONO, fontSize: '0.76rem' } }}
          />
          {importError && (
            <Alert severity="error" sx={{ mt: 1.5, fontFamily: MONO, fontSize: '0.74rem' }}>
              {importError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setImportOpen(false)} sx={{ minHeight: 44, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleImportSubmit} sx={{ minHeight: 44, textTransform: 'none', fontWeight: 700 }}>
            Validate &amp; Load DAG
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
