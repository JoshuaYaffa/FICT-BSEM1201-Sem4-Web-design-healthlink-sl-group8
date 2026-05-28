const CACHE_NAME = 'healthlink-v1';
const urlsToCache = [
    '/', '/index.html', '/services.html', '/emergency.html', '/contact.html',
    '/about.html', '/clinics.html', '/admin.html', '/css/style.css',
    '/js/main.js', '/js/database.js', '/js/admin.js', '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then(cacheNames => Promise.all(cacheNames.map(name => {
        if (name !== CACHE_NAME) return caches.delete(name);
    }))));
});