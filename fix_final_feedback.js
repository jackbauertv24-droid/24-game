const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Fix updateHealthBar to ACTUALLY update the text
const oldHealth = `function updateHealthBar() {
            const bar = document.getElementById('monsterHealth');
            if (bar) {
                bar.style.width = \`\${Math.max(0, (gameState.enemyCurrentHP / gameState.enemyMaxHP) * 100)}%\`;
            }
        }`;

const newHealth = `function updateHealthBar() {
            const bar = document.getElementById('monsterHealth');
            if (bar) {
                bar.style.width = \`\${Math.max(0, (gameState.enemyCurrentHP / gameState.enemyMaxHP) * 100)}%\`;
            }
            const hpText = document.getElementById('hpText');
            if (hpText) {
                hpText.textContent = Math.max(0, gameState.enemyCurrentHP) + '/' + gameState.enemyMaxHP;
            }
        }`;
        
html = html.replace(oldHealth, newHealth);

// 2. Make Sleight of Hand visual effect much stronger and longer
const oldAnimation = `        @keyframes magicSwap {
            0% { transform: scale(1); box-shadow: 0 0 0 transparent; background: var(--card-bg); color: var(--light); }
            30% { transform: scale(1.15) rotate(5deg); box-shadow: 0 0 25px #55ff55; background: #55ff55; color: #000; }
            70% { transform: scale(1.15) rotate(-5deg); box-shadow: 0 0 25px #55ff55; background: #55ff55; color: #000; }
            100% { transform: scale(1); box-shadow: 0 0 0 transparent; background: var(--card-bg); color: var(--light); }
        }
        .flash-magic {
            animation: magicSwap 0.8s ease-out;`;
            
const newAnimation = `        @keyframes magicSwap {
            0% { transform: scale(1); box-shadow: 0 0 0 transparent; background: var(--card-bg); color: var(--light); }
            15% { transform: scale(1.4) rotate(15deg); box-shadow: 0 0 40px #55ff55; background: #55ff55; color: #000; }
            35% { transform: scale(1.4) rotate(-15deg); box-shadow: 0 0 40px #55ff55; background: #55ff55; color: #000; }
            55% { transform: scale(1.4) rotate(15deg); box-shadow: 0 0 40px #55ff55; background: #55ff55; color: #000; }
            75% { transform: scale(1.4) rotate(-15deg); box-shadow: 0 0 40px #55ff55; background: #55ff55; color: #000; }
            100% { transform: scale(1); box-shadow: 0 0 0 transparent; background: var(--card-bg); color: var(--light); }
        }
        .flash-magic {
            animation: magicSwap 2.0s ease-out;`;

html = html.replace(oldAnimation, newAnimation);

// 3. Update the timeout removal for the card
html = html.replace(/setTimeout\(\(\) => card\.classList\.remove\('flash-magic'\), 1000\);/g, "setTimeout(() => card.classList.remove('flash-magic'), 2100);");

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Health text and visual effects updated.");
