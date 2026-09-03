const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const spawnRegex = /function spawnEnemy\(\) \{[\s\S]*?updateHealthBar\(\);\s*\}/;

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

html = html.replace(spawnRegex, spawnNew);

const retryRegex = /document\.getElementById\('progress'\)\.style\.width = '100%';\s*spawnEnemy\(\);\s*startTimer\(\);/;
const retryNew = `document.getElementById('progress').style.width = '100%';
            spawnEnemy(true);
            startTimer();`;
html = html.replace(retryRegex, retryNew);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Retry logic fixed properly.");
