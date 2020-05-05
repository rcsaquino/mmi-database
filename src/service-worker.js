// Default
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

// Added
workbox.routing.registerNavigationRoute("/index.html");
workbox.skipWaiting();
