const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const regex = /{ name: "Minotaur Gladiator", url: "assets\/minotaur_v2.jpg", filter: "none" },/;
const replacement = `{ name: "Minotaur Gladiator (Defective AI Text)", url: "assets/minotaur.jpg", filter: "none", hidden: true },
            { name: "Minotaur Gladiator", url: "assets/minotaur_v2.jpg", filter: "none" },`;

html = html.replace(regex, replacement);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Restored defective minotaur and marked as hidden.");
