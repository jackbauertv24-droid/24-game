const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const nextLevelOld = `window.glWalk();
            setTimeout(() => {
                loadPuzzle();
                startTimer();
            }, 1000);`;
const nextLevelNew = `window.glWalk();
            setTimeout(() => {
                loadPuzzle();
                startTimer();
            }, 2500);`;
html = html.replace(nextLevelOld, nextLevelNew);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
