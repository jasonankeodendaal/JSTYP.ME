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

    // Only handle GET requests
    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    // For immutable assets (CDNs, fonts), use a cache-first strategy
    if (IMMUTABLE_URLS.some(immutableUrl => url.href.startsWith(immutableUrl)) || url.hostname.startsWith('fonts.gstatic.com')) {
        event.respondWith(
            caches.open(IMMUTABLE_CACHE_NAME).then(cache => {
                return cache.match(request).then(response => {
                    return response || fetch(request).then(networkResponse => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }
    
    // For navigation requests, use a network-first strategy.
    // If the network fails (or returns an error page like a 404), fall back to the cached app shell.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // If we get a valid response, cache it and return it.
                    if (response.ok) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache);
                        });
                    }
                    // For a SPA, even a 404 from the server should be handled by the client-side app.
                    // So we fall back to the cached root page ('./').
                    return response.ok ? response : caches.match('./');
                })
                .catch(() => {
                    // This catches network errors (e.g., offline) and returns the app shell.
                    return caches.match('./');
                })
        );
        return;
    }

    // For all other assets (app shell files, etc.), use a network-first strategy
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return fetch(request)
                .then(networkResponse => {
                    if (networkResponse.ok) {
                        cache.put(request, networkResponse.clone());
                    }
                    return networkResponse;
                })
                .catch(() => {
                    return cache.match(request);
                });
        })
    );
});