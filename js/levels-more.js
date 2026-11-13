'use strict';
// Нэмэлт жолоодлогын түвшнүүд: хурд (12), гүйцэж түрүүлэх (13), зөв газар зогсох (14).
// Заалтын эх сурвалж: Монгол Улсын замын хөдөлгөөний дүрэм (төсөл), source-rules\durem_text.txt

const TRUCK_RED = '#c0392b';

LEVELS.push(
  { name: 'Хурдны хязгаар', rule: '2.24 тэмдэг', par: 16, noCross: true, section: 'drive', limit: 40, coast: 22,
    signs: ['2.24@40', '2.25'],
    hint: '<b>2.24</b> тэмдгээр хурдны дээд хязгаар (<b>цагт 40 км</b>) тогтоосон хэсэгт радар хурд хэмжинэ. Тэмдгийн дараа хурдаа хас, хязгаараа хэтрүүлэхгүй яв. Хурдаа дээд талын хурд хэмжигчээс хар (хязгаар хэтэрвэл улаанаар анивчина). Тэмдгийн төгсгөл (2.25) хүртэл хязгаарыг барь. Зөвлөгөө: дээд талын <b>🔓 Хурд баригч</b> товчийг дарвал машин хурдаа хязгаараас бага (цагт 37 км) автоматаар барьж явна. ▼ дарвал унтарна, ▲ дарвал хурдаа өөрөө нэмнэ.',
    win: '2.24 «Хурдны дээд хязгаарлал» тэмдгийн хурдыг хэтрүүлээгүй (1-р хавсралтын 2.24, дүрмийн 12.1).',
    limitNow() { return (P.y < 565 && P.y > 120) ? 40 : null; },
    init() { cars = []; L = { cams: [{ y: 390, done: false }, { y: 200, done: false }], flash: 0 }; },
    update(dt) {
      L.flash = Math.max(0, L.flash - dt * 2);
      const front = P.y - 35;
      for (const c of L.cams) {
        if (!c.done && front < c.y) {
          c.done = true; L.flash = 1;
          if (kmh() > 43) return fail(`Хурдны хязгаарыг хэтрүүллээ! Радар ${Math.round(kmh())} км/ц гэж бүртгэв. 2.24 тэмдэг хурдыг тэмдэгт зааснаас хэтрүүлэхийг хориглоно, энд дээд хурд цагт 40 км (1-р хавсралтын 2.24).`);
        }
      }
    },
    draw() {
      drawBase(false);
      postSign('2.24@40', 562, 570); postSign('2.25', 562, 110);
      for (const c of L.cams) {   // замын захад зогсож буй радартай цагдаагийн машин
        drawCar(574, c.y, -Math.PI / 2, '#f4f6f8');
        ctx.fillStyle = '#2a62ff'; ctx.fillRect(570, c.y - 8, 8, 6); ctx.fillStyle = '#ff2a2a'; ctx.fillRect(570, c.y + 2, 8, 6);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'; ctx.fillText('РАДАР', 574, c.y + 54);
        if (c.done && L.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${L.flash * .55})`; ctx.beginPath(); ctx.arc(520, c.y, 60 + (1 - L.flash) * 70, 0, 7); ctx.fill(); }
      }
    }
  },

  { name: 'Гүйцэж түрүүлэх', rule: '13.2 · 2.20', par: 14, noCross: true, laneOk: true, section: 'drive',
    signs: ['2.20', '2.21'],
    hint: 'Урд удаан ачааны машин явна. <b>2.20</b> тэмдэг ба <b>тасралтгүй шугам</b> (1.1) байгаа хэсэгт гүйцэж түрүүлэхийг хориглоно: шугамыг давж болохгүй. <b>2.21</b> тэмдэг, тасархай шугам (1.5) эхэлсний дараа, өөдөөс яваа машинд аюул учруулахгүй бол гүйцэж болно (13.1, 13.2). Хүсвэл ачааны ард явж ч болно.',
    win: 'Хориглосон хэсэгт тасралтгүй шугамыг давалгүй, 2.21 тэмдгийн дараа аюулгүй нөхцөлд замаа үргэлжлүүллээ (дүрмийн 13.1, 13.2).',
    init() {
      cars = [];
      L = { t: 1.4, truck: { x: 490, y: 465, a: -Math.PI / 2, vx: 0, vy: -70, color: TRUCK_RED, truck: true, len: 100, w: 40 } };
      cars.push(L.truck);
    },
    update(dt) {
      L.t -= dt;
      if (L.t < 0) { cars.push({ x: 410, y: -50, a: Math.PI / 2, vx: 0, vy: 230, color: ['#e6b422', '#7a4bd6', '#2aa198', '#cfd3d8'][Math.floor(rnd(0, 4))] }); L.t = rnd(1.8, 3.2); }
      moveCars(dt);
      const leftEdge = P.x - (35 * Math.abs(Math.cos(P.a)) + 18 * Math.abs(Math.sin(P.a)));
      if (leftEdge < 448 && P.y > 430) return fail('Тасралтгүй шугамыг (1.1) давж, 2.20 «Гүйцэж түрүүлэх хориотой» тэмдгийн хэсэгт гүйцэх гэж оролдлоо! Энэ хэсэгт гүйцэж түрүүлэхийг хориглоно (1-р хавсралтын 2.20; 2-р хавсралтын 1.1, 1.4: 1.1 шугамыг давахыг хориглоно).');
      for (const c of cars) if (carsHit(P, c))
        return fail(c === L.truck ? 'Ачааны машинтай мөргөлдлөө!' : 'Өөдөөс яваа машинтай мөргөлдлөө! Гүйцэж түрүүлэхдээ өөдөөс яваа тээврийн хэрэгслийн хөдөлгөөнд аюул, саад учруулж болохгүй (дүрмийн 13.2а).');
    },
    draw() {
      drawBase(false);
      ctx.fillStyle = '#4a4d54'; ctx.fillRect(443, 430, 14, H - 430);          // тасархай шугамыг далдлаад
      ctx.fillStyle = '#f5f5f5'; ctx.fillRect(448, 430, 4, H - 430);            // 1.1 тасралтгүй шугам
      postSign('2.20', 562, 545); postSign('2.21', 562, 420);
    }
  },

  { name: 'Зөв газар зогсох', rule: '14.8', par: 22, noCross: true, section: 'drive',
    signs: ['5.17', '2.27'],
    finish: { x: 498, y: 70, w: 34, h: 100, label: '' },
    gate() { return L.stopT >= 2; },
    hint: 'Дээд талын <b>зогсоол «P»</b> (5.17) руу ороод <b>2 секунд зогс</b>. Замдаа зогсож болохгүй газар олон: <b>явган хүний гарц ба түүний өмнөх 5 м</b> (14.8б) болон <b>2.27 «Түр зогсох хориотой»</b> тэмдгийн хэсэг. Тэнд зогсвол алдана, зогсохгүй дайраад яв.',
    win: 'Зогсохыг хориглосон газарт зогсоогүй, зогсоолд (5.17) зөв зогслоо (дүрмийн 14.1, 14.8).',
    init() { cars = []; L = { still: 0, stopT: 0 }; },
    update(dt) {
      const slow = Math.abs(P.v) < 8;
      L.still = slow ? L.still + dt : 0;
      const inBay = P.x > 498 && P.y > 70 && P.y < 170;
      L.stopT = (slow && inBay) ? L.stopT + dt : 0;
      if (L.still > 1.3 && P.y > 360 && P.y < 538) return fail('Явган хүний гарц болон түүнээс 5 м-ээс ойр зайд зогслоо! Гарцын өмнө 5 м-ийн дотор түр зогсохыг хориглоно (дүрмийн 14.8б).');
      if (L.still > 1.3 && P.y > 165 && P.y < 380) return fail('2.27 «Түр зогсох хориотой» тэмдгийн хэсэгт зогслоо! (1-р хавсралтын 2.27, дүрмийн 14.8).');
    },
    draw() {
      drawBase(false);
      zebraV(395, 425);
      // 5 м-ийн хэмжээс (гарцын өмнө түр зогсохыг хориглох зай)
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(552, 425); ctx.lineTo(552, 503); ctx.moveTo(546, 425); ctx.lineTo(558, 425); ctx.moveTo(546, 503); ctx.lineTo(558, 503); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'left'; ctx.fillText('5 м', 562, 468);
      // 1.4 шар шугам: түр зогсохыг хориглосон хэсэг
      ctx.fillStyle = '#ffd21a'; ctx.fillRect(516, 200, 5, 145);
      // зогсоол (5.17)
      ctx.strokeStyle = '#f5f5f5'; ctx.lineWidth = 3; ctx.strokeRect(494, 70, 32, 100);
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = 'bold 34px system-ui'; ctx.textAlign = 'center'; ctx.fillText('P', 510, 130);
      postSign('2.27', 562, 355); postSign('5.17', 562, 195);
    }
  },

  { name: 'Олон эгнээтэй зам', rule: '11.5 · 10.4 · 11.7', par: 30, section: 'drive', laneOk: true, road: [290, 610], startX: 570,
    finish: { x: 450, y: 0, w: 160, h: 54, label: '🏁 ДУУСГАХ БҮС' }, signs: ['5.10.б', '5.1'],
    hint: 'Нэг чигт <b>хоёр эгнээтэй</b>, нийт дөрвөн эгнээтэй зам. Баруун эгнээнд удаан автобус, ачааны машин явна. Зүүн (дотор) эгнээнд орж гүйцээд, дахин баруун эгнээндээ буу. <b>Эгнээ солихын өмнө зэрэгцээ эгнээнд яваа машинд зам тавь</b> (10.4): араас ирж буй машиныг дэлгэцийн доод хэсгийн <b>улаан сумнаас</b> хар. <b>Эсрэг урсгалын эгнээнд орж болохгүй</b> (11.5): дунд хос шугамыг давж болохгүй.',
    win: 'Дөрвөн эгнээтэй замд эсрэг урсгалын эгнээнд ороогүй, эгнээ солихдоо зэрэгцээ эгнээний машинд зам тавьж, удаан машиныг аюулгүй гүйцэж түрүүллээ (дүрмийн 10.4, 11.5, 11.7).',
    init() {
      cars = [mkVeh({ x: 570, y: 400, a: -Math.PI / 2, vx: 0, vy: -55, color: '#1f9d55' }, 'bus'), mkVeh({ x: 570, y: 170, a: -Math.PI / 2, vx: 0, vy: -55, color: '#2b6cb0' }, 'truck'), mkVeh({ x: 490, y: 250, a: -Math.PI / 2, vx: 0, vy: -125, color: '#e6b422' }, 'car')];
      L = { tb: 3.2, to: 1, wrong: 0 };
    },
    update(dt) {
      L.tb -= dt; L.to -= dt;
      if (L.tb < 0) { cars.push(mkVeh({ x: 490, y: H + 40, a: -Math.PI / 2, vx: 0, vy: -125, color: ['#d8402f', '#7a4bd6', '#2aa198', '#cfd3d8'][Math.floor(rnd(0, 4))], z: 'b' }, 'car')); L.tb = rnd(5.5, 8); }
      if (L.to < 0) { cars.push(mkVeh({ x: Math.random() < .5 ? 330 : 410, y: -90, a: Math.PI / 2, vx: 0, vy: 140, color: ['#e6b422', '#7a4bd6', '#2aa198', '#cfd3d8'][Math.floor(rnd(0, 4))], z: 'o' })); L.to = rnd(2, 3.6); }
      moveCars(dt);
      L.wrong = (P.x < 444 && Math.abs(P.v) > 30) ? L.wrong + dt : Math.max(0, L.wrong - dt * 2);
      if (L.wrong > .5) return fail('Эсрэг урсгалын эгнээнд орлоо! Эсрэг хөдөлгөөнтэй дөрөв буюу түүнээс олон эгнээтэй замд эсрэг урсгал сөрөхийг хориглоно (дүрмийн 11.5). Дунд хос шугамыг давж болохгүй.');
      for (const c of cars) if (carsHit(P, c)) {
        if (c.z === 'o') return fail('Эсрэг урсгалын машинтай мөргөлдлөө! Эсрэг урсгал сөрөхийг хориглоно (дүрмийн 11.5).');
        if (c.z === 'b') return fail('Эгнээ солихдоо зэрэгцээ эгнээнд яваа машинд зам тавиагүй тул мөргөлдлөө! Байр эзлэхийн өмнө зэрэгцээ эгнээнд чигээрээ яваа тээврийн хэрэгсэлд зам тавина (дүрмийн 10.4).');
        return fail('Урд яваа тээврийн хэрэгсэлтэй мөргөлдлөө! Удаан машины ард аюулгүй зайтай яв, эсвэл зэрэгцээ эгнээнд зам тавиад (10.4) байр эзэлж гүйц.');
      }
    },
    draw() {
      ctx.fillStyle = '#3d7a37'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#c9b79a'; ctx.fillRect(276, 0, 348, H);
      ctx.fillStyle = '#4a4d54'; ctx.fillRect(290, 0, 320, H);
      ctx.strokeStyle = '#f1f1f1'; ctx.lineWidth = 4; ctx.beginPath();
      ctx.moveTo(297, 0); ctx.lineTo(297, H); ctx.moveTo(603, 0); ctx.lineTo(603, H);
      ctx.moveTo(447, 0); ctx.lineTo(447, H); ctx.moveTo(453, 0); ctx.lineTo(453, H); ctx.stroke();
      ctx.setLineDash([20, 60]); ctx.beginPath(); ctx.moveTo(370, 0); ctx.lineTo(370, H); ctx.moveTo(530, 0); ctx.lineTo(530, H); ctx.stroke(); ctx.setLineDash([]);
      [[80, 120], [190, 90], [700, 110], [810, 150], [90, 540], [200, 590], [710, 560], [820, 500]].forEach(([x, y]) => {
        ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.arc(x + 6, y + 8, 28, 0, 7); ctx.fill();
        ctx.fillStyle = '#2d6a2e'; ctx.beginPath(); ctx.arc(x, y, 28, 0, 7); ctx.fill();
        ctx.fillStyle = '#3f8c3b'; ctx.beginPath(); ctx.arc(x - 6, y - 6, 17, 0, 7); ctx.fill();
      });
      postSign('5.1', 640, 560, 40);
      // толь: араас ойртож буй машины анхааруулга (зэрэгцээ эгнээ)
      for (const c of cars) if (c.z === 'b' && c.y > P.y - 20 && c.y - P.y < 330) {
        const d = c.y - P.y, a = Math.max(.35, 1 - d / 330), y = Math.min(H - 24, Math.max(P.y + 40, c.y - 10));
        ctx.fillStyle = 'rgba(255,50,40,' + a + ')'; ctx.beginPath(); ctx.moveTo(490, y - 16); ctx.lineTo(474, y + 10); ctx.lineTo(506, y + 10); ctx.closePath(); ctx.fill();
      }
    }
  },

  // «Үргэлжилсэн маршрут»: дүрмийн бүлгүүдийн дарааллаар (4.4, 8.9, 2.24, 13.2, 14.8, 15.8, 15.9, 16.1, 17.3) 9 хэсэг нэг урт замд тасралтгүй,
  // камер машиныг дагана. Хэсэг бүр нь өмнөх нэг дэлгэцийн түвшний кодыг дэлхийн координатад (base) шилжүүлж ажиллуулна.
  { name: 'Үргэлжилсэн маршрут', rule: '4–17-р бүлэг', par: 170, section: 'drive', host: true, camera: true,
    order: [5, 2, 7, 8, 9, 3, 0, 1, 6], signs: [],
    hint: 'Нэг урт замаар явна, дэлгэц машиныг дагана. Замд дүрмийн нөхцөлүүд дараалан гарна: <b>дуут дохиотой машин</b> (4.4), <b>гэрлэн дохио</b> (8.9), <b>хурдны хязгаар + радар</b> (2.24), <b>гүйцэх</b> (13.2), <b>зогсоолд зогсох</b> (14.8), <b>адил замын уулзвар</b> (15.8), <b>зам тавих</b> (15.9), <b>явган хүний гарц</b> (16.1), <b>төмөр замын гарам</b> (17.3). Тэмдэг, шугамыг анхаарч яв. Хурдны хязгаартай хэсэгт дээд талын <b>Хурд баригч</b> товч туслана.',
    win: 'Дүрмийн бүлгүүдийн дарааллаар 9 нөхцөлийг (4.4, 8.9, 2.24, 13.2, 14.8, 15.8, 15.9, 16.1, 17.3) алдаагүй давлаа.',
    curH() { const hs = this.hosts; if (!hs) return null; const i = P.y >= 0 ? 0 : Math.min(hs.length - 1, Math.ceil(-P.y / 640)); return hs[i]; },
    get laneOk() { const h = this.curH(); return !!(h && h.lv.laneOk); },
    get coast() { const h = this.curH(); return h ? h.lv.coast : 0; },
    get limit() { const h = this.curH(); return h && h.active ? h.lv.limit : 0; },
    limitNow() {
      const h = this.curH(); if (!h || !h.active || !h.lv.limitNow) return null;
      const wy = P.y, oldL = L; L = h.L; P.y = wy - h.base; const r = h.lv.limitNow(); P.y = wy; L = oldL; return r;
    },
    gate() { return this.hosts.every(h => !h.lv.gate || h.done); },
    init() {
      const n = this.order.length;
      this.hosts = this.order.map((idx, i) => ({ lv: LEVELS[idx], base: -640 * i, L: null, cars: [], active: false, done: false }));
      this.camMax = 640 * (n - 1); this.worldY = [-640 * (n - 1) - 60, 615];
      this.finish = { x: 370, y: -640 * (n - 1), w: 160, h: 54, label: '🏁 ДУУСГАХ БҮС' };
      this.crossBands = this.hosts.filter(h => !h.lv.noCross).map(h => [h.base + 240, h.base + 400]);
      L = {}; cars = [];
    },
    update(dt) {
      const wy = P.y, out = [];
      for (const h of this.hosts) {
        const ahead = wy < h.base + 640 + 760, behind = wy < h.base - 640 - 350;
        if (!ahead || behind) continue;   // зөвхөн ойр хэсгүүд ажиллана: холын хэсэг ойртоход л эхэлнэ
        if (!h.active) { h.active = true; L = {}; cars = []; P.y = wy - h.base; h.lv.init(); P.y = wy; h.L = L; h.cars = cars; }
        L = h.L; cars = h.cars; P.y = wy - h.base;
        h.lv.update(dt);
        h.L = L; h.cars = cars;
        if (h.lv.gate && !h.done && h.lv.gate()) h.done = true;
        P.y = wy;
        if (mode !== 'play') break;
      }
      for (const h of this.hosts) if (h.active) for (const c of h.cars) out.push(Object.assign({}, c, { y: c.y + h.base }));
      cars = out; L = { bloodHit: this.hosts.some(h => h.L && h.L.bloodHit) };
    },
    draw() {
      const top = -camY;   // дэлгэцийн дээд ирмэгийн дэлхийн y
      for (const h of this.hosts) {
        if (h.base + 640 < top || h.base > top + H) continue;   // харагдахгүй хэсгийг зурахгүй
        ctx.save(); ctx.translate(0, h.base);
        if (h.active) { L = h.L; h.lv.draw(); } else drawBase(false);
        ctx.restore();
      }
      L = { bloodHit: this.hosts.some(h => h.L && h.L.bloodHit) };
    }
  }
);
