/**
 * GET /api/signed
 *
 * Lists the signed agreements for the office page at /tools/signed/.
 *
 * This returns customer names, addresses, phone numbers, emails and signature
 * images, so it is behind a shared passphrase. Set CONTRACT_ARCHIVE_TOKEN in
 * Vercel; without it the endpoint refuses to serve anything at all rather than
 * defaulting open.
 */

import crypto from 'crypto';
import { listSignedContracts, archiveConfigured } from './_archive.js';
import { AGENCY } from '../tools/contract/contract-model.js';

/** Constant-time compare, so the passphrase cannot be guessed a character at a time. */
function tokenMatches(supplied, expected) {
  const a = Buffer.from(String(supplied || ''), 'utf8');
  const b = Buffer.from(String(expected || ''), 'utf8');
  // timingSafeEqual throws on a length mismatch, which would itself leak length.
  if (a.length !== b.length) {
    crypto.timingSafeEqual(b, b);
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || AGENCY.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Archive-Token');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Vary', 'Origin');
  // Belt and braces: this response must never be indexed or cached anywhere.
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const expected = process.env.CONTRACT_ARCHIVE_TOKEN;
  if (!expected) {
    return res.status(503).json({
      error: 'The signed-contract archive is not set up yet.',
      setup: 'Set CONTRACT_ARCHIVE_TOKEN in the Vercel project settings to switch it on.'
    });
  }

  const supplied = req.headers['x-archive-token'] || req.query?.k || '';
  if (!tokenMatches(supplied, expected)) {
    return res.status(401).json({ error: 'Wrong passphrase.' });
  }

  if (!archiveConfigured()) {
    return res.status(200).json({
      configured: false,
      records: [],
      setup: 'Create a Blob store in the Vercel dashboard and connect it to this project. ' +
             'Signing already works and both parties are emailed; this page stays empty until then.'
    });
  }

  try {
    const { records } = await listSignedContracts({ limit: 200 });
    // The stored IP is for dispute resolution, not for a browser tab to carry around.
    const safe = records.map(({ signedFromIp, blobUrl, ...rest }) => rest);
    return res.status(200).json({ configured: true, count: safe.length, records: safe });
  } catch (err) {
    console.error('[signed] Listing failed:', err?.message || err);
    return res.status(502).json({ error: 'Could not read the archive.' });
  }
}
