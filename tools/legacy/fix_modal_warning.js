const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const target = '<p>Choose your game mode:</p>';
const replacement = '<p>Choose your game mode:</p>\n            <div style="font-size: 13px; color: #fff; background: rgba(255,50,50,0.2); padding: 8px 12px; border-radius: 8px; text-align: center; margin-bottom: 15px; border: 1px solid rgba(255,50,50,0.4);">\n                ⚠️ <b>Warning:</b> Math is evaluated strictly Left-to-Right!\n            </div>';

html = html.replace(target, replacement);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Modal warning added.");
