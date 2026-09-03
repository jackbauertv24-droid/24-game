const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

// simulate setup
window.gameState = {
    started: true,
    mode: 'campaign',
    difficulty: 'easy',
    level: 1,
    playerClass: 'warrior',
    timer: 60,
    maxTime: 60,
    solvedPuzzles: { easy: [], medium: [], hard: [] },
    currentPuzzleIndex: 0
};
window.currentNumbers = [];
window.selectedNumbers = [];
window.selectedOperators = [];

// Try to use skill
try {
    window.useSkill();
    console.log("Skill executed successfully.");
    console.log("Current puzzle index is now:", window.gameState.currentPuzzleIndex);
} catch (e) {
    console.error("Error executing skill:", e);
}
