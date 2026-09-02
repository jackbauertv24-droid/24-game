
        window.startGameWithClass = function(cls) {
            document.getElementById('classModal').classList.remove('active');
            window.pendingClass = cls;
            
            const btn = document.getElementById('skillBtn');
            if (btn) {
                if (cls === 'warrior') btn.innerHTML = '🪓 Intimidate';
                if (cls === 'rogue') btn.innerHTML = '🗡️ Pickpocket';
                if (cls === 'wizard') btn.innerHTML = '🧙‍♂️ Clairvoyance';
                if (cls === 'paladin') btn.innerHTML = '🛡️ Smite';
            }
            
            initGame();
            updateUI(); // ensure class info is rendered if needed
        };

        window.useSkill = function() {
            if (!gameState.started) return;
            const cls = gameState.playerClass;
            const isBoss = (gameState.level % 5 === 0);
            
            if (cls === 'warrior') {
                if (gameState.timer <= 10 && !gameState.isPractice) {
                    showFloatingText('Not enough time!', '#ff5555', 'monsterArea');
                    return;
                }
                applyTimeChange(-10);
                showFloatingText('Intimidate!', '#ff5555', 'monsterArea');
                playCombatEffect('block');
                clearAll();
                loadPuzzle();
            } else if (cls === 'rogue') {
                if (gameState.skillUses.level >= 1) {
                    showFloatingText('Out of uses!', '#ff5555', 'monsterArea');
                    return;
                }
                gameState.skillUses.level++;
                showFloatingText('Pickpocket!', '#55ff55', 'monsterArea');
                applyTimeChange(10);
            } else if (cls === 'wizard') {
                if (gameState.timer <= 5 && !gameState.isPractice) {
                    showFloatingText('Not enough time!', '#ff5555', 'monsterArea');
                    return;
                }
                applyTimeChange(-5);
                showFloatingText('Clairvoyance!', '#5555ff', 'monsterArea');
                showHint();
            } else if (cls === 'paladin') {
                if (!isBoss) {
                    showFloatingText('Only on Bosses!', '#ffff55', 'monsterArea');
                    return;
                }
                if (gameState.skillUses.boss >= 1) {
                    showFloatingText('Out of uses!', '#ffff55', 'monsterArea');
                    return;
                }
                gameState.skillUses.boss++;
                showFloatingText('Smite!', '#ffff55', 'monsterArea');
                playCombatEffect('slash-heavy');
                doDamage(24);
                if (gameState.enemyCurrentHP <= 0) {
                    monsterDefeated();
                }
            }
        };

        function showFloatingText(text, color, targetId) {
            const target = document.getElementById(targetId) || document.getElementById('monsterArea');
            if (!target) return;
            const el = document.createElement('div');
            el.className = 'floating-text';
            el.textContent = text;
            el.style.color = color;
            el.style.left = '50%';
            el.style.top = '50%';
            target.appendChild(el);
            setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1200);
        }

        function applyTimeChange(amt) {
            if (gameState.isPractice) return;
            gameState.timer += amt;
            if (gameState.timer > 999) gameState.timer = 999;
            
            const color = amt > 0 ? '#55ff55' : '#ff5555';
            const sign = amt > 0 ? '+' : '';
            showFloatingText(sign + amt + 's', color, 'timer');
            
            if (gameState.timer <= 0) {
                gameState.timer = 0;
                document.getElementById('timer').textContent = 0;
                gameOver();
            } else {
                document.getElementById('timer').textContent = gameState.timer;
            }
        }

        function doDamage(amt) {
            gameState.enemyCurrentHP -= amt;
            if (gameState.enemyCurrentHP < 0) gameState.enemyCurrentHP = 0;
            showFloatingDamage(amt);
            updateHealthBar();
        }

        function monsterDefeated() {
            gameState.enemyCurrentHP = 0;
            updateHealthBar();
            clearInterval(timerInterval);
            
            const sprite = document.getElementById('monsterSprite');
            if (sprite) {
                sprite.classList.remove('hit', 'hit-light', 'dodge');
                void sprite.offsetWidth;
                sprite.classList.add('defeated');
            }
            playCombatEffect('slash-heavy');
            playSound('monster_die');
            
            let timeGain = gameState.playerClass === 'rogue' ? 20 : 15;
            applyTimeChange(timeGain);
            
            setTimeout(() => {
                nextLevel();
            }, 1200);
        }

        function gameOver() {
            gameState.started = false;
            cancelAutoSubmit();
            clearInterval(timerInterval);
            document.getElementById('failModal').classList.add('active');
        }

        const OPERATORS = ['+', '−', '×', '÷'];
        
        const CAMPAIGN_PUZZLES = { easy: [], medium: [], hard: [] };

        let gameState = {
            mode: 'campaign',
            difficulty: 'easy',
            level: 1,
            score: 0,
            streak: 0,
            multiplier: 1.0,
            timer: 60,
            maxTime: 60,
            isPractice: false,
            currentPuzzleIndex: 0,
            solvedPuzzles: { easy: [], medium: [], hard: [] },
            started: false,
            solvedCount: 0,
            playedCount: 0,
            bestStreak: 0
        };

        let currentNumbers = [];
        let selectedNumbers = [];
        let selectedOperators = [];
        let timerInterval = null;
        let currentSolution = null;
        let autoSubmitTimer = null;

        function cancelAutoSubmit() {
            if (autoSubmitTimer !== null) {
                clearTimeout(autoSubmitTimer);
                autoSubmitTimer = null;
            }
        }

        function scheduleAutoSubmit() {
            cancelAutoSubmit();
            if (!gameState.started || selectedNumbers.length !== 4 || selectedOperators.length !== 3) return;
            autoSubmitTimer = setTimeout(() => {
                autoSubmitTimer = null;
                submit();
            }, 350);
        }

        function loadStats() {
            try {
                const saved = JSON.parse(localStorage.getItem('24-game-stats') || '{}');
                gameState.solvedCount = Number.isFinite(saved.solvedCount) ? saved.solvedCount : 0;
                gameState.playedCount = Number.isFinite(saved.playedCount) ? saved.playedCount : 0;
                gameState.bestStreak = Number.isFinite(saved.bestStreak) ? saved.bestStreak : 0;
            } catch {
                gameState.solvedCount = 0;
                gameState.playedCount = 0;
                gameState.bestStreak = 0;
            }
        }

        function saveStats() {
            try {
                localStorage.setItem('24-game-stats', JSON.stringify({
                    solvedCount: gameState.solvedCount,
                    playedCount: gameState.playedCount,
                    bestStreak: gameState.bestStreak
                }));
            } catch {
                return;
            }
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        let audioCtx = null;

        function initAudio() {
            if (!AudioContext) return;
            if (!audioCtx) {
                try { audioCtx = new AudioContext(); } catch { return; }
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }

        function playTone(freq, duration, type = 'sine') {
            if (!audioCtx) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
            osc.stop(audioCtx.currentTime + duration);
        }

        function playNoise(duration, type = 'lowpass', freq = 1000) {
            if (!audioCtx) return;
            const bufferSize = audioCtx.sampleRate * duration;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = type;
            filter.frequency.setValueAtTime(freq, audioCtx.currentTime);
            if (type === 'lowpass') {
                filter.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + duration);
            }
            
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            noise.start();
        }

        function playSound(type) {
            initAudio();
            if (!audioCtx) return;
            
            const t = audioCtx.currentTime;
            
            switch(type) {
                case 'select':
                case 'operator':
                    // Stone click / short draw
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(300, t);
                    osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
                    gain.gain.setValueAtTime(0.3, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
                    osc.connect(gain); gain.connect(audioCtx.destination);
                    osc.start(); osc.stop(t + 0.05);
                    break;
                    
                case 'correct':
                    // Swoosh (Air slash)
                    const swooshDur = 0.2;
                    const bSize = audioCtx.sampleRate * swooshDur;
                    const sBuffer = audioCtx.createBuffer(1, bSize, audioCtx.sampleRate);
                    const sData = sBuffer.getChannelData(0);
                    for (let i = 0; i < bSize; i++) sData[i] = Math.random() * 2 - 1;
                    const sNoise = audioCtx.createBufferSource();
                    sNoise.buffer = sBuffer;
                    
                    const sFilter = audioCtx.createBiquadFilter();
                    sFilter.type = 'bandpass';
                    sFilter.Q.value = 1.5;
                    sFilter.frequency.setValueAtTime(4000, t);
                    sFilter.frequency.exponentialRampToValueAtTime(400, t + swooshDur);
                    
                    const sGain = audioCtx.createGain();
                    sGain.gain.setValueAtTime(0, t);
                    sGain.gain.linearRampToValueAtTime(1.5, t + 0.05);
                    sGain.gain.exponentialRampToValueAtTime(0.01, t + swooshDur);
                    
                    sNoise.connect(sFilter); sFilter.connect(sGain); sGain.connect(audioCtx.destination);
                    sNoise.start();
                    
                    // Metallic Ring (Blade)
                    const ringS1 = audioCtx.createOscillator();
                    const ringS2 = audioCtx.createOscillator();
                    const rGain = audioCtx.createGain();
                    
                    ringS1.type = 'triangle';
                    ringS2.type = 'triangle';
                    ringS1.frequency.setValueAtTime(1200, t);
                    ringS2.frequency.setValueAtTime(1220, t);
                    
                    rGain.gain.setValueAtTime(0, t);
                    rGain.gain.linearRampToValueAtTime(0.3, t + 0.02);
                    rGain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
                    
                    ringS1.connect(rGain); ringS2.connect(rGain);
                    rGain.connect(audioCtx.destination);
                    ringS1.start(); ringS2.start();
                    ringS1.stop(t + 0.25); ringS2.stop(t + 0.25);
                    break;
                    
                case 'wrong':
                    // Metallic shield block
                    const osc1 = audioCtx.createOscillator();
                    const gain1 = audioCtx.createGain();
                    osc1.type = 'square';
                    osc1.frequency.setValueAtTime(500, t);
                    osc1.frequency.exponentialRampToValueAtTime(100, t + 0.15);
                    gain1.gain.setValueAtTime(0.3, t);
                    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                    osc1.connect(gain1); gain1.connect(audioCtx.destination);
                    osc1.start(); osc1.stop(t + 0.15);
                    
                    const osc2 = audioCtx.createOscillator();
                    const gain2 = audioCtx.createGain();
                    osc2.type = 'sine';
                    osc2.frequency.setValueAtTime(150, t);
                    osc2.frequency.exponentialRampToValueAtTime(50, t + 0.2);
                    gain2.gain.setValueAtTime(0.8, t);
                    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                    osc2.connect(gain2); gain2.connect(audioCtx.destination);
                    osc2.start(); osc2.stop(t + 0.2);
                    break;
                    
                case 'defeat':
                    // Crumbling rock
                    playNoise(1.5, 'lowpass', 600);
                    break;
                    
                case 'hint': 
                    playTone(400, 0.1); 
                    setTimeout(() => playTone(500, 0.1), 100); 
                    break;
            }
        }

        function playCombatEffect(type) {
            const effectEl = document.getElementById('combatEffect');
            if (!effectEl) return;
            const newEffect = effectEl.cloneNode(true);
            newEffect.className = 'combat-effect ' + type;
            effectEl.parentNode.replaceChild(newEffect, effectEl);
        }

        function playCelebration() {
            const scene = document.getElementById('celebrationScene');
            scene.querySelectorAll('.firework-particle').forEach(particle => particle.remove());

            for (let i = 0; i < 22; i++) {
                const particle = document.createElement('i');
                particle.className = 'firework-particle';
                particle.style.setProperty('--angle', `${i * (360 / 22)}deg`);
                particle.style.setProperty('--distance', `${72 + (i % 4) * 13}px`);
                particle.style.setProperty('--depth', `${(i % 5 - 2) * 30}px`);
                particle.style.setProperty('--hue', String((i * 31) % 360));
                scene.appendChild(particle);
            }

            const core = scene.querySelector('.celebration-core');
            core.style.animation = 'none';
            void core.offsetWidth;
            core.style.animation = '';
        }

        function generatePuzzle() {
            const diff = gameState.difficulty;
            let numRange, ops;

            if (gameState.mode === 'endless') {
                const level = gameState.level;
                if (level <= 10) { numRange = [1, 10]; ops = ['+', '−']; }
                else if (level <= 20) { numRange = [1, 9]; ops = ['+', '−', '×']; }
                else { numRange = [1, 13]; ops = ['+', '−', '×', '÷']; }
            } else {
                if (diff === 'easy') { numRange = [1, 10]; ops = ['+', '−']; }
                else if (diff === 'medium') { numRange = [1, 9]; ops = ['+', '−', '×']; }
                else { numRange = [1, 13]; ops = ['+', '−', '×', '÷']; }
            }

            let candidates = [];
            
            for (let attempt = 0; attempt < 50 && candidates.length < 3; attempt++) {
                const nums = [];
                for (let i = 0; i < 4; i++) {
                    nums.push(Math.floor(Math.random() * (numRange[1] - numRange[0] + 1)) + numRange[0]);
                }
                
                const uniqueNums = [...new Set(nums)];
                if (uniqueNums.length < 2) continue;
                
                const solutions = findSolutions(nums, ops);
                if (solutions.length > 0) {
                    candidates.push({ nums, solution: solutions[0] });
                }
            }
            
            if (candidates.length > 0) {
                const chosen = candidates[Math.floor(Math.random() * candidates.length)];
                currentNumbers = chosen.nums.map(n => ({ value: n, used: false }));
                return { numbers: currentNumbers, solution: chosen.solution };
            }
            
            // Fallback: guaranteed solvable puzzle
            currentNumbers = [1, 2, 3, 4].map(n => ({ value: n, used: false }));
            return { numbers: currentNumbers, solution: "1×2×3×4 = 24" };
        }

        function findSolutions(nums, allowedOps = ['+', '−', '×', '÷']) {
            const results = [];
            const opCount = nums.length - 1;
            if (opCount < 0) return [];
            if (opCount === 0) {
                if (nums[0] === 24) results.push('24 = 24');
                return results;
            }
            
            function permute(arr) {
                if (arr.length === 0) return [[]];
                const result = [];
                for (let i = 0; i < arr.length; i++) {
                    const rest = permute(arr.slice(0, i).concat(arr.slice(i + 1)));
                    for (const r of rest) result.push([arr[i]].concat(r));
                }
                return result;
            }

            function generateOps(count) {
                if (count === 1) return allowedOps.map(o => [o]);
                const result = [];
                for (const first of allowedOps) {
                    for (const rest of generateOps(count - 1)) result.push([first, ...rest]);
                }
                return result;
            }

            function evalOp(a, b, op) {
                switch(op) {
                    case '+': return a + b;
                    case '−': return a - b;
                    case '×': return a * b;
                    case '÷': return b !== 0 && a % b === 0 ? a / b : null;
                }
                return null;
            }

            for (const numPerm of permute(nums)) {
                for (const opCombo of generateOps(opCount)) {
                    let result = numPerm[0];
                    let str = `${numPerm[0]}`;
                    let isValid = true;
                    
                    for (let i = 0; i < opCount; i++) {
                        result = evalOp(result, numPerm[i + 1], opCombo[i]);
                        if (result === null) {
                            isValid = false;
                            break;
                        }
                        str += ` ${opCombo[i]} ${numPerm[i + 1]}`;
                    }
                    
                    if (isValid && result === 24) {
                        results.push(`${str} = 24`);
                    }
                }
            }
            
            return [...new Set(results)].slice(0, 3);
        }

        function getTimerForLevel() {
            if (gameState.isPractice) return 0;
            if (gameState.mode === 'campaign') {
                if (gameState.difficulty === 'easy') return 45;
                if (gameState.difficulty === 'medium') return 35;
                return 25;
            }
            return Math.max(30, 60 - Math.floor(gameState.level / 2));
        }

        function renderNumbers() {
            const container = document.getElementById('numbers');
            container.innerHTML = '';
            currentNumbers.forEach((num, idx) => {
                const card = document.createElement('button');
                card.type = 'button';
                card.className = `number-card${num.used ? ' used' : ''}`;
                card.textContent = num.value;
                card.setAttribute('role', 'button');
                card.setAttribute('tabindex', '0');
                card.setAttribute('aria-label', `Number ${num.value}${num.used ? ', used' : ''}`);
                card.onclick = () => selectNumber(idx);
                card.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        selectNumber(idx);
                    }
                };
                card.onpointerdown = () => card.classList.add('pressing');
                card.onpointerup = () => card.classList.remove('pressing');
                card.onpointercancel = () => card.classList.remove('pressing');
                card.onpointerleave = () => card.classList.remove('pressing');
                container.appendChild(card);
            });
        }

        function renderOperators() {
            const container = document.getElementById('operators');
            container.innerHTML = '';
            const allowedOps = gameState.mode === 'endless' && gameState.level <= 10 ? ['+', '−'] :
                              gameState.mode === 'endless' && gameState.level <= 20 ? ['+', '−', '×'] :
                              gameState.mode === 'campaign' && gameState.difficulty === 'easy' ? ['+', '−'] :
                              ['+', '−', '×', '÷'];
            
            OPERATORS.forEach(op => {
                const btn = document.createElement('button');
                btn.className = `operator-btn${!allowedOps.includes(op) ? ' disabled' : ''}`;
                btn.textContent = op;
                btn.setAttribute('aria-label', `Operator ${op}`);
                btn.disabled = !allowedOps.includes(op);
                btn.onclick = () => allowedOps.includes(op) && selectOperator(op);
                btn.onpointerdown = () => btn.classList.add('pressing');
                btn.onpointerup = () => btn.classList.remove('pressing');
                btn.onpointercancel = () => btn.classList.remove('pressing');
                btn.onpointerleave = () => btn.classList.remove('pressing');
                container.appendChild(btn);
            });
        }

        function selectNumber(idx) {
            if (!gameState.started) return;
            // Allow undoing if it's already selected
            const isUndo = selectedNumbers.includes(idx);
            if (!isUndo && selectedNumbers.length !== selectedOperators.length) return;
            if (currentNumbers[idx].used && !isUndo) return;
            playSound('select');
            
            if (selectedNumbers.includes(idx)) {
                const removeIndex = selectedNumbers.indexOf(idx);
                selectedNumbers.splice(removeIndex, 1);
                currentNumbers[idx].used = false;
                
                if (selectedOperators.length >= selectedNumbers.length) {
                    selectedOperators = selectedOperators.slice(0, Math.max(0, selectedNumbers.length - 1));
                }
            } else {
                if (selectedNumbers.length < 4) {
                    selectedNumbers.push(idx);
                    currentNumbers[idx].used = true;
                }
            }
            renderNumbers();
            updateExpression();
            
            if (selectedNumbers.length > 1 && selectedNumbers.length <= 4) {
                const calc = getIntermediateCalculation();
                if (calc.status === 'evaluated' || calc.status === 'target' || calc.status === 'mismatch' || calc.status === 'single') {
                    const unused = currentNumbers.filter((n, i) => !selectedNumbers.includes(i)).map(n => n.value);
                    unused.push(calc.value);
                    const isSolvable = findSolutions(unused).length > 0;
                    
                    const sprite = document.getElementById('monsterSprite');
                    if (sprite) {
                        sprite.classList.remove('hit-light', 'dodge', 'hit');
                        void sprite.offsetWidth; // trigger reflow
                        const animClass = isSolvable ? 'hit-light' : 'dodge';
                        sprite.classList.add(animClass);
                        
                        // Clear the animation class so it returns to idle
                        setTimeout(() => {
                            if (sprite.classList.contains(animClass)) {
                                sprite.classList.remove(animClass);
                            }
                        }, 400);

                        playSound(isSolvable ? 'correct' : 'wrong');
                    }
                    
                    playCombatEffect(isSolvable ? 'slash-light' : 'block');
                }
            }
        }

        function selectOperator(op) {
            if (!gameState.started) return;
            playSound('operator');
            
            if (selectedOperators.length >= selectedNumbers.length) {
                if (selectedOperators.length > 0) {
                    if (selectedOperators[selectedOperators.length - 1] === op) {
                        selectedOperators.pop();
                    } else {
                        selectedOperators[selectedOperators.length - 1] = op;
                    }
                    updateExpression();
                }
                return;
            }
            
            if (selectedOperators.length < 3) {
                selectedOperators.push(op);
                updateExpression();
            }
        }

        function evalOperation(a, b, op) {
            switch(op) {
                case '+': return a + b;
                case '−': return a - b;
                case '×': return a * b;
                case '÷': return b !== 0 && a % b === 0 ? a / b : null;
            }
            return null;
        }

        function getIntermediateCalculation() {
            if (selectedNumbers.length === 0) {
                return { value: null, text: '', status: 'empty' };
            }
            
            const nums = selectedNumbers.map(i => currentNumbers[i].value);
            let val = nums[0];
            
            for (let i = 0; i < selectedOperators.length; i++) {
                if (i + 1 < nums.length) {
                    val = evalOperation(val, nums[i + 1], selectedOperators[i]);
                    if (val === null) {
                        return { value: null, text: '⚠️ Not exact division', status: 'invalid' };
                    }
                }
            }
            
            if (selectedOperators.length === selectedNumbers.length) {
                const lastOp = selectedOperators[selectedOperators.length - 1];
                return { value: val, text: `${val} ${lastOp} …`, status: 'pending' };
            }
            
            if (selectedNumbers.length === 1) {
                return { value: val, text: `${val}`, status: 'single' };
            }
            
            if (selectedNumbers.length === 4) {
                if (val === 24) {
                    return { value: 24, text: '= 24 🎉', status: 'target' };
                } else {
                    return { value: val, text: `= ${val}`, status: 'mismatch' };
                }
            }
            
            return { value: val, text: `= ${val}`, status: 'evaluated' };
        }

        function updateExpression() {
            cancelAutoSubmit();
            const container = document.getElementById('expression');
            container.replaceChildren();

            const formulaRow = document.createElement('div');
            formulaRow.className = 'expression-formula';

            if (selectedNumbers.length === 0) {
                const placeholder = document.createElement('span');
                placeholder.className = 'expression-placeholder';
                placeholder.textContent = 'Tap here to clear board';
                formulaRow.appendChild(placeholder);
                container.appendChild(formulaRow);

                const cue = document.createElement('span');
                cue.className = 'expression-cue';
                cue.textContent = 'Tap any card below to begin';
                container.appendChild(cue);
                return;
            }

            selectedNumbers.forEach((numberIndex, index) => {
                const numberToken = document.createElement('button');
                numberToken.className = 'expression-token number-token';
                numberToken.type = 'button';
                numberToken.textContent = currentNumbers[numberIndex].value;
                numberToken.setAttribute('aria-label', `Remove number at step ${index + 1}`);
                numberToken.onclick = event => {
                    event.stopPropagation();
                    truncateExpressionAtNumber(index);
                };
                formulaRow.appendChild(numberToken);

                if (index < selectedOperators.length) {
                    const operatorToken = document.createElement('button');
                    operatorToken.className = 'expression-token operator-token';
                    operatorToken.type = 'button';
                    operatorToken.textContent = selectedOperators[index];
                    operatorToken.setAttribute('aria-label', `Remove operator at step ${index + 1}`);
                    operatorToken.onclick = event => {
                        event.stopPropagation();
                        truncateExpressionAtOperator(index);
                    };
                    formulaRow.appendChild(operatorToken);
                }
            });
            container.appendChild(formulaRow);

            const calc = getIntermediateCalculation();
            const liveTotal = document.createElement('div');
            liveTotal.className = `expression-live-total live-result-${calc.status}`;
            liveTotal.textContent = calc.text;
            container.appendChild(liveTotal);

            const cue = document.createElement('span');
            cue.className = 'expression-cue';
            cue.textContent = selectedNumbers.length === 4
                ? (calc.value === 24 ? 'Complete — submitting…' : 'Complete — checking…')
                : selectedNumbers.length === selectedOperators.length
                    ? 'Next: choose a card'
                    : 'Next: choose an operation';
            container.appendChild(cue);

            scheduleAutoSubmit();
        }

        function truncateExpressionAtNumber(index) {
            const removedNumbers = selectedNumbers.slice(index);
            removedNumbers.forEach(numberIndex => {
                currentNumbers[numberIndex].used = false;
            });
            selectedNumbers = selectedNumbers.slice(0, index);
            selectedOperators = selectedOperators.slice(0, Math.max(0, index - 1));
            localStorage.setItem('24-game-edit-cue-seen', '1');
            renderNumbers();
            updateExpression();
        }

        function truncateExpressionAtOperator(index) {
            const removedNumbers = selectedNumbers.slice(index + 1);
            removedNumbers.forEach(numberIndex => {
                currentNumbers[numberIndex].used = false;
            });
            selectedNumbers = selectedNumbers.slice(0, index + 1);
            selectedOperators = selectedOperators.slice(0, index);
            localStorage.setItem('24-game-edit-cue-seen', '1');
            renderNumbers();
            updateExpression();
        }

        function undoLastMove() {
            if (!gameState.started) return;
            localStorage.setItem('24-game-edit-cue-seen', '1');
            if (selectedNumbers.length > selectedOperators.length) {
                const lastIdx = selectedNumbers.pop();
                currentNumbers[lastIdx].used = false;
                renderNumbers();
            } else if (selectedOperators.length > 0) {
                selectedOperators.pop();
            }
            updateExpression();
        }

        function undo() {
            undoLastMove();
        }

        function clearAll() {
            cancelAutoSubmit();
            selectedNumbers = [];
            selectedOperators = [];
            currentNumbers.forEach(n => n.used = false);
            renderNumbers();
            updateExpression();
            document.getElementById('hint').classList.remove('visible');
        }

        function evaluateExpression() {
            if (selectedNumbers.length !== 4 || selectedOperators.length !== 3) return null;
            const calc = getIntermediateCalculation();
            return calc.value;
        }

        function submit() {
            cancelAutoSubmit();
            if (!gameState.started) return;
            
            const result = evaluateExpression();
            
            if (selectedNumbers.length !== 4 || selectedOperators.length !== 3) {
                playSound('wrong');
                document.getElementById('wrongResult').textContent = 'incomplete';
                document.getElementById('failModal').classList.add('active');
                document.querySelector('.game-area').classList.add('shake');
                setTimeout(() => document.querySelector('.game-area').classList.remove('shake'), 300);
                return;
            }
            
            if (result === 24) {
                playSound('correct');
                
                const sprite = document.getElementById('monsterSprite');
                if (sprite) {
                    sprite.classList.remove('hit', 'hit-light', 'dodge');
                    void sprite.offsetWidth;
                    sprite.classList.add('hit');
                    
                    setTimeout(() => {
                        if (sprite.classList.contains('hit')) {
                            sprite.classList.remove('hit');
                        }
                    }, 400);
                }
                
                playCombatEffect('slash-heavy');
                
                gameState.enemyCurrentHP -= 100;
                updateHealthBar();

                if (!gameState.isPractice) {
                    gameState.playedCount++;
                    gameState.solvedCount++;
                    gameState.bestStreak = Math.max(gameState.bestStreak, gameState.streak);
                    saveStats();
                }
                gameState.streak++;
                updateMultiplier();
                const points = Math.round((100 + (gameState.timer * 2)) * gameState.multiplier);
                gameState.score += points;
                updateUI();
                
                if (gameState.mode === 'campaign') {
                    gameState.solvedPuzzles[gameState.difficulty].push(gameState.currentPuzzleIndex);
                }

                if (gameState.enemyCurrentHP <= 0) {
                    gameState.enemyCurrentHP = 0;
                    updateHealthBar();
                    clearInterval(timerInterval);
                    
                    if (sprite) {
                        sprite.classList.remove('hit', 'hit-light', 'dodge');
                        void sprite.offsetWidth;
                        sprite.classList.add('defeated');
                    }
                    setTimeout(() => playSound('defeat'), 100);
                    
                    document.getElementById('successMsg').textContent = `Enemy Defeated! (+${points} pts)`;
                    setTimeout(() => {
                        playCelebration();
                        window.showFloatingDamage(`Defeated! +${points}`);
                        setTimeout(() => {
                            nextLevel();
                        }, 1200);
                    }, 1200);
                } else {
                    clearAll();
                    gameState.timer += 15;
                    if (gameState.timer > gameState.maxTime) gameState.maxTime = gameState.timer;
                    document.getElementById('timer').textContent = gameState.timer;
                    document.getElementById('progress').style.width = `${(gameState.timer / gameState.maxTime) * 100}%`;
                    setTimeout(() => { loadPuzzle(); }, 300);
                }
            } else {
                playSound('wrong');
                if (!gameState.isPractice) {
                    gameState.playedCount++;
                    saveStats();
                }
                clearInterval(timerInterval);
                gameState.streak = 0;
                gameState.multiplier = 1.0;
                updateUI();
                document.getElementById('wrongResult').textContent = result !== null ? result : 'invalid';
                document.getElementById('failModal').classList.add('active');
                document.querySelector('.game-area').classList.add('shake');
                setTimeout(() => document.querySelector('.game-area').classList.remove('shake'), 300);
            }
        }

        function showHint() {
            playSound('hint');
            const hintEl = document.getElementById('hint');
            if (currentSolution) {
                hintEl.textContent = `💡 ${currentSolution}`;
                hintEl.classList.add('visible');
            }
        }

        function updateMultiplier() {
            if (gameState.streak >= 6) gameState.multiplier = 2.0;
            else if (gameState.streak >= 3) gameState.multiplier = 1.5;
            else gameState.multiplier = 1.0;
        }

        function updateStats() {
            const solved = gameState.solvedCount;
            const played = gameState.playedCount;
            document.getElementById('statSolved').textContent = solved;
            document.getElementById('statPlayed').textContent = played;
            document.getElementById('statAccuracy').textContent = played > 0 ? `${Math.round((solved / played) * 100)}%` : '0%';
            document.getElementById('statBestStreak').textContent = gameState.bestStreak;
        }

        function updateUI() {
            document.getElementById('level').textContent = gameState.level;
            document.getElementById('score').textContent = gameState.score;
            document.getElementById('streak').textContent = gameState.streak;
            document.getElementById('multiplier').textContent = gameState.multiplier.toFixed(1);
            updateStats();
            
            const diffEl = document.getElementById('difficulty');
            if (gameState.mode === 'campaign') {
                diffEl.textContent = gameState.difficulty.toUpperCase();
            } else if (gameState.mode === 'endless') {
                const tiers = ['EASY', 'EASY', 'MED', 'MED', 'HARD'];
                diffEl.textContent = tiers[Math.min(4, Math.floor(gameState.level / 10))];
            } else {
                diffEl.textContent = 'PRACTICE';
            }
        }

        function startGame() {
            document.getElementById('modeModal').classList.remove('active');
            
            gameState.started = true;
            gameState.timer = getTimerForLevel();
            gameState.maxTime = gameState.timer;
            
            document.getElementById('timer').textContent = gameState.timer;
            document.getElementById('progress').style.width = '100%';
            document.getElementById('timerContainer').style.display = gameState.isPractice ? 'none' : 'block';
            document.getElementById('progressContainer').style.display = gameState.isPractice ? 'none' : 'block';
            document.getElementById('practiceNotice').style.display = gameState.isPractice ? 'block' : 'none';
            
            spawnEnemy();
            loadPuzzle();
            startTimer();
        }

        function loadPuzzle() {
            selectedNumbers = [];
            selectedOperators = [];
            
            if (gameState.mode === 'campaign') {
                const puzzles = CAMPAIGN_PUZZLES[gameState.difficulty];
                const solved = gameState.solvedPuzzles[gameState.difficulty];
                let idx = gameState.currentPuzzleIndex;
                
                while (solved.includes(idx) && solved.length < puzzles.length) {
                    idx = (idx + 1) % puzzles.length;
                }
                
                if (solved.length >= puzzles.length) {
                    document.getElementById('completeModal').classList.add('active');
                    return;
                }
                
                gameState.currentPuzzleIndex = idx;
                const puzzle = puzzles[idx];
                currentNumbers = puzzle.nums.map(n => ({ value: n, used: false }));
                
                // Generate hint dynamically based on difficulty
                const diffOps = gameState.difficulty === 'easy' ? ['+', '−'] :
                               gameState.difficulty === 'medium' ? ['+', '−', '×'] :
                               ['+', '−', '×', '÷'];
                const solutions = findSolutions(puzzle.nums, diffOps);
                currentSolution = solutions.length > 0 ? solutions[0] : "Try different combinations";
            } else {
                const puzzle = generatePuzzle();
                currentNumbers = puzzle.numbers;
                currentSolution = puzzle.solution;
            }
            
            renderNumbers();
            renderOperators();
            updateExpression();
            updateUI();
            document.getElementById('hint').classList.remove('visible');
        }

        function startTimer() {
            clearInterval(timerInterval);

            if (gameState.isPractice) return;

            gameState.timer = Math.max(0, gameState.timer);
            document.getElementById('timer').textContent = gameState.timer;
            document.getElementById('progress').style.width = `${gameState.maxTime > 0 ? (gameState.timer / gameState.maxTime) * 100 : 0}%`;

            timerInterval = setInterval(() => {
                gameState.timer--;
                
                if (gameState.timer <= 0) {
                    gameState.timer = 0;
                    gameState.started = false;
                    cancelAutoSubmit();
                    clearInterval(timerInterval);
                    document.getElementById('timer').textContent = 0;
                    document.getElementById('progress').style.width = '0%';
                    gameState.streak = 0;
                    gameState.multiplier = 1.0;
                    document.getElementById('finalScore').textContent = gameState.score;
                    document.getElementById('timeoutModal').classList.add('active');
                    return;
                }
                
                document.getElementById('timer').textContent = gameState.timer;
                document.getElementById('progress').style.width = `${(gameState.timer / gameState.maxTime) * 100}%`;
            }, 2500);
        }

        
        const ENEMIES = [
            { name: "Stone Golem", url: "assets/golem_spritesheet.jpg", filter: "none" },
            { name: "Magma Golem", url: "assets/golem_spritesheet.jpg", filter: "hue-rotate(150deg) saturate(2) brightness(1.2)", hidden: true },
            { name: "Frost Golem", url: "assets/golem_spritesheet.jpg", filter: "hue-rotate(210deg) saturate(1.5) brightness(1.5)", hidden: true },
            { name: "Toxic Sludge Golem", url: "assets/golem_spritesheet.jpg", filter: "hue-rotate(80deg) saturate(2) brightness(1.1)", hidden: true },
            { name: "Void Golem", url: "assets/golem_spritesheet.jpg", filter: "hue-rotate(280deg) saturate(1.5) contrast(1.5)", hidden: true },
            { name: "Golden Golem", url: "assets/golem_spritesheet.jpg", filter: "sepia(1) saturate(3) hue-rotate(10deg) brightness(1.3)", hidden: true },
            { name: "Skeleton Warrior", url: "assets/skeleton.jpg", filter: "none", hidden: true },
            { name: "Goblin Thief", url: "assets/goblin.jpg", filter: "none", hidden: true },
            { name: "Vampire Bat", url: "assets/bat.jpg", filter: "none", hidden: true },
            { name: "Beholder", url: "assets/beholder.jpg", filter: "none", hidden: true },
            { name: "Red Dragon", url: "assets/dragon.jpg", filter: "none", hidden: true },
            { name: "Orc Warlord", url: "assets/orc.jpg", filter: "none" },
            { name: "Ghostly Wraith", url: "assets/wraith.jpg", filter: "none" },
            { name: "Fire Elemental", url: "assets/fire_elemental.jpg", filter: "none" },
            { name: "Armored Spider", url: "assets/spider.jpg", filter: "none" },
            { name: "Lich King", url: "assets/lich.jpg", filter: "none" },
            { name: "Crystal Golem", url: "assets/crystal_golem.jpg", filter: "none" },
            { name: "Minotaur Gladiator", url: "assets/minotaur.jpg", filter: "none" }
        ];
        
        function spawnEnemy(keepSame = false) {
            const isBoss = (gameState.level % 5 === 0);
            gameState.enemyMaxHP = isBoss ? 72 : 24;
            if (gameState.isPractice) gameState.enemyMaxHP = 24;
            
            if (!keepSame) {
                gameState.enemyCurrentHP = gameState.enemyMaxHP;
            }
            
            const sprite = document.getElementById('monsterSprite');
            if (sprite) {
                sprite.classList.remove('defeated', 'hit', 'hit-light', 'dodge');
                
                if (!keepSame || !gameState.currentEnemy) {
                    const activeEnemies = ENEMIES.filter(e => !e.hidden);
                    gameState.currentEnemy = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
                    
                    if (isBoss) {
                        sprite.style.transform = 'translateX(-50%) scale(1.3)';
                    } else {
                        sprite.style.transform = 'translateX(-50%) scale(1)';
                    }
                }
                const enemyType = gameState.currentEnemy;
                
                sprite.style.backgroundImage = `url('${enemyType.url}')`;
                sprite.style.transition = 'opacity 0.4s';
                sprite.style.opacity = '1';
            }
            
            updateHealthBar();
        }

        function updateHealthBar() {
            const bar = document.getElementById('monsterHealth');
            if (bar) {
                bar.style.width = `${Math.max(0, (gameState.enemyCurrentHP / gameState.enemyMaxHP) * 100)}%`;
            }
        }

        function nextLevel() {
            document.getElementById('successModal').classList.remove('active');
            
            if (gameState.mode === 'campaign') {
                if (gameState.solvedPuzzles[gameState.difficulty].length >= CAMPAIGN_PUZZLES[gameState.difficulty].length) {
                    document.getElementById('completeModal').classList.add('active');
                    return;
                }
            }
            
            gameState.level++;
            gameState.skillUses.level = 0;
            if (gameState.level % 5 === 0 || (gameState.level-1) % 5 === 0) {
                gameState.skillUses.boss = 0;
            }
            
            window.glWalk();
            setTimeout(() => {
                spawnEnemy();
                loadPuzzle();
                startTimer();
            }, 600);
        }

        function retryLevel() {
            document.getElementById('failModal').classList.remove('active');
            clearAll();
            gameState.timer = 60; // Base time for a fresh retry
            gameState.maxTime = 60;
            document.getElementById('timer').textContent = gameState.timer;
            document.getElementById('progress').style.width = '100%';
            gameState.enemyCurrentHP = gameState.enemyMaxHP; // Reset HP
            spawnEnemy(true);
            startTimer();
        }

        function showModeSelect() {
            
        document.getElementById('modeModal').classList.add('active');
            document.getElementById('successModal').classList.remove('active');
            document.getElementById('failModal').classList.remove('active');
            document.getElementById('timeoutModal').classList.remove('active');
            document.getElementById('completeModal').classList.remove('active');
        }

        function resetGame() {
            const preservedStats = {
                solvedCount: gameState.solvedCount,
                playedCount: gameState.playedCount,
                bestStreak: gameState.bestStreak,
                mode: gameState.mode,
                difficulty: gameState.difficulty,
                isPractice: gameState.isPractice,
                solvedPuzzles: gameState.solvedPuzzles
            };
            clearInterval(timerInterval);
            timerInterval = null;
            currentNumbers = [];
            selectedNumbers = [];
            selectedOperators = [];
            currentSolution = null;
            gameState = {
                mode: preservedStats.mode,
                difficulty: preservedStats.difficulty,
                level: 1,
                score: 0,
                streak: 0,
                multiplier: 1.0,
                timer: 60,
                maxTime: 60,
                isPractice: preservedStats.isPractice,
                currentPuzzleIndex: 0,
                solvedPuzzles: preservedStats.solvedPuzzles,
                started: false,
                solvedCount: preservedStats.solvedCount,
                playedCount: preservedStats.playedCount,
                bestStreak: preservedStats.bestStreak
            };
            updateStats();
            showModeSelect();
        }

        
        let galIndex = 0;
        
        function updateGallery() {
            const activeEnemies = ENEMIES.filter(e => !e.hidden);
            const enemy = activeEnemies[galIndex];
            document.getElementById('galName').textContent = (galIndex + 1) + ". " + enemy.name;
            const sprite = document.getElementById('galSprite');
            sprite.style.backgroundImage = `url('${enemy.url}')`;
            sprite.style.setProperty('--enemy-filter', enemy.filter);
            sprite.className = 'monster-sprite'; // reset animation
        }
        
        window.playGalAnim = function(animClass) {
            const sprite = document.getElementById('galSprite');
            sprite.className = 'monster-sprite';
            void sprite.offsetWidth; // trigger reflow
            sprite.classList.add(animClass);
            
            if (animClass !== 'defeated') {
                setTimeout(() => {
                    if (sprite.classList.contains(animClass)) {
                        sprite.classList.remove(animClass);
                    }
                }, 400);
            }
        };

        document.getElementById('galleryBtn').onclick = () => {
            document.getElementById('modeModal').classList.remove('active');
            document.getElementById('galleryModal').classList.add('active');
            updateGallery();
        };
        
        document.getElementById('galCloseBtn').onclick = () => {
            document.getElementById('galleryModal').classList.remove('active');
            document.getElementById('modeModal').classList.add('active');
        };
        
        document.getElementById('galPrevBtn').onclick = () => {
            const len = ENEMIES.filter(e => !e.hidden).length;
            galIndex = (galIndex - 1 + len) % len;
            updateGallery();
        };
        
        document.getElementById('galNextBtn').onclick = () => {
            const len = ENEMIES.filter(e => !e.hidden).length;
            galIndex = (galIndex + 1) % len;
            updateGallery();
        };
        
        document.getElementById('campaignBtn').onclick = function() {
            gameState.mode = 'campaign';
            gameState.isPractice = false;
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('difficultySelect').style.display = 'block';
        };

        document.getElementById('endlessBtn').onclick = function() {
            gameState.mode = 'endless';
            gameState.isPractice = false;
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('difficultySelect').style.display = 'none';
        };

        document.getElementById('practiceBtn').onclick = function() {
            gameState.mode = 'campaign';
            gameState.isPractice = true;
            gameState.difficulty = 'easy';
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('difficultySelect').style.display = 'none';
        };

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.onclick = function() {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                gameState.difficulty = this.dataset.diff;
            };
        });

        document.getElementById('startGameBtn').onclick = startGame;
        document.getElementById('nextBtn').onclick = nextLevel;
        document.getElementById('retryBtn').onclick = retryLevel;
        document.getElementById('restartBtn').onclick = resetGame;
        document.getElementById('completeBtn').onclick = resetGame;
        
        
        document.getElementById('hintBtn').onclick = showHint;

        loadStats();
        updateStats();
        function initCampaignPuzzles() {
            const difficulties = [
                { name: 'easy', numRange: [1, 10], ops: ['+', '−'] },
                { name: 'medium', numRange: [1, 9], ops: ['+', '−', '×'] },
                { name: 'hard', numRange: [1, 13], ops: ['+', '−', '×', '÷'] }
            ];

            difficulties.forEach(diff => {
                let candidates = [];
                let attempts = 0;
                while(candidates.length < 30 && attempts < 5000) {
                    attempts++;
                    const nums = [];
                    for (let i = 0; i < 4; i++) {
                        nums.push(Math.floor(Math.random() * (diff.numRange[1] - diff.numRange[0] + 1)) + diff.numRange[0]);
                    }
                    const uniqueNums = [...new Set(nums)];
                    if (uniqueNums.length < 2) continue;
                    
                    const solutions = findSolutions(nums, diff.ops);
                    if (solutions.length > 0) {
                        const numString = [...nums].sort((a,b)=>a-b).join(',');
                        if (!candidates.some(c => c.key === numString)) {
                            candidates.push({ key: numString });
                            CAMPAIGN_PUZZLES[diff.name].push({ nums: [...nums] }); // RPG branch doesn't need hint here
                        }
                    }
                }
            });
        }
        initCampaignPuzzles();

        document.getElementById('modeModal').classList.add('active');
    

        // --- 2D ANIMATION HOOKS ---
        window.glHit = () => { 
            const sprite = document.getElementById('monsterSprite');
            if(sprite) {
                sprite.classList.remove('hit', 'hit-light', 'dodge', 'defeated');
                void sprite.offsetWidth;
                sprite.classList.add('hit-light');
            }
        };
        window.glBlock = () => { 
            const sprite = document.getElementById('monsterSprite');
            if(sprite) {
                sprite.classList.remove('hit', 'hit-light', 'dodge', 'defeated');
                void sprite.offsetWidth;
                sprite.classList.add('dodge');
            }
        };
        window.glDeath = () => { 
            const sprite = document.getElementById('monsterSprite');
            if(sprite) {
                sprite.classList.remove('hit', 'hit-light', 'dodge', 'defeated');
                void sprite.offsetWidth;
                sprite.classList.add('defeated');
            }
        };
        window.glWalk = () => { 
            const sprite = document.getElementById('monsterSprite');
            if(sprite) {
                sprite.style.transition = 'opacity 0.4s';
                sprite.style.opacity = '0';
            }
        };
        
        window.showFloatingDamage = (amt) => {
            const div = document.createElement('div');
            div.className = 'floating-dmg';
            div.textContent = amt;
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 1000);
        };
        // --- END 2D ANIMATION HOOKS ---
    