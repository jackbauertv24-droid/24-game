const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

html = html.replace(/document\.getElementById\('hintBtn'\)\.onclick = showHint;/g, '');

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Crash fixed.");
