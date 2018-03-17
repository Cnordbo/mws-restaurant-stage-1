if (navigator.serviceWorker) {
  navigator.serviceWorker.register("/sw.js").then(function(sw) {
  }).catch(function(err) {
    console.error("Failed to register serviceworker", err);
  })
}
