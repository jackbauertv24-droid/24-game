const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const oldDefeat = `        function monsterDefeated() {
            gameState.started = false; // Lock out the UI during transition`;
            
const newDefeat = `        function monsterDefeated() {
            if (!gameState.started) return; // Completely mitigates Warrior bypass and Zombie state
            gameState.started = false; // Lock out the UI during transition`;

html = html.replace(oldDefeat, newDefeat);
fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Final exploit variants patched.");
