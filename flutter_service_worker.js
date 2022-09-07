'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "298a3ccaa7ea0609b8e5e0611789d804",
"index.html": "6a54a48d7a047faf1f3ba1d72ebc39f2",
"/": "6a54a48d7a047faf1f3ba1d72ebc39f2",
"main.dart.js": "56caf8544dbf28772c0fe2107c5dd286",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "321676efc8042eed844ac77888625f52",
"assets/AssetManifest.json": "848b50fc7599571ee65a77a96799dbb4",
"assets/NOTICES": "16993693250e39bf37d6c5239a885051",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/shaders/ink_sparkle.frag": "f8689f08f4dcc291c36deebdfcf114a4",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/assets/images/pink_jug.png": "f9d6a34dab93eb5994a9885a62d4d588",
"assets/assets/images/heart-response.png": "c3216b80273f850221b687020d99c40a",
"assets/assets/images/carabiner_image.png": "541fdf15b29fb2b188e28a918002e59e",
"assets/assets/images/sender_header_logo.png": "ccf7fd81b780f8f5bc348f06c5722079",
"assets/assets/images/skip-response.png": "4bb5714fc18609b20f10848abe6fed49",
"assets/assets/images/sender_header_logo-o.png": "2b2839180e3e24f5afe9db3f2312c8aa",
"assets/assets/images/anchor_image.png": "c0e0f488fd13b044c8408446efab281a",
"assets/assets/images/atc_image.png": "e3c1bbc5815771f55ee5ce26499e54b1",
"assets/assets/images/check-response.png": "2ef65c84858dcc0fa5997608e21bb998",
"assets/assets/images/anchor.png": "19dc54c2706e375ae799e4a8a6c6aee2",
"assets/assets/images/icon/icon_nav_settings.png": "4e4b7a6b3783488abecb9e6ccae09b3f",
"assets/assets/images/icon/cara-ico.png": "a25423d7d4bbdec081df21fb9af51eb6",
"assets/assets/images/icon/icon_nav_stack.png": "af21cc6fe9e935d20bc1eb4d5b3831f8",
"assets/assets/images/icon/icon_nav_profile.png": "4650f48fe1f9ceb3511b429982ddc893",
"assets/assets/images/icon/icon_nav_home.png": "81d973a6cf1bfd8c0dd412c2a5bea080",
"assets/assets/images/icon/nav/ProfileUntoggle.png": "3d127927073a0c7213159865ae318414",
"assets/assets/images/icon/nav/StackUntoggle.png": "78435bb28119bc4ca366813a8f061950",
"assets/assets/images/icon/nav/HomeToggle.png": "6b33070c71547f6bcb31525ebd10a46a",
"assets/assets/images/icon/nav/HomeUntoggle.png": "91fe9fc3150293ca1da01c957f56569b",
"assets/assets/images/icon/nav/ProfileToggle.png": "214fa53d72d83d5b6a92d0628ee5b603",
"assets/assets/images/icon/nav/StackToggle.png": "c08a6e854e98a3c231b0b18f1c68a450",
"assets/assets/images/profile_background.png": "61622ba78bb77d621039b6ca769afa8d",
"assets/assets/images/heart-image.png": "700f4243690f2a9ff203334e79cf78f9",
"assets/assets/rive/FigureEightIcon.riv": "87fd526e7e042cd1d6bc1dea27fec09f"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
