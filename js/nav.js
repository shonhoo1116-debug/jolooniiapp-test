'use strict';
/* Навигацийн түүх: Нүүр (Home) = root. Доош орохдоо history-д нэмнэ (push), дээш/нүүр рүү буцахдаа history.go(-k)-аар буцааж ЦЭВЭРЛЭНЭ.
   Ингэснээр нүүр рүү буцсаны дараа Back дарахад өмнө үзсэн цэсүүд дахин нээгдэхгүй, түүх хязгааргүй өсөхгүй.
   Оруулга бүр history.state = { n: түвшин } -тэй. n=0: суурь (base, нүүр), n=1: Нүүр, n>=2: дотоод цэсүүд. HS[n] = тухайн түвшний hash. */
const NAV = (() => {
  const SK = 'zam-nav-hs';
  let n = 0, HS = [];
  const save = () => { try { sessionStorage.setItem(SK, JSON.stringify(HS)); } catch (_) {} };
  const platform = () => { try { return (window.Capacitor && Capacitor.getPlatform && Capacitor.getPlatform()) || 'web'; } catch (_) { return 'web'; } };
  const cur = () => location.hash || '#chapters';
  const init = () => {
    const st = history.state;
    if (st && typeof st.n === 'number') {                 // дахин ачаалсан / signs.html-ээс буцсан: түвшин хадгалагдсан
      n = st.n; try { HS = JSON.parse(sessionStorage.getItem(SK) || '[]'); } catch (_) { HS = []; }
      if (!Array.isArray(HS)) HS = []; HS[n] = cur(); save(); return;
    }
    const h = cur();                                       // шинэ эхлэл: [base(#chapters), Нүүр(#chapters), (хэрэв өөр цэс бол) тэр цэс]
    HS = ['#chapters'];
    history.replaceState({ n: 0, base: 1 }, '', '#chapters');
    history.pushState({ n: 1 }, '', '#chapters'); n = 1; HS[1] = '#chapters';
    if (h !== '#chapters') { history.pushState({ n: 2 }, '', h); n = 2; HS[2] = h; }
    save();
  };
  /* Нэмэлт оруулга (шалгалтын хамгаалалт, томруулсан зураг): түвшинд тооцогдоно. */
  const push = st => { n++; HS[n] = cur(); history.pushState(Object.assign({ n }, st || {}), ''); save(); };
  /* Дээш/нүүр рүү: target hash-тай ойрхон өмнөх түвшин рүү history.go(-k) хийнэ. Олдохгүй бол одоогийн оруулгыг солино. */
  const up = target => {
    target = target || '#chapters';
    let m = -1;
    if (target === '#chapters') m = HS[1] === '#chapters' ? 1 : 0;
    else for (let i = n - 1; i >= 0; i--) if (HS[i] === target) { m = i; break; }
    if (m >= 0 && m < n) { history.go(m - n); return; }
    if (m === n) { if (typeof route === 'function') route(); return; }
    history.replaceState({ n }, '', target); HS[n] = target; save(); if (typeof route === 'function') route();
  };
  /* Android: апп-аас гарах баталгаажуулалт — нэгдсэн CrystalDialog. Нүүрний түүхийн оруулгыг эхлээд сэргээнэ, тиймээс цонх нээлттэй үед Back = цонх хаагдаад Нүүр дээр үлдэнэ. */
  const exitApp = () => {
    try { const A = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App; if (A && A.exitApp) { A.exitApp(); return; } } catch (_) {}
    try { navigator.app && navigator.app.exitApp && navigator.app.exitApp(); } catch (_) {}
  };
  const askExit = () => {
    if (CrystalDialog.isOpen('exit')) return;
    history.pushState({ n: 1 }, '', '#chapters'); n = 1; HS[1] = '#chapters'; save();
    CrystalDialog.confirm({ id: 'exit', type: 'warning', title: 'Апп-аас гарах уу?', text: 'Та аппликейшнээс гарахдаа итгэлтэй байна уу?', cancel: 'Үгүй, үлдэх', ok: 'Тийм, гарах' }).then(ok => { if (ok) exitApp(); });
  };
  window.__exitAsk = () => { if (platform() === 'android') askExit(); else return false; };   // MainActivity: WebView-д буцах түүх байхгүй үед дуудна
  const onBase = () => {
    const p = platform();
    if (p === 'android') { askExit(); return; }
    if (p === 'ios') return;                               // iOS: програмаар хаахгүй
    history.back();                                        // Web: хөтчийн өмнөх (гадаад) хуудас руу хэвийн буцна
  };
  window.addEventListener('popstate', e => {
    if (e.cdHandled) return;                              // CrystalDialog өөрөө боловсруулсан (Back = цонх хаах)
    const st = e.state; if (!st || typeof st.n !== 'number') return;
    n = st.n; if (st.base) onBase();
  });
  window.addEventListener('hashchange', () => {          // route()-ээс өмнө бүртгэгдсэн тул түвшинг эхэлж тооцно
    const st = history.state;
    if (!st || typeof st.n !== 'number') { n++; history.replaceState({ n }, ''); } else n = st.n;
    HS[n] = cur(); save();
  });
  /* Дэлгэцийн ← болон «Нүүр хуудас» товч: шинэ оруулга нэмэхгүй, түүхийг буцаана. */
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const a = e.target.closest && e.target.closest('a'); if (!a) return;
    const h = a.getAttribute('href'); if (!h || h[0] !== '#') return;
    if (a.classList.contains('back') || h === '#chapters') { e.preventDefault(); up(h); }
  });
  return { init, push, up, platform, get n() { return n; }, hs: () => HS.slice() };
})();
