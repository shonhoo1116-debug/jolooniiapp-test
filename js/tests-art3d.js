'use strict';
/* Тестийн зургууд (перспективтэй, 3D хэлбэртэй вектор). Зураг бүрийг метрээр хэмжсэн «ертөнц»-д байрлуулж, камераар проекцлон SVG болгоно —
   тиймээс хэмжээ, байрлал нь алдаагүй, хариулт зурагтай нийцнэ. Камер +y чиглэлд хардаг; x баруун, z дээш.
   Машины чиглэл (heading): 0 = +y (камерээс холдох), 180 = камер руу, 90 = +x (баруун), 270 = -x. */
const P3 = (() => {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const toHex = a => '#' + a.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  const mul = (c, k) => toHex(hex(c).map(v => v * k));
  const mix = (c, d, t) => { const a = hex(c), b = hex(d); return toHex(a.map((v, i) => v + (b[i] - v) * t)); };
  const NEAR = 0.4, RAD = Math.PI / 180;
  const C = { asph: '#5b6572', line: '#f1f3f5', grass: '#78b65c', grassD: '#5f9e4b', brick: '#d9a58c', brickL: '#c6937c', curb: '#d0d7dd', conc: '#c3c9d0',
    dirt: '#cbb88e', dirtD: '#b6a07a', glass: '#2c3e54', haze: '#d5e2ee', yellow: '#e3a92a' };
  let uid = 0;
  const cfg = { on: false, W: 1536, H: 1024, out: [], meta: [] };

  class Scene {
    constructor(W, H, o = {}) {
      if (cfg.on) { W = cfg.W; H = cfg.H; }
      this.meta = [];
      this.W = W; this.H = H; this.cx = (o.cx || 0) + (cfg.on ? cfg.shift || 0 : 0); this.cy = o.cy ?? -8; this.cz = o.cz || 6; this.pitch = (o.pitch ?? 17) * RAD;
      this.F = (W / 2) / Math.tan((o.fov || 66) * RAD / 2); this.oy = o.oy || 0;
      this.gr = []; this.objs = []; this.over = []; this.id = ++uid;
    }
    cam(p) {
      const dx = p[0] - this.cx, dy = p[1] - this.cy, dz = p[2] - this.cz, c = Math.cos(this.pitch), s = Math.sin(this.pitch);
      return { x: dx, d: dy * c - dz * s, u: dy * s + dz * c };
    }
    pr(q) { return [this.W / 2 + this.F * q.x / q.d, this.H / 2 - this.F * q.u / q.d + this.oy]; }
    P(p) { const q = this.cam(p); return q.d < NEAR ? null : this.pr(q); }
    poly(pts, fill, ex = '') {
      const cs = pts.map(p => this.cam(p)), out = [];
      for (let i = 0; i < cs.length; i++) {
        const a = cs[i], b = cs[(i + 1) % cs.length], ai = a.d >= NEAR, bi = b.d >= NEAR;
        if (ai) out.push(a);
        if (ai !== bi) { const t = (NEAR - a.d) / (b.d - a.d); out.push({ x: a.x + (b.x - a.x) * t, d: NEAR, u: a.u + (b.u - a.u) * t }); }
      }
      if (out.length < 3) return '';
      return `<polygon points="${out.map(q => this.pr(q).map(v => v.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="${fill}" stroke-width=".6" stroke-linejoin="round" ${ex}/>`;
    }
    depth(x, y, z = 0) { return this.cam([x, y, z]).d; }

    /* --- газар --- */
    g(x1, y1, x2, y2, color, layer = 1) { this.gr.push({ l: layer, s: this.gr.length, c: color, pts: [[x1, y1, 0], [x2, y1, 0], [x2, y2, 0], [x1, y2, 0]] }); }
    gp(pts, color, layer = 1) { this.gr.push({ l: layer, s: this.gr.length, c: color, pts: pts.map(p => [p[0], p[1], 0]) }); }
    ln(x1, y1, x2, y2, w, color, layer = 3) {
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L * w / 2, ny = dx / L * w / 2;
      this.gp([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], color, layer);
    }
    dash(x, y1, y2, w = .15, color = C.line, len = 3, gap = 4.5) { for (let y = y1; y < y2; y += len + gap) this.ln(x, y, x, Math.min(y + len, y2), w, color, 3); }
    dashH(y, x1, x2, w = .15, color = C.line, len = 3, gap = 4.5) { for (let x = x1; x < x2; x += len + gap) this.ln(x, y, Math.min(x + len, x2), y, w, color, 3); }
    tiles(x1, x2, y1, y2, step = 1.6) { for (let y = y1; y < y2; y += step) this.ln(x1, y, x2, y, .06, C.brickL, 2); }
    route(pts, w = .5) {
      for (let i = 0; i < pts.length - 1; i++) this.ln(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w, '#10151c', 4);
      const a = pts[pts.length - 2], b = pts[pts.length - 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      this.gp([[b[0] + ux * 1.5, b[1] + uy * 1.5], [b[0] - uy * .8, b[1] + ux * .8], [b[0] + uy * .8, b[1] - ux * .8]], '#10151c', 4);
    }
    bez(p0, p1, p2, p3, n = 14) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return o; }

    /* --- нэгж хайрцаг: [{svg, d}] --- */
    boxFaces(x, y, z, w, l, h, color, o = {}) {
      const hd = (o.h || 0) * RAD, c = Math.cos(hd), s = Math.sin(hd), hw = w / 2, hl = l / 2;
      const W = (lx, ly) => [x + lx * c + ly * s, y - lx * s + ly * c];
      const col = Object.assign({ top: color, front: color, back: color, left: color, right: color }, o.col || {});
      const faces = [
        ['front', [[-hw, hl], [hw, hl]], [s, c]], ['back', [[hw, -hl], [-hw, -hl]], [-s, -c]],
        ['right', [[hw, hl], [hw, -hl]], [c, -s]], ['left', [[-hw, -hl], [-hw, hl]], [-c, s]]];
      let out = '';
      const cc = this.cam([this.cx, this.cy, 0]);
      for (const [name, ends, n] of faces) {
        const a = W(...ends[0]), b = W(...ends[1]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        if (n[0] * (this.cx - mx) + n[1] * (this.cy - my) <= 0) continue;
        const k = 0.55 + 0.45 * Math.max(0, -0.38 * n[0] - 0.48 * n[1]);
        const fc = mul(col[name], k * (o.k || 1));
        out += this.poly([[a[0], a[1], z], [b[0], b[1], z], [b[0], b[1], z + h], [a[0], a[1], z + h]], fc, o.glass && o.glass.includes(name) ? `fill-opacity="${o.gop || 1}"` : '');
      }
      if (this.cz > z + h) {
        const a = W(-hw, -hl), b = W(hw, -hl), d = W(hw, hl), e = W(-hw, hl);
        out += this.poly([[a[0], a[1], z + h], [b[0], b[1], z + h], [d[0], d[1], z + h], [e[0], e[1], z + h]], mul(col.top, 0.55 + 0.45 * 0.79 * (o.k || 1)));
      }
      return out;
    }
    put(x, y, fn, z = 0) { this.objs.push({ d: this.depth(x, y, z), fn }); }
    box(x, y, z, w, l, h, color, o = {}) { this.put(x, y, () => this.boxFaces(x, y, z, w, l, h, color, o)); }
    ballSvg(x, y, z, r, color) {
      const q = this.cam([x, y, z]); if (q.d < NEAR) return '';
      const [sx, sy] = this.pr(q), pr = this.F * r / q.d;
      return `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${pr.toFixed(1)}" fill="${mul(color, .78)}"/><circle cx="${(sx - pr * .12).toFixed(1)}" cy="${(sy - pr * .16).toFixed(1)}" r="${(pr * .82).toFixed(1)}" fill="${color}"/><circle cx="${(sx - pr * .32).toFixed(1)}" cy="${(sy - pr * .4).toFixed(1)}" r="${(pr * .36).toFixed(1)}" fill="${mix(color, '#ffffff', .22)}"/>`;
    }
    glowSvg(x, y, z, r, color) {
      const q = this.cam([x, y, z]); if (q.d < NEAR) return '';
      const [sx, sy] = this.pr(q), pr = this.F * r / q.d;
      return `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(pr * 1.6).toFixed(1)}" fill="${color}" fill-opacity=".28"/><circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${pr.toFixed(1)}" fill="${color}" fill-opacity=".75"/>`;
    }
    ball(x, y, z, r, color) { this.put(x, y, () => this.ballSvg(x, y, z, r, color), z); }
    billboard(x, y, z, size, fn) { this.put(x, y, () => { const q = this.cam([x, y, z]); if (q.d < NEAR) return ''; const [sx, sy] = this.pr(q); return fn(sx, sy, this.F * size / q.d); }); }

    /* --- объектууд --- */
    group(x, y, parts) { this.put(x, y, () => parts.map(p => p()).join('')); }
    local(x, y, h, lx, ly) { const r = h * RAD, c = Math.cos(r), s = Math.sin(r); return [x + lx * c + ly * s, y - lx * s + ly * c]; }
    car(x, y, h, color, o = {}) {
      const B = (lx, ly, z, w, l, ht, col, op = {}) => { const [px, py] = this.local(x, y, h, lx, ly); return () => this.boxFaces(px, py, z, w, l, ht, col, Object.assign({ h }, op)); };
      const dr = o.driver, gl = { front: C.glass, back: C.glass, left: C.glass, right: C.glass };
      const parts = [B(-.9, 1.4, 0, .28, .75, .7, '#171c23'), B(.9, 1.4, 0, .28, .75, .7, '#171c23'), B(-.9, -1.4, 0, .28, .75, .7, '#171c23'), B(.9, -1.4, 0, .28, .75, .7, '#171c23'),
        B(0, 0, .3, 1.85, 4.4, .62, color), B(0, -.3, .92, 1.62, 2.3, .6, color, { col: gl, glass: ['front', 'back', 'left', 'right'], gop: dr ? .5 : 1 }),
        B(-.6, 2.2, .52, .38, .08, .16, '#fff1a8'), B(.6, 2.2, .52, .38, .08, .16, '#fff1a8'), B(-.65, -2.2, .56, .4, .08, .16, '#d0342c'), B(.65, -2.2, .56, .4, .08, .16, '#d0342c')];
      if (o.signal) {
        const sx = o.signal === 'L' ? -1 : 1;
        for (const [ly, z] of [[2.2, .55], [-2.2, .6]]) {
          const [px, py] = this.local(x, y, h, sx * .72, ly);
          parts.push(() => this.boxFaces(px, py, z, .42, .1, .2, '#ffa21f', { h }) + this.glowSvg(px, py, z + .1, .3, '#ffa21f'));
        }
      }
      if (dr) { const [px, py] = this.local(x, y, h, -.45, .25); parts.push(() => this.boxFaces(px, py, .92, .5, .3, .5, '#3b5b8a', { h }) + this.ballSvg(px, py, 1.62, .16, '#e8b48e') + this.ballSvg(px, py, 1.74, .15, '#2e2118')); }
      this.group(x, y, parts);
    }
    truck(x, y, h, o = {}) {
      const box = o.box || '#e9edf1', cab = o.cab || '#2f9fc4';
      const B = (lx, ly, z, w, l, ht, col, op = {}) => { const [px, py] = this.local(x, y, h, lx, ly); return () => this.boxFaces(px, py, z, w, l, ht, col, Object.assign({ h }, op)); };
      const parts = [];
      for (const [wx, wy, wl] of [[-1.15, 2.9, 1], [1.15, 2.9, 1], [-1.15, -2.0, 1], [1.15, -2.0, 1], [-1.15, -.8, 1], [1.15, -.8, 1]]) parts.push(B(wx, wy, 0, .36, wl, 1, '#171c23'));
      parts.push(B(0, 3.05, .7, 2.3, 2.0, 1.0, mul(cab, .8)), B(0, 3.05, 1.7, 2.2, 1.9, 1.15, cab, { col: { front: C.glass }, gop: 1 }));
      parts.push(B(0, -.9, .9, 2.5, 5.6, 2.6, box), B(0, -3.72, 1.1, .06, .05, 2.3, '#8d98a5'));
      if (o.open) for (const sd of [1, -1]) {
        const [hx, hy] = this.local(x, y, h, sd * 1.25, -3.7), psi = sd * 153 * RAD, dx = Math.sin(psi), dy = Math.cos(psi);
        const cx2 = hx + (dx * Math.cos(h * RAD) + dy * Math.sin(h * RAD)) * .62, cy2 = hy + (-dx * Math.sin(h * RAD) + dy * Math.cos(h * RAD)) * .62;
        parts.push(() => this.boxFaces(cx2, cy2, 1.1, .07, 1.25, 2.3, '#c5ccd4', { h: h + sd * 153 }));
      }
      this.group(x, y, parts);
    }
    tractor(x, y, h) {
      const B = (lx, ly, z, w, l, ht, col, op = {}) => { const [px, py] = this.local(x, y, h, lx, ly); return () => this.boxFaces(px, py, z, w, l, ht, col, Object.assign({ h }, op)); };
      this.group(x, y, [B(-.95, -.7, 0, .45, 1.3, 1.3, '#171c23'), B(.95, -.7, 0, .45, 1.3, 1.3, '#171c23'), B(-.7, 1.2, 0, .25, .7, .8, '#171c23'), B(.7, 1.2, 0, .25, .7, .8, '#171c23'),
        B(0, 1.0, .5, .85, 1.9, .85, '#e2672b'), B(0, -.5, .8, 1.35, 1.5, 1.5, '#f0c332', { col: { front: C.glass, left: C.glass, right: C.glass }, glass: ['front', 'left', 'right'] })]);
    }
    moto(x, y, h, jacket = '#c0392b') {
      const B = (lx, ly, z, w, l, ht, col, op = {}) => { const [px, py] = this.local(x, y, h, lx, ly); return () => this.boxFaces(px, py, z, w, l, ht, col, Object.assign({ h }, op)); };
      const [tx, ty] = this.local(x, y, h, 0, -.05);
      this.group(x, y, [B(0, 1.0, 0, .14, .75, .75, '#171c23'), B(0, -.95, 0, .16, .8, .8, '#171c23'), B(0, 0, .35, .3, 1.5, .5, '#59636e'), B(0, .55, .95, .85, .07, .07, '#171c23'),
        B(0, -.05, .85, .52, .32, .68, jacket), () => this.ballSvg(tx, ty, 1.72, .17, '#232b35')]);
    }
    person(x, y, h, shirt = '#3b6ea8', hair = '#2e2118') {
      const B = (lx, ly, z, w, l, ht, col) => this.boxFaces(x, y, z, w, l, ht, col, { h });
      this.put(x, y, () => B(0, 0, 0, .36, .22, .85, '#2d3643') + B(0, 0, .85, .52, .3, .68, shirt) + this.ballSvg(x, y, 1.62, .12, '#e8b48e') + this.ballSvg(x, y, 1.69, .115, hair));
    }
    tree(x, y, s = 1) {
      this.put(x, y, () => this.boxFaces(x, y, 0, .3 * s, .3 * s, 2.4 * s, '#7a5634') + this.ballSvg(x, y, 3.2 * s, 1.55 * s, '#3f8a3c') + this.ballSvg(x + .6 * s, y + .2, 2.9 * s, 1.1 * s, '#4f9b46') + this.ballSvg(x - .5 * s, y - .1, 3.7 * s, 1.0 * s, '#5aa850'));
    }
    bush(x, y, r = .8) { this.ball(x, y, r * .8, r, '#4a9444'); }
    building(x, y, w, l, ht, color, faceSide) {
      this.put(x, y, () => {
        let s = this.boxFaces(x, y, 0, w, l, ht, color);
        const xf = x + faceSide * (w / 2), n = [faceSide, 0];
        if (n[0] * (this.cx - xf) <= 0) return s;
        const k = 0.55 + 0.45 * Math.max(0, -0.38 * n[0]), wc = mul('#8fb4d4', k);
        for (let yy = y - l / 2 + 1.2; yy < y + l / 2 - 1.8; yy += 3.4) for (let zz = 1.4; zz < ht - 1.5; zz += 3.2) s += this.poly([[xf, yy, zz], [xf, yy + 1.7, zz], [xf, yy + 1.7, zz + 1.7], [xf, yy, zz + 1.7]], wc);
        return s;
      });
    }
    sign(id, x, y, size = .85, h = 2.4) {
      this.box(x, y, 0, .09, .09, h, '#7b8590');
      this.billboard(x, y, h + size * .45, size, (sx, sy, px) => `<image href="signs-svg/${id}.svg" x="${(sx - px / 2).toFixed(1)}" y="${(sy - px / 2).toFixed(1)}" width="${px.toFixed(1)}" height="${px.toFixed(1)}"/>`);
    }
    warnSide(x, y, size = .95, h = 2.3) {
      this.box(x, y, 0, .09, .09, h, '#7b8590');
      this.billboard(x, y, h + size * .45, size, (sx, sy, px) => `<g transform="translate(${(sx - px / 2).toFixed(1)} ${(sy - px / 2).toFixed(1)}) scale(${(px / 100).toFixed(3)})"><path d="M50 4 L96 90 L4 90Z" fill="#fff" stroke="#d3262b" stroke-width="9" stroke-linejoin="round"/><path d="M50 78 V34" stroke="#111" stroke-width="9"/><path d="M50 62 H72" stroke="#111" stroke-width="5"/></g>`);
    }
    fence(x, y1, y2, step = 2.5) { for (let y = y1; y < y2; y += step) { this.box(x, y, 0, .12, .12, 1.4, C.yellow); this.box(x, y + step / 2, .95, .05, step, .07, '#3a3f45'); } }

    /* --- дээд давхарга (2D) --- */
    dim(x1, x2, y, label) {
      this.meta.push({ t: 'dim', label, a: this.P([x1, y, .03]), b: this.P([x2, y, .03]) });
      this.over.push(() => {
        const a = this.P([x1, y, .03]), b = this.P([x2, y, .03]); if (!a || !b) return '';
        const hd = 11, dir = Math.sign(b[0] - a[0]) || 1;
        const tick = (st) => `<path d="M${a[0]} ${a[1] - 10}V${a[1] + 10}M${b[0]} ${b[1] - 10}V${b[1] + 10}" ${st}/>`;
        const arrow = (st) => tick(st) + `<line x1="${a[0] + dir * 3}" y1="${a[1]}" x2="${b[0] - dir * 3}" y2="${b[1]}" ${st}/><path d="M${a[0] + dir * hd} ${a[1] - 6}L${a[0]} ${a[1]}L${a[0] + dir * hd} ${a[1] + 6}M${b[0] - dir * hd} ${b[1] - 6}L${b[0]} ${b[1]}L${b[0] - dir * hd} ${b[1] + 6}" fill="none" ${st}/>`;
        const mx = (a[0] + b[0]) / 2, my = a[1];
        return `<g stroke-linecap="round" stroke-linejoin="round">${arrow('stroke="#0b1220" stroke-opacity=".55" stroke-width="6.5"')}${arrow('stroke="#fff" stroke-width="3"')}</g>` + this.badgeSvg(mx, my, label);
      });
    }
    badgeSvg(cx, cy, t, r = 14) { return `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="7" fill="#161e2c" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/><text x="${cx}" y="${cy + r * .42}" text-anchor="middle" font-family="Segoe UI,Roboto,Arial,sans-serif" font-weight="800" font-size="${r * 1.2}" fill="#fff">${t}</text>`; }
    tag(x, y, z, t) { this.meta.push({ t: 'tag', label: t, p: this.P([x, y, z]) }); this.over.push(() => { const p = this.P([x, y, z]); return p ? this.badgeSvg(p[0], p[1], t, 14) : ''; }); }
    badge(t, sx = 22, sy = 22) { this.over.push(() => this.badgeSvg(sx, sy, t, 15)); }

    render() {
      const hz = this.pr({ x: 0, d: 1e5 * Math.cos(this.pitch), u: 1e5 * Math.sin(this.pitch) })[1], id = this.id;
      const sky = `<defs><linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb6e6"/><stop offset="1" stop-color="#dcebf6"/></linearGradient>
        <linearGradient id="fog${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${hz.toFixed(1)}" x2="0" y2="${(hz + this.H * .3).toFixed(1)}"><stop offset="0" stop-color="${C.haze}" stop-opacity=".9"/><stop offset="1" stop-color="${C.haze}" stop-opacity="0"/></linearGradient></defs>`;
      let s = sky + `<rect width="${this.W}" height="${Math.max(0, hz + 1).toFixed(1)}" fill="url(#sky${id})"/><rect y="${hz.toFixed(1)}" width="${this.W}" height="${this.H}" fill="${C.grass}"/>`;
      s += this.gr.slice().sort((p, q) => p.l - q.l || p.s - q.s).map(p => this.poly(p.pts, p.c)).join('');
      s += `<rect y="${hz.toFixed(1)}" width="${this.W}" height="${(this.H * .3).toFixed(1)}" fill="url(#fog${id})"/>`;
      s += this.objs.slice().sort((p, q) => q.d - p.d).map(o => o.fn()).join('');
      if (cfg.on) { cfg.out.push(s); cfg.meta.push(this.meta); return s; }
      s += this.over.map(f => f()).join('');
      return s;
    }
    panel(x) { return `<svg x="${x}" y="0" width="${this.W}" height="${this.H}" viewBox="0 0 ${this.W} ${this.H}">${this.render()}</svg>`; }
  }
  const svg = (inner, W, H) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" class="tart" role="img">${inner}</svg>`;
  return { Scene, C, svg, mix, mul, cfg };
})();

/* ортой орчин: ерөнхий хэрэгслүүд */
const E3 = {
  /* ногоон талбай + тал бүрийн барилга */
  base(S, o = {}) {
    S.g(-90, -40, 90, 400, P3.C.grass, 0);
    if (o.buildings !== false) {
      const bx = o.bx || 22, cols = ['#f1ece2', '#ddc3ab', '#cfdbe6', '#eadfd0', '#d6c8b6'];
      for (let i = 0, y = -6; y < 150; i++, y += 15) { S.building(bx + 3.5, y, 7, 14, 11 + (i * 7 % 9), cols[i % 5], -1); S.building(-bx - 3.5, y + 7, 7, 14, 10 + (i * 5 % 10), cols[(i + 2) % 5], 1); }
    }
  },
  road(S, x1, x2, y1 = -30, y2 = 300, color = P3.C.asph) { S.g(x1, y1, x2, y2, color, 1); },
  sidewalk(S, x1, x2, y1 = -30, y2 = 120) { S.g(x1, y1, x2, y2, P3.C.brick, 1); S.tiles(x1, x2, Math.max(y1, -12), y2); },
  curb(S, x, y1 = -30, y2 = 300, side = 1) { S.g(x - .12 * side, y1, x + .12 * side, y2, P3.C.curb, 2); },
};

const TEST_ART3D = {
  /* 1. A = нэг эгнээ, Б = баруун зорчих хэсэг, В = хоёр зорчих хэсэг + тусгаарлах зурвас, Г = замын хил (явган хүний замын гадна ирмэг), Д = барилгын шугам. */
  q01() {
    const W = 800, H = 480, S = new P3.Scene(W, H, { cx: 0, cy: -9, cz: 6.4, pitch: 16, oy: 6 }), C = P3.C;
    E3.base(S, { bx: 17 });
    S.g(-17, -30, 17, 300, C.grass, 0);
    E3.sidewalk(S, 9.8, 13.8); E3.sidewalk(S, -13.8, -9.8);
    S.g(7.8, -30, 9.8, 300, C.grassD, 1); S.g(-9.8, -30, -7.8, 300, C.grassD, 1);
    E3.road(S, 1.2, 7.8); E3.road(S, -7.8, -1.2);
    S.g(-1.2, -30, 1.2, 300, C.grassD, 1);
    for (const x of [-7.8, -1.2, 1.2, 7.8, 9.8, -9.8]) S.g(x - .1, -30, x + .1, 300, C.curb, 2);
    for (const x of [-7.55, 7.55, -1.5, 1.5]) S.ln(x, -30, x, 300, .16, C.line);
    S.dash(4.5, -30, 300); S.dash(-4.5, -30, 300);
    for (let y = -4; y < 90; y += 12) { S.tree(8.8, y, .8); S.tree(-8.8, y + 6, .8); }
    for (let y = -6; y < 90; y += 6) { S.bush(0, y, .6); }
    S.car(-2.85, 7, 180, '#d9392f'); S.car(6.15, 5, 0, '#ece8dd'); S.car(2.85, 58, 0, '#6f9fcf'); S.car(-6.15, 74, 180, '#e0b23a');
    S.person(11.8, 20, 0, '#3b6ea8'); S.person(-11.8, 34, 180, '#2d3643'); S.person(12.3, 52, 0, '#b5483a');
    S.dim(1.2, 4.5, 0.4, 'А'); S.dim(1.2, 7.8, 10, 'Б'); S.dim(-7.8, 7.8, 19, 'В'); S.dim(-13.8, 13.8, 30, 'Г'); S.dim(-17, 17, 52, 'Д');
    return P3.svg(S.render(), W, H);
  },

  /* 3. А = нэг зорчих хэсэг (дунд нь давхар тасралтгүй шугам), Б = тусгаарлах зурвасаар хоёр зорчих хэсэгтэй. */
  q03() {
    const W = 396, H = 400, o = { fov: 70, cz: 6, cy: -8, pitch: 17 };
    const A = new P3.Scene(W, H, o), B = new P3.Scene(W, H, Object.assign({}, o, { cx: 1.6 })), C = P3.C;
    E3.base(A, { bx: 19 }); E3.base(B, { bx: 21 });
    E3.sidewalk(A, 8.6, 12.6); E3.sidewalk(A, -12.6, -8.6); A.g(6.6, -30, 8.6, 300, C.grassD, 1); A.g(-8.6, -30, -6.6, 300, C.grassD, 1);
    E3.road(A, -6.6, 6.6); A.ln(-.12, -30, -.12, 300, .13, C.line); A.ln(.12, -30, .12, 300, .13, C.line); A.dash(3.3, -30, 300); A.dash(-3.3, -30, 300);
    for (const x of [-6.4, 6.4]) A.ln(x, -30, x, 300, .14, C.line);
    for (const x of [-6.6, 6.6, 8.6, -8.6]) A.g(x - .1, -30, x + .1, 300, C.curb, 2);
    for (let y = -2; y < 80; y += 12) { A.tree(7.6, y, .7); A.tree(-7.6, y + 6, .7); }
    A.car(-4.95, 9, 180, '#d9392f'); A.car(-1.65, 20, 180, '#e0b23a'); A.car(1.65, 5, 0, '#6f9fcf'); A.car(4.95, 16, 0, '#ece8dd');
    A.person(10.6, 14, 0, '#3b6ea8'); A.person(-10.6, 24, 0, '#b5483a');
    E3.sidewalk(B, 9.8, 13.8); E3.sidewalk(B, -13.8, -9.8); B.g(7.8, -30, 9.8, 300, C.grassD, 1); B.g(-9.8, -30, -7.8, 300, C.grassD, 1);
    E3.road(B, 1.2, 7.8); E3.road(B, -7.8, -1.2); B.g(-1.2, -30, 1.2, 300, C.grassD, 1);
    for (const x of [-7.8, -1.2, 1.2, 7.8, 9.8, -9.8]) B.g(x - .1, -30, x + .1, 300, C.curb, 2);
    for (const x of [-7.55, 7.55, -1.5, 1.5]) B.ln(x, -30, x, 300, .16, C.line);
    B.dash(4.5, -30, 300); B.dash(-4.5, -30, 300);
    for (let y = -4; y < 80; y += 12) { B.tree(8.8, y, .7); B.tree(-8.8, y + 6, .7); }
    for (let y = -6; y < 80; y += 6) B.bush(0, y, .6);
    B.car(-2.85, 9, 180, '#d9392f'); B.car(-6.15, 22, 180, '#ece8dd'); B.truck(6.15, 4, 0, {}); B.car(2.85, 26, 0, '#6f9fcf');
    B.person(11.8, 16, 0, '#3b6ea8');
    A.badge('А'); B.badge('Б');
    return P3.svg(A.panel(0) + B.panel(404), 800, H);
  },

  /* 4. Хоёр эгнээтэй зам: тасархай төв шугамын хоёр талд нэг нэг эгнээ (барааны машин, хоёр мотоцикл). */
  q04() {
    const W = 800, H = 400, S = new P3.Scene(W, H, { cx: 0, cy: -8, cz: 5.4, pitch: 14, oy: 4 }), C = P3.C;
    E3.base(S, { bx: 15 });
    E3.sidewalk(S, 5.6, 11.6); E3.sidewalk(S, -11.6, -5.6); S.g(3.3, -30, 5.6, 300, C.grassD, 1); S.g(-5.6, -30, -3.3, 300, C.grassD, 1);
    E3.road(S, -3.3, 3.3); S.dash(0, -30, 300); S.ln(-3.1, -30, -3.1, 300, .14, C.line); S.ln(3.1, -30, 3.1, 300, .14, C.line);
    for (const x of [-3.3, 3.3, 5.6, -5.6]) S.g(x - .1, -30, x + .1, 300, C.curb, 2);
    S.fence(-11.4, -10, 100);
    for (let y = -2; y < 70; y += 10) { S.tree(4.5, y, .7); S.tree(-4.5, y + 5, .7); }
    S.truck(1.65, 12, 0, {}); S.moto(-1.65, 9, 180, '#c0392b'); S.moto(-1.65, 21, 180, '#2f5f8f');
    S.person(-8.4, 10, 0, '#8d6aa8'); S.person(-9.4, 20, 0, '#b5483a'); S.person(8.6, 18, 180, '#3b6ea8');
    return P3.svg(S.render(), W, H);
  },

  /* 5. Гол зам: А = хучилттай зам (шороон замыг хүлээж авна), Б = 3.1 «Гол зам» тэмдэг, В = хажуугийн зам нийлэх анхааруулах тэмдэг. */
  q05() {
    const W = 262, H = 400, o = { fov: 66, cz: 8.5, cy: -5, pitch: 27, oy: -10 }, C = P3.C;
    const A = new P3.Scene(W, H, o), B = new P3.Scene(W, H, o), V = new P3.Scene(W, H, o);
    for (const S of [A, B, V]) { E3.base(S, { buildings: false }); E3.road(S, -3.3, 3.3); S.g(-3.4, -30, -3.2, 300, C.curb, 2); S.g(3.2, -30, 3.4, 300, C.curb, 2); }
    A.dash(0, -30, 300); A.g(-6.5, -30, -3.3, 300, C.dirt, 1); A.g(3.3, 9, 40, 15.6, C.dirt, 1); A.g(3.3, 7.6, 6, 9, C.dirt, 1); A.g(3.3, 15.6, 6, 17, C.dirt, 1);
    for (const y of [2, 14, 30, 48]) { A.tree(-9, y, .9); A.tree(9, y + 12, .9); }
    A.car(9.5, 12.3, 270, '#d9392f'); A.badge('А', 20, 20);
    B.ln(0, -30, 0, 9, .15, C.line); B.ln(0, 15.6, 0, 300, .15, C.line); E3.road(B, -40, 40, 9, 15.6);
    B.ln(-40, 12.3, -3.3, 12.3, .13, C.line); B.ln(3.3, 12.3, 40, 12.3, .13, C.line);
    for (const [x1, x2, y1, y2] of [[3.3, 14, 15.6, 40], [3.3, 14, -10, 9], [-14, -3.3, 15.6, 40], [-14, -3.3, -10, 9]]) { B.g(x1, y1, x2, y2, C.brick, 1); B.g(x1 + (x1 < 0 ? 0 : 1.2), y1 + 1.2, x2 - (x1 < 0 ? 1.2 : 0), y2 - 1.2, C.grassD, 1); }
    B.sign('3.1', 4.8, 5.4, 1.1); B.tree(9, 26, .8); B.tree(-9, 26, .8); B.tree(9, -1, .8); B.badge('Б', 20, 20);
    V.dash(0, -30, 300); V.g(3.3, 9, 40, 15.6, C.asph, 1); V.g(-7, -30, -3.3, 300, C.brick, 1); V.tiles(-7, -3.3, -12, 100);
    V.warnSide(5, 4.5, 1.15); for (const y of [2, 16, 34, 50]) V.tree(-9.5, y, .9); V.tree(9, 26, .9); V.tree(9, 0, .9); V.badge('В', 20, 20);
    return P3.svg(A.panel(0) + B.panel(269) + V.panel(538), 800, H);
  },

  /* 6. А = хучилттай гол зам ба шороон туслах замын уулзвар, Б = гарц (зэргэлдээ нутаг дэвсгэрээс замд гарах). */
  q06() {
    const W = 396, H = 400, o = { fov: 66, cz: 8.5, cy: -5, pitch: 27, oy: -10 }, C = P3.C;
    const A = new P3.Scene(W, H, o), B = new P3.Scene(W, H, o);
    E3.base(A, { buildings: false }); E3.base(B, { buildings: false });
    E3.road(A, -3.3, 3.3); A.dash(0, -30, 300); A.g(3.3, 8, 40, 14.6, C.dirt, 1); A.g(-6.2, -30, -3.3, 300, C.dirt, 1); A.g(3.3, 6.6, 6, 8, C.dirt, 1); A.g(3.3, 14.6, 6, 16, C.dirt, 1);
    for (const y of [2, 14, 30, 48]) { A.tree(-9, y, .9); A.tree(9, y + 12, .9); } A.car(7.6, 11.3, 270, '#d9392f'); A.badge('А');
    E3.road(B, -3.3, 3.3); B.dash(0, -30, 300); E3.sidewalk(B, 3.3, 7.3, -12, 120);
    B.g(7.3, -30, 40, 300, C.conc, 0); B.g(7.3, 6, 40, 14, C.conc, 1); B.g(3.3, 6, 7.3, 14, C.asph, 2);
    B.building(15, 26, 9, 22, 9, '#e2dccf', -1); B.building(15, -2, 9, 14, 7, '#d6b79c', -1);
    for (const y of [2, 14, 30, 48]) B.tree(-9, y, .9);
    B.car(9.2, 10, 270, '#ece8dd'); B.person(5.3, 2.5, 0, '#3b6ea8'); B.badge('Б');
    return P3.svg(A.panel(0) + B.panel(404), 800, H);
  },

  /* 11. А = явган зорчигч (гарц дээр), Б = жолооч (машинд), В = зам дээр ажил хийж буй хүн (явган зорчигчид тооцохгүй). */
  q11() {
    const W = 800, H = 420, S = new P3.Scene(W, H, { cx: 0, cy: -7, cz: 7.2, pitch: 22, oy: 6 }), C = P3.C;
    E3.base(S, { bx: 17 });
    E3.sidewalk(S, 5.6, 12); E3.sidewalk(S, -12, -5.6); S.g(3.3, -30, 5.6, 300, C.grassD, 1); S.g(-5.6, -30, -3.3, 300, C.grassD, 1);
    E3.road(S, -3.3, 3.3); S.dash(0, -30, 300); S.ln(-3.1, -30, -3.1, 300, .14, C.line); S.ln(3.1, -30, 3.1, 300, .14, C.line);
    for (const x of [-3.3, 3.3, 5.6, -5.6]) S.g(x - .1, -30, x + .1, 300, C.curb, 2);
    for (let x = -2.8; x <= 2.8; x += 1.0) S.g(x - .28, 14, x + .28, 18, C.line, 3);
    for (let y = -2; y < 60; y += 12) { S.tree(4.5, y, .7); S.tree(-4.5, y + 6, .7); }
    S.car(-1.65, 8.5, 180, '#c9a15f', { driver: true });
    S.person(0.2, 16, 90, '#2f3b4a');
    S.person(1.0, 22, 90, '#f08a24'); S.box(1.75, 22.4, 0, .05, 1.3, .05, '#7a5a2e', { h: 70 }); S.box(2.25, 22.6, 0, .08, .5, .1, '#c9a15f', { h: 70 }); S.box(2.7, 21.0, 0, .9, .8, 1.1, '#3f78bf'); S.box(2.7, 21.0, 1.1, 1.0, .9, .1, '#2c5a96');
    S.tag(0.2, 16, 2.4, 'А'); S.tag(-1.65, 8.5, 3.2, 'Б'); S.tag(1.0, 22, 2.6, 'В');
    return P3.svg(S.render(), W, H);
  },

  /* 15. А = урсгал сөрж гүйцэж түрүүлэх (эсрэг эгнээнд гарна), Б = ижил чиглэлийн зэргэлдээ эгнээгээр гүйцэх. */
  q15() {
    const W = 396, H = 400, o = { fov: 66, cz: 8, cy: -3, pitch: 25, oy: -8 }, C = P3.C;
    const A = new P3.Scene(W, H, o), B = new P3.Scene(W, H, Object.assign({}, o, { cx: .6 }));
    E3.base(A, { buildings: false }); E3.road(A, -3.3, 3.3); A.dash(0, -30, 300); A.g(-6.2, -30, -3.3, 300, C.dirt, 1); A.g(3.3, -30, 6.2, 300, C.dirt, 1);
    for (const x of [-3.15, 3.15]) A.ln(x, -30, x, 300, .14, C.line);
    for (const y of [4, 18, 34, 52]) { A.tree(-9, y, .9); A.tree(9, y + 9, .9); }
    A.car(1.65, 18, 0, '#d9392f'); A.car(1.65, 5, 0, '#4f86c6', { signal: 'L' });
    A.route([...A.bez([1.65, 8], [1.65, 11.5], [-1.65, 11], [-1.65, 15]), [-1.65, 20], [-1.65, 24], ...A.bez([-1.65, 24], [-1.65, 28], [1.65, 27.5], [1.65, 31.5]).slice(1)]);
    A.badge('А');
    E3.base(B, { buildings: false }); E3.road(B, -4.7, 5.2); B.dash(1.9, -30, 300); B.ln(-1.62, -30, -1.62, 300, .13, C.line); B.ln(-1.38, -30, -1.38, 300, .13, C.line);
    B.ln(-4.5, -30, -4.5, 300, .14, C.line); B.ln(5.0, -30, 5.0, 300, .14, C.line);
    B.g(5.2, -30, 9, 300, C.grassD, 1); E3.sidewalk(B, 9, 14); B.g(-8, -30, -4.7, 300, C.grassD, 1);
    for (const y of [4, 18, 34, 52]) { B.tree(-6.5, y, .8); B.tree(7, y + 9, .8); }
    B.car(3.55, 18, 0, '#2f9fa8'); B.car(3.55, 5, 0, '#ece8dd', { signal: 'L' }); B.car(-3.15, 38, 180, '#e0b23a');
    B.route([...B.bez([3.55, 8], [3.55, 11.5], [.25, 11], [.25, 15]), [.25, 20], [.25, 24], ...B.bez([.25, 24], [.25, 28], [3.55, 27.5], [3.55, 31.5]).slice(1)]);
    B.badge('Б');
    return P3.svg(A.panel(0) + B.panel(404), 800, H);
  },

  /* 16. Гүйцэх үйлдэл: нэг чиглэлийн зэргэлдээ эгнээгээр тракторыг гүйцээд буцаж ирнэ (эсрэг эгнээнд гарахгүй). */
  q16() {
    const W = 800, H = 400, S = new P3.Scene(W, H, { cx: .6, cy: -8, cz: 6.2, pitch: 19, oy: 4 }), C = P3.C;
    E3.base(S, { bx: 17 });
    E3.road(S, -4.7, 5.2); S.dash(1.9, -30, 300); S.ln(-1.62, -30, -1.62, 300, .13, C.line); S.ln(-1.38, -30, -1.38, 300, .13, C.line);
    S.ln(-4.5, -30, -4.5, 300, .14, C.line); S.ln(5.0, -30, 5.0, 300, .14, C.line);
    S.g(5.2, -30, 7, 300, C.grassD, 1); E3.sidewalk(S, 7, 12); S.g(-9, -30, -4.7, 300, C.grassD, 1); E3.sidewalk(S, -13, -9);
    for (const y of [2, 14, 28, 42]) { S.tree(6.2, y, .7); S.tree(-8, y + 6, .8); }
    S.tractor(3.55, 17, 0); S.car(3.55, 4, 0, '#ece8dd', { signal: 'L' }); S.car(-3.15, 42, 180, '#4f86c6');
    S.route([...S.bez([3.55, 8], [3.55, 11.5], [.25, 11], [.25, 15]), [.25, 20], [.25, 24], ...S.bez([.25, 24], [.25, 28], [3.55, 27.5], [3.55, 31.5]).slice(1)]);
    return P3.svg(S.render(), W, H);
  },

  /* 18. Гол замын (3.1) хөдөлгөөнд «Зам тавьж өг» (3.4) тэмдэгтэй замаас орж ирсэн суудлын машин зам тавиагүй. */
  q18() {
    const W = 800, H = 420, S = new P3.Scene(W, H, { cx: 0, cy: -9, cz: 10, pitch: 26, oy: 8, fov: 64 }), C = P3.C;
    E3.base(S, { buildings: false });
    S.g(-90, 17, 90, 24, C.asph, 1); S.g(-3.3, -30, 3.3, 300, C.asph, 1);
    for (const [x1, x2, y1, y2] of [[3.3, 14, 24, 50], [3.3, 14, -10, 17], [-14, -3.3, 24, 50], [-14, -3.3, -10, 17]]) { S.g(x1, y1, x2, y2, C.brick, 1); S.g(x1 + (x1 < 0 ? 0 : 1.2), y1 + 1.2, x2 - (x1 < 0 ? 1.2 : 0), y2 - 1.2, C.grassD, 1); }
    S.dashH(20.5, -90, -3.3); S.dashH(20.5, 3.3, 90); S.dash(0, -30, 17); S.dash(0, 24, 300);
    for (const [x, y] of [[-8, 5], [8, 6], [-8, 36], [8, 38], [-10, 60], [10, 60]]) S.tree(x, y, .9);
    S.sign('3.1', -6.5, 16.2, 1.25, 2.6); S.sign('3.4', -4.6, 26.5, 1.25, 2.6);
    S.truck(-13, 18.8, 90, { cab: '#2f9fc4' });
    S.car(-1.65, 21.4, 180, '#e0643a');
    S.route([[-6.8, 18.8], [-2.2, 18.8]], .4);
    return P3.svg(S.render(), W, H);
  },

  /* 19. Ачаа буулгаж байгаа ачааны машин замын захад (баруун эгнээнд) зогссон. */
  q19() {
    const W = 800, H = 400, S = new P3.Scene(W, H, { cx: -.5, cy: -8, cz: 5.6, pitch: 15, oy: 4 }), C = P3.C;
    E3.base(S, { bx: 15 });
    E3.sidewalk(S, 3.6, 9.6); E3.sidewalk(S, -9.6, -3.6); E3.road(S, -3.6, 3.6); S.dash(0, -30, 300); S.ln(-3.4, -30, -3.4, 300, .14, C.line); S.ln(3.4, -30, 3.4, 300, .14, C.line);
    for (const x of [-3.6, 3.6]) S.g(x - .1, -30, x + .1, 300, C.curb, 2);
    S.fence(9.4, -10, 100); S.fence(-9.4, -10, 100);
    for (let y = 2; y < 70; y += 14) S.tree(-6.6, y, .8);
    S.truck(2.2, 14, 0, { open: true });
    S.person(1.4, 9.0, 0, '#d9392f'); S.person(2.9, 9.4, 0, '#2d3643');
    const barrel = (x, y) => S.box(x, y, 0, .7, .7, 1, '#b5834a'), crate = (x, y, w) => S.box(x, y, 0, w, w, w * .85, '#c79b5e');
    barrel(.2, 7.2); barrel(1.1, 6.4); crate(-.9, 8.0, .8); crate(.4, 8.4, .7);
    S.person(6.2, 22, 0, '#3b6ea8'); S.person(7.4, 25, 0, '#4a8a5a'); S.person(-6.4, 16, 180, '#b5483a');
    return P3.svg(S.render(), W, H);
  },
};
