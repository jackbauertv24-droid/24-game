const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const regex = /if \(cls === 'warrior'\) \{[\s\S]*?\} else if \(cls === 'rogue'\) \{/;
const replacement = `if (cls === 'warrior') {
                if (gameState.timer <= 10 && !gameState.isPractice) {
                    showFloatingText('Not enough time!', '#ff5555', 'monsterArea');
                    return;
                }
                applyTimeChange(-10);
                showFloatingText('Intimidate!', '#ff5555', 'monsterArea');
                playCombatEffect('slash-heavy');
                clearAll();
                
                if (gameState.mode === 'campaign') {
                    if (!gameState.solvedPuzzles[gameState.difficulty].includes(gameState.currentPuzzleIndex)) {
                        gameState.solvedPuzzles[gameState.difficulty].push(gameState.currentPuzzleIndex);
                        localStorage.setItem('24-game-solved', JSON.stringify(gameState.solvedPuzzles));
                    }
                    const puzzles = CAMPAIGN_PUZZLES[gameState.difficulty];
                    gameState.currentPuzzleIndex = (gameState.currentPuzzleIndex + 1) % puzzles.length;
                }
                
                doDamage(24);
                if (gameState.enemyCurrentHP <= 0) {
                    setTimeout(monsterDefeated, 500);
                } else {
                    setTimeout(loadPuzzle, 500);
                }
            } else if (cls === 'rogue') {`;

if (html.match(regex)) {
    html = html.replace(regex, replacement);
    fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
    console.log("Warrior Intimidate fixed.");
} else {
    console.log("Regex failed.");
}
