const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

html = html.replace(/\}\n\s*\}\n\n\s*\.combat-effect/, "}\n\n        .combat-effect");

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Bracket fixed.");
