// Audio assertions. Runs the real playSound() against a mock AudioContext that
// records the graph, then reconstructs the output level from the automation.
//
// Every one of these pins a defect that shipped: sounds that summed past the
// destination's 1.0 hard clip, envelopes that jumped from silence to full
// amplitude in a single sample, a noise buffer allocated on every card tap, and
// a death sound that had never once played.

const { JSDOM } = require('jsdom');
const { MockAudioContext, peakAt } = require('./audio-probe.js');
const { renderSpec, loadSpecs, RATE } = require('./audio-render.js');
const fs = require('fs');
const path = require('path');

const target = process.argv[2] || path.join(__dirname, '..', '..', 'index.html');
const dom = new JSDOM(fs.readFileSync(target, 'utf8'), {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/',
  beforeParse(w) {
    w.Image = class { set src(v) {} };
    w.AudioContext = MockAudioContext;
    w.webkitAudioContext = MockAudioContext;
  }
});
const w = dom.window;

let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => { cond ? pass++ : fail++; console.log((cond ? '  PASS  ' : '  FAIL  ') + name + (detail ? '   ' + detail : '')); };

// Every type any call site passes to playSound().
const TYPES = ['select', 'operator', 'progress', 'blocked', 'correct', 'wrong',
               'critical', 'magic', 'shield', 'coin', 'monster_die', 'hint'];

// Combinations the game genuinely fires at once.
const SEQUENCES = {
  'card tap, still solvable': ['select', 'progress'],
  'card tap, dead end':       ['select', 'blocked'],
  'solve as Warrior on boss': ['correct', 'critical'],
  'solve as Rogue':           ['correct', 'coin'],
  'solve as Wizard, division':['correct', 'magic'],
  'wrong answer as Paladin':  ['wrong', 'shield'],
  'kill plus time gain':      ['monster_die', 'coin']
};

function render(list) {
  w.eval('audioCtx = null; masterBus = null;');
  for (const s of list) w.eval(`playSound(${JSON.stringify(s)});`);
  const ctx = w.eval('audioCtx');
  // Fall back to the destination so this suite can also be pointed at a build
  // that has no master bus — which is exactly the shape these checks catch.
  return { ctx, master: w.eval('masterBus') || (ctx && ctx.destination) };
}

setTimeout(async () => {
  // 1. Levels, measured on real samples. A gain-automation probe cannot see what
  //    a high-Q bandpass does to a signal, and these effects are built from them.
  const { MODES, SPECS } = await loadSpecs(target);
  const pk = s => { let p = 0; for (let i = 0; i < s.length; i++) p = Math.max(p, Math.abs(s[i])); return p; };

  let worstName = '', worst = 0;
  for (const t of TYPES) {
    const p = pk(renderSpec(SPECS[t], MODES));
    if (p > worst) { worst = p; worstName = t; }
  }
  ok('AUDIO  no single effect clips', worst <= 1, `worst: ${worstName} at ${worst.toFixed(2)}`);

  let seqWorst = 0, seqName = '';
  for (const [label, list] of Object.entries(SEQUENCES)) {
    const p = pk(renderSpec(list.flatMap(k => SPECS[k]), MODES));
    if (p > seqWorst) { seqWorst = p; seqName = label; }
  }
  ok('AUDIO  no overlapping sequence clips', seqWorst <= 1, `worst: ${seqName} at ${seqWorst.toFixed(2)}`);

  // 2. Character. An impact is its transient, and struck objects are inharmonic —
  //    an integer series is a musical tone, which is what "toy" sounds like.
  const impacts = ['correct', 'wrong', 'critical', 'shield', 'select'];
  const slow = impacts.filter(k => {
    const s = renderSpec(SPECS[k], MODES);
    let peak = 0, at = 0;
    for (let i = 0; i < s.length; i++) { const a = Math.abs(s[i]); if (a > peak) { peak = a; at = i; } }
    let from = 0;
    for (let i = 0; i < s.length; i++) if (Math.abs(s[i]) >= peak * 0.1) { from = i; break; }
    return (at - from) / RATE * 1000 > 6;      // reference glass break: 2.8ms
  });
  ok('AUDIO  impact transients are fast', slow.length === 0, slow.join(', '));

  const harmonic = Object.entries(SPECS).filter(([, layers]) =>
    layers.some(l => l.kind === 'modal' &&
      (MODES[l.modes] || []).slice(1).every(r => Math.abs(r - Math.round(r)) < 0.08)));
  ok('AUDIO  every mode bank is inharmonic', harmonic.length === 0, harmonic.map(h => h[0]).join(', '));

  ok('AUDIO  impacts are modal, not bare oscillator sweeps',
     impacts.every(k => SPECS[k].some(l => l.kind === 'modal')));

  // 2. Every type a call site uses must actually make a sound.
  const silent = TYPES.filter(t => render([t]).ctx.nodes.filter(n => n.kind === 'osc' || n.kind === 'bufsrc').length === 0);
  ok('AUDIO  every sound the game asks for is implemented', silent.length === 0, silent.join(', '));

  const src = fs.readFileSync(target, 'utf8');
  const asked = [...new Set([
    ...[...src.matchAll(/playSound\('([a-z_]+)'\)/g)].map(m => m[1]),
    ...[...src.matchAll(/playSound\([^)]*\? '([a-z_]+)' : '([a-z_]+)'\)/g)].flatMap(m => [m[1], m[2]])
  ])];
  // playSound is a table lookup now, so coverage means "present in SOUND_SPECS".
  // 'defeat' is an accepted alias for monster_die.
  const handled = new Set([...Object.keys(SPECS), 'defeat']);
  const missing = asked.filter(t => !handled.has(t));
  ok('AUDIO  no call site names a sound with no spec', missing.length === 0, missing.join(', '));

  // 3. Envelope hygiene: no instant onsets, no source left ringing, none leaked.
  const { ctx } = render(TYPES);
  const envs = ctx.nodes.filter(n => n.kind === 'gain' && n.gain.events.length);
  const clicky = envs.filter(g => [...g.gain.events].sort((a, b) => a.t - b.t)[0].v > 0.01);
  ok('AUDIO  no envelope starts at full amplitude (click onsets)', clicky.length === 0, `${clicky.length} of ${envs.length}`);
  const ringing = envs.filter(g => [...g.gain.events].sort((a, b) => a.t - b.t).pop().v > 0.001);
  ok('AUDIO  every envelope decays to silence before its source stops', ringing.length === 0, `${ringing.length} of ${envs.length}`);
  ok('AUDIO  every source is stopped', ctx.starts === ctx.stops, `${ctx.starts} started, ${ctx.stops} stopped`);

  // 4. Buffers are built once, not per call.
  const fresh = render(['select']);
  const beforeCount = fresh.ctx.buffers.length;
  for (let i = 0; i < 30; i++) { w.eval("playSound('correct');"); w.eval("playSound('monster_die');"); }
  const grew = w.eval('audioCtx').buffers.length - beforeCount;
  ok('AUDIO  no buffer allocated per sound', grew === 0, `${grew} allocated over 60 plays`);

  // 5. The bus exists and protects the output.
  const g = render(['correct']);
  const comp = g.ctx.nodes.find(n => n.kind === 'compressor');
  ok('AUDIO  a limiter sits between the mix and the destination',
     !!comp && comp.ratio.value >= 8 && comp.attack.value <= 0.01);
  ok('AUDIO  reverb send is wired with a generated impulse response',
     !!g.ctx.nodes.find(n => n.kind === 'convolver' && n.buffer && n.buffer.length > 0));

  // 6. The progress cue must not reuse the resolution cue.
  ok('AUDIO  card-tap feedback is distinct from the solve/fail sounds',
     /playSound\(isSolvable \? 'progress' : 'blocked'\)/.test(src));

  console.log('\n  ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}, 700);
