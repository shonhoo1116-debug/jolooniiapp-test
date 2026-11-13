'use strict';
// Замын тэмдгийг кодоор зурна. Тэмдэг бүр -50..50 хэмжээний нэгж дөрвөлжинд төвөөрөө зурагдана.
// drawSign(ctx, код, x, y, хэмжээ) — зурагдсан бол true, зураагүй бол false буцаана.

const SG = (() => {
  const RED = '#d9261c', BLUE = '#1a5ea6', BLK = '#161616', WHT = '#ffffff', YEL = '#ffd21a', GRY = '#8d9097';
  const DRAW = {};

  // ---------- энгийн хэрэгсэл ----------
  const circ = (c, r, fill, x = 0, y = 0) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); };
  const line = (c, pts, w, col, cap = 'round', join = 'round') => {
    c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = cap; c.lineJoin = join; c.stroke();
  };
  const rr = (c, x, y, w, h, r, fill) => {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); c.fillStyle = fill; c.fill();
  };
  const poly = (c, pts, fill) => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fillStyle = fill; c.fill(); };
  const txt = (c, s, x, y, size, col, weight = 'bold') => {
    c.font = `${weight} ${size}px Arial, "Liberation Sans", sans-serif`; c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y);
  };
  const headAt = (c, x, y, ang, len, wid, col) => {
    c.save(); c.translate(x, y); c.rotate(ang); c.beginPath(); c.moveTo(0, 0); c.lineTo(-len, -wid / 2); c.lineTo(-len, wid / 2); c.closePath(); c.fillStyle = col; c.fill(); c.restore();
  };
  // сумтай зам: pts-ийн эцэст сумны толгой
  const parrow = (c, pts, w, col) => {
    const n = pts.length, [x2, y2] = pts[n - 1], [x1, y1] = pts[n - 2], a = Math.atan2(y2 - y1, x2 - x1);
    const hl = w * 1.9, hw = w * 2.7;
    const p = pts.slice(0, n - 1).concat([[x2 - Math.cos(a) * hl * .8, y2 - Math.sin(a) * hl * .8]]);
    line(c, p, w, col, 'butt', 'miter'); headAt(c, x2, y2, a, hl, hw, col);
  };
  const arcArrow = (c, r, a0, a1, w, col) => {   // a0-оос a1 хүртэл цагийн зүүний эсрэг
    c.beginPath(); c.arc(0, 0, r, a0, a1 + .32, true); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'butt'; c.stroke();
    const x = r * Math.cos(a1), y = r * Math.sin(a1); headAt(c, x, y, Math.atan2(-Math.cos(a1), Math.sin(a1)), w * 1.3, w * 2.1, col);
  };
  const roundabout = (c, col) => { for (let k = 0; k < 3; k++) arcArrow(c, 32, k * 2.094 + 1.9, k * 2.094 + 0.55, 11, col); };

  // ---------- хэлбэрүүд ----------
  const ring = (c, fill = WHT, col = RED, w = 11) => { circ(c, 50, col); circ(c, 50 - w, fill); };
  const thinRing = (c, fill = WHT) => { circ(c, 50, BLK); circ(c, 48.5, fill); };
  const blueDisc = c => { circ(c, 50, BLUE); c.beginPath(); c.arc(0, 0, 46.5, 0, 7); c.strokeStyle = WHT; c.lineWidth = 1.6; c.stroke(); };
  const blueSquare = c => { rr(c, -48, -48, 96, 96, 9, WHT); rr(c, -45, -45, 90, 90, 7, BLUE); };
  const tri = (c, up = true) => {
    let P = [[0, -48], [-50, 38.6], [50, 38.6]]; if (!up) P = P.map(p => [p[0], -p[1]]);
    const g = [0, (P[0][1] + P[1][1] + P[2][1]) / 3];
    const sc = k => P.map(p => [g[0] + (p[0] - g[0]) * k, g[1] + (p[1] - g[1]) * k]);
    const fillPoly = (Q, col, lw) => { c.beginPath(); Q.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath();
      c.fillStyle = col; c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.fill(); c.stroke(); };
    fillPoly(sc(.93), RED, 8); fillPoly(sc(.70), WHT, 3);
  };
  const WARN_K = { '1.1': .31, '1.2': .33, '1.5': .30, '1.8.а': .33, '1.8.б': .33, '1.15.б': .35, '1.15.в': .35, '1.22': .33, '1.23': .31, '1.25': .31 };
  const warn = (c, f) => { const k = WARN_K[c.__sgcode] || .38; tri(c, true); c.save(); c.translate(0, 8); c.scale(k, k); f(c); c.restore(); };
  const clipDisc = (c, r, f) => { c.save(); c.beginPath(); c.arc(0, 0, r, 0, 7); c.clip(); f(); c.restore(); };
  const slash = (c, col = RED, w = 8) => clipDisc(c, 39, () => line(c, [[-34, -34], [34, 34]], w, col, 'butt'));
  const endStripes = (c, col = BLK) => clipDisc(c, 48, () => { [-18, 0, 18].forEach(o => line(c, [[-60 + o, 60 + o * 0], [60 + o, -60 + o * 0]].map(p => [p[0], p[1] + o * .0]), 5.5, col, 'butt')); });

  // ---------- дүрсүүд ----------
  const walker = (c, col = BLK) => {
    circ(c, 7.5, col, 3, -41);
    line(c, [[1, -30], [-4, 2]], 13, col);
    line(c, [[-4, 2], [-18, 40]], 10, col); line(c, [[-4, 2], [12, 20], [8, 42]], 10, col);
    line(c, [[0, -26], [-18, -6], [-28, 6]], 8, col); line(c, [[3, -26], [20, -12], [24, 4]], 8, col);
  };
  const carSide = (c, col = BLK) => {
    c.beginPath(); c.moveTo(-46, 12); c.lineTo(-46, -1); c.quadraticCurveTo(-45, -8, -34, -9); c.lineTo(-22, -11); c.lineTo(-12, -27);
    c.lineTo(20, -27); c.lineTo(32, -11); c.lineTo(44, -7); c.quadraticCurveTo(48, -5, 48, 3); c.lineTo(48, 12); c.closePath(); c.fillStyle = col; c.fill();
    poly(c, [[-10, -22], [-17, -11], [-4, -11], [-4, -22]], WHT); poly(c, [[2, -22], [2, -11], [26, -11], [18, -22]], WHT);
    [-26, 28].forEach(x => { circ(c, 11, WHT, x, 13); circ(c, 9, col, x, 13); circ(c, 3.5, WHT, x, 13); });
  };
  const carFront = (c, col, x = 0, y = 0, k = 1) => {
    c.save(); c.translate(x, y); c.scale(k, k);
    rr(c, -24, -4, 48, 22, 6, col); rr(c, -17, -22, 34, 22, 7, col);
    poly(c, [[-12, -18], [-14, -4], [14, -4], [12, -18]], WHT);
    [-18, 18].forEach(px => rr(c, px - 5, 14, 10, 9, 2, col));
    c.restore();
  };
  const truck = (c, col = BLK, label = '') => {
    rr(c, -46, -26, 56, 38, 3, col); c.beginPath(); c.moveTo(14, -12); c.lineTo(30, -12); c.lineTo(46, 2); c.lineTo(46, 14); c.lineTo(14, 14); c.closePath(); c.fillStyle = col; c.fill();
    poly(c, [[18, -8], [28, -8], [38, 1], [18, 1]], WHT);
    [-30, -6, 32].forEach(x => { circ(c, 10, WHT, x, 14); circ(c, 8, col, x, 14); circ(c, 3, WHT, x, 14); });
    if (label) txt(c, label, -18, -7, 24, WHT);
  };
  const bicycle = (c, col = BLK) => {
    [-27, 27].forEach(x => { c.beginPath(); c.arc(x, 14, 18, 0, 7); c.strokeStyle = col; c.lineWidth = 5; c.stroke(); });
    line(c, [[-27, 14], [-8, -14], [14, -14], [27, 14]], 5, col); line(c, [[-8, -14], [4, 14], [-27, 14]], 5, col);
    line(c, [[14, -14], [8, -28], [20, -28]], 5, col); line(c, [[-12, -20], [-3, -20]], 6, col);
  };
  const lightBox = c => {
    rr(c, -15, -44, 30, 88, 8, BLK);
    [['#e22', -26], ['#fc2', 0], ['#2b4', 26]].forEach(([col, y]) => circ(c, 10, col, 0, y));
  };
  const locomotive = c => {
    rr(c, -44, -8, 52, 26, 4, BLK); rr(c, 8, -24, 30, 42, 3, BLK); poly(c, [[14, -18], [32, -18], [32, -6], [14, -6]], WHT);
    rr(c, -36, -22, 9, 16, 2, BLK); circ(c, 7, BLK, -30, -34); circ(c, 9, BLK, -18, -40); circ(c, 6, BLK, -4, -42);
    [-34, -16, 2, 28].forEach(x => { circ(c, 9, BLK, x, 24); circ(c, 3.5, WHT, x, 24); });
  };
  const fence = c => {
    line(c, [[-46, -22], [46, -22]], 6, BLK, 'butt'); line(c, [[-46, 10], [46, 10]], 6, BLK, 'butt');
    for (let x = -40; x <= 40; x += 16) rr(c, x - 4, -34, 8, 62, 2, BLK);
  };
  const zebra = c => { for (let i = 0; i < 5; i++) poly(c, [[-44 + i * 18, 34], [-34 + i * 18, 34], [-26 + i * 18, 6], [-36 + i * 18, 6]], BLK); };
  const turnArrow = (c, dir, col) => parrow(c, [[-10 * dir, 36], [-10 * dir, -6], [34 * dir, -6]], 13, col);
  const arrowUp = (c, col) => parrow(c, [[0, 44], [0, -42]], 13, col);

  // ---------- нэмэлт дүрсүүд ----------
  const motorcycle = (c, col = BLK) => {   // бүдүүн дугуй, том хөдөлгүүр, түлшний сав, суудал (унадаг дугуйнаас ялгагдана)
    [-29, 29].forEach(x => { circ(c, 15, col, x, 14); circ(c, 7, WHT, x, 14); circ(c, 3.5, col, x, 14); });   // бүдүүн дугуй
    line(c, [[-29, 14], [-6, 7]], 6, col);                                        // хойд дэгээ
    rr(c, -34, -10, 28, 8, 4, col);                                               // суудал
    rr(c, -8, -17, 30, 14, 6, col);                                               // түлшний сав
    rr(c, -12, -4, 26, 20, 4, col);                                               // хөдөлгүүр
    line(c, [[-6, 15], [-26, 20]], 5, col);                                       // яндан
    line(c, [[29, 14], [19, -12]], 6, col);                                       // урд тулгуур
    line(c, [[15, -17], [24, -22], [34, -20]], 5, col);                           // жолооны бариул
    circ(c, 6, col, 31, -9);                                                      // гэрэл
    poly(c, [[6, -17], [18, -17], [14, -28], [8, -26]], col);                     // салхины шил
  };
  const tractor = (c, col = BLK) => {
    rr(c, -40, -32, 30, 36, 3, col); poly(c, [[-34, -26], [-16, -26], [-16, -4], [-34, -4]], WHT);
    rr(c, -10, -10, 46, 18, 3, col); line(c, [[26, -10], [26, -30]], 5, col);
    circ(c, 22, col, -22, 14); circ(c, 8, WHT, -22, 14); circ(c, 13, col, 30, 22); circ(c, 5, WHT, 30, 22);
  };
  const truckTrailer = (c, col = BLK) => {
    c.save(); c.translate(-22, 0); c.scale(.62, .62); truck(c, col); c.restore();
    rr(c, 8, -16, 38, 28, 2, col); line(c, [[2, 8], [8, 8]], 4, col);
    [22, 40].forEach(x => { circ(c, 7, WHT, x, 14); circ(c, 5.5, col, x, 14); });
  };
  const horn = c => { poly(c, [[-30, -8], [-12, -8], [22, -26], [22, 26], [-12, 8], [-30, 8]], BLK); rr(c, -34, -14, 10, 28, 3, BLK); };
  const crossbuck = (c, col) => { [45, -45].forEach(a => { c.save(); c.rotate(a * Math.PI / 180); rr(c, -52, -9, 104, 18, 2, RED); rr(c, -49, -6, 98, 12, 1, WHT); c.restore(); }); };
  const cow = c => {
    rr(c, -34, -16, 54, 28, 8, BLK); poly(c, [[16, -14], [34, -26], [44, -14], [40, 0], [18, 8]], BLK);
    poly(c, [[30, -26], [26, -36], [32, -30]], BLK); poly(c, [[40, -22], [48, -32], [44, -18]], BLK);
    [-28, -14, 8, 18].forEach(x => rr(c, x, 8, 7, 28, 2, BLK)); line(c, [[-34, -8], [-44, 6]], 4, BLK);
  };
  const deer = c => {
    rr(c, -30, -8, 46, 22, 9, BLK); line(c, [[10, -4], [26, -26]], 11, BLK); circ(c, 9, BLK, 30, -30);
    line(c, [[26, -36], [20, -50], [28, -46], [34, -54]], 4, BLK); line(c, [[32, -38], [40, -50]], 4, BLK);
    line(c, [[-22, 10], [-40, 30]], 7, BLK); line(c, [[-12, 12], [-24, 36]], 7, BLK); line(c, [[10, 12], [24, 30]], 7, BLK); line(c, [[18, 10], [34, 26]], 7, BLK);
  };
  const slopeCar = (c, dir) => {   // dir 1: уруудах (зүүн өндөр), -1: өгсөх
    c.save(); c.scale(dir, 1);
    poly(c, [[-46, -10], [46, 34], [-46, 34]], BLK);
    c.save(); c.translate(-2, -14); c.rotate(Math.atan2(44, 92)); c.scale(.62, .62); carSide(c, BLK); c.restore(); c.restore();
  };

  // ---------- 1. Анхааруулах ----------
  DRAW['1.3.а'] = c => crossbuck(c);
  DRAW['1.3.б'] = c => { c.save(); c.translate(0, -12); c.scale(.82, .82); crossbuck(c); c.restore();
    c.save(); c.translate(0, 34); [0, 12].forEach(o => { line(c, [[-30, 6 - o], [0, -8 - o], [30, 6 - o]], 9, RED, 'butt', 'miter'); }); c.restore(); };
  const beacon = (c, n, mirror) => {
    rr(c, -22, -50, 44, 100, 7, BLK); rr(c, -20, -48, 40, 96, 6, WHT);
    c.save(); c.beginPath(); c.rect(-20, -48, 40, 96); c.clip(); if (mirror) c.scale(-1, 1);
    for (let i = 0; i < n; i++) line(c, [[-34, 34 - i * 30 + 16], [34, -2 - i * 30 - 12 + 28 - 16 - 14]], 10, RED, 'butt');
    c.restore();
  };
  ['а', 'б', 'в'].forEach((l, i) => { DRAW['1.4.' + l] = c => beacon(c, 3 - i, false); });
  ['г', 'д', 'е'].forEach((l, i) => { DRAW['1.4.' + l] = c => beacon(c, 3 - i, true); });
  DRAW['1.10'] = c => warn(c, c2 => slopeCar(c2, 1));
  DRAW['1.11'] = c => warn(c, c2 => slopeCar(c2, -1));
  DRAW['1.12'] = c => warn(c, c2 => { c2.save(); c2.translate(0, -18); c2.scale(.6, .6); carSide(c2); c2.restore();
    [-14, 14].forEach(x => { c2.beginPath(); c2.moveTo(x, 4); c2.bezierCurveTo(x - 14, 14, x + 14, 26, x, 40); c2.strokeStyle = BLK; c2.lineWidth = 6; c2.stroke(); }); });
  DRAW['1.13'] = c => warn(c, c2 => { [[-24, 14], [24, 14]].forEach(([x, y]) => { c2.beginPath(); c2.arc(x, 24, 20, Math.PI, 0); c2.closePath(); c2.fillStyle = BLK; c2.fill(); }); });
  DRAW['1.14'] = c => warn(c, c2 => { c2.save(); c2.translate(-8, 4); c2.scale(.62, .62); carSide(c2); c2.restore();
    [[22, 20], [32, 8], [34, 26], [42, 16], [28, 34]].forEach(([x, y]) => circ(c2, 4, BLK, x, y)); });
  DRAW['1.15.б'] = c => warn(c, c2 => { line(c2, [[-24, 46], [-24, -44]], 11, BLK, 'butt'); line(c2, [[30, 46], [30, 18], [12, -6], [12, -44]], 11, BLK, 'butt', 'miter'); });
  DRAW['1.15.в'] = c => warn(c, c2 => { line(c2, [[24, 46], [24, -44]], 11, BLK, 'butt'); line(c2, [[-30, 46], [-30, 18], [-12, -6], [-12, -44]], 11, BLK, 'butt', 'miter'); });
  DRAW['1.20'] = c => warn(c, c2 => { c2.save(); c2.scale(.9, .9); bicycle(c2); c2.restore(); });
  DRAW['1.21'] = c => warn(c, c2 => {
    poly(c2, [[6, 44], [26, 4], [48, 44]], BLK); circ(c2, 8, BLK, -22, -34);
    line(c2, [[-20, -24], [-6, 6]], 13, BLK); line(c2, [[-6, 6], [-26, 40]], 11, BLK); line(c2, [[-6, 6], [10, 34]], 11, BLK);
    line(c2, [[-16, -16], [8, -4], [24, -22]], 7, BLK); poly(c2, [[18, -30], [34, -22], [26, -10]], BLK);
  });
  DRAW['1.22'] = c => warn(c, c2 => { c2.save(); c2.scale(.9, .9); cow(c2); c2.restore(); });
  DRAW['1.23'] = c => warn(c, c2 => { c2.save(); c2.scale(.88, .88); c2.translate(0, 6); deer(c2); c2.restore(); });
  DRAW['1.24'] = c => warn(c, c2 => { poly(c2, [[-46, 44], [30, 44], [30, -30]], BLK); [[-14, -26, 9], [10, -34, 7], [22, -12, 8], [-26, -8, 7], [4, -6, 9]].forEach(([x, y, r]) => circ(c2, r, BLK, x, y)); });
  DRAW['1.25'] = c => warn(c, c2 => { line(c2, [[-34, 44], [-34, -30]], 7, BLK); poly(c2, [[-30, -34], [44, -24], [44, -6], [-30, -2]], BLK);
    [-6, 14, 32].forEach(x => line(c2, [[x, -34], [x, -2]], 3, WHT, 'butt')); });
  DRAW['1.26'] = c => warn(c, c2 => { c2.save(); c2.rotate(.5); poly(c2, [[-46, 14], [-8, -8], [10, -36], [22, -34], [14, -4], [44, -8], [48, 0], [14, 12], [22, 38], [10, 40], [-6, 18], [-40, 24]], BLK); c2.restore(); });
  DRAW['1.27'] = c => warn(c, c2 => { c2.beginPath(); c2.moveTo(-40, 44); c2.lineTo(-40, 0); c2.bezierCurveTo(-40, -50, 40, -50, 40, 0); c2.lineTo(40, 44); c2.closePath(); c2.fillStyle = BLK; c2.fill();
    c2.beginPath(); c2.moveTo(-22, 44); c2.lineTo(-22, 2); c2.bezierCurveTo(-22, -30, 22, -30, 22, 2); c2.lineTo(22, 44); c2.closePath(); c2.fillStyle = WHT; c2.fill(); });

  DRAW['1.1'] = c => warn(c, fence);
  DRAW['1.2'] = c => warn(c, locomotive);
  DRAW['1.5'] = c => warn(c, c2 => { line(c2, [[-38, -38], [38, 38]], 14, BLK, 'butt'); line(c2, [[38, -38], [-38, 38]], 14, BLK, 'butt'); });
  DRAW['1.6'] = c => warn(c, c2 => roundabout(c2, BLK));
  DRAW['1.7'] = c => warn(c, c2 => { c2.save(); c2.scale(.9, .9); lightBox(c2); c2.restore(); });
  DRAW['1.8.а'] = c => warn(c, c2 => { c2.beginPath(); c2.moveTo(-8, 48); c2.lineTo(-8, 8); c2.quadraticCurveTo(-8, -22, 30, -44); c2.strokeStyle = BLK; c2.lineWidth = 15; c2.lineCap = 'butt'; c2.stroke(); });
  DRAW['1.8.б'] = c => warn(c, c2 => { c2.scale(-1, 1); c2.beginPath(); c2.moveTo(-8, 48); c2.lineTo(-8, 8); c2.quadraticCurveTo(-8, -22, 30, -44); c2.strokeStyle = BLK; c2.lineWidth = 15; c2.lineCap = 'butt'; c2.stroke(); });
  DRAW['1.9.а'] = c => warn(c, c2 => { c2.beginPath(); c2.moveTo(-14, 48); c2.lineTo(-14, 28); c2.bezierCurveTo(-14, 6, 18, 12, 18, -10); c2.lineTo(18, -14); c2.strokeStyle = BLK; c2.lineWidth = 14; c2.lineCap = 'butt'; c2.stroke(); headAt(c2, 18, -42, -Math.PI / 2, 0, 0, BLK); });
  DRAW['1.9.б'] = c => warn(c, c2 => { c2.scale(-1, 1); c2.beginPath(); c2.moveTo(-14, 48); c2.lineTo(-14, 28); c2.bezierCurveTo(-14, 6, 18, 12, 18, -10); c2.lineTo(18, -14); c2.strokeStyle = BLK; c2.lineWidth = 14; c2.lineCap = 'butt'; c2.stroke(); });
  DRAW['1.15.а'] = c => warn(c, c2 => { [-1, 1].forEach(s => { line(c2, [[s * 30, 46], [s * 30, 18], [s * 12, -6], [s * 12, -44]], 11, BLK, 'butt', 'miter'); }); });
  DRAW['1.16'] = c => warn(c, c2 => { parrow(c2, [[-16, -40], [-16, 42]], 12, BLK); parrow(c2, [[16, 42], [16, -40]], 12, BLK); });
  DRAW['1.17'] = c => warn(c, c2 => { c2.beginPath(); c2.moveTo(-46, 28); c2.bezierCurveTo(-30, 28, -26, -4, -8, -4); c2.lineTo(8, -4); c2.bezierCurveTo(26, -4, 30, 28, 46, 28); c2.closePath(); c2.fillStyle = BLK; c2.fill(); });
  DRAW['1.18'] = c => warn(c, c2 => { c2.save(); c2.translate(0, -12); c2.scale(.8, .8); walker(c2); c2.restore(); zebra(c2); });
  DRAW['1.19'] = c => warn(c, c2 => { c2.save(); c2.translate(-18, 4); c2.scale(.7, .7); walker(c2); c2.restore(); c2.save(); c2.translate(20, 14); c2.scale(.55, .55); walker(c2); c2.restore(); });
  DRAW['1.28'] = c => warn(c, c2 => { rr(c2, -8, -42, 16, 52, 6, BLK); circ(c2, 9, BLK, 0, 28); });

  // ---------- 2. Хориглох ----------
  DRAW['2.1'] = c => { circ(c, 50, RED); circ(c, 45, WHT); circ(c, 41, RED); rr(c, -34, -8, 68, 16, 2, WHT); };
  DRAW['2.2'] = c => ring(c);
  DRAW['2.3'] = c => { ring(c); c.save(); c.scale(.62, .62); carSide(c); c.restore(); };
  DRAW['2.4'] = c => { ring(c); c.save(); c.scale(.6, .6); truck(c, BLK, '8т'); c.restore(); };
  DRAW['2.5'] = c => { ring(c); c.save(); c.scale(.6, .6); motorcycle(c); c.restore(); };
  DRAW['2.6'] = c => { ring(c); c.save(); c.scale(.6, .6); tractor(c); c.restore(); };
  DRAW['2.7'] = c => { ring(c); c.save(); c.scale(.68, .68); truckTrailer(c); c.restore(); };
  DRAW['2.12'] = c => { ring(c); txt(c, '5т', 0, -9, 32, BLK); line(c, [[-16, 16], [16, 16]], 5, BLK, 'butt'); [-16, 16].forEach(x => { circ(c, 7.5, BLK, x, 16); circ(c, 3.5, WHT, x, 16); }); };
  DRAW['2.14'] = c => { ring(c); txt(c, '2,7', 0, -4, 32, BLK); txt(c, 'М', 0, 21, 19, BLK); poly(c, [[-31, -10], [-31, 10], [-21, 0]], BLK); poly(c, [[31, -10], [31, 10], [21, 0]], BLK); };
  DRAW['2.15'] = c => { ring(c); c.save(); c.translate(0, -18); c.scale(.36, .36); truck(c, BLK); c.restore(); txt(c, '10', -4, 12, 21, BLK); txt(c, 'М', 14, 17, 11, BLK); poly(c, [[-27, 22], [-18, 17], [-18, 27]], BLK); poly(c, [[27, 22], [18, 17], [18, 27]], BLK); line(c, [[-18, 22], [18, 22]], 1.6, BLK, 'butt'); };
  DRAW['2.16'] = c => { ring(c); txt(c, '70м', 0, -22, 22, BLK); c.save(); c.translate(0, 10); c.scale(.42, .42); carSide(c); c.restore();
    poly(c, [[-24, 22], [-14, 16], [-14, 28]], BLK); poly(c, [[24, 22], [14, 16], [14, 28]], BLK); };
  DRAW['2.17'] = c => { ring(c); rr(c, -33, -20, 66, 40, 5, BLK); c.save(); c.scale(.9, 1); txt(c, 'ГААЛЬ', 0, -7, 17, WHT); txt(c, 'CUSTOMS', 0, 9, 10, WHT); c.restore(); };
  DRAW['2.22'] = c => { ring(c); c.save(); c.translate(-16, -1); c.scale(.62, .62); rr(c, -22, -26, 44, 34, 4, RED); poly(c, [[-14, -20], [14, -20], [12, -4], [-12, -4]], WHT); rr(c, -22, 6, 44, 10, 3, RED); [-14, 14].forEach(x => rr(c, x - 5, 14, 10, 10, 2, RED)); c.restore(); carFront(c, BLK, 16, 0, .62); };
  DRAW['2.23'] = c => { thinRing(c); c.save(); c.translate(-18, -2); c.scale(.8, .8); rr(c, -22, -26, 44, 34, 4, GRY); rr(c, -22, 6, 44, 10, 3, GRY); c.restore(); carFront(c, GRY, 18, 0, .8); endStripes(c); };
  DRAW['2.26'] = c => { ring(c); c.save(); c.scale(.62, .62); horn(c); c.restore(); slash(c); };
  DRAW['2.9'] = c => { ring(c); c.save(); c.scale(.6, .6); bicycle(c); c.restore(); };
  DRAW['2.10'] = c => { ring(c); c.save(); c.scale(.55, .55); walker(c); c.restore(); slash(c); };
  DRAW['2.11'] = c => { ring(c); txt(c, '7', -7, 3, 64, BLK); txt(c, 'т', 22, 20, 30, BLK); };
  DRAW['2.13'] = c => { ring(c); txt(c, '3,5', 0, -2, 33, BLK); txt(c, 'М', 0, 21, 19, BLK); poly(c, [[-8, -34], [8, -34], [0, -26]], BLK); poly(c, [[-8, 34], [8, 34], [0, 26]], BLK); };
  DRAW['2.18.а'] = c => { ring(c); c.save(); c.scale(.62, .62); turnArrow(c, 1, BLK); c.restore(); slash(c); };
  DRAW['2.18.б'] = c => { ring(c); c.save(); c.scale(.62, .62); turnArrow(c, -1, BLK); c.restore(); slash(c); };
  DRAW['2.19'] = c => { ring(c); c.save(); c.scale(.62, .62); parrow(c, [[22, 38], [22, -14], [14, -34], [-6, -34], [-16, -22], [-16, 24]], 12, BLK); c.restore(); slash(c); };
  DRAW['2.20'] = c => { ring(c); carFront(c, RED, -15.5, 0, .7); carFront(c, BLK, 15.5, 0, .7); };
  DRAW['2.21'] = c => { thinRing(c); carFront(c, GRY, -17, 0, .8); carFront(c, GRY, 17, 0, .8); endStripes(c); };
  DRAW['2.24'] = c => { ring(c); txt(c, '50', 0, 3, 52, BLK); };
  DRAW['2.25'] = c => { thinRing(c); txt(c, '50', 0, 3, 52, GRY); endStripes(c); };
  // 2.24 «Хурдны дээд хязгаарлал»-ын өөр утгууд (тоглоомд хэрэглэнэ): '2.24@40'
  ['20', '30', '40', '50', '60', '70', '80', '100'].forEach(n => { DRAW['2.24@' + n] = c => { ring(c); txt(c, n, 0, 3, n.length > 2 ? 40 : 52, BLK); }; });
  DRAW['2.27'] = c => { circ(c, 50, RED); circ(c, 39, BLUE); line(c, [[-27, -27], [27, 27]], 9, RED, 'butt'); line(c, [[27, -27], [-27, 27]], 9, RED, 'butt'); };
  DRAW['2.28'] = c => { circ(c, 50, RED); circ(c, 39, BLUE); clipDisc(c, 39, () => line(c, [[-34, -34], [34, 34]], 9, RED, 'butt')); };
  DRAW['2.29'] = c => { thinRing(c); endStripes(c); };

  // ---------- 3. Дарааллын ----------
  const diamond = (c, inner) => {
    c.save(); c.rotate(Math.PI / 4); rr(c, -35.5, -35.5, 71, 71, 8, BLK); rr(c, -34.3, -34.3, 68.6, 68.6, 7, WHT); rr(c, -24.5, -24.5, 49, 49, 2, inner); c.restore();
  };
  DRAW['3.1'] = c => diamond(c, YEL);
  DRAW['3.2'] = c => { diamond(c, YEL); clipDisc(c, 36, () => { [-14, 0, 14].forEach(o => line(c, [[-40, 40 - o * 1.4], [40, -40 - o * 1.4]], 4.5, BLK, 'butt')); }); };
  DRAW['3.3.а'] = c => { tri(c, true); line(c, [[0, 26], [0, -13]], 10, BLK, 'butt'); line(c, [[-17, 6], [17, 6]], 5, BLK, 'butt'); };
  DRAW['3.3.б'] = c => { tri(c, true); line(c, [[-4, 26], [-4, -7]], 10, BLK, 'butt'); line(c, [[-4, 6], [17, 6]], 5, BLK, 'butt'); };
  DRAW['3.3.в'] = c => { tri(c, true); line(c, [[4, 26], [4, -7]], 10, BLK, 'butt'); line(c, [[4, 6], [-17, 6]], 5, BLK, 'butt'); };
  DRAW['3.4'] = c => tri(c, false);
  DRAW['3.5'] = c => {
    const P = []; for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; P.push([50 * Math.cos(a) / Math.cos(Math.PI / 8), 50 * Math.sin(a) / Math.cos(Math.PI / 8)]); }
    poly(c, P, WHT); poly(c, P.map(p => [p[0] * .93, p[1] * .93]), RED);
    c.save(); c.scale(.82, 1); txt(c, 'ЗОГС', 0, 2, 38, WHT); c.restore();
  };
  DRAW['3.6'] = c => { ring(c, WHT, RED, 10); parrow(c, [[-11, -30], [-11, 26]], 11, BLK); parrow(c, [[14, 30], [14, -6]], 8, RED); };
  DRAW['3.7'] = c => { blueSquare(c); parrow(c, [[-10, -40], [-10, -10]], 8, RED); parrow(c, [[8, 40], [8, -36]], 14, WHT); };

  // ---------- 4. Заах ----------
  const blue = f => c => { blueDisc(c); f(c); };
  DRAW['4.1.а'] = blue(c => arrowUp(c, WHT));
  DRAW['4.1.б'] = blue(c => turnArrow(c, 1, WHT));
  DRAW['4.1.в'] = blue(c => turnArrow(c, -1, WHT));
  DRAW['4.1.г'] = blue(c => { arrowUp(c, WHT); parrow(c, [[0, 4], [30, 4]], 10, WHT); });
  DRAW['4.1.д'] = blue(c => { arrowUp(c, WHT); parrow(c, [[0, 4], [-30, 4]], 10, WHT); });
  DRAW['4.1.е'] = blue(c => { line(c, [[0, 36], [0, 0]], 12, WHT, 'butt'); parrow(c, [[0, 0], [-32, -14]], 11, WHT); parrow(c, [[0, 0], [32, -14]], 11, WHT); });
  DRAW['4.2.а'] = blue(c => parrow(c, [[-30, -30], [30, 30]], 15, WHT));
  DRAW['4.2.б'] = blue(c => parrow(c, [[30, -30], [-30, 30]], 15, WHT));
  DRAW['4.2.в'] = blue(c => { parrow(c, [[0, 6], [-28, 22]], 11, WHT); parrow(c, [[0, 6], [28, 22]], 11, WHT); line(c, [[0, -28], [0, 6]], 11, WHT, 'butt'); });
  DRAW['4.3'] = blue(c => roundabout(c, WHT));
  DRAW['4.4'] = blue(c => { c.save(); c.scale(.62, .62); bicycle(c, WHT); c.restore(); });
  DRAW['4.5'] = blue(c => { c.save(); c.scale(.7, .7); walker(c, WHT); c.restore(); });
  DRAW['4.6'] = blue(c => txt(c, '50', 0, 3, 52, WHT));
  DRAW['4.7'] = blue(c => { txt(c, '50', 0, 3, 52, WHT); clipDisc(c, 46, () => line(c, [[34, -34], [-34, 34]], 7, RED, 'butt')); });

  // ---------- 5. Мэдээлэх ----------
  DRAW['5.7'] = c => { blueSquare(c); poly(c, [[-18, -4], [0, -38], [18, -4]], WHT); rr(c, -7, -6, 14, 44, 1, WHT); };
  DRAW['5.17'] = c => { blueSquare(c); txt(c, 'P', 0, 4, 76, WHT); };
  DRAW['5.19.б'] = c => { blueSquare(c); c.save(); c.scale(.8, .8); c.translate(0, 4); poly(c, [[0, -44], [-44, 34], [44, 34]], WHT); c.restore();
    c.save(); c.translate(0, -2); c.scale(.3, .3); walker(c); c.restore(); c.save(); c.translate(0, 8); c.scale(.46, .46); zebra(c); c.restore(); };
  DRAW['6.1'] = c => { blueSquare(c); rr(c, -9, -28, 18, 56, 2, WHT); rr(c, -28, -9, 56, 18, 2, WHT); };

  // ---------- нийтлэг ----------
  // Албан ёсны вектор зураг (signs-svg\*.svg) ачаалагдсан бол түүгээр, үгүй бол кодоор зурсан хувилбараар зурна.
  const SVG = {};   // код -> Image
  const svgUrl = code => (typeof SIGN_SVGS !== 'undefined' && SIGN_SVGS[code]) ? 'signs-svg/' + SIGN_SVGS[code] : null;
  function loadSvgs() {
    if (typeof Image === 'undefined' || typeof SIGN_SVGS === 'undefined') return Promise.resolve(0);
    return Promise.all(Object.keys(SIGN_SVGS).map(code => new Promise(res => {
      const im = new Image(); im.onload = () => { SVG[code] = im; res(1); }; im.onerror = () => res(0); im.src = svgUrl(code);
    }))).then(r => r.reduce((a, b) => a + b, 0));
  }
  function drawSign(ctx, code, x, y, size) {
    const im = SVG[code];
    if (im && im.naturalWidth) {   // тэмдгийн харьцааг хадгалж size-ийн дотор тааруулна
      const k = size / Math.max(im.naturalWidth, im.naturalHeight), w = im.naturalWidth * k, h = im.naturalHeight * k;
      ctx.drawImage(im, x - w / 2, y - h / 2, w, h); return true;
    }
    const f = DRAW[code]; if (!f) return false; ctx.__sgcode = code;
    ctx.save(); ctx.translate(x, y); ctx.scale(size / 100, size / 100); f(ctx); ctx.restore();
    return true;
  }
  return {
    drawSign, loadSvgs, isOfficial: code => !!SVG[code],
    drawCanvas: (ctx, code, x, y, size) => {   // албан ёсны SVG-г алгасаж, кодоор зурсан хувилбарыг зурна (тест)
      const f = DRAW[code]; if (!f) return false; ctx.__sgcode = code;
      ctx.save(); ctx.translate(x, y); ctx.scale(size / 100, size / 100); f(ctx); ctx.restore(); return true;
    },
    has: code => !!DRAW[code] || !!svgUrl(code), drawn: () => Object.keys(DRAW),
    reg: (code, f) => { DRAW[code] = f; },
    h: { circ, line, rr, poly, txt, headAt, parrow, walker, carSide, carFront, truck, bicycle, motorcycle, tractor, zebra, tri, warn, clipDisc, blueSquare, RED, BLUE, BLK, WHT, YEL, GRY },
  };
})();
