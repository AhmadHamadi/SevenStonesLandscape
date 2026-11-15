import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = `
  globalThis.fetch = async () => {
    console.error('NETWORK_STUB_CALLED');
    return { ok: true, json: async () => ({ id: 'stub' }), text: async () => '' };
  };
  process.argv = ['node', 'resend-test.mjs', 'ping'];
  await import('./scripts/resend-test.mjs');
`;
const result = spawnSync(process.execPath, ['--input-type=module', '-e', source], {
  cwd: root,
  encoding: 'utf8',
  env: {
    ...process.env,
    RESEND_API_KEY: 'test-key-not-real',
    RESEND_TEST_TO: 'qa@example.invalid',
    RESEND_TEST_FROM: 'QA <qa@example.invalid>',
  },
});
const output = `${result.stdout}\n${result.stderr}`;

assert.notEqual(result.status, 0, 'ping without --send must refuse to run');
assert.match(output, /--send/, 'refusal must explain the explicit send flag');
assert.doesNotMatch(output, /NETWORK_STUB_CALLED/, 'refusal must happen before any request');
console.log('ok  live Resend sends require explicit --send and are blocked before fetch by default');
