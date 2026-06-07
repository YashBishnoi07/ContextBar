/**
 * articles.js — GET /articles route
 * Phase 3 + Phase 5 (bias diversity logic)
 * 
 * CRITICAL: NEWSAPI_KEY is read from .env only. NEVER in extension source.
 */

const fetch = require('node-fetch');
const NodeCache = require('node-cache');
const path = require('path');
const fs = require('fs');

const cache = new NodeCache({ stdTTL: 3600 }); // 1h TTL

// Load outlets once at module load
const OUTLETS_PATH = path.join(__dirname, '../../public/data/outlets.json');
let outlets = {};
try {
  outlets = JSON.parse(fs.readFileSync(OUTLETS_PATH, 'utf-8'));
  console.log('[articles] Loaded', Object.keys(outlets).length, 'outlets');
} catch (e) {
  console.warn('[articles] Could not load outlets.json:', e.message);
}

// ── Bias helpers ──────────────────────────────────────────────────────────────

function normaliseDomain(domain) {
  return (domain || '').replace(/^www\./, '').toLowerCase().trim();
}

/**
 * Maps bias string → 'left' | 'center' | 'right'
 */
function biasSide(bias) {
  if (!bias) return 'center';
  const b = bias.toLowerCase();
  if (b === 'left' || b === 'lean-left') return 'left';
  if (b === 'right' || b === 'lean-right') return 'right';
  return 'center';
}

/**
 * Prioritise: 1 from opposite side, 1 from center, 1 from same/neutral side.
 * Falls back gracefully if buckets are empty.
 */
function diversify(articles, currentBias, outletsData) {
  const currentSide = biasSide(currentBias);

  const opposite = currentSide === 'left' ? 'right' : currentSide === 'right' ? 'left' : null;

  const buckets = { left: [], center: [], right: [] };
  const unclassified = [];

  for (const article of articles) {
    const domain = normaliseDomain(article.domain);
    const info = outletsData[domain];
    const side = info ? biasSide(info.bias) : null;
    if (side && buckets[side]) {
      buckets[side].push(article);
    } else {
      unclassified.push(article);
    }
  }

  const result = [];

  // 1. One from opposite side
  if (opposite && buckets[opposite].length > 0) {
    result.push(buckets[opposite].shift());
  }

  // 2. One from center
  if (buckets['center'].length > 0) {
    result.push(buckets['center'].shift());
  }

  // 3. One from same side or neutral
  const sameOrNeutral = [...(buckets[currentSide] || []), ...unclassified];
  if (sameOrNeutral.length > 0) {
    result.push(sameOrNeutral[0]);
  }

  // Fill to 3 if needed from remaining pool
  if (result.length < 3) {
    const remaining = [
      ...buckets['left'],
      ...buckets['center'],
      ...buckets['right'],
      ...unclassified,
    ].filter(a => !result.includes(a));
    for (const a of remaining) {
      if (result.length >= 3) break;
      result.push(a);
    }
  }

  return result.slice(0, 3);
}

// ── Route handler ─────────────────────────────────────────────────────────────

module.exports = function articlesRoute(req, res) {
  (async () => {
    try {
      const query       = (req.query.query || '').trim();
      const exclude     = normaliseDomain(req.query.exclude || '');
      const currentBias = (req.query.currentBias || '').trim();

      if (!query) {
        return res.status(400).json({ error: 'query param is required' });
      }

      const apiKey = process.env.NEWSAPI_KEY;
      if (!apiKey || apiKey === 'your_newsapi_key_here') {
        return res.status(503).json({ error: 'NewsAPI key not configured. Set NEWSAPI_KEY in server/.env' });
      }

      // Cache lookup
      const cacheKey = `articles:${query}:${exclude}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        // Still diversify with current session's bias even from cache
        const diversified = diversify(cached, currentBias, outlets);
        return res.json({ articles: diversified, cached: true });
      }

      // Fetch from NewsAPI
      const newsUrl = new URL('https://newsapi.org/v2/everything');
      newsUrl.searchParams.set('q', query);
      newsUrl.searchParams.set('language', 'en');
      newsUrl.searchParams.set('sortBy', 'relevancy');
      newsUrl.searchParams.set('pageSize', '20');
      newsUrl.searchParams.set('apiKey', apiKey);

      const newsRes = await fetch(newsUrl.toString());
      if (!newsRes.ok) {
        const errBody = await newsRes.json().catch(() => ({}));
        throw new Error(`NewsAPI ${newsRes.status}: ${errBody.message || newsRes.statusText}`);
      }

      const newsData = await newsRes.json();
      const rawArticles = newsData.articles || [];

      // Normalise and filter
      const seenDomains = new Set();
      if (exclude) seenDomains.add(exclude);

      const filtered = [];
      for (const a of rawArticles) {
        let domain = '';
        try { domain = normaliseDomain(new URL(a.url).hostname); } catch {}

        // Exclude source domain
        if (seenDomains.has(domain)) continue;

        // Deduplicate: max 1 article per domain
        seenDomains.add(domain);

        filtered.push({
          title:       a.title || 'Untitled',
          url:         a.url,
          source:      a.source?.name || domain,
          domain:      domain,
          publishedAt: a.publishedAt || null,
        });
      }

      // Store full filtered list in cache for 1h
      cache.set(cacheKey, filtered);

      // Diversify before returning
      const diversified = diversify(filtered, currentBias, outlets);
      return res.json({ articles: diversified });

    } catch (err) {
      console.error('[articles] Error:', err.message);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  })();
};
