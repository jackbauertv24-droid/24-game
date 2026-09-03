const { JSDOM } = require('jsdom');
const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');
html = html.replace('</body>', `
<script>
    setTimeout(() => {
        gameState.started = true;
        gameState.mode = 'campaign';
        gameState.difficulty = 'easy';
        gameState.playerClass = 'warrior';
        gameState.timer = 60;
        
        loadPuzzle();
        console.log("Initial puzzle index:", gameState.currentPuzzleIndex);
        let n1 = currentNumbers.map(n=>n.value).join(',');
        
        useSkill();
        console.log("After useSkill, puzzle index:", gameState.currentPuzzleIndex);
        let n2 = currentNumbers.map(n=>n.value).join(',');
        
        console.log(n1, "->", n2);
    }, 500);
</script>
</body>`);
const dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole: new (require("jsdom").VirtualConsole)().sendTo(console) });
