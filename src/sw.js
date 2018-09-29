const cacheAppShell = "v1";
// 缓存文件列表
const cacheAppShellList = [
    '/',
    './index.js',
    './index.css',
    './pics/img.jpg',
    './pics/img.webp'
]
// 统计请求文件时间
const requestImg = {}

self.addEventListener('install', function (event) {
    // self.skipWaiting() 会使 Service Worker 解雇当前活动的 worker 并且一旦进入等待阶段就会激活自身
    event.waitUntil(
        caches.open(cacheAppShell)
            .then(cache => cache.addAll(cacheAppShellList))
            .then(() => self.skipWaiting())
    )
    // event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
    // self.clients.claim()激活sw
    event.waitUntil(self.clients.claim());
});

// 监听 fetch 事件
self.addEventListener('fetch', function (event) {
    requestImg[event.request.url] = {start:+new Date(),end:0}
    event.respondWith(
        caches.match(event.request).then(response => {
            // 缓存请求
            // 有缓存则先取缓存
            // if(response){
            //     return response;
            // }
            //由于fetch请求的request和response都是stream所以多次使用要用副本
            let requestClone = event.request.clone();
            return fetch(requestClone).then(response => {
                //checking
                if(!response || response.status!==200|| response.type !== 'basic'){
                   
                    return response;
                }
                //response要用于缓存和渲染
                let responseClone = response.clone();

                caches.open(cacheAppShell).then(cache => {
                    cache.put(event.request, responseClone);
                })
                requestImg[event.request.url].end = + new Date()
                requestImg[event.request.url].timing = requestImg[event.request.url].end - requestImg[event.request.url].start + 'ms'
                postMessage(requestImg)
                return response;
            })
        })
    )
    // 判断环境替换为webp格式
    // supportWebp(event)
});
// 用于向客户端进行通讯
// 在index.使用sw接收消息
const postMessage = function(data) {
    self.clients.matchAll()
    .then(function (clients) {
        if (clients && clients.length) {
            clients.forEach(function (client) {
                client.postMessage(data);
            })
        }
    })
}
// 支持图片替换为webp格式
const supportWebp = function (event) {
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
        return true
    }
    return false
}