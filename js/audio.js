'use strict';
// Дууны систем. Бодит бичлэг (CC0, js/audio-data.js) байвал түүнийг, үгүй бол Web Audio-оор нийлүүлсэн дууг ашиглана.
// Хэрэглэх: SFX.unlock() (анхны товшилтоор), SFX.play('crash'|'win'|'fail'|'tick'|'star'|'thud'|'light'|'horn'|'siren'),
// SFX.drive(...) (кадр бүр), SFX.music(true, 'music1'|'music2'), SFX.ambient('rain'|'traffic'|null).

const SFX = (() => {
  let ac = null, out = null, sfxBus = null, musBus = null, engBus = null, comp = null, ambBus = null;
  let enabled = true, musicOn = true, musicLevel = 1, wantTrack = 'music1';
  let eng = null, skid = null, wind = null, sirenNode = null, noiseBuf = null, ambNodes = {}, musicNode = null;
  let musicTimer = 0, nextBar = 0, barIdx = 0, loading = null, ready = false;
  const BUF = {};

  const A = () => ac && ac.state !== 'closed';
  const clamp01 = v => Math.max(0, Math.min(1, v));

  // ---------- бодит дууг ачаалах ----------
  function loadSamples() {
    if (typeof AUDIO_B64 === 'undefined') { ready = true; return null; }
    if (loading) return loading;
    const dec = (buf) => new Promise((res, rej) => { const p = ac.decodeAudioData(buf, res, rej); if (p && p.then) p.then(res, rej); });
    loading = Promise.all(Object.entries(AUDIO_B64).map(async ([k, uri]) => {
      try {
        const bin = atob(uri.split(',')[1]), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        BUF[k] = await dec(u8.buffer);
      } catch (e) { /* энэ дууг алгасаж, нийлүүлсэн дууг ашиглана */ }
    })).then(() => { ready = true; if (musicOn && enabled && ac && !musicNode) startMusic(); });
    return loading;
  }
  const playBuf = (name, t, vol = 1, rate = 1, bus = null, loop = false) => {
    const b = BUF[name]; if (!b) return null;
    const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = b; s.loop = loop; s.playbackRate.value = rate; g.gain.value = vol; s.connect(g); g.connect(bus || sfxBus); s.start(t); return { s, g };
  };

  function unlock() {
    if (!ac) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return false;
      ac = new C();
      comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .2;
      out = ac.createGain(); out.gain.value = enabled ? .9 : 0; comp.connect(out); out.connect(ac.destination);
      sfxBus = ac.createGain(); sfxBus.gain.value = .9; sfxBus.connect(comp);
      engBus = ac.createGain(); engBus.gain.value = .7; engBus.connect(comp);
      musBus = ac.createGain(); musBus.gain.value = .3 * musicLevel; musBus.connect(comp);
      ambBus = ac.createGain(); ambBus.gain.value = .5; ambBus.connect(comp);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = noiseBuf.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = .99765 * b0 + w * .099046; b1 = .963 * b1 + w * .2965164; b2 = .57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * .1848) * .2; }
      loadSamples();
    }
    if (ac.state === 'suspended') ac.resume();
    return true;
  }
  const noise = (loop = true) => { const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = loop; return s; };
  const env = (g, t, a, peak, d) => { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); };

  // ---------- нэг удаагийн дуунууд ----------
  function tone(freq, t, dur, type = 'sine', vol = .3, bus = sfxBus, slide = 0) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    env(g, t, .006, vol, dur); o.connect(g); g.connect(bus || sfxBus); o.start(t); o.stop(t + dur + .05);
  }
  const SOUNDS = {
    tick: t => BUF.click ? playBuf('click', t, .6) : tone(660, t, .06, 'triangle', .12),
    click: t => BUF.click ? playBuf('click', t, .6) : tone(880, t, .04, 'triangle', .1),
    star: t => BUF.ding ? playBuf('ding', t, .8) : (tone(988, t, .3, 'triangle', .22), tone(1480, t + .03, .35, 'sine', .08)),
    win: t => BUF.chimes ? playBuf('chimes', t, .85) : [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => { tone(f, t + i * .11, .45, 'triangle', .22); tone(f * 2, t + i * .11, .3, 'sine', .05); }),
    fail: t => BUF.negative ? playBuf('negative', t, .8) : [392, 349.23, 293.66, 220].forEach((f, i) => tone(f, t + i * .14, .4, 'sawtooth', .1, sfxBus, .96)),
    light: t => tone(1200, t, .03, 'square', .035),
    thud: t => BUF.negative ? playBuf('negative', t, .55, 1.1) : tone(80, t, .22, 'sine', .45, sfxBus, .5),
    horn: t => {
      if (BUF.horn) return playBuf('horn', t, .9);
      [392, 494].forEach(f => { const o = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = 1600; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16, t + .02); g.gain.setValueAtTime(.16, t + .32); g.gain.exponentialRampToValueAtTime(.0001, t + .42); o.connect(fl); fl.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .5); });
    },
    crash: t => {
      if (BUF.crash) { playBuf('crash', t, 1); tone(70, t, .6, 'sine', .55, sfxBus, .4); return; }
      const n = noise(false), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'lowpass'; f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(180, t + .6);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.9, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .7); n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t, Math.random()); n.stop(t + .8);
      tone(95, t, .5, 'sine', .7, sfxBus, .35);
      [1900, 2700, 3400].forEach((fr, i) => tone(fr * (.9 + Math.random() * .2), t + .02 + i * .025, .18, 'square', .045, sfxBus, .8));
    },
  };
  function play(kind) {
    if (!enabled || !unlock() || !A()) return;
    const f = SOUNDS[kind]; if (f) f(ac.currentTime + .005);
    if (kind === 'siren' && !BUF.siren) sirenPulse();
  }
  function sirenPulse() {
    const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(650, t); o.frequency.linearRampToValueAtTime(1000, t + .38); o.frequency.linearRampToValueAtTime(650, t + .76);
    f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = .7;
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.09, t + .05); g.gain.setValueAtTime(.09, t + .6); g.gain.linearRampToValueAtTime(.0001, t + .78);
    o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .8);
  }

  // ---------- жолоодлогын тасралтгүй дуунууд ----------
  function makeEngine() {
    if (BUF.engine) {   // бодит хөдөлгүүрийн давталт: хурдаар нь (playbackRate) өндөр нам болгоно
      const s = ac.createBufferSource(), g = ac.createGain(), lp = ac.createBiquadFilter(); s.buffer = BUF.engine; s.loop = true; s.playbackRate.value = .6; lp.type = 'lowpass'; lp.frequency.value = 1200; g.gain.value = 0;
      s.connect(lp); lp.connect(g); g.connect(engBus); s.start();
      return { real: true, s, g, lp, gear: 1, shift: 0, rpm: 900 };
    }
    const g = ac.createGain(); g.gain.value = 0;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; lp.Q.value = 1.2;
    const o1 = ac.createOscillator(); o1.type = 'sawtooth'; const o2 = ac.createOscillator(); o2.type = 'square'; const o3 = ac.createOscillator(); o3.type = 'triangle';
    const g1 = ac.createGain(), g2 = ac.createGain(), g3 = ac.createGain(); g1.gain.value = .5; g2.gain.value = .22; g3.gain.value = .4;
    o1.connect(g1); o2.connect(g2); o3.connect(g3); g1.connect(lp); g2.connect(lp); g3.connect(lp); lp.connect(g); g.connect(engBus);
    const nz = noise(), nf = ac.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 600; nf.Q.value = .6; const ng = ac.createGain(); ng.gain.value = 0; nz.connect(nf); nf.connect(ng); ng.connect(engBus);
    o1.start(); o2.start(); o3.start(); nz.start();
    return { g, lp, o1, o2, o3, nf, ng, gear: 1, shift: 0, rpm: 900 };
  }
  function makeLoopNoise(type, freq, q, bus) {
    const n = noise(), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.value = 0; n.connect(f); f.connect(g); g.connect(bus || sfxBus); n.start(); return { g, f };
  }
  const GEARS = [0, 22, 45, 72, 105, 400];
  // kmh: хурд, thr: 0..1 хурдлуулалт, brake: 0..1, steer: -1..1, onRoad: зам дээр үү
  function drive(kmh, thr = 0, brake = 0, steer = 0, onRoad = true) {
    if (!enabled || !unlock() || !A()) return;
    if (!ready) return;                       // бодит дуу ачаалагдаж дуустал хүлээнэ
    if (!eng) { eng = makeEngine(); skid = makeLoopNoise('bandpass', 2100, 9); wind = makeLoopNoise('highpass', 900, .5); }
    const t = ac.currentTime;
    let gi = 1; while (gi < GEARS.length - 1 && kmh > GEARS[gi]) gi++;
    if (gi !== eng.gear) { eng.gear = gi; eng.shift = .16; }
    eng.shift = Math.max(0, eng.shift - 1 / 60);
    const lo = GEARS[gi - 1], hi = GEARS[gi], k = clamp01((kmh - lo) / Math.max(1, hi - lo));
    const rpmT = 850 + k * (gi === 1 ? 2800 : 2600) + thr * 500 - eng.shift * 900;
    eng.rpm += (rpmT - eng.rpm) * .35;
    if (eng.real) {
      eng.s.playbackRate.setTargetAtTime(.55 + (eng.rpm - 800) / 3600 * 1.35, t, .04);          // 0.55x (сул) .. ~1.9x (өндөр эргэлт)
      eng.lp.frequency.setTargetAtTime(700 + eng.rpm * .5 + thr * 1500, t, .06);
      eng.g.gain.setTargetAtTime(.32 + thr * .42 + k * .08 - (eng.shift > 0 ? .1 : 0), t, .05);
    } else {
      const f0 = Math.max(18, eng.rpm / 60 * 2);
      eng.o1.frequency.setTargetAtTime(f0, t, .03); eng.o2.frequency.setTargetAtTime(f0 * 2, t, .03); eng.o3.frequency.setTargetAtTime(f0 * .5, t, .03);
      eng.lp.frequency.setTargetAtTime(300 + eng.rpm * .22 + thr * 700, t, .05);
      eng.g.gain.setTargetAtTime(.09 + thr * .1 + k * .035 - (eng.shift > 0 ? .04 : 0), t, .05);
      eng.nf.frequency.setTargetAtTime(500 + eng.rpm * .35, t, .08); eng.ng.gain.setTargetAtTime(.012 + thr * .03, t, .1);
    }
    const sq = clamp01((brake * clamp01((kmh - 25) / 45)) * 1 + Math.abs(steer) * clamp01((kmh - 55) / 40) * .55);
    skid.g.gain.setTargetAtTime(sq * .05, t, .04); skid.f.frequency.setTargetAtTime(1700 + kmh * 9, t, .1);
    wind.g.gain.setTargetAtTime(clamp01((kmh - 30) / 110) * .035 + (onRoad ? 0 : clamp01(kmh / 50) * .03), t, .15);
  }
  function driveOff() {
    if (!eng || !A()) return; const t = ac.currentTime;
    eng.g.gain.setTargetAtTime(0, t, .08); if (eng.ng) eng.ng.gain.setTargetAtTime(0, t, .08); skid.g.gain.setTargetAtTime(0, t, .05); wind.g.gain.setTargetAtTime(0, t, .1);
  }
  // дуут дохиотой машины тасралтгүй дуу (ойртох тусам чанга), pan: -1..1
  function sirenLevel(dist, pan = 0) {
    if (!enabled || !unlock() || !A()) return;
    if (dist == null) { if (sirenNode) sirenNode.g.gain.setTargetAtTime(0, ac.currentTime, .08); return; }
    if (!sirenNode) {
      const g = ac.createGain(), p = ac.createStereoPanner ? ac.createStereoPanner() : null; g.gain.value = 0;
      let src = null;
      if (BUF.siren) { src = ac.createBufferSource(); src.buffer = BUF.siren; src.loop = true; src.connect(g); src.start(); }
      else { const o = ac.createOscillator(), f = ac.createBiquadFilter(), lfo = ac.createOscillator(), lg = ac.createGain();
        o.type = 'sawtooth'; o.frequency.value = 850; lfo.frequency.value = .8; lg.gain.value = 230; lfo.connect(lg); lg.connect(o.frequency); f.type = 'bandpass'; f.frequency.value = 1300; f.Q.value = .8; o.connect(f); f.connect(g); o.start(); lfo.start(); }
      if (p) { g.connect(p); p.connect(sfxBus); } else g.connect(sfxBus); sirenNode = { g, p, real: !!BUF.siren };
    }
    sirenNode.g.gain.setTargetAtTime(clamp01(1.1 - dist / 1100) * (sirenNode.real ? .55 : .1), ac.currentTime, .1);
    if (sirenNode.p) sirenNode.p.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), ac.currentTime, .1);
  }

  // ---------- орчны дуу (бороо, хотын дуу) ----------
  function ambient(kind) {   // kind: 'rain' | 'traffic' | 'both' | null
    if (!enabled || !unlock() || !A()) return;
    const want = { rain: kind === 'rain' || kind === 'both', traffic: kind === 'traffic' || kind === 'both' };
    for (const name of ['rain', 'traffic']) {
      if (!BUF[name]) continue;
      if (want[name] && !ambNodes[name]) { const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = BUF[name]; s.loop = true; g.gain.value = 0; s.connect(g); g.connect(ambBus); s.start(); ambNodes[name] = { s, g }; }
      if (ambNodes[name]) ambNodes[name].g.gain.setTargetAtTime(want[name] ? (name === 'rain' ? .8 : .45) : 0, ac.currentTime, .6);
    }
  }

  // ---------- хөгжим ----------
  const CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
  const BASS = [45, 41, 36, 43];
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function scheduleBar(t, i) {
    const ch = CH[i % 4], beat = 60 / 84;
    ch.forEach(m => { const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = mtof(m); f.type = 'lowpass'; f.frequency.value = 900;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .5); g.gain.setValueAtTime(.12, t + beat * 3.4); g.gain.exponentialRampToValueAtTime(.0001, t + beat * 4.1); o.connect(f); f.connect(g); g.connect(musBus); o.start(t); o.stop(t + beat * 4.2); });
    tone(mtof(BASS[i % 4]), t, beat * 1.8, 'sine', .32, musBus); tone(mtof(BASS[i % 4]), t + beat * 2, beat * 1.6, 'sine', .22, musBus);
    const pat = [0, 1, 2, 1, 2, 1, 0, 1];
    for (let k = 0; k < 8; k++) tone(mtof(ch[pat[k]] + 12), t + k * beat / 2, beat * .9, 'sine', .11 + (k % 2 ? 0 : .04), musBus);
    tone(60, t, .18, 'sine', .3, musBus, .45); tone(60, t + beat * 2, .18, 'sine', .22, musBus, .45);
  }
  function musicTick() {
    if (!A() || !musicOn || !enabled) return;
    while (nextBar < ac.currentTime + .4) { scheduleBar(Math.max(nextBar, ac.currentTime + .02), barIdx++); nextBar += 60 / 84 * 4; }
  }
  function startMusic() {
    stopMusic();
    if (!ac || !musicOn || !enabled) return;
    if (BUF[wantTrack]) {
      const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = BUF[wantTrack]; s.loop = true; g.gain.value = 0; s.connect(g); g.connect(musBus); s.start();
      g.gain.setTargetAtTime(1, ac.currentTime, .6); musicNode = { s, g, name: wantTrack };
    } else { nextBar = ac.currentTime + .1; musicTimer = setInterval(musicTick, 120); }
  }
  function stopMusic() {
    clearInterval(musicTimer); musicTimer = 0;
    if (musicNode) { const m = musicNode; musicNode = null; try { m.g.gain.setTargetAtTime(0, ac.currentTime, .25); m.s.stop(ac.currentTime + 1.2); } catch (e) {} }
  }
  function music(on, track) {
    musicOn = on; if (track) wantTrack = track;
    if (!enabled || !unlock()) return;
    if (on) { if (!musicNode || (track && musicNode.name !== wantTrack)) startMusic(); musBus.gain.setTargetAtTime(.3 * musicLevel, ac.currentTime, .5); }
    else { stopMusic(); }
  }
  const musicDuck = level => { musicLevel = level; if (A()) musBus.gain.setTargetAtTime(musicOn ? .3 * level : 0, ac.currentTime, .4); };
  function setEnabled(v) {
    enabled = v; if (!A()) return;
    out.gain.setTargetAtTime(v ? .9 : 0, ac.currentTime, .05);
    if (!v) { driveOff(); sirenLevel(null); ambient(null); }
  }
  return { unlock, play, drive, driveOff, sirenLevel, ambient, music, musicDuck, setEnabled, isOn: () => enabled, ctx: () => ac, real: () => Object.keys(BUF) };
})();
