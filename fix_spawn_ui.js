const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Fix the CSS margin
html = html.replace('margin: -20px auto 15px auto;', 'margin: 5px auto 15px auto;');

// 2. Add updateHealthBar() to the end of spawnEnemy
const spawnEndRegex = /sprite\.style\.filter = enemyType\.filter;\n            \}\n        \}/;
const spawnEndReplacement = `sprite.style.filter = enemyType.filter;
            }
            updateHealthBar();
        }`;
html = html.replace(spawnEndRegex, spawnEndReplacement);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Spawn and UI bugs fixed.");
