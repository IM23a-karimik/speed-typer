self.addEventListener('install', (e) =>
  e.waitUntil(
    caches
      .open('speedtyper')
      .then((c) => c.addAll(['./', './index.html', './style.css', './script.js', './logic.js'])),
  ),
);
self.addEventListener('fetch', (e) =>
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request))),
);
