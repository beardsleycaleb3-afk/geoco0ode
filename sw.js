// sw.js - Service Worker for geoco0ode (5-Pass Rectifier)
// Version: v1.2.0 (update this when you change core files)

const CACHE_NAME = 'geoco0ode-v1.2.0';
const OFFLINE_URL = '/index.html';

// Core static assets that should always be cached immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',                    // self-reference for updates
  // Add any external CSS/JS if you split them later
  // Example: '/styles.css', '/app.js'
];

// Files that can be cached on first use (runtime caching)
const RUNTIME_CACHE = 'geoco0ode-runtime';

// Install event - cache the app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing geoco0ode service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((err) => {
        console.error('[SW] Install failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Take control of all clients immediately
    })
  );
});

// Fetch event - Network-first with fallback to cache + offline page
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and chrome-extension / other protocols
  if (event.request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Special handling for audio files (large, user-uploaded) → Cache on success
  if (event.request.destination === 'audio' || 
      url.pathname.match(/\.(mp3|wav|ogg|flac)$/i)) {
    
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone and cache successful audio responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cached audio if available (for previously played files)
          return caches.match(event.request);
        })
    );
    return;
  }

  // Default strategy: Network-first → Cache fallback → Offline page
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses for static-like resources
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // If it's a navigation request and we have no cache → serve offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }

            return new Response('Offline - Resource not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Optional: Listen for messages from the main thread (e.g., for manual cache updates)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] geoco0ode service worker registered');
