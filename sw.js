const CACHE_NAME = 'product-catalogue-cache-v4'; // Incremented version
const IMMUTABLE_CACHE_NAME = 'product-catalogue-immutable-v4'; // Incremented version

// Use relative paths for the app shell to avoid issues in sandboxed/nested environments.
const APP_SHELL_URLS = [
  './',
  './manifest.json',
  './index.css',
];

const IMMUTABLE_URLS = [
  // CDNs
  'https://cdn.tailwindcss.com?plugins=typography',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.9/purify.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  // esm.sh dependencies from importmap
  'https://esm.sh/react@^19.1.1',
  'https://esm.sh/react-dom@^19.1.1/client', // This might be needed depending on how react-dom is imported
  'https://esm.sh/react-dom@^19.1.1/',
  'https://esm.sh/react-router-dom@^7.8.1',
  'https://esm.sh/framer-motion@^12.23.12',
  'https://esm.sh/idb@^8.0.3',
  'https://esm.sh/jszip@^3.10.1',
  'https://esm.sh/pdfjs-dist@^5.4.54',
  'https://esm.sh/react-pageflip@^2.0.3',
  'https://esm.sh/swiper@^11.2.10/element/bundle',
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

    // Use a cache-first strategy for most assets.
    // This provides the best performance and offline experience.
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            // If the resource is in the cache, return it
            if (cachedResponse) {
                return cachedResponse;
            }

            // If it's not in the cache, fetch it from the network
            return fetch(request)
                .then(networkResponse => {
                    // Check for a valid response
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                        // For navigation requests that fail, fall back to the app shell.
                        if (request.mode === 'navigate') {
                            return caches.match('./');
                        }
                        // For other types, just return the failed response.
                        return networkResponse;
                    }

                    // Cache the new valid response
                    const responseToCache = networkResponse.clone();
                    const isImmutable = IMMUTABLE_URLS.some(immutableUrl => url.href.startsWith(immutableUrl)) || url.hostname.startsWith('fonts.gstatic.com');
                    const cacheName = isImmutable ? IMMUTABLE_CACHE_NAME : CACHE_NAME;

                    caches.open(cacheName).then(cache => {
                        cache.put(request, responseToCache);
                    });

                    return networkResponse;
                })
                .catch(() => {
                    // If the network request fails completely (e.g., offline)
                    // and it was a navigation request, serve the main app shell.
                    if (request.mode === 'navigate') {
                        return caches.match('./');
                    }
                    // For other failed requests, we don't have a fallback, so the request will fail.
                });
        })
    );
});
