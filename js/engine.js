'use strict';
// Тоглоомын хөдөлгүүр: жолоодлого, мөргөлдөөн, зураг. Түвшнүүд нь levels.js-д, дэлгэц/удирдлага нь ui.js-д.

const W = 900, H = 640;
let ROAD_L = 370, ROAD_R = 530;
const CAR_L = 70, CAR_W = 36, MAXV = 170;
const FINISH = { x: 370, y: 0, w: 160, h: 54, label: '🏁 ДУУСГАХ БҮС' };

const keys = {}, touch = {};
let cv, ctx, scale = 1, visible = false;
let camY = 0;   // камертай түвшин: дэлгэцийг машиныг дагуулан доош гүйлгэсэн хэмжээ
let trans = null;   // «үргэлжилсэн зам»: сегментүүдийн хооронд дэлгэц гүйлгэгдэх шилжилт
const TRANS_T = .9;
let signal = 0, cruise = false, li = 0, mode = 'idle', P, cars = [], shake = 0, flash = 0, parts = [], clock = 0, L = {}, steerV = 0;
let soundOn = true;
let onFail = () => {}, onWin = () => {}, onTick = () => {};

// ---------- туслах ----------
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ext = o => 35 * Math.abs(Math.sin(o.a)) + 18 * Math.abs(Math.cos(o.a));
const circlesOf = o => {   // мөргөлдөх тойргууд; o.len/o.w (ачааны машин) байвал томорно
  const h = (o.len || 70) / 2 - 13, r = (o.w || 36) / 2 + 1;
  return [-h, 0, h].map(d => ({ x: o.x + Math.cos(o.a) * d, y: o.y + Math.sin(o.a) * d, r }));
};
const kmh = () => Math.abs(P.v) * 0.5;   // дэлгэцийн хурд, км/ц
function carsHit(a, b) {
  for (const p of circlesOf(a)) for (const q of circlesOf(b)) if (Math.hypot(p.x - q.x, p.y - q.y) < p.r + q.r - 4) return true;
  return false;
}
function roundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

let ac;
function sound(kind) { if (soundOn) SFX.play(kind); }   // дууг audio.js нийлүүлнэ

// ---------- дүрслэл ----------
function drawBase(crossRoad) {
  ctx.fillStyle = '#3d7a37'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#c9b79a'; ctx.fillRect(356, 0, 188, H);
  if (crossRoad) ctx.fillRect(0, 226, W, 188);
  ctx.fillStyle = '#4a4d54'; ctx.fillRect(ROAD_L, 0, 160, H);
  if (crossRoad) ctx.fillRect(0, 240, W, 160);
  // 1.2 замын захын тасралтгүй шугам (уулзвар дотор тасална)
  ctx.strokeStyle = '#f1f1f1'; ctx.lineWidth = 4; ctx.lineCap = 'butt'; ctx.beginPath();
  if (crossRoad) {
    ctx.moveTo(377, 0); ctx.lineTo(377, 240); ctx.moveTo(377, 400); ctx.lineTo(377, H);
    ctx.moveTo(523, 0); ctx.lineTo(523, 240); ctx.moveTo(523, 400); ctx.lineTo(523, H);
    ctx.moveTo(0, 247); ctx.lineTo(370, 247); ctx.moveTo(530, 247); ctx.lineTo(W, 247);
    ctx.moveTo(0, 393); ctx.lineTo(370, 393); ctx.moveTo(530, 393); ctx.lineTo(W, 393);
  } else { ctx.moveTo(377, 0); ctx.lineTo(377, H); ctx.moveTo(523, 0); ctx.lineTo(523, H); }
  ctx.stroke();
  // 1.5 төв тасархай шугам: зураас нь завсраасаа 3 дахин богино
  ctx.lineWidth = 4; ctx.setLineDash([20, 60]); ctx.beginPath();
  if (crossRoad) {
    ctx.moveTo(0, 320); ctx.lineTo(370, 320); ctx.moveTo(530, 320); ctx.lineTo(W, 320);
    ctx.moveTo(450, 0); ctx.lineTo(450, 240); ctx.moveTo(450, 400); ctx.lineTo(450, H);
  } else { ctx.moveTo(450, 0); ctx.lineTo(450, H); }
  ctx.stroke(); ctx.setLineDash([]);
  [[90, 120], [250, 90], [690, 110], [820, 150], [110, 540], [270, 590], [700, 560], [820, 500]].forEach(([x, y]) => {
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.arc(x + 6, y + 8, 28, 0, 7); ctx.fill();
    ctx.fillStyle = '#2d6a2e'; ctx.beginPath(); ctx.arc(x, y, 28, 0, 7); ctx.fill();
    ctx.fillStyle = '#3f8c3b'; ctx.beginPath(); ctx.arc(x - 6, y - 6, 17, 0, 7); ctx.fill();
  });
}

function zebraV(y1, y2) {    // явган хүний гарц
  ctx.fillStyle = 'rgba(255,255,255,.88)';
  for (let x = 376; x < 526; x += 22) ctx.fillRect(x, y1, 12, y2 - y1);
}

function drawTruck(x, y, a, color) {   // дээрээс харсан ачааны машин (урт 100, өргөн 40)
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; roundRect(-46, -15, 100, 40, 6); ctx.fill();
  ctx.fillStyle = '#d7dbe0'; roundRect(-50, -20, 68, 40, 4); ctx.fill();               // ачааны хайрцаг
  ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = color; roundRect(20, -19, 30, 38, 6); ctx.fill();                  // бүхээг
  ctx.fillStyle = '#243447'; roundRect(36, -15, 10, 30, 3); ctx.fill();
  ctx.fillStyle = '#fff6b0'; ctx.fillRect(48, -17, 3, 7); ctx.fillRect(48, 10, 3, 7);
  ctx.fillStyle = '#ff4040'; ctx.fillRect(-50, -18, 3, 6); ctx.fillRect(-50, 12, 3, 6);
  ctx.restore();
}

function drawBus(x, y, a, color, len) {   // дээрээс харсан автобус / микро (урт len, өргөн 42)
  const h = len / 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; roundRect(-h + 4, -17, len, 42, 8); ctx.fill();
  const g = ctx.createLinearGradient(0, -21, 0, 21); g.addColorStop(0, shade(color, .25)); g.addColorStop(.5, color); g.addColorStop(1, shade(color, -.25));
  ctx.fillStyle = g; roundRect(-h, -21, len, 42, 9); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = shade(color, .35); roundRect(-h + 8, -16, len - 26, 32, 5); ctx.fill();                  // дээвэр
  ctx.fillStyle = '#243447'; ctx.fillRect(h - 12, -17, 6, 34);                                             // салхины шил
  ctx.fillStyle = 'rgba(36,52,71,.8)'; for (let i = 0; i < Math.floor((len - 40) / 18); i++) { ctx.fillRect(-h + 10 + i * 18, -20, 12, 3); ctx.fillRect(-h + 10 + i * 18, 17, 12, 3); }   // хажуугийн цонх
  ctx.fillStyle = '#fff6b0'; ctx.fillRect(h - 3, -19, 3.5, 7); ctx.fillRect(h - 3, 12, 3.5, 7);
  ctx.fillStyle = '#ff4040'; ctx.fillRect(-h, -19, 3, 6); ctx.fillRect(-h, 13, 3, 6);
  ctx.restore();
}
// замын хөдөлгөөнд орох тээврийн хэрэгслийн санамсаргүй төрөл: суудлын, ачааны, автобус, микро
function mkVeh(o, kind) {
  const r = kind || ['car', 'car', 'car', 'truck', 'bus', 'mini'][Math.floor(rnd(0, 6))];
  if (r === 'truck') { o.truck = true; o.len = 100; o.w = 40; o.color = ['#c0392b', '#2b6cb0', '#d68910'][Math.floor(rnd(0, 3))]; }
  else if (r === 'bus') { o.bus = true; o.len = 120; o.w = 42; o.color = ['#1f9d55', '#e6b422', '#2b6cb0'][Math.floor(rnd(0, 3))]; }
  else if (r === 'mini') { o.bus = true; o.len = 88; o.w = 38; o.color = ['#cfd3d8', '#f2a33a', '#7a4bd6'][Math.floor(rnd(0, 3))]; }
  return o;
}

// өнгийг тодруулах / бараан болгох (k: -1..1)
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16), f = c => Math.max(0, Math.min(255, Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
// дээрээс харсан машин. fx: { brake, steer (радиан), night, beams }
function drawCar(x, y, a, color, outline, fx) {
  fx = fx || {};
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  const L2 = CAR_L / 2, W2 = CAR_W / 2;
  ctx.fillStyle = 'rgba(0,0,0,.34)'; roundRect(-L2 + 5, -W2 + 6, CAR_L, CAR_W, 11); ctx.fill();            // сүүдэр
  // дугуй (урд хоёр нь эргэнэ)
  ctx.fillStyle = '#14161a';
  for (const sx of [-1, 1]) { ctx.fillRect(-L2 + 8, sx * (W2 - 1) - 3.4, 14, 6.8); ctx.save(); ctx.translate(L2 - 18, sx * (W2 - 1)); ctx.rotate(fx.steer || 0); ctx.fillRect(-7, -3.4, 14, 6.8); ctx.restore(); }
  // бие
  const g = ctx.createLinearGradient(0, -W2, 0, W2); g.addColorStop(0, shade(color, .28)); g.addColorStop(.5, color); g.addColorStop(1, shade(color, -.28));
  ctx.fillStyle = g; roundRect(-L2, -W2, CAR_L, CAR_W, 12); ctx.fill();
  ctx.strokeStyle = outline || 'rgba(0,0,0,.4)'; ctx.lineWidth = outline ? 3 : 1.6; ctx.stroke();
  // хаалтын шугам, малгай (hood)
  ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(19, -W2 + 3); ctx.lineTo(19, W2 - 3); ctx.moveTo(-26, -W2 + 4); ctx.lineTo(-26, W2 - 4); ctx.stroke();
  // салхины шил, арын шил, дээвэр
  const gl = ctx.createLinearGradient(0, -W2, 0, W2); gl.addColorStop(0, '#1d2f45'); gl.addColorStop(.5, '#34506f'); gl.addColorStop(1, '#1d2f45');
  ctx.fillStyle = gl;
  ctx.beginPath(); ctx.moveTo(18, -W2 + 5); ctx.lineTo(7, -W2 + 3.5); ctx.lineTo(7, W2 - 3.5); ctx.lineTo(18, W2 - 5); ctx.closePath(); ctx.fill();                  // урд шил
  ctx.beginPath(); ctx.moveTo(-24, -W2 + 5); ctx.lineTo(-14, -W2 + 3.5); ctx.lineTo(-14, W2 - 3.5); ctx.lineTo(-24, W2 - 5); ctx.closePath(); ctx.fill();            // арын шил
  ctx.fillStyle = shade(color, .12); roundRect(-14, -W2 + 3, 21, CAR_W - 6, 4); ctx.fill();                                                                         // дээвэр
  ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.moveTo(15, -W2 + 6.5); ctx.lineTo(10, -W2 + 5); ctx.lineTo(10, -W2 + 9); ctx.lineTo(14, -W2 + 10.5); ctx.closePath(); ctx.fill();   // цонхны гялбаа
  ctx.fillStyle = 'rgba(255,255,255,.14)'; roundRect(-12, -W2 + 5, 17, 5, 2); ctx.fill();
  // толь
  ctx.fillStyle = shade(color, -.2); for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(10, sx * (W2 + 1.6), 3.4, 2.2, 0, 0, 7); ctx.fill(); }
  // урд гэрэл
  ctx.fillStyle = fx.night ? '#fffbe0' : '#fff3b0'; roundRect(L2 - 4, -W2 + 2.5, 4.5, 8, 2); ctx.fill(); roundRect(L2 - 4, W2 - 10.5, 4.5, 8, 2); ctx.fill();
  // залхаар дохио (зүүн/баруун): урд, арын булангийн шар гэрэл анивчина
  if (fx.signal && Math.floor(performance.now() / 350) % 2) {
    const sx = fx.signal > 0 ? 1 : -1;
    ctx.fillStyle = '#ffb400';
    for (const px of [L2 - 5, -L2 + 1]) { roundRect(px, sx * (W2 - 5) - 3.5, 5, 7, 2); ctx.fill(); }
    const sg = ctx.createRadialGradient(L2 - 2, sx * (W2 - 2), 1, L2 - 2, sx * (W2 - 2), 16); sg.addColorStop(0, 'rgba(255,180,0,.6)'); sg.addColorStop(1, 'rgba(255,180,0,0)'); ctx.fillStyle = sg; ctx.fillRect(L2 - 18, sx * (W2 - 2) - 16, 32, 32);
    const sg2 = ctx.createRadialGradient(-L2 + 3, sx * (W2 - 2), 1, -L2 + 3, sx * (W2 - 2), 16); sg2.addColorStop(0, 'rgba(255,180,0,.6)'); sg2.addColorStop(1, 'rgba(255,180,0,0)'); ctx.fillStyle = sg2; ctx.fillRect(-L2 - 13, sx * (W2 - 2) - 16, 32, 32);
  }
  // арын гэрэл (тоормослоход тод)
  ctx.fillStyle = fx.brake ? '#ff2a20' : '#a02020'; roundRect(-L2 - .5, -W2 + 2.5, 4, 7, 2); ctx.fill(); roundRect(-L2 - .5, W2 - 9.5, 4, 7, 2); ctx.fill();
  if (fx.brake) { const bg = ctx.createRadialGradient(-L2, 0, 2, -L2, 0, 22); bg.addColorStop(0, 'rgba(255,40,30,.5)'); bg.addColorStop(1, 'rgba(255,40,30,0)'); ctx.fillStyle = bg; ctx.fillRect(-L2 - 22, -22, 24, 44); }
  ctx.restore();
}

// ---------- тоглоомын эффект: үнс, мөр, тоос ----------
let skids = [], skidAcc = 0;
function toggleSignal(d) { signal = signal === d ? 0 : d; sound('tick'); }
function fxStep(dt) {
  parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g === undefined ? 300 : p.g) * dt; if (p.grow) p.r += p.grow * dt; p.life -= dt; });
  parts = parts.filter(p => p.life > 0);
  skids.forEach(s => { s.life -= dt; }); skids = skids.filter(s => s.life > 0);
}
function fxDrive(dt, braking, road, steerAmt) {   // тоглогчийн машины мөр, утаа, тоос
  const sp = kmh();
  const hard = (braking && sp > 26) || (Math.abs(steerAmt) > .75 && sp > 50);
  const ca = Math.cos(P.a), sa = Math.sin(P.a);
  if (hard && road) {
    skidAcc += dt; if (skidAcc > .03) { skidAcc = 0;
      for (const s of [-1, 1]) { const rx = P.x - ca * 22 - sa * s * (CAR_W / 2 - 3), ry = P.y - sa * 22 + ca * s * (CAR_W / 2 - 3); skids.push({ x: rx, y: ry, a: P.a, life: 6, max: 6 }); }
      if (skids.length > 420) skids.splice(0, skids.length - 420);
      parts.push({ x: P.x - ca * 24, y: P.y - sa * 24, vx: rnd(-18, 18), vy: rnd(-18, 18), life: .8, max: .8, r: 4, grow: 14, c: '#e8e8e8', g: 0, al: .45 }); }
  } else if (!road && sp > 14) {
    skidAcc += dt; if (skidAcc > .05) { skidAcc = 0; parts.push({ x: P.x - ca * 26 + rnd(-6, 6), y: P.y - sa * 26 + rnd(-6, 6), vx: rnd(-14, 14), vy: rnd(-14, 14), life: .7, max: .7, r: 3, grow: 10, c: '#a78a62', g: 0, al: .5 }); }
  }
}
function fxDrawSkids() {
  ctx.fillStyle = '#101012';
  for (const s of skids) { ctx.globalAlpha = Math.min(.5, s.life / s.max * .5); ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.a); ctx.fillRect(-5, -1.6, 10, 3.2); ctx.restore(); }
  ctx.globalAlpha = 1;
}
function fxDrawParts() {
  for (const p of parts) { ctx.globalAlpha = p.max ? Math.max(0, p.life / p.max) * (p.al === undefined ? .5 : p.al) : Math.max(0, p.life); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
}
function confetti(x, y, n = 70) {
  const cols = ['#ffd23f', '#ff5a4d', '#4cd964', '#4aa3ff', '#ff8ad8', '#ffffff'];
  for (let i = 0; i < n; i++) { const a = rnd(0, 6.283), v = rnd(60, 280); parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 140, life: rnd(1.4, 2.4), max: 2.4, r: rnd(2.5, 4.5), c: cols[i % cols.length], g: 220, al: 1 }); }
}

// 1.11 «Зогс-шугам»: хос шугам, y нь дээд шугамын байрлал
function stopLine(x1, x2, y) {
  ctx.fillStyle = '#f5f5f5'; ctx.fillRect(x1, y - 2, x2 - x1, 5); ctx.fillRect(x1, y + 10, x2 - x1, 5);
}
// 1.12 «Зам тавь» шугам: жолоочид чиглэсэн гурвалжнууд
function yieldLine(x1, x2, y) {
  ctx.fillStyle = '#f5f5f5';
  for (let x = x1 + 2; x + 16 <= x2; x += 20) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 16, y); ctx.lineTo(x + 8, y + 17); ctx.closePath(); ctx.fill(); }
}
// замын тэмдэг тулгуурын хамт (SG = signs-draw.js)
function postSign(code, x, y, size = 46) {
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x + 5, y + size / 2 + 30, 8, 3, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#7d8590'; ctx.fillRect(x - 2, y + size / 2 - 3, 4, 33);
  SG.drawSign(ctx, code, x, y, size);
}

// ---------- хөндлөн замын машин ----------
function spawnCross(lane) {   // 'e' зүүнээс баруун тийш (өмнөд эгнээ), 'w' эсрэг
  const cols = ['#e6b422', '#7a4bd6', '#2aa198', '#d8402f', '#cfd3d8'];
  const sp = L.speed || 230;
  cars.push(mkVeh(lane === 'e'
    ? { x: -70, y: 360, a: 0, vx: sp, vy: 0, color: cols[Math.floor(rnd(0, 5))] }
    : { x: W + 70, y: 280, a: Math.PI, vx: -sp, vy: 0, color: cols[Math.floor(rnd(0, 5))] }));
}
function moveCars(dt) {
  cars.forEach(c => { c.x += c.vx * dt; c.y += c.vy * dt; });
  cars = cars.filter(c => c.x > -150 && c.x < W + 150 && c.y > -140 && c.y < H + (c.siren ? 700 : 140));   // дуут дохиотой машин дэлгэцээс хол эхэлнэ
}

// ---------- түвшний урсгал ----------
function loadLevel(i) {
  li = i; cruise = false; signal = 0; trans = null; skids = []; L = {}; parts = []; shake = 0; flash = 0; clock = 0; steerV = 0; wrongT = 0;
  P = { x: LEVELS[li].startX || 490, y: 590, a: -Math.PI / 2, v: 0 };
  [ROAD_L, ROAD_R] = LEVELS[li].road || [370, 530];
  LEVELS[li].init();
  mode = 'ready';
}

// одоогийн дэлгэцийг хадгалаад next()-ээр дараагийн сегментийг ачаалж, дэлгэцийг доош гүйлгэнэ (камер машиныг дагах мэт)
function startTransition(next) {
  const img = document.createElement('canvas'); img.width = cv.width; img.height = cv.height; img.getContext('2d').drawImage(cv, 0, 0);
  const from = { x: P.x, y: P.y, a: P.a };
  next();
  trans = { t: 0, img, from };
}
function fail(text) {
  if (mode !== 'play') return;
  mode = 'fail'; shake = 14; flash = 1; sound('crash');
  try { navigator.vibrate && navigator.vibrate([60, 40, 90]); } catch (e) {}
  for (let i = 0; i < 40; i++) { const a = rnd(0, 6.283), v = rnd(80, 300);
    parts.push({ x: P.x, y: P.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: rnd(.5, 1.1), c: ['#ffd23f', '#ff8a3d', '#fff', '#ff5a4d'][i % 4], r: rnd(2, 5) }); }
  if (L.bloodHit) for (let i = 0; i < 30; i++) { const a = rnd(0, 6.283), v = rnd(40, 200);
    parts.push({ x: P.x + Math.cos(P.a) * 40, y: P.y + Math.sin(P.a) * 40, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: rnd(.4, .9), c: '#b01a1a', r: rnd(2, 4) }); }
  onFail(text);
}
function win() {
  mode = 'win'; sound('win');
  onWin();
}

function driveUpdate(dt) {
  const up = keys.ArrowUp || keys.w || touch.up, down = keys.ArrowDown || keys.s || touch.down;
  const left = keys.ArrowLeft || keys.a || touch.left, right = keys.ArrowRight || keys.d || touch.right;
  if (down || keys[' ']) cruise = false;
  const cruising = cruise && LEVELS[li].limit && !up;
  if (cruising) { const tv = (LEVELS[li].limit - 3) / 0.5; P.v += Math.sign(tv - P.v) * Math.min(Math.abs(tv - P.v), (tv > P.v ? 55 : 160) * dt); }
  else if (keys[' ']) P.v -= Math.sign(P.v) * Math.min(Math.abs(P.v), 700 * dt);
  else if (up) P.v += (P.v < 0 ? 520 : 55) * dt;
  else if (down) P.v -= (P.v > 5 ? 520 : 200) * dt;
  else P.v -= Math.sign(P.v) * Math.min(Math.abs(P.v), (LEVELS[li].coast || 340) * dt);
  P.v = clamp(P.v, -90, MAXV);
  const bands = LEVELS[li].crossBands, inBand = bands && bands.some(b => P.y > b[0] && P.y < b[1]);
  const onRoad = (P.x > ROAD_L && P.x < ROAD_R) || (bands ? inBand : (!LEVELS[li].noCross && P.y > 240 && P.y < 400));
  if (!onRoad && Math.abs(P.v) > 70) P.v -= Math.sign(P.v) * 400 * dt;
  const target = touch.steer ? touch.steer : (right ? 1 : 0) - (left ? 1 : 0);   // touch.steer: утасны thumbstick (-1..1)
  steerV += (target - steerV) * Math.min(1, 24 * dt);   // удирдлага зөөлөн эргэнэ
  P.a += steerV * 2.8 * clamp(P.v / 60, -1, 1) * dt;
  P.x = clamp(P.x + Math.cos(P.a) * P.v * dt, 25, W - 25);
  const wy = LEVELS[li].worldY || [25, H - 25];   // worldY: камертай (урт) түвшний босоо хязгаар
  P.y = clamp(P.y + Math.sin(P.a) * P.v * dt, wy[0], wy[1]);
  const braking = (down && P.v > 5) || keys[' '] ? 1 : 0; P.br = !!(down || keys[' ']);   // арын улаан гэрэл: тоормосны товч дарагдсан үед (зогсоод байхад ч)
  if (soundOn) SFX.drive(kmh(), up ? 1 : 0, braking, steerV, onRoad);
  fxDrive(dt, braking, onRoad, steerV);
}

// Баруун гар талын хөдөлгөөн: төв шугамаас зүүн тийш (эсрэг урсгалын эгнээнд) орвол алдана (дүрмийн 11.3)
let wrongT = 0;
function laneCheck(dt) {
  const lv = LEVELS[li];
  if (lv.laneOk) { wrongT = 0; return; }                    // гүйцэж түрүүлэх түвшинд эсрэг эгнээ ашиглана
  const bands = lv.crossBands, hasCross = !bands && !lv.noCross;
  const inBox = bands ? (P.x > ROAD_L && P.x < ROAD_R && bands.some(b => P.y > b[0] && P.y < b[1])) : (hasCross && P.x > ROAD_L && P.x < ROAD_R && P.y > 240 && P.y < 400);
  let wrong = false;
  if (P.v > 30 && !inBox) {
    const c = Math.cos(P.a), s = Math.sin(P.a);
    if (P.x > ROAD_L && P.x < ROAD_R && Math.abs(s) > .5) wrong = P.x < 446;
    else if (hasCross && P.y > 240 && P.y < 400 && Math.abs(c) > .5) wrong = c > 0 ? P.y < 316 : P.y > 324;
  }
  wrongT = wrong ? wrongT + dt : Math.max(0, wrongT - dt * 2);
  if (wrongT > 0.6) fail('Эсрэг урсгалын эгнээнд орлоо! Хоёр эгнээтэй замд эсрэг урсгал сөрөхийг хориглоно (дүрмийн 11.3). Баруун гар талын эгнээгээр яв.');
}

function step(dt) {
  fxStep(dt);
  if (shake > 0) shake = Math.max(0, shake - dt * 30);
  if (flash > 0) flash = Math.max(0, flash - dt * 3);
  if (mode !== 'play') SFX.driveOff();
  if (mode === 'play') {
    if (trans) { trans.t += dt; if (trans.t >= TRANS_T) trans = null; }
    else { clock += dt; driveUpdate(dt); LEVELS[li].update(dt); if (mode === 'play') laneCheck(dt); }
    const fin = LEVELS[li].finish || FINISH;
    if (mode === 'play' && P.x > fin.x && P.x < fin.x + fin.w && P.y > fin.y && P.y < fin.y + fin.h && (!LEVELS[li].gate || LEVELS[li].gate())) win();
  }
}

function render() {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.save();
  if (shake > 0) ctx.translate(rnd(-.5, .5) * shake, rnd(-.5, .5) * shake);
  const ts = trans ? Math.min(1, trans.t / TRANS_T) : 1, te = ts * ts * (3 - 2 * ts);
  if (trans) { ctx.save(); ctx.translate(0, (te - 1) * H); }
  camY = LEVELS[li].camera ? clamp(440 - P.y, 0, LEVELS[li].camMax || 640) : 0;
  if (camY) ctx.translate(0, camY);
  LEVELS[li].draw();
  const fin = LEVELS[li].finish || FINISH;
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(fin.x, fin.y, fin.w, fin.h);   // дуусгах бүс
  ctx.fillStyle = '#fff'; ctx.font = 'bold 16px system-ui'; ctx.textAlign = 'center'; ctx.fillText(fin.label, fin.x + fin.w / 2, fin.y + fin.h / 2 + 6);
  fxDrawSkids();
  cars.forEach(c => {
    if (c.truck) drawTruck(c.x, c.y, c.a, c.color); else if (c.bus) drawBus(c.x, c.y, c.a, c.color, c.len); else drawCar(c.x, c.y, c.a, c.color);
    if (c.siren) {   // гялалзах гэрэл
      const blink = Math.floor(performance.now() / 160) % 2;
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.a);
      ctx.fillStyle = blink ? '#ff2a2a' : '#2a62ff'; ctx.fillRect(-4, -14, 9, 12);
      ctx.fillStyle = blink ? '#2a62ff' : '#ff2a2a'; ctx.fillRect(-4, 2, 9, 12);
      ctx.restore();
      const g = ctx.createRadialGradient(c.x, c.y, 5, c.x, c.y, 70);
      g.addColorStop(0, blink ? 'rgba(255,40,40,.35)' : 'rgba(40,90,255,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(c.x - 70, c.y - 70, 140, 140);
    }
  });
  if (trans) { ctx.restore(); ctx.drawImage(trans.img, 0, te * H, W, H); }
  const px = trans ? trans.from.x + (P.x - trans.from.x) * te : P.x, py = trans ? trans.from.y + (P.y - trans.from.y) * te : P.y, pa = trans ? trans.from.a + (P.a - trans.from.a) * te : P.a;
  drawCar(px, py, pa, '#2f6fe0', '#ffd23f', { brake: !!P.br, steer: steerV * .45, signal });
  if (mode === 'play') cars.forEach(c => { if (c.siren && (c.y > H - 20 || c.y < 20 || c.x < 20 || c.x > W - 20)) sirenGlow(c); });
  fxDrawParts();
  if (mode === 'fail' && !L.bloodHit) { ctx.font = '60px system-ui'; ctx.textAlign = 'center'; ctx.fillText('💥', P.x, P.y + 20); }
  if (mode === 'play' && wrongT > 0.05) { ctx.fillStyle = 'rgba(200,30,30,.85)'; roundRect(W / 2 - 170, 70, 340, 40, 10); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'; ctx.fillText('⚠ Эсрэг урсгалын эгнээ! Баруун тийш ор', W / 2, 96); }
  if (camY) ctx.translate(0, -camY);
  if (flash > 0) { ctx.fillStyle = `rgba(255,80,60,${flash * .35})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}

let lastT = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
  requestAnimationFrame(frame);
  if (!visible) return;
  step(dt); render(); onTick();
}

// Дуут дохиотой машин дэлгэцийн гаднаас ойртоход тэр талын ирмэг дохионы өнгөөр (улаан/цэнхэр) гялалзаж анхааруулна
function sirenGlow(c) {
  const blink = Math.floor(performance.now() / 160) % 2, col = blink ? '255,40,40' : '40,90,255';
  const d = Math.hypot(c.x - P.x, c.y - P.y), a = clamp(1.05 - d / 1100, .25, .85), s = 190;
  const edge = (x0, y0, x1, y1, rx, ry, rw, rh) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.fillRect(rx, ry, rw, rh);
  };
  if (c.y > H - 20) edge(0, H, 0, H - s, 0, H - s, W, s);
  if (c.y < 20) edge(0, 0, 0, s, 0, 0, W, s);
  if (c.x < 20) edge(0, 0, s, 0, 0, 0, s, H);
  if (c.x > W - 20) edge(W, 0, W - s, 0, W - s, 0, s, H);
}

function engineInit(canvas) {
  cv = canvas; ctx = cv.getContext('2d');
  requestAnimationFrame(frame);
}
function engineResize(cssW, cssH) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
  scale = cv.width / W;
}
