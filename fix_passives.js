const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Paladin feedback
const oldPaladin = `let penalty = -10;
                if (gameState.playerClass === 'paladin') penalty = -5;
                applyTimeChange(penalty);`;

const newPaladin = `let penalty = -10;
                if (gameState.playerClass === 'paladin') {
                    penalty = -5;
                    setTimeout(() => {
                        playSound('shield');
                        showFloatingText('🛡️ Blocked!', '#ffff55', 'monsterArea');
                    }, 100);
                }
                applyTimeChange(penalty);`;
html = html.replace(oldPaladin, newPaladin);

// 2. Warrior and Wizard feedback
const oldDmg = `const isBoss = (gameState.level % 5 === 0);
            let damage = 24;
            if (gameState.playerClass === 'warrior' && isBoss) damage = 48;
            if (gameState.playerClass === 'wizard' && selectedOperators.includes('÷')) damage = 48;
            
            doDamage(damage);`;
            
const newDmg = `const isBoss = (gameState.level % 5 === 0);
            let damage = 24;
            if (gameState.playerClass === 'warrior' && isBoss) {
                damage = 48;
                setTimeout(() => {
                    playSound('critical');
                    showFloatingText('💥 Critical!', '#ff5555', 'monsterArea');
                }, 200);
            }
            if (gameState.playerClass === 'wizard' && selectedOperators.includes('÷')) {
                damage = 48;
                setTimeout(() => {
                    playSound('magic');
                    showFloatingText('🔮 Arcane Surge!', '#5555ff', 'monsterArea');
                }, 200);
            }
            
            doDamage(damage);`;
html = html.replace(oldDmg, newDmg);

// 3. Rogue feedback
const oldRogue = `let timeGain = (gameState.playerClass === 'rogue') ? 20 : 15;
            applyTimeChange(timeGain);`;

const newRogue = `let timeGain = 15;
            if (gameState.playerClass === 'rogue') {
                timeGain = 20;
                setTimeout(() => {
                    playSound('coin');
                    showFloatingText('🪙 +20s', '#55ff55', 'monsterArea');
                }, 300);
            }
            applyTimeChange(timeGain);`;
html = html.replace(oldRogue, newRogue);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Passive feedbacks added.");
