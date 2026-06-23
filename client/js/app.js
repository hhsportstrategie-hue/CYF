'use strict';

// ── Utilitaire API ────────────────────────────────────────────────
async function api(path, options = {}) {
  const defaults = {
    headers: { 'Content-Type': 'application/json' },
  };
  const res = await fetch(path, { ...defaults, ...options,
    headers: { ...defaults.headers, ...(options.headers || {}) }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// ── Toast notification ────────────────────────────────────────────
function toast(msg, duration = 3000) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

// ── Offline detection ─────────────────────────────────────────────
window.addEventListener('online',  () => { document.body.classList.remove('offline'); syncQueue(); });
window.addEventListener('offline', () => document.body.classList.add('offline'));
if (!navigator.onLine) document.body.classList.add('offline');

// ── Service Worker registration ───────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/js/sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.warn('SW registration failed:', err));
  });
}

// ── Offline answer queue ──────────────────────────────────────────
const QUEUE_KEY = 'cyf_offline_queue';

function queueAnswer(data) {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  queue.push({ ...data, queued_at: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  toast('📵 Réponse mise en file — sera envoyée au retour réseau');
}

async function syncQueue() {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  if (!queue.length) return;
  const remaining = [];
  for (const item of queue) {
    try {
      await api('/api/scores/submit', { method: 'POST', body: JSON.stringify(item) });
    } catch(e) {
      remaining.push(item);
    }
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  if (remaining.length < queue.length) toast('✅ ' + (queue.length - remaining.length) + ' réponse(s) synchronisée(s)');
}

// ── PWA enigma cache helpers ──────────────────────────────────────
function cacheEnigmas(enigmas) {
  localStorage.setItem('cyf_enigmas_' + (enigmas[0]?.game_id || 'x'), JSON.stringify(enigmas));
}

function getCachedEnigmas(gameId) {
  const raw = localStorage.getItem('cyf_enigmas_' + gameId);
  return raw ? JSON.parse(raw) : null;
}

// ── Attempt sync on page load if online ──────────────────────────
if (navigator.onLine) syncQueue();
