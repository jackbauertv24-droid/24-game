const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Update Class Modal UI
html = html.replace('<strong>Passive:</strong> 2x Dmg if using ÷', '<strong>Passive:</strong> +10s if using Division (÷)');
html = html.replace('<strong>Active:</strong> Show Hint (Costs 5s)', '<strong>Active:</strong> Show Hint (Costs 20s)');

// 2. Update Button UI
html = html.replace("if (cls === 'wizard') btn.innerHTML = '🧙‍♂️ Clairvoyance';", "if (cls === 'wizard') btn.innerHTML = '🧙‍♂️ Clairvoyance (-20s)';");

// 3. Update useSkill logic
html = html.replace(/if \(gameState.timer <= 5 && !gameState.isPractice\) \{\n                    showFloatingText\('Not enough time!', '#ff5555', 'monsterArea'\);\n                    return;\n                \}\n                applyTimeChange\(-5\);/g, 
`if (gameState.timer <= 20 && !gameState.isPractice) {
                    showFloatingText('Not enough time!', '#ff5555', 'monsterArea');
                    return;
                }
                applyTimeChange(-20);`);

// 4. Update submit logic
const oldSubmitBlock = `if (gameState.playerClass === 'wizard' && selectedOperators.includes('÷')) {
                damage = 48;
                setTimeout(() => {
                    playSound('magic');
                    showFloatingText('🔮 Arcane Surge!', '#5555ff', 'monsterArea');
                }, 200);
            }
            
            doDamage(damage);
            
            let timeGain = 15;
            if (gameState.playerClass === 'rogue') {
                timeGain = 20;
                setTimeout(() => {
                    playSound('coin');
                    showFloatingText('🪙 +20s', '#55ff55', 'monsterArea');
                }, 300);
            }
            applyTimeChange(timeGain);`;

const newSubmitBlock = `if (gameState.playerClass === 'wizard' && selectedOperators.includes('÷')) {
                setTimeout(() => {
                    playSound('magic');
                    showFloatingText('🔮 Arcane Surge!', '#5555ff', 'monsterArea');
                }, 200);
            }
            
            doDamage(damage);
            
            let timeGain = 15;
            if (gameState.playerClass === 'rogue') {
                timeGain = 20;
                setTimeout(() => {
                    playSound('coin');
                    showFloatingText('🪙 +20s', '#55ff55', 'monsterArea');
                }, 300);
            }
            if (gameState.playerClass === 'wizard' && selectedOperators.includes('÷')) {
                timeGain += 10;
                setTimeout(() => {
                    showFloatingText('⏱️ +10s', '#5555ff', 'monsterArea');
                }, 600);
            }
            applyTimeChange(timeGain);`;

html = html.replace(oldSubmitBlock, newSubmitBlock);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Wizard updated.");
