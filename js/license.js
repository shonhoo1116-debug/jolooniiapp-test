'use strict';
/* Идэвхжүүлэх код (лиценз). Зөвхөн Android апп дээр (Capacitor / https://localhost) шалгана; компьютерийн браузерт саад болохгүй.
   Эхний удаа интернэтээр код оруулж төхөөрөмжид уяна; дараа нь офлайн ажиллана. Онлайн үед 6 цаг тутамд дахин шалгаж,
   хүчингүй болсон / өөр төхөөрөмжид шилжсэн бол дахин код асууна. Серверийн тал: supabase/license-setup.sql
   Туршихад браузерт: localStorage.setItem('zam-lic-dev','1') хийж дахин ачаалах. */
(() => {
  const BASE = 'https://wfydngfrnywevhhsbgyy.supabase.co', KEY = 'sb_publishable_9S3SxbiT2v9GMlApl_uRjQ_ksxqgtyS';
  const LS = 'zam-lic', DV = 'zam-dev-id', RECHECK = 6 * 3600e3;
  const get = k => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  const put = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };
  const del = k => { try { localStorage.removeItem(k); } catch (_) {} };
  const native = (() => { try { return !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()); } catch (_) { return false; } })() || (location.hostname === 'localhost' && location.protocol === 'https:');

  /* Вэб PWA (https, localhost биш): Safari/хөтөч дотор код асуухгүй — «нүүр дэлгэцэнд нэм» заавар гаргана (Safari ба нүүр дэлгэцийн апп тусдаа санах ойтой тул
     төхөөрөмжийн ID зөрж «өөр төхөөрөмж» алдаа гарна). Код зөвхөн нүүр дэлгэцээс (standalone) нээсэн апп дотор асуугдана.
     Хөгжүүлэлтэд: localStorage['zam-pwa-skip']='1' → заавар алгасна (хаалт ажиллахгүй). */
  const web = !native && location.protocol === 'https:' && location.hostname !== 'localhost';
  const standalone = (() => { try { return !!navigator.standalone || matchMedia('(display-mode: standalone)').matches; } catch (_) { return false; } })();
  if (!native && !web && get('zam-lic-dev') !== '1') return;

  const devId = () => { let d = get(DV); if (!d || d.length < 8) { d = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); put(DV, d); } return d; };
  const rpc = (fn, body) => {
    const ac = window.AbortController ? new AbortController() : null, tm = setTimeout(() => ac && ac.abort(), 12000);
    return fetch(BASE + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ac ? ac.signal : undefined })
      .then(r => { clearTimeout(tm); if (!r.ok) throw new Error('http ' + r.status); return r.json(); }, e => { clearTimeout(tm); throw e; });
  };
  /* ---- Агуулгын түлхүүр (зөвхөн вэб PWA): сервер идэвхжүүлэх/шалгахад `key` (base64) буцаана → IndexedDB-д хадгална, service worker шифртэй файлыг тайлна ---- */
  const idbOpen = () => new Promise((ok, no) => { const q = indexedDB.open('jolooniiapp-lic', 1); q.onupgradeneeded = () => q.result.createObjectStore('kv'); q.onsuccess = () => ok(q.result); q.onerror = () => no(q.error); });
  const tellSW = () => { try { if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ type: 'key' }); } catch (_) {} };
  const putKey = (k, kid) => idbOpen().then(db => new Promise(ok => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put({ k, kid: kid || 1 }, 'content'); t.oncomplete = () => ok(true); t.onerror = () => ok(false); })).then(v => { tellSW(); return v; }).catch(() => false);
  const delKey = () => idbOpen().then(db => new Promise(ok => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').delete('content'); t.oncomplete = () => ok(true); t.onerror = () => ok(false); })).then(v => { tellSW(); return v; }).catch(() => false);
  const hasKey = () => idbOpen().then(db => new Promise(ok => { const q = db.transaction('kv').objectStore('kv').get('content'); q.onsuccess = () => ok(!!(q.result && q.result.k)); q.onerror = () => ok(false); })).catch(() => false);
  const norm = s => s.toUpperCase().replace(/[АВЕКМНОРСТХ]/g, c => 'ABEKMHOPCTX'['АВЕКМНОРСТХ'.indexOf(c)]).replace(/[^A-Z0-9]/g, '');   // Кирилл ижил үсгийг Латин болгоно
  let lic = null; try { lic = JSON.parse(get(LS) || 'null'); } catch (_) {}
  const MSG = {
    not_found: 'Код буруу байна. Дахин шалгана уу.',
    revoked: 'Энэ код хүчингүй болсон. Танд код өгсөн хүнтэй холбогдоно уу.',
    other_device: 'Энэ код өөр төхөөрөмж дээр идэвхжсэн байна. Утсаа сольсон бол танд код өгсөн хүнтэй холбогдоно уу.',
    bad_input: 'Кодоо бүтнээр нь оруулна уу.',
    net: 'Интернэт холболтоо шалгана уу. Идэвхжүүлэхэд нэг удаа интернэт хэрэгтэй.',
    nokey: 'Агуулгыг нээхэд нэг удаа интернэт хэрэгтэй. Холбогдоод апп-аа дахин нээнэ үү.',
  };

  let gate = null;
  const css = '#zl{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;overflow:auto;overscroll-behavior:contain;' +
    'background:radial-gradient(60% 40% at 15% 5%,#27407f 0%,transparent 70%),radial-gradient(55% 35% at 90% 90%,#4a2f86 0%,transparent 70%),linear-gradient(160deg,#0b1020,#141d3a);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#f1f5ff}' +
    '#zl .c{width:min(92vw,380px);padding:26px 22px;border-radius:26px;border:1px solid rgba(190,210,255,.28);background:linear-gradient(160deg,rgba(60,80,140,.55),rgba(30,42,80,.7));box-shadow:0 20px 50px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.22);text-align:center}' +
    '#zl .k{width:58px;height:58px;margin:0 auto 12px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:28px;background:linear-gradient(145deg,#7aa2ff,#4a63e8);box-shadow:inset 0 1.5px 0 rgba(255,255,255,.7),0 8px 18px rgba(74,99,232,.45)}' +
    '#zl h2{margin:0 0 6px;font-size:20px;font-weight:700}#zl p{margin:0 0 16px;font-size:14px;line-height:1.45;color:#b8c5e0}' +
    '#zl input{width:100%;box-sizing:border-box;padding:14px 12px;border-radius:14px;border:1px solid rgba(190,210,255,.35);background:rgba(8,13,30,.55);color:#fff;font-size:20px;font-weight:600;letter-spacing:.08em;text-align:center;text-transform:uppercase;outline:none}' +
    '#zl input:focus{border-color:#83a8f8;box-shadow:0 0 0 3px rgba(131,168,248,.28)}' +
    '#zl .m{min-height:20px;margin:10px 0 4px;font-size:13.5px;line-height:1.4;color:#ff9aa8}' +
    '#zl button{width:100%;padding:14px;border:0;border-radius:14px;font-size:16px;font-weight:700;color:#fff;background:linear-gradient(145deg,#6f93ff,#4a63e8);box-shadow:inset 0 1.5px 0 rgba(255,255,255,.55),0 8px 18px rgba(74,99,232,.4);cursor:pointer}' +
    '#zl button:disabled{opacity:.6}';
  if (web && !standalone) {
    if (get('zam-pwa-skip') === '1') return;
    const ua = navigator.userAgent, ios = /iPhone|iPad|iPod/.test(ua), notSafari = ios && /CriOS|FxiOS|EdgiOS|OPiOS|GSA/.test(ua);
    const steps = ios
      ? (notSafari ? '<li><b>Safari</b> хөтчөөр энэ хаягийг нээнэ үү (цэнхэр луужин дүрстэй).</li>' : '') +
        '<li>Доорх <b>Share</b> (дээш сумтай дөрвөлжин) товчийг дарна.</li><li><b>Add to Home Screen</b> гэж сонгоно.</li>' +
        '<li><b>Open as Web App</b> унтраалгыг <b>асаалттай</b> байлгаад <b>Add</b> дарна.</li><li>Нүүр дэлгэц дээрх шинэ дүрсээр нээж, кодоо оруулна.</li>'
      : '<li>Хөтчийн цэснээс <b>Нүүр дэлгэцэнд нэмэх</b> / <b>Апп суулгах</b> гэж сонгоно.</li><li>Нүүр дэлгэц дээрх шинэ дүрсээр нээж, кодоо оруулна.</li>';
    const mountInstall = () => {
      const d = document.createElement('div'); d.id = 'zl';
      d.innerHTML = '<style>' + css + '#zl ol{text-align:left;margin:0 0 6px;padding-left:20px;font-size:14px;line-height:1.55;color:#d6e0f5}#zl li{margin-bottom:6px}</style>' +
        '<div class="c"><div class="k">📲</div><h2>Нүүр дэлгэцэнд нэмнэ үү</h2><p>Энэ апп-ыг нүүр дэлгэцэндээ нэмж, тэндээс нээсний дараа идэвхжүүлэх код оруулна.</p><ol>' + steps + '</ol></div>';
      document.documentElement.appendChild(d);
    };
    if (document.documentElement) mountInstall(); else document.addEventListener('DOMContentLoaded', mountInstall);
    return;
  }

  const show = note => {
    if (gate) { gate.querySelector('.m').textContent = note || ''; return; }
    const mount = () => {
      gate = document.createElement('div'); gate.id = 'zl';
      gate.innerHTML = '<style>' + css + '</style><div class="c"><div class="k">🔑</div><h2>Идэвхжүүлэх код</h2><p>Танд өгсөн кодыг оруулна уу. Нэг удаа интернэт хэрэгтэй.</p>' +
        '<input id="zl-in" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XX-XXXX-XXXX" maxlength="24"><div class="m"></div><button id="zl-go" type="button">Идэвхжүүлэх</button></div>';
      document.documentElement.appendChild(gate);
      const inp = gate.querySelector('#zl-in'), go = gate.querySelector('#zl-go'), m = gate.querySelector('.m');
      m.textContent = note || '';
      const submit = () => {
        const code = norm(inp.value); if (code.length < 6) { m.textContent = MSG.bad_input; return; }
        go.disabled = true; go.textContent = 'Шалгаж байна…'; m.textContent = '';
        rpc('activate_license', { p_code: code, p_device: devId() }).then(r => {
          if (r && r.ok) {
            lic = { code, t: Date.now() }; put(LS, JSON.stringify(lic));
            const done = () => { gate.remove(); gate = null; if (web) location.reload(); };   // вэб: шифртэй скриптүүд тайлагдан ачаалагдахын тулд дахин ачаална
            if (web && r.key) putKey(r.key, r.kid).then(done); else done();
          }
          else { m.textContent = MSG[r && r.err] || MSG.bad_input; }
        }).catch(() => { m.textContent = MSG.net; }).then(() => { if (gate) { go.disabled = false; go.textContent = 'Идэвхжүүлэх'; } });
      };
      go.onclick = submit; inp.onkeydown = e => { if (e.key === 'Enter') submit(); };
    };
    if (document.documentElement) mount(); else document.addEventListener('DOMContentLoaded', mount);
  };

  const recheck = force => {
    if (!lic || !lic.code || (force !== true && Date.now() - (lic.t || 0) < RECHECK)) return;
    rpc('check_license', { p_code: lic.code, p_device: devId() }).then(r => {
      if (r && r.ok) {
        lic.t = Date.now(); put(LS, JSON.stringify(lic));
        if (web && r.key) hasKey().then(had => putKey(r.key, r.kid).then(() => { if (!had) location.reload(); }));   // түлхүүр шинээр ирсэн бол дахин ачаална
      } else if (r && (r.err === 'revoked' || r.err === 'not_found' || r.err === 'other_device')) { del(LS); lic = null; if (web) delKey(); show(MSG[r.err]); }
    }).catch(() => { if (force === true) show(MSG.nokey); });   // сүлжээгүй бол одоогийн байдлаар үргэлжлүүлнэ (түлхүүртэй бол)
  };

  window.ZamLicense = { active: () => !!(lic && lic.code), reset: () => { del(LS); lic = null; if (web) delKey(); show(); } };
  if (lic && lic.code) {
    addEventListener('load', () => setTimeout(recheck, 1500)); addEventListener('online', () => recheck());
    if (web) hasKey().then(h => { if (!h) recheck(true); });    // код идэвхжсэн боловч түлхүүр байхгүй (хуучин суулгалт) → серверээс түлхүүр аваад дахин ачаална
  } else show();
})();
