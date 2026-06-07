// content.js — ContextBar content script
// Runs at document_idle on all URLs.
// CRITICAL: Uses Shadow DOM to isolate the sidebar from host-page CSS.

(async () => {
  'use strict';

  const HOST_ID = 'contextbar-host';
  let outlets = null;

  // ── Load outlets.json once ──────────────────────────────────────────────────
  async function loadOutlets() {
    if (outlets) return outlets;
    try {
      const url = chrome.runtime.getURL('data/outlets.json');
      const res = await fetch(url);
      outlets = await res.json();
    } catch (e) {
      outlets = {};
    }
    return outlets;
  }

  // ── Domain extraction ───────────────────────────────────────────────────────
  function extractDomain() {
    return location.hostname.replace(/^www\./, '');
  }

  // ── Headline extraction ─────────────────────────────────────────────────────
  // Priority cascade: og:title → twitter:title → h1 → document.title
  function extractHeadline() {
    const getMetaContent = (attr, value) => {
      const el = document.querySelector(`meta[${attr}="${value}"]`);
      return el ? el.getAttribute('content') : null;
    };

    const raw =
      getMetaContent('property', 'og:title') ||
      getMetaContent('name', 'twitter:title') ||
      (document.querySelector('h1') ? document.querySelector('h1').textContent.trim() : null) ||
      document.title ||
      '';

    // Strip site name suffix: " | SiteName", " - SiteName", " — SiteName"
    return raw.replace(/\s*[-|—]\s*.{0,50}$/, '').trim();
  }

  // ── Article detection ───────────────────────────────────────────────────────
  async function isNewsArticle() {
    const data = await loadOutlets();
    const domain = extractDomain();

    // Must be in our outlets database
    if (!data[domain]) return false;

    // og:type === "article"
    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType && ogType.getAttribute('content') === 'article') return true;

    // URL path depth >= 2  (e.g. /politics/2024/some-story)
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) return true;

    return false;
  }

  // ── Sidebar injection ───────────────────────────────────────────────────────
  function injectSidebar() {
    if (document.getElementById(HOST_ID)) return; // already injected

    const headline = extractHeadline();
    const domain   = extractDomain();

    // Build sidebar src URL
    const params = new URLSearchParams({
      headline: headline,
      domain: domain,
    });
    const sidebarBase = chrome.runtime.getURL('sidebar/index.html');
    const sidebarSrc  = `${sidebarBase}?${params.toString()}`;

    // Create host element
    const host = document.createElement('div');
    host.id = HOST_ID;
    Object.assign(host.style, {
      position:  'fixed',
      right:     '0',
      top:       '0',
      width:     '320px',
      height:    '100vh',
      zIndex:    '2147483647',
      pointerEvents: 'none', // host passes through; iframe handles its own events
    });

    // Shadow DOM — critical: prevents host-page CSS from leaking in
    const shadow = host.attachShadow({ mode: 'open' });

    // Reset styles inside shadow root
    const style = document.createElement('style');
    style.textContent = `
      :host { all: initial; }
      iframe {
        border: none;
        width: 320px;
        height: 100vh;
        pointer-events: all;
        display: block;
      }
    `;
    shadow.appendChild(style);

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = sidebarSrc;
    iframe.title = 'ContextBar Sidebar';
    iframe.setAttribute('allowtransparency', 'true');
    shadow.appendChild(iframe);

    document.body.appendChild(host);
    console.log('[ContextBar] Sidebar injected for', domain);
  }

  // ── Remove sidebar ──────────────────────────────────────────────────────────
  function removeSidebar() {
    const el = document.getElementById(HOST_ID);
    if (el) el.remove();
  }

  // ── SPA navigation via MutationObserver ────────────────────────────────────
  let lastUrl = location.href;

  function handleUrlChange() {
    if (location.href === lastUrl) return;
    lastUrl = location.href;

    removeSidebar();

    // Wait for SPA to render new article content
    setTimeout(async () => {
      if (await isNewsArticle()) {
        injectSidebar();
      }
    }, 800);
  }

  const observer = new MutationObserver(handleUrlChange);
  observer.observe(document.body, { childList: true, subtree: true });

  // ── Initial injection ───────────────────────────────────────────────────────
  if (await isNewsArticle()) {
    injectSidebar();
  }
})();
