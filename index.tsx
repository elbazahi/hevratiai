if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service Worker unregistered successfully to prevent caching issues.');
    }
  }).catch(function(err) {
    console.warn('Service Worker unregistration failed:', err);
  });
}

// Clear any old caches manually as an extra safety measure
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) caches.delete(name);
  });
}

import './App';