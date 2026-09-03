const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

html = html.replace('<p style="font-size: 12px; color: #aaa;"><strong>Active:</strong> Gain +10s (Once per Level)</p>', '');

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Rogue description fixed.");
