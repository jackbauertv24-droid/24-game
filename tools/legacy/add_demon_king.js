const fs = require('fs');
const path = require('path');

const inputDir = '/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9/';
const outputDir = '/config/vs-workspace/24-game/assets/';

const files = fs.readdirSync(inputDir);
const latest = files.filter(f => f.startsWith('demon_king_')).sort().pop();
const inputPath = path.join(inputDir, latest);
const outPath = path.join(outputDir, 'demon_king.jpg');

fs.copyFileSync(inputPath, outPath);
console.log("Copied Demon King.");

let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');
const regex = /{ name: "Vampire Lord", url: "assets\/vampire_lord.jpg", filter: "none" }/;
const replacement = `{ name: "Vampire Lord", url: "assets/vampire_lord.jpg", filter: "none" },
            { name: "Demon King", url: "assets/demon_king.jpg", filter: "none" }`;
html = html.replace(regex, replacement);
fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
