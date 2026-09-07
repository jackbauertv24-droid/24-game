const fs = require('fs');

let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// Fix 1: Soft Lock in nextLevel
const oldNext = `            setTimeout(() => {
                spawnEnemy();
                loadPuzzle();
                startTimer();
            }, 600);`;
const newNext = `            setTimeout(() => {
                spawnEnemy();
                loadPuzzle();
                startTimer();
                gameState.started = true;
            }, 600);`;
html = html.replace(oldNext, newNext);

// Fix 2: Soft Lock in retryLevel
const oldRetry = `            spawnEnemy(true);
            startTimer();
        }`;
const newRetry = `            spawnEnemy(true);
            startTimer();
            gameState.started = true;
        }`;
html = html.replace(oldRetry, newRetry);

// Fix 3: Boss Multi-Hit Exploit
const oldSubmitElse = `            } else {
                // Boss takes a hit but survives, load next puzzle
                setTimeout(() => {
                    clearAll();
                    loadPuzzle();
                }, 600);
            }`;
const newSubmitElse = `            } else {
                gameState.started = false; // Prevent multi-hit during animation
                // Boss takes a hit but survives, load next puzzle
                setTimeout(() => {
                    clearAll();
                    loadPuzzle();
                    gameState.started = true;
                }, 600);
            }`;
html = html.replace(oldSubmitElse, newSubmitElse);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Applied V4 fixes.");
