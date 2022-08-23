self.addEventListener('activate', function(event) {
    return self.clients.claim();
  });
  
self.addEventListener('fetch', function(event) {
    console.log(event.request.url)
    if (event.request.url.includes("https://maps.googleapis.com/maps/api/js/QuotaService.RecordEvent")) {
    event.respondWith(
      new Response(null, {
        status: 418
      })
    );
    }
  });