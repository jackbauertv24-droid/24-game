const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Make the Golem much bigger
html = html.replace(/width: 140px;[\s]*height: 140px;/, "width: 250px;\n            height: 250px;");

// 2. Remove the Undo and Clear buttons
html = html.replace(/<button class="action-btn" id="undoBtn">[^<]*<\/button>/g, '');
html = html.replace(/<button class="action-btn" id="clearBtn">[^<]*<\/button>/g, '');
html = html.replace(/document\.getElementById\('undoBtn'\)\.onclick = undo;/g, '');
html = html.replace(/document\.getElementById\('clearBtn'\)\.onclick = clearAll;/g, '');

// 3. Make tapping the expression box clear the selection
html = html.replace(/<div class="expression-area" id="expressionArea"/, '<div class="expression-area" id="expressionArea" onclick="clearAll()" style="cursor:pointer;" title="Tap to clear"');
html = html.replace(/<span class="expression-placeholder">Start with any card<\/span>/, '<span class="expression-placeholder">Start with any card (Tap here to clear)</span>');

// 4. Remove the annoying 2.5s delay
// In startGame:
const startGameRegex = /window\.glWalk\(\);\n\s*setTimeout\(\(\) => \{\n\s*loadPuzzle\(\);\n\s*startTimer\(\);\n\s*\}, 2500\);/g;
html = html.replace(startGameRegex, 'loadPuzzle();\n            startTimer();');

// In nextLevel:
const nextLevelRegex = /window\.glWalk\(\);\n\s*setTimeout\(\(\) => \{\n\s*spawnEnemy\(\);\n\s*loadPuzzle\(\);\n\s*startTimer\(\);\n\s*\}, 2500\);/g;
const newNextLevel = `window.glWalk();
            setTimeout(() => {
                spawnEnemy();
                loadPuzzle();
                startTimer();
            }, 600);`;
html = html.replace(nextLevelRegex, newNextLevel);

// In window.glWalk:
const glWalkRegex = /setTimeout\(\(\) => \{\n\s*sprite\.classList\.remove\('hit', 'hit-light', 'dodge', 'defeated'\);\n\s*sprite\.style\.opacity = '1';\n\s*\}, 2000\);/g;
const newGlWalk = `setTimeout(() => {
                    sprite.classList.remove('hit', 'hit-light', 'dodge', 'defeated');
                    sprite.style.opacity = '1';
                }, 500);`;
html = html.replace(glWalkRegex, newGlWalk);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("UI updated.");
