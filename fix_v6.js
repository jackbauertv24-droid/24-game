const fs = require('fs');

let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// Unify gameOver() logic
const oldGameOver = `        function gameOver() {
            gameState.started = false;
            cancelAutoSubmit();
            clearInterval(timerInterval);
            document.getElementById('failModal').classList.add('active');
        }`;
const newGameOver = `        function gameOver() {
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
        }`;
html = html.replace(oldGameOver, newGameOver);

// Simplify startTimer() to use gameOver()
const oldStartTimer = `                if (gameState.timer <= 0) {
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
                }`;
const newStartTimer = `                if (gameState.timer <= 0) {
                    gameOver();
                    return;
                }`;
html = html.replace(oldStartTimer, newStartTimer);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Applied V6 unified death state fix.");
