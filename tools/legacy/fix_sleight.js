const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Update Rogue logic to only allow strictly smaller numbers
const oldLogic = `for (let idx of indices) {
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
                }`;

const newLogic = `let swappedIdx = -1;
                for (let idx of indices) {
                    let origValue = currentNumbers[idx].value;
                    for (let r = 1; r < origValue; r++) { // Strictly smaller
                        let testNums = currentNumbers.map(n => n.value);
                        testNums[idx] = r;
                        
                        const sols = findSolutions(testNums, diffOps);
                        if (sols.length > 0) {
                            currentNumbers[idx].value = r;
                            currentSolution = sols[0];
                            success = true;
                            swappedIdx = idx;
                            break;
                        }
                    }
                    if (success) break;
                }`;

html = html.replace(oldLogic, newLogic);

// 2. Add visual effect logic
const oldSuccess = `if (success) {
                    applyTimeChange(-5);
                    gameState.skillUses.level++;
                    showFloatingText('Sleight of Hand!', '#55ff55', 'monsterArea');
                    playSound('select');
                    clearAll(); // resets board selection
                } else {`;

const newSuccess = `if (success) {
                    applyTimeChange(-5);
                    gameState.skillUses.level++;
                    showFloatingText('Sleight of Hand!', '#55ff55', 'monsterArea');
                    playSound('select');
                    clearAll(); 
                    
                    // Trigger dramatic visual effect
                    const card = document.getElementById('number-' + swappedIdx);
                    if (card) {
                        card.classList.add('flash-magic');
                        setTimeout(() => card.classList.remove('flash-magic'), 1000);
                    }
                } else {`;

html = html.replace(oldSuccess, newSuccess);

// 3. Inject CSS animation for the card
const cssInject = `
        @keyframes magicSwap {
            0% { transform: scale(1); box-shadow: 0 0 0 transparent; background: var(--card-bg); color: var(--light); }
            30% { transform: scale(1.15) rotate(5deg); box-shadow: 0 0 25px #55ff55; background: #55ff55; color: #000; }
            70% { transform: scale(1.15) rotate(-5deg); box-shadow: 0 0 25px #55ff55; background: #55ff55; color: #000; }
            100% { transform: scale(1); box-shadow: 0 0 0 transparent; background: var(--card-bg); color: var(--light); }
        }
        .flash-magic {
            animation: magicSwap 0.8s ease-out;
            border-color: #55ff55 !important;
            z-index: 20;
        }
`;

if (!html.includes('magicSwap')) {
    html = html.replace('</style>', cssInject + '\n    </style>');
}

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Sleight of Hand updated.");
