'use strict';
/* Service worker.
   SHELL - апп-ын үндсэн файлууд (html/js/css/дүрс/дуу): суулгахад урьдчилж хадгална, сүлжээ-түрүүлж шинэчилнэ, офлайнд кэшээс.
   IMG   - зураг/SVG: нэг татагдсаны дараа кэш-түрүүлж; хувилбараас хамаарахгүй тул шинэчлэлд устахгүй.
   Хамгаалагдсан агуулга (img/tests/*, signs-svg/*.svg, js/tests-data.js) серверт AES-GCM-ээр шифрлэгдсэн ('ZE1' толгойтой).
   Түлхүүр лиценз идэвхжүүлэхэд серверээс ирж IndexedDB-д хадгалагдана; энд файл бүрийг татахад тайлж өгнө. Түлхүүргүй бол 403.
   Шинэ хувилбарт VER-ийг нэмнэ. */
const VER = 'jolooniiapp-shell-v13';
const IMG = 'jolooniiapp-img';
const SHELL = ["./", "offline.js", "offline-list.json", "tests.html", "signs.html", "index.html", "style.css", "manifest.webmanifest", "js/audio-data.js", "js/audio.js", "js/builder.js", "js/dialog.js", "js/engine.js", "js/learn-data.js", "js/learn.js", "js/levels-more.js", "js/levels.js", "js/license.js", "js/markings.js", "js/nav.js", "js/progress.js", "js/quizzes.js", "js/signs-data.js", "js/signs-draw.js", "js/signs-draw2.js", "js/signs-info.js", "js/tests-art.js", "js/tests-art3d.js", "js/tests-lamps.js", "js/tests-photo.js", "js/tests-sign.js", "js/ui.js", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "img/home/bg-old.jpg", "img/home/bg-prev.jpg", "img/home/bg-prev2.jpg", "img/home/bg.jpg", "img/home/bustruck.webp", "img/home/cattle.webp", "img/home/logo.png", "img/home/sedan.webp", "img/school-logo.jpg", "audio/chimes.mp3", "audio/click.mp3", "audio/crash.mp3", "audio/ding.mp3", "audio/engine.wav", "audio/horn.mp3", "audio/music1.mp3", "audio/music2.mp3", "audio/negative.mp3", "audio/rain.mp3", "audio/siren.mp3", "audio/traffic.mp3", "markings/1.1.svg", "markings/1.10.svg", "markings/1.11.svg", "markings/1.12.svg", "markings/1.13.a.svg", "markings/1.13.b.svg", "markings/1.14.svg", "markings/1.15.a.svg", "markings/1.15.b.svg", "markings/1.15.v.svg", "markings/1.16.svg", "markings/1.17.svg", "markings/1.18.svg", "markings/1.19.svg", "markings/1.2.svg", "markings/1.20.svg", "markings/1.21.svg", "markings/1.22.svg", "markings/1.23.svg", "markings/1.3.svg", "markings/1.4.svg", "markings/1.5.svg", "markings/1.6.svg", "markings/1.7.svg", "markings/1.8.svg", "markings/1.9.svg", "markings/2.1.a.svg", "markings/2.1.b.svg", "markings/2.1.v.svg", "markings/2.2.svg", "markings/2.3.svg", "markings/2.4.a.svg", "markings/2.4.b.svg", "markings/2.5.svg", "markings/2.6.svg", "markings/2.7.svg", "signs-svg/index.js"];
const WARM = ["signs-svg/1.1.svg", "signs-svg/1.10.svg", "signs-svg/1.11.svg", "signs-svg/1.12.svg", "signs-svg/1.13.svg", "signs-svg/1.14.svg", "signs-svg/1.15.a.svg", "signs-svg/1.15.b.svg", "signs-svg/1.15.v.svg", "signs-svg/1.16.svg", "signs-svg/1.17.svg", "signs-svg/1.18.svg", "signs-svg/1.19.svg", "signs-svg/1.2.svg", "signs-svg/1.20.svg", "signs-svg/1.21.svg", "signs-svg/1.22.svg", "signs-svg/1.23.svg", "signs-svg/1.24.svg", "signs-svg/1.25.svg", "signs-svg/1.26.svg", "signs-svg/1.27.svg", "signs-svg/1.28.svg", "signs-svg/1.29.a.svg", "signs-svg/1.29.b.svg", "signs-svg/1.29.v.svg", "signs-svg/1.3.a.svg", "signs-svg/1.3.b.svg", "signs-svg/1.4.a.svg", "signs-svg/1.4.b.svg", "signs-svg/1.4.d.svg", "signs-svg/1.4.e.svg", "signs-svg/1.4.g.svg", "signs-svg/1.4.v.svg", "signs-svg/1.5.svg", "signs-svg/1.6.svg", "signs-svg/1.7.svg", "signs-svg/1.8.a.svg", "signs-svg/1.8.b.svg", "signs-svg/1.9.a.svg", "signs-svg/1.9.b.svg", "signs-svg/2.1.svg", "signs-svg/2.10.svg", "signs-svg/2.11.svg", "signs-svg/2.12.svg", "signs-svg/2.13.svg", "signs-svg/2.14.svg", "signs-svg/2.15.svg", "signs-svg/2.16.svg", "signs-svg/2.17.svg", "signs-svg/2.18.a.svg", "signs-svg/2.18.b.svg", "signs-svg/2.19.svg", "signs-svg/2.2.svg", "signs-svg/2.20.svg", "signs-svg/2.21.svg", "signs-svg/2.22.svg", "signs-svg/2.23.svg", "signs-svg/2.24.svg", "signs-svg/2.25.svg", "signs-svg/2.26.svg", "signs-svg/2.27.svg", "signs-svg/2.28.svg", "signs-svg/2.29.svg", "signs-svg/2.3.svg", "signs-svg/2.4.svg", "signs-svg/2.5.svg", "signs-svg/2.6.svg", "signs-svg/2.7.svg", "signs-svg/2.8.svg", "signs-svg/2.9.svg", "signs-svg/3.1.svg", "signs-svg/3.2.svg", "signs-svg/3.3.a.svg", "signs-svg/3.3.b.svg", "signs-svg/3.3.v.svg", "signs-svg/3.4.svg", "signs-svg/3.5.svg", "signs-svg/3.6.svg", "signs-svg/3.7.svg", "signs-svg/4.1.a.svg", "signs-svg/4.1.b.svg", "signs-svg/4.1.d.svg", "signs-svg/4.1.e.svg", "signs-svg/4.1.g.svg", "signs-svg/4.1.v.svg", "signs-svg/4.2.a.svg", "signs-svg/4.2.b.svg", "signs-svg/4.2.v.svg", "signs-svg/4.3.svg", "signs-svg/4.4.svg", "signs-svg/4.5.svg", "signs-svg/4.6.svg", "signs-svg/4.7.svg", "signs-svg/5.1.svg", "signs-svg/5.10.a.svg", "signs-svg/5.10.b.svg", "signs-svg/5.11.a.svg", "signs-svg/5.11.b.svg", "signs-svg/5.12.a.svg", "signs-svg/5.12.b.svg", "signs-svg/5.13.a.svg", "signs-svg/5.13.b.svg", "signs-svg/5.14.svg", "signs-svg/5.15.svg", "signs-svg/5.16.svg", "signs-svg/5.17.svg", "signs-svg/5.18.svg", "signs-svg/5.19.a.svg", "signs-svg/5.19.b.svg", "signs-svg/5.2.svg", "signs-svg/5.20.a.svg", "signs-svg/5.20.b.svg", "signs-svg/5.20.g.svg", "signs-svg/5.20.v.svg", "signs-svg/5.21.svg", "signs-svg/5.22.svg", "signs-svg/5.23.svg", "signs-svg/5.24.svg", "signs-svg/5.25.svg", "signs-svg/5.26.svg", "signs-svg/5.27.svg", "signs-svg/5.28.svg", "signs-svg/5.29.svg", "signs-svg/5.3.svg", "signs-svg/5.30.a.svg", "signs-svg/5.30.b.svg", "signs-svg/5.30.v.svg", "signs-svg/5.31.a.svg", "signs-svg/5.31.b.svg", "signs-svg/5.31.v.svg", "signs-svg/5.32.svg", "signs-svg/5.33.a.svg", "signs-svg/5.33.b.svg", "signs-svg/5.33.g.svg", "signs-svg/5.33.v.svg", "signs-svg/5.34.a.svg", "signs-svg/5.34.b.svg", "signs-svg/5.34.v.svg", "signs-svg/5.35.svg", "signs-svg/5.36.svg", "signs-svg/5.37.svg", "signs-svg/5.38.a.svg", "signs-svg/5.38.b.svg", "signs-svg/5.39.svg", "signs-svg/5.4.svg", "signs-svg/5.40.a.svg", "signs-svg/5.40.b.svg", "signs-svg/5.40.v.svg", "signs-svg/5.41.a.svg", "signs-svg/5.41.b.svg", "signs-svg/5.5.svg", "signs-svg/5.6.svg", "signs-svg/5.7.svg", "signs-svg/5.8.svg", "signs-svg/5.9.a.svg", "signs-svg/5.9.b.svg", "signs-svg/6.1.svg", "signs-svg/6.10.svg", "signs-svg/6.11.svg", "signs-svg/6.12.svg", "signs-svg/6.13.svg", "signs-svg/6.14.svg", "signs-svg/6.15.svg", "signs-svg/6.16.svg", "signs-svg/6.2.svg", "signs-svg/6.3.svg", "signs-svg/6.4.svg", "signs-svg/6.5.svg", "signs-svg/6.6.svg", "signs-svg/6.7.svg", "signs-svg/6.8.svg", "signs-svg/6.9.svg", "signs-svg/7.1.a.svg", "signs-svg/7.1.b.svg", "signs-svg/7.1.g.svg", "signs-svg/7.1.v.svg", "signs-svg/7.10.svg", "signs-svg/7.11.svg", "signs-svg/7.12.svg", "signs-svg/7.13.svg", "signs-svg/7.14.svg", "signs-svg/7.15.svg", "signs-svg/7.16.svg", "signs-svg/7.17.a.svg", "signs-svg/7.17.b.svg", "signs-svg/7.2.a.svg", "signs-svg/7.2.b.svg", "signs-svg/7.2.d.svg", "signs-svg/7.2.e.svg", "signs-svg/7.2.g.svg", "signs-svg/7.2.v.svg", "signs-svg/7.3.a.svg", "signs-svg/7.3.b.svg", "signs-svg/7.3.v.svg", "signs-svg/7.4.a.svg", "signs-svg/7.4.b.svg", "signs-svg/7.4.d.svg", "signs-svg/7.4.e.svg", "signs-svg/7.4.g.svg", "signs-svg/7.4.v.svg", "signs-svg/7.4.zh.svg", "signs-svg/7.5.a.svg", "signs-svg/7.5.b.svg", "signs-svg/7.5.d.svg", "signs-svg/7.5.e.svg", "signs-svg/7.5.g.svg", "signs-svg/7.5.v.svg", "signs-svg/7.5.zh.svg", "signs-svg/7.6.a.svg", "signs-svg/7.6.b.svg", "signs-svg/7.6.d.svg", "signs-svg/7.6.e.svg", "signs-svg/7.6.g.svg", "signs-svg/7.6.i.svg", "signs-svg/7.6.v.svg", "signs-svg/7.6.z.svg", "signs-svg/7.6.zh.svg", "signs-svg/7.7.svg", "signs-svg/7.8.svg", "signs-svg/7.9.svg"];     // тэмдгийн вектор зургууд: хуудас 'warm' мессеж илгээхэд арын горимд хадгална
const STATIC = /\.(?:png|jpe?g|webp|svg|gif)$/i;
const MIME = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml', js: 'application/javascript' };
const base = new URL('./', self.location).pathname;
const rel = u => u.pathname.startsWith(base) ? u.pathname.slice(base.length) : u.pathname;
const isProt = r => r.startsWith('img/tests/') || (r.startsWith('signs-svg/') && r.endsWith('.svg')) || r === 'js/tests-data.js';

/* ---- түлхүүр (IndexedDB 'jolooniiapp-lic' / 'kv' / 'content' = {kid, k: base64}) ---- */
let keyMem = null;
const idb = () => new Promise((ok, no) => { const q = indexedDB.open('jolooniiapp-lic', 1); q.onupgradeneeded = () => q.result.createObjectStore('kv'); q.onsuccess = () => ok(q.result); q.onerror = () => no(q.error); });
const readKey = () => idb().then(db => new Promise(ok => { const q = db.transaction('kv').objectStore('kv').get('content'); q.onsuccess = () => ok(q.result || null); q.onerror = () => ok(null); }));
async function getKey(fresh) {
  if (keyMem && !fresh) return keyMem;
  const v = await readKey(); keyMem = null;
  if (!v || !v.k) return null;
  const raw = Uint8Array.from(atob(v.k), c => c.charCodeAt(0));
  keyMem = { kid: v.kid || 1, key: await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']) };
  return keyMem;
}
async function decrypt(buf) {          // buf: ArrayBuffer ('ZE1'+kid+iv+ct+tag) → ArrayBuffer | null
  const u = new Uint8Array(buf);
  for (const fresh of [false, true]) {
    const k = await getKey(fresh); if (!k) return null;
    try { return await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(4, 16) }, k.key, u.subarray(16)); } catch (_) {}
  }
  return null;
}
const isEnc = b => { const u = new Uint8Array(b, 0, 3); return u[0] === 0x5a && u[1] === 0x45 && u[2] === 0x31; };   // 'ZE1'

async function protectedResponse(r) {
  const url = new URL(r.url), c = await caches.open(IMG);
  let res = await c.match(url.href);
  if (!res) {
    res = await fetch(url.href);
    if (!res.ok) return res;
    await c.put(url.href, res.clone());
  }
  if (r.headers.get('x-prefetch')) return new Response(null, { status: 204 });      // «Офлайнд татах»: зөвхөн кэшлэнэ, тайлахгүй
  const buf = await res.arrayBuffer(), ext = url.pathname.split('.').pop().toLowerCase();
  let out = buf;
  if (isEnc(buf)) { out = await decrypt(buf); if (!out) return new Response('locked', { status: 403 }); }   // түлхүүр байхгүй/буруу
  return new Response(out, { status: 200, headers: { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' } });
}

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER)
    .then(c => Promise.allSettled(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VER && k !== IMG).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
async function warm() {
  const c = await caches.open(IMG);
  for (let i = 0; i < WARM.length; i += 6) {
    await Promise.all(WARM.slice(i, i + 6).map(async u => { try { if (!(await c.match(u))) await c.add(u); } catch (_) {} }));
  }
}
self.addEventListener('message', e => {
  if (e.data === 'warm') e.waitUntil(warm());
  else if (e.data && e.data.type === 'key') keyMem = null;       // түлхүүр шинэчлэгдсэн
});
self.addEventListener('fetch', e => {
  const r = e.request;
  const url = new URL(r.url);
  if (r.method !== 'GET' || url.origin !== location.origin) return;
  if (isProt(rel(url))) { e.respondWith(protectedResponse(r).catch(() => new Response('offline', { status: 504 }))); return; }
  if (STATIC.test(url.pathname) && !SHELL.includes(rel(url))) {      // зураг: кэш-түрүүлж
    e.respondWith(caches.open(IMG).then(c => c.match(r).then(hit => hit || fetch(r).then(res => {
      if (res.ok) c.put(r, res.clone());
      return res;
    }))));
  } else {                                                           // үндсэн файл: сүлжээ-түрүүлж, офлайнд кэш
    e.respondWith(fetch(r, { cache: 'no-cache' }).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(VER).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => caches.match(r, { ignoreSearch: true })
      .then(hit => hit || (r.mode === 'navigate' ? caches.match('tests.html') : undefined))));
  }
});
