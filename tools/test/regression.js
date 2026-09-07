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
   // dataset.locked is the tier rule; .disabled also carries whose turn it is.
   const keys = [...doc.querySelectorAll('.operator-btn')].filter(b=>b.dataset.locked==='0').map(b=>b.textContent);
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

 // --- skills must survive the transitions that set started back to true ---
 doc.getElementById('endlessBtn').click(); w.startGameWithClass('wizard');
 w.eval('gameState.level=1; gameState.timer=60; updateUI();');
 const wizReady = !doc.getElementById('skillBtn').disabled;
 // exactly what nextLevel()'s timeout does: refresh while stopped, then start
 w.eval('setRunning(false); spawnEnemy(); loadPuzzle(); setRunning(true);');
 ok('SKILL  Clairvoyance still usable after a level transition',
    wizReady && !doc.getElementById('skillBtn').disabled);

 doc.getElementById('endlessBtn').click(); w.startGameWithClass('paladin');
 w.eval('gameState.level=5; gameState.timer=60; gameState.skillUses.boss=0; spawnEnemy(); setRunning(true); updateUI();');
 const smiteReadyAtSpawn = !doc.getElementById('skillBtn').disabled;
 // exactly what submit() does when a boss survives the hit
 w.eval('setRunning(false); clearAll(); loadPuzzle(); setRunning(true);');
 ok('SKILL  Smite still usable after a boss survives a hit',
    smiteReadyAtSpawn && !doc.getElementById('skillBtn').disabled);
 ok('SKILL  started is never assigned without refreshing the button',
    !/gameState\.started = (true|false)/.test(src.replace(/function setRunning\([\s\S]*?\n        \}/,'')));

 // --- the hint must not land on the equation panel ---
 ok('HINT  lives inside the arena, not the display column',
    doc.getElementById('hint').closest('.monster-area') !== null);
 ok('HINT  has an opaque background rather than a 10% wash',
    /\.hint-text \{[^}]*background: rgba\(12, 11, 20, 0\.97\)/.test(src));

 // --- layout stability: nothing may change the page's shape mid-puzzle ---
 w.eval('gameState.started=true; currentNumbers=[{value:13,used:false},{value:12,used:false},{value:11,used:false},{value:10,used:false}]; renderNumbers(); clearAll();');
 const shape = () => [...doc.getElementById('expression').children]
   .map(e => e.className.split(' ')[0]).join('|');
 const shapes = [];
 shapes.push(shape());
 w.eval('selectNumber(0);');                                   shapes.push(shape());
 w.eval('selectOperator("+");');                               shapes.push(shape());
 w.eval('selectNumber(1);');                                   shapes.push(shape());
 w.eval('selectOperator("−");selectNumber(2);');               shapes.push(shape());
 w.eval('selectOperator("+");selectNumber(3);');               shapes.push(shape());
 ok('SHIFT  the equation panel keeps the same rows at every step',
    new Set(shapes).size === 1, shapes[0]);
 ok('SHIFT  every panel row has a fixed height',
    /\.expression-formula \{[^}]*flex: 0 0/.test(src) && /\.expression-live-total \{[^}]*flex: 0 0/.test(src)
    && /\.expression-runlabel \{[^}]*flex: 0 0/.test(src) && /\.expression-cue \{[^}]*flex: 0 0/.test(src));
 ok('SHIFT  a long equation scrolls instead of wrapping to a new line',
    /\.expression-formula \{[^}]*flex-wrap: nowrap/.test(src));
 ok('SHIFT  hint and boss label overlay rather than toggling display',
    !/bossLabel\.style\.display/.test(src) && /\.hint-text\.visible \{\s*opacity: 1/.test(src));
 ok('SHIFT  layout is not vertically centred on a variable-height column',
    /justify-content: flex-start/.test(src));
 ok('SHIFT  viewport unit is svh, not the chrome-tracking dvh', !/100dvh/.test(src) && /100svh/.test(src));
 ok('SHIFT  card states do not change translateZ (perspective would rescale them)',
    !/\.number-card\.selected \{[^}]*translateZ\(20px\)/.test(src)
    && !/translateZ\(2px\)/.test(src) && !/translateZ\(15px\)/.test(src));
 ok('SHIFT  cards do not transition "all"', !/\.number-card \{[^}]*transition: all/.test(src));

 // --- pace: no pre-submit pause ---
 w.eval('clearAll(); selectNumber(0);selectOperator("+");selectNumber(1);selectOperator("+");selectNumber(2);selectOperator("+");selectNumber(3);');
 ok('PACE  auto-submit stays snappy and shows no countdown',
    w.eval('autoSubmitTimer')!==null && w.eval('AUTO_SUBMIT_MS')<=350 && !doc.getElementById('submitSweep'));
 w.eval('undoLastMove();');
 ok('PACE  a pending submit is still cancellable by undoing', w.eval('autoSubmitTimer')===null);

 // --- undo is the Undo button's job only ---
 w.eval('clearAll(); selectNumber(0);');
 const afterFirst = JSON.parse(w.eval('JSON.stringify(selectedNumbers)'));
 w.eval('selectNumber(0);');
 ok('UNDO  re-tapping a card in the equation does not undo',
    JSON.stringify(JSON.parse(w.eval('JSON.stringify(selectedNumbers)')))===JSON.stringify(afterFirst));
 ok('UNDO  a card in the equation is disabled, not a silent no-op',
    doc.getElementById('number-0').disabled === true);
 w.eval('selectOperator("+");');
 w.eval('selectOperator("+");');
 ok('UNDO  re-tapping the current operator does not pop it',
    JSON.parse(w.eval('JSON.stringify(selectedOperators)')).length===1);
 w.eval('selectOperator("−");');
 ok('UNDO  a different operator does not swap the current one',
    JSON.parse(w.eval('JSON.stringify(selectedOperators)')).join('')==='+');
 ok('UNDO  operator keys grey out while a card is expected',
    [...doc.querySelectorAll('#operators .operator-btn')].every(b => b.disabled));
 w.eval('undoLastMove();');
 ok('UNDO  the Undo button still steps back',
    JSON.parse(w.eval('JSON.stringify(selectedOperators)')).length===0
    && !doc.getElementById('number-0').disabled === false);

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

 // Smite costs no time, so it does not refresh the button via applyTimeChange.
 doc.getElementById('endlessBtn').click(); w.startGameWithClass('paladin');
 w.eval('gameState.level=5; gameState.skillUses.boss=0; spawnEnemy(); gameState.started=true; updateUI();');
 const smiteReady = !doc.getElementById('skillBtn').disabled;
 w.useSkill();
 ok('X6  Smite disables its own button once spent',
    smiteReady && doc.getElementById('skillBtn').disabled && /used this boss/.test(doc.getElementById('skillBtn').textContent));

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
