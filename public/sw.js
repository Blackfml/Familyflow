// Service Worker for FamilyFlow
// Version: 2.0

const CACHE_NAME = "familyflow-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// Network-first for API, Cache-first for assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(event.request));
  } else {
    event.respondWith(cacheFirst(event.request));
  }
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response("Offline", { status: 503 });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

// Push notifications
self.addEventListener("push", (event) => {
  let data = { title: "FamilyFlow", body: "Nova atualização na sua família!" };
  if (event.data) {
    try { data = event.data.json(); } catch {
      data = { title: "FamilyFlow", body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png",
    badge: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png",
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), primaryKey: 1 },
    actions: [
      { action: "complete", title: "✔ Marcar Concluída" },
      { action: "snooze", title: "⏰ Adiar 10 min" },
      { action: "explore", title: "👀 Abrir App" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  notification.close();

  if (event.action === "snooze") {
    event.waitUntil(
      self.registration.showNotification("⏰ Lembrete Adiado", {
        body: "Este lembrete aparecerá novamente em 10 minutos.",
        icon: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png",
        tag: "task-snooze-ok",
      })
    );
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});
