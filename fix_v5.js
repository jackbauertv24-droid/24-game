const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// Fix 1: retryLevel timer and skills
const oldRetry = `        function retryLevel() {
            document.getElementById('failModal').classList.remove('active');
            clearAll();
            gameState.timer = 60; // Base time for a fresh retry
            gameState.maxTime = 60;`;
const newRetry = `        function retryLevel() {
            document.getElementById('failModal').classList.remove('active');
            clearAll();
            gameState.timer = getTimerForLevel(); // Base time for a fresh retry
            gameState.maxTime = gameState.timer;
            gameState.skillUses.level = 0;
            if (gameState.level % 5 === 0 || (gameState.level-1) % 5 === 0) {
                gameState.skillUses.boss = 0;
            }`;
html = html.replace(oldRetry, newRetry);

// Fix 2: playedCount on wrong answer
const oldWrong = `                let penalty = -10;
                if (gameState.playerClass === 'paladin') {`;
const newWrong = `                if (!gameState.isPractice) {
                    gameState.playedCount++;
                    saveStats();
                }
                let penalty = -10;
                if (gameState.playerClass === 'paladin') {`;
html = html.replace(oldWrong, newWrong);

// Fix 3: Invalid Division Cue
const oldCue = `            cue.textContent = selectedNumbers.length === 4
                ? (calc.value === 24 ? 'Complete — submitting…' : 'Complete — checking…')
                : selectedNumbers.length === selectedOperators.length`;
const newCue = `            cue.textContent = selectedNumbers.length === 4
                ? (calc.status === 'invalid' ? 'Invalid operation!' : (calc.value === 24 ? 'Complete — submitting…' : 'Complete — checking…'))
                : selectedNumbers.length === selectedOperators.length`;
html = html.replace(oldCue, newCue);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("V5 logic bugs patched.");
