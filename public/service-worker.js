// create APP_PREFIX, VERSION and CACHE_NAME variables
const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

// create array to hold files to cache
// ! REMEMBER TO ADD MANIFEST.JSON ONCE SET UP! //
const FILES_TO_CACHE = [
  './index.html',
  './css/styles.css',
  './js/idb.js',
  './js/index.js',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png'
];

// install service worker
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Your files were pre-cached successfully from: ' + CACHE_NAME);
      // add all files from FILES_TO_CACHE array
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// activate service worker, remove outdated data from cache
self.addEventListener('activate', function(e) {
  e.waitUntil(
    // keyList contains all cache names under [username].github.io
    caches.keys().then(function (keyList) {
        // filter out and keep cache names that match app prefix in 'keepList'
        let cacheKeepList = keyList.filter(function (key) {
          return key.indexOf(APP_PREFIX);
        });

        // push current cache name to keeplist
        cacheKeepList.push(CACHE_NAME);

        // map through keyList and remove old/outdated caches
        return Promise.all(
          keyList.map(function (key, i) {
            if (cacheKeepList.indexOf(key) === -1) {
              console.log('Removing old cache data: ' + keyList[i]);
              return caches.delete(keyList[i]);
            }
          })
        );
    })
  );
});

// intercept fetch requests
self.addEventListener('fetch', function(e) {
  console.log('fetch request: ' + e.request.url);

  e.respondWith(
    caches.match(e.request).then(function(request) {
      // check for matches in cache
      if (request) {
        // if available, respond with cache
        console.log('responding with cache: ' + e.request.url);
        return request;
      } else {
        // if no match found in cache, respond with fetch request
        console.log('file not cached, fetching: ' + e.request.url);
        return fetch(e.request);
      }
    })
  );
});