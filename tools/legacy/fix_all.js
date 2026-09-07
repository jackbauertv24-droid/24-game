const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Inject ENEMIES array above spawnEnemy
const enemiesStr = `
        const ENEMIES = [
            { name: "Stone Golem", url: "assets/golem_spritesheet.jpg" },
            { name: "Skeleton Warrior", url: "assets/skeleton.jpg" },
            { name: "Goblin Thief", url: "assets/goblin.jpg" },
            { name: "Vampire Bat", url: "assets/bat.jpg" },
            { name: "Beholder", url: "assets/beholder.jpg" },
            { name: "Red Dragon", url: "assets/dragon.jpg" }
        ];
        
        function spawnEnemy() {`;

html = html.replace(/function spawnEnemy\(\) \{/, enemiesStr);

// 2. Modify spawnEnemy body to set background image
const spawnOld = `                sprite.classList.remove('defeated', 'hit', 'hit-light', 'dodge');
            }
            
            updateHealthBar();`;
const spawnNew = `                sprite.classList.remove('defeated', 'hit', 'hit-light', 'dodge');
                
                // Pick a random enemy variant
                const enemyType = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
                sprite.style.backgroundImage = \`url('\${enemyType.url}')\`;
            }
            
            updateHealthBar();`;
html = html.replace(spawnOld, spawnNew);

// 3. Fix Operator Undo logic
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
console.log("Everything applied!");
