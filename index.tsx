
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

// Force a single page reload if a new version is detected via the URL
// This ensures that the absolute latest bundle is executed.
const CURRENT_VERSION = '1.1';
const storedVersion = localStorage.getItem('app_version');
if (storedVersion !== CURRENT_VERSION) {
  localStorage.setItem('app_version', CURRENT_VERSION);
  // Only reload if this is not the first visit ever (to avoid infinite loops)
  if (storedVersion) {
    window.location.reload();
  }
}

import './App';
