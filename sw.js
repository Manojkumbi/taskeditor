var mycache = "mycache";
var assests = [
    "/",
    "/index.html",
    "/android",
    "/ios",
    "/windows11"
];

self.addEventListener('install', _event => {
    console.log('inside the install', _event);
    caches.open(mycache)
        .then(cache => {
            cache.addAll(assests);
        });
});



self.addEventListener('activate', _event => {
    console.log('inside the activate', _event);
});



self.addEventListener('fetch', async (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(respevt => {
                return respevt || fetch(event.request);
            })
    );
    console.log('inside the fetched', event);

});