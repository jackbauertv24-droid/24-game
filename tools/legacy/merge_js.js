const fs = require('fs');

const jsContent = fs.readFileSync('/config/vs-workspace/24-game/game.js', 'utf-8');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

html = html.replace('<script src="game.js"></script>', '<script>\n' + jsContent + '\n</script>');

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Merged back into a single file.");
