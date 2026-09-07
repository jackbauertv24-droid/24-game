const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const regex = /{ name: "Minotaur Gladiator", url: "assets\/minotaur.jpg", filter: "none" }/;
const replacement = `{ name: "Minotaur Gladiator", url: "assets/minotaur.jpg", filter: "none" },
            { name: "Shadow Assassin", url: "assets/shadow_assassin.jpg", filter: "none" },
            { name: "Stone Gargoyle", url: "assets/stone_gargoyle.jpg", filter: "none" },
            { name: "Swamp Troll", url: "assets/swamp_troll.jpg", filter: "none" }`;

html = html.replace(regex, replacement);
fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Enemies updated.");
