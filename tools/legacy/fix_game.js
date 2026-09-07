const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// Update ENEMIES array
const enemiesOld = /const ENEMIES = \[\s*\{ name: "Stone Golem", filter: "none" \},[\s\S]*?\];/;
const enemiesNew = `const ENEMIES = [
            { name: "Stone Golem", url: "assets/golem_spritesheet.jpg" },
            { name: "Skeleton Warrior", url: "assets/skeleton.jpg" },
            { name: "Goblin Thief", url: "assets/goblin.jpg" },
            { name: "Vampire Bat", url: "assets/bat.jpg" },
            { name: "Beholder", url: "assets/beholder.jpg" },
            { name: "Red Dragon", url: "assets/dragon.jpg" }
        ];`;
html = html.replace(enemiesOld, enemiesNew);

// Update spawnEnemy
html = html.replace(/sprite\.style\.setProperty\('--enemy-filter', enemyType\.filter\);/, "sprite.style.backgroundImage = `url('${enemyType.url}')`;\n                sprite.style.setProperty('--enemy-filter', 'none');");

// Update selectOperator
const opOld = `        function selectOperator(op) {
            if (!gameState.started) return;
            
            // Only allow operator if there's a number to follow it
            if (selectedOperators.length >= selectedNumbers.length) return;
            
            playSound('operator');
            
            if (selectedOperators.length < 3) {
                selectedOperators.push(op);
                updateExpression();
            }
        }`;

const opNew = `        function selectOperator(op) {
            if (!gameState.started) return;
            playSound('operator');
            
            if (selectedOperators.length >= selectedNumbers.length) {
                if (selectedOperators.length > 0) {
                    if (selectedOperators[selectedOperators.length - 1] === op) {
                        selectedOperators.pop();
                    } else {
                        selectedOperators[selectedOperators.length - 1] = op;
                    }
                    updateExpression();
                }
                return;
            }
            
            if (selectedOperators.length < 3) {
                selectedOperators.push(op);
                updateExpression();
            }
        }`;
html = html.replace(opOld, opNew);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Game fixed.");
