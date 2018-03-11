if (navigator.serviceWorker) {
  navigator.serviceWorker.register("/sw.js").then(function(sw) {
    console.log("Service worker registered", sw);
  }).catch(function(err) {
    console.error("Failed to register serviceworker", err);
  })
}
