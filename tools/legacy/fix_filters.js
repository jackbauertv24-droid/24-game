const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

html = html.replace(/mask-image: radial-gradient\(circle at center, black 50%, transparent 70%\);/, 
    "mask-image: radial-gradient(circle at center, black 50%, transparent 70%);\n            filter: var(--enemy-filter, none);");

html = html.replace(/@keyframes animHit \{[\s\S]*?\}/, 
    "@keyframes animHit {\n            0% { background-position: 0% 33.33%; filter: var(--enemy-filter, none) brightness(2) hue-rotate(-50deg); }\n            50% { background-position: 33.33% 33.33%; filter: var(--enemy-filter, none) brightness(1.5); }\n            100% { background-position: 33.33% 33.33%; filter: var(--enemy-filter, none); }\n        }");

html = html.replace(/@keyframes animBlock \{[\s\S]*?\}/, 
    "@keyframes animBlock {\n            0% { background-position: 66.66% 33.33%; filter: var(--enemy-filter, none) brightness(1.2); }\n            50% { background-position: 100% 33.33%; filter: var(--enemy-filter, none) brightness(1); }\n            100% { background-position: 100% 33.33%; filter: var(--enemy-filter, none); }\n        }");

html = html.replace(/@keyframes animDefeat \{[\s\S]*?\}/, 
    "@keyframes animDefeat {\n            0% { background-position: 0% 100%; filter: var(--enemy-filter, none) brightness(2) hue-rotate(-50deg); }\n            25% { background-position: 33.33% 100%; filter: var(--enemy-filter, none) brightness(2) hue-rotate(-50deg); }\n            50% { background-position: 66.66% 100%; filter: var(--enemy-filter, none); }\n            75% { background-position: 100% 100%; filter: var(--enemy-filter, none); }\n            100% { background-position: 100% 100%; opacity: 0; filter: var(--enemy-filter, none); }\n        }");

// Change the JS assignment from sprite.style.filter to sprite.style.setProperty
html = html.replace(/sprite\.style\.filter = enemyType\.filter;/, "sprite.style.setProperty('--enemy-filter', enemyType.filter);");

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Filters fixed.");
