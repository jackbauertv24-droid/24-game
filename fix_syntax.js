const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

html = html.replace(`            if (gameState.timer <= 0) {
                gameState.timer = 0;
                document.getElementById('timer').textContent = 0;
                gameOver();
                return false;
            }
            return true; else {
                document.getElementById('timer').textContent = gameState.timer;
            }`, `            if (gameState.timer <= 0) {
                gameState.timer = 0;
                document.getElementById('timer').textContent = 0;
                gameOver();
                return false;
            } else {
                document.getElementById('timer').textContent = gameState.timer;
                return true;
            }`);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Syntax fixed.");
