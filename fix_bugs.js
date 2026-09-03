const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Fix gameState initialization
html = html.replace(/bestStreak: 0\n        };/, `bestStreak: 0,\n            skillUses: { level: 0, boss: 0 },\n            playerClass: 'warrior'\n        };`);

// 2. Fix Monster Positioning
html = html.replace(/sprite\.style\.transform = 'translateX\(-50%\) scale\(1\.3\)';/g, "sprite.style.transform = 'scale(1.3)';");
html = html.replace(/sprite\.style\.transform = 'translateX\(-50%\) scale\(1\)';/g, "sprite.style.transform = 'scale(1)';");

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Bugs fixed.");
