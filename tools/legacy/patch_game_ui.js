const fs = require('fs');
let js = fs.readFileSync('/config/vs-workspace/24-game/game.js', 'utf-8');

const classInit = `window.pendingClass = cls;
            initGame();`;
const classInitNew = `window.pendingClass = cls;
            
            const btn = document.getElementById('skillBtn');
            if (btn) {
                if (cls === 'warrior') btn.innerHTML = '🪓 Intimidate';
                if (cls === 'rogue') btn.innerHTML = '🗡️ Pickpocket';
                if (cls === 'wizard') btn.innerHTML = '🧙‍♂️ Clairvoyance';
                if (cls === 'paladin') btn.innerHTML = '🛡️ Smite';
            }
            
            initGame();`;
            
js = js.replace(classInit, classInitNew);
fs.writeFileSync('/config/vs-workspace/24-game/game.js', js, 'utf-8');
console.log("Game JS skill button updated.");
