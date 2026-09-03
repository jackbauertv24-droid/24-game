const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');

if (scriptStart !== -1 && scriptEnd !== -1) {
    const jsContent = html.substring(scriptStart + 8, scriptEnd);
    fs.writeFileSync('/config/vs-workspace/24-game/game.js', jsContent, 'utf-8');
    
    html = html.substring(0, scriptStart) + '<script src="game.js"></script>' + html.substring(scriptEnd + 9);
    fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
    console.log("Successfully extracted game.js");
} else {
    console.log("Could not find script block.");
}
