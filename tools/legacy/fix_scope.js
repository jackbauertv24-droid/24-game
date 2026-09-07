const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

html = html.replace('const rockTex = createNoiseTexture', 'window.rockTex = createNoiseTexture');
html = html.replace('const stoneTex = createNoiseTexture', 'window.stoneTex = createNoiseTexture');
html = html.replace('bumpMap: stoneTex', 'bumpMap: window.stoneTex');
html = html.replace('bumpMap: rockTex', 'bumpMap: window.rockTex');

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Scope fixed.");
