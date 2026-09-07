const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

html = html.replace("showFloatingText('Cannot swap!', '#ff5555', 'monsterArea');", "showFloatingText('No easier swap possible!', '#ff5555', 'monsterArea');");

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Message updated.");
