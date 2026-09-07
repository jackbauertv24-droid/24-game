const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const regex = /bossLabel\.style\.display = isBoss && !gameState\.isPractice \? 'block' : 'none';\n            \}/;
const replacement = `bossLabel.style.display = isBoss && !gameState.isPractice ? 'block' : 'none';
            }
            
            const isActuallyBoss = isBoss && !gameState.isPractice;
            document.body.style.background = isActuallyBoss 
                ? "url('assets/bg_boss.jpg') center/cover no-repeat fixed, #111" 
                : "url('assets/bg_dungeon.jpg') center/cover no-repeat fixed, #111";`;

html = html.replace(regex, replacement);
fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Boss background logic added.");
