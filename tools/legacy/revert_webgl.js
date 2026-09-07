const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Remove the Canvas
html = html.replace(/<canvas id="webgl-canvas"[\s\S]*?<\/canvas>/, '');

// 2. Restore Background CSS
html = html.replace(/background: #111115;/, "background: url('assets/bg_dungeon.jpg') center/cover no-repeat fixed, #111;");

// 3. Remove 3D Engine Script but KEEP the Sprite animation hooks and Floating Damage
const webglScriptRegex = /\/\/ --- 3D ENGINE ---[\s\S]*?\/\/ --- END 3D ENGINE ---/;
const lightweightHooks = `// --- 2D ANIMATION HOOKS ---
        window.glHit = () => { 
            const sprite = document.getElementById('monsterSprite');
            if(sprite) {
                sprite.classList.remove('hit', 'hit-light', 'dodge', 'defeated');
                void sprite.offsetWidth;
                sprite.classList.add('hit-light');
            }
        };
        window.glBlock = () => { 
            const sprite = document.getElementById('monsterSprite');
            if(sprite) {
                sprite.classList.remove('hit', 'hit-light', 'dodge', 'defeated');
                void sprite.offsetWidth;
                sprite.classList.add('dodge');
            }
        };
        window.glDeath = () => { 
            const sprite = document.getElementById('monsterSprite');
            if(sprite) {
                sprite.classList.remove('hit', 'hit-light', 'dodge', 'defeated');
                void sprite.offsetWidth;
                sprite.classList.add('defeated');
            }
        };
        window.glWalk = () => { 
            const sprite = document.getElementById('monsterSprite');
            if(sprite) {
                sprite.style.transition = 'opacity 0.5s';
                sprite.style.opacity = '0';
                setTimeout(() => {
                    sprite.classList.remove('hit', 'hit-light', 'dodge', 'defeated');
                    sprite.style.opacity = '1';
                }, 2000);
            }
        };
        
        window.showFloatingDamage = (amt) => {
            const div = document.createElement('div');
            div.className = 'floating-dmg';
            div.textContent = amt;
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 1000);
        };
        // --- END 2D ANIMATION HOOKS ---`;

html = html.replace(webglScriptRegex, lightweightHooks);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("WebGL removed, 2D restored.");
