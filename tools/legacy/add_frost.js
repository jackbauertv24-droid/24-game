const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const regex = /{ name: "Void Stalker", url: "assets\/void_stalker.jpg", filter: "none" }/;
const replacement = `{ name: "Void Stalker", url: "assets/void_stalker.jpg", filter: "none" },
            { name: "Frost Giant", url: "assets/frost_giant.jpg", filter: "none" }`;

html = html.replace(regex, replacement);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Frost Giant added.");
