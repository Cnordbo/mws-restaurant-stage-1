var self = this;

self.addEventListener('fetch', event => {
  if (event.request.url.indexOf("maps") != -1) {
    return;
  }
  event.respondWith(
    caches
    .open('mws-cache-0')
    .then(cache => {
      return cache.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
        .then(r => {
          cache.put(event.request,r.clone())
          return r;
        });
      });
    })
  );
});
