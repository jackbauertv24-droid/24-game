const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// Inject ENEMIES array
const enemiesArray = `
        const ENEMIES = [
            { name: "Stone Golem", filter: "none" },
            { name: "Magma Golem", filter: "hue-rotate(150deg) saturate(2) brightness(1.2)" },
            { name: "Frost Golem", filter: "hue-rotate(210deg) saturate(1.5) brightness(1.5)" },
            { name: "Toxic Sludge Golem", filter: "hue-rotate(80deg) saturate(2) brightness(1.1)" },
            { name: "Void Golem", filter: "hue-rotate(280deg) saturate(1.5) contrast(1.5)" },
            { name: "Golden Golem", filter: "sepia(1) saturate(3) hue-rotate(10deg) brightness(1.3)" }
        ];
`;

html = html.replace('let timerInterval;', enemiesArray + '        let timerInterval;');

// Update spawnEnemy
const spawnOld = `        function spawnEnemy() {
            if (gameState.mode === 'campaign') {
                const diffLevel = Math.floor(gameState.solvedPuzzles[gameState.difficulty].length / 3);
                gameState.enemyMaxHP = 24 + (diffLevel * 8);
            } else {
                gameState.enemyMaxHP = 24 + (Math.floor((gameState.level - 1) / 2) * 8);
            }
            if (gameState.isPractice) gameState.enemyMaxHP = 24;
            gameState.enemyCurrentHP = gameState.enemyMaxHP;
            
            const sprite = document.getElementById('monsterSprite');
            if (sprite) {
                sprite.classList.remove('defeated', 'hit', 'hit-light', 'dodge');
            }
            
            updateHealthBar();
        }`;

const spawnNew = `        function spawnEnemy() {
            if (gameState.mode === 'campaign') {
                const diffLevel = Math.floor(gameState.solvedPuzzles[gameState.difficulty].length / 3);
                gameState.enemyMaxHP = 24 + (diffLevel * 8);
            } else {
                gameState.enemyMaxHP = 24 + (Math.floor((gameState.level - 1) / 2) * 8);
            }
            if (gameState.isPractice) gameState.enemyMaxHP = 24;
            gameState.enemyCurrentHP = gameState.enemyMaxHP;
            
            const sprite = document.getElementById('monsterSprite');
            if (sprite) {
                sprite.classList.remove('defeated', 'hit', 'hit-light', 'dodge');
                
                // Pick a random enemy variant
                const enemyType = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
                sprite.style.filter = enemyType.filter;
            }
            
            updateHealthBar();
        }`;

html = html.replace(spawnOld, spawnNew);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Enemies added.");
