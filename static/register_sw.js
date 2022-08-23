if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('sw.js').then(function(registration) {
      }, function(err) {
        console.error('ServiceWorker registration failed: ', err);
      });
    });
  }