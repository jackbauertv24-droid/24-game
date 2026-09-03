const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

html = html.replace(/spawnEnemy\(\);\n\s*loadPuzzle\(\);\n\s*startTimer\(\);/, 
"window.glWalk();\n            setTimeout(() => {\n                spawnEnemy();\n                loadPuzzle();\n                startTimer();\n            }, 2500);");

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Next Level replaced.");
