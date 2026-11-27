import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GHIDRA_MCP_VERSION,
  GHIDRA_MCP_TOOLS,
  validateLoopbackBridgeUrl,
  computeShannonEntropy,
  detectBinaryMagic,
  parseBinaryBuffer,
  formatHexDump,
  extractAsciiStrings,
  applyVariableAnnotations,
  isValidSymbolArg,
} from '../src/utils/ghidraMcpEngine.js';

function makeSyntheticPe64() {
  const buf = new Uint8Array(0x400);
  const dv = new DataView(buf.buffer);
  buf[0] = 0x4d; buf[1] = 0x5a; // MZ
  dv.setUint32(0x3c, 0x80, true);
  buf[0x80] = 0x50; buf[0x81] = 0x45; // PE\0\0
  dv.setUint16(0x84, 0x8664, true); // AMD64
  dv.setUint16(0x86, 2, true); // 2 sections
  dv.setUint16(0x94, 0xf0, true); // optional hdr size
  dv.setUint16(0x98, 0x20b, true); // PE32+
  dv.setUint32(0xa8, 0x1000, true); // entry RVA
  dv.setUint32(0xb0, 0x40000000, true); // low imageBase
  dv.setUint32(0xb4, 0x00000001, true); // high imageBase -> 0x140000000

  const secOff = 0x98 + 0xf0;
  // .text
  for (let i = 0; i < 5; i += 1) buf[secOff + i] = '.text'.charCodeAt(i);
  dv.setUint32(secOff + 8, 64, true);
  dv.setUint32(secOff + 12, 0x1000, true);
  dv.setUint32(secOff + 16, 64, true);
  dv.setUint32(secOff + 20, 0x200, true);
  dv.setUint32(secOff + 36, 0x60000020, true);
  for (let i = 0; i < 64; i += 1) buf[0x200 + i] = 0x90;

  // .packed (256 uniform bytes -> 8.0000 bits/byte)
  const sec2 = secOff + 40;
  for (let i = 0; i < 7; i += 1) buf[sec2 + i] = '.packed'.charCodeAt(i);
  dv.setUint32(sec2 + 8, 256, true);
  dv.setUint32(sec2 + 12, 0x2000, true);
  dv.setUint32(sec2 + 16, 256, true);
  dv.setUint32(sec2 + 20, 0x300, true);
  dv.setUint32(sec2 + 36, 0xc0000040, true);
  for (let i = 0; i < 256; i += 1) buf[0x300 + i] = i;
  return buf;
}

function makeSyntheticElf64() {
  const buf = new Uint8Array(0x200);
  const dv = new DataView(buf.buffer);
  buf.set([0x7f, 0x45, 0x4c, 0x46, 2, 1, 1, 0], 0);
  dv.setUint16(18, 0x3e, true); // x86_64
  dv.setUint32(24, 0x401020, true); // entry
  // Insert ASCII string
  const msg = 'ZOTH_ELF64_ENGINE_OK';
  for (let i = 0; i < msg.length; i += 1) buf[0x100 + i] = msg.charCodeAt(i);
  return buf;
}

test('version and 8 MCP tools registry', () => {
  assert.equal(GHIDRA_MCP_VERSION, '3.6.0');
  assert.equal(GHIDRA_MCP_TOOLS.length, 8);
  const names = GHIDRA_MCP_TOOLS.map((t) => t.name);
  assert.ok(names.includes('inspect_sections_and_entropy'));
  assert.ok(names.includes('read_hex_dump'));
});

test('loopback-only bridge URL validation blocks external hosts', () => {
  assert.equal(validateLoopbackBridgeUrl('http://127.0.0.1:8131/').valid, true);
  assert.equal(validateLoopbackBridgeUrl('http://localhost:8131').valid, true);
  assert.equal(validateLoopbackBridgeUrl('http://[::1]:8131').valid, true);
  assert.equal(validateLoopbackBridgeUrl('https://evil.example:8131').valid, false);
  assert.equal(validateLoopbackBridgeUrl('http://169.254.169.254/latest').valid, false);
  assert.equal(validateLoopbackBridgeUrl('http://user:pass@127.0.0.1:8131').valid, false);
});

test('pure-JS PE32+ and ELF64 parser + Shannon entropy + hex + strings', () => {
  const pe = parseBinaryBuffer(makeSyntheticPe64(), 'sample.exe');
  assert.equal(pe.format, 'PE32+');
  assert.equal(pe.arch, 'x86_64 (AMD64)');
  assert.equal(pe.sections.length, 2);
  assert.equal(pe.sections[1].entropy, 8);
  assert.equal(pe.sections[1].packed, true);
  assert.equal(pe.packedSections, 1);

  const elf = parseBinaryBuffer(makeSyntheticElf64(), 'sample.elf');
  assert.equal(elf.format, 'ELF64');
  assert.equal(elf.arch, 'x86_64');
  assert.equal(elf.entryPoint, '0x401020');
  assert.ok(elf.strings.some((s) => s.value === 'ZOTH_ELF64_ENGINE_OK'));
  assert.ok(elf.hexRows[0].hex.startsWith('7f 45 4c 46'));

  assert.throws(() => parseBinaryBuffer(new TextEncoder().encode('plain text config'), 'netlify.toml'));
  assert.equal(detectBinaryMagic(new Uint8Array([0x00, 0x61, 0x73, 0x6d, 1, 0, 0, 0])), 'WASM');
  assert.equal(computeShannonEntropy(new Uint8Array(64)), 0);
  assert.equal(formatHexDump(new Uint8Array(32), 0, 32).length, 2);
  assert.equal(extractAsciiStrings(new TextEncoder().encode('ab\0HELLO_WORLD\0x'), 4).length, 1);
});

test('symbol validation and variable annotation replacement', () => {
  assert.equal(isValidSymbolArg('vault_cfg'), true);
  assert.equal(isValidSymbolArg('main; !id'), false);
  const renamed = applyVariableAnnotations('int main() { vault_init(&config); return config_ok; }', {
    config: 'vault_cfg',
  });
  assert.ok(renamed.includes('/* Zoth Annotations: config -> vault_cfg */'));
  assert.ok(renamed.includes('vault_init(&vault_cfg)'));
  assert.ok(renamed.includes('config_ok')); // whole-word match preserves config_ok
});
