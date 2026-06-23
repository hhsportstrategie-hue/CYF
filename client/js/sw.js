'use strict';

const CACHE_NAME = 'cyf-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/game.html',
  '/admin.html',
  '/css/style.css',
  '/js/app.js',
  '/js/qrcode.js',
];

// ── Installation — mise en cache des assets statiques ─────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Activation — nettoyage des anciens caches ─────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch — stratégie Network First pour l'API, Cache First pour les assets ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API calls : Network First (avec fallback queue côté client)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline', offline: true }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        })
      )
    );
    return;
  }

  // Assets statiques : Cache First
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Mettre en cache les nouvelles ressources statiques
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// ── Background Sync (si supporté) ────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-answers') {
    event.waitUntil(syncOfflineAnswers());
  }
});

async function syncOfflineAnswers() {
  // La synchronisation réelle est gérée côté client dans app.js::syncQueue()
  const clients = await self.clients.matchAll();
  clients.forEach(client => client.postMessage({ type: 'SYNC_QUEUE' }));
}
