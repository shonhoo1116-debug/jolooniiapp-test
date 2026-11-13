'use strict';
// Түвшнүүд. rule = Монгол Улсын замын хөдөлгөөний дүрмийн заалтын дугаар, par = гурав дахь одонд хүрэх хугацаа (сек).

const LEVELS = [
  { name: 'Уулзвар нэвтрэх', rule: '15.9', par: 12, section: 'drive', signs: ['3.4', '3.1'],
    hint: 'Чи <b>зам тавь</b> тэмдэгтэй замаас гарч байна. Хөндлөн зам нь тэргүүлэх зам. Машинууд өнгөртөл хүлээгээд, чөлөөтэй болмогц уулзварыг нэвтэр. Дээд захад хүр.',
    win: 'Зам тавьж өгөөд, чөлөөтэй болсны дараа нэвтэрлээ. Туслах замаас яваа жолооч гол замын тээврийн хэрэгсэлд зам тавьж өгнө (дүрмийн 15.9).',
    init() {
      // эхнээсээ хоёр машин уулзварт ойртож байна: сохроор шууд гарвал мөргөлдөнө
      cars = [{ x: -110, y: 360, a: 0, vx: 230, vy: 0, color: '#e6b422' }, { x: 1000, y: 280, a: Math.PI, vx: -230, vy: 0, color: '#2aa198' }];
      L = { t: { e: 2.2, w: 3.4 } };
    },
    update(dt) {
      for (const k of ['e', 'w']) { L.t[k] -= dt; if (L.t[k] < 0) { spawnCross(k); L.t[k] = rnd(2.3, 4.2); } }
      moveCars(dt);
      for (const c of cars) if (carsHit(P, c)) return fail('Хөндлөн замын машинтай мөргөлдлөө! Тэр тэргүүлэх замтай тул түүнд зам тавьж өгөх ёстой байсан (дүрмийн 15.9).');
    },
    draw() { drawBase(true); zebraV(410, 440); yieldLine(450, 530, 452); postSign('3.4', 562, 505); postSign('3.1', 336, 196); }
  },
  { name: 'Явган хүнд зам тавих', rule: '16.1', par: 16, noCross: true, section: 'drive', signs: ['5.19.б', '1.18'],
    hint: 'Явган хүний гарц дээр хүн гарахад <b>зогсож зам тавь</b>. Тэд гарцаа дуусгатал гарцын өмнө хүлээ. Дараа нь үргэлжлүүл.',
    win: 'Явган хүнд зам тавьж өглөө. Зохицуулдаггүй гарцад хурдаа хасаж, гарч байгаа болон гарахаар завдаж байгаа явган хүнд зогсож зам тавина (дүрмийн 16.1).',
    init() { cars = []; L = { peds: [], made: 0, next: 1.2, y1: 270, y2: 340 }; },
    update(dt) {
      const l = L;
      if (l.made < 3 && l.peds.every(p => p.state === 'done') && (l.next -= dt) <= 0) {
        const dir = l.made % 2 ? -1 : 1;
        l.peds.push({ x: dir > 0 ? 338 : 562, y: rnd(l.y1 + 14, l.y2 - 14), dir, state: 'wait', w: rnd(.5, 1.2), col: ['#e0457b', '#3aa0ff', '#f2a33a'][l.made % 3] });
        l.made++; l.next = 0.8;
      }
      const front = P.y - ext(P), back = P.y + ext(P);
      for (const p of l.peds) {
        if (p.state === 'wait') {
          const past = back < l.y1 - 10, far = front > l.y2 + 200, stopped = Math.abs(P.v) < 15 && front >= l.y2 - 8;
          if ((past || far || stopped) && (p.w -= dt) <= 0) p.state = 'walk';
        } else if (p.state === 'walk') {
          p.x += p.dir * 80 * dt;
          if (p.x > 565 + 8 || p.x < 335 - 8) p.state = 'done';
        }
      }
      const onRoad = l.peds.some(p => p.state === 'walk' && p.x > ROAD_L + 2 && p.x < ROAD_R - 2);
      for (const p of l.peds) if (p.state === 'walk')
        for (const c of circlesOf(P)) if (Math.hypot(c.x - p.x, c.y - p.y) < c.r + 11) {
          p.state = 'down'; p.ang = Math.atan2(p.y - P.y, p.x - P.x); p.x += Math.cos(p.ang) * 22; p.y += Math.sin(p.ang) * 22;
          L.bloodHit = true;
          return fail('Явган хүнийг мөргөлөө! Гарц дээр хүн байхад зогсож зам тавих ёстой (дүрмийн 16.1).');
        }
      if (onRoad && front < l.y2 - 22 && back > l.y1) l.entered = true;
      if (l.entered && front < l.y1 - 5) return fail('Явган хүн гарцаар гарч байхад чи гарцад орлоо. Гарцын өмнө зогсож зам тавих ёстой (дүрмийн 16.1).');
    },
    draw() {
      drawBase(false); zebraV(L.y1, L.y2);
      postSign('5.19.б', 562, L.y2 + 44); postSign('1.18', 562, 510);
      for (const p of L.peds) {
        if (p.state === 'down') {
          ctx.fillStyle = '#8a0f0f';
          [[0, 0, 22, 14], [-14, 8, 12, 8], [16, -6, 10, 7], [6, 14, 8, 6]].forEach(([dx, dy, rx, ry]) => { ctx.beginPath(); ctx.ellipse(p.x + dx, p.y + dy, rx, ry, 0, 0, 7); ctx.fill(); });
          ctx.fillStyle = '#b01a1a'; ctx.beginPath(); ctx.ellipse(p.x + 2, p.y - 1, 15, 9, 0, 0, 7); ctx.fill();
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.ang + Math.PI / 2);
          ctx.fillStyle = p.col; ctx.beginPath(); ctx.ellipse(0, 6, 7, 13, 0, 0, 7); ctx.fill();
          ctx.fillStyle = '#3b2a20'; ctx.beginPath(); ctx.arc(0, -9, 6.5, 0, 7); ctx.fill();
          ctx.restore();
          continue;
        }
        if (p.state === 'done') continue;
        ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(p.x + 3, p.y + 4, 11, 8, 0, 0, 7); ctx.fill();
        ctx.fillStyle = p.col; ctx.beginPath(); ctx.ellipse(p.x, p.y, 7, 12, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#3b2a20'; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, 7); ctx.fill();
      }
    }
  },
  { name: 'Гэрлэн дохио', rule: '8.9', par: 16, section: 'drive', signs: ['1.7'],
    hint: '<b>Улаан</b> болон <b>шар</b> дохионд зогсоолын шугамын өмнө зогс (дүрэм 8.9, 8.18). Огцом тоормослохгүйгээр зогсох боломжгүй үед л шар дохионд үргэлжлүүлж болно (8.19). Ногоон болтол хүлээ.',
    win: 'Улаан, шар дохионд зогсоод, ногоон болсны дараа нэвтэрлээ (дүрмийн 8.9, 8.18).',
    init() {
      cars = [];
      L = { phases: [['red', 6], ['green', 5], ['yellow', 1.5]], pi: 0, pt: 0, light: 'red', t: { e: 0.2, w: 0.9 }, prevFront: 99999, line: 452, speed: 330 };
    },
    update(dt) {
      const l = L;
      l.pt += dt;
      const prevLight = l.light;
      if (l.pt >= l.phases[l.pi][1]) { l.pt = 0; l.pi = (l.pi + 1) % 3; }
      l.light = l.phases[l.pi][0];
      if (l.light === 'yellow' && prevLight !== 'yellow') {   // 8.19: огцом тоормослохгүйгээр зогсох боломжгүй бол үргэлжлүүлж болно
        const dist = (P.y - 35) - l.line;
        l.excuse = dist < P.v * P.v / 700;
      }
      if (l.light === 'red' && l.pt < 3) for (const k of ['e', 'w']) { l.t[k] -= dt; if (l.t[k] < 0) { spawnCross(k); l.t[k] = rnd(.9, 1.6); } }
      moveCars(dt);
      const front = P.y - 35;
      if (l.prevFront >= l.line && front < l.line) {
        if (l.light === 'red') return fail('Улаан дохионд гарлаа! Улаан дохио хөдөлгөөнийг хориглоно (дүрмийн 8.9г). Зогсоолын шугамын өмнө зогсох ёстой (8.18).');
        if (l.light === 'yellow' && !l.excuse) return fail('Шар дохионд шугамаас гарлаа! Шар дохио нэвтрэн орохыг хориглоно (8.9б). Зөвхөн огцом тоормослохгүйгээр зогсох боломжгүй үед л үргэлжлүүлнэ (8.19).');
      }
      l.prevFront = front;
      for (const c of cars) if (carsHit(P, c)) return fail('Хөндлөн замын машинтай мөргөлдлөө!');
    },
    draw() {
      drawBase(true); zebraV(410, 440);
      stopLine(450, 530, L.line); postSign('1.7', 562, 575, 42);
      const x = 560, y = 480;
      ctx.fillStyle = '#555'; ctx.fillRect(x - 2, y + 20, 4, 50);
      ctx.fillStyle = '#1b1b1b'; roundRect(x - 14, y - 44, 28, 68, 6); ctx.fill();
      [['red', '#ff3b30'], ['yellow', '#ffcc00'], ['green', '#34c759']].forEach(([n, col], i) => {
        const on = L.light === n;
        ctx.fillStyle = on ? col : '#333'; ctx.beginPath(); ctx.arc(x, y - 30 + i * 22, 8, 0, 7); ctx.fill();
        if (on) { ctx.fillStyle = col + '55'; ctx.beginPath(); ctx.arc(x, y - 30 + i * 22, 16, 0, 7); ctx.fill(); }
      });
    }
  },
  { name: 'Адил замын уулзвар', rule: '15.8', par: 12, section: 'drive', signs: ['1.5'],
    hint: 'Тэмдэггүй, <b>адил замын</b> уулзвар. <b>Баруун гар талаас</b> ирсэн тээврийн хэрэгсэлд зам тавь (дүрэм 15.8). Зүүн талаас ирсэн машин чамд зам тавина.',
    win: 'Адил замын уулзварт баруун гар талаас ирсэн тээврийн хэрэгсэлд зам тавьлаа (дүрмийн 15.8).',
    init() { cars = [{ x: 1000, y: 280, a: Math.PI, vx: -230, vy: 0, color: '#7a4bd6' }]; L = { t: 2.6, lc: null, lt: 0.3 }; },
    update(dt) {
      L.t -= dt;
      if (L.t < 0) { cars.push(mkVeh({ x: W + 70, y: 280, a: Math.PI, vx: -230, vy: 0, color: ['#e6b422', '#7a4bd6', '#2aa198'][Math.floor(rnd(0, 3))] })); L.t = rnd(2.4, 4.2); }
      if ((!L.lc || !cars.includes(L.lc)) && (L.lt -= dt) <= 0) { L.lc = { x: -60, y: 360, a: 0, vx: 200, vy: 0, color: '#d8402f' }; cars.push(L.lc); L.lt = 2; }
      if (L.lc && cars.includes(L.lc)) L.lc.vx = (L.lc.x < 325 || P.y + 35 < 330) ? 200 : 0;   // зүүн талын машин чамд зам тавина
      moveCars(dt);
      for (const c of cars) if (carsHit(P, c)) return fail(c === L.lc ? 'Мөргөлдлөө!' : 'Баруун гар талаас ирсэн машинтай мөргөлдлөө! Адил замын уулзварт баруун гар талаас ирсэн тээврийн хэрэгсэлд зам тавина (дүрмийн 15.8).');
    },
    draw() { drawBase(true); zebraV(410, 440); postSign('1.5', 562, 540); }
  },
  { name: 'Зүүн гар тийш эргэх', rule: '15.10', par: 14, section: 'drive', signs: [],
    hint: 'Уулзвараас <b>зүүн гар тийш</b> эргэж, зүүн талын 🏁 бүс рүү хүр. Эргэхдээ өөдөөс чигээрээ яваа тээврийн хэрэгсэлд зам тавь (дүрэм 15.10).',
    win: 'Зүүн гар тийш эргэхдээ өөдөөс яваа тээврийн хэрэгсэлд зам тавьлаа (дүрмийн 15.10).',
    finish: { x: 0, y: 250, w: 70, h: 140, label: '🏁' },
    init() { cars = [{ x: 410, y: 60, a: Math.PI / 2, vx: 0, vy: 230, color: '#2aa198' }]; L = { t: 2.4 }; },
    update(dt) {
      L.t -= dt;
      if (L.t < 0) { cars.push({ x: 410, y: -50, a: Math.PI / 2, vx: 0, vy: 230, color: ['#e6b422', '#7a4bd6', '#2aa198', '#cfd3d8'][Math.floor(rnd(0, 4))] }); L.t = rnd(2.2, 3.8); }
      moveCars(dt);
      for (const c of cars) if (carsHit(P, c)) return fail('Өөдөөс яваа машинтай мөргөлдлөө! Зүүн гар тийш эргэхдээ өөдөөс чигээрээ яваа тээврийн хэрэгсэлд зам тавина (дүрмийн 15.10).');
    },
    draw() { drawBase(true); zebraV(410, 440); }
  },
  { name: 'Дуут дохиотой машинд зам тавих', rule: '4.4', par: 14, noCross: true, section: 'drive', signs: [],
    hint: 'Ард талаас <b>дуут болон гэрэл дохиотой</b> түргэн тусламж ойртоно. Түүнд зам тавьж, <b>чөлөөтэй зорчих боломжийг олго</b> (дүрэм 4.4): замын хажуу тийш татаж зогс. Өнгөрсний дараа дуусгах бүс рүү яв.',
    win: 'Дуут болон гэрэл дохио ажиллуулсан тээврийн хэрэгсэлд зам тавьж өглөө (дүрмийн 4.4).',
    gate() { return L.passed; },
    init() { cars = []; L = { amb: null, passed: false, sir: 0 }; },
    update(dt) {
      if (!L.amb && P.y < 440) { L.amb = { x: 458, y: H + 380, a: -Math.PI / 2, vx: 0, vy: -300, color: '#f5f5f5', siren: true }; cars.push(L.amb); }
      if (L.amb && !L.passed) SFX.sirenLevel(Math.hypot(L.amb.x - P.x, L.amb.y - P.y), (L.amb.x - P.x) / 300); else SFX.sirenLevel(null);
      moveCars(dt);
      if (L.amb && L.amb.y < P.y - 90) L.passed = true;
      if (L.amb && !L.passed && Math.abs(L.amb.x - P.x) < 50 && Math.abs(L.amb.y - P.y) < 65)
        return fail('Дуут дохиотой тээврийн хэрэгсэлд зам тавиагүй! Тусгай дуут болон гэрэл дохио ажиллуулсан тээврийн хэрэгсэлд зам тавьж, чөлөөтэй зорчих боломжийг хангана (дүрмийн 4.4).');
    },
    draw() {
      drawBase(false);
      if (L.amb && !L.passed && Math.floor(performance.now() / 300) % 2) {
        ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center';
        ctx.fillStyle = '#ff5a4d'; ctx.fillText('🚨 Дуут дохио ойртож байна! Зам тавь!', 450, H - 24);
      }
    }
  },
  { name: 'Төмөр замын гарам', rule: '17.3', par: 14, noCross: true, section: 'drive', signs: ['1.1', '1.4.в'],
    hint: 'Гарамд <b>анивчсан улаан гэрэл</b> асаж, хаалт хаагдаж байхад гарам руу орохыг хориглоно (дүрэм 17.3). Хаалтын өмнө зогсоод, галт тэрэг өнгөрч, хаалт нээгдтэл хүлээ.',
    win: 'Анивчсан улаан гэрэл, хаалт хаалттай үед гарамд ороогүй, галт тэргийг өнгөрүүлсний дараа нэвтэрлээ (дүрмийн 17.1–17.3).',
    init() { cars = []; L = { phases: [['warn', 3], ['closed', 3.6], ['open', 5]], pi: 0, pt: 0, ph: 'warn', tx: -60, prevFront: 99999, line: 382 }; },
    update(dt) {
      const l = L; l.pt += dt;
      if (l.pt >= l.phases[l.pi][1]) { l.pt = 0; l.pi = (l.pi + 1) % 3; if (l.phases[l.pi][0] === 'closed') l.tx = -60; }
      l.ph = l.phases[l.pi][0];
      if (l.ph === 'closed') l.tx += 560 * dt;
      const front = P.y - 35;
      if (l.prevFront >= l.line && front < l.line && l.ph !== 'open') return fail('Гарам руу орохыг хориглосон үед орлоо! Анивчсан улаан гэрэл асаж, хаалт хаагдаж байхад гарам руу орохыг хориглоно (дүрмийн 17.3).');
      l.prevFront = front;
      if (l.ph === 'closed') for (let x = l.tx - 5 * 84; x <= l.tx; x += 30)
        for (const c of circlesOf(P)) if (Math.hypot(c.x - x, c.y - 310) < c.r + 18) return fail('Галт тэргэнд мөргүүллээ! Галт тэргийг урьдчилан өнгөрүүлнэ (дүрмийн 17.1).');
    },
    draw() {
      const l = L;
      drawBase(false);
      ctx.fillStyle = '#6b6258'; ctx.fillRect(0, 282, W, 56);
      ctx.fillStyle = '#4a3a2a'; for (let x = 0; x < W; x += 22) ctx.fillRect(x, 286, 10, 48);
      ctx.fillStyle = '#b9bec4'; ctx.fillRect(0, 294, W, 5); ctx.fillRect(0, 321, W, 5);
      const f = l.ph === 'closed' ? 1 : l.ph === 'warn' ? Math.min(1, l.pt / 1.5) : 0;
      const arm = (px, py, th) => {
        ctx.save(); ctx.translate(px, py); ctx.rotate(th);
        for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#d62d20'; ctx.fillRect(i * 10, -4, 10, 8); }
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.fill(); ctx.restore();
      };
      arm(536, 362, -Math.PI / 2 - f * Math.PI / 2);   // ойрын хаалт
      arm(364, 258, -Math.PI / 2 + f * Math.PI / 2);   // алсын хаалт
      const blink = l.ph !== 'open' && Math.floor(performance.now() / 280) % 2;
      ctx.fillStyle = '#555'; ctx.fillRect(560, 382, 4, 46);
      ctx.fillStyle = '#1b1b1b'; roundRect(544, 360, 36, 26, 5); ctx.fill();
      [552, 572].forEach((x, i) => { const on = l.ph !== 'open' && (i === 0) === !!blink;
        ctx.fillStyle = on ? '#ff3b30' : '#3a2020'; ctx.beginPath(); ctx.arc(x, 373, 8, 0, 7); ctx.fill(); });
      if (l.ph === 'closed') for (let i = 0; i < 5; i++) {
        const x = l.tx - i * 84;
        ctx.fillStyle = i === 0 ? '#c0392b' : '#59636e'; roundRect(x - 78, 292, 78, 36, 5); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(x - 70, 298, 62, 6);
      }
      stopLine(450, 530, l.line); postSign('1.1', 562, 430, 40); postSign('1.4.в', 566, 474, 40); postSign('1.1', 562, 545);
    }
  },
];
