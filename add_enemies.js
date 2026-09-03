const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const regex = /{ name: "Swamp Troll", url: "assets\/swamp_troll.jpg", filter: "none" }/;
const replacement = `{ name: "Swamp Troll", url: "assets/swamp_troll.jpg", filter: "none" },
            { name: "Death Knight", url: "assets/death_knight.jpg", filter: "none" },
            { name: "Venomous Basilisk", url: "assets/venom_basilisk.jpg", filter: "none" },
            { name: "Storm Elemental", url: "assets/storm_elemental.jpg", filter: "none" }`;

html = html.replace(regex, replacement);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Enemies added.");
