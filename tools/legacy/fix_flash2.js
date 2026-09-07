const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const spawnOld = "sprite.style.backgroundImage = `url('${enemyType.url}')`;";
const spawnNew = `sprite.style.backgroundImage = \`url('\${enemyType.url}')\`;
                sprite.style.transition = 'opacity 0.4s';
                sprite.style.opacity = '1';`;
html = html.replace(spawnOld, spawnNew);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Flash fixed properly.");
