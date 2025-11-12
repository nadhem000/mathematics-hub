// Service Worker for Mathematics Hub - Enhanced Version
const CACHE_NAME = 'math-hub-v1.1.0';
const API_CACHE_NAME = 'math-hub-api-v1.1.0';
const IMAGE_CACHE_NAME = 'math-hub-images-v1.1.0';

// Core app files - critical for basic functionality
const CORE_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles/main.css',
  '/scripts/translation.js',
  '/scripts/pwa-install.js',
  '/scripts/pwa-detection.js'
];

// Script files
const SCRIPT_FILES = [
  '/scripts/i18n_en.js',
  '/scripts/i18n_ar.js',
  '/scripts/i18n_fr.js'
];

// Lesson files - add existing lesson files
const LESSON_FILES = [
  '/lesson_Y1Al_eqdeg1a.html',
  '/lesson_Y1Al_eqdeg1b.html'
];

// Icon files - all app icons
const ICON_FILES = [
  '/assets/icons/icon-48x48.png',
  '/assets/icons/icon-72x72.png',
  '/assets/icons/icon-96x96.png',
  '/assets/icons/icon-128x128.png',
  '/assets/icons/icon-144x144.png',
  '/assets/icons/icon-152x152.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-384x384.png',
  '/assets/icons/icon-512x512.png'
];

// External resources (with fallbacks)
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css?family=Segoe+UI:300,400,600,700&display=swap'
];

// Install event - cache essential resources with improved strategy
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache core files immediately
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Caching core files...');
          return cache.addAll(CORE_FILES);
        }),
      
      // Cache scripts
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Caching script files...');
          return cache.addAll(SCRIPT_FILES);
        }),
      
      // Cache lesson files
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Caching lesson files...');
          return cache.addAll(LESSON_FILES);
        }),
      
      // Cache icons in separate cache
      caches.open(IMAGE_CACHE_NAME)
        .then(cache => {
          console.log('Caching icon files...');
          return cache.addAll(ICON_FILES);
        })
    ])
    .then(() => {
      console.log('All caches populated successfully');
      return self.skipWaiting();
    })
    .catch(error => {
      console.error('Cache installation failed:', error);
    })
  );
});

// Activate event - clean up old caches with improved cleanup
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches that don't match current version
          if (![CACHE_NAME, API_CACHE_NAME, IMAGE_CACHE_NAME].includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker activated and old caches cleaned');
      return self.clients.claim();
    })
  );
});

// Enhanced fetch event with multiple caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (url.origin === self.location.origin) {
    // Same-origin requests
    if (request.url.includes('/assets/icons/') || request.url.includes('/assets/images/')) {
      // Images: Cache First strategy
      event.respondWith(serveImage(request));
    } else if (request.url.includes('/api/')) {
      // API calls: Network First strategy
      event.respondWith(serveApi(request));
    } else {
      // HTML, CSS, JS: Stale While Revalidate strategy
      event.respondWith(serveCoreFiles(request));
    }
  } else {
    // Cross-origin requests (CDNs, fonts, etc.)
    if (request.url.includes('fonts.googleapis.com') || request.url.includes('fonts.gstatic.com')) {
      // Fonts: Cache First strategy
      event.respondWith(serveExternalResource(request));
    } else {
      // Other external resources: Network First strategy
      event.respondWith(fetch(request));
    }
  }
});

// Cache First strategy for images
async function serveImage(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // If both cache and network fail, return a fallback
    return new Response('', {
      status: 408,
      statusText: 'Offline - Image not available'
    });
  }
}

// Network First strategy for API calls
async function serveApi(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fall back to cache when offline
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({ error: 'You are offline and no cached data is available' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Stale While Revalidate strategy for core files
async function serveCoreFiles(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch from network in background
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network request failed - we'll use cached version if available
    console.log('Network request failed for:', request.url);
  });
  
  // Return cached version immediately, then update cache
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If no cache, wait for network
  return fetchPromise;
}

// Cache First strategy for external resources
async function serveExternalResource(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return appropriate fallback for external resources
    if (request.url.includes('fonts.googleapis.com')) {
      return new Response(
        '/* Fallback font CSS */ body { font-family: Arial, sans-serif; }',
        { headers: { 'Content-Type': 'text/css' } }
      );
    }
    
    return new Response('', { status: 408 });
  }
}

// Enhanced background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);
  
  switch (event.tag) {
    case 'sync-lesson-progress':
      event.waitUntil(syncLessonProgress());
      break;
    case 'sync-user-data':
      event.waitUntil(syncUserData());
      break;
    default:
      console.log('Unknown sync event:', event.tag);
  }
});

// Background sync implementations
async function syncLessonProgress() {
  try {
    // Get any pending progress updates from IndexedDB
    const db = await openProgressDB();
    const pendingUpdates = await getPendingUpdates(db);
    
    for (const update of pendingUpdates) {
      try {
        const response = await fetch('/api/lesson-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update.data)
        });
        
        if (response.ok) {
          await markUpdateAsSynced(db, update.id);
        }
      } catch (error) {
        console.error('Failed to sync lesson progress:', error);
      }
    }
    
    await db.close();
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function syncUserData() {
  try {
    // Sync user preferences, bookmarks, etc.
    const userData = await getUserDataFromStorage();
    
    if (userData) {
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        console.log('User data synced successfully');
        await clearPendingUserData();
      }
    }
  } catch (error) {
    console.error('User data sync failed:', error);
  }
}

// Helper functions for background sync
function openProgressDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MathHubProgress', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingUpdates')) {
        const store = db.createObjectStore('pendingUpdates', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

function getPendingUpdates(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingUpdates'], 'readonly');
    const store = transaction.objectStore('pendingUpdates');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function markUpdateAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingUpdates'], 'readwrite');
    const store = transaction.objectStore('pendingUpdates');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Simple storage helpers (would be expanded in a real implementation)
async function getUserDataFromStorage() {
  // This would typically get data from IndexedDB or localStorage
  return new Promise((resolve) => {
    // Simulate getting user data
    setTimeout(() => resolve({
      preferences: {},
      bookmarks: [],
      progress: {}
    }), 100);
  });
}

async function clearPendingUserData() {
  // Clear any pending user data after successful sync
  return Promise.resolve();
}

// Enhanced push notification handling
self.addEventListener('push', event => {
  console.log('Push notification received');
  
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }
  
  let data;
  try {
    data = event.data.json();
  } catch (error) {
    console.log('Push data is not JSON, using text:', event.data.text());
    data = { title: 'Mathematics Hub', body: event.data.text() };
  }
  
  const options = {
    body: data.body || 'New update available',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-96x96.png',
    image: data.image,
    data: data.url ? { url: data.url } : {},
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/assets/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/assets/icons/icon-72x72.png'
      }
    ],
    tag: data.tag || 'math-hub-notification',
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Mathematics Hub', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification click received');
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        const urlToOpen = event.notification.data.url || '/';
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event.notification.tag);
});

// Periodic sync for background updates (if supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-content') {
    console.log('Periodic sync for content updates');
    event.waitUntil(updateCachedContent());
  }
});

async function updateCachedContent() {
  try {
    // Update lesson content in background
    const cache = await caches.open(CACHE_NAME);
    const requestsToUpdate = [
      '/index.html',
      '/styles/main.css'
    ];
    
    for (const url of requestsToUpdate) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          console.log('Updated cached file:', url);
        }
      } catch (error) {
        console.log('Failed to update:', url, error);
      }
    }
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}

// Message handling for communication with client pages
self.addEventListener('message', event => {
  const { data } = event;
  
  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: '1.1.0' });
      break;
      
    case 'CACHE_URLS':
      event.waitUntil(cacheUrls(data.urls));
      break;
      
    case 'GET_CACHE_STATUS':
      event.waitUntil(getCacheStatus(event.ports[0]));
      break;
      
    default:
      console.log('Unknown message received:', data);
  }
});

async function cacheUrls(urls) {
  const cache = await caches.open(CACHE_NAME);
  return Promise.all(
    urls.map(url => 
      fetch(url).then(response => {
        if (response.ok) {
          return cache.put(url, response);
        }
        throw new Error(`Failed to cache: ${url}`);
      })
    )
  );
}

async function getCacheStatus(port) {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  const cacheSize = keys.reduce((total, request) => {
    return total + (request.headers.get('content-length') || 0);
  }, 0);
  
  port.postMessage({
    cacheName: CACHE_NAME,
    cachedItems: keys.length,
    estimatedSize: cacheSize
  });
}

// Precache additional lesson files when they're accessed
self.addEventListener('fetch', event => {
  // This is a secondary fetch handler for lesson files pattern
  if (event.request.url.includes('/lesson_') && event.request.url.endsWith('.html')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          // If not in cache, fetch and cache it
          if (!response) {
            return fetch(event.request).then(networkResponse => {
              if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            }).catch(error => {
              console.log('Failed to fetch lesson:', error);
              return new Response('', { status: 404 });
            });
          }
          return response;
        });
      })
    );
  }
});