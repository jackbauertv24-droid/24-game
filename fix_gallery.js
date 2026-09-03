const fs = require('fs');

let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const oldGallery = `<div class="modal" id="galleryModal">
        <div class="modal-content" style="max-width: 450px;">
            <h2>📖 Monster Bestiary</h2>
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 15px 0;">
                <button class="modal-btn" id="galPrevBtn" style="min-width: 40px; padding: 10px;">◀</button>
                <div style="width: 280px; height: 320px; position: relative; background: url('assets/bg_dungeon.jpg') center/cover; border-radius: 12px; overflow: hidden; border: 2px solid var(--card-border);">
                    <div id="galSprite" class="monster-sprite" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);"></div>
                </div>
                <button class="modal-btn" id="galNextBtn" style="min-width: 40px; padding: 10px;">▶</button>
            </div>
            <h3 id="galName" style="margin-bottom: 15px; color: var(--secondary); text-align: center; font-size: 24px;"></h3>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                <button class="modal-btn primary" onclick="playGalAnim('hit')">Hit</button>
                <button class="modal-btn primary" onclick="playGalAnim('dodge')">Block</button>
                <button class="modal-btn primary" onclick="playGalAnim('defeated')">Defeat</button>
            </div>
            <button class="modal-btn" id="galCloseBtn" style="margin-top: 15px; width: 100%;">Close</button>
        </div>
    </div>`;

const newGallery = `<div class="modal" id="galleryModal">
        <div class="modal-content" style="max-width: 400px; padding: 20px;">
            <h2 style="margin-bottom: 10px; font-size: 22px;">📖 Monster Bestiary</h2>
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
                <button id="galPrevBtn" style="background: transparent; border: none; color: white; font-size: 40px; cursor: pointer; padding: 5px; line-height: 1; display: flex; align-items: center; outline: none; -webkit-tap-highlight-color: transparent;">◀</button>
                <div style="width: 250px; height: 250px; position: relative; background: url('assets/bg_dungeon.jpg') center/cover; border-radius: 12px; overflow: hidden; border: 2px solid var(--card-border);">
                    <div id="galSprite" class="monster-sprite" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);"></div>
                </div>
                <button id="galNextBtn" style="background: transparent; border: none; color: white; font-size: 40px; cursor: pointer; padding: 5px; line-height: 1; display: flex; align-items: center; outline: none; -webkit-tap-highlight-color: transparent;">▶</button>
            </div>
            <h3 id="galName" style="margin-bottom: 12px; color: var(--secondary); text-align: center; font-size: 20px;"></h3>
            <div style="display: flex; gap: 8px; justify-content: center;">
                <button class="modal-btn primary" onclick="playGalAnim('hit')" style="padding: 8px 12px; min-width: auto; flex: 1; font-size: 14px;">Hit</button>
                <button class="modal-btn primary" onclick="playGalAnim('dodge')" style="padding: 8px 12px; min-width: auto; flex: 1; font-size: 14px;">Block</button>
                <button class="modal-btn primary" onclick="playGalAnim('defeated')" style="padding: 8px 12px; min-width: auto; flex: 1; font-size: 14px;">Defeat</button>
            </div>
            <button class="modal-btn" id="galCloseBtn" style="margin-top: 10px; width: 100%; padding: 12px;">Close</button>
        </div>
    </div>`;

html = html.replace(oldGallery, newGallery);
fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Updated Gallery UI.");
