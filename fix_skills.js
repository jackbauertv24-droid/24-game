const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Fix Warrior Skip
const oldWarrior = `if (cls === 'warrior') {
                if (gameState.timer <= 10 && !gameState.isPractice) {
                    showFloatingText('Not enough time!', '#ff5555', 'monsterArea');
                    return;
                }
                applyTimeChange(-10);
                showFloatingText('Intimidate!', '#ff5555', 'monsterArea');
                playCombatEffect('block');
                clearAll();
                loadPuzzle();
            } else if (cls === 'rogue') {`;

const newWarrior = `if (cls === 'warrior') {
                if (gameState.timer <= 10 && !gameState.isPractice) {
                    showFloatingText('Not enough time!', '#ff5555', 'monsterArea');
                    return;
                }
                applyTimeChange(-10);
                showFloatingText('Intimidate!', '#ff5555', 'monsterArea');
                playCombatEffect('block');
                clearAll();
                if (gameState.mode === 'campaign') {
                    const puzzles = CAMPAIGN_PUZZLES[gameState.difficulty];
                    gameState.currentPuzzleIndex = (gameState.currentPuzzleIndex + 1) % puzzles.length;
                }
                loadPuzzle();
            } else if (cls === 'rogue') {`;

html = html.replace(oldWarrior, newWarrior);

// 2. Fix Wizard Multiple Activations
const oldWizard = `} else if (cls === 'wizard') {
                if (gameState.timer <= 5 && !gameState.isPractice) {
                    showFloatingText('Not enough time!', '#ff5555', 'monsterArea');
                    return;
                }
                applyTimeChange(-5);
                showFloatingText('Clairvoyance!', '#5555ff', 'monsterArea');
                showHint();
            } else if (cls === 'paladin') {`;

const newWizard = `} else if (cls === 'wizard') {
                if (document.getElementById('hint').classList.contains('visible')) {
                    showFloatingText('Already active!', '#5555ff', 'monsterArea');
                    return;
                }
                if (gameState.timer <= 5 && !gameState.isPractice) {
                    showFloatingText('Not enough time!', '#ff5555', 'monsterArea');
                    return;
                }
                applyTimeChange(-5);
                showFloatingText('Clairvoyance!', '#5555ff', 'monsterArea');
                showHint();
            } else if (cls === 'paladin') {`;

html = html.replace(oldWizard, newWizard);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Skills fixed.");
