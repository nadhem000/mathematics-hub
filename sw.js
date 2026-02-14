// Service Worker for Mathematics Hub - Enhanced Version
const CACHE_NAME = 'math-hub-v1.2.9';
const urlsToCache = [
  '/',
  '/index.html',
  '/lesson_Y1Al_eqdeg1a.html',
  '/lesson_Y1Al_eqdeg1b.html',
  '/lesson_Y1Al_eqdeg1c.html',
  '/lesson_Y1Al_eqdeg1d.html',
  '/lesson_Y2Al_eqdeg2a.html',
  '/lesson_Y2Al_eqdeg2b.html',
  '/lesson_Y2Al_eqdeg2c.html',
  '/lesson_Y2Al_eqdeg2d.html',
  '/lesson_Y2Al_eqdeg2e.html',
  '/lesson_Y2Al_eqdeg2f.html',
  '/lesson_Y2Geo_barycenter1.html',
  '/lesson_Y2Geo_barycenter2.html',
  '/manifest.json',
  '/styles/main.css',
  '/scripts/translation.js',
  '/scripts/pwa-install.js',
  '/scripts/pwa-detection.js',
  '/scripts/geometry_utils.js',
  '/scripts/mathematics_utils.js',
  '/scripts/i18n_en.js',
  '/scripts/i18n_ar.js',
  '/scripts/i18n_fr.js',
  '/assets/screenshots/screenshot1.png',
  '/assets/screenshots/screenshot2.png',
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

// Install event - cache essential resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('All resources cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
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
    }).then(() => {
      console.log('Service Worker activated');
      
      // Only register periodic sync if supported and permission might be available
      if ('periodicSync' in self.registration) {
        // Check if we have permission first
        self.registration.periodicSync.getTags().then(tags => {
          if (tags.includes('content-update')) {
            console.log('Periodic sync already registered');
          } else {
            self.registration.periodicSync.register('content-update', {
              minInterval: 24 * 60 * 60 * 1000, // 24 hours
            }).then(() => {
              console.log('Periodic sync registered');
            }).catch(error => {
              console.log('Periodic sync could not be registered (might need user permission):', error);
            });
          }
        });
      }
      
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests and cross-origin requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests with network-first strategy
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache when offline
          return caches.match(event.request);
        })
    );
    return;
  }

  // For regular resources, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.log('Fetch failed; returning offline page:', error);
            // For navigation requests, return the cached index page
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Enhanced Background Sync
self.addEventListener('sync', event => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'math-hub-sync') {
    event.waitUntil(
      syncPendingData()
        .then(() => {
          console.log('Background sync completed successfully');
          // Only show notification if we have permission
          self.registration.getNotifications().then(notifications => {
            if (notifications.length === 0) {
              // Try to show notification, but catch error if no permission
              self.registration.showNotification('Mathematics Hub', {
                body: 'Your data has been synchronized',
                icon: '/assets/icons/icon-96x96.png',
                badge: '/assets/icons/icon-96x96.png'
              }).catch(error => {
                console.log('Cannot show notification (no permission):', error);
              });
            }
          });
        })
        .catch(error => {
          console.error('Background sync failed:', error);
        })
    );
  }
});

// Periodic Sync for content updates
self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-update') {
    console.log('Periodic sync for content updates');
    event.waitUntil(
      checkForUpdates()
        .then(updated => {
          if (updated) {
            // Only show notification if we have permission
            self.registration.showNotification('Mathematics Hub', {
              body: 'New content is available!',
              icon: '/assets/icons/icon-96x96.png',
              badge: '/assets/icons/icon-96x96.png',
              tag: 'content-update'
            }).catch(error => {
              console.log('Cannot show update notification (no permission):', error);
            });
          }
        })
        .catch(error => {
          console.log('Update check failed:', error);
        })
    );
  }
});

// Enhanced Push Notifications with permission check
self.addEventListener('push', event => {
  console.log('Push notification received');
  
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.log('Push data parsing error, using text:', error);
    // Try to get text content if JSON parsing fails
    const text = event.data ? event.data.text() : 'Test push notification';
    data = {
      title: 'Mathematics Hub',
      body: text,
      icon: '/assets/icons/icon-96x96.png'
    };
  }

  const options = {
    body: data.body || 'New content available',
    icon: data.icon || '/assets/icons/icon-96x96.png',
    badge: '/assets/icons/icon-96x96.png',
    image: data.image,
    data: data.data || { url: '/' },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    tag: data.tag || 'math-hub-notification',
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    // Show notification and catch permission errors
    self.registration.showNotification(data.title || 'Mathematics Hub', options)
      .catch(error => {
        console.error('Failed to show push notification (permission denied):', error);
      })
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(windowClients => {
      // Check if there's already a window/tab open with the target URL
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync functions
async function syncPendingData() {
  try {
    // Get pending data from IndexedDB or localStorage
    const pendingData = await getPendingData();
    
    if (pendingData && pendingData.length > 0) {
      console.log(`Syncing ${pendingData.length} pending items`);
      
      // Process each pending item
      for (const item of pendingData) {
        await syncDataItem(item);
      }
      
      // Clear pending data after successful sync
      await clearPendingData();
    }
    
    return true;
  } catch (error) {
    console.error('Error in syncPendingData:', error);
    throw error;
  }
}

async function getPendingData() {
  return new Promise((resolve) => {
    // In a real app, you would get this from IndexedDB
    // For now, return empty array
    resolve([]);
  });
}

async function syncDataItem(item) {
  // Simulate API call to sync data
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Synced item:', item);
      resolve(true);
    }, 1000);
  });
}

async function clearPendingData() {
  return new Promise((resolve) => {
    // Clear pending data from storage
    console.log('Cleared pending data');
    resolve();
  });
}

// Periodic sync functions
async function checkForUpdates() {
  try {
    // Check for updated content
    const response = await fetch('/api/check-updates', {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.updated) {
        // Update cache with new content
        await updateCachedContent(data.updates);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.log('No updates available or offline:', error);
    return false;
  }
}

async function updateCachedContent(updates) {
  try {
    const cache = await caches.open(CACHE_NAME);
    
    for (const url of updates) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          console.log('Updated cache for:', url);
        }
      } catch (error) {
        console.error('Failed to update cache for:', url, error);
      }
    }
  } catch (error) {
    console.error('Error updating cached content:', error);
  }
}

// Message handler for communication with clients
self.addEventListener('message', event => {
  console.log('Service Worker received message:', event.data);
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'TRIGGER_SYNC':
      if ('sync' in self.registration) {
        self.registration.sync.register('math-hub-sync')
          .then(() => {
            event.ports[0].postMessage({ success: true });
          })
          .catch(error => {
            event.ports[0].postMessage({ success: false, error: error.message });
          });
      } else {
        event.ports[0].postMessage({ success: false, error: 'Background sync not supported' });
      }
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;

    case 'REQUEST_NOTIFICATION_PERMISSION':
      // Forward permission request to clients
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'REQUEST_NOTIFICATION_PERMISSION'
          });
        });
      });
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// Enhanced error handling
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});