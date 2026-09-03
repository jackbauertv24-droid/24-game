const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Fix default visibility of difficultySelect
html = html.replace('<div id="difficultySelect" style="display: none;">', '<div id="difficultySelect" style="display: block;">');

// 2. Fix renderOperators logic
const oldRenderOps = `const allowedOps = gameState.mode === 'endless' && gameState.level <= 10 ? ['+', '−'] :
                              gameState.mode === 'endless' && gameState.level <= 20 ? ['+', '−', '×'] :
                              gameState.mode === 'campaign' && gameState.difficulty === 'easy' ? ['+', '−'] :
                              ['+', '−', '×', '÷'];`;

const newRenderOps = `const allowedOps = gameState.mode === 'endless' && gameState.level <= 10 ? ['+', '−'] :
                              gameState.mode === 'endless' && gameState.level <= 20 ? ['+', '−', '×'] :
                              gameState.mode === 'campaign' && gameState.difficulty === 'easy' ? ['+', '−'] :
                              gameState.mode === 'campaign' && gameState.difficulty === 'medium' ? ['+', '−', '×'] :
                              ['+', '−', '×', '÷'];`;
                              
html = html.replace(oldRenderOps, newRenderOps);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Difficulty selector and operators fixed.");
