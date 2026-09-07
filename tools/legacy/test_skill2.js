const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

setTimeout(() => {
    const window = dom.window;
    window.gameState.started = true;
    window.gameState.mode = 'campaign';
    window.gameState.difficulty = 'easy';
    window.gameState.playerClass = 'warrior';
    window.gameState.timer = 60;
    
    // start game
    window.loadPuzzle();
    console.log("Initial puzzle index:", window.gameState.currentPuzzleIndex);
    
    window.useSkill();
    console.log("After useSkill, puzzle index:", window.gameState.currentPuzzleIndex);
    
    const numsBefore = window.currentNumbers.map(n=>n.value).join(',');
    window.useSkill();
    console.log("After useSkill 2, puzzle index:", window.gameState.currentPuzzleIndex);
    const numsAfter = window.currentNumbers.map(n=>n.value).join(',');
    console.log(numsBefore, "->", numsAfter);
}, 1000);
