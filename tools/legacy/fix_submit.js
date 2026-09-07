const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const submitRegex = /function submit\(\) \{[\s\S]*?function showHint\(\) \{/m;

const newSubmit = `function submit() {
            cancelAutoSubmit();
            if (!gameState.started) return;
            
            const result = evaluateExpression();
            
            // Incomplete or Invalid
            if (selectedNumbers.length !== 4 || selectedOperators.length !== 3 || result !== 24) {
                playSound('wrong');
                document.querySelector('.game-area').classList.add('shake');
                setTimeout(() => document.querySelector('.game-area').classList.remove('shake'), 300);
                
                // Time is Health penalty
                let penalty = -10;
                if (gameState.playerClass === 'paladin') penalty = -5;
                applyTimeChange(penalty);
                
                // Reset board for retry
                setTimeout(() => {
                    clearAll();
                }, 500);
                return;
            }
            
            // Correct Answer!
            playSound('correct');
            
            const sprite = document.getElementById('monsterSprite');
            if (sprite) {
                sprite.classList.remove('hit', 'hit-light', 'dodge');
                void sprite.offsetWidth;
                sprite.classList.add('hit');
                setTimeout(() => sprite.classList.remove('hit'), 400);
            }
            
            playCombatEffect('slash-heavy');
            
            const isBoss = (gameState.level % 5 === 0);
            let damage = 24;
            if (gameState.playerClass === 'warrior' && isBoss) damage = 48;
            if (gameState.playerClass === 'wizard' && selectedOperators.includes('÷')) damage = 48;
            
            doDamage(damage);
            
            let timeGain = (gameState.playerClass === 'rogue') ? 20 : 15;
            applyTimeChange(timeGain);

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
                monsterDefeated();
            } else {
                // Boss takes a hit but survives, load next puzzle
                setTimeout(() => {
                    clearAll();
                    loadPuzzle();
                }, 600);
            }
        }

        function showHint() {`;

html = html.replace(submitRegex, newSubmit);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Submit fixed.");
