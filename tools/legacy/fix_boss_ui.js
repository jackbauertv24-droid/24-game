const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const healthHtmlOld = `<div class="monster-health-bar-container">
                        <div class="monster-health-bar" id="monsterHealth"></div>
                    </div>`;

const healthHtmlNew = `<div id="bossLabel" style="display: none; color: #ff5555; font-weight: bold; text-align: center; font-size: 20px; text-shadow: 0 0 10px #ff0000; letter-spacing: 2px; margin-bottom: 5px;">⚠️ BOSS ⚠️</div>
                    <div class="monster-health-bar-container" style="position: relative;">
                        <div class="monster-health-bar" id="monsterHealth"></div>
                        <div id="hpText" style="position: absolute; width: 100%; text-align: center; color: white; font-weight: bold; font-size: 14px; top: 1px; text-shadow: 1px 1px 2px #000;">24/24</div>
                    </div>`;

html = html.replace(healthHtmlOld, healthHtmlNew);

// Now update updateHealthBar()
const updateHealthOld = `function updateHealthBar() {
            const bar = document.getElementById('monsterHealth');
            if (bar) {
                const hpPct = Math.max(0, (gameState.enemyCurrentHP / gameState.enemyMaxHP) * 100);
                bar.style.width = hpPct + '%';
            }
        }`;
        
const updateHealthNew = `function updateHealthBar() {
            const bar = document.getElementById('monsterHealth');
            if (bar) {
                const hpPct = Math.max(0, (gameState.enemyCurrentHP / gameState.enemyMaxHP) * 100);
                bar.style.width = hpPct + '%';
            }
            const hpText = document.getElementById('hpText');
            if (hpText) {
                hpText.textContent = Math.max(0, gameState.enemyCurrentHP) + '/' + gameState.enemyMaxHP;
            }
        }`;
        
html = html.replace(updateHealthOld, updateHealthNew);

// Finally, update spawnEnemy to show/hide boss label
const spawnRegex = /function spawnEnemy\(keepSame = false\) \{[\s\S]*?if \(!keepSame\) \{/;
const spawnNew = `function spawnEnemy(keepSame = false) {
            const isBoss = (gameState.level % 5 === 0);
            gameState.enemyMaxHP = isBoss ? 72 : 24;
            if (gameState.isPractice) gameState.enemyMaxHP = 24;
            
            const bossLabel = document.getElementById('bossLabel');
            if (bossLabel) {
                bossLabel.style.display = isBoss && !gameState.isPractice ? 'block' : 'none';
            }
            
            if (!keepSame) {`;

html = html.replace(spawnRegex, spawnNew);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Boss UI fixed.");
