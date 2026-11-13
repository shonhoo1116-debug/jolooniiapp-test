'use strict';
/* Тестийн асуултын зураг болох тэмдгүүд: тэмдгийн сангаас (signs-draw*.js, signs-svg) кодоор зурна.
   Асуултын sg: ['2.1', '3.5'] — тэмдэг бүр; 'тэмдэг+самбар' (жишээ '3.4+7.1.б'); 'код@текст' — тоо нь өөр самбар.
   sgl — шошго ('123' гэвэл 1 2 3, үгүй бол А Б В Г Д). Нэг тэмдэгтэй бол шошгогүй. */
const TSIGN = (() => {
  const { rr, circ, txt, parrow, truck, carFront, RED, BLUE, BLK, WHT } = SG.h;
  const fit = (c, s, x, y, maxW, size, col) => {
    c.font = `bold ${size}px Arial, "Liberation Sans", sans-serif`;
    const w = c.measureText(s).width || maxW; txt(c, s, x, y, size * Math.min(1, maxW / w), col, 'bold');
  };
  const plate = (c, w, h) => { rr(c, -w / 2, -h / 2, w, h, 5, BLK); rr(c, -w / 2 + 2.5, -h / 2 + 2.5, w - 5, h - 5, 3, WHT); };
  const ring = c => { circ(c, 50, RED); circ(c, 39, WHT); };
  // каталогт байхгүй хувилбарууд
  SG.reg('T.truck', c => { ring(c); c.save(); c.scale(.6, .6); truck(c, BLK, ''); c.restore(); });   // 2.4, 8т бичээсгүй
  SG.reg('T.2.20', c => { ring(c); [[-23, RED], [23, BLK]].forEach(([x, col]) => { c.save(); c.translate(x, 0); c.scale(.74, .42); carFront(c, col, 0, 0, 1); c.restore(); }); });   // 2.20: хоёр машин зайтай (эх зургийн дагуу)
  SG.reg('T.laneR', c => {   // баруун гар тийш эргэх эгнээ: цэнхэр дөрвөлжин, цагаан муруй сум, хоёр талдаа тасархай шугам
    rr(c, -34, -48, 68, 96, 5, WHT); rr(c, -31, -45, 62, 90, 3, BLUE);
    c.save(); c.setLineDash([6, 6]); [-22, 24].forEach(x => { c.beginPath(); c.moveTo(x, 40); c.lineTo(x, -10); c.strokeStyle = WHT; c.lineWidth = 2.4; c.stroke(); }); c.restore();
    c.beginPath(); c.moveTo(-3, 42); c.lineTo(-3, -8); c.quadraticCurveTo(-3, -24, 12, -24); c.strokeStyle = WHT; c.lineWidth = 9; c.lineCap = 'butt'; c.stroke();
    c.beginPath(); c.moveTo(10, -38); c.lineTo(32, -24); c.lineTo(10, -10); c.closePath(); c.fillStyle = WHT; c.fill();
  });
  // 2.20: албан ёсны SVG-д хоёр машин хар — эх зургийн дагуу зүүн талынхыг улаан болгоно (дотор тойргийн зүүн хагасын хар пиксел)
  const RECOLOR = { '2.20': 1 };
  const drawRecolor = (c, code, x, y, size) => {   // file://-д canvas «tainted» болдог тул пиксел уншихгүй — screen холиц ашиглана (хар → улаан, цагаан хэвээр)
    SG.drawSign(c, code, x, y, size);
    c.save(); c.beginPath(); c.arc(x, y, size / 2 * .74, Math.PI / 2, Math.PI * 1.5); c.closePath(); c.clip();
    c.globalCompositeOperation = 'screen'; c.fillStyle = '#e3141c'; c.fillRect(x - size / 2, y - size / 2, size, size); c.restore();
  };
  const ensure = code => {   // '7.1.а@350м', '7.2.а@800м'
    if (SG.has(code)) return;
    const m = /^(7\.[12]\.а)@(.+)$/.exec(code); if (!m) return;
    const t = m[2];
    if (m[1] === '7.1.а') SG.reg(code, c => { plate(c, 96, 40); fit(c, t, 0, 1, 84, 24, BLK); });
    else SG.reg(code, c => {
      plate(c, 96, 40); parrow(c, [[-40, 12], [-40, -12]], 6, BLK); fit(c, t, 0, 1, 50, 18, BLK); parrow(c, [[40, 12], [40, -12]], 6, BLK);
    });
  };
  const NOSVG = new Set(['2.27', 'T.2.20']);   // албан ёсны SVG нь эх зурагтай таарахгүй (2.27 тасарсан, 2.20 хоёр машин хар) — кодоор зурсныг хэрэглэнэ
  const KS = { '1.29.в': 1.7 };   // өргөн тэмдгийг томруулж зурна
  const PLATE_H = { '7.1.б': 88, '7.2.б': 96, '7.2.в': 96, '7.2.г': 96 };
  const parse = s => { const [sign, plt] = s.split('+'); return { sign, plate: plt || '' }; };

  function paint(root) {
    root.querySelectorAll('canvas.sgc').forEach(cv => {
      const items = cv.dataset.sg.split('|').map(parse), n = items.length;
      const lab = n > 1 ? [...(cv.dataset.sgl || 'АБВГД')] : [];
      items.forEach(it => { if (it.plate) ensure(it.plate); ensure(it.sign); });
      const W = 1000, cell = W / n, ph = Math.max(0, ...items.map(it => it.plate ? (PLATE_H[it.plate] || 44) : 0));
      const s = Math.min(340, cell * .78, 420 / (1 + (ph ? .06 + ph / 100 : 0)));
      const total = s * (1 + (ph ? .06 + ph / 100 : 0)), H = Math.round(34 + total + (lab.length ? 92 : 34));
      cv.width = W; cv.height = H; const c = cv.getContext('2d');
      c.fillStyle = '#eef0f3'; c.fillRect(0, 0, W, H);
      items.forEach((it, i) => {
        const cx = cell * (i + .5), top = 34;
        if (RECOLOR[it.sign]) drawRecolor(c, it.sign, cx, top + s / 2, s * (KS[it.sign] || 1)); else if (!(NOSVG.has(it.sign) ? SG.drawCanvas : SG.drawSign)(c, it.sign, cx, top + s / 2, s * (KS[it.sign] || 1))) { c.fillStyle = '#c00'; c.font = 'bold 40px Arial'; c.textAlign = 'center'; c.fillText('? ' + it.sign, cx, top + s / 2); }
        if (it.plate) { const h = (PLATE_H[it.plate] || 44) * s / 100; SG.drawSign(c, it.plate, cx, top + s + s * .06 + h / 2, s); }
        if (lab.length) { c.fillStyle = '#1b1b1b'; c.font = 'bold 66px "Times New Roman", Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(lab[i], cx, H - 22); }
      });
    });
  }
  const html = q => q.sg ? `<canvas class="sgc" width="1000" height="420" data-sg="${q.sg.join('|')}" data-sgl="${q.sgl || ''}"></canvas>` : '';
  return { paint, html };
})();

