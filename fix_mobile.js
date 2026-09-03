const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const regex = /@media \(max-width: 390px\) \{[\s\S]*?\}\n        \}/;

const replacement = `@media (max-width: 480px), (max-height: 850px) {
            .game-container { padding: 4px 8px; justify-content: space-evenly; }
            .header { padding: 8px 10px; font-size: 13px; margin-bottom: 5px; }
            .game-area { gap: 6px; }
            .display-zone { gap: 4px; }
            .monster-sprite { width: 150px; height: 150px; }
            .monster-area { margin: 2px auto; }
            .monster-health-bar-container { height: 16px; margin: 2px auto 5px auto; }
            .gamepad { gap: 6px; }
            .numbers-row, .operators-row { gap: 6px; }
            .number-card { width: 64px; height: 68px; font-size: 26px; }
            .operator-btn { width: 50px; height: 50px; font-size: 22px; }
            .action-btn { padding: 10px 4px; font-size: 13px; }
            .expression-area { min-height: 60px; padding: 6px 10px; }
            .expression-formula { font-size: 16px; }
            .expression-live-total { font-size: 24px; min-height: 26px; }
            #bossLabel { font-size: 16px; margin-bottom: 2px; }
            .controls { gap: 8px; margin-top: 5px; }
        }`;

if(html.match(regex)) {
    html = html.replace(regex, replacement);
    fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
    console.log("Mobile CSS fixed.");
} else {
    console.log("Regex did not match!");
}
