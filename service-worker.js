// Service Worker for Timer & Stopwatch PWA
const CACHE_NAME = "timer-stopwatch-v1.0.4";
const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./manifest.json",
  "./sound/alarm_clock.mp3",
  "./sound/alarm_gong.mp3",
  "./sound/pendulum_clock.mp3",
  "./sound/timer_beep.mp3",
];

// インストール時：必要なファイルをキャッシュ
self.addEventListener("install", (event) => {
  console.log("[Service Worker] インストール中...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] ファイルをキャッシュ中");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log("[Service Worker] インストール完了");
        return self.skipWaiting(); // すぐに有効化
      })
      .catch((error) => {
        console.error("[Service Worker] キャッシュエラー:", error);
      })
  );
});

// アクティベート時：古いキャッシュを削除
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] アクティベート中...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[Service Worker] 古いキャッシュを削除:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[Service Worker] アクティベート完了");
        return self.clients.claim(); // すぐに制御開始
      })
  );
});

// フェッチ時：キャッシュファーストで応答
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // キャッシュにあればそれを返す
        if (response) {
          console.log(
            "[Service Worker] キャッシュから返却:",
            event.request.url
          );
          return response;
        }

        // キャッシュになければネットワークから取得
        console.log(
          "[Service Worker] ネットワークから取得:",
          event.request.url
        );
        return fetch(event.request).then((response) => {
          // レスポンスが有効でない場合はそのまま返す
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // レスポンスをクローンしてキャッシュに保存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch((error) => {
        console.error("[Service Worker] フェッチエラー:", error);
        // オフライン時のフォールバック処理
        return caches.match("./index.html");
      })
  );
});

// メッセージ受信（キャッシュ更新など）
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
