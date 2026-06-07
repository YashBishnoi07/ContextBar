/**
 * index.js — ContextBar Express proxy server
 * Port: 3000 (configurable via .env PORT)
 * 
 * All routes wrapped in try/catch. Never crashes.
 * CORS allows chrome-extension:// origins.
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express    = require('express');
const cors       = require('cors');
const biasRoute  = require('./routes/bias');
const articlesRoute = require('./routes/articles');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS — allow Chrome extension origins ─────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow: no origin (curl/Postman), chrome-extension://, http://localhost
    if (!origin || origin.startsWith('chrome-extension://') || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('CORS: origin not allowed: ' + origin));
    }
  },
  methods: ['GET'],
}));

// ── Parse JSON bodies (future-proofing) ──────────────────────────────────────
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/bias', biasRoute);

app.get('/articles', articlesRoute);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('[server] Unhandled error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[ContextBar] Server running at http://localhost:${PORT}`);
  console.log(`[ContextBar] Health check: http://localhost:${PORT}/health`);
  if (!process.env.NEWSAPI_KEY || process.env.NEWSAPI_KEY === 'your_newsapi_key_here') {
    console.warn('[ContextBar] ⚠️  NEWSAPI_KEY not set. Copy server/.env.example → server/.env and add your key.');
  }
});
