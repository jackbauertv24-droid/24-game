const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Prevent skill use during death animation
html = html.replace('window.useSkill = function() {',
\`window.useSkill = function() {
            if (gameState.enemyCurrentHP <= 0) return;\`);

// 2. Fix Warrior Intimidate (Cooldown + Boss Immunity + Exploit flag)
const oldWarriorBlock = \`if (cls === 'warrior') {
                if (gameState.timer <= 10 && !gameState.isPractice) {
                    showFloatingText('Not enough time!', '#ff5555', 'monsterArea');
                    return;
                }
                applyTimeChange(-10);
                showFloatingText('Intimidate!', '#ff5555', 'monsterArea');
                playCombatEffect('slash-heavy');
                clearAll();
                
                if (gameState.mode === 'campaign') {
                    if (!gameState.solvedPuzzles[gameState.difficulty].includes(gameState.currentPuzzleIndex)) {
                        gameState.solvedPuzzles[gameState.difficulty].push(gameState.currentPuzzleIndex);
                        localStorage.setItem('24-game-solved', JSON.stringify(gameState.solvedPuzzles));
                    }
                    const puzzles = CAMPAIGN_PUZZLES[gameState.difficulty];
                    gameState.currentPuzzleIndex = (gameState.currentPuzzleIndex + 1) % puzzles.length;
                }
                
                doDamage(24);
                if (gameState.enemyCurrentHP <= 0) {
                    setTimeout(monsterDefeated, 500);
                } else {
                    setTimeout(loadPuzzle, 500);
                }\`;

const newWarriorBlock = \`if (cls === 'warrior') {
                if (isBoss) {
                    showFloatingText('Resisted by Boss!', '#ffaa00', 'monsterArea');
                    return;
                }
                if (gameState.skillCooldown) {
                    showFloatingText('Cooling down!', '#ffaa00', 'monsterArea');
                    return;
                }
                if (gameState.timer <= 10 && !gameState.isPractice) {
                    showFloatingText('Not enough time!', '#ff5555', 'monsterArea');
                    return;
                }
                
                gameState.skillCooldown = true;
                const btn = document.getElementById('skillBtn');
                if (btn) btn.style.opacity = '0.5';
                setTimeout(() => {
                    gameState.skillCooldown = false;
                    if (btn) btn.style.opacity = '1';
                }, 5000);

                applyTimeChange(-10);
                showFloatingText('Intimidate!', '#ffaa00', 'monsterArea');
                playCombatEffect('slash-heavy');
                clearAll();
                
                if (gameState.mode === 'campaign') {
                    if (!gameState.solvedPuzzles[gameState.difficulty].includes(gameState.currentPuzzleIndex)) {
                        gameState.solvedPuzzles[gameState.difficulty].push(gameState.currentPuzzleIndex);
                        localStorage.setItem('24-game-solved', JSON.stringify(gameState.solvedPuzzles));
                    }
                    const puzzles = CAMPAIGN_PUZZLES[gameState.difficulty];
                    gameState.currentPuzzleIndex = (gameState.currentPuzzleIndex + 1) % puzzles.length;
                }
                
                gameState.killedBySkill = true;
                doDamage(24);
                if (gameState.enemyCurrentHP <= 0) {
                    setTimeout(monsterDefeated, 500);
                } else {
                    setTimeout(loadPuzzle, 500);
                }\`;

html = html.replace(oldWarriorBlock, newWarriorBlock);

// 3. Prevent time-gain exploit in monsterDefeated
const oldMonsterDefeated = \`let timeGain = gameState.playerClass === 'rogue' ? 20 : 15;
            applyTimeChange(timeGain);\`;
const newMonsterDefeated = \`if (!gameState.killedBySkill) {
                let timeGain = gameState.playerClass === 'rogue' ? 20 : 15;
                applyTimeChange(timeGain);
            }
            gameState.killedBySkill = false;\`;
html = html.replace(oldMonsterDefeated, newMonsterDefeated);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Patches applied.");
