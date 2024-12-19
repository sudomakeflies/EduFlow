const CACHE_NAME = 'eduflow-v1';
const ASSETS = [
    '/', // Ruta raíz
    '/index.html',
    '/main.js',
    '/style.css',
    '/tailwind.css',
    '/manifest.json',
    '/key.txt',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/js/asistencia.js',
    '/js/configuracion.js',
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
        }).catch(err => {
            console.error('Error al precargar recursos:', err);
        })
    );
});

self.addEventListener('activate', event => {
    /*event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        }).then(() => {
            console.log('Service Worker activado y viejo caché eliminado.');
        }).catch(error => {
            console.error('Error durante la activación:', error);
            throw error; // Si algo falla, no se activa el nuevo Service Worker
        })
    );*/
    console.log('Service worker activate event!');
});


// Fetch event - Serve from cache with SPA fallback for intern navigation or serve statics files directly from cache if founded else return a default response
self.addEventListener('fetch', event => {
    const request = event.request;

    // Skip caching for the API endpoint
    if (request.url.startsWith('https://api.vectorshift.ai/api/chatbots/run')) {
        return fetch(request);
    }

    // Manejar solicitudes de navegación
    if (request.mode === 'navigate') {
        event.respondWith(
            caches.match('/index.html').then(response => {
                if (response) {
                    return response; // Servir el archivo base desde el caché
                }
                console.error('Archivo base no encontrado en caché');
                // Return a default response for navigation requests
                return new Response('<h1>Offline Mode</h1><p>The application is currently offline. Please check your internet connection.</p>', {
                    headers: { 'Content-Type': 'text/html' }
                });
            })
        );
    } else {
        // Manejar solicitudes normales (archivos estáticos)
        event.respondWith(
            caches.match(request).then(cacheResponse => {
                // If the resource is in the cache, return it
                if (cacheResponse) {
                    // Stale-while-revalidate: fetch the resource in the background and update the cache
                    fetch(request).then(networkResponse => {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, networkResponse);
                        });
                    });
                    return cacheResponse;
                }

                // If the resource is not in the cache, fetch it from the network
                return fetch(request).then(networkResponse => {
                    // If the network response is successful, cache it and return it
                    if (networkResponse.ok) {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, networkResponse.clone());
                        });
                        return networkResponse;
                    }
                    // If the network response is not successful, return a default response
                    console.error(`Recurso no encontrado en caché ni en la red: ${request.url}`);
                    return new Response('Offline fallback content', {
                        headers: { 'Content-Type': 'text/plain' }
                    });
                }).catch(error => {
                    // If there is a network error, return a default response
                    console.error(`Error al obtener recurso de la red: ${request.url}`, error);
                    return new Response('Offline fallback content', {
                        headers: { 'Content-Type': 'text/plain' }
                    });
                });
            })
        );
    }
});

// Note: IndexedDB persistence is handled separately in the application's JavaScript code.
