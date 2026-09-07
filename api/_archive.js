/**
 * Storage for signed agreements, behind one small interface.
 *
 * A leading underscore keeps this out of Vercel's route table - it is a helper
 * imported by api/sign.js and api/signed.js, not an endpoint of its own.
 *
 * Backed by Vercel Blob. If no store is configured the functions degrade to
 * "nothing archived" rather than throwing, because the archive is a convenience
 * for the office: the signature is recorded by the emails that go to both
 * parties, and those are the record. Signing must never fail because a storage
 * bucket was not set up.
 *
 * To enable: Vercel dashboard -> Storage -> Create a Blob store and connect it to
 * this project. That injects BLOB_READ_WRITE_TOKEN automatically. No code change.
 */

const PREFIX = 'signed-contracts/';

/** Vercel Blob is optional; import it only when a token says it is configured. */
async function blob() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    return await import('@vercel/blob');
  } catch (err) {
    console.error('[archive] @vercel/blob is not installed:', err?.message || err);
    return null;
  }
}

export function archiveConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Writes one signed agreement. Returns true when stored, false when there is no
 * store configured. Throws only on a genuine write failure, which api/sign.js
 * catches and logs.
 */
export async function archiveSignedContract({
  reference, d, typedName, signedAt, signedAtLong, signature, ip
}) {
  const api = await blob();
  if (!api) return false;

  const record = {
    reference,
    signedAt,
    signedAtLong,
    signedAtISO: new Date().toISOString(),
    typedName,
    customer: {
      name: d.clientName || '',
      contact: d.clientContact || '',
      email: d.clientEmail || '',
      phone: d.clientPhone || '',
      property: d.siteAddress || d.clientAddress || ''
    },
    agreementDate: d.agreementDate || '',
    startDate: d.startDate || '',
    completeDate: d.completeDate || '',
    projectPrice: d.projectPrice || '',
    currency: d.currency || 'CAD',
    // The full contract, so the archive can re-render the exact document signed.
    contract: d,
    signature,
    // Kept for dispute resolution only; never shown in the listing UI.
    signedFromIp: ip || ''
  };

  // Timestamp-prefixed key so a plain listing comes back newest-last, and two
  // signatures on the same reference never overwrite each other.
  const key = `${PREFIX}${record.signedAtISO.replace(/[:.]/g, '-')}-${reference}.json`;

  await api.put(key, JSON.stringify(record, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  return true;
}

/**
 * Lists signed agreements, newest first.
 * Returns { configured, records } - never throws for a missing store.
 */
export async function listSignedContracts({ limit = 200 } = {}) {
  const api = await blob();
  if (!api) return { configured: false, records: [] };

  const { blobs } = await api.list({
    prefix: PREFIX,
    limit,
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  const records = await Promise.all(
    blobs.map(async (b) => {
      try {
        const res = await fetch(b.url);
        if (!res.ok) throw new Error(`fetch ${res.status}`);
        const record = await res.json();
        return { ...record, blobUrl: b.url, size: b.size };
      } catch (err) {
        console.error('[archive] Could not read', b.pathname, err?.message || err);
        return null;
      }
    })
  );

  return {
    configured: true,
    records: records
      .filter(Boolean)
      .sort((a, b) => String(b.signedAtISO).localeCompare(String(a.signedAtISO)))
  };
}
