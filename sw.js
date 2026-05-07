// ============================================================
// SERVICE WORKER — CryptoForge Pro offline cache
// ============================================================
const CACHE_NAME = 'cryptoforge-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './css/tokens.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/modules.css',
  './js/app.js',
  './js/state.js',
  './js/router.js',
  './js/ui.js',
  './js/theme.js',
  './js/lib-loader.js',
  './js/command-palette.js',
  './js/history.js',
  './js/modules/hash-studio.js',
  './js/modules/key-generator.js',
  './js/modules/kdf-engine.js',
  './js/modules/hmac-signer.js',
  './js/modules/encoders.js',
  './js/modules/comparator.js',
  './js/modules/aes-cipher.js',
  './js/modules/jwt-decoder.js',
  './js/modules/password-analyzer.js',
  './js/modules/totp-generator.js',
  './js/modules/hash-verifier.js'
];

// Install: precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for app shell, network-first for CDN
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first for CDN libraries
  if (url.hostname.includes('cdnjs.cloudflare.com') || url.hostname.includes('cdn.jsdelivr.net')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Network-first for Google Fonts
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for app shell
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
