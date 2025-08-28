const CACHE_NAME = 'product-catalogue-cache-v4'; // Incremented version
const IMMUTABLE_CACHE_NAME = 'product-catalogue-immutable-v4'; // Incremented version

// APP_SHELL_URLS should include the root path to ensure index.html is cached correctly for navigation.
const APP_SHELL_URLS = [
  './',
  './index.html',
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
    
    // For navigation requests (opening the app, refreshing a page), use a network-first strategy
    // that gracefully falls back to the cached app shell (index.html).
    if (request.mode === 'navigate') {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return fetch(request)
                    .then(networkResponse => {
                        // If the network response is good, use it and cache it.
                        if (networkResponse.ok) {
                            cache.put(request, networkResponse.clone());
                            return networkResponse;
                        }
                        // If the network returns a 404 or other error, it's a client-side route.
                        // Serve the cached app shell instead of the error page.
                        console.log('Service Worker: Navigation request returned non-OK response, serving index.html from cache.');
                        return cache.match('./');
                    })
                    .catch(() => {
                        // If the network fails entirely (offline), serve the app shell from the cache.
                        console.log('Service Worker: Navigation fetch failed, serving index.html from cache.');
                        return cache.match('./');
                    });
            })
        );
        return;
    }

    // For all other assets (app shell files, local components), use a network-first strategy
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