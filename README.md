# ContextBar

> A Chrome extension (MV3) + Node.js proxy that injects a collapsible sidebar on news articles showing media bias, ownership, funding source, and 2–3 opposing-view articles.

---

## Project Structure

```
contextbar/
├── public/                  ← Extension static assets (copied to dist/ on build)
│   ├── manifest.json        ← MV3 manifest
│   ├── background.js        ← Service worker
│   ├── content.js           ← Content script (injection logic)
│   └── data/
│       └── outlets.json     ← 88+ news outlet bias database
├── src/sidebar/             ← React sidebar app (Vite build entry)
│   ├── index.html
│   ├── index.jsx
│   └── App.jsx              ← BiasBar, ArticleCard, BiasPill, skeleton, error UI
├── server/                  ← Node.js Express proxy
│   ├── index.js             ← Server entry (CORS, routes)
│   ├── .env.example         ← Copy to .env and add NEWSAPI_KEY
│   └── routes/
│       ├── bias.js          ← GET /bias — 24h cache, outlets.json lookup
│       └── articles.js      ← GET /articles — 1h cache, NewsAPI, diversify
├── scripts/
│   └── copy-public.js       ← Post-build: copies assets to dist/
├── dist/                    ← ✅ Loadable unpacked extension (after build)
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── data/outlets.json
│   └── sidebar/
│       ├── index.html
│       └── index.js
└── vite.config.js
```

---

## Quick Start

### 1. Set up the proxy server

```bash
cd server
cp .env.example .env
# Edit .env and add your NewsAPI key:
#   NEWSAPI_KEY=your_key_here
npm install    # already done
npm start      # runs on http://localhost:3000
```

Get a free NewsAPI key at https://newsapi.org

### 2. Build the extension

```bash
# In the contextbar/ root:
npm run build:ext
```

This builds the React sidebar to `dist/sidebar/` and copies all extension files to `dist/`.

### 3. Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

### 4. Visit any supported news site

e.g. `nytimes.com`, `bbc.com`, `ndtv.com`, `thehindu.com`, `foxnews.com`

The ContextBar sidebar will appear on the right side of article pages.

---

## Server API

| Endpoint | Params | Description |
|----------|--------|-------------|
| `GET /health` | — | Server health check |
| `GET /bias` | `?domain=nytimes.com` | Returns bias/owner/funding (24h cache) |
| `GET /articles` | `?query=...&exclude=...&currentBias=...` | Returns 3 diversified articles (1h cache) |

---

## Supported Outlets (88+)

Includes US, UK, international, and Indian outlets:

**Indian outlets:** ndtv.com, thehindu.com, timesofindia.com, indianexpress.com, republicworld.com, thewire.in, scroll.in, hindustantimes.com, theprint.in, firstpost.com, news18.com, livemint.com, outlookindia.com

**Major US:** cnn.com, foxnews.com, nytimes.com, washingtonpost.com, apnews.com, reuters.com, wsj.com, breitbart.com, npr.org, msnbc.com, and 30+ more

**International:** bbc.com, theguardian.com, aljazeera.com, dw.com, france24.com, ft.com, economist.com, and more

---

## Security Notes

- ⚠️ **Never commit `server/.env`** — it contains your API key
- The extension **never calls NewsAPI directly** — always proxied through localhost:3000
- Shadow DOM isolation prevents news site CSS from breaking the sidebar
- `web_accessible_resources` is correctly declared for the sidebar iframe to load

---

## Architecture Notes

- **Shadow DOM**: The sidebar iframe lives inside a Shadow DOM host, fully isolated from host-page CSS
- **SPA Navigation**: MutationObserver watches for URL changes; sidebar re-evaluates and re-injects after 800ms
- **Ephemeral service worker**: `background.js` uses `chrome.storage` only — no in-memory state
- **Bias diversity**: Server diversifies articles across Left/Center/Right based on the current article's outlet bias
