const { load, solveBoard } = require('./harness.js');
const path = require('path');
const target = process.argv[2] || path.join(__dirname, '..', '..', 'index.html');
const w = load(target); const doc = w.document;
let pass = 0, fail = 0;
const ok = (name, cond, detail='') => { (cond ? pass++ : fail++); console.log((cond?'  PASS  ':'  FAIL  ')+name+(detail?'   '+detail:'')); };

setTimeout(() => {
 // --- BUG-01 no unsolvable boards ---
 w.eval('gameState.mode="campaign"; gameState.difficulty="easy"; gameState.level=1;');
 let bad = 0;
 for (let i=0;i<400;i++){
   const nums = JSON.parse(w.eval('JSON.stringify(generatePuzzle().numbers.map(n=>n.value))'));
   if (JSON.parse(w.eval('JSON.stringify(findSolutions('+JSON.stringify(nums)+', TIERS.easy.ops))')).length===0) bad++;
 }
 ok('BUG-01  no unsolvable Easy boards in 400', bad===0, bad+' unsolvable');
 ok('BUG-01  every tier fallback is solvable by its own ops',
    ['easy','medium','hard'].every(t=>JSON.parse(w.eval('JSON.stringify(findSolutions(TIERS.'+t+'.fallback, TIERS.'+t+'.ops))')).length>0));

 // --- BUG-04/07  tier is single-sourced ---
 doc.getElementById('endlessBtn').click(); w.startGameWithClass('warrior');
 let agree = true;
 for (const [lvl,want] of [[1,'EASY'],[10,'EASY'],[11,'MEDIUM'],[20,'MEDIUM'],[21,'HARD'],[40,'HARD']]) {
   w.eval('gameState.level='+lvl+'; updateUI(); renderOperators();');
   const badge = doc.getElementById('difficulty').textContent;
   const keys = [...doc.querySelectorAll('.operator-btn')].filter(b=>!b.disabled).map(b=>b.textContent);
   const ops = JSON.parse(w.eval('JSON.stringify(getAllowedOps())'));
   if (badge!==want || keys.join('')!==ops.join('')) agree = false;
 }
 ok('BUG-04/07  badge, keypad and generator agree at every Endless tier', agree);
 ok('BUG-04  solvability lookahead is tier-aware',
    /findSolutions\(unused, getAllowedOps\(\)\)/.test(require('fs').readFileSync(target,'utf8')));

 // --- BUG-05  best streak ---
 doc.getElementById('endlessBtn').click(); w.startGameWithClass('warrior');
 w.eval('gameState.bestStreak=0; gameState.streak=0;');
 for (let i=0;i<3;i++){ w.eval('gameState.started=true; gameState.enemyCurrentHP=24;'); solveBoard(w); w.eval('submit();'); }
 ok('BUG-05  bestStreak records the streak achieved', w.eval('gameState.bestStreak')===3, 'got '+w.eval('gameState.bestStreak'));

 // --- BUG-06/08  sprite + card effects ---
 doc.getElementById('endlessBtn').click(); w.startGameWithClass('rogue');
 ok('BUG-06  number cards carry ids', [...doc.querySelectorAll('.number-card')].every(c=>/^number-\d$/.test(c.id)));
 w.eval('gameState.currentEnemy=ENEMIES.find(e=>e.name==="Frost Golem"); spawnEnemy(true);');
 ok('BUG-08  --enemy-filter reaches the arena sprite',
    doc.getElementById('monsterSprite').style.getPropertyValue('--enemy-filter').includes('hue-rotate'));

 // --- BUG-09  preload scope ---
 const src = require('fs').readFileSync(target,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,''); // strip comments: assert on code, not prose
 ok('BUG-09  preloader skips hidden enemies', /ENEMIES\.filter\(e => !e\.hidden && e\.url\)/.test(src));
 ok('BUG-09  preloader defers via idle callback', /requestIdleCallback/.test(src));

 // --- BUG-10/14  CSS ---
 ok('BUG-10  reduced motion keeps sprite frames cycling', /\.monster-sprite \{\s*animation-duration: 1\.6s/.test(src));
 ok('BUG-14  only one @keyframes floatUp', (src.match(/@keyframes floatUp/g)||[]).length===1);

 // --- BUG-11  dead flows gone ---
 ok('BUG-11  successModal and failModal removed', !doc.getElementById('successModal') && !doc.getElementById('failModal'));
 ok('BUG-11  glHit/glBlock/glDeath removed', !w.glHit && !w.glBlock && !w.glDeath && typeof w.glWalk==='function');

 // --- BUG-02/03/12  lifecycle ---
 doc.getElementById('campaignBtn').click(); w.selectDifficulty('easy'); w.startGameWithClass('wizard');
 const N = w.eval('CAMPAIGN_PUZZLES.easy.length'); let g=0;
 while (w.eval('gameState.solvedPuzzles.easy.length')<N && g++<200) w.eval('gameState.started=true; markPuzzleSolved(); loadPuzzle();');
 ok('BUG-03  timer stopped behind the completion modal', w.eval('timerInterval')===null);
 ok('BUG-02  no duplicate solved indices',
    w.eval('gameState.solvedPuzzles.easy.length')===w.eval('new Set(gameState.solvedPuzzles.easy).size'));
 ok('BUG-11  campaign completion sets off the celebration', doc.querySelectorAll('.firework-particle').length>0);
 doc.getElementById('completeBtn').click();
 doc.getElementById('campaignBtn').click(); w.selectDifficulty('easy'); w.startGameWithClass('wizard');
 ok('BUG-02  completed difficulty is replayable',
    !doc.getElementById('completeModal').classList.contains('active') && doc.querySelectorAll('.number-card').length===4);
 w.eval('gameState.skillCooldown=true; skillCooldownTimer=setTimeout(()=>{},9000); gameOver();');
 ok('BUG-12  endRun clears skill cooldown state',
    w.eval('gameState.skillCooldown')===false && w.eval('skillCooldownTimer')===null);

 // --- BUG-13  timer ---
 ok('BUG-13  countdown is deadline-anchored', /timerDeadline = Date\.now\(\)/.test(src));
 ok('BUG-13  pauses on tab hide', /visibilitychange/.test(src) && /function pauseTimer/.test(src));

 // --- X2 keyboard ---
 doc.getElementById('timeoutModal').classList.remove('active');
 doc.getElementById('endlessBtn').click(); w.startGameWithClass('warrior');
 w.eval('gameState.started=true; currentNumbers=[{value:9,used:false},{value:9,used:false},{value:8,used:false},{value:2,used:false}]; renderNumbers(); clearAll();');
 const key = k => doc.dispatchEvent(new w.KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));
 const expr = () => [...doc.querySelectorAll('.expression-token')].map(t=>t.textContent).join('');
 key('1'); key('+'); key('2');
 ok('X2  digits and operators build the equation', expr()==='9+9', 'got "'+expr()+'"');
 key('Backspace'); ok('X2  Backspace undoes one step', expr()==='9+');
 key('Escape');    ok('X2  Escape clears', expr()==='');
 ok('X2  Undo and Clear buttons exist', !!doc.getElementById('undoBtn') && !!doc.getElementById('clearBtn'));

 // --- X1 auto-submit ---
 w.eval('clearAll(); selectNumber(0);selectOperator("+");selectNumber(1);selectOperator("+");selectNumber(2);selectOperator("+");selectNumber(3);');
 const pending = w.eval('autoSubmitTimer') !== null;
 const sweeping = doc.getElementById('submitSweep').classList.contains('running');
 w.eval('undoLastMove();');
 ok('X1  auto-submit is delayed, visible and cancellable',
    pending && sweeping && w.eval('autoSubmitTimer')===null && w.eval('AUTO_SUBMIT_MS')>=1000);

 // --- U2 selected state ---
 w.eval('clearAll(); selectNumber(0);');
 ok('U2  a card in the equation renders selected, not used',
    doc.getElementById('number-0').classList.contains('selected') && !doc.getElementById('number-0').classList.contains('used'));

 // --- X3/X4 a11y ---
 w.eval('showModeSelect();');
 const m = doc.getElementById('modeModal');
 ok('X3  modals are dialogs with focus management',
    m.getAttribute('role')==='dialog' && m.getAttribute('aria-modal')==='true' && doc.querySelector('.game-container').inert===true);
 ok('X4  live regions present',
    !!doc.getElementById('liveStatus') && !!doc.getElementById('liveAlert'));

 // --- X6 skill button ---
 doc.getElementById('endlessBtn').click(); w.startGameWithClass('rogue');
 w.eval('gameState.skillUses.level=3; updateUI();');
 ok('X6  skill button shows state and disables', doc.getElementById('skillBtn').disabled && /0 left/.test(doc.getElementById('skillBtn').textContent));

 // --- X8 practice ---
 w.eval('resetGame();'); doc.getElementById('practiceBtn').click(); w.startGameWithClass('warrior');
 w.useSkill();
 ok('X8  Practice gives free unlimited hints', doc.getElementById('hint').classList.contains('visible'));

 // --- X9 run summary ---
 ok('X9  run summary fields present',
    ['runLevel','runSolved','runAccuracy','runStreak','runAnswer','againBtn'].every(id=>!!doc.getElementById(id)));

 // --- U1/U3/U8 layout ---
 ok('U1  phone block no longer catches short laptops', /@media \(max-width: 480px\) \{/.test(src) && !/max-width: 480px\), \(max-height: 850px/.test(src));
 ok('U3  vertical scroll fallback', /overflow-y: auto/.test(src));
 ok('U4  no fixed background attachment', !/no-repeat fixed/.test(src));
 ok('U8  time bar has readout and drain states', !!doc.getElementById('progressLabel') && /time-critical/.test(src));
 ok('X5  running total is labelled left-to-right', /running total, left to right/.test(src));

 console.log('\n  '+pass+' passed, '+fail+' failed');
 process.exit(fail ? 1 : 0);
}, 800);
