const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

html = html.replace('<div style="font-size: 40px;">🪓</div>', '<img src="assets/class_warrior.jpg" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 6px; margin-bottom: 10px; border: 2px solid #444; box-shadow: 0 4px 8px rgba(0,0,0,0.5);" alt="Warrior">');
html = html.replace('<div style="font-size: 40px;">🗡️</div>', '<img src="assets/class_rogue.jpg" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 6px; margin-bottom: 10px; border: 2px solid #444; box-shadow: 0 4px 8px rgba(0,0,0,0.5);" alt="Rogue">');
html = html.replace('<div style="font-size: 40px;">🧙‍♂️</div>', '<img src="assets/class_wizard.jpg" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 6px; margin-bottom: 10px; border: 2px solid #444; box-shadow: 0 4px 8px rgba(0,0,0,0.5);" alt="Wizard">');
html = html.replace('<div style="font-size: 40px;">🛡️</div>', '<img src="assets/class_paladin.jpg" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 6px; margin-bottom: 10px; border: 2px solid #444; box-shadow: 0 4px 8px rgba(0,0,0,0.5);" alt="Paladin">');

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Portraits updated.");
