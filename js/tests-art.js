'use strict';
/* Тестийн зургууд: эх зургийг үндэслэн дээрээс харсан (план) хавтгай вектор болгон дахин зурсан.
   Эх SS-тэй яг ижил УТГАТАЙ (хариулт зургаас шалтгаалдаг) байх ёстой. Зураг бүрийг tests-review.html дээр эхтэй нь зэрэгцүүлж шалгана. */
const TA = (() => {
  const K = { asph: '#4f5a67', line: '#f5f7f9', grass: '#79b562', grass2: '#66a152', walk: '#e6c3ab', walk2: '#d6b199', curb: '#d3dae1',
    bldg: '#c8ced6', roof: '#a7b0bb', dirt: '#cdb98f', dirt2: '#b9a37a', ink: '#1f2933' };
  const R = (x, y, w, h, fill, ex = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${ex}/>`;
  const defs = `<defs>
    <pattern id="pv" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${K.walk}"/><path d="M0 .5H14M0 7.5H14M3.5 0V7M10.5 7V14" stroke="${K.walk2}" stroke-width="1" fill="none"/></pattern>
    <pattern id="gv" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="${K.dirt}"/><circle cx="2" cy="2" r="1.1" fill="${K.dirt2}"/><circle cx="6.5" cy="5.5" r="1.1" fill="${K.dirt2}"/><circle cx="3" cy="7.5" r=".9" fill="#e0d2b0"/></pattern>
    <marker id="tah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#111"/></marker>
  </defs>`;
  const svg = (inner, h = 400) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${h}" class="tart" role="img">${defs}${inner}</svg>`;
  const panel = (x, w, inner, h = 400) => `<svg x="${x}" y="0" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
  const pave = (x, y, w, h) => R(x, y, w, h, 'url(#pv)');
  const gravel = (x, y, w, h) => R(x, y, w, h, 'url(#gv)');
  const T = (x, y, a, body, s = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">${body}</g>`;

  const car = (x, y, a, col, s = 1, driver = false) => T(x, y, a, `
    <rect x="-19.5" y="-25" width="5" height="13" rx="2" fill="#151c25"/><rect x="14.5" y="-25" width="5" height="13" rx="2" fill="#151c25"/>
    <rect x="-19.5" y="12" width="5" height="13" rx="2" fill="#151c25"/><rect x="14.5" y="12" width="5" height="13" rx="2" fill="#151c25"/>
    <rect x="-17" y="-34" width="34" height="68" rx="12" fill="${col}" stroke="rgba(0,0,0,.28)" stroke-width="1.5"/>
    <path d="M-12.5 -15 Q0 -21 12.5 -15 L11 -7 L-11 -7Z" fill="#2a3b4e"/>
    <rect x="-12" y="-7" width="24" height="20" rx="5" fill="rgba(255,255,255,${driver ? .12 : .3})"/>
    <path d="M-11 13 L11 13 L12.5 19 Q0 23 -12.5 19Z" fill="#2a3b4e"/>
    <circle cx="-11" cy="-31" r="2.6" fill="#ffe27a"/><circle cx="11" cy="-31" r="2.6" fill="#ffe27a"/>
    <rect x="-13" y="30.5" width="7" height="2.4" fill="#d33"/><rect x="6" y="30.5" width="7" height="2.4" fill="#d33"/>
    ${driver ? `<ellipse cx="-7" cy="-1" rx="7.5" ry="4.5" fill="#3b5b8a"/><circle cx="-7" cy="-1" r="4.6" fill="#3a2a1e"/><ellipse cx="-7" cy="-2.6" rx="3.2" ry="2.2" fill="#e8b48e"/>` : ''}`, s);

  const truck = (x, y, a, box = '#e9edf1', cab = '#2f9fc4', s = 1, open = false) => T(x, y, a, `
    <rect x="-22" y="-52" width="6" height="16" rx="2" fill="#151c25"/><rect x="16" y="-52" width="6" height="16" rx="2" fill="#151c25"/>
    <rect x="-22" y="22" width="6" height="22" rx="2" fill="#151c25"/><rect x="16" y="22" width="6" height="22" rx="2" fill="#151c25"/>
    <rect x="-17" y="-64" width="34" height="34" rx="9" fill="${cab}" stroke="rgba(0,0,0,.28)" stroke-width="1.5"/>
    <path d="M-13 -52 Q0 -58 13 -52 L12 -44 L-12 -44Z" fill="#2a3b4e"/>
    <circle cx="-11" cy="-62" r="2.4" fill="#ffe27a"/><circle cx="11" cy="-62" r="2.4" fill="#ffe27a"/>
    <rect x="-19" y="-28" width="38" height="82" rx="3" fill="${box}" stroke="#97a3b0" stroke-width="1.5"/>
    <path d="M-19 -8H19M-19 14H19M-19 36H19" stroke="#cfd6dd" stroke-width="1.5"/>
    ${open ? `<path d="M-19 54 L-40 76" stroke="#aeb8c3" stroke-width="5" stroke-linecap="round"/><path d="M19 54 L40 76" stroke="#aeb8c3" stroke-width="5" stroke-linecap="round"/><rect x="-19" y="49" width="38" height="5" fill="#6b7886"/>`
      : `<path d="M0 -28V54" stroke="#97a3b0" stroke-width="1.5"/>`}`, s);

  const tractor = (x, y, a, s = 1) => T(x, y, a, `
    <rect x="-24" y="2" width="9" height="30" rx="3" fill="#151c25"/><rect x="15" y="2" width="9" height="30" rx="3" fill="#151c25"/>
    <rect x="-18" y="-32" width="6" height="16" rx="2" fill="#151c25"/><rect x="12" y="-32" width="6" height="16" rx="2" fill="#151c25"/>
    <rect x="-10" y="-36" width="20" height="34" rx="5" fill="#e2672b" stroke="rgba(0,0,0,.28)" stroke-width="1.5"/>
    <rect x="-15" y="-4" width="30" height="30" rx="5" fill="#f1c232" stroke="rgba(0,0,0,.28)" stroke-width="1.5"/>
    <rect x="-11" y="0" width="22" height="22" rx="3" fill="#3b4857"/>`, s);

  const moto = (x, y, a, jacket = '#c0392b', s = 1) => T(x, y, a, `
    <rect x="-3" y="-30" width="6" height="18" rx="3" fill="#151c25"/><rect x="-3.5" y="12" width="7" height="20" rx="3" fill="#151c25"/>
    <rect x="-4" y="-14" width="8" height="30" rx="3" fill="#59636e"/>
    <path d="M-14 -13 L14 -13" stroke="#151c25" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M-9 -8 L-13 -12M9 -8 L13 -12" stroke="${jacket}" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="0" cy="-2" rx="10" ry="6" fill="${jacket}"/><circle cx="0" cy="-2" r="5.6" fill="#232b35"/><path d="M-3 -6.5Q0 -8.5 3 -6.5" stroke="#9fb4c8" stroke-width="1.6" fill="none"/>`, s);

  const person = (x, y, a, shirt = '#3b6ea8', hair = '#2b211a', s = 1.5) => T(x, y, a, `
    <ellipse cx="0" cy="0" rx="9.5" ry="5.2" fill="${shirt}"/><circle cx="0" cy="0.4" r="5.4" fill="${hair}"/><ellipse cx="0" cy="-1.5" rx="3.6" ry="2.5" fill="#e8b48e"/>`, s);

  const tree = (x, y, r) => `<circle cx="${x + 3}" cy="${y + 4}" r="${r}" fill="rgba(0,0,0,.18)"/><circle cx="${x}" cy="${y}" r="${r}" fill="#4a9444"/><circle cx="${x - r * .18}" cy="${y - r * .2}" r="${r * .68}" fill="#5aa852"/><circle cx="${x - r * .3}" cy="${y - r * .35}" r="${r * .3}" fill="#72bd66"/>`;

  const badge = (x, y, t, r = 17) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${K.ink}" stroke-width="2.5"/><text x="${x}" y="${y + r * .38}" text-anchor="middle" font-family="Segoe UI,Roboto,Arial,sans-serif" font-weight="800" font-size="${r * 1.15}" fill="${K.ink}">${t}</text>`;

  const dim = (x1, x2, y) => `<g stroke="#111" stroke-width="3.5" stroke-linecap="round"><line x1="${x1}" y1="${y - 10}" x2="${x1}" y2="${y + 10}"/><line x1="${x2}" y1="${y - 10}" x2="${x2}" y2="${y + 10}"/><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" marker-start="url(#tah)" marker-end="url(#tah)"/></g>`;
  const route = d => `<path d="${d}" fill="none" stroke="#111" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#tah)"/>`;
  const dashV = (x, y1, y2, c = K.line, w = 3) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-dasharray="22 20"/>`;
  const dashH = (y, x1, x2, c = K.line, w = 3) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${c}" stroke-width="${w}" stroke-dasharray="22 20"/>`;
  const lineV = (x, y1, y2, c = K.line, w = 3) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${c}" stroke-width="${w}"/>`;
  const lineH = (y, x1, x2, c = K.line, w = 3) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${c}" stroke-width="${w}"/>`;
  const sign = (id, x, y, s = 44) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + s * .8}" stroke="#6b7480" stroke-width="3"/><image href="signs-svg/${id}.svg" x="${x - s / 2}" y="${y - s}" width="${s}" height="${s}"/>`;
  const warnSide = (x, y, s = 46) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + s * .8}" stroke="#6b7480" stroke-width="3"/><g transform="translate(${x - s / 2} ${y - s})"><path d="M${s / 2} 2 L${s - 3} ${s - 5} L3 ${s - 5}Z" fill="#fff" stroke="#d3262b" stroke-width="${s * .1}" stroke-linejoin="round"/><path d="M${s / 2} ${s - 11} V${s * .34}" stroke="#111" stroke-width="${s * .1}"/><path d="M${s / 2} ${s * .62} H${s * .72}" stroke="#111" stroke-width="${s * .05}"/></g>`;
  const fenceV = (x, y1, y2) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#3a3f45" stroke-width="2"/>` + Array.from({ length: Math.floor((y2 - y1) / 22) + 1 }, (_, i) => R(x - 3.5, y1 + i * 22, 7, 7, '#e0a82e')).join('');
  const fenceH = (y, x1, x2) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#3a3f45" stroke-width="2"/>` + Array.from({ length: Math.floor((x2 - x1) / 22) + 1 }, (_, i) => R(x1 + i * 22, y - 3.5, 7, 7, '#e0a82e')).join('');
  const roof = (x, y, w, h) => R(x, y, w, h, K.bldg, `stroke="${K.roof}" stroke-width="3"`) + R(x + 8, y + 8, w - 16, h - 16, K.roof, 'opacity=".35"');
  const curbV = (x, y1, y2) => lineV(x, y1, y2, K.curb, 4);
  const curbH = (y, x1, x2) => lineH(y, x1, x2, K.curb, 4);

  return { K, R, svg, panel, pave, gravel, T, car, truck, tractor, moto, person, tree, badge, dim, route, dashV, dashH, lineV, lineH, sign, warnSide, fenceV, fenceH, roof, curbV, curbH };
})();

const TEST_ART = {
  /* 1. Замын өргөн: A = нэг эгнээ, Б = нэг зорчих хэсэг, В = хоёр зорчих хэсэг + тусгаарлах зурвас,
     Г = замын хил (явган хүний замын гадна ирмэгээс ирмэг), Д = барилгын шугамаас шугам (замаас гадна). */
  q01() {
    const { R, pave, car, person, tree, badge, dim, dashV, lineV, curbV, K } = TA;
    let s = R(0, 0, 800, 440, K.grass);
    s += R(0, 0, 36, 440, K.bldg) + R(764, 0, 36, 440, K.bldg);
    s += pave(98, 0, 60, 440) + pave(642, 0, 60, 440);
    s += R(158, 0, 30, 440, K.grass2) + R(612, 0, 30, 440, K.grass2);
    s += R(188, 0, 192, 440, K.asph) + R(420, 0, 192, 440, K.asph);
    s += R(380, 0, 40, 440, K.grass2);
    s += curbV(158, 0, 440) + curbV(188, 0, 440) + curbV(612, 0, 440) + curbV(642, 0, 440) + curbV(380, 0, 440) + curbV(420, 0, 440);
    s += dashV(252, 0, 440) + dashV(316, 0, 440) + dashV(484, 0, 440) + dashV(548, 0, 440);
    s += tree(173, 40, 12) + tree(173, 230, 12) + tree(173, 410, 12) + tree(627, 60, 12) + tree(627, 250, 12) + tree(627, 410, 12);
    s += car(220, 50, 180, '#e0453a') + car(580, 90, 0, '#e9e6dc') + car(348, 60, 180, '#3d7fd1');
    s += person(128, 70, 0, '#3b6ea8') + person(672, 420, 180, '#b5483a') + person(120, 420, 0, '#4a8a5a');
    s += dim(420, 484, 395) + badge(452, 395, 'А');
    s += dim(420, 612, 335) + badge(516, 335, 'Б');
    s += dim(188, 612, 275) + badge(400, 275, 'В');
    s += dim(98, 702, 215) + badge(400, 215, 'Г');
    s += dim(36, 764, 155) + badge(400, 155, 'Д');
    return TA.svg(s, 440);
  },

  /* 3. А = нэг зорчих хэсэг (давхар тасралтгүй шугам), Б = тусгаарлах зурвасаар хоёр зорчих хэсэгтэй. */
  q03() {
    const { R, pave, car, truck, person, tree, badge, dashV, lineV, curbV, K, panel } = TA;
    let a = R(0, 0, 396, 400, K.grass);
    a += pave(14, 0, 56, 400) + pave(320, 0, 56, 400) + R(70, 0, 20, 400, K.grass2) + R(290, 0, 30, 400, K.grass2);
    a += R(90, 0, 200, 400, K.asph) + curbV(70, 0, 400) + curbV(90, 0, 400) + curbV(290, 0, 400) + curbV(320, 0, 400);
    a += lineV(188, 0, 400) + lineV(192, 0, 400) + dashV(140, 0, 400) + dashV(241, 0, 400);
    a += tree(80, 60, 9) + tree(305, 150, 10) + tree(305, 330, 10);
    a += car(115, 110, 180, '#e0453a') + car(266, 290, 0, '#e9e6dc') + car(216, 100, 0, '#3d7fd1') + car(165, 300, 180, '#e0b23a');
    a += person(42, 250, 0, '#3b6ea8') + person(350, 80, 180, '#b5483a');
    a += badge(26, 28, 'А');
    let b = R(0, 0, 396, 400, K.grass);
    b += pave(0, 0, 30, 400) + R(30, 0, 12, 400, K.grass2) + R(290, 0, 12, 400, K.grass2) + pave(302, 0, 48, 400);
    b += R(42, 0, 100, 400, K.asph) + R(190, 0, 100, 400, K.asph) + R(142, 0, 48, 400, K.grass2);
    b += curbV(142, 0, 400) + curbV(190, 0, 400) + curbV(42, 0, 400) + curbV(290, 0, 400);
    b += dashV(92, 0, 400) + dashV(240, 0, 400);
    b += tree(166, 60, 10) + tree(166, 200, 10) + tree(166, 340, 10);
    b += car(67, 110, 180, '#e0453a') + truck(215, 280, 0) + car(265, 90, 0, '#3d7fd1') + car(117, 320, 180, '#e9e6dc');
    b += person(326, 190, 0, '#3b6ea8');
    b += badge(26, 28, 'Б');
    return TA.svg(panel(0, 396, a) + panel(404, 396, b));
  },

  /* 4. Хоёр эгнээтэй зам: тасархай төв шугамын хоёр талд нэг нэг эгнээ. */
  q04() {
    const { R, pave, truck, moto, person, tree, roof, fenceV, curbV, dashV, lineV, K } = TA;
    let s = R(0, 0, 800, 400, K.grass);
    s += roof(0, 0, 150, 400) + roof(650, 0, 150, 400);
    s += pave(156, 0, 128, 400) + pave(516, 0, 134, 400) + fenceV(153, 0, 400);
    s += R(284, 0, 32, 400, K.grass2) + R(484, 0, 32, 400, K.grass2);
    s += R(320, 0, 160, 400, K.asph) + curbV(316, 0, 400) + curbV(484, 0, 400) + curbV(284, 0, 400) + curbV(516, 0, 400);
    s += dashV(400, 0, 400);
    s += tree(300, 60, 13) + tree(300, 330, 13) + tree(500, 150, 13) + tree(500, 360, 13);
    s += truck(440, 280, 0) + moto(358, 95, 180, '#c0392b', 1.5) + moto(366, 215, 180, '#2f5f8f', 1.5);
    s += person(200, 120, 0, '#8d6aa8') + person(236, 300, 180, '#b5483a') + person(580, 110, 0, '#3b6ea8') + person(600, 330, 180, '#4a8a5a');
    return TA.svg(s);
  },

  /* 5. Гол зам: А = хучилттай зам (шороон замыг хүлээж авна), Б = 3.1 «Гол зам» тэмдэг, В = 1.х анхааруулах тэмдэг (хажуугийн зам нийлнэ). */
  q05() {
    const { R, pave, gravel, car, tree, badge, dashV, lineV, lineH, curbV, sign, warnSide, panel, K } = TA;
    let a = R(0, 0, 262, 400, K.grass);
    a += gravel(0, 0, 78, 400);
    a += R(78, 0, 106, 400, K.asph) + dashV(131, 0, 400) + lineV(82, 0, 400) + lineV(180, 0, 400);
    a += gravel(184, 150, 78, 86) + '<path d="M184 150 Q206 150 214 134 L184 134Z" fill="url(#gv)"/><path d="M184 236 Q206 236 214 252 L184 252Z" fill="url(#gv)"/>';
    a += R(184, 0, 78, 134, K.grass) + R(184, 252, 78, 148, K.grass);
    a += R(184, 134, 30, 16, K.grass) + R(184, 236, 30, 16, K.grass);
    a += gravel(184, 150, 78, 86);
    a += tree(40, 60, 14) + tree(36, 330, 14) + tree(225, 70, 14) + tree(228, 330, 14);
    a += car(228, 193, 270, '#e0453a') + badge(26, 28, 'А');
    let b = R(0, 0, 262, 400, K.grass2);
    b += R(0, 150, 262, 82, K.asph) + R(78, 0, 106, 400, K.asph);
    b += pave(0, 0, 66, 138) + pave(196, 0, 66, 138) + pave(0, 244, 66, 156) + pave(196, 244, 66, 156);
    b += R(6, 6, 54, 126, K.grass, 'rx="10"') + R(202, 6, 54, 126, K.grass, 'rx="10"') + R(6, 250, 54, 144, K.grass, 'rx="10"') + R(202, 250, 54, 144, K.grass, 'rx="10"');
    b += lineV(131, 0, 138) + lineV(131, 244, 400) + R(78, 138, 106, 106, K.asph);
    b += lineH(191, 0, 66) + lineH(191, 196, 262);
    b += sign('3.1', 206, 300, 46) + tree(34, 70, 12) + tree(230, 70, 12);
    b += badge(26, 28, 'Б');
    let v = R(0, 0, 262, 400, K.grass);
    v += R(78, 0, 106, 400, K.asph) + dashV(131, 0, 400) + lineV(82, 0, 400) + lineV(180, 0, 400);
    v += R(184, 120, 78, 76, K.asph);
    v += pave(40, 0, 36, 400) + R(76, 0, 2, 400, K.curb);
    v += tree(24, 100, 12) + tree(24, 300, 12) + tree(232, 360, 13) + tree(230, 40, 13);
    v += warnSide(210, 300, 46) + badge(26, 28, 'В');
    return TA.svg(panel(0, 262, a) + panel(269, 262, b) + panel(538, 262, v));
  },

  /* 6. А = хучилттай гол зам ба шороон туслах замын уулзвар, Б = гарц (зэргэлдээ нутаг дэвсгэрээс замд гарах). */
  q06() {
    const { R, pave, gravel, car, person, tree, roof, badge, dashV, lineV, curbV, K, panel } = TA;
    let a = R(0, 0, 396, 400, K.grass);
    a += R(100, 0, 100, 400, K.asph) + dashV(150, 0, 400) + lineV(104, 0, 400) + lineV(196, 0, 400);
    a += gravel(200, 150, 196, 80);
    a += tree(40, 70, 16) + tree(36, 320, 16) + tree(300, 60, 16) + tree(310, 320, 16) + tree(250, 360, 12);
    a += car(320, 186, 270, '#e0453a');
    a += badge(26, 28, 'А');
    let b = R(0, 0, 396, 400, K.grass2);
    b += R(100, 0, 100, 400, K.asph) + dashV(150, 0, 400) + lineV(104, 0, 400) + lineV(196, 0, 400);
    b += pave(200, 0, 50, 400) + curbV(200, 0, 150) + curbV(200, 240, 400);
    b += roof(250, 0, 146, 120) + roof(250, 280, 146, 120);
    b += R(200, 150, 196, 90, '#b9c0c9') + R(200, 150, 50, 90, K.asph);
    b += '<path d="M200 150H250M200 240H250" stroke="#d3dae1" stroke-width="4"/>';
    b += tree(40, 70, 16) + tree(36, 320, 16) + tree(225, 60, 10);
    b += car(310, 195, 270, '#e9e6dc') + person(226, 90, 0, '#3b6ea8');
    b += badge(26, 28, 'Б');
    return TA.svg(panel(0, 396, a) + panel(404, 396, b));
  },

  /* 11. А = явган зорчигч (гарц дээр), Б = жолооч (машинд), В = зам дээр ажил хийж буй хүн (явган зорчигчид тооцохгүй). */
  q11() {
    const { R, pave, car, person, tree, badge, dashH, curbH, K, T, fenceH } = TA;
    let s = R(0, 0, 800, 400, K.grass);
    s += pave(0, 20, 800, 90) + pave(0, 300, 800, 80) + curbH(110, 0, 800) + curbH(300, 0, 800);
    s += R(0, 110, 800, 190, K.asph) + dashH(205, 0, 800);
    for (let i = 0; i < 7; i++) s += R(350, 122 + i * 25, 110, 13, '#f5f7f9');
    s += tree(60, 70, 18) + tree(740, 70, 18) + tree(120, 340, 16);
    s += fenceH(30, 560, 800);
    s += car(190, 250, 90, '#c9a15f', 1, true);
    s += person(405, 230, 0, '#2f3b4a', '#1c1712');
    s += T(560, 165, 0, `<ellipse cx="0" cy="0" rx="10" ry="5.6" fill="#f08a24"/><circle cx="0" cy="0.4" r="5.4" fill="#2b211a"/><ellipse cx="0" cy="-1.5" rx="3.6" ry="2.5" fill="#e8b48e"/><path d="M8 -2 L22 -22" stroke="#7a5a2e" stroke-width="2.5" stroke-linecap="round"/><path d="M16 -26 L28 -18" stroke="#c9a15f" stroke-width="7" stroke-linecap="round"/>`, 1.5);
    s += R(612, 142, 34, 26, '#4e86c7', 'rx="4"') + R(609, 139, 40, 7, '#3b6ea8', 'rx="3"');
    s += badge(405, 178, 'А', 16) + badge(190, 195, 'Б', 16) + badge(560, 128, 'В', 16);
    return TA.svg(s);
  },

  /* 15. А = урсгал сөрж гүйцэж түрүүлэх (эсрэг эгнээнд гарна), Б = ижил чиглэлийн зэргэлдээ эгнээгээр гүйцэх. */
  q15() {
    const { R, pave, gravel, car, tree, badge, dashV, lineV, route, curbV, K, panel } = TA;
    let a = R(0, 0, 396, 400, K.grass) + gravel(60, 0, 40, 400) + gravel(300, 0, 36, 400);
    a += R(100, 0, 200, 400, K.asph) + dashV(200, 0, 400) + lineV(104, 0, 400) + lineV(296, 0, 400);
    a += tree(30, 80, 16) + tree(30, 300, 16) + tree(360, 120, 16) + tree(364, 330, 16);
    a += car(250, 170, 0, '#e0453a') + car(250, 330, 0, '#3d7fd1');
    a += route('M250 290 C250 250 150 262 150 210 L150 110 C150 70 250 78 250 30');
    a += badge(26, 28, 'А');
    let b = R(0, 0, 396, 400, K.grass) + pave(310, 0, 86, 400);
    b += R(40, 0, 250, 400, K.asph) + R(290, 0, 20, 400, K.grass2) + curbV(290, 0, 400) + curbV(310, 0, 400);
    b += lineV(94, 0, 400) + lineV(98, 0, 400) + dashV(194, 0, 400) + lineV(44, 0, 400) + lineV(286, 0, 400);
    b += tree(20, 90, 14) + tree(20, 300, 14) + tree(350, 80, 15) + tree(354, 290, 15);
    b += car(242, 170, 0, '#2f9fa8') + car(242, 330, 0, '#e9e6dc') + car(70, 60, 180, '#e0b23a');
    b += route('M242 290 C242 250 146 262 146 210 L146 110 C146 70 242 78 242 30');
    b += badge(26, 28, 'Б');
    return TA.svg(panel(0, 396, a) + panel(404, 396, b));
  },

  /* 16. Гүйцэх үйлдэл: нэг чиглэлийн зэргэлдээ эгнээгээр тракторыг гүйцээд буцаж ирнэ (эсрэг эгнээнд гарахгүй). */
  q16() {
    const { R, pave, car, tractor, tree, roof, dashH, lineH, route, curbH, K } = TA;
    let s = R(0, 0, 800, 400, K.grass);
    s += R(0, 120, 800, 180, K.asph) + R(0, 30, 800, 90, K.asph);
    s += lineH(117, 0, 800) + lineH(123, 0, 800) + dashH(210, 0, 800);
    s += pave(0, 300, 800, 70) + curbH(300, 0, 800) + curbH(30, 0, 800);
    s += R(0, 0, 800, 30, K.grass2);
    s += roof(560, 330, 230, 70);
    s += tree(60, 345, 18) + tree(260, 350, 16) + tree(460, 346, 17);
    s += tractor(480, 255, 90) + car(150, 255, 90, '#e9e6dc') + car(660, 75, 270, '#3d7fd1');
    s += route('M215 255 C285 255 295 165 365 165 L585 165 C655 165 665 255 735 255');
    return TA.svg(s);
  },

  /* 18. Гол замын (3.1) хөдөлгөөнд «Зам тавьж өг» (3.4) тэмдэгтэй замаас орж ирсэн суудлын машин зам тавиагүй. */
  q18() {
    const { R, pave, car, truck, tree, sign, route, dashH, dashV, lineH, lineV, curbH, curbV, K } = TA;
    let s = R(0, 0, 800, 400, K.grass2);
    s += pave(0, 0, 330, 120) + pave(470, 0, 330, 120) + pave(0, 280, 330, 120) + pave(470, 280, 330, 120);
    s += R(6, 6, 318, 108, K.grass, 'rx="10"') + R(476, 6, 318, 108, K.grass, 'rx="10"');
    s += R(0, 150, 800, 100, K.asph) + R(350, 0, 100, 400, K.asph) + R(330, 120, 140, 160, K.asph);
    s += dashH(200, 0, 330) + dashH(200, 470, 800) + dashV(400, 0, 120) + dashV(400, 280, 400);
    s += tree(60, 60, 18) + tree(740, 60, 18) + tree(90, 340, 16) + tree(730, 340, 16);
    s += sign('3.1', 300, 280, 50) + sign('3.4', 332, 108, 50);
    s += truck(160, 225, 90, '#e9edf1', '#2f9fc4', 1);
    s += car(375, 215, 180, '#e0643a');
    s += route('M262 225 L330 225');
    return TA.svg(s);
  },

  /* 19. Ачаа буулгаж байгаа ачааны машин замын захад (баруун эгнээнд) зогссон. */
  q19() {
    const { R, pave, truck, person, tree, fenceH, dashH, lineH, curbH, T, K } = TA;
    let s = R(0, 0, 800, 400, K.grass);
    s += pave(0, 0, 800, 90) + pave(0, 320, 800, 80) + curbH(90, 0, 800) + curbH(320, 0, 800);
    s += R(0, 90, 800, 230, K.asph) + dashH(205, 0, 800) + lineH(100, 0, 800) + lineH(310, 0, 800);
    s += fenceH(20, 0, 800) + fenceH(385, 0, 800);
    s += tree(700, 60, 16) + tree(120, 360, 15);
    s += truck(480, 275, 90, '#e9edf1', '#2f9fc4', 1, true);
    const barrel = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="13" fill="#b5834a" stroke="#7a5630" stroke-width="2"/><ellipse cx="${x}" cy="${y}" rx="8" ry="8" fill="none" stroke="#7a5630" stroke-width="1.5"/>`;
    const crate = (x, y, w, h) => R(x, y, w, h, '#c79b5e', 'stroke="#7a5630" stroke-width="2" rx="2"') + `<path d="M${x} ${y + h / 2}H${x + w}M${x + w / 2} ${y}V${y + h}" stroke="#7a5630" stroke-width="1.5"/>`;
    s += barrel(318, 262) + barrel(318, 292) + crate(282, 280, 28, 24) + crate(246, 262, 28, 24);
    s += person(364, 266, 90, '#e0453a', '#2b211a') + person(364, 296, 90, '#2f3b4a', '#1c1712');
    s += person(560, 345, 180, '#3b6ea8') + person(600, 350, 180, '#4a8a5a') + person(140, 60, 0, '#b5483a');
    return TA.svg(s);
  },
};
