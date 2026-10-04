// Service Worker - Liga Futbol de Acapulco
// Cachea el "cascarón" del sitio y las librerías externas (Firebase, escáner, PDF)
// para que las páginas abran aunque no haya señal en la cancha. Los datos en vivo
// siguen viniendo de Firebase; la propia página guarda lo capturado y lo sube al volver el internet.

const CACHE_NAME = 'liga-acapulco-v3';
const APP_SHELL = [
    './index.html',
    './admin.html',
    './arbitro.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];
const LIBRERIAS = [
    'https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.13.0/firebase-database-compat.js',
    'https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics-compat.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];
const HOSTS_LIBRERIAS = ['www.gstatic.com', 'cdnjs.cloudflare.com'];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        // Uno por uno: si un archivo falla, los demás se guardan igual (addAll fallaba en bloque).
        await Promise.allSettled(APP_SHELL.map((u) => cache.add(new Request(u, { cache: 'reload' }))));
        await Promise.allSettled(LIBRERIAS.map(async (u) => cache.put(u, await fetch(u, { mode: 'no-cors' }))));
    })());
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

function conTiempo(promesa, ms) {
    return Promise.race([promesa, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    const mismoOrigen = url.origin === self.location.origin;

    // Páginas HTML: primero la red (lo más nuevo), pero máximo 4 s: con señal débil
    // es mejor abrir la copia guardada que dejar la pantalla en blanco.
    if (mismoOrigen && (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html'))) {
        event.respondWith(
            conTiempo(fetch(req), 4000)
                .then((res) => {
                    if (res && res.ok) {
                        const resClone = res.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
                    }
                    return res;
                })
                // ignoreSearch: los enlaces del QR llevan ?jugador=123 y deben abrir la página guardada
                .catch(() => caches.match(req, { ignoreSearch: true }).then((res) => res || caches.match('./index.html')))
        );
        return;
    }

    // Íconos, manifest y librerías externas: copia guardada primero; se actualiza en segundo plano.
    if (mismoOrigen || HOSTS_LIBRERIAS.includes(url.hostname)) {
        event.respondWith(
            caches.match(req, { ignoreSearch: mismoOrigen }).then((guardada) => {
                const red = fetch(req).then((res) => {
                    if (res && (res.ok || res.type === 'opaque')) {
                        const resClone = res.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
                    }
                    return res;
                }).catch(() => null);
                if (guardada) { event.waitUntil(red); return guardada; }
                return red.then((res) => res || Response.error());
            })
        );
    }
    // Todo lo demás (Firebase Realtime Database, analítica, fuentes) pasa directo a la red.
});