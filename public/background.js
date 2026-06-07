// background.js — MV3 Service Worker
// Sets default storage values on install.
// NEVER use in-memory state here — service workers are ephemeral.

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ serverUrl: 'http://localhost:3000' }, () => {
    console.log('[ContextBar] Default serverUrl set to http://localhost:3000');
  });
});

// Listen for messages from content scripts (future extensibility)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SERVER_URL') {
    chrome.storage.sync.get({ serverUrl: 'http://localhost:3000' }, (data) => {
      sendResponse({ serverUrl: data.serverUrl });
    });
    return true; // keep channel open for async response
  }
});
