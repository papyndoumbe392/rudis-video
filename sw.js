// StarClip Studio — service worker
// v37.7 : le nom du cache DOIT être changé à chaque nouvelle version de l'app,
// sinon les anciennes copies restent sur l'appareil des clients et ils ne voient
// jamais les nouveautés. Les caches des versions précédentes sont supprimés
// automatiquement à l'activation.
const CACHE = "starclip-v37-7";
const FILES = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(noms => Promise.all(
        noms.filter(n => n !== CACHE).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  // Les appels aux serveurs de génération ne passent jamais par le cache
  if (e.request.url.includes("fal.run") || e.request.url.includes("fal.media")) return;

  // Réseau d'abord, cache en secours (mode hors ligne).
  // cache:"no-store" sur la page principale : on ne veut JAMAIS une vieille
  // version d'index.html servie par le cache HTTP du navigateur.
  const estPage = e.request.mode === "navigate" || e.request.url.includes("index.html");
  const requete = estPage ? new Request(e.request, { cache: "no-store" }) : e.request;

  e.respondWith(
    fetch(requete)
      .then(rep => {
        if (rep && rep.ok && e.request.method === "GET") {
          const copie = rep.clone();
          caches.open(CACHE).then(c => c.put(e.request, copie)).catch(() => {});
        }
        return rep;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
      // v36.0 : si le réseau échoue ET que le cache n'a rien, renvoyer une vraie
      // réponse d'erreur — sinon le navigateur affiche
      // « FetchEvent.respondWith received an error: Returned response is null ».
      .then(rep => rep || new Response("Hors ligne — vérifie ta connexion.", {
        status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" },
      }))
  );
});
