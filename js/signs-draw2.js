'use strict';
// 5–7-р бүлгийн тэмдгүүд: мэдээлэх, үйлчилгээний, нэмэлт. Албан ёсны хавсралтын зураг (source-rules\pages\p52..p55.png)-ыг
// харж кодоор зурсан (ойролцоо дүрс). signs-draw.js-ийн дараа ачаална.

(() => {
  const { circ, line, rr, poly, txt, parrow, walker, carSide, carFront, truck, bicycle, motorcycle, tractor, RED, BLUE, BLK, WHT, GRY } = SG.h;
  const reg = SG.reg, GREEN = '#0b7d3e', YELLOW = '#ffd21a';

  // ---------- туслах ----------
  const fit = (c, s, x, y, maxW, size, col, weight = 'bold') => {
    c.font = `${weight} ${size}px Arial, "Liberation Sans", sans-serif`;
    const w = c.measureText(s).width || maxW; txt(c, s, x, y, size * Math.min(1, maxW / w), col, weight);
  };
  const panel = (c, w, h, fill = BLUE, border = WHT, bw = 3, r = 7) => { rr(c, -w / 2, -h / 2, w, h, r, border); rr(c, -w / 2 + bw, -h / 2 + bw, w - 2 * bw, h - 2 * bw, Math.max(1, r - 2), fill); };
  const plate = (c, w, h) => { rr(c, -w / 2, -h / 2, w, h, 5, BLK); rr(c, -w / 2 + 2.5, -h / 2 + 2.5, w - 5, h - 5, 3, WHT); };
  const yplate = (c, w, h) => { rr(c, -w / 2, -h / 2, w, h, 5, BLK); rr(c, -w / 2 + 2.5, -h / 2 + 2.5, w - 5, h - 5, 3, YELLOW); };
  const slash = (c, x1, y1, x2, y2) => line(c, [[x1, y1], [x2, y2]], 6, RED, 'butt');
  const arr = (c, pts, w = 6, col = WHT) => parrow(c, pts, w, col);
  const mirror = (c, f) => { c.save(); c.scale(-1, 1); f(c); c.restore(); };
  const sub = (c, code, x, y, s) => SG.drawSign(c, code, x, y, s);
  const at = (c, x, y, k, f) => { c.save(); c.translate(x, y); c.scale(k, k); f(c); c.restore(); };
  const dash = (c, x, y1, y2) => { c.save(); c.setLineDash([5, 5]); line(c, [[x, y1], [x, y2]], 2, WHT, 'butt'); c.restore(); };
  const bus = (c, body, win) => {
    rr(c, -26, -18, 52, 34, 6, body); rr(c, -21, -13, 42, 14, 3, win); line(c, [[-21, 4], [21, 4]], 2, win, 'butt');
    circ(c, 4, win, -16, 12); circ(c, 4, win, 16, 12); rr(c, -26, 15, 52, 3, 1, body);
  };
  const asterisk = (c, col, r = 14, w = 5) => { for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; line(c, [[-Math.sin(a) * r, -Math.cos(a) * r], [Math.sin(a) * r, Math.cos(a) * r]], w, col, 'butt'); } };
  const hammers = (c, col = BLK, k = 1) => at(c, 0, 0, k, c2 => { line(c2, [[-16, -16], [16, 16]], 5, col); line(c2, [[16, -16], [-16, 16]], 5, col); rr(c2, -22, -22, 14, 8, 2, col); rr(c2, 8, -22, 14, 8, 2, col); });

  // ---------- 5. Мэдээлэх ----------
  reg('5.1', c => { panel(c, 66, 96, GREEN); poly(c, [[-13, -42], [13, -42], [27, 42], [-27, 42]], WHT); [[-40, -26], [-8, 8], [22, 42]].forEach(([a, b]) => line(c, [[0, a], [0, b]], 4, GREEN, 'butt')); });
  reg('5.2', c => { sub(c, '5.1', 0, 0, 100); slash(c, 34, -42, -34, 42); });
  const town = (c, name, blue) => { if (blue) panel(c, 96, 34, BLUE, WHT, 3, 5); else plate(c, 96, 34); fit(c, name, 0, 1, 80, 17, blue ? WHT : BLK); };
  reg('5.3', c => town(c, 'УЛИАСТАЙ', false));
  reg('5.4', c => { town(c, 'УЛИАСТАЙ', false); slash(c, -46, 16, 46, -16); });
  reg('5.5', c => town(c, 'БАЯН', true));
  reg('5.6', c => { town(c, 'БАЯН', true); slash(c, -46, 16, 46, -16); });
  reg('5.8', c => { sub(c, '5.7', 0, 0, 100); slash(c, 38, -44, -38, 44); });
  reg('5.9.а', c => { panel(c, 96, 38, BLUE, WHT, 3, 5); arr(c, [[-38, 0], [36, 0]], 7); });
  reg('5.9.б', c => { panel(c, 96, 38, BLUE, WHT, 3, 5); arr(c, [[38, 0], [-36, 0]], 7); });
  reg('5.10.а', c => { panel(c, 96, 62, BLUE, WHT, 3, 5); dash(c, -15, -22, 26); dash(c, 15, -22, 26);
    arr(c, [[-31, 26], [-31, 0], [-44, 0]], 6); arr(c, [[0, 26], [0, -24]], 6); arr(c, [[31, 26], [31, 0], [44, 0]], 6); });
  reg('5.10.б', c => { panel(c, 62, 62); arr(c, [[-14, 26], [-14, -24]], 7); dash(c, 4, -24, 26); dash(c, 22, -24, 26); });
  reg('5.11.а', c => { panel(c, 96, 52, BLUE, WHT, 3, 5); arr(c, [[-32, -20], [-32, 20]], 6); dash(c, -14, -20, 22); arr(c, [[2, 22], [2, -20]], 6); dash(c, 18, -20, 22); arr(c, [[34, 22], [34, -20]], 6); });
  reg('5.11.б', c => { panel(c, 96, 52, BLUE, WHT, 3, 5); arr(c, [[-32, -20], [-32, 20]], 6); line(c, [[-16, -22], [-16, 22]], 2, WHT, 'butt'); arr(c, [[0, -20], [0, 20]], 6); line(c, [[16, -22], [16, 22]], 2, WHT, 'butt'); arr(c, [[34, 22], [34, -20]], 6); });
  const split = c => { panel(c, 62, 62); arr(c, [[-10, 26], [-10, -24]], 7); arr(c, [[-10, 12], [8, -6], [18, -24]], 6); dash(c, 6, 4, 26); };
  reg('5.12.а', split);
  reg('5.12.б', c => mirror(c, split));
  const merge = c => { panel(c, 62, 62); arr(c, [[12, 26], [12, -24]], 7); arr(c, [[-16, 26], [-16, 8], [8, -12]], 6); };
  reg('5.13.а', merge);
  reg('5.13.б', c => mirror(c, merge));
  reg('5.14', c => { panel(c, 62, 92); dash(c, -18, -40, 8); dash(c, 18, -40, 8); arr(c, [[0, 0], [0, -40]], 7); at(c, 0, 26, 1, c2 => bus(c2, WHT, BLUE)); });
  reg('5.16', c => { panel(c, 70, 70); arr(c, [[16, 28], [16, -6], [10, -20], [-4, -22], [-15, -10], [-15, 24]], 8); });
  reg('5.18', c => { panel(c, 76, 76); poly(c, [[0, -30], [-32, 26], [32, 26]], WHT); c.beginPath(); c.moveTo(-24, 26); c.bezierCurveTo(-14, 10, 14, 10, 24, 26); c.closePath(); c.fillStyle = BLK; c.fill(); });
  reg('5.19.а', c => mirror(c, c2 => sub(c2, '5.19.б', 0, 0, 100)));
  const stairs = (c, up, flip) => {
    panel(c, 76, 76); c.save(); if (flip) c.scale(-1, 1);
    line(c, up ? [[-32, 30], [-14, 30], [-14, 14], [4, 14], [4, -2], [22, -2], [22, -18], [34, -18]] : [[-34, -18], [-22, -18], [-22, -2], [-4, -2], [-4, 14], [14, 14], [14, 30], [32, 30]], 5, WHT, 'butt', 'miter');
    at(c, up ? 8 : -10, up ? -20 : -24, .34, c2 => walker(c2, WHT)); c.restore();
  };
  reg('5.20.а', c => stairs(c, false, false)); reg('5.20.б', c => stairs(c, true, false));
  reg('5.20.в', c => stairs(c, true, true)); reg('5.20.г', c => stairs(c, false, true));
  reg('5.21', c => { panel(c, 62, 92); at(c, 0, 0, 1.05, c2 => bus(c2, WHT, BLUE)); });
  reg('5.22', c => { panel(c, 62, 92); for (let i = 0; i < 6; i++) rr(c, -24 + i * 8, -40 + (i % 2) * 7, 8, 7, 0, WHT); for (let i = 0; i < 6; i++) rr(c, -24 + i * 8, -33 + (i % 2) * 7, 8, 7, 0, BLK);
    carFront(c, WHT, 0, 6, 1.3); });
  const school23 = c => { panel(c, 62, 92); carFront(c, WHT, -8, -26, .72); at(c, -14, 18, .5, c2 => walker(c2, WHT)); at(c, 12, 28, .34, c2 => walker(c2, WHT)); circ(c, 4, WHT, 22, 36);
    rr(c, 12, -44, 14, 34, 1, WHT); [[15, -40], [21, -40], [15, -30], [21, -30], [15, -20], [21, -20]].forEach(([x, y]) => rr(c, x, y, 4, 6, 0, BLUE)); };
  reg('5.23', school23); reg('5.24', c => { school23(c); slash(c, 28, -44, -28, 44); });
  reg('5.25', c => { plate(c, 62, 92); fit(c, 'СУРГУУЛЬ', 0, -38, 52, 8, BLK); fit(c, 'ОРЧМЫН БҮС', 0, -29, 52, 8, BLK); sub(c, '1.19', 0, -2, 46); fit(c, '7.30-19.00', 0, 36, 54, 10, BLK); });
  reg('5.26', c => { sub(c, '5.25', 0, 0, 100); c.save(); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(-29, -44, 58, 88); c.beginPath(); c.rect(-30, -44, 60, 88); c.clip(); [-30, -8, 14].forEach(o => line(c, [[-40, 44 + o], [40, -44 + o]], 4, BLK, 'butt')); c.restore(); });
  reg('5.27', c => { panel(c, 70, 96); [-30, 0, 30].forEach((y, i) => { rr(c, -30, y - 13, 60, 26, 3, WHT); circ(c, 11, RED, -17, y); circ(c, 8.5, WHT, -17, y); fit(c, ['60', '80', '100'][i], -17, y, 14, 9, BLK);
    if (i < 2) { rr(c, 2, y - 3, 20, 12, 1, BLK); rr(c, 8, y - 10, 8, 8, 1, BLK); } else { rr(c, 4, y - 9, 16, 18, 2, GREEN); line(c, [[12, y - 6], [12, y + 6]], 2, WHT, 'butt'); } });
    slash(c, 4, 22, 24, 4); });
  reg('5.28', c => { panel(c, 76, 76); txt(c, '50', 0, 3, 46, WHT); });
  reg('5.29', c => { panel(c, 76, 76); c.beginPath(); c.moveTo(-8, 34); c.bezierCurveTo(-8, 0, 4, -10, 20, -26); c.strokeStyle = WHT; c.lineWidth = 12; c.lineCap = 'butt'; c.stroke(); rr(c, 14, -36, 14, 12, 1, RED); rr(c, 14, -36, 7, 6, 0, WHT); rr(c, 21, -30, 7, 6, 0, WHT); });
  reg('5.30.а', c => { panel(c, 76, 76); rr(c, -7, -14, 14, 50, 1, WHT); rr(c, -24, -28, 48, 10, 1, RED); });
  reg('5.30.б', c => { panel(c, 76, 76); rr(c, -9, -34, 14, 68, 1, WHT); rr(c, 5, -6, 16, 12, 1, WHT); rr(c, 21, -14, 8, 28, 1, RED); });
  reg('5.30.в', c => mirror(c, c2 => { panel(c2, 76, 76); rr(c2, -9, -34, 14, 68, 1, WHT); rr(c2, 5, -6, 16, 12, 1, WHT); rr(c2, 21, -14, 8, 28, 1, RED); }));
  const trk = (c, k) => { panel(c, 96, 40, BLUE, WHT, 3, 5);
    if (k === 'a') { arr(c, [[-32, 14], [-32, -14]], 6); at(c, 12, 0, .36, c2 => truck(c2, WHT)); }
    if (k === 'b') { at(c, -14, 0, .36, c2 => truck(c2, WHT)); arr(c, [[16, 0], [42, 0]], 6); }
    if (k === 'c') { arr(c, [[-16, 0], [-42, 0]], 6); at(c, 16, 0, .36, c2 => truck(c2, WHT)); } };
  reg('5.31.а', c => trk(c, 'a')); reg('5.31.б', c => trk(c, 'b')); reg('5.31.в', c => trk(c, 'c'));
  reg('5.32', c => { plate(c, 96, 44); fit(c, 'ЗОГС', 0, 2, 84, 32, BLK); });
  reg('5.33.а', c => { panel(c, 96, 66, GREEN, WHT, 3, 5); arr(c, [[-38, 26], [-38, -24]], 5);
    rr(c, -24, -26, 66, 14, 2, BLUE); fit(c, '4 ЭРДЭНЭТ', 9, -19, 58, 8, WHT);
    rr(c, -14, -7, 56, 14, 2, BLUE); fit(c, '11 ХӨТӨЛ', 14, 0, 50, 8, WHT);
    rr(c, -14, 12, 56, 14, 2, BLUE); fit(c, 'НОМГОН', 14, 19, 50, 8, WHT); });
  reg('5.33.б', c => { panel(c, 96, 66, BLUE, WHT, 3, 5); arr(c, [[-38, 12], [-38, -24]], 5); fit(c, 'А03 ЛҮН', 8, -22, 66, 9, WHT); fit(c, 'ЭРДЭНЭСАНТ', 8, -10, 66, 9, WHT); fit(c, 'РАШААНТ', 8, 2, 66, 9, WHT);
    line(c, [[-44, 16], [44, 16]], 1.5, WHT, 'butt'); fit(c, 'ЭРДЭНЭ А05', -10, 26, 64, 9, WHT); arr(c, [[28, 30], [42, 20]], 4); });
  reg('5.34.а', c => { plate(c, 96, 66); fit(c, 'БУЯНТ-УХАА', 4, -22, 66, 11, BLK); arr(c, [[-38, -16], [-38, -28]], 3, BLK);
    rr(c, -44, -9, 88, 16, 2, BLUE); fit(c, 'ЗУУНМОД   45', 4, -1, 66, 10, WHT); arr(c, [[-32, -1], [-42, -1]], 3);
    fit(c, 'СОНСГОЛОН  3', 0, 22, 70, 10, BLK); });
  reg('5.34.б', c => { poly(c, [[-46, -17], [26, -17], [47, 0], [26, 17], [-46, 17]], WHT); poly(c, [[-43, -14], [25, -14], [42, 0], [25, 14], [-43, 14]], BLUE); fit(c, 'БОРНУУР 5', -4, 1, 66, 13, WHT); });
  reg('5.35', c => { at(c, 0, -17, 1, c2 => { panel(c2, 70, 24, BLUE, WHT, 2, 4); fit(c2, 'ТУУЛ гол', 0, 1, 60, 12, WHT); }); at(c, 0, 17, 1, c2 => { plate(c2, 92, 30); fit(c2, 'ЧИНГҮНЖАВЫН', 0, -5, 80, 9, BLK); fit(c2, 'гудамж', 0, 7, 60, 10, BLK); }); });
  reg('5.36', c => { panel(c, 96, 66, BLUE, WHT, 3, 5); [['БОРНУУР', '105'], ['ДАРХАН', '220'], ['СҮХБААТАР', '356']].forEach(([n, d], i) => { fit(c, n, -18, -20 + i * 20, 52, 11, WHT); txt(c, d, 32, -20 + i * 20, 11, WHT); }); });
  reg('5.15', c => { panel(c, 76, 76); line(c, [[-6, 34], [-6, -4]], 6, WHT, 'butt'); line(c, [[-6, -4], [-6, -26], [-22, -26]], 6, WHT, 'butt'); arr(c, [[-6, -4], [18, -4], [18, 22]], 5); circ(c, 11, RED, 20, -18); circ(c, 8, WHT, 20, -18); slash(c, 13, -11, 27, -25); });
  SG.reg('2.8', c => {   // морин тэрэг: албан ёсны зураг ба эгчийн сайтын загвартай адил, улаан цагирагийн дотор багтана
    circ(c, 50, RED); circ(c, 39, WHT);
    c.save(); c.translate(-2, 4);
    rr(c, -16, -8, 28, 11, 5, BLK);                                                                   // бие
    poly(c, [[-12, -8], [-17, -20], [-22, -24], [-29, -19], [-28, -15], [-23, -16], [-21, -12], [-17, -4]], BLK);   // хүзүү, толгой
    poly(c, [[-22, -24], [-21, -29], [-18, -23]], BLK);                                                // чих
    line(c, [[12, -6], [17, -2], [14, 4]], 2.2, BLK);                                                  // сүүл
    line(c, [[-14, 2], [-20, 10], [-17, 18]], 2.5, BLK); line(c, [[-9, 2], [-6, 11], [-8, 19]], 2.5, BLK);        // урд хөл
    line(c, [[5, 2], [2, 11], [5, 19]], 2.5, BLK); line(c, [[10, 2], [15, 10], [13, 18]], 2.5, BLK);              // хойд хөл
    line(c, [[10, -1], [26, 5]], 1.6, BLK, 'butt'); line(c, [[11, 3], [25, 7]], 1.6, BLK, 'butt');                // хөтлүүр
    rr(c, 22, -4, 12, 9, 1, BLK);                                                                      // тэрэг
    c.beginPath(); c.arc(27, 9, 5.5, 0, 7); c.strokeStyle = BLK; c.lineWidth = 2.6; c.stroke();        // дугуй
    c.restore();
  });
  reg('5.37', c => { panel(c, 60, 36, BLUE, WHT, 3, 8); fit(c, '1205', 0, 1, 46, 14, WHT); });
  reg('5.38.а', c => { plate(c, 96, 40); fit(c, 'А0102', -8, 1, 62, 20, BLK); rr(c, 22, -15, 24, 30, 2, GREEN); txt(c, '4', 34, 1, 22, WHT); });
  reg('5.38.б', c => { panel(c, 96, 40, BLUE, WHT, 3, 5); arr(c, [[-34, 12], [-34, -12]], 5); fit(c, 'А0603', 8, 1, 62, 20, WHT); });
  reg('5.39', c => { rr(c, -46, -46, 92, 92, 6, BLK); rr(c, -43.5, -43.5, 87, 87, 4, YELLOW); fit(c, 'ШАРХАД', -14, -36, 50, 9, BLK);
    line(c, [[-30, 28], [-30, -26]], 4, BLK, 'butt'); line(c, [[-30, -26], [10, -26], [26, -12], [26, 12], [10, 26], [-26, 26]], 3, BLK); circ(c, 9, WHT, -30, 6); circ(c, 9, RED, -30, 6); circ(c, 6.5, WHT, -30, 6);
    fit(c, 'ДАНДАР БААТАР', 0, 36, 76, 8, BLK); });
  const detour = (c, dir) => { yplate(c, 96, 36); if (dir === 'a') { arr(c, [[-34, 12], [-34, -12]], 6, BLK); fit(c, 'тойрох', 12, 1, 60, 16, BLK); } if (dir === 'b') { fit(c, 'тойрох', -8, 1, 60, 16, BLK); arr(c, [[28, 0], [44, 0]], 6, BLK); } if (dir === 'c') { arr(c, [[-28, 0], [-44, 0]], 6, BLK); fit(c, 'тойрох', 10, 1, 60, 16, BLK); } };
  reg('5.40.а', c => detour(c, 'a')); reg('5.40.б', c => detour(c, 'b')); reg('5.40.в', c => detour(c, 'c'));
  reg('5.41.а', c => { rr(c, -32, -46, 64, 92, 6, BLK); rr(c, -29.5, -43.5, 59, 87, 4, YELLOW); line(c, [[-16, -40], [-16, 24]], 5, BLK, 'butt'); line(c, [[-16, 40], [-16, 20], [6, -4], [6, -40]], 5, BLK, 'butt'); line(c, [[18, -40], [18, 40]], 5, BLK, 'butt'); circ(c, 7, WHT, 8, -30); circ(c, 5, RED, 8, -30); circ(c, 3.5, WHT, 8, -30); });
  reg('5.41.б', c => { rr(c, -32, -46, 64, 92, 6, BLK); rr(c, -29.5, -43.5, 59, 87, 4, YELLOW); circ(c, 10, RED, -14, -28); rr(c, -21, -31, 14, 6, 1, WHT); arr(c, [[-6, 40], [-6, 10], [14, -12], [14, -40]], 6, BLK); line(c, [[-22, -8], [-22, 40]], 4, BLK, 'butt'); });

  // ---------- 6. Үйлчилгээний ----------
  const serv = (c, picto, cap) => { panel(c, 62, 92); const ih = cap ? 54 : 70; rr(c, -26, -40, 52, ih, 5, WHT); at(c, 0, -40 + ih / 2, 1, picto); if (cap) fit(c, cap, 0, 33, 50, 14, WHT); };
  const bed = c => { line(c, [[-22, 10], [22, 10]], 4, BLK, 'butt'); line(c, [[-22, -4], [-22, 18]], 4, BLK, 'butt'); line(c, [[22, 2], [22, 18]], 4, BLK, 'butt'); rr(c, -19, 1, 16, 7, 2, BLK); };
  const cross = (c, x, y, s) => { rr(c, x - s * .15, y - s / 2, s * .3, s, 0, RED); rr(c, x - s / 2, y - s * .15, s, s * .3, 0, RED); };
  reg('6.1', c => serv(c, c2 => cross(c2, 0, 0, 44)));
  reg('6.2', c => serv(c, c2 => { c2.save(); c2.translate(0, 8); bed(c2); c2.restore(); cross(c2, -10, -16, 20); }));
  reg('6.3', c => serv(c, c2 => { rr(c2, -4, -20, 18, 34, 3, BLK); rr(c2, -1, -17, 12, 11, 1, WHT); c2.beginPath(); c2.moveTo(-4, 10); c2.bezierCurveTo(-18, 10, -22, -6, -14, -12); c2.strokeStyle = BLK; c2.lineWidth = 3; c2.stroke(); circ(c2, 4, BLK, -14, -14); }, '800 м'));
  reg('6.4', c => serv(c, c2 => { rr(c2, -9, -22, 18, 14, 3, BLK); rr(c2, -3, -10, 6, 32, 2, BLK); poly(c2, [[-9, -22], [-3, -16], [3, -16], [9, -22]], WHT); }, '100 м →'));
  reg('6.5', c => serv(c, c2 => { carFront(c2, BLK, 0, 10, .9); [-14, -4, 6, 16].forEach(x => line(c2, [[x * .5, -12], [x * 1.3, -4]], 1.6, BLK, 'butt')); line(c2, [[-12, -18], [12, -18]], 3, BLK, 'butt'); }, '8.00-17.30'));
  reg('6.6', c => serv(c, c2 => { c2.beginPath(); c2.moveTo(-6, -20); c2.quadraticCurveTo(-24, 0, -4, 20); c2.strokeStyle = BLK; c2.lineWidth = 9; c2.lineCap = 'round'; c2.stroke();
    rr(c2, -8, -28, 24, 14, 6, BLK); rr(c2, -2, 12, 24, 14, 6, BLK); }));
  reg('6.7', c => serv(c, c2 => { line(c2, [[-12, -24], [-12, -8]], 3, BLK, 'butt'); line(c2, [[-6, -24], [-6, -8]], 3, BLK, 'butt'); line(c2, [[-18, -24], [-18, -8]], 3, BLK, 'butt'); rr(c2, -18, -12, 12, 6, 3, BLK); rr(c2, -14, -8, 4, 32, 2, BLK); poly(c2, [[8, -24], [16, -22], [16, 0], [10, 0]], BLK); rr(c2, 10, -2, 5, 26, 2, BLK); }));
  reg('6.8', c => serv(c, c2 => { rr(c2, -22, -14, 30, 10, 3, BLK); rr(c2, -4, -22, 10, 10, 2, BLK); rr(c2, 4, -6, 16, 8, 3, BLK); rr(c2, 14, -2, 6, 8, 2, BLK); [[-12, 4], [-12, 12]].forEach(([x, y]) => line(c2, [[x, y], [x, y + 8]], 3, BLK)); }));
  reg('6.9', c => serv(c, c2 => { c2.save(); c2.translate(0, 4); bed(c2); c2.restore(); }));
  reg('6.10', c => serv(c, c2 => { poly(c2, [[0, -20], [-26, 18], [26, 18]], BLK); poly(c2, [[0, 2], [-8, 18], [8, 18]], WHT); line(c2, [[-8, -26], [0, -14], [8, -26]], 3, BLK); }));
  reg('6.11', c => serv(c, c2 => { c2.beginPath(); c2.arc(0, 12, 22, Math.PI, 0); c2.closePath(); c2.fillStyle = BLK; c2.fill(); rr(c2, -22, 10, 44, 8, 0, BLK); rr(c2, -5, 4, 10, 14, 0, WHT); line(c2, [[0, -10], [0, -16]], 3, BLK); circ(c2, 4, BLK, 6, -22); circ(c2, 3, BLK, 12, -28); }));
  reg('6.12', c => serv(c, c2 => { poly(c2, [[8, -26], [-2, -12], [18, -12]], BLK); poly(c2, [[8, -16], [-6, 2], [22, 2]], BLK); poly(c2, [[8, -4], [-8, 14], [24, 14]], BLK); line(c2, [[8, 14], [8, 24]], 4, BLK, 'butt'); line(c2, [[-24, 14], [-4, 14]], 3, BLK, 'butt'); line(c2, [[-22, 14], [-22, 24]], 2, BLK, 'butt'); line(c2, [[-6, 14], [-6, 24]], 2, BLK, 'butt'); }));
  reg('6.13', c => serv(c, c2 => { poly(c2, [[-24, -4], [0, -22], [24, -4]], BLK); rr(c2, -20, -4, 6, 30, 0, BLK); rr(c2, 14, -4, 6, 30, 0, BLK); carFront(c2, BLK, 0, 6, .7); }));
  reg('6.14', c => serv(c, c2 => { circ(c2, 4, BLK, -11, -26); rr(c2, -16, -21, 10, 18, 3, BLK); line(c2, [[-14, -2], [-14, 6]], 3, BLK, 'butt'); line(c2, [[-8, -2], [-8, 6]], 3, BLK, 'butt'); circ(c2, 4, BLK, 11, -26); poly(c2, [[11, -21], [18, -3], [4, -3]], BLK); line(c2, [[0, -30], [0, 4]], 1.5, BLK, 'butt'); fit(c2, 'WC', 0, 18, 40, 20, BLK); }));
  reg('6.15', c => serv(c, c2 => { rr(c2, -8, -14, 16, 38, 5, RED); rr(c2, -4, -22, 8, 10, 2, RED); line(c2, [[4, -20], [16, -14]], 3, RED); }));
  reg('6.16', c => serv(c, c2 => { fit(c2, 'ЦАГДАА', 0, -8, 48, 14, BLK); fit(c2, 'POLICE', 0, 9, 48, 14, BLK); }));

  // ---------- 7. Нэмэлт ----------
  const wide = (c, fn, w = 96, h = 40) => { plate(c, w, h); fn(c); };
  reg('7.1.а', c => wide(c, c2 => fit(c2, '300 м', 0, 1, 84, 24, BLK)));
  reg('7.1.б', c => { plate(c, 74, 88); fit(c, 'ЗОГС', 0, -16, 62, 26, BLK); fit(c, '250 м', 0, 20, 62, 22, BLK); });
  reg('7.1.в', c => wide(c, c2 => { fit(c2, '100м', -12, 1, 54, 20, BLK); arr(c2, [[18, 0], [42, 0]], 6, BLK); }));
  reg('7.1.г', c => wide(c, c2 => { arr(c2, [[-18, 0], [-42, 0]], 6, BLK); fit(c2, '100м', 14, 1, 54, 20, BLK); }));
  reg('7.2.а', c => wide(c, c2 => { arr(c2, [[-40, 12], [-40, -12]], 6, BLK); fit(c2, '100м', 0, 1, 50, 18, BLK); arr(c2, [[40, 12], [40, -12]], 6, BLK); }));
  reg('7.2.б', c => { plate(c, 40, 96); arr(c, [[0, -20], [0, -42]], 6, BLK); fit(c, '10', 0, -8, 26, 22, BLK); fit(c, 'М', 0, 14, 26, 18, BLK); });
  reg('7.2.в', c => { plate(c, 40, 96); arr(c, [[0, -38], [0, 40]], 8, BLK); });
  reg('7.2.г', c => { plate(c, 40, 96); arr(c, [[0, -4], [0, -40]], 7, BLK); arr(c, [[0, 4], [0, 40]], 7, BLK); });
  reg('7.2.д', c => wide(c, c2 => { fit(c2, '10м', -12, 1, 50, 20, BLK); arr(c2, [[16, 0], [42, 0]], 6, BLK); }));
  reg('7.2.е', c => wide(c, c2 => { arr(c2, [[-16, 0], [-42, 0]], 6, BLK); fit(c2, '10м', 14, 1, 50, 20, BLK); }));
  reg('7.3.а', c => wide(c, c2 => arr(c2, [[-38, 0], [38, 0]], 8, BLK)));
  reg('7.3.б', c => wide(c, c2 => arr(c2, [[38, 0], [-38, 0]], 8, BLK)));
  reg('7.3.в', c => wide(c, c2 => { arr(c2, [[-6, 0], [-40, 0]], 8, BLK); arr(c2, [[6, 0], [40, 0]], 8, BLK); }));
  const veh = (c, f) => { plate(c, 80, 50); at(c, 0, 0, .52, f); };
  reg('7.4.а', c => veh(c, c2 => truck(c2, BLK)));
  reg('7.4.б', c => veh(c, c2 => { at(c2, -26, 0, .66, c3 => truck(c3, BLK)); rr(c2, 4, -14, 48, 24, 2, BLK); line(c2, [[0, 8], [4, 8]], 4, BLK); [14, 40].forEach(x => { circ(c2, 7, WHT, x, 12); circ(c2, 5.5, BLK, x, 12); }); }));
  reg('7.4.в', c => veh(c, c2 => carSide(c2, BLK)));
  reg('7.4.г', c => veh(c, c2 => at(c2, 0, 0, 1.6, c3 => bus(c3, BLK, WHT))));
  reg('7.4.д', c => veh(c, c2 => tractor(c2, BLK)));
  reg('7.4.е', c => veh(c, c2 => motorcycle(c2, BLK)));
  reg('7.4.ж', c => veh(c, c2 => bicycle(c2, BLK)));
  reg('7.5.а', c => { plate(c, 60, 46); asterisk(c, RED, 15, 6); });
  reg('7.5.б', c => { plate(c, 60, 46); hammers(c, BLK, .9); });
  reg('7.5.в', c => { plate(c, 84, 46); fit(c, 'даваа -', 0, -9, 70, 14, BLK); fit(c, '- лхагва', 0, 9, 70, 14, BLK); });
  reg('7.5.г', c => { plate(c, 86, 36); fit(c, '8.00-17.30', 0, 1, 78, 16, BLK); });
  reg('7.5.д', c => { plate(c, 86, 56); at(c, 0, -10, .6, c2 => asterisk(c2, RED, 15, 6)); fit(c, '8.00-17.30', 0, 14, 78, 15, BLK); });
  reg('7.5.е', c => { plate(c, 86, 56); at(c, 0, -10, 1, c2 => hammers(c2, BLK, .5)); fit(c, '8.00-17.30', 0, 14, 78, 15, BLK); });
  reg('7.5.ж', c => { plate(c, 86, 56); fit(c, 'даваа', 0, -10, 70, 14, BLK); fit(c, '8.30-9.30', 0, 12, 78, 15, BLK); });
  const park = (c, kind, rot, dx) => { plate(c, 84, 50); rr(c, -38, 15, 76, 6, 1, BLK);
    at(c, dx, 2, 1, c2 => { c2.rotate(rot); if (kind === 'f') carFront(c2, BLK, 0, -2, .9); else at(c2, 0, -2, .5, c3 => carSide(c3, BLK)); }); };
  reg('7.6.а', c => park(c, 'f', 0, 0)); reg('7.6.б', c => park(c, 'f', -.18, 8)); reg('7.6.в', c => park(c, 'f', 0, 12));
  reg('7.6.г', c => park(c, 's', 0, 0)); reg('7.6.д', c => park(c, 's', 0, 6));
  reg('7.6.е', c => park(c, 's', -.25, 0)); reg('7.6.ж', c => park(c, 's', -.1, -4)); reg('7.6.з', c => park(c, 's', .12, 4)); reg('7.6.и', c => park(c, 's', 0, -8));
  reg('7.7', c => { plate(c, 90, 52); at(c, -14, 8, .5, c2 => carSide(c2, BLK)); circ(c, 5, BLK, 14, -6); circ(c, 7, BLK, 24, -14); circ(c, 5, BLK, 32, -6); slash(c, 38, -22, -6, 22); });
  reg('7.8', c => { plate(c, 90, 44); [[-26, '10'], [0, '15'], [26, '20']].forEach(([x, n]) => { circ(c, 14, BLK, x, 0); circ(c, 12.2, WHT, x, 0); fit(c, n, x, 1, 18, 13, BLK); }); });
  reg('7.9', c => wide(c, c2 => fit(c2, '30 мин', 0, 1, 80, 24, BLK), 90, 44));
  reg('7.10', c => { plate(c, 90, 52); at(c, 10, 8, .5, c2 => carSide(c2, BLK)); line(c, [[-30, -14], [-14, -14], [-2, 6]], 3, BLK); line(c, [[-30, 14], [-30, -14]], 4, BLK, 'butt'); circ(c, 4, BLK, -30, 16); circ(c, 4, BLK, -18, 16); });
  reg('7.11', c => { plate(c, 90, 52); line(c, [[-38, 16], [38, 16]], 4, BLK, 'butt'); line(c, [[-30, 16], [-30, -6]], 3, BLK, 'butt'); line(c, [[30, 16], [30, -6]], 3, BLK, 'butt'); line(c, [[-34, -8], [34, -8]], 3, BLK, 'butt'); at(c, 0, 0, .46, c2 => carSide(c2, BLK)); });
  reg('7.12', c => wide(c, c2 => fit(c2, '15т', 0, 1, 66, 26, BLK), 80, 44));
  reg('7.13', c => { plate(c, 88, 88); line(c, [[-40, 0], [40, 0]], 2, BLK, 'butt'); line(c, [[0, -40], [0, 40]], 2, BLK, 'butt'); line(c, [[-6, 40], [-6, 8], [8, -8], [40, -8]], 9, BLK, 'butt', 'round'); });
  reg('7.14', c => { plate(c, 70, 52); poly(c, [[-22, -4], [22, -4], [0, 20]], BLK); rr(c, -7, -20, 14, 18, 0, BLK); });
  reg('7.15', c => { plate(c, 56, 56); circ(c, 4, BLK, -4, -17); line(c, [[-4, -10], [-4, 4], [8, 4], [12, 16]], 5, BLK); line(c, [[-4, -4], [8, -4]], 4, BLK); c.beginPath(); c.arc(-4, 8, 12, 0.6, 5.6); c.strokeStyle = BLK; c.lineWidth = 4; c.stroke(); });
  reg('7.16', c => { plate(c, 88, 52); c.beginPath(); c.arc(-18, 0, 13, 0, 7); c.strokeStyle = BLK; c.lineWidth = 5; c.stroke(); c.beginPath(); c.arc(18, 0, 13, 0, 7); c.stroke(); line(c, [[-5, -2], [5, -2]], 4, BLK, 'butt'); line(c, [[-31, -3], [-40, -8]], 3, BLK); line(c, [[31, -3], [40, -8]], 3, BLK); });
  reg('7.17.а', c => { plate(c, 80, 52); [[-16, -8, 10], [-2, -14, 13], [14, -8, 10]].forEach(([x, y, r]) => circ(c, r, BLK, x, y)); rr(c, -26, -8, 52, 10, 0, BLK); [-18, -6, 6, 18].forEach(x => line(c, [[x, 8], [x - 4, 20]], 2.5, BLK, 'butt')); });
  reg('7.17.б', c => { plate(c, 80, 52); for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; line(c, [[-Math.sin(a) * 18, -Math.cos(a) * 18], [Math.sin(a) * 18, Math.cos(a) * 18]], 3, BLK, 'butt'); } });

  // ---------- 1.29 «Эргэх чиг»: улаан самбар, цагаан шевронууд ----------
  const redBoard = (c, w, h) => { rr(c, -w / 2, -h / 2, w, h, 2, WHT); rr(c, -w / 2 + 1.8, -h / 2 + 1.8, w - 3.6, h - 3.6, 1, RED); };
  const chevs = (c, xs, h, dir, sw = 5) => xs.forEach(x => line(c, [[x - dir * 4.5, -h], [x + dir * 4.5, 0], [x - dir * 4.5, h]], sw, WHT, 'butt', 'miter'));
  const bend = (c, dir) => {
    at(c, 0, -16, 1, c2 => { redBoard(c2, 92, 28); chevs(c2, [-31, -11, 9, 29].map(x => x * dir), 9, dir); });
    at(c, 0, 18, 1, c2 => { redBoard(c2, 36, 24); chevs(c2, [0], 8, dir); });
  };
  reg('1.29.а', c => bend(c, 1));
  reg('1.29.б', c => bend(c, -1));
  reg('1.29.в', c => { redBoard(c, 96, 38); chevs(c, [-37, -19], 12.5, -1, 6.5); chevs(c, [19, 37], 12.5, 1, 6.5); });

  // ---------- каталогт нэмэлт хувилбарыг (5.10.а гэх мэт) бүртгэх ----------
  const base = code => code.replace(/\.[^.0-9]+$/, '');
  const names = {}; SIGNS.forEach(s => { names[base(s.code)] = names[base(s.code)] || s.name; });
  const have = new Set(SIGNS.map(s => s.code));
  const svgCodes = typeof SIGN_SVGS !== 'undefined' ? Object.keys(SIGN_SVGS) : [];
  [...SG.drawn(), ...svgCodes].forEach(code => { if (!have.has(code) && !code.includes('@') && names[base(code)]) { SIGNS.push({ code, name: names[base(code)], group: +code.split('.')[0] }); have.add(code); } });
  const key = code => { const m = code.match(/^(\d+)\.(\d+)(?:\.(.+))?$/); return [+m[1], +m[2], m[3] || '']; };
  SIGNS.sort((a, b) => { const x = key(a.code), y = key(b.code); return x[0] - y[0] || x[1] - y[1] || (x[2] < y[2] ? -1 : x[2] > y[2] ? 1 : 0); });
})();
