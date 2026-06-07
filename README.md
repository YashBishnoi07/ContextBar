# 🗞️ ContextBar

Ever read a news article and wonder, *"Is this giving me the whole story?"*

**ContextBar** is a Chrome extension that automatically pops up a sleek, non-intrusive sidebar when you're reading the news. It gives you immediate context on the article you're reading, including the outlet's media bias, who owns them, and how they're funded. Even better—it pulls in 2–3 related articles on the exact same topic from outlets with *different* political leanings, so you can escape your echo chamber and see the full picture.

---

## ✨ What it does

- **Bias at a glance:** Instantly see if a news source leans left, right, or sits in the center.
- **Follow the money:** Shows you who owns the publication and whether they're privately funded, public, or non-profit.
- **Burst your bubble:** Automatically fetches alternative perspectives on the same headline from across the political spectrum.
- **Supports 80+ global outlets:** Works seamlessly on major US, UK, International, and Indian news sites (NYT, Fox, BBC, NDTV, The Hindu, etc.).

---

## 🛠️ How to run it locally

ContextBar is split into two parts: the Chrome Extension itself, and a lightweight Node.js proxy server (which handles fetching alternative articles without exposing API keys).

### 1. Fire up the backend server

You'll need a free API key from [NewsAPI.org](https://newsapi.org).

```bash
# Move into the server directory
cd server

# Copy the example environment file and add your NewsAPI key
cp .env.example .env
# Edit .env and set NEWSAPI_KEY=your_actual_key

# Install dependencies and start it up!
npm install
npm start
```
*The server should now be running on `http://localhost:3000`.*

### 2. Build the extension

Open a new terminal window in the root `contextbar` folder:

```bash
# Install the extension's dependencies
npm install

# Build the project
npm run build:ext
```
*This bundles everything up nicely into a `dist/` folder.*

### 3. Load it into Chrome

1. Open Chrome and go to `chrome://extensions`.
2. Toggle on **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the newly created `dist/` folder.
4. Go read some news! Try visiting an article on `nytimes.com`, `foxnews.com`, or `ndtv.com` and watch the sidebar slide in.

---

## 🧠 Under the hood

For the devs out there, here's how it works:
- **Vite + React:** The sidebar UI is built with React and injected into the page via a Shadow DOM (so the news site's messy CSS doesn't break our beautiful sidebar).
- **Node.js + Express proxy:** The extension talks to our local Express server instead of hitting NewsAPI directly. This keeps API keys safe and lets us cache results aggressively using `node-cache` to speed things up.
- **Dynamic Diversification:** The server actively looks at the bias of the article you're currently reading and deliberately tries to fetch related articles from the opposite side of the spectrum, plus one from the center.

---

## 🤝 Contributing
Feel free to open issues or submit pull requests! If you want to add more news outlets to the bias database, just drop them into `public/data/outlets.json`.
