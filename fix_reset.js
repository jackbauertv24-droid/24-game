const fs = require('fs');
let js = fs.readFileSync('/config/vs-workspace/24-game/game.js', 'utf-8');

js = js.replace(/isPractice: preservedStats\.isPractice,/, `isPractice: preservedStats.isPractice,
                playerClass: window.pendingClass || 'warrior',
                skillUses: { level: 0, boss: 0 },`);

fs.writeFileSync('/config/vs-workspace/24-game/game.js', js, 'utf-8');
console.log("Fixed resetGame.");
