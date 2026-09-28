// เพลงสนุกๆ แต่งเอง เล่นด้วย Web Audio API (ไม่ต้องมีไฟล์เสียง)
const N = (n) => 440 * Math.pow(2, (n - 69) / 12);
const M = { C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81, B5: 83, C6: 84, D6: 86 };
const melody = [
  ["C5", .5], ["E5", .5], ["G5", .5], ["E5", .5], ["A5", .5], ["G5", .5], ["E5", 1],
  ["F5", .5], ["A5", .5], ["C6", .5], ["A5", .5], ["G5", 1], [null, 1],
  ["G5", .5], ["B5", .5], ["D6", .5], ["B5", .5], ["C6", .5], ["B5", .5], ["G5", 1],
  ["E5", .5], ["G5", .5], ["E5", .5], ["D5", .5], ["C5", 1], [null, 1],
  ["A5", .5], ["A5", .5], ["C6", .5], ["A5", .5], ["G5", .5], ["E5", .5], ["G5", 1],
  ["F5", .5], ["F5", .5], ["A5", .5], ["F5", .5], ["E5", .5], ["D5", .5], ["E5", 1],
  ["D5", .5], ["E5", .5], ["G5", .5], ["A5", .5], ["B5", .5], ["C6", .5], ["D6", 1],
  ["C6", 1], ["G5", .5], ["E5", .5], ["C5", 1], [null, 1],
];
const roots = [48, 41, 43, 48, 45, 41, 43, 48]; // C F G C Am F G C
const LOOP = 32;

function buildEvents() {
  const ev = [];
  let t = 0;
  melody.forEach(([n, d]) => { if (n) ev.push([t, "lead", N(M[n]), d]); t += d; });
  roots.forEach((r, bar) => {
    for (let i = 0; i < 8; i++) ev.push([bar * 4 + i * .5, "bass", N(r + (i % 2 ? 12 : 0)), .45]);
    ev.push([bar * 4, "kick"], [bar * 4 + 2, "kick"], [bar * 4 + 2.5, "kick"]);
    ev.push([bar * 4 + 1, "snare"], [bar * 4 + 3, "snare"]);
    for (let i = 0; i < 8; i++) ev.push([bar * 4 + i * .5, "hat", i % 2 ? .5 : .9]);
  });
  return ev.sort((a, b) => a[0] - b[0]);
}

export function createMusic() {
  const ev = buildEvents();
  let ctx, master, noiseBuf, timer = null;
  let on = false, bpm = 132, loopStart = 0, loopN = 0, idx = 0;

  const lead = (freq, time, len) => {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = "square"; o.frequency.value = freq;
    o2.type = "sine"; o2.frequency.value = freq * 2;
    f.type = "lowpass"; f.frequency.value = 2600;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(.22, time + .01);
    g.gain.exponentialRampToValueAtTime(.0001, time + Math.min(len, .6) + .15);
    o.connect(f); o2.connect(f); f.connect(g).connect(master);
    [o, o2].forEach((x) => { x.start(time); x.stop(time + len + .3); });
  };
  const bass = (freq, time, len) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = freq;
    g.gain.setValueAtTime(.5, time);
    g.gain.exponentialRampToValueAtTime(.0001, time + len);
    o.connect(g).connect(master); o.start(time); o.stop(time + len + .05);
  };
  const kick = (time) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, time);
    o.frequency.exponentialRampToValueAtTime(40, time + .14);
    g.gain.setValueAtTime(.9, time);
    g.gain.exponentialRampToValueAtTime(.0001, time + .2);
    o.connect(g).connect(master); o.start(time); o.stop(time + .22);
  };
  const noise = (time, hp, vol, len) => {
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; f.type = "highpass"; f.frequency.value = hp;
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(.0001, time + len);
    src.connect(f).connect(g).connect(master); src.start(time); src.stop(time + len + .02);
  };
  const bell = (freq, time) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(.5, time + .005);
    g.gain.exponentialRampToValueAtTime(.0001, time + 1.2);
    o.connect(g).connect(master); o.start(time); o.stop(time + 1.25);
  };

  function schedule() {
    const spb = 60 / bpm, ahead = ctx.currentTime + .15;
    while (true) {
      if (idx >= ev.length) { idx = 0; loopN++; }
      const e = ev[idx];
      const time = loopStart + (loopN * LOOP + e[0]) * spb;
      if (time > ahead) break;
      if (e[1] === "lead") lead(e[2], time, e[3] * spb);
      else if (e[1] === "bass") bass(e[2], time, e[3] * spb);
      else if (e[1] === "kick") kick(time);
      else if (e[1] === "snare") noise(time, 1500, .45, .13);
      else if (e[1] === "hat") noise(time, 7500, .12 * e[2], .04);
      idx++;
    }
  }
  function restart(at) {
    clearInterval(timer);
    loopStart = at; loopN = 0; idx = 0;
    timer = setInterval(schedule, 25);
  }

  function start() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = .22;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp).connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * .5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    ctx.resume();
    if (!on) { on = true; restart(ctx.currentTime + .08); }
    return true;
  }
  function stop() {
    on = false; clearInterval(timer);
    if (ctx) ctx.suspend();
  }
  function celebrate() {
    if (!start()) return;
    const t0 = ctx.currentTime + .05;
    [72, 76, 79, 84, 88, 91].forEach((n, i) => bell(N(n), t0 + i * .08));
    bpm = 150;
    restart(t0 + .6);
  }
  return { start, stop, celebrate, isOn: () => on };
}
