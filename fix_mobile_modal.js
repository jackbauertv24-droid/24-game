const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const insertion = `
            .modal-content { padding: 16px; width: 95%; }
            .mode-btn { padding: 10px; margin: 6px 0; font-size: 15px; }
            .mode-btn small { font-size: 11px; margin-top: 2px; display: block; }
            .stats-panel { gap: 4px; margin-bottom: 5px; }
            .stat-card { padding: 4px 2px; }
            .class-grid { gap: 8px !important; margin: 10px 0 !important; }
            .class-card { padding: 8px !important; }
            .class-card p { font-size: 10px !important; line-height: 1.2; margin-bottom: 2px !important; }
`;

// Insert it right before the closing brace of the main media query
const regex = /#bossLabel \{ font-size: 14px; margin-bottom: 0px; \}\n            \.controls \{ gap: 4px; margin-top: 2px; \}\n        \}/;

if(html.match(regex)) {
    const replacement = `#bossLabel { font-size: 14px; margin-bottom: 0px; }
            .controls { gap: 4px; margin-top: 2px; }` + insertion + `        }`;
    html = html.replace(regex, replacement);
    fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
    console.log("Mobile modal CSS updated.");
} else {
    console.log("Regex did not match!");
}
