const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Update the button text
html = html.replace(/if \(cls === 'rogue'\) btn\.innerHTML = '🗡️ Pickpocket';/, "if (cls === 'rogue') btn.innerHTML = '🗡️ Sleight of Hand (-5s)';");

// 2. Update the rogue skill logic
const oldRogueLogic = `} else if (cls === 'rogue') {
                if (gameState.skillUses.level >= 1) {
                    showFloatingText('Out of uses!', '#ff5555', 'monsterArea');
                    return;
                }
                gameState.skillUses.level++;
                showFloatingText('Pickpocket!', '#55ff55', 'monsterArea');
                applyTimeChange(10);
            } else if (cls === 'wizard') {`;

const newRogueLogic = `} else if (cls === 'rogue') {
                if (gameState.skillUses.level >= 3) {
                    showFloatingText('Out of uses!', '#ff5555', 'monsterArea');
                    return;
                }
                if (gameState.timer <= 5 && !gameState.isPractice) {
                    showFloatingText('Not enough time!', '#ff5555', 'monsterArea');
                    return;
                }
                
                const diffOps = gameState.difficulty === 'easy' ? ['+', '−'] :
                               gameState.difficulty === 'medium' ? ['+', '−', '×'] :
                               ['+', '−', '×', '÷'];
                               
                let success = false;
                let indices = [0, 1, 2, 3];
                // Try replacing the largest numbers first
                indices.sort((a, b) => currentNumbers[b].value - currentNumbers[a].value);
                
                for (let idx of indices) {
                    let origValue = currentNumbers[idx].value;
                    for (let r = 1; r <= 9; r++) {
                        if (r === origValue) continue;
                        
                        let testNums = currentNumbers.map(n => n.value);
                        testNums[idx] = r;
                        
                        const sols = findSolutions(testNums, diffOps);
                        if (sols.length > 0) {
                            currentNumbers[idx].value = r;
                            currentSolution = sols[0];
                            success = true;
                            break;
                        }
                    }
                    if (success) break;
                }
                
                if (success) {
                    applyTimeChange(-5);
                    gameState.skillUses.level++;
                    showFloatingText('Sleight of Hand!', '#55ff55', 'monsterArea');
                    playSound('select');
                    clearAll(); // resets board selection
                } else {
                    showFloatingText('Cannot swap!', '#ff5555', 'monsterArea');
                }
            } else if (cls === 'wizard') {`;

html = html.replace(oldRogueLogic, newRogueLogic);

// 3. Update the description in the class card
html = html.replace(/<strong>Passive:<\/strong> \+20s per solve \(instead of 15s\)/, '<strong>Passive:</strong> +20s per solve (instead of 15s)<br><strong>Active:</strong> Swap a number (-5s)');

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Rogue skill updated.");
