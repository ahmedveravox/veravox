const CACHE_NAME = "muwazafi-v2";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon.svg",
  "/offline.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip API calls, Next.js internals, and non-GET requests
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    request.method !== "GET"
  ) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match("/offline.html") ?? caches.match("/"))
    );
  } else {
    event.respondWith(
      caches.match(request).then((cached) => cached ?? fetch(request).then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return response;
      }))
    );
  }
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? { title: "موظفي", body: "لديك إشعار جديد" };
  event.waitUntil(
    self.registration.showNotification(data.title ?? "موظفي", {
      body: data.body ?? "",
      icon: "/icon.svg",
      badge: "/icon.svg",
      dir: "rtl",
      lang: "ar",
    })
  );
});
