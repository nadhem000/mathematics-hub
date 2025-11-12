// Service Worker for Mathematics Hub
const CACHE_NAME = 'math-hub-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/lesson_Y1Al_eqdeg1a.html',
  '/styles/main.css',
  '/scripts/translation.js',
  '/scripts/i18n_en.js',
  '/scripts/i18n_ar.js',
  '/scripts/i18n_fr.js',
  '/assets/icons/icon-48x48.png',
  '/assets/icons/icon-72x72.png',
  '/assets/icons/icon-96x96.png',
  '/assets/icons/icon-128x128.png',
  '/assets/icons/icon-144x144.png',
  '/assets/icons/icon-152x152.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

// Install event - cache essential resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(error => {
        console.log('Fetch failed; returning offline page:', error);
        // For navigation requests, return the cached index page
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

// Handle background sync (if needed in future)
self.addEventListener('sync', event => {
  console.log('Background sync:', event.tag);
});

// Handle push notifications (if needed in future)
self.addEventListener('push', event => {
  console.log('Push notification received');
  // Add push notification handling here
});