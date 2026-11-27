/**
 * Pure-JS Client-Side Binary Reverse Engineering Engine for Zoth Studio v2.
 *
 * Parses ELF32/ELF64, PE32/PE32+, Mach-O 32/64, and WASM headers & section tables
 * directly in the browser from a Uint8Array with zero backend requirements.
 * Includes 16-byte hex + ASCII dumper, printable ASCII strings extractor,
 * exact Shannon entropy (0.00-8.00 bits/byte), loopback-only bridge URL validator,
 * variable annotation replacer, and all 8 GhidraMCP v3.6.0 tool schemas.
 *
 * Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform
 */

export const GHIDRA_MCP_VERSION = '3.6.0';
export const DEFAULT_BRIDGE_URL = 'http://127.0.0.1:8131';

export const GHIDRA_MCP_TOOLS = [
  {
    name: 'list_methods',
    summary: 'Enumerate exported, internal, and dynamic function symbols.',
    cli: 'ghidra-mcp-bridge methods /bin/echo --filter main',
  },
  {
    name: 'decompile_function',
    summary: 'Decompile target function to C pseudocode AST with active annotations.',
    cli: 'ghidra-mcp-bridge decompile /bin/echo main --engine auto',
  },
  {
    name: 'disassemble_function',
    summary: 'Disassemble target function to native Intel or AT&T instructions.',
    cli: 'ghidra-mcp-bridge disasm /bin/echo main --syntax intel',
  },
  {
    name: 'search_strings',
    summary: 'Extract ASCII/UTF-8 strings with hexadecimal file offsets.',
    cli: 'ghidra-mcp-bridge strings /bin/echo --query POSIX',
  },
  {
    name: 'get_xrefs',
    summary: 'Trace callers, branches, and cross-references to a symbol or address.',
    cli: 'ghidra-mcp-bridge xrefs /bin/echo getenv',
  },
  {
    name: 'annotate_variable',
    summary: 'Rename a local stack/register variable and reflect it in decompile/disasm output.',
    cli: 'POST http://127.0.0.1:8131/api/mcp (tools/call annotate_variable)',
  },
  {
    name: 'inspect_sections_and_entropy',
    summary: 'Parse ELF/PE/Mach-O/WASM headers, sections, and per-section Shannon entropy.',
    cli: 'ghidra-mcp-bridge sections /bin/echo',
  },
  {
    name: 'read_hex_dump',
    summary: 'Read a bounded 16-byte-per-line hexadecimal and ASCII dump.',
    cli: 'ghidra-mcp-bridge hex /bin/echo --offset 0 --length 256',
  },
];

export const SYMBOL_ARG_RE = /^[A-Za-z0-9_.@:$+-]{1,128}$/;

export function isValidSymbolArg(val) {
  return typeof val === 'string' && SYMBOL_ARG_RE.test(val.trim());
}

/**
 * Strictly validate that a bridge URL targets loopback only (127.0.0.1, localhost, [::1]) over http:.
 */
export function validateLoopbackBridgeUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return { valid: false, normalized: null, error: 'Bridge URL is required' };
  }
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'http:') {
      return { valid: false, normalized: null, error: 'Only local http:// loopback URLs are allowed' };
    }
    if (parsed.username || parsed.password) {
      return { valid: false, normalized: null, error: 'Credentials in bridge URL are not permitted' };
    }
    const host = parsed.hostname.toLowerCase();
    if (host !== '127.0.0.1' && host !== 'localhost' && host !== '[::1]' && host !== '::1') {
      return {
        valid: false,
        normalized: null,
        error: `Non-loopback host "${host}" blocked (must be 127.0.0.1, localhost, or [::1])`,
      };
    }
    const portNum = parsed.port ? Number(parsed.port) : 8131;
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
      return { valid: false, normalized: null, error: 'Invalid loopback port number' };
    }
    const hostPart = host === '::1' ? '[::1]' : host;
    return { valid: true, normalized: `http://${hostPart}:${portNum}`, error: null };
  } catch {
    return { valid: false, normalized: null, error: 'Malformed bridge URL' };
  }
}

export function computeShannonEntropy(bytes) {
  if (!bytes || bytes.length === 0) return 0;
  const counts = new Uint32Array(256);
  for (let i = 0; i < bytes.length; i += 1) {
    counts[bytes[i]] += 1;
  }
  let ent = 0;
  const len = bytes.length;
  for (let b = 0; b < 256; b += 1) {
    if (counts[b] > 0) {
      const p = counts[b] / len;
      ent -= p * Math.log2(p);
    }
  }
  return Number(ent.toFixed(4));
}

export function classifyEntropy(entropy) {
  if (entropy >= 7.0) return 'PACKED / ENCRYPTED';
  if (entropy >= 6.0) return 'ELEVATED';
  return 'NORMAL';
}

function readCString(bytes, offset, maxLen = 128) {
  if (offset < 0 || offset >= bytes.length) return '';
  let end = offset;
  const limit = Math.min(bytes.length, offset + maxLen);
  while (end < limit && bytes[end] !== 0) end += 1;
  let out = '';
  for (let i = offset; i < end; i += 1) {
    out += String.fromCharCode(bytes[i]);
  }
  return out;
}

function readU16(dv, off, le) {
  return dv.getUint16(off, le);
}
function readU32(dv, off, le) {
  return dv.getUint32(off, le);
}
function readU64Num(dv, off, le) {
  const lo = dv.getUint32(le ? off : off + 4, le);
  const hi = dv.getUint32(le ? off + 4 : off, le);
  return hi * 4294967296 + lo;
}
function toHex(val) {
  return '0x' + Math.max(0, Math.floor(val)).toString(16);
}

export function detectBinaryMagic(bytes) {
  if (!bytes || bytes.length < 4) return null;
  if (bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46) {
    if (bytes.length >= 5 && bytes[4] === 1) return 'ELF32';
    if (bytes.length >= 5 && bytes[4] === 2) return 'ELF64';
    return 'ELF';
  }
  if (bytes[0] === 0x4d && bytes[1] === 0x5a && bytes.length >= 64) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const lfanew = dv.getUint32(0x3c, true);
    if (
      lfanew >= 0x40 &&
      lfanew + 4 <= bytes.length &&
      bytes[lfanew] === 0x50 &&
      bytes[lfanew + 1] === 0x45 &&
      bytes[lfanew + 2] === 0x00 &&
      bytes[lfanew + 3] === 0x00
    ) {
      const optOff = lfanew + 24;
      if (optOff + 2 <= bytes.length) {
        const magic = dv.getUint16(optOff, true);
        if (magic === 0x20b) return 'PE32+';
        if (magic === 0x10b) return 'PE32';
      }
      return 'PE';
    }
  }
  const m32 = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  if (m32 === 0xfeedfacf || m32 === 0xcffaedfe) return 'Mach-O 64-bit';
  if (m32 === 0xfeedface || m32 === 0xcefaedfe) return 'Mach-O 32-bit';
  if (m32 === 0xcafebabe && bytes.length >= 8) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const nfat = dv.getUint32(4, false);
    if (nfat >= 1 && nfat <= 16) return 'Mach-O Universal';
  }
  if (bytes[0] === 0x00 && bytes[1] === 0x61 && bytes[2] === 0x73 && bytes[3] === 0x6d && bytes.length >= 8) {
    return 'WASM';
  }
  return null;
}

export function formatHexDump(bytes, offset = 0, length = 256) {
  const start = Math.max(0, offset);
  const slice = bytes.subarray(start, Math.min(bytes.length, start + Math.min(4096, Math.max(16, length))));
  const rows = [];
  for (let i = 0; i < slice.length; i += 16) {
    const chunk = slice.subarray(i, Math.min(slice.length, i + 16));
    const left = [];
    const right = [];
    let ascii = '';
    for (let j = 0; j < chunk.length; j += 1) {
      const b = chunk[j];
      const hx = b.toString(16).padStart(2, '0');
      if (j < 8) left.push(hx);
      else right.push(hx);
      ascii += b >= 32 && b <= 126 ? String.fromCharCode(b) : '.';
    }
    const hexCol = `${left.join(' ').padEnd(23, ' ')}  ${right.join(' ').padEnd(23, ' ')}`.trimEnd();
    const addr = '0x' + (start + i).toString(16).padStart(8, '0');
    rows.push({
      offset: addr,
      hex: hexCol,
      ascii,
      line: `${addr}  ${hexCol.padEnd(48, ' ')}  |${ascii}|`,
    });
  }
  return rows;
}

export function extractAsciiStrings(bytes, minLen = 4, maxCount = 200) {
  const results = [];
  let start = -1;
  let current = '';
  for (let i = 0; i < bytes.length; i += 1) {
    const b = bytes[i];
    if (b >= 32 && b <= 126) {
      if (start === -1) start = i;
      current += String.fromCharCode(b);
    } else {
      if (current.length >= minLen) {
        results.push({ offset: '0x' + start.toString(16), value: current });
        if (results.length >= maxCount) return results;
      }
      start = -1;
      current = '';
    }
  }
  if (current.length >= minLen && results.length < maxCount) {
    results.push({ offset: '0x' + start.toString(16), value: current });
  }
  return results;
}

export function parseBinaryBuffer(inputBytes, fileName = 'uploaded.bin') {
  const bytes = inputBytes instanceof Uint8Array ? inputBytes : new Uint8Array(inputBytes);
  const format = detectBinaryMagic(bytes);
  if (!format) {
    throw new Error('Unsupported file format: expected ELF, PE32/PE32+, Mach-O, or WASM binary magic');
  }

  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const overallEntropy = computeShannonEntropy(bytes);
  const result = {
    name: fileName,
    format,
    arch: 'unknown',
    endianness: 'little',
    entryPoint: '0x0',
    sizeBytes: bytes.length,
    overallEntropy,
    overallStatus: classifyEntropy(overallEntropy),
    sections: [],
    packedSections: 0,
    strings: extractAsciiStrings(bytes, 4, 120),
    hexRows: formatHexDump(bytes, 0, 256),
  };

  if (format === 'ELF64' || format === 'ELF32' || format === 'ELF') {
    const is64 = bytes[4] === 2;
    const le = bytes[5] !== 2;
    result.endianness = le ? 'little' : 'big';
    result.format = is64 ? 'ELF64' : 'ELF32';
    const machineMap = {
      0x03: 'x86',
      0x08: 'MIPS',
      0x14: 'PowerPC',
      0x28: 'ARM',
      0x3e: 'x86_64',
      0xb7: 'AArch64',
      0xf3: 'RISC-V',
    };
    if (is64 && bytes.length >= 64) {
      const eMachine = readU16(dv, 18, le);
      result.arch = machineMap[eMachine] || `ELF-0x${eMachine.toString(16)}`;
      result.entryPoint = toHex(readU64Num(dv, 24, le));
      const shoff = readU64Num(dv, 40, le);
      const shentsize = readU16(dv, 58, le);
      const shnum = readU16(dv, 60, le);
      const shstrndx = readU16(dv, 62, le);
      let strOff = 0;
      let strSz = 0;
      if (shoff > 0 && shentsize >= 64 && shstrndx < shnum) {
        const hdr = shoff + shstrndx * shentsize;
        if (hdr + 64 <= bytes.length) {
          strOff = readU64Num(dv, hdr + 24, le);
          strSz = readU64Num(dv, hdr + 32, le);
        }
      }
      const strBuf = strOff + strSz <= bytes.length ? bytes.subarray(strOff, strOff + strSz) : new Uint8Array(0);
      for (let i = 0; i < Math.min(shnum, 256); i += 1) {
        const off = shoff + i * shentsize;
        if (off + 64 > bytes.length) break;
        const shName = readU32(dv, off, le);
        const shType = readU32(dv, off + 4, le);
        const shFlags = readU64Num(dv, off + 8, le);
        const shAddr = readU64Num(dv, off + 16, le);
        const shOffset = readU64Num(dv, off + 24, le);
        const shSize = readU64Num(dv, off + 32, le);
        const name = readCString(strBuf, shName) || `section_${i}`;
        const secBytes =
          shType !== 8 && shSize > 0 && shOffset + shSize <= bytes.length
            ? bytes.subarray(shOffset, shOffset + shSize)
            : new Uint8Array(0);
        const ent = computeShannonEntropy(secBytes);
        const flags = `${shFlags & 1 ? 'W' : ''}${shFlags & 2 ? 'A' : ''}${shFlags & 4 ? 'X' : ''}` || '-';
        result.sections.push({
          name,
          vaddr: toHex(shAddr),
          offset: toHex(shOffset),
          size: shSize,
          flags,
          entropy: ent,
          status: classifyEntropy(ent),
          packed: ent >= 7.0,
        });
      }
    } else if (!is64 && bytes.length >= 52) {
      const eMachine = readU16(dv, 18, le);
      result.arch = machineMap[eMachine] || `ELF-0x${eMachine.toString(16)}`;
      result.entryPoint = toHex(readU32(dv, 24, le));
      const shoff = readU32(dv, 32, le);
      const shentsize = readU16(dv, 46, le);
      const shnum = readU16(dv, 48, le);
      const shstrndx = readU16(dv, 50, le);
      let strOff = 0;
      let strSz = 0;
      if (shoff > 0 && shentsize >= 40 && shstrndx < shnum) {
        const hdr = shoff + shstrndx * shentsize;
        if (hdr + 40 <= bytes.length) {
          strOff = readU32(dv, hdr + 16, le);
          strSz = readU32(dv, hdr + 20, le);
        }
      }
      const strBuf = strOff + strSz <= bytes.length ? bytes.subarray(strOff, strOff + strSz) : new Uint8Array(0);
      for (let i = 0; i < Math.min(shnum, 256); i += 1) {
        const off = shoff + i * shentsize;
        if (off + 40 > bytes.length) break;
        const shName = readU32(dv, off, le);
        const shType = readU32(dv, off + 4, le);
        const shFlags = readU32(dv, off + 8, le);
        const shAddr = readU32(dv, off + 12, le);
        const shOffset = readU32(dv, off + 16, le);
        const shSize = readU32(dv, off + 20, le);
        const name = readCString(strBuf, shName) || `section_${i}`;
        const secBytes =
          shType !== 8 && shSize > 0 && shOffset + shSize <= bytes.length
            ? bytes.subarray(shOffset, shOffset + shSize)
            : new Uint8Array(0);
        const ent = computeShannonEntropy(secBytes);
        const flags = `${shFlags & 1 ? 'W' : ''}${shFlags & 2 ? 'A' : ''}${shFlags & 4 ? 'X' : ''}` || '-';
        result.sections.push({
          name,
          vaddr: toHex(shAddr),
          offset: toHex(shOffset),
          size: shSize,
          flags,
          entropy: ent,
          status: classifyEntropy(ent),
          packed: ent >= 7.0,
        });
      }
    }
  } else if (format === 'PE32+' || format === 'PE32' || format === 'PE') {
    const lfanew = readU32(dv, 0x3c, true);
    const coffOff = lfanew + 4;
    if (coffOff + 20 <= bytes.length) {
      const machine = readU16(dv, coffOff, true);
      const numSec = readU16(dv, coffOff + 2, true);
      const optSize = readU16(dv, coffOff + 16, true);
      const peMachines = { 0x014c: 'x86 (i386)', 0x8664: 'x86_64 (AMD64)', 0xaa64: 'ARM64', 0x01c0: 'ARM' };
      result.arch = peMachines[machine] || `PE-0x${machine.toString(16)}`;
      const optOff = coffOff + 20;
      if (optSize >= 24 && optOff + 24 <= bytes.length) {
        const optMagic = readU16(dv, optOff, true);
        const entryRva = readU32(dv, optOff + 16, true);
        let imageBase = 0;
        if (optMagic === 0x20b && optOff + 32 <= bytes.length) {
          result.format = 'PE32+';
          imageBase = readU64Num(dv, optOff + 24, true);
        } else if (optMagic === 0x10b && optOff + 32 <= bytes.length) {
          result.format = 'PE32';
          imageBase = readU32(dv, optOff + 28, true);
        }
        result.entryPoint = toHex(imageBase + entryRva);
      }
      const secOff = optOff + optSize;
      for (let i = 0; i < Math.min(numSec, 128); i += 1) {
        const off = secOff + i * 40;
        if (off + 40 > bytes.length) break;
        const name = readCString(bytes, off, 8) || `sec_${i}`;
        const vSize = readU32(dv, off + 8, true);
        const vAddr = readU32(dv, off + 12, true);
        const rawSz = readU32(dv, off + 16, true);
        const rawPtr = readU32(dv, off + 20, true);
        const chars = readU32(dv, off + 36, true);
        const secBytes = rawSz > 0 && rawPtr + rawSz <= bytes.length ? bytes.subarray(rawPtr, rawPtr + rawSz) : new Uint8Array(0);
        const ent = computeShannonEntropy(secBytes);
        const flags =
          `${chars & 0x40000000 ? 'R' : ''}${chars & 0x80000000 ? 'W' : ''}${chars & 0x20000000 ? 'X' : ''}` || '-';
        result.sections.push({
          name,
          vaddr: toHex(vAddr),
          offset: toHex(rawPtr),
          size: rawSz || vSize,
          flags,
          entropy: ent,
          status: classifyEntropy(ent),
          packed: ent >= 7.0,
        });
      }
    }
  } else if (format.startsWith('Mach-O')) {
    const m32 = readU32(dv, 0, false);
    const is64 = m32 === 0xfeedfacf || m32 === 0xcffaedfe;
    const le = m32 === 0xcffaedfe || m32 === 0xcefaedfe;
    result.endianness = le ? 'little' : 'big';
    const cpuMap = { 0x7: 'x86', 0x01000007: 'x86_64', 0xc: 'ARM', 0x0100000c: 'ARM64' };
    if (format === 'Mach-O Universal') {
      result.arch = 'Universal Fat';
    } else {
      const hdrSize = is64 ? 32 : 28;
      if (bytes.length >= hdrSize) {
        const cpu = readU32(dv, 4, le);
        const ncmds = readU32(dv, 16, le);
        result.arch = cpuMap[cpu] || `MachO-0x${cpu.toString(16)}`;
        let cmdOff = hdrSize;
        for (let c = 0; c < Math.min(ncmds, 128); c += 1) {
          if (cmdOff + 8 > bytes.length) break;
          const cmd = readU32(dv, cmdOff, le);
          const cmdSize = readU32(dv, cmdOff + 4, le);
          if (cmdSize < 8 || cmdOff + cmdSize > bytes.length) break;
          if (cmd === 0x80000028 && cmdSize >= 24) {
            result.entryPoint = toHex(readU64Num(dv, cmdOff + 8, le));
          } else if (cmd === 0x19 && cmdSize >= 72) {
            const segName = readCString(bytes, cmdOff + 8, 16);
            const initProt = readU32(dv, cmdOff + 60, le);
            const nsects = readU32(dv, cmdOff + 64, le);
            let sOff = cmdOff + 72;
            for (let s = 0; s < Math.min(nsects, 64); s += 1) {
              if (sOff + 80 > cmdOff + cmdSize) break;
              const sectName = readCString(bytes, sOff, 16);
              const sSeg = readCString(bytes, sOff + 16, 16) || segName;
              const sAddr = readU64Num(dv, sOff + 32, le);
              const sSize = readU64Num(dv, sOff + 40, le);
              const sFileOff = readU32(dv, sOff + 48, le);
              const secBytes =
                sSize > 0 && sFileOff + sSize <= bytes.length ? bytes.subarray(sFileOff, sFileOff + sSize) : new Uint8Array(0);
              const ent = computeShannonEntropy(secBytes);
              const flags = `${initProt & 1 ? 'R' : ''}${initProt & 2 ? 'W' : ''}${initProt & 4 ? 'X' : ''}` || '-';
              result.sections.push({
                name: `${sSeg}.${sectName}`,
                vaddr: toHex(sAddr),
                offset: toHex(sFileOff),
                size: sSize,
                flags,
                entropy: ent,
                status: classifyEntropy(ent),
                packed: ent >= 7.0,
              });
              sOff += 80;
            }
          }
          cmdOff += cmdSize;
        }
      }
    }
  } else if (format === 'WASM') {
    result.arch = 'WebAssembly (wasm32)';
    result.entryPoint = '0x8';
    const secNames = {
      0: 'custom', 1: 'type', 2: 'import', 3: 'function', 4: 'table',
      5: 'memory', 6: 'global', 7: 'export', 8: 'start', 9: 'element',
      10: 'code', 11: 'data', 12: 'datacount',
    };
    let pos = 8;
    while (pos < bytes.length) {
      const id = bytes[pos++];
      let len = 0;
      let shift = 0;
      while (pos < bytes.length && shift < 35) {
        const b = bytes[pos++];
        len |= (b & 0x7f) << shift;
        if ((b & 0x80) === 0) break;
        shift += 7;
      }
      const secBytes = bytes.subarray(pos, Math.min(bytes.length, pos + len));
      const ent = computeShannonEntropy(secBytes);
      result.sections.push({
        name: secNames[id] || `sec_${id}`,
        vaddr: toHex(pos),
        offset: toHex(pos),
        size: secBytes.length,
        flags: id === 10 ? 'RX' : 'R',
        entropy: ent,
        status: classifyEntropy(ent),
        packed: ent >= 7.0,
      });
      pos += len;
    }
  }

  result.packedSections = result.sections.filter((s) => s.packed).length;
  return result;
}

export function applyVariableAnnotations(pseudocode, annotationsMap) {
  if (!pseudocode || !annotationsMap || Object.keys(annotationsMap).length === 0) {
    return pseudocode;
  }
  let out = pseudocode;
  const pairs = [];
  for (const [oldName, newName] of Object.entries(annotationsMap)) {
    if (!isValidSymbolArg(oldName) || !isValidSymbolArg(newName)) continue;
    const escaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`\\b${escaped}\\b`, 'g'), newName);
    pairs.push(`${oldName} -> ${newName}`);
  }
  if (pairs.length === 0) return pseudocode;
  return `/* Zoth Annotations: ${pairs.join(', ')} */\n${out}`;
}
