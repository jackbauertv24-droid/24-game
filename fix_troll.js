const fs = require('fs');
const path = require('path');

const inputDir = '/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9/';
const outputDir = '/config/vs-workspace/24-game/assets/';

const files = fs.readdirSync(inputDir);
const latest = files.filter(f => f.startsWith('swamp_troll_v2')).sort().pop();
const inputPath = path.join(inputDir, latest);
const outPath = path.join(outputDir, 'swamp_troll_v2.jpg');

fs.copyFileSync(inputPath, outPath);
console.log("Copied Swamp Troll v2.");

let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');
const oldTrollRegex = /{ name: "Swamp Troll", url: "assets\/swamp_troll.jpg", filter: "none" }/;
const newTrollReplacement = `{ name: "Swamp Troll (Bugged)", url: "assets/swamp_troll.jpg", filter: "none", hidden: true },
            { name: "Swamp Troll", url: "assets/swamp_troll_v2.jpg", filter: "none" }`;
html = html.replace(oldTrollRegex, newTrollReplacement);
fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
