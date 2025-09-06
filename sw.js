const CACHE_NAME = 'product-catalogue-cache-v7'; // Incremented version
const IMMUTABLE_CACHE_NAME = 'product-catalogue-immutable-v7'; // Incremented version

// Use relative paths for the app shell to avoid issues in sandboxed/nested environments.
const APP_SHELL_URLS = [
  './',
  './index.css',
];

const IMMUTABLE_URLS = [
  // CDNs
  'https://cdn.tailwindcss.com?plugins=typography',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.9/purify.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  // aistudiocdn dependencies from importmap
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/client',
  'https://aistudiocdn.com/react-dom@^19.1.1/',
  'https://aistudiocdn.com/react-router-dom@^7.8.2',
  'https://aistudiocdn.com/framer-motion@^12.23.12',
  'https://aistudiocdn.com/idb@^8.0.3',
  'https://aistudiocdn.com/jszip@^3.10.1',
  'https://aistudiocdn.com/pdfjs-dist@^4.4.178',
  'https://aistudiocdn.com/react-pageflip@^2.0.3',
  'https://aistudiocdn.com/swiper@^11.2.10/element/bundle',
  // Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700;800;900&display=swap'
];

// --- IndexedDB Helper for Service Worker ---
const DB_NAME = 'KioskStateDB';
const STORE_NAME = 'KeyValueStore';
const DB_VERSION = 1;

function getDb() {
    return new Promise((resolve, reject) => {
        const request = self.indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = (event) => reject(`IndexedDB error: ${event.target.error}`);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

async function idbGet(key) {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(`Failed to get data from IDB: ${event.target.error}`);
    });
}
// --- End IndexedDB Helper ---

self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    Promise.all([
        caches.open(CACHE_NAME).then(cache => {
            console.log('Service Worker: Caching App Shell');
            // Add manifest.json to the app shell so we have a template
            const urlsToCache = [...APP_SHELL_URLS, './manifest.json'];
            const requests = urlsToCache.map(url => new Request(url, { cache: 'reload' }));
            return cache.addAll(requests);
        }),
        caches.open(IMMUTABLE_CACHE_NAME).then(cache => {
            console.log('Service Worker: Caching immutable assets');
            return cache.addAll(IMMUTABLE_URLS.map(url => new Request(url, { mode: 'cors' })));
        })
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME, IMMUTABLE_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

async function generateManifestResponse() {
    try {
        // Fetch the base manifest from cache first
        const cache = await caches.open(CACHE_NAME);
        let baseManifestResponse = await cache.match('./manifest.json');

        // If not in cache, fetch from network
        if (!baseManifestResponse) {
            baseManifestResponse = await fetch('./manifest.json');
        }

        const baseManifest = await baseManifestResponse.json();
        
        // Get dynamic data from IndexedDB
        const dynamicData = await idbGet('dynamic-manifest-data');

        if (dynamicData) {
            baseManifest.name = dynamicData.name || baseManifest.name;
            baseManifest.short_name = dynamicData.short_name || baseManifest.short_name;
            baseManifest.description = dynamicData.description || baseManifest.description;
            baseManifest.theme_color = dynamicData.theme_color || baseManifest.theme_color;
            baseManifest.background_color = dynamicData.background_color || baseManifest.background_color;

            if (dynamicData.iconUrl) {
                baseManifest.icons = [
                    { src: dynamicData.iconUrl, type: dynamicData.iconType, sizes: "192x192", purpose: "any" },
                    { src: dynamicData.iconUrl, type: dynamicData.iconType, sizes: "512x512", purpose: "maskable" }
                ];
                 if(baseManifest.shortcuts && Array.isArray(baseManifest.shortcuts)){
                    baseManifest.shortcuts.forEach(shortcut => {
                        if(shortcut.icons && Array.isArray(shortcut.icons)){
                            shortcut.icons[0].src = dynamicData.iconUrl;
                        }
                    });
                }
            }
        }

        return new Response(JSON.stringify(baseManifest), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error generating manifest:', error);
        // Fallback to cached or network manifest if IDB fails
        return caches.match('./manifest.json') || fetch('./manifest.json');
    }
}


self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Special handling for manifest.json
    if (url.pathname.endsWith('/manifest.json')) {
        event.respondWith(generateManifestResponse());
        return;
    }

    // Strategy 1: Cache-first for immutable assets (CDNs, fonts)
    const isImmutable = IMMUTABLE_URLS.some(immutableUrl => url.href.startsWith(immutableUrl)) || url.hostname.startsWith('fonts.gstatic.com');
    if (isImmutable) {
        event.respondWith(
            caches.open(IMMUTABLE_CACHE_NAME).then(cache => {
                return cache.match(request).then(response => {
                    return response || fetch(request).then(networkResponse => {
                        if (networkResponse.ok) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    // Strategy 2: Network-first, bypassing browser cache, for everything else.
    event.respondWith(
        (async () => {
            try {
                const networkRequest = new Request(request, { cache: 'reload' });
                const networkResponse = await fetch(networkRequest);

                if (networkResponse.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(request, networkResponse.clone());
                }
                return networkResponse;
            } catch (error) {
                console.log('Network request failed, trying cache for:', request.url);
                const cachedResponse = await caches.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }
                if (request.mode === 'navigate') {
                    const rootCache = await caches.match('./');
                    if (rootCache) return rootCache;
                }
                return new Response("Network error: The resource is not available in the cache.", {
                    status: 408,
                    statusText: "Request Timeout",
                    headers: { "Content-Type": "text/plain" },
                });
            }
        })()
    );
});