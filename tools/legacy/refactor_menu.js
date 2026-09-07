const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Remove the old difficultySelect and startGameBtn
const diffSelectRegex = /<div id="difficultySelect"[\s\S]*?<\/div>\n            <\/div>/;
html = html.replace(diffSelectRegex, '');

const startBtnRegex = /<button class="modal-btn primary" id="startGameBtn"[\s\S]*?<\/button>/;
html = html.replace(startBtnRegex, '');

// 2. Inject the new difficultyModal right before classModal
const newModal = `
    <div class="modal" id="difficultyModal">
        <div class="modal-content" style="max-width: 400px;">
            <h2>⚔️ Campaign Difficulty</h2>
            <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
                <button class="mode-btn" onclick="selectDifficulty('easy')" style="text-align: left; background: rgba(85, 255, 85, 0.1); border-color: #55ff55;">
                    🟢 Easy
                    <small>Numbers 1-10. Operators: <b>+ , −</b></small>
                </button>
                <button class="mode-btn" onclick="selectDifficulty('medium')" style="text-align: left; background: rgba(255, 255, 85, 0.1); border-color: #ffff55;">
                    🟡 Medium
                    <small>Numbers 1-13. Operators: <b>+ , − , ×</b></small>
                </button>
                <button class="mode-btn" onclick="selectDifficulty('hard')" style="text-align: left; background: rgba(255, 85, 85, 0.1); border-color: #ff5555;">
                    🔴 Hard
                    <small>Numbers 1-13. Operators: <b>+ , − , × , ÷</b></small>
                </button>
            </div>
        </div>
    </div>
    <div class="modal" id="classModal">`;
html = html.replace('<div class="modal" id="classModal">', newModal);

// 3. Update the JS logic
const oldCampaignClick = `        document.getElementById('campaignBtn').onclick = function() {
            gameState.mode = 'campaign';
            gameState.isPractice = false;
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('difficultySelect').style.display = 'block';
            document.getElementById('startGameBtn').style.display = 'block';
        };`;

const newCampaignClick = `        document.getElementById('campaignBtn').onclick = function() {
            gameState.mode = 'campaign';
            gameState.isPractice = false;
            document.getElementById('modeModal').classList.remove('active');
            document.getElementById('difficultyModal').classList.add('active');
        };
        
        window.selectDifficulty = function(diff) {
            gameState.difficulty = diff;
            document.getElementById('difficultyModal').classList.remove('active');
            document.getElementById('classModal').classList.add('active');
        };`;
        
html = html.replace(oldCampaignClick, newCampaignClick);

// 4. Remove old difficulty-btn handlers and startGameBtn handlers
html = html.replace(/document\.querySelectorAll\('\.difficulty-btn'\)\.forEach\(btn => \{[\s\S]*?\}\);/m, '');
html = html.replace(/document\.getElementById\('startGameBtn'\)\.onclick = startGame;/g, '');

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Main menu refactored.");
