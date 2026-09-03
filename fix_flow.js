const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const oldEndless = `        document.getElementById('endlessBtn').onclick = function() {
            gameState.mode = 'endless';
            gameState.isPractice = false;
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('difficultySelect').style.display = 'none';
        };`;

const newEndless = `        document.getElementById('endlessBtn').onclick = function() {
            gameState.mode = 'endless';
            gameState.isPractice = false;
            startGame();
        };`;

const oldPractice = `        document.getElementById('practiceBtn').onclick = function() {
            gameState.mode = 'campaign';
            gameState.isPractice = true;
            gameState.difficulty = 'easy';
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('difficultySelect').style.display = 'none';
        };`;

const newPractice = `        document.getElementById('practiceBtn').onclick = function() {
            gameState.mode = 'campaign';
            gameState.isPractice = true;
            gameState.difficulty = 'easy';
            startGame();
        };`;

html = html.replace(oldEndless, newEndless).replace(oldPractice, newPractice);

// Let's also update the "Start Game" button text to make it clear it belongs to Campaign
html = html.replace('<button class="modal-btn primary" id="startGameBtn" style="margin-top: 16px;">Start Game</button>', '<button class="modal-btn primary" id="startGameBtn" style="margin-top: 16px;">Start Campaign</button>');

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("UI Flow fixed.");
