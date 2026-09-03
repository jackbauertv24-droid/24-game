const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const regex = /{ name: "Storm Elemental", url: "assets\/storm_elemental.jpg", filter: "none" }/;
const replacement = `{ name: "Storm Elemental", url: "assets/storm_elemental.jpg", filter: "none" },
            { name: "Void Stalker", url: "assets/void_stalker.jpg", filter: "none" }`;

html = html.replace(regex, replacement);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Void Stalker added.");
