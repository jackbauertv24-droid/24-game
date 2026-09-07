const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const oldRogueDesc = `<p style="font-size: 12px; margin-bottom: 5px; color: #aaa;"><strong>Passive:</strong> +20s per solve (instead of 15s)<br><strong>Active:</strong> Swap a number (-5s)</p>
                    
                </div>`;

const newRogueDesc = `<p style="font-size: 12px; margin-bottom: 5px; color: #aaa;"><strong>Passive:</strong> +20s per solve</p>
                    <p style="font-size: 12px; color: #aaa;"><strong>Active:</strong> Swap a number (-5s)</p>
                </div>`;

html = html.replace(oldRogueDesc, newRogueDesc);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("UI formatting fixed.");
