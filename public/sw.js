// Peak Travel Map service worker: makes the installed app work offline.
// - The app itself (one self-contained index.html) is network-first, so updates arrive as soon as you're online.
// - Fonts and wiki badge images are cache-first after the first view, so peaks you've seen keep their badges offline.
const VERSION = "v1.3.0";
const SHELL = `hsmap-shell-${VERSION}`;
const RUNTIME = "hsmap-runtime-1";
const SHELL_FILES = ["./", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
const RUNTIME_MAX = 200;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => (k.startsWith("hsmap-shell-") && k !== SHELL) || (k.startsWith("hsmap-runtime") && k !== RUNTIME)).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cache) {
  const keys = await cache.keys();
  for (const k of keys.slice(0, Math.max(0, keys.length - RUNTIME_MAX))) await cache.delete(k);
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // App shell: network first, fall back to the cached copy when offline.
  if (req.mode === "navigate" || url.origin === location.origin) {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) { const copy = res.clone(); caches.open(SHELL).then(c => c.put(req.mode === "navigate" ? "./" : req, copy)); }
          return res;
        })
        .catch(() => caches.match(req.mode === "navigate" ? "./" : req, { ignoreSearch: true })),
    );
    return;
  }

  // Fonts and wiki images: cache first, then network (opaque cross-origin responses are fine to cache).
  if (/fonts\.(googleapis|gstatic)\.com$|(^|\.)(wikia\.nocookie\.net|fandom\.com)$/.test(url.hostname) || req.destination === "image") {
    e.respondWith(
      caches.open(RUNTIME).then(async cache => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok || res.type === "opaque") { cache.put(req, res.clone()); trim(cache); }
        return res;
      }),
    );
  }
});
