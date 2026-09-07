const fs = require('fs');
let js = fs.readFileSync('/config/vs-workspace/24-game/game.js', 'utf-8');

const retryOld = `function retryLevel() {
            document.getElementById('failModal').classList.remove('active');
            clearAll();
            gameState.timer = getTimerForLevel();
            gameState.maxTime = gameState.timer;
            document.getElementById('timer').textContent = gameState.timer;
            document.getElementById('progress').style.width = '100%';
            spawnEnemy(true);
            startTimer();
        }`;
const retryNew = `function retryLevel() {
            document.getElementById('failModal').classList.remove('active');
            clearAll();
            gameState.timer = 60; // Base time for a fresh retry
            gameState.maxTime = 60;
            document.getElementById('timer').textContent = gameState.timer;
            document.getElementById('progress').style.width = '100%';
            gameState.enemyCurrentHP = gameState.enemyMaxHP; // Reset HP
            spawnEnemy(true);
            startTimer();
        }`;

js = js.replace(retryOld, retryNew);
fs.writeFileSync('/config/vs-workspace/24-game/game.js', js, 'utf-8');
console.log("Retry patched.");
