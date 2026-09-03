const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Fix Undo by removing pointer-events: none from used cards
const cssUsedOld = `        .number-card.used {
            opacity: 0.3;
            pointer-events: none;
            transform: translateZ(0px) translateY(8px) scale(0.97);
            box-shadow: 0 1px 0 #0d1a24, 0 2px 5px rgba(0,0,0,0.4);
            filter: grayscale(1);
        }`;
const cssUsedNew = `        .number-card.used {
            opacity: 0.3;
            /* pointer-events intentionally left active to allow Undo via tap */
            transform: translateZ(0px) translateY(8px) scale(0.97);
            box-shadow: 0 1px 0 #0d1a24, 0 2px 5px rgba(0,0,0,0.4);
            filter: grayscale(1);
        }`;
html = html.replace(cssUsedOld, cssUsedNew);

// 2. Move stats panel to the modeModal and remove the toggle button
const statsHtmlOld = `            <button class="stats-toggle" id="statsToggle" type="button" aria-expanded="false" aria-controls="statsPanel">View stats</button>

            <div class="stats-panel" id="statsPanel" aria-label="Game statistics">
                <div class="stat-card"><strong id="statSolved">0</strong><span>Solved</span></div>
                <div class="stat-card"><strong id="statPlayed">0</strong><span>Played</span></div>
                <div class="stat-card"><strong id="statAccuracy">0%</strong><span>Accuracy</span></div>
                <div class="stat-card"><strong id="statBestStreak">0</strong><span>Best streak</span></div>
            </div>`;
html = html.replace(statsHtmlOld, '');

// Inject statsPanel into the mode modal right before the mode buttons
const modalHeader = `<p>Choose your game mode:</p>`;
const modalHeaderWithStats = `            <div class="stats-panel open" id="statsPanel" aria-label="Game statistics" style="margin-bottom: 20px;">
                <div class="stat-card"><strong id="statSolved">0</strong><span>Solved</span></div>
                <div class="stat-card"><strong id="statPlayed">0</strong><span>Played</span></div>
                <div class="stat-card"><strong id="statAccuracy">0%</strong><span>Accuracy</span></div>
                <div class="stat-card"><strong id="statBestStreak">0</strong><span>Best streak</span></div>
            </div>
            <p>Choose your game mode:</p>`;
html = html.replace(modalHeader, modalHeaderWithStats);

// Remove the toggle logic from JS
const jsToggleOld = `        document.getElementById('statsToggle').onclick = () => {
            const panel = document.getElementById('statsPanel');
            const open = panel.classList.toggle('open');
            document.getElementById('statsToggle').setAttribute('aria-expanded', String(open));
            document.getElementById('statsToggle').textContent = open ? 'Hide stats' : 'View stats';
        };`;
html = html.replace(jsToggleOld, '');

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Undo and Stats fixed.");
