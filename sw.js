const scope = self.registration.scope;
const cachePrefix = `zokaweddings:${scope}`;
const cacheName = `${cachePrefix}v1`;
const home = new URL('./', scope).href;
const resources = [
  './',
  './index.html',
  './install.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
].map(path => new URL(path, scope).href);

self.addEventListener('install', event => {
  const requests = resources.map(url => new Request(url, {
    cache: 'reload',
    redirect: 'error',
  }));
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(requests)));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(cachePrefix) && key !== cacheName)
      .map(key => caches.delete(key)),
  )));
});

self.addEventListener('fetch', event => {
  const {request} = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  url.search = '';
  if (request.mode === 'navigate' && [home, new URL('./index.html', scope).href].includes(url.href)) {
    event.respondWith(fetch(request).catch(async () => {
      const cache = await caches.open(cacheName);
      return (await cache.match(url.href)) ?? Response.error();
    }));
  } else if (resources.includes(request.url)) {
    event.respondWith(caches.open(cacheName).then(async cache =>
      (await cache.match(request)) ?? fetch(request),
    ));
  }
});
