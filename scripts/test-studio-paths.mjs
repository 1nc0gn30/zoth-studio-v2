import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { resolveWorkspaceDir } from '../server/studio-api.mjs';

const root = process.env.ZOTH_WORKSPACE_ROOT
  ? path.resolve(process.env.ZOTH_WORKSPACE_ROOT)
  : path.join(os.homedir(), 'NullAITech');

assert.equal(resolveWorkspaceDir(undefined), path.join(root, 'zoth-studio-v2'));
assert.equal(resolveWorkspaceDir('zoth-studio-v2'), path.join(root, 'zoth-studio-v2'));
assert.equal(resolveWorkspaceDir('/etc/passwd'), null);
assert.equal(resolveWorkspaceDir(path.join(root, '..', 'outside')), null);
assert.equal(resolveWorkspaceDir('zoth-studio-v2/../../tmp'), null);
assert.equal(resolveWorkspaceDir('nested/dir'), path.join(root, 'nested', 'dir'));

const injected = resolveWorkspaceDir('$(id)');
assert.ok(injected && injected.startsWith(root));
assert.equal(injected.includes('$'), true);

console.log('workspace dir checks passed');
