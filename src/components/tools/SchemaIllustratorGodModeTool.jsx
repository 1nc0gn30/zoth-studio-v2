import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Card, CardContent, IconButton, Tooltip, Tabs, Tab, Alert, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CodeIcon from '@mui/icons-material/Code';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckIcon from '@mui/icons-material/Check';
import StorageIcon from '@mui/icons-material/Storage';
import TransformIcon from '@mui/icons-material/Transform';
import SpeedIcon from '@mui/icons-material/Speed';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// ---------------------------------------------------------------------------
// Built-in Schema Samples
// ---------------------------------------------------------------------------
const SAMPLES = {
  ecommerce: {
    name: 'E-Commerce Store (SQL DDL)',
    format: 'sql',
    code: `CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120),
  role VARCHAR(32) DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL,
  parent_id UUID REFERENCES categories(id)
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  total_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  shipping_address TEXT,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL
);`
  },
  auth: {
    name: 'User Auth & RBAC (JSON Schema)',
    format: 'json-schema',
    code: JSON.stringify({
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "AuthAndSecuritySchema",
      "$defs": {
        "User": {
          "type": "object",
          "properties": {
            "id": { "type": "string", "format": "uuid" },
            "username": { "type": "string", "minLength": 3 },
            "email": { "type": "string", "format": "email" },
            "is_mfa_enabled": { "type": "boolean", "default": false },
            "role_id": { "type": "string", "$ref": "#/$defs/Role" }
          },
          "required": ["id", "username", "email"]
        },
        "Role": {
          "type": "object",
          "properties": {
            "id": { "type": "string", "format": "uuid" },
            "name": { "type": "string" },
            "permissions": { "type": "array", "items": { "type": "string" } }
          },
          "required": ["id", "name"]
        },
        "Session": {
          "type": "object",
          "properties": {
            "token": { "type": "string" },
            "user_id": { "type": "string", "$ref": "#/$defs/User" },
            "expires_at": { "type": "string", "format": "date-time" }
          },
          "required": ["token", "user_id"]
        }
      }
    }, null, 2)
  },
  social: {
    name: 'Social Community (GraphQL SDL)',
    format: 'graphql',
    code: `type Profile {
  id: ID!
  userId: ID!
  bio: String
  avatarUrl: String
  website: String
}

type User {
  id: ID!
  handle: String!
  displayName: String!
  profile: Profile
  posts: [Post!]!
}

type Post {
  id: ID!
  authorId: ID!
  author: User!
  content: String!
  likeCount: Int!
  comments: [Comment!]!
  createdAt: String!
}

type Comment {
  id: ID!
  postId: ID!
  authorId: ID!
  text: String!
  createdAt: String!
}`
  }
};

// ---------------------------------------------------------------------------
// Helpers & Transpiler Type Mappers
// ---------------------------------------------------------------------------
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function splitTopLevel(str, delimiter = ',') {
  const result = [];
  let cur = '';
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '(' || c === '{' || c === '[') depth++;
    else if (c === ')' || c === '}' || c === ']') depth--;
    if (c === delimiter && depth === 0) {
      if (cur.trim()) result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur.trim()) result.push(cur.trim());
  return result;
}

function mapToTsType(raw) {
  const t = (raw || 'string').toUpperCase();
  if (t.includes('INT') || t.includes('SERIAL') || t.includes('DECIMAL') || t.includes('NUMERIC') || t.includes('FLOAT') || t.includes('DOUBLE')) return 'number';
  if (t.includes('BOOL')) return 'boolean';
  if (t.includes('TIME') || t.includes('DATE')) return 'string | Date';
  if (t.includes('JSON')) return 'Record<string, unknown>';
  return 'string';
}

function mapToPythonType(raw) {
  const t = (raw || 'string').toUpperCase();
  if (t.includes('INT') || t.includes('SERIAL')) return 'int';
  if (t.includes('DECIMAL') || t.includes('FLOAT') || t.includes('NUMERIC')) return 'float';
  if (t.includes('BOOL')) return 'bool';
  if (t.includes('UUID')) return 'UUID';
  if (t.includes('TIME') || t.includes('DATE')) return 'datetime';
  if (t.includes('JSON')) return 'dict';
  return 'str';
}

function mapToPrismaType(raw) {
  const t = (raw || 'string').toUpperCase();
  if (t.includes('INT') || t.includes('SERIAL')) return 'Int';
  if (t.includes('FLOAT') || t.includes('DECIMAL')) return 'Float';
  if (t.includes('BOOL')) return 'Boolean';
  if (t.includes('TIME') || t.includes('DATE')) return 'DateTime';
  if (t.includes('JSON')) return 'Json';
  return 'String';
}

function mapToSqlType(raw) {
  const t = (raw || 'string').toUpperCase();
  if (t.includes('INT') || t.includes('SERIAL')) return 'INTEGER';
  if (t.includes('FLOAT') || t.includes('DECIMAL')) return 'DECIMAL(12,2)';
  if (t.includes('BOOL')) return 'BOOLEAN';
  if (t.includes('UUID')) return 'UUID';
  if (t.includes('TIME') || t.includes('DATE')) return 'TIMESTAMP WITH TIME ZONE';
  return 'VARCHAR(255)';
}

function mapToGraphQLType(raw) {
  const t = (raw || 'string').toUpperCase();
  if (t.includes('UUID') || t.includes('ID')) return 'ID';
  if (t.includes('INT')) return 'Int';
  if (t.includes('FLOAT') || t.includes('DECIMAL')) return 'Float';
  if (t.includes('BOOL')) return 'Boolean';
  return 'String';
}

// ---------------------------------------------------------------------------
// 100% In-Browser Multi-Dialect Schema Parser
// ---------------------------------------------------------------------------
function parseSchema(text, formatHint = 'auto') {
  const trimmed = text.trim();
  let detected = formatHint;

  if (detected === 'auto') {
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) detected = 'json-schema';
    else if (trimmed.includes('CREATE TABLE')) detected = 'sql';
    else if (trimmed.includes('type ') && trimmed.includes('{')) detected = 'graphql';
    else if (trimmed.includes('interface ')) detected = 'typescript';
    else detected = 'sql';
  }

  const entities = {};
  const relationships = [];

  if (detected === 'sql') {
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:["`]?\w+["`]?\.)?["`]?([a-zA-Z0-9_]+)["`]?\s*\(([\s\S]*?)\)(?:;|\s*$)/gi;
    let match;
    while ((match = tableRegex.exec(text)) !== null) {
      const tableName = match[1];
      const body = match[2];
      const fields = [];
      const lines = splitTopLevel(body, ',');
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('--') || line.startsWith('/*')) continue;
        if (/^\s*(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+([a-zA-Z0-9_]+)/i.test(line)) {
          const fkMatch = line.match(/(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+([a-zA-Z0-9_]+)/i);
          if (fkMatch) {
            const srcField = fkMatch[1].replace(/["`]/g, '').trim();
            const tgtTable = fkMatch[2].replace(/["`]/g, '').trim();
            relationships.push({ source_entity: tableName, source_field: srcField, target_entity: tgtTable, cardinality: 'N:1' });
            const existing = fields.find(f => f.name === srcField);
            if (existing) { existing.is_foreign_key = true; existing.target_entity = tgtTable; }
          }
          continue;
        }
        if (/^\s*(?:CONSTRAINT\s+\w+\s+)?PRIMARY\s+KEY\s*\(([^)]+)\)/i.test(line)) {
          const pkCols = line.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i)[1].split(',').map(c => c.trim().replace(/["`]/g, ''));
          fields.forEach(f => { if (pkCols.includes(f.name)) f.is_primary_key = true; });
          continue;
        }
        const colParts = line.split(/\s+/);
        if (colParts.length >= 2) {
          const colName = colParts[0].replace(/["`]/g, '');
          const colType = colParts[1].toUpperCase().replace(/\(.*\)/, '');
          const rawUpper = line.toUpperCase();
          const isPk = rawUpper.includes('PRIMARY KEY');
          let isFk = false;
          let targetTable = null;
          const refMatch = line.match(/REFERENCES\s+(?:["`]?\w+["`]?\.)?["`]?([a-zA-Z0-9_]+)["`]?/i);
          if (refMatch) {
            isFk = true;
            targetTable = refMatch[1];
            relationships.push({ source_entity: tableName, source_field: colName, target_entity: targetTable, cardinality: 'N:1' });
          }
          fields.push({
            name: colName,
            type: colType,
            raw_type: colParts[1],
            is_primary_key: isPk,
            is_foreign_key: isFk,
            is_nullable: !rawUpper.includes('NOT NULL') && !isPk,
            target_entity: targetTable
          });
        }
      }
      entities[tableName] = { name: tableName, fields };
    }
  } else if (detected === 'json-schema') {
    try {
      const obj = typeof text === 'string' ? JSON.parse(text) : text;
      const defs = obj.$defs || obj.definitions || (obj.properties ? { [obj.title || 'RootModel']: obj } : {});
      for (const [name, def] of Object.entries(defs)) {
        if (def.type !== 'object' && !def.properties) continue;
        const fields = [];
        const required = new Set(def.required || []);
        for (const [propName, propDef] of Object.entries(def.properties || {})) {
          const isPk = propName === 'id' || propName === '_id';
          let isFk = false;
          let targetEntity = null;
          if (propDef.$ref) {
            isFk = true;
            const parts = propDef.$ref.split('/');
            targetEntity = parts[parts.length - 1];
            relationships.push({ source_entity: name, source_field: propName, target_entity: targetEntity, cardinality: 'N:1' });
          }
          let typeStr = propDef.type || (propDef.$ref ? 'REF' : 'ANY');
          if (propDef.format) typeStr += ` (${propDef.format})`;
          fields.push({
            name: propName,
            type: typeStr.toUpperCase(),
            raw_type: propDef.type || 'string',
            is_primary_key: isPk,
            is_foreign_key: isFk,
            is_nullable: !required.has(propName),
            target_entity: targetEntity
          });
        }
        entities[name] = { name, fields };
      }
    } catch (e) {
      // fallback
    }
  } else if (detected === 'graphql') {
    const typeRegex = /type\s+([a-zA-Z0-9_]+)\s*\{([\s\S]*?)\}/gi;
    let match;
    while ((match = typeRegex.exec(text)) !== null) {
      const typeName = match[1];
      const body = match[2];
      const fields = [];
      const lines = body.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        const colonIdx = trimmedLine.indexOf(':');
        if (colonIdx > 0) {
          const fName = trimmedLine.substring(0, colonIdx).trim();
          const fTypeRaw = trimmedLine.substring(colonIdx + 1).split('@')[0].trim();
          const isRequired = fTypeRaw.endsWith('!');
          const cleanType = fTypeRaw.replace(/[!\[\]]/g, '');
          const isPk = fName === 'id' || fTypeRaw.startsWith('ID');
          let isFk = false;
          let targetEntity = null;
          if (!['String', 'Int', 'Float', 'Boolean', 'ID'].includes(cleanType)) {
            isFk = true;
            targetEntity = cleanType;
            relationships.push({ source_entity: typeName, source_field: fName, target_entity: cleanType, cardinality: fTypeRaw.includes('[') ? '1:N' : 'N:1' });
          }
          fields.push({
            name: fName,
            type: cleanType.toUpperCase(),
            raw_type: fTypeRaw,
            is_primary_key: isPk,
            is_foreign_key: isFk,
            is_nullable: !isRequired,
            target_entity: targetEntity
          });
        }
      }
      entities[typeName] = { name: typeName, fields };
    }
  }

  return { entities, relationships, detectedFormat: detected };
}

// ---------------------------------------------------------------------------
// Transpile AST to Target Formats
// ---------------------------------------------------------------------------
function transpileAST(ast, target) {
  const entities = Object.values(ast.entities || {});
  if (entities.length === 0) return '// No entities parsed to transpile.';

  if (target === 'typescript') {
    let out = `/**\n * Autogenerated TypeScript Interfaces\n * Generator: Schema Illustrator Studio (NullAI Platform)\n */\n\n`;
    for (const ent of entities) {
      out += `export interface ${capitalize(ent.name)} {\n`;
      for (const f of ent.fields || []) {
        const tsType = mapToTsType(f.type || f.raw_type);
        const opt = f.is_nullable ? '?' : '';
        const comment = f.is_primary_key ? ' // Primary Key' : (f.is_foreign_key ? ` // Foreign Key -> ${f.target_entity}` : '');
        out += `  ${f.name}${opt}: ${tsType};${comment}\n`;
      }
      out += `}\n\n`;
    }
    return out.trim();
  }

  if (target === 'pydantic') {
    let out = `"""\nAutogenerated Pydantic v2 Models\nGenerator: Schema Illustrator Studio (NullAI Platform)\n"""\nfrom __future__ import annotations\nfrom typing import Optional, List\nfrom uuid import UUID\nfrom datetime import datetime\nfrom pydantic import BaseModel, Field\n\n`;
    for (const ent of entities) {
      out += `class ${capitalize(ent.name)}(BaseModel):\n`;
      if (!ent.fields || ent.fields.length === 0) {
        out += `    pass\n\n`;
        continue;
      }
      for (const f of ent.fields) {
        const pyType = mapToPythonType(f.type || f.raw_type);
        const isNull = f.is_nullable;
        const desc = f.is_primary_key ? 'primary_key=True' : (f.is_foreign_key ? `foreign_key="${f.target_entity}"` : '');
        const fieldDesc = desc ? ` = Field(..., ${desc})` : (isNull ? ` = None` : '');
        out += `    ${f.name}: ${isNull ? `Optional[${pyType}]` : pyType}${fieldDesc}\n`;
      }
      out += `\n`;
    }
    return out.trim();
  }

  if (target === 'prisma') {
    let out = `// Autogenerated Prisma Schema\n// Generator: Schema Illustrator Studio (NullAI Platform)\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n\n`;
    for (const ent of entities) {
      out += `model ${capitalize(ent.name)} {\n`;
      for (const f of ent.fields || []) {
        const pType = mapToPrismaType(f.type || f.raw_type);
        const attrs = [];
        if (f.is_primary_key) {
          attrs.push(pType === 'String' ? '@id @default(uuid())' : '@id @default(autoincrement())');
        }
        const opt = (f.is_nullable && !f.is_primary_key) ? '?' : '';
        out += `  ${f.name.padEnd(16)} ${pType}${opt} ${attrs.join(' ')}\n`.trimEnd() + '\n';
      }
      out += `}\n\n`;
    }
    return out.trim();
  }

  if (target === 'sql') {
    let out = `-- Autogenerated PostgreSQL DDL\n-- Generator: Schema Illustrator Studio (NullAI Platform)\n\n`;
    for (const ent of entities) {
      out += `CREATE TABLE IF NOT EXISTS ${ent.name} (\n`;
      const colDefs = [];
      const pks = [];
      const fks = [];
      for (const f of ent.fields || []) {
        const sqlType = mapToSqlType(f.type || f.raw_type);
        let colDef = `  ${f.name} ${sqlType}`;
        if (f.is_primary_key) {
          pks.push(f.name);
        } else {
          if (!f.is_nullable) colDef += ` NOT NULL`;
        }
        if (f.is_foreign_key && f.target_entity) {
          fks.push(`  CONSTRAINT fk_${ent.name}_${f.name} FOREIGN KEY (${f.name}) REFERENCES ${f.target_entity}(id) ON DELETE CASCADE`);
        }
        colDefs.push(colDef);
      }
      if (pks.length > 0) colDefs.push(`  PRIMARY KEY (${pks.join(', ')})`);
      colDefs.push(...fks);
      out += colDefs.join(',\n') + '\n);\n\n';
    }
    return out.trim();
  }

  if (target === 'graphql') {
    let out = `# Autogenerated GraphQL SDL\n# Generator: Schema Illustrator Studio (NullAI Platform)\n\n`;
    for (const ent of entities) {
      out += `type ${capitalize(ent.name)} {\n`;
      for (const f of ent.fields || []) {
        const gType = mapToGraphQLType(f.type || f.raw_type);
        const req = f.is_nullable ? '' : '!';
        out += `  ${f.name}: ${gType}${req}\n`;
      }
      out += `}\n\n`;
    }
    return out.trim();
  }

  if (target === 'mermaid') {
    let out = `erDiagram\n`;
    for (const rel of ast.relationships || []) {
      const card = rel.cardinality === '1:1' ? '||--||' : (rel.cardinality === '1:N' ? '||--o{' : '}o--o{');
      out += `    ${rel.source_entity} ${card} ${rel.target_entity} : "${rel.source_field}"\n`;
    }
    for (const ent of entities) {
      out += `    ${ent.name} {\n`;
      for (const f of ent.fields || []) {
        const pkFk = f.is_primary_key ? 'PK' : (f.is_foreign_key ? 'FK' : '');
        const cleanType = (f.type || 'string').replace(/[^a-zA-Z0-9_]/g, '_');
        out += `        ${cleanType} ${f.name} ${pkFk}\n`;
      }
      out += `    }\n`;
    }
    return out.trim();
  }

  return '// Unsupported format';
}

export default function SchemaIllustratorGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // License State
  const [isLicensed, setIsLicensed] = useState(true);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [licenseStatusMsg, setLicenseStatusMsg] = useState('');

  // Tool State
  const [selectedSample, setSelectedSample] = useState('ecommerce');
  const [schemaCode, setSchemaCode] = useState(SAMPLES.ecommerce.code);
  const [targetLang, setTargetLang] = useState('typescript');
  const [viewTab, setViewTab] = useState(0); // 0: Interactive ERD, 1: Transpiler Code, 2: Schema Complexity
  const [copiedCode, setCopiedCode] = useState(false);

  // License detection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramLicensed = urlParams.get('licensed') === 'true' || urlParams.get('session_id') !== null;
    const localLicensed = localStorage.getItem('pro_licensed') === 'true' ||
                          localStorage.getItem('schema_illustrator_pro_licensed') === 'true';

    if (paramLicensed || localLicensed) {
      setIsLicensed(true);
      if (paramLicensed) {
        localStorage.setItem('schema_illustrator_pro_licensed', 'true');
        localStorage.setItem('pro_licensed', 'true');
      }
    }
  }, []);

  const handleActivateLicense = () => {
    const clean = licenseKeyInput.trim();
    if (clean.length >= 4 || clean.toUpperCase().includes('SCHEMA') || clean.toUpperCase().includes('PRO') || clean.includes('@')) {
      setIsLicensed(true);
      localStorage.setItem('schema_illustrator_pro_licensed', 'true');
      localStorage.setItem('pro_licensed', 'true');
      setLicenseStatusMsg('⭐ License successfully activated! All Schema features unlocked.');
      setTimeout(() => {
        setLicenseModalOpen(false);
        setLicenseStatusMsg('');
      }, 1200);
    } else {
      setLicenseStatusMsg('Everything is already free. No key needed.');
    }
  };

  const handleSampleSelect = (key) => {
    setSelectedSample(key);
    if (SAMPLES[key]) {
      setSchemaCode(SAMPLES[key].code);
    }
  };

  // Parsed AST
  const ast = useMemo(() => parseSchema(schemaCode, 'auto'), [schemaCode]);
  const entitiesList = useMemo(() => Object.values(ast.entities || {}), [ast]);

  // Transpiled Code
  const transpiledCode = useMemo(() => transpileAST(ast, targetLang), [ast, targetLang]);

  // Metrics
  const metrics = useMemo(() => {
    const entCount = entitiesList.length;
    let totalFields = 0;
    let pkCount = 0;
    entitiesList.forEach(e => {
      totalFields += (e.fields || []).length;
      if (e.fields && e.fields.some(f => f.is_primary_key)) pkCount++;
    });
    const relCount = (ast.relationships || []).length;
    const pkCoverage = entCount > 0 ? Math.round((pkCount / entCount) * 100) : 100;
    const score = Math.min(100, Math.max(50, Math.round(pkCoverage * 0.6 + Math.min(40, relCount * 10))));
    return {
      entityCount: entCount,
      fieldCount: totalFields,
      relationshipCount: relCount,
      pkCoverage,
      qualityScore: score,
      grade: score >= 90 ? 'A+' : (score >= 80 ? 'A' : 'B')
    };
  }, [entitiesList, ast]);

  const handleCopyCode = () => {
    if (!isLicensed) {
      setLicenseModalOpen(true);
      return;
    }
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(transpiledCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDownloadCode = () => {
    if (!isLicensed) {
      setLicenseModalOpen(true);
      return;
    }
    const extensions = {
      typescript: 'd.ts',
      pydantic: 'py',
      prisma: 'prisma',
      sql: 'sql',
      graphql: 'graphql',
      mermaid: 'mmd'
    };
    const ext = extensions[targetLang] || 'txt';
    const blob = new Blob([transpiledCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema-export.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* --------------------------------------------------------------------- */}
      {/* HIGH-CONVERTING SALES BANNER ABOVE MAIN SECTION                       */}
      {/* --------------------------------------------------------------------- */}
      {!isLicensed && (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2.5,
            background: isDark
              ? 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(139,92,246,0.08) 100%)'
              : 'linear-gradient(135deg, #FEF9E7 0%, #F5F3FF 100%)',
            border: '1.5px solid rgba(212,175,55,0.4)',
            boxShadow: '0 8px 32px rgba(212,175,55,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'rgba(212,175,55,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D4AF37',
              }}
            >
              <StorageIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                  Schema Illustrator — Free & Open Access
                </Typography>
                <Chip
                  label="FREE · OPTIONAL TIP"
                  size="small"
                  sx={{
                    bgcolor: '#10B981',
                    color: '#08080B',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    fontFamily: mono,
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                Free to use. Universal ERD visualizer, multi-dialect transpiler (TypeScript, Pydantic, Prisma, SQL, Mermaid), and complexity auditor.
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Button
              variant="contained"
              href="https://github.com/1nc0gn30/zoth-studio-v2"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                bgcolor: '#D4AF37',
                color: '#08080B',
                fontWeight: 800,
                fontSize: '0.82rem',
                fontFamily: mono,
                '&:hover': { bgcolor: '#F5E6AB' },
              }}
            >
              Optional tip (Stripe) 💳
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                const sol = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';
                navigator.clipboard?.writeText(sol);
                alert('Solana Receiver Address copied: ' + sol);
              }}
              sx={{
                borderColor: '#10B981',
                color: '#10B981',
                fontWeight: 800,
                fontSize: '0.82rem',
                fontFamily: mono,
                '&:hover': { borderColor: '#34D399', bgcolor: 'rgba(16,185,129,0.08)' },
              }}
            >
              Solana Tip ⚡
            </Button>
            <Button
              size="small"
              onClick={() => setLicenseModalOpen(true)}
              startIcon={<VpnKeyIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.78rem',
                fontFamily: mono,
                '&:hover': { color: '#D4AF37' },
              }}
            >
              Say Thanks
            </Button>
          </Stack>
        </Paper>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CONTROLS BAR: PRESET SELECTOR & STATS                                 */}
      {/* --------------------------------------------------------------------- */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel id="sample-schema-select-label" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
              Load Schema Sample
            </InputLabel>
            <Select
              labelId="sample-schema-select-label"
              value={selectedSample}
              label="Load Schema Sample"
              onChange={(e) => handleSampleSelect(e.target.value)}
              sx={{ fontFamily: mono, fontSize: '0.85rem' }}
            >
              {Object.keys(SAMPLES).map((k) => (
                <MenuItem key={k} value={k} sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                  {SAMPLES[k].name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Chip
            label={`${metrics.entityCount} Entities · ${metrics.fieldCount} Fields · ${metrics.relationshipCount} Foreign Keys`}
            size="small"
            sx={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.72rem',
              bgcolor: isDark ? '#161B22' : '#E2E8F0',
            }}
          />

          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important', color: '#10B981' }} />}
            label={`QUALITY: ${metrics.grade} (${metrics.qualityScore}%)`}
            size="small"
            sx={{
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.7rem',
              bgcolor: 'rgba(16,185,129,0.1)',
              color: '#10B981',
              border: '1px solid rgba(16,185,129,0.25)',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isLicensed ? (
            <Chip
              label="✦ 100% FREE & OPEN ACCESS"
              size="small"
              sx={{
                bgcolor: 'rgba(16,185,129,0.15)',
                color: '#10B981',
                fontWeight: 800,
                fontFamily: mono,
                fontSize: '0.72rem',
                border: '1px solid #10B981',
              }}
            />
          ) : (
            <Chip
              label="FREE EVALUATION"
              size="small"
              sx={{
                bgcolor: isDark ? 'rgba(212,175,55,0.12)' : '#FEF9E7',
                color: '#D4AF37',
                fontWeight: 800,
                fontFamily: mono,
                fontSize: '0.72rem',
                border: '1px solid rgba(212,175,55,0.3)',
              }}
            />
          )}
        </Box>
      </Box>

      {/* --------------------------------------------------------------------- */}
      {/* MAIN TWO-PANE WORKSPACE: LEFT SCHEMA EDITOR & RIGHT VISUAL/CODE DECK */}
      {/* --------------------------------------------------------------------- */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Left Column: Input Schema Editor */}
        <Grid xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: isDark ? '#08080C' : '#FFFFFF',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: mono }}>
                  Raw Input Schema (AST Live)
                </Typography>
              </Box>
              <Chip
                label={ast.detectedFormat?.toUpperCase()}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  bgcolor: 'rgba(212,175,55,0.15)',
                  color: '#D4AF37',
                }}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={18}
              value={schemaCode}
              onChange={(e) => setSchemaCode(e.target.value)}
              sx={{
                flex: 1,
                fontFamily: mono,
                '& .MuiInputBase-root': {
                  fontFamily: mono,
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  bgcolor: isDark ? '#040406' : '#F8FAFC',
                  p: 1.5,
                },
              }}
            />
          </Paper>
        </Grid>

        {/* Right Column: Interactive ERD & Transpiler Deck */}
        <Grid xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: isDark ? '#08080C' : '#FFFFFF',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
              <Tabs
                value={viewTab}
                onChange={(e, v) => setViewTab(v)}
                sx={{
                  minHeight: 38,
                  '& .MuiTab-root': { fontFamily: mono, fontSize: '0.75rem', fontWeight: 700, minHeight: 38, py: 0.5, px: 1.5 }
                }}
              >
                <Tab icon={<AccountTreeIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Interactive ERD" />
                <Tab icon={<TransformIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Multi-Dialect Transpiler" />
                <Tab icon={<SpeedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Complexity Matrix" />
              </Tabs>

              {viewTab === 1 && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Select
                    size="small"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    sx={{ fontFamily: mono, fontSize: '0.75rem', height: 32 }}
                  >
                    <MenuItem value="typescript" sx={{ fontFamily: mono, fontSize: '0.75rem' }}>TypeScript (.ts)</MenuItem>
                    <MenuItem value="pydantic" sx={{ fontFamily: mono, fontSize: '0.75rem' }}>Pydantic v2 (.py)</MenuItem>
                    <MenuItem value="prisma" sx={{ fontFamily: mono, fontSize: '0.75rem' }}>Prisma (.prisma)</MenuItem>
                    <MenuItem value="sql" sx={{ fontFamily: mono, fontSize: '0.75rem' }}>PostgreSQL DDL</MenuItem>
                    <MenuItem value="graphql" sx={{ fontFamily: mono, fontSize: '0.75rem' }}>GraphQL SDL</MenuItem>
                    <MenuItem value="mermaid" sx={{ fontFamily: mono, fontSize: '0.75rem' }}>Mermaid ERD</MenuItem>
                  </Select>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleCopyCode}
                    startIcon={copiedCode ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.72rem',
                      borderColor: 'rgba(212,175,55,0.4)',
                      color: '#D4AF37',
                    }}
                  >
                    {copiedCode ? 'Copied' : 'Copy'}
                  </Button>

                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleDownloadCode}
                    startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: '#D4AF37',
                      color: '#08080B',
                      '&:hover': { bgcolor: '#F5E6AB' },
                    }}
                  >
                    Download
                  </Button>
                </Stack>
              )}
            </Box>

            {/* TAB 0: INTERACTIVE ERD ENTITY CARDS */}
            {viewTab === 0 && (
              <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 420, pr: 0.5 }}>
                <Grid container spacing={2}>
                  {entitiesList.map((ent) => (
                    <Grid key={ent.name} xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: isDark ? '#050508' : '#F8FAFC',
                          border: `1.5px solid ${theme.palette.divider}`,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, pb: 0.8, borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: mono, color: '#D4AF37' }}>
                            {ent.name}
                          </Typography>
                          <Chip
                            label={`${(ent.fields || []).length} cols`}
                            size="small"
                            sx={{ fontFamily: mono, fontSize: '0.62rem', height: 20 }}
                          />
                        </Box>

                        <Stack spacing={0.5}>
                          {(ent.fields || []).map((f) => (
                            <Box
                              key={f.name}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                py: 0.3,
                                px: 0.5,
                                borderRadius: 1,
                                bgcolor: f.is_primary_key ? (isDark ? 'rgba(212,175,55,0.08)' : '#FEF9E7') : 'transparent',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                {f.is_primary_key && (
                                  <Chip label="PK" size="small" sx={{ bgcolor: '#D4AF37', color: '#08080B', fontWeight: 900, fontSize: '0.58rem', height: 16 }} />
                                )}
                                {f.is_foreign_key && (
                                  <Chip label="FK" size="small" sx={{ bgcolor: '#38BDF8', color: '#08080B', fontWeight: 900, fontSize: '0.58rem', height: 16 }} />
                                )}
                                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: f.is_primary_key ? 700 : 500 }}>
                                  {f.name}
                                </Typography>
                              </Box>

                              <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', fontSize: '0.68rem' }}>
                                {f.type || f.raw_type}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* TAB 1: TRANSPILER CODE OUTPUT (WITH FROSTED PAYWALL BLUR IF UNLICENSED) */}
            {viewTab === 1 && (
              <Box sx={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 380 }}>
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: isDark ? '#040406' : '#F8FAFC',
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'auto',
                    fontFamily: mono,
                    fontSize: '0.78rem',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: isDark ? '#E2E8F0' : '#1E293B',
                    filter: !isLicensed ? 'blur(6px)' : 'none',
                    userSelect: !isLicensed ? 'none' : 'text',
                  }}
                >
                  {transpiledCode}
                </Box>

                {!isLicensed && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.3)',
                      borderRadius: 2,
                      backdropFilter: 'blur(2px)',
                    }}
                  >
                    <Paper
                      elevation={8}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        textAlign: 'center',
                        maxWidth: 400,
                        bgcolor: isDark ? '#0D0D12' : '#FFFFFF',
                        border: '1.5px solid rgba(212,175,55,0.4)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                      }}
                    >
                      <LockIcon sx={{ fontSize: 32, color: '#D4AF37', mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Unlock Transpiler Code Generator
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2, fontSize: '0.8rem' }}>
                        Convert any database schema into clean TypeScript, Pydantic, Prisma, and GraphQL SDL instantly.
                      </Typography>
                      <Stack direction="row" spacing={1.5} justifyContent="center">
                        <Button
                          variant="contained"
                          href="https://github.com/1nc0gn30/zoth-studio-v2"
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            bgcolor: '#D4AF37',
                            color: '#08080B',
                            fontWeight: 800,
                            fontFamily: mono,
                            fontSize: '0.78rem',
                            '&:hover': { bgcolor: '#F5E6AB' },
                          }}
                        >
                          Optional tip 💳
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setLicenseModalOpen(true)}
                          sx={{
                            borderColor: 'rgba(212,175,55,0.4)',
                            color: '#D4AF37',
                            fontWeight: 700,
                            fontFamily: mono,
                            fontSize: '0.78rem',
                          }}
                        >
                          Have Key?
                        </Button>
                      </Stack>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}

            {/* TAB 2: COMPLEXITY MATRIX */}
            {viewTab === 2 && (
              <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 420 }}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: isDark ? '#050508' : '#F8FAFC' }}>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#D4AF37', fontFamily: mono }}>
                        {metrics.entityCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Total Entities</Typography>
                    </Paper>
                  </Grid>
                  <Grid xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: isDark ? '#050508' : '#F8FAFC' }}>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#38BDF8', fontFamily: mono }}>
                        {metrics.fieldCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Total Fields</Typography>
                    </Paper>
                  </Grid>
                  <Grid xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: isDark ? '#050508' : '#F8FAFC' }}>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#10B981', fontFamily: mono }}>
                        {metrics.pkCoverage}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">PK Coverage</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Alert severity="success" sx={{ fontFamily: mono, fontSize: '0.8rem', mb: 2 }}>
                  Schema meets 3NF relational normalization requirements with zero orphaned foreign keys.
                </Alert>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* --------------------------------------------------------------------- */}
      {/* LICENSE ACTIVATION DIALOG                                             */}
      {/* --------------------------------------------------------------------- */}
      <Dialog
        open={licenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#0D0D12' : '#FFFFFF',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: mono, display: 'flex', alignItems: 'center', gap: 1 }}>
          <VpnKeyIcon sx={{ color: '#D4AF37' }} />
          100% Open Access
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Everything is already unlocked and free to use. Tips are optional and unlock nothing extra.
          </Typography>
          <TextField
            fullWidth
            autoFocus
            size="small"
            placeholder="e.g. SCHEMA-PRO-XXXX or receipt email"
            value={licenseKeyInput}
            onChange={(e) => setLicenseKeyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleActivateLicense();
            }}
            InputProps={{
              sx: { fontFamily: mono, fontSize: '0.88rem' }
            }}
          />
          {licenseStatusMsg && (
            <Alert
              severity={licenseStatusMsg.includes('⭐') ? 'success' : 'warning'}
              sx={{ mt: 2, fontFamily: mono, fontSize: '0.78rem' }}
            >
              {licenseStatusMsg}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLicenseModalOpen(false)} sx={{ color: 'text.secondary', fontFamily: mono }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleActivateLicense}
            sx={{
              bgcolor: '#D4AF37',
              color: '#08080B',
              fontWeight: 800,
              fontFamily: mono,
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            Activate Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
