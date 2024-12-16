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
        }).catch(err => {
            console.error('Error al precargar recursos:', err);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
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
    );
});


// Fetch event - Serve from cache with SPA fallback for intern navigation or serve statics files directly from cache if founded else throw an error
self.addEventListener('fetch', event => {
    const request = event.request;

    // Manejar solicitudes de navegación
    if (request.mode === 'navigate') {
        event.respondWith(
            caches.match('/index.html').then(response => {
                if (response) {
                    return response; // Servir el archivo base desde el caché
                }
                console.error('Archivo base no encontrado en caché');
                return Promise.reject(new Error('No se pudo cargar el archivo base.'));
            })
        );
    } else {
        // Manejar solicitudes normales (archivos estáticos)
        event.respondWith(
            caches.match(request).then(response => {
                return response || Promise.reject(new Error(`Recurso no encontrado en caché: ${request.url}`));
            })
        );
    }
});