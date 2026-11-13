'use strict';
/* CrystalDialog — аппын БҮХ баталгаажуулах/анхааруулах цонхны нэгдсэн Premium Crystal Glass систем.
   CrystalDialog.confirm({ id, type:'info|warning|danger|success', icon, title, text, ok, cancel, primary:'cancel|confirm' }) → Promise<boolean>
   CrystalDialog.alert({ title, text, ok, type }) → Promise<true>;  isOpen(id?);  dismiss() (үр дүн false)
   Нэг удаад ЗӨВХӨН нэг цонх. Back (popstate) дарахад цонх хаагдана (cancel). Давхар товшилт нэг л удаа ажиллана. Хаагдахад focus буцна. */
const CrystalDialog = (() => {
  let cur = null, fwd = 0, styled = false;
  const RM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; } };
  const ICONS = {
    info: '<path d="M12 11v5.5M12 7.6v.2"/><circle cx="12" cy="12" r="9"/>',
    warning: '<path d="M12 7.5v5.2M12 16.3v.2"/><path d="M10.3 3.9L2.7 17.2A2 2 0 004.4 20.2h15.2a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/>',
    danger: '<path d="M12 7.5v5.2M12 16.3v.2"/><circle cx="12" cy="12" r="9"/>',
    success: '<path d="M7.8 12.4l2.9 2.9 5.5-5.8"/><circle cx="12" cy="12" r="9"/>'
  };
  const CSS = `
  .cd-ov { position:fixed; inset:0; z-index:2147483000; display:grid; place-items:center; padding:max(20px, env(safe-area-inset-top)) 20px max(20px, env(safe-area-inset-bottom)); background:rgba(10,16,36,.5); -webkit-backdrop-filter:blur(5px); backdrop-filter:blur(5px); opacity:0; transition:opacity .18s ease; touch-action:none; }
  .cd-ov.on { opacity:1; }
  .cd-box { --cd-acc:#5b7cff; width:min(100%,340px); max-height:calc(100dvh - 40px); overflow:auto; padding:20px 18px 16px; border-radius:24px; text-align:center; color:#172344; outline:none;
    background:linear-gradient(180deg, rgba(255,255,255,.7) 0%, rgba(255,255,255,0) 46%), linear-gradient(150deg, #FFFFFF 0%, #EAF0FF 55%, #EEE7FF 100%); border:1px solid #fff;
    box-shadow:0 1px 2px rgba(40,60,130,.12), 0 10px 24px rgba(40,60,130,.22), inset 0 1px 0 #fff; transform:translateY(8px) scale(.94); opacity:0; transition:transform .2s cubic-bezier(.2,.8,.2,1), opacity .18s ease; will-change:transform, opacity; }
  .cd-ov.on .cd-box { transform:none; opacity:1; }
  .cd-ico { width:44px; height:44px; margin:0 auto 10px; display:grid; place-items:center; border-radius:50%; color:#fff; background:linear-gradient(180deg, color-mix(in srgb, var(--cd-acc) 70%, #fff), var(--cd-acc)); box-shadow:0 4px 10px color-mix(in srgb, var(--cd-acc) 35%, transparent), inset 0 1px 0 rgba(255,255,255,.55); }
  .cd-ico svg { width:24px; height:24px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
  .cd-box h3 { margin:0 0 8px; font-size:18px; font-weight:600; line-height:1.3; } .cd-box p { margin:0 0 16px; font-size:14px; line-height:1.45; color:#526587; white-space:pre-line; overflow-wrap:anywhere; }
  .cd-btns { display:flex; gap:10px; } .cd-btns button { flex:1; min-height:46px; padding:8px 10px; border:0; border-radius:16px; font:inherit; font-weight:600; font-size:14.5px; line-height:1.2; cursor:pointer; transition:transform .15s; }
  .cd-btns button:active { transform:scale(.97); } .cd-btns button:focus-visible { outline:2px solid #3d5afe; outline-offset:2px; }
  .cd-p { background:linear-gradient(180deg, #86a0ff, #5b7cff); color:#fff; box-shadow:0 3px 10px rgba(61,90,254,.3), inset 0 1px 0 rgba(255,255,255,.45); }
  .cd-s { background:linear-gradient(180deg, #fff, #F2F5FF); color:#172344; border:1px solid #D5DEF2 !important; }
  .cd-box.danger .cd-s { color:#b02348; } .cd-btns.one button { flex:1 1 100%; }
  .cd-box.warning { --cd-acc:#f0a13a; } .cd-box.danger { --cd-acc:#e0476b; } .cd-box.success { --cd-acc:#2fb985; }
  html[data-theme="dark"] .cd-ov { background:rgba(2,5,14,.62); }
  html[data-theme="dark"] .cd-box { color:#F1F5FF; background:linear-gradient(180deg, rgba(190,210,255,.14) 0%, rgba(190,210,255,0) 46%), linear-gradient(150deg, #1E2A47, #17213B); border-color:rgba(190,210,255,.26); box-shadow:0 10px 24px rgba(0,0,0,.45), inset 0 1px 0 rgba(190,210,255,.26); }
  html[data-theme="dark"] .cd-box p { color:#B8C5E0; } html[data-theme="dark"] .cd-s { background:linear-gradient(180deg, #2A3860, #1E2A47); color:#F1F5FF; border-color:rgba(190,210,255,.28) !important; }
  html[data-theme="dark"] .cd-box.danger .cd-s { color:#FFB3C2; }
  @media (prefers-reduced-motion:reduce) { .cd-ov, .cd-box, .cd-btns button { transition:none; } }`;
  const ensureStyle = () => { if (styled) return; styled = true; const s = document.createElement('style'); s.id = 'cd-style'; s.textContent = CSS; document.head.appendChild(s); };
  const bgEls = () => { const a = document.getElementById('app'); return a ? [a] : [...document.body.children].filter(e => !e.classList.contains('cd-ov') && e.tagName !== 'SCRIPT'); };
  const finish = (d, val) => {
    if (!d || d.settled) return; d.settled = true; if (cur === d) cur = null;
    bgEls().forEach(e => { e.inert = false; e.removeAttribute('aria-hidden'); });
    document.removeEventListener('keydown', d.key, true);
    const ov = d.ov, rm = () => ov.remove();
    ov.style.pointerEvents = 'none'; ov.classList.remove('on'); if (RM()) rm(); else setTimeout(rm, 220);
    try { if (d.prev && d.prev.isConnected && d.prev.focus) d.prev.focus({ preventScroll: true }); } catch (_) {}
    d.resolve(val);
  };
  function confirm(o) {
    o = o || {};
    if (cur && !cur.settled) { if (o.id && cur.id === o.id) return cur.promise; finish(cur, false); }   // нэг удаад нэг цонх
    ensureStyle();
    const type = ['info', 'warning', 'danger', 'success'].includes(o.type) ? o.type : 'info', single = o.cancel === null;
    const d = { id: o.id || '', settled: false, prev: document.activeElement, t0: performance.now() };
    d.promise = new Promise(r => { d.resolve = r; });
    const ov = d.ov = document.createElement('div'); ov.className = 'cd-ov';
    const uid = 'cd' + Math.random().toString(36).slice(2, 7), pc = (o.primary || 'cancel') === 'confirm';
    const ico = o.icon === false ? '' : '<div class="cd-ico" aria-hidden="true"><svg viewBox="0 0 24 24">' + (o.icon || ICONS[type]) + '</svg></div>';
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    ov.innerHTML = '<div class="cd-box ' + type + '" role="alertdialog" aria-modal="true" aria-labelledby="' + uid + 't" aria-describedby="' + uid + 'd" tabindex="-1">' + ico +
      '<h3 id="' + uid + 't">' + esc(o.title) + '</h3><p id="' + uid + 'd">' + esc(o.text) + '</p>' +
      '<div class="cd-btns' + (single ? ' one' : '') + '">' + (single ? '' : '<button type="button" class="cd-no ' + (pc ? 'cd-s' : 'cd-p') + '">' + esc(o.cancel || 'Үгүй') + '</button>') +
      '<button type="button" class="cd-yes ' + (pc || single ? 'cd-p' : 'cd-s') + '">' + esc(o.ok || 'Тийм') + '</button></div></div>';
    const box = ov.firstChild, yes = ov.querySelector('.cd-yes'), no = ov.querySelector('.cd-no');
    const act = v => () => finish(d, v);
    yes.onclick = act(true); if (no) no.onclick = act(false);
    ov.addEventListener('click', e => { if (e.target === ov && performance.now() - d.t0 > 250 && !single) finish(d, false); });
    d.key = e => {                                                                               // Escape = цуцлах; Tab цонхны дотор
      if (e.key === 'Escape') { e.preventDefault(); finish(d, false); return; }
      if (e.key !== 'Tab') return; const f = [...box.querySelectorAll('button')], i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    };
    document.addEventListener('keydown', d.key, true);
    bgEls().forEach(e => { e.inert = true; e.setAttribute('aria-hidden', 'true'); });              // арын дэлгэц дээр даралт, focus үүсэхгүй
    document.body.appendChild(ov); cur = d;
    requestAnimationFrame(() => { ov.classList.add('on'); try { (pc || single ? yes : no || yes).focus({ preventScroll: true }); } catch (_) {} });
    return d.promise;
  }
  const alert = o => confirm(Object.assign({}, o, { cancel: null })).then(() => true);
  const isOpen = id => !!cur && !cur.settled && (!id || cur.id === id);
  const dismiss = () => { if (cur) finish(cur, false); };
  /* Android/хөтчийн Back: цонх нээлттэй үед Back = цуцлах. Түүхийн нэг алхмыг буцааж сэргээнэ (forward), өөр handler-ууд энэ event-ийг алгасана. */
  window.addEventListener('popstate', e => {
    if (fwd > 0) { fwd--; e.cdHandled = true; return; }
    if (cur && !cur.settled) { e.cdHandled = true; finish(cur, false); fwd++; try { history.forward(); setTimeout(() => { fwd = 0; }, 600); } catch (_) { fwd = 0; } }
  });
  return { confirm, alert, isOpen, dismiss };
})();
