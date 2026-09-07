const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

html = html.replace('<div class="stats-panel open" id="statsPanel" aria-label="Game statistics" style="margin-bottom: 20px;">', '<div class="stats-panel open" id="statsPanel" aria-label="Game statistics">');

html = html.replace('<p>Choose your game mode:</p>', '');

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("HTML fixed.");
