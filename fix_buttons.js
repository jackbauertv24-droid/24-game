const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// Remove HTML buttons
html = html.replace(/<div class="move-tools"[\s\S]*?<\/div>/, '');

// Remove JS listeners
html = html.replace(/document\.getElementById\('undoBtn'\)\.onclick = undoLastMove;/g, '');

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Buttons actually removed.");
