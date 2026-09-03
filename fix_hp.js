const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

html = html.replace(/gameState\.enemyMaxHP = gameState\.difficulty === 'easy' \? 100 : gameState\.difficulty === 'medium' \? 200 : 300;/g, "gameState.enemyMaxHP = 24;");
html = html.replace(/gameState\.enemyMaxHP = 100 \* Math\.min\(3, Math\.ceil\(gameState\.level \/ 3\)\);/g, "gameState.enemyMaxHP = 24;");
html = html.replace(/if \(gameState\.isPractice\) gameState\.enemyMaxHP = 100;/g, "if (gameState.isPractice) gameState.enemyMaxHP = 24;");

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("HP fixed to 24");
