// Renders the game's audio graph without a sound card.
//
// A mock AudioContext records every node, connection and AudioParam automation
// event. From that we reconstruct each voice's gain envelope over time and sum
// the ones that reach the master bus, which is what the output level actually is.
// Web Audio's destination hard-clips at 1.0, so anything above that is audible
// distortion — this is the check that used to fail.

class Param {
  constructor(v = 0) { this.value = v; this.events = []; }
  setValueAtTime(v, t) { this.events.push({ k: 'set', v, t }); return this; }
  linearRampToValueAtTime(v, t) { this.events.push({ k: 'lin', v, t }); return this; }
  exponentialRampToValueAtTime(v, t) { this.events.push({ k: 'exp', v, t }); return this; }
  setTargetAtTime(v, t) { this.events.push({ k: 'tgt', v, t }); return this; }
  cancelScheduledValues() { return this; }
  // Value at time t, following Web Audio's interpolation rules.
  at(t) {
    if (!this.events.length) return this.value;
    const ev = [...this.events].sort((a, b) => a.t - b.t);
    if (t < ev[0].t) return ev[0].k === 'set' ? this.value : this.value;
    let prev = { v: this.value, t: ev[0].t };
    for (const e of ev) {
      if (t >= e.t) { prev = e; continue; }
      const span = e.t - prev.t;
      if (span <= 0) return e.v;
      const r = (t - prev.t) / span;
      if (e.k === 'lin') return prev.v + (e.v - prev.v) * r;
      if (e.k === 'exp') {
        const a = Math.max(prev.v, 1e-6), b = Math.max(e.v, 1e-6);
        return a * Math.pow(b / a, r);
      }
      return prev.v;
    }
    return prev.v;
  }
}

class Node {
  constructor(ctx, kind) { this.ctx = ctx; this.kind = kind; this.outs = []; ctx.nodes.push(this); }
  connect(d) { this.outs.push(d); return d; }
  disconnect() { this.outs = []; }
}
class Osc extends Node {
  constructor(ctx) { super(ctx, 'osc'); this.frequency = new Param(440); this.detune = new Param(0); this.type = 'sine'; }
  start(t = 0) { this.started = t; this.ctx.starts++; }
  stop(t = 0) { this.stopped = t; this.ctx.stops++; }
}
class Src extends Node {
  constructor(ctx) { super(ctx, 'bufsrc'); this.playbackRate = new Param(1); this.loop = false; this.buffer = null; }
  start(t = 0) { this.started = t; this.ctx.starts++; }
  stop(t = 0) { this.stopped = t; this.ctx.stops++; }
}
class Gain extends Node { constructor(ctx) { super(ctx, 'gain'); this.gain = new Param(1); } }
class Filter extends Node {
  constructor(ctx) { super(ctx, 'filter'); this.frequency = new Param(350); this.Q = new Param(1); this.detune = new Param(0); this.type = 'lowpass'; }
}
class Comp extends Node {
  constructor(ctx) {
    super(ctx, 'compressor');
    for (const p of ['threshold', 'knee', 'ratio', 'attack', 'release']) this[p] = new Param(0);
  }
}
class Conv extends Node { constructor(ctx) { super(ctx, 'convolver'); this.buffer = null; } }

class MockAudioContext {
  constructor() {
    this.sampleRate = 48000; this.currentTime = 0; this.state = 'running';
    this.nodes = []; this.buffers = []; this.starts = 0; this.stops = 0;
    this.destination = new Node(this, 'destination');
  }
  resume() { this.state = 'running'; return Promise.resolve(); }
  createOscillator() { return new Osc(this); }
  createGain() { return new Gain(this); }
  createBiquadFilter() { return new Filter(this); }
  createBufferSource() { return new Src(this); }
  createConvolver() { return new Conv(this); }
  createDynamicsCompressor() { return new Comp(this); }
  createBuffer(ch, len, sr) {
    const b = {
      numberOfChannels: ch, length: len, sampleRate: sr, duration: len / sr,
      _d: Array.from({ length: ch }, () => new Float32Array(len)),
      getChannelData(i) { return this._d[i]; }
    };
    this.buffers.push(b);
    return b;
  }
}

// Does this node reach the destination, and through how much gain on the way?
function pathGain(node, dest, seen = new Set()) {
  if (node === dest) return 1;
  if (seen.has(node)) return 0;
  seen.add(node);
  let best = 0;
  for (const o of node.outs) {
    const g = pathGain(o, dest, new Set(seen));
    if (g > 0) best = Math.max(best, g * (o.kind === 'gain' ? o.gain.at(0) : 1));
  }
  return best;
}

// Does `src` reach `target` downstream?
function reaches(src, target, seen = new Set()) {
  if (src === target) return true;
  if (seen.has(src)) return false;
  seen.add(src);
  return src.outs.some(o => reaches(o, target, seen));
}

// Peak of the summed dry signal at the master bus input, sampled finely.
//
// A voice only contributes while its source is actually running: a GainNode reads
// 1.0 until its first scheduled event, so an envelope scheduled into the future
// would otherwise be counted at unity before its oscillator has even started.
function peakAt(ctx, master, from = 0, to = 2.0, step = 0.002) {
  const sources = ctx.nodes.filter(n => n.kind === 'osc' || n.kind === 'bufsrc');
  const voices = ctx.nodes
    .filter(n => n.kind === 'gain' && n.gain.events.length && n.outs.includes(master))
    .map(g => {
      const src = sources.find(s => reaches(s, g));
      return {
        node: g,
        start: src && src.started !== undefined ? src.started : from,
        stop: src && src.stopped !== undefined ? src.stopped : to
      };
    });
  let max = 0;
  for (let t = from; t <= to; t += step) {
    let sum = 0;
    for (const v of voices) {
      if (t < v.start || t > v.stop) continue;
      sum += Math.max(0, v.node.gain.at(t));
    }
    max = Math.max(max, sum);
  }
  // `master` may be the destination itself (a graph with no bus), which has no gain.
  return max * (master.gain ? (master.gain.at(0) || 1) : 1);
}

module.exports = { MockAudioContext, peakAt, pathGain };
