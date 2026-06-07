/**
 * bias.js — GET /bias route
 * Returns bias, owner, funding for a given domain from outlets.json
 * Uses 24h node-cache. Never crashes — always returns a valid object.
 */

const NodeCache = require('node-cache');
const path = require('path');
const fs = require('fs');

const cache = new NodeCache({ stdTTL: 86400 }); // 24h TTL

const OUTLETS_PATH = path.join(__dirname, '../../public/data/outlets.json');
let outlets = {};
try {
  outlets = JSON.parse(fs.readFileSync(OUTLETS_PATH, 'utf-8'));
  console.log('[bias] Loaded', Object.keys(outlets).length, 'outlets');
} catch (e) {
  console.warn('[bias] Could not load outlets.json:', e.message);
}

const FALLBACK = { bias: 'unknown', owner: 'unknown', funding: 'unknown' };

function normaliseDomain(domain) {
  return (domain || '').replace(/^www\./, '').toLowerCase().trim();
}

module.exports = function biasRoute(req, res) {
  try {
    const raw    = req.query.domain || '';
    const domain = normaliseDomain(raw);

    if (!domain) {
      return res.json(FALLBACK);
    }

    // Cache check
    const cached = cache.get(`bias:${domain}`);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const info = outlets[domain];
    const result = info
      ? { bias: info.bias || 'unknown', owner: info.owner || 'unknown', funding: info.funding || 'unknown' }
      : { ...FALLBACK };

    cache.set(`bias:${domain}`, result);
    return res.json(result);

  } catch (err) {
    console.error('[bias] Error:', err.message);
    // Never crash — return fallback
    return res.json(FALLBACK);
  }
};
