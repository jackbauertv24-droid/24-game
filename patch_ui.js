const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const classModalStr = `
    <style>
        .class-card { transition: all 0.2s; }
        .class-card:hover { border-color: #fff !important; background: rgba(255,255,255,0.1); transform: translateY(-2px); }
        .floating-text { position: absolute; font-weight: bold; font-size: 24px; pointer-events: none; animation: floatUp 1.2s ease-out forwards; z-index: 100; text-shadow: 0 2px 4px rgba(0,0,0,0.8); white-space: nowrap; }
        @keyframes floatUp { 0% { opacity: 1; transform: translate(-50%, -50%); } 100% { opacity: 0; transform: translate(-50%, -100px); } }
    </style>
    <div class="modal" id="classModal">
        <div class="modal-content" style="max-width: 600px;">
            <h2>Select Your Class</h2>
            <div class="class-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                <div class="class-card" onclick="startGameWithClass('warrior')" style="border: 2px solid #555; padding: 15px; border-radius: 8px; cursor: pointer;">
                    <div style="font-size: 40px;">🪓</div>
                    <h3 style="margin: 5px 0; color: #ff5555;">Warrior</h3>
                    <p style="font-size: 12px; margin-bottom: 5px; color: #aaa;"><strong>Passive:</strong> 2x Damage to Bosses</p>
                    <p style="font-size: 12px; color: #aaa;"><strong>Active:</strong> Skip Puzzle (Costs 10s)</p>
                </div>
                <div class="class-card" onclick="startGameWithClass('rogue')" style="border: 2px solid #555; padding: 15px; border-radius: 8px; cursor: pointer;">
                    <div style="font-size: 40px;">🗡️</div>
                    <h3 style="margin: 5px 0; color: #55ff55;">Rogue</h3>
                    <p style="font-size: 12px; margin-bottom: 5px; color: #aaa;"><strong>Passive:</strong> +20s per solve (instead of 15s)</p>
                    <p style="font-size: 12px; color: #aaa;"><strong>Active:</strong> Gain +10s (Once per Level)</p>
                </div>
                <div class="class-card" onclick="startGameWithClass('wizard')" style="border: 2px solid #555; padding: 15px; border-radius: 8px; cursor: pointer;">
                    <div style="font-size: 40px;">🧙‍♂️</div>
                    <h3 style="margin: 5px 0; color: #5555ff;">Wizard</h3>
                    <p style="font-size: 12px; margin-bottom: 5px; color: #aaa;"><strong>Passive:</strong> 2x Dmg if using ÷</p>
                    <p style="font-size: 12px; color: #aaa;"><strong>Active:</strong> Show Hint (Costs 5s)</p>
                </div>
                <div class="class-card" onclick="startGameWithClass('paladin')" style="border: 2px solid #555; padding: 15px; border-radius: 8px; cursor: pointer;">
                    <div style="font-size: 40px;">🛡️</div>
                    <h3 style="margin: 5px 0; color: #ffff55;">Paladin</h3>
                    <p style="font-size: 12px; margin-bottom: 5px; color: #aaa;"><strong>Passive:</strong> Wrong answers cost -5s</p>
                    <p style="font-size: 12px; color: #aaa;"><strong>Active:</strong> Deal 24 Dmg (Once per Boss)</p>
                </div>
            </div>
            <button class="modal-btn" onclick="document.getElementById('classModal').classList.remove('active'); document.getElementById('modeModal').classList.add('active');">Back</button>
        </div>
    </div>
`;
html = html.replace('<div class="modal" id="modeModal">', classModalStr + '\n    <div class="modal" id="modeModal">');

html = html.replace(
    `<button class="control-btn" id="hintBtn" onclick="showHint()">Hint</button>`,
    `<button class="control-btn" id="skillBtn" onclick="useSkill()" style="background: rgba(100,50,200,0.3); border-color: #9a66ff;">⭐ Skill</button>`
);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("UI Patched.");
