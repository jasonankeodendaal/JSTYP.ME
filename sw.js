const CACHE_NAME = 'product-catalogue-cache-v6'; // Incremented version
const IMMUTABLE_CACHE_NAME = 'product-catalogue-immutable-v6'; // Incremented version

// Use relative paths for the app shell to avoid issues in sandboxed/nested environments.
const APP_SHELL_URLS = [
  './',
  // './manifest.json', // FIX: Removed from app shell to ensure it's always fetched from the network.
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


self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    Promise.all([
        caches.open(CACHE_NAME).then(cache => {
            console.log('Service Worker: Caching App Shell');
            // Using reload to bypass browser cache during installation
            const requests = APP_SHELL_URLS.map(url => new Request(url, { cache: 'reload' }));
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

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Strategy 1: Cache-first for immutable assets (CDNs, fonts)
    const isImmutable = IMMUTABLE_URLS.some(immutableUrl => url.href.startsWith(immutableUrl)) || url.hostname.startsWith('fonts.gstatic.com');
    if (isImmutable) {
        event.respondWith(
            caches.open(IMMUTABLE_CACHE_NAME).then(cache => {
                return cache.match(request).then(response => {
                    // Return from cache, or fetch and cache if not found
                    return response || fetch(request).then(networkResponse => {
                        if (networkResponse.ok) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                });
            })
        );
        return; // Don't process further
    }

    // Strategy 2: Network-first, bypassing browser cache, for everything else.
    // This ensures that when online, the user always gets the freshest content.
    event.respondWith(
        (async () => {
            try {
                // Create a new request that bypasses the browser's HTTP cache to get the latest version.
                const networkRequest = new Request(request, { cache: 'reload' });
                const networkResponse = await fetch(networkRequest);

                // If the fetch is successful, update our dynamic cache with the fresh response.
                if (networkResponse.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(request, networkResponse.clone());
                }
                return networkResponse;
            } catch (error) {
                // If the network request fails (e.g., offline), fall back to the cache.
                console.log('Network request failed, trying cache for:', request.url);
                const cachedResponse = await caches.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }
                // For page navigation requests that aren't in the cache, return the main app shell page.
                if (request.mode === 'navigate') {
                    const rootCache = await caches.match('./');
                    if (rootCache) return rootCache;
                }
                // If the resource is not in the cache and the network is down, let the browser handle it.
                // This will result in the standard "You are offline" browser page for the failed resource.
                return new Response("Network error: The resource is not available in the cache.", {
                    status: 408,
                    statusText: "Request Timeout",
                    headers: { "Content-Type": "text/plain" },
                });
            }
        })()
    );
});