const CACHE_NAME = 'eduflow-v1';
const DYNAMIC_CACHE = 'eduflow-dynamic-v1';

const CORE_ASSETS = [
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
    '/js/valoracion.js',
    '/js/sync.js',
    '/js/storage-monitor.js'
];

// Instalar Service Worker y precachear assets core
self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then(cache => {
                console.log('Precaching core assets...');
                return cache.addAll(CORE_ASSETS);
            }),
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('Dynamic cache ready');
            })
        ]).catch(err => {
            console.error('Error during installation:', err);
            throw err; // Forzar fallo de instalación si hay error
        })
    );
});

// Activar nuevo Service Worker y limpiar caches antiguos
self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            // Limpiar caches antiguos
            caches.keys().then(keys => {
                return Promise.all(
                    keys.filter(key => 
                        key !== CACHE_NAME && 
                        key !== DYNAMIC_CACHE
                    ).map(key => {
                        console.log('Deleting old cache:', key);
                        return caches.delete(key);
                    })
                );
            }),
            // Tomar control inmediatamente
            self.clients.claim()
        ]).then(() => {
            console.log('Service Worker activated and old caches cleaned');
        }).catch(error => {
            console.error('Activation error:', error);
            throw error;
        })
    );
});

// Estrategia de caché mejorada para solicitudes
self.addEventListener('fetch', event => {
    const request = event.request;

    // Skip caching for specific endpoints
    if (request.url.startsWith('https://api.vectorshift.ai/api/chatbots/run')) {
        return fetch(request);
    }

    // Estrategia para solicitudes de navegación (HTML)
    if (request.mode === 'navigate') {
        event.respondWith(
            handleNavigationRequest(request)
        );
        return;
    }

    // Estrategia para activos estáticos
    if (request.method === 'GET') {
        event.respondWith(
            handleAssetRequest(request)
        );
        return;
    }

    // Para otras solicitudes, intentar red primero, luego caché
    event.respondWith(
        fetch(request)
            .catch(() => caches.match(request))
    );
});

async function handleNavigationRequest(request) {
    try {
        // Intentar red primero
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
    } catch (error) {
        console.log('Navigation fetch failed, falling back to cache');
    }

    // Si falla la red, intentar caché
    const cachedResponse = await caches.match('/index.html');
    if (cachedResponse) {
        return cachedResponse;
    }

    // Último recurso: página offline
    return new Response(
        '<html><body><h1>Offline Mode</h1><p>The application is currently offline. Please check your internet connection.</p></body></html>',
        {
            headers: { 'Content-Type': 'text/html' }
        }
    );
}

async function handleAssetRequest(request) {
    // Verificar en caché primero
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        // Stale-while-revalidate: actualizar caché en segundo plano
        revalidateCache(request);
        return cachedResponse;
    }

    try {
        // Si no está en caché, obtener de la red
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        throw new Error('Network response was not ok');
    } catch (error) {
        console.error(`Failed to fetch: ${request.url}`, error);
        // Si es una imagen, retornar una imagen placeholder
        if (request.destination === 'image') {
            return new Response(null, {
                status: 404,
                statusText: 'Image not found'
            });
        }
        // Para otros recursos, contenido offline genérico
        return new Response('Content not available offline', {
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

async function revalidateCache(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            // Agregar timestamp al response para tracking
            const headers = new Headers(networkResponse.headers);
            headers.append('sw-fetched-on', new Date().toISOString());
            
            const response = new Response(networkResponse.clone().body, {
                status: networkResponse.status,
                statusText: networkResponse.statusText,
                headers: headers
            });
            
            await cache.put(request, response);
            console.log(`Cache revalidated for: ${request.url}`);
        }
    } catch (error) {
        console.error(`Revalidation failed for: ${request.url}`, error);
    }
}

// Manejo de errores y logging mejorado
self.addEventListener('error', event => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
});
