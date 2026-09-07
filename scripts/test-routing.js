/**
 * Routing test for the contract pages.
 *
 *   node scripts/test-routing.js
 *
 * Serves the repo the way Vercel does - filesystem first, then the vercel.json
 * rewrites - and fetches the exact URLs a customer and the office will hit,
 * including a real signing link built by the model.
 *
 * This exists because the pages are reached through rewrites, so a module loaded
 * with a relative path resolves against the *visited* URL, not the file's own
 * location. /sign/jane-whitfield/ + "./sign.js" asks for
 * /sign/jane-whitfield/sign.js, which does not exist, and the customer gets a
 * blank page. Every script here must therefore be an absolute path, and nothing
 * but index.html may live under /sign/ where the catch-all rewrite could shadow
 * it. Both rules are checked below.
 *
 * No dependencies: node builtins only.
 */

import http from 'node:http';
import { readFile, stat, readdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const cfg = JSON.parse(await readFile('vercel.json', 'utf8'));

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.json': 'application/json', '.webp': 'image/webp'
};

function rewrite(pathname) {
  for (const r of cfg.rewrites || []) {
    const re = new RegExp('^' + r.source.replace(/\/\(\.\*\)/, '(?:/(.*))?') + '$');
    if (re.test(pathname)) return r.destination;
  }
  return pathname;
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://x').pathname;

  // Vercel checks the filesystem before applying rewrites.
  const direct = normalize(join(ROOT, decodeURIComponent(pathname)));
  const hit = direct.startsWith(ROOT) ? await stat(direct).catch(() => null) : null;
  const target = hit?.isFile() ? pathname : rewrite(pathname);

  let file = normalize(join(ROOT, decodeURIComponent(target)));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  try {
    const s = await stat(file).catch(() => null);
    if (s?.isDirectory()) file = join(file, 'index.html');
    const buf = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(buf);
  } catch { res.writeHead(404).end('not found'); }
});

await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const model = await import(pathToFileURL(join(ROOT, 'tools/contract/contract-model.js')).href);
const sample = {
  ...model.DEFAULTS,
  clientName: 'Jane & Mark Whitfield', clientEmail: 'jane@example.com',
  siteAddress: '18 Ridgemount Ave', agreementDate: '2026-09-07',
  startDate: '2026-09-22', completeDate: '2026-10-10',
  projectPrice: '28500', services: ['interlock']
};
const signUrl = new URL(model.signingUrl(sample));
const signPath = `${signUrl.pathname}?a=${signUrl.searchParams.get('a')}`;

let passed = 0;
const failures = [];
const test = async (n, fn) => {
  try { await fn(); passed++; } catch (e) { failures.push([n, e.message.split('\n')[0]]); }
};
const ok = (c, m) => { if (!c) throw new Error(m); };
const get = async (p) => {
  const r = await fetch(base + p);
  return { status: r.status, body: await r.text(), type: r.headers.get('content-type') };
};

/** Every bare import in a module must resolve from that module's own URL. */
const importsResolve = async (modulePath) => {
  const js = (await get(modulePath)).body;
  for (const spec of [...js.matchAll(/from '([^']+)'/g)].map((m) => m[1])) {
    const resolved = new URL(spec, `http://x${modulePath}`).pathname;
    const r = await get(resolved);
    ok(r.status === 200, `${modulePath} imports ${spec} -> ${resolved} is ${r.status}`);
    ok(/javascript/.test(r.type), `${resolved} served as ${r.type}`);
  }
};

await test('the real signing link serves the sign page', async () => {
  const r = await get(signPath);
  ok(r.status === 200, `status ${r.status} for ${signPath}`);
  ok(r.body.includes('Sign your agreement'), 'not the sign page');
});

await test('the sign page module resolves from the signing link URL', async () => {
  const page = await get(signPath);
  const m = page.body.match(/<script type="module" src="([^"]+)"/);
  ok(m, 'no module script tag');
  const resolved = new URL(m[1], `http://x${signPath.split('?')[0]}`).pathname;
  const r = await get(resolved);
  ok(r.status === 200, `module 404 at ${resolved} - the customer would see a blank page`);
  ok(/javascript/.test(r.type), `module served as ${r.type}`);
  ok(r.body.includes('decodeContract'), 'wrong file served');
});

await test('/sign/ holds only the shell, so the rewrite cannot shadow a module', async () => {
  const files = await readdir(join(ROOT, 'sign'));
  ok(files.length === 1 && files[0] === 'index.html', `unexpected files in /sign/: ${files.join(', ')}`);
});

await test('sign.js reaches every module it imports', () => importsResolve('/tools/contract/sign.js'));
await test('contract.js reaches every module it imports', () => importsResolve('/tools/contract/contract.js'));
await test('signed.js reaches every module it imports', () => importsResolve('/tools/signed/signed.js'));
await test('pdf.js reaches every module it imports', () => importsResolve('/tools/contract/pdf.js'));
await test('document.js reaches every module it imports', () => importsResolve('/tools/contract/document.js'));

await test('the creator serves at every route and its module resolves', async () => {
  for (const p of ['/contract', '/contract/', '/tools/contract/']) {
    const r = await get(p);
    ok(r.status === 200, `${p} -> ${r.status}`);
    ok(r.body.includes('Contract Creator'), `${p} served the wrong page`);
    const m = r.body.match(/<script type="module" src="([^"]+)"/);
    const resolved = new URL(m[1], `http://x${p}`).pathname;
    ok((await get(resolved)).status === 200, `module 404 from ${p} -> ${resolved}`);
  }
});

await test('the archive page serves and its module resolves', async () => {
  const r = await get('/tools/signed/');
  ok(r.status === 200, `archive ${r.status}`);
  const m = r.body.match(/<script type="module" src="([^"]+)"/);
  ok((await get(new URL(m[1], 'http://x/tools/signed/').pathname)).status === 200, 'archive module 404');
});

await test('a bare /sign with no token still serves the page', async () => {
  ok((await get('/sign/')).status === 200);
});

await test('the logo the letterhead points at exists', async () => {
  ok((await get(model.AGENCY.logo)).status === 200, `${model.AGENCY.logo} missing`);
});

await test('the signing link is short enough for any mail client', () => {
  ok(signUrl.href.length < 2000, `link is ${signUrl.href.length} chars`);
});

console.log(`\n  ROUTING: ${passed} passed, ${failures.length} failed\n`);
for (const [n, m] of failures) console.error(`  FAIL  ${n}\n        ${m}`);
server.close();
process.exit(failures.length ? 1 : 0);
