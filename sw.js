const CACHE_NAME = 'eduflow-v1';
const ASSETS = [
    '/', // Ruta raíz
    '/index.html',
    '/main.js',
    '/style.css',
    '/tailwind.css',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/js/asistencia.js',
    '/js/db.js',
    '/js/encuadres.js',
    '/js/import.js',
    '/js/libs/papaparse.min.js',
    '/js/libs/xlsx.full.min.js',
    '/js/planeacion.js',
    '/js/planesdearea.js',
    '/js/sw-register.js',
    '/js/ui.js',
    '/js/valoracion.js'
];

// Install event - Cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

// Fetch event - Serve from cache or fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
