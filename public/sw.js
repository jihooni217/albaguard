// 폰에 설치한 뒤 인터넷이 없어도 앱이 열리게 화면 파일을 저장해 둔다.
// 인터넷이 되면 항상 최신 파일을 받고, 안 될 때만 저장해 둔 것을 쓴다.
const CACHE = 'albaguard-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      const res = await fetch('./')
      const html = await res.clone().text()
      await cache.put('./', res)
      // 첫 화면이 쓰는 파일(스크립트, 스타일, 아이콘)도 미리 저장
      const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]).filter((u) => !u.startsWith('http'))
      await Promise.all(urls.map((u) => cache.add(u).catch(() => {})))
      self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(req, copy))
        }
        return res
      })
      .catch(() => caches.match(req).then((hit) => hit ?? caches.match('./'))),
  )
})
