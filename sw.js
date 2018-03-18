var self = this;
const cacheName = "mws-stage-1-r2";

self.addEventListener("install", event => {
  console.log("Installing");
  const staticFiles = ["/","/index.html","/manifest.json","/js/common.js","/js/dbhelper.js","/js/main.js","/js/idb.js","/js/restaurant_info.js","/css/styles.css"];
  event.waitUntil(caches.open(cacheName).then(cache => {
    return cache.addAll(staticFiles);
  }));
});

self.addEventListener('fetch', event => {
  var url = new URL(event.request.url);
  var req = event.request;

  if (url.origin != location.origin) {
    return;
  }
  if (url.origin === location.origin && url.pathname === "/") {
    req = new Request("/index.html");
  }

  event.respondWith(
    caches
    .open(cacheName)
    .then(cache => {
      return cache.match(req)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(req)
        .then(r => {
          cache.put(req,r.clone())
          return r;
        });
      });
    })
  );
});
