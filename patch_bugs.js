const fs = require('fs');

let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Timer Interval Bug
html = html.replace('}, 2500);', '}, 1000);');

// 2. Card Deselection Bug
// Instead of complex splice/slice, if they deselect a card, just clear the selection completely.
const oldSelectLogic = `            if (selectedNumbers.includes(idx)) {
                const removeIndex = selectedNumbers.indexOf(idx);
                selectedNumbers.splice(removeIndex, 1);
                currentNumbers[idx].used = false;
                
                if (selectedOperators.length >= selectedNumbers.length) {
                    selectedOperators = selectedOperators.slice(0, Math.max(0, selectedNumbers.length - 1));
                }
            } else {`;
const newSelectLogic = `            if (selectedNumbers.includes(idx)) {
                clearSelection();
                return;
            } else {`;
html = html.replace(oldSelectLogic, newSelectLogic);

// 3. Kamikaze Warrior Bug + applyTimeChange return value
const oldApplyTimeChange = `        function applyTimeChange(amt) {
            if (gameState.isPractice) return;
            gameState.timer += amt;
            if (gameState.timer > 999) gameState.timer = 999;
            
            const color = amt > 0 ? '#55ff55' : '#ff5555';
            const sign = amt > 0 ? '+' : '';
            showFloatingText(sign + amt + 's', color, 'timer');
            
            if (gameState.timer <= 0) {
                gameState.timer = 0;
                document.getElementById('timer').textContent = 0;
                gameOver();
            }`;
const newApplyTimeChange = `        function applyTimeChange(amt) {
            if (gameState.isPractice) return true;
            gameState.timer += amt;
            if (gameState.timer > 999) gameState.timer = 999;
            
            const color = amt > 0 ? '#55ff55' : '#ff5555';
            const sign = amt > 0 ? '+' : '';
            showFloatingText(sign + amt + 's', color, 'timer');
            
            if (gameState.timer <= 0) {
                gameState.timer = 0;
                document.getElementById('timer').textContent = 0;
                gameOver();
                return false;
            }
            return true;`;
html = html.replace(oldApplyTimeChange, newApplyTimeChange);

html = html.replace('applyTimeChange(-10);', 'if (!applyTimeChange(-10)) return;');
html = html.replace('applyTimeChange(-20);', 'if (!applyTimeChange(-20)) return;');

// 4. "Double Kill" Infinite Farm Exploit
const oldMonsterDefeated = `        function monsterDefeated() {
            if (gameState.timer > 0 && !gameState.isPractice) {`;
const newMonsterDefeated = `        function monsterDefeated() {
            gameState.started = false; // Prevent further interactions during transition
            if (gameState.timer > 0 && !gameState.isPractice) {`;
html = html.replace(oldMonsterDefeated, newMonsterDefeated);

// 5. UI Anchor Bug
html = html.replace('id="timerContainer">⏱️ <span id="timer">', 'id="timerContainer" style="position: relative;">⏱️ <span id="timer" style="position: relative;">');

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Patched all bugs.");
