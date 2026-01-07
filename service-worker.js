const CACHE_NAME = "granja-offline-v2";

// Instalação
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        "./Pdw.html",
        "./manifest.json"
      ]);
    })
  );
  self.skipWaiting();
});

// Ativação
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Offline-first REAL
self.addEventListener("fetch", event => {
  // Não intercepta Google Forms
  if (event.request.url.includes("google.com")) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          // Salva tudo que for carregado com sucesso
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Se estiver totalmente offline e não achar o arquivo
          return caches.match("./Pdw.html");
        });
    })
  );
});