const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const spawnOld = `function spawnEnemy() {
            if (gameState.mode === 'campaign') {
                gameState.enemyMaxHP = 24;
            } else {
                gameState.enemyMaxHP = 24;
            }
            if (gameState.isPractice) gameState.enemyMaxHP = 24;
            gameState.enemyCurrentHP = gameState.enemyMaxHP;
            
            const sprite = document.getElementById('monsterSprite');
            if (sprite) {
                sprite.classList.remove('defeated', 'hit', 'hit-light', 'dodge');
                
                const activeEnemies = ENEMIES.filter(e => !e.hidden);
                const enemyType = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
                sprite.style.backgroundImage = \`url('\${enemyType.url}')\`;
                sprite.style.transition = 'opacity 0.4s';
                sprite.style.opacity = '1';
            }
            
            updateHealthBar();
        }`;

const spawnNew = `function spawnEnemy(keepSame = false) {
            if (gameState.mode === 'campaign') {
                gameState.enemyMaxHP = 24;
            } else {
                gameState.enemyMaxHP = 24;
            }
            if (gameState.isPractice) gameState.enemyMaxHP = 24;
            gameState.enemyCurrentHP = gameState.enemyMaxHP;
            
            const sprite = document.getElementById('monsterSprite');
            if (sprite) {
                sprite.classList.remove('defeated', 'hit', 'hit-light', 'dodge');
                
                if (!keepSame || !gameState.currentEnemy) {
                    const activeEnemies = ENEMIES.filter(e => !e.hidden);
                    gameState.currentEnemy = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
                }
                const enemyType = gameState.currentEnemy;
                
                sprite.style.backgroundImage = \`url('\${enemyType.url}')\`;
                sprite.style.transition = 'opacity 0.4s';
                sprite.style.opacity = '1';
            }
            
            updateHealthBar();
        }`;

html = html.replace(spawnOld, spawnNew);

const retryOld = `document.getElementById('progress').style.width = '100%';
            spawnEnemy();
            startTimer();`;
const retryNew = `document.getElementById('progress').style.width = '100%';
            spawnEnemy(true);
            startTimer();`;
html = html.replace(retryOld, retryNew);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Retry logic fixed.");
