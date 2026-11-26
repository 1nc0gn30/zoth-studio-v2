#!/usr/bin/env node
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
  CONSENSUS_SCHEMA_VERSION,
  STARTER_PRESETS,
  sha256Hex,
  sha256Async,
  computeMerkleRoot,
  computeBftBounds,
  tallyByzantineVotes,
  analyzeProposalDiff,
  evaluateDeterministicRound,
  verifyConsensusReceipt,
  validateLocalModelTarget,
  validateConsensusRunRequest,
  sanitizeConsensusText,
  neutralizeCsvCell,
  buildConsensusJsonExport,
  buildConsensusMarkdownExport,
  buildConsensusCsvExport,
} from '../src/utils/consensusEngine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('Consensus Battle Arena Pure Engine (v2.3.0)', () => {
  it('mirrors src/utils/consensusEngine.js and server/consensus-engine.mjs byte-identically', () => {
    const clientSrc = fs.readFileSync(path.join(root, 'src/utils/consensusEngine.js'), 'utf8');
    const serverSrc = fs.readFileSync(path.join(root, 'server/consensus-engine.mjs'), 'utf8');
    assert.equal(clientSrc, serverSrc);
    assert.equal(CONSENSUS_SCHEMA_VERSION, '2.3.0');
  });

  it('computes exact FIPS 180-4 SHA-256 digests matching node:crypto', async () => {
    const vectors = [
      '',
      'abc',
      'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
      'Byzantine Quorum N >= 3f + 1 — 日本語 UTF-8 test ✓',
      'x'.repeat(2048),
    ];
    for (const v of vectors) {
      const expected = crypto.createHash('sha256').update(v, 'utf8').digest('hex');
      assert.equal(sha256Hex(v), expected);
      assert.equal(await sha256Async(v), expected);
    }
  });

  it('enforces exact BFT quorum math (N >= 3f + 1, fMax, Q = 2f + 1 / supermajority)', () => {
    const b4_1 = computeBftBounds(4, 1);
    assert.equal(b4_1.fMax, 1);
    assert.equal(b4_1.minNodesForF, 4);
    assert.equal(b4_1.byzantineSafe, true);
    assert.equal(b4_1.quorumByF, 3);
    assert.equal(b4_1.quorumRequired, 3);

    const b4_2 = computeBftBounds(4, 2);
    assert.equal(b4_2.fMax, 1);
    assert.equal(b4_2.byzantineSafe, false);

    const b7_2 = computeBftBounds(7, 2);
    assert.equal(b7_2.fMax, 2);
    assert.equal(b7_2.minNodesForF, 7);
    assert.equal(b7_2.byzantineSafe, true);
    assert.equal(b7_2.quorumByF, 5);
    assert.equal(b7_2.quorumRequired, 5);

    const b7_3 = computeBftBounds(7, 3);
    assert.equal(b7_3.byzantineSafe, false);
  });

  it('transitions verdicts cleanly across QUORUM_REACHED, BYZANTINE_SPLIT, and FAULT_THRESHOLD_EXCEEDED', () => {
    const approveTally = tallyByzantineVotes([
      { vote: 'APPROVE' },
      { vote: 'APPROVE' },
      { vote: 'APPROVE' },
      { vote: 'FAULTY' },
    ], 1);
    assert.equal(approveTally.verdict, 'QUORUM_REACHED');
    assert.equal(approveTally.decision, 'APPROVE');
    assert.equal(approveTally.safetyIntact, true);

    const splitTally = tallyByzantineVotes([
      { vote: 'APPROVE' },
      { vote: 'APPROVE' },
      { vote: 'REJECT' },
      { vote: 'REJECT' },
    ], 0);
    assert.equal(splitTally.verdict, 'BYZANTINE_SPLIT');
    assert.equal(splitTally.decision, 'NO_QUORUM');
    assert.equal(splitTally.safetyIntact, true);
    assert.equal(splitTally.livenessIntact, false);

    const unsafeTally = tallyByzantineVotes([
      { vote: 'APPROVE' },
      { vote: 'APPROVE' },
      { vote: 'FAULTY' },
      { vote: 'FAULTY' },
    ], 2);
    assert.equal(unsafeTally.verdict, 'FAULT_THRESHOLD_EXCEEDED');
    assert.equal(unsafeTally.decision, 'HALTED_UNSAFE');
    assert.equal(unsafeTally.safetyIntact, false);
  });

  it('arbitrates starter diffs deterministically and verifies SHA-256 Merkle receipts', () => {
    const safeRound = evaluateDeterministicRound({
      proposalText: STARTER_PRESETS[0].proposal,
      nodeCount: 5,
      faultyCount: 1,
    });
    assert.equal(safeRound.tally.verdict, 'QUORUM_REACHED');
    assert.equal(safeRound.tally.decision, 'APPROVE');
    assert.match(safeRound.receipt.proposalHash, /^[0-9a-f]{64}$/);
    assert.match(safeRound.receipt.merkleRoot, /^[0-9a-f]{64}$/);
    assert.match(safeRound.receipt.receiptHash, /^[0-9a-f]{64}$/);
    assert.ok(!safeRound.receipt.merkleRoot.endsWith('c4e91b'));

    const intactCheck = verifyConsensusReceipt(safeRound.receipt, STARTER_PRESETS[0].proposal, safeRound.votes);
    assert.equal(intactCheck.valid, true);

    const tamperCheck = verifyConsensusReceipt(safeRound.receipt, STARTER_PRESETS[0].proposal + '\n+eval(x)', safeRound.votes);
    assert.equal(tamperCheck.valid, false);

    const riskyRound = evaluateDeterministicRound({
      proposalText: STARTER_PRESETS[1].proposal,
      nodeCount: 5,
      faultyCount: 0,
    });
    assert.equal(riskyRound.tally.verdict, 'QUORUM_REACHED');
    assert.equal(riskyRound.tally.decision, 'REJECT');
    assert.ok(riskyRound.diffAnalysis.findings.some((f) => f.id === 'SEC-EVAL'));
    assert.ok(riskyRound.diffAnalysis.findings.some((f) => f.id === 'SEC-XSS'));
    assert.ok(riskyRound.diffAnalysis.findings.some((f) => f.id === 'SEC-WILDCARD'));

    const merkle = computeMerkleRoot([sha256Hex('a'), sha256Hex('b'), sha256Hex('c')]);
    assert.equal(merkle.leafCount, 3);
    assert.match(merkle.root, /^[0-9a-f]{64}$/);
  });

  it('enforces SSRF-safe local model validation and rejects external URLs or arbitrary hosts', () => {
    assert.equal(validateLocalModelTarget({ provider: 'agy-hermes', model: 'gemini-4-neon-high' }).valid, true);
    assert.equal(validateLocalModelTarget({ provider: 'ollama', model: 'hermes3-64k:latest' }).valid, true);
    assert.equal(validateLocalModelTarget({ provider: 'openai', model: 'gpt-4o' }).valid, false);
    assert.equal(validateLocalModelTarget({ provider: 'ollama', model: 'http://169.254.169.254/latest' }).valid, false);
    assert.equal(validateLocalModelTarget({ provider: 'ollama', model: 'llama3; rm -rf /' }).valid, false);
    assert.equal(validateLocalModelTarget({ provider: 'ollama', model: 'llama3', url: 'https://evil.example' }).valid, false);

    assert.equal(
      validateConsensusRunRequest({ proposal: 'test', mode: 'in-browser-deterministic', host: '169.254.169.254' }).valid,
      false
    );
    assert.equal(
      validateConsensusRunRequest({
        proposal: 'test',
        mode: 'loopback-models',
        models: [
          { provider: 'ollama', model: 'm1' },
          { provider: 'ollama', model: 'm2' },
          { provider: 'ollama', model: 'm3' },
          { provider: 'ollama', model: 'm4' },
          { provider: 'ollama', model: 'm5' },
        ],
      }).valid,
      false
    );
  });

  it('redacts literal home paths and neutralizes spreadsheet formula injection in CSV/JSON/MD exports', () => {
    const cleaned = sanitizeConsensusText('Read /home/operator/secrets.env and /Users/alice/.ssh/id_rsa');
    assert.ok(!/\/home\/operator\//.test(cleaned));
    assert.ok(!/\/Users\/alice\//.test(cleaned));
    assert.ok(cleaned.includes('~/secrets.env'));

    assert.equal(neutralizeCsvCell('=CMD("calc")'), `"'=CMD(""calc"")"`);
    assert.equal(neutralizeCsvCell('+1+2'), `'+1+2`);
    assert.equal(neutralizeCsvCell('-10'), `'-10`);
    assert.equal(neutralizeCsvCell('@SUM(A1:A2)'), `'@SUM(A1:A2)`);

    const round = evaluateDeterministicRound({
      proposalText: '+const p = "/home/operator/private/key.pem";\n+const formula = "=HYPERLINK(\\"http://evil\\")";',
      nodeCount: 4,
      faultyCount: 0,
    });
    const jsonOut = buildConsensusJsonExport(round);
    const mdOut = buildConsensusMarkdownExport(round);
    const csvOut = buildConsensusCsvExport(round);

    assert.ok(!/\/home\/operator\//.test(jsonOut));
    assert.ok(!/\/home\/operator\//.test(mdOut));
    assert.ok(!/\/home\/operator\//.test(csvOut));
    assert.ok(mdOut.includes('Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform'));
    assert.ok(csvOut.startsWith('validator_id,name,role,source,vote,score,latency_ms,verdict,merkle_root,rationale'));
  });
});
