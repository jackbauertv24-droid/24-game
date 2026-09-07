const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Fix glWalk
const glWalkOld = /window\.glWalk = \(\) => \{[\s\S]*?\}, 500\);\n\s*\}\n\s*\};/;
const glWalkNew = `window.glWalk = () => { 
            const sprite = document.getElementById('monsterSprite');
            if(sprite) {
                sprite.style.transition = 'opacity 0.4s';
                sprite.style.opacity = '0';
            }
        };`;
html = html.replace(glWalkOld, glWalkNew);

// 2. Fix spawnEnemy
const spawnEnemyOld = /const activeEnemies = ENEMIES\.filter\(e => !e\.hidden\);\n\s*const enemyType = activeEnemies\[Math\.floor\(Math\.random\(\) \* activeEnemies\.length\)\];\n\s*sprite\.style\.backgroundImage = \`url\('\$\{enemyType\.url\}'\)\`;\n\s*sprite\.style\.setProperty\('--enemy-filter', enemyType\.filter\);/;
const spawnEnemyNew = `const activeEnemies = ENEMIES.filter(e => !e.hidden);
                const enemyType = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
                sprite.style.backgroundImage = \`url('\${enemyType.url}')\`;
                sprite.style.setProperty('--enemy-filter', enemyType.filter);
                
                // Fade in new enemy
                sprite.style.transition = 'opacity 0.4s';
                sprite.style.opacity = '1';`;
html = html.replace(spawnEnemyOld, spawnEnemyNew);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Flash fixed.");
