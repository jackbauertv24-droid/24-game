const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// Add touch-action to buttons
html = html.replace('button {', 'button {\n            touch-action: manipulation;');
if (!html.includes('touch-action: manipulation')) {
    html = html.replace('body {', 'button { touch-action: manipulation; }\n        body {');
}

// Disable preserve-3d on mobile
const mobileMediaEnd = /#bossLabel \{ font-size: 14px; margin-bottom: 0px; \}\n            \.controls \{ gap: 4px; margin-top: 2px; \}/;

if(html.match(mobileMediaEnd)) {
    const replacement = `#bossLabel { font-size: 14px; margin-bottom: 0px; }
            .controls { gap: 4px; margin-top: 2px; }
            .gamepad-3d-wrapper { transform-style: flat; perspective: none; }
            .number-card, .operator-btn { transform-style: flat; }
            .number-card:focus-visible, .operator-btn:focus-visible { transform: none; box-shadow: none; border-color: var(--primary); }
            .number-card:active, .operator-btn:active { transform: scale(0.95); box-shadow: none; }`;
    html = html.replace(mobileMediaEnd, replacement);
}

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Lag fixed.");
