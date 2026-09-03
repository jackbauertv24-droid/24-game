const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const regex = /@media \(max-width: 480px\), \(max-height: 850px\) \{[\s\S]*?\}\n        \}/;

const replacement = `@media (max-width: 480px), (max-height: 850px) {
            .game-container { padding: 2px 4px; justify-content: space-evenly; }
            .header { padding: 4px 6px; font-size: 12px; margin-bottom: 2px; flex-wrap: wrap; }
            .game-area { gap: 4px; }
            .display-zone { gap: 2px; }
            /* Sprite deliberately omitted to preserve native 250px high-res rendering */
            .monster-area { margin: 0px auto; }
            .monster-health-bar-container { height: 14px; margin: 0px auto 4px auto; width: 90%; }
            .gamepad { gap: 4px; }
            .numbers-row, .operators-row { gap: 4px; }
            .number-card { width: 60px; height: 55px; font-size: 22px; }
            .operator-btn { width: 46px; height: 46px; font-size: 20px; }
            .action-btn { padding: 8px 4px; font-size: 12px; }
            .expression-area { min-height: 45px; padding: 4px 8px; }
            .expression-formula { font-size: 15px; }
            .expression-live-total { font-size: 20px; min-height: 22px; }
            #bossLabel { font-size: 14px; margin-bottom: 0px; }
            .controls { gap: 4px; margin-top: 2px; }
        }`;

if(html.match(regex)) {
    html = html.replace(regex, replacement);
    fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
    console.log("Mobile CSS updated to preserve sprite size.");
} else {
    console.log("Regex did not match!");
}
