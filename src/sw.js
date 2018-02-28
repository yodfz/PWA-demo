self.addEventListener('install', function (event) {
    // self.skipWaiting() 会使 Service Worker 解雇当前活动的 worker 并且一旦进入等待阶段就会激活自身
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
    // self.clients.claim()激活sw
    event.waitUntil(self.clients.claim());
});

// 监听 fetch 事件
self.addEventListener('fetch', function (event) {
    if (/\.jpg$|.png$/.test(event.request.url)) {
        var supportsWebp = false;
        if (event.request.headers.has('accept')) {
            supportsWebp = event.request.headers
                .get('accept')
                .includes('webp');
        }
        if (supportsWebp) {
            var req = event.request.clone();

            var returnUrl = req.url.substr(0, req.url.lastIndexOf(".")) + ".webp";

            event.respondWith(
                fetch(returnUrl, {
                    mode: 'no-cors'
                })
            );
        }
    }
});