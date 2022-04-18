const APP_PREFIX = 'BudgetTracker-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE= [
    "./index.html",
    "./js/idb.js",
    "./js/index.js",
    "./css/style.css"
];

//add files to cache and installs service worker
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache now : '+CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE);
        })
    )
});

//manage cache and clear old cache
self.addEventListener('activate', function (e){
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeyList= keyList.filter(function (key){
                return key.indexOf(APP_PREFIX);
            });
            cacheKeyList.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function (key, i){
                    if (cacheKeyList.indexOf(key) === -1)
                    {
                        console.log('deleting cache now :'+keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    )
});

//retrieve info from cache
self.addEventListener('fetch', function (e) {
    console.log('fetching request : '+e.request.url);
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request)
            {
                console.log('responding with cache : '+e.request.url);
                return request;
            }

            else 
            {
                console.log('file is not cached, fetching now :'+e.request.url);
                return fetch(e.request);
            }
        })
    )
});