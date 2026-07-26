/* TourForChild — service worker (offline support).
   Strategy: NETWORK-FIRST for same-origin GET so the newest code/content always
   loads when online; falls back to cache when offline. Cross-origin requests
   (Wikipedia images, Leaflet, map tiles) always go straight to the network.
   Bump CACHE to force clients onto fresh assets. */
const CACHE = "tfc-v3";
const CORE = [
  "./", "./index.html", "./styles.css", "./app.js", "./i18n.js",
  "./data/index.js", "./data/themes.js", "./manifest.webmanifest", "./icon.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // don't touch cross-origin

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) =>
          cached || (req.mode === "navigate" ? caches.match("./index.html") : undefined)
        )
      )
  );
});
