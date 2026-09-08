// Renders the game's SOUND_SPECS offline, to real samples.
//
// The mock-AudioContext probe can read gain automation but cannot model what a
// high-Q bandpass actually does to a signal — and modal synthesis is nothing but
// high-Q bandpasses. So this mirrors the Web Audio graph in plain arithmetic:
// the same RBJ biquad coefficients Web Audio uses, the same envelope shape, the
// same mode/Q/level derivation. It reads MODES and SOUND_SPECS out of the page,
// so it renders what the game plays rather than a re-typed approximation.

const { JSDOM } = require('jsdom');
const fs = require('fs');

const RATE = 48000;

// Deterministic noise. The engine uses rnd(), but a test that measures
// levels needs the same numbers every run, so the renderer seeds its own.
let _seed = 12345;
function rnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return _seed / 0x7fffffff; }
function resetNoise() { _seed = 12345; }

// --- RBJ biquads, matching BiquadFilterNode ------------------------------
function biquad(type, f0, Q, rate = RATE) {
  const w0 = 2 * Math.PI * f0 / rate, c = Math.cos(w0), s = Math.sin(w0);
  const alpha = s / (2 * Q);
  let b0, b1, b2, a0, a1, a2;
  if (type === 'bandpass') { b0 = alpha; b1 = 0; b2 = -alpha; }
  else { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; }        // lowpass
  a0 = 1 + alpha; a1 = -2 * c; a2 = 1 - alpha;
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0, x1: 0, x2: 0, y1: 0, y2: 0 };
}
function step(f, x) {
  const y = f.b0 * x + f.b1 * f.x1 + f.b2 * f.x2 - f.a1 * f.y1 - f.a2 * f.y2;
  f.x2 = f.x1; f.x1 = x; f.y2 = f.y1; f.y1 = y;
  return y;
}

// --- the game's envelope() ------------------------------------------------
function envAt(t, when, peak, attack, hold, decay) {
  const p = Math.max(peak, 0.0002);
  if (t < when) return 0;
  const end = when + attack + hold + decay;
  if (t >= end) return 0;
  const u = t - when;
  if (u < attack) return 0.0001 * Math.pow(p / 0.0001, u / attack);
  if (u < attack + hold) return p;
  return p * Math.pow(0.0001 / p, (u - attack - hold) / decay);
}

function renderSpec(layers, MODES, seconds = 2.0, masterGain = 0.75) {
  resetNoise();
  const n = Math.floor(RATE * seconds);
  const out = new Float64Array(n);

  for (const L of layers) {
    const when = L.when || 0;

    if (L.kind === 'modal') {
      const ratios = MODES[L.modes] || MODES.plate;
      const exciteS = (L.exciteMs || 2.5) / 1000;
      const tilt = L.tilt ?? 0.5;

      // exciter: white noise through a lowpass, gated by a ~0.4ms burst envelope
      const burstLen = Math.ceil((exciteS + 0.005) * RATE);
      const burst = new Float64Array(burstLen);
      const bf = biquad('lowpass', Math.min(L.exciteFreq || 4000, RATE / 2 - 100), 0.707);
      for (let i = 0; i < burstLen; i++) {
        const t = i / RATE;
        let g;
        if (t < 0.0004) g = 0.0001 * Math.pow(1 / 0.0001, t / 0.0004);
        else if (t < exciteS) g = Math.pow(0.0001, (t - 0.0004) / (exciteS - 0.0004));
        else g = 0;
        burst[i] = step(bf, rnd() * 2 - 1) * g;
      }

      // Must match modal()'s compensation in index.html exactly.
      const comp = 1 / (0.052 * Math.sqrt(Math.max(L.decay, 0.01)));

      ratios.forEach((r, i) => {
        const f = L.base * r;
        if (f > 18000 || f > RATE / 2 - 100) return;
        const decay = L.decay * Math.pow(tilt, i);
        const Q = Math.min(1000, Math.max(1, Math.PI * f * decay));
        const level = L.peak * comp * Math.pow(0.82, i);
        const attack = 0.001, hold = decay * 0.75, dec = decay * 0.45;
        const total = attack + hold + dec;
        const filt = biquad('bandpass', f, Q);
        const len = Math.ceil(total * RATE);
        const start = Math.floor(when * RATE);
        for (let k = 0; k < len; k++) {
          const x = k < burstLen ? burst[k] : 0;
          const y = step(filt, x);
          const idx = start + k;
          if (idx < n) out[idx] += y * envAt(k / RATE, 0, level, attack, hold, dec);
        }
      });

      // the raw strike, audible on its own
      const clickDec = exciteS * 1.5, clickLevel = (L.peak || 0.4) * 0.80;
      const clen = Math.ceil((0.0006 + clickDec) * RATE), cstart = Math.floor(when * RATE);
      for (let k = 0; k < clen; k++) {
        const x = k < burstLen ? burst[k] : 0;
        const idx = cstart + k;
        if (idx < n) out[idx] += x * envAt(k / RATE, 0, clickLevel, 0.0005, 0, clickDec);
      }

    } else if (L.kind === 'noise') {
      const attack = L.attack ?? 0.004, hold = L.hold || 0, decay = L.decay ?? 0.2;
      const dur = attack + hold + decay;
      const len = Math.ceil(dur * RATE), start = Math.floor(when * RATE);
      const q = L.q ?? 1;
      let filt = biquad(L.type === 'bandpass' ? 'bandpass' : 'lowpass', Math.min(L.freq ?? 1200, RATE / 2 - 100), q);
      for (let k = 0; k < len; k++) {
        const t = k / RATE;
        if (L.freqTo != null) {
          const f = (L.freq ?? 1200) * Math.pow(Math.max(L.freqTo, 1) / (L.freq ?? 1200), t / dur);
          const nf = biquad(L.type === 'bandpass' ? 'bandpass' : 'lowpass', Math.min(Math.max(f, 20), RATE / 2 - 100), q);
          nf.x1 = filt.x1; nf.x2 = filt.x2; nf.y1 = filt.y1; nf.y2 = filt.y2;
          filt = nf;
        }
        const y = step(filt, rnd() * 2 - 1);
        const idx = start + k;
        if (idx < n) out[idx] += y * envAt(t, 0, L.peak ?? 0.2, attack, hold, decay);
      }

    } else { // tone
      const attack = L.attack ?? 0.004, hold = L.hold || 0, decay = L.decay ?? 0.2;
      const dur = attack + hold + decay;
      const len = Math.ceil(dur * RATE), start = Math.floor(when * RATE);
      let phase = 0;
      let lp = L.cutoff != null ? biquad('lowpass', Math.min(L.cutoff, RATE / 2 - 100), 0.7) : null;
      for (let k = 0; k < len; k++) {
        const t = k / RATE;
        const f = L.to != null ? L.freq * Math.pow(Math.max(L.to, 1) / L.freq, t / dur) : L.freq;
        phase += 2 * Math.PI * f / RATE;
        const ph = phase % (2 * Math.PI);
        let s = (L.type === 'square') ? (ph < Math.PI ? 1 : -1)
              : (L.type === 'sawtooth') ? (ph / Math.PI - 1)
              : (L.type === 'triangle') ? (2 / Math.PI) * Math.asin(Math.sin(ph))
              : Math.sin(ph);
        if (lp) s = step(lp, s);
        const idx = start + k;
        if (idx < n) out[idx] += s * envAt(t, 0, L.peak ?? 0.2, attack, hold, decay);
      }
    }
  }

  for (let i = 0; i < n; i++) out[i] *= masterGain;
  return out;
}

// Pull MODES and SOUND_SPECS straight out of the shipped page.
function loadSpecs(file) {
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/',
    beforeParse(w) { w.Image = class { set src(v) {} }; }
  });
  return new Promise(res => setTimeout(() => {
    const w = dom.window;
    res({
      MODES: JSON.parse(w.eval('JSON.stringify(MODES)')),
      SPECS: JSON.parse(w.eval('JSON.stringify(SOUND_SPECS)'))
    });
  }, 600));
}

module.exports = { renderSpec, loadSpecs, RATE, biquad, step, resetNoise };
