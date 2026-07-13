const CACHE = "starclip-v17";
const FILES = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener("activate", e => e.waitUntil(clients.claim()));
self.addEventListener("fetch", e => {
  // Réseau d'abord pour l'app, cache en secours (hors API fal)
  if (e.request.url.includes("fal.run") || e.request.url.includes("fal.media")) return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
