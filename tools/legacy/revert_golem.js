const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Restore the CSS Sprite Sheet background
html = html.replace('/* removed */', "background-image: url('assets/golem_spritesheet.jpg');");

// 2. Remove display:none from the HTML
html = html.replace('style="display:none;"', '');

// 3. Rip out the 3D Golem rendering logic
const golemBuildRegex = /function buildGolem\(\) \{[\s\S]*?scene\.add\(golem\);\n        \}/;
html = html.replace(golemBuildRegex, 'function buildGolem() { /* Reverted to 2D CSS Sprite */ }');

// 4. Rip out the Golem Animation logic from animate3D
const animateStateRegex = /\/\/ Golem State Machine[\s\S]*?renderer\.render\(scene, camera\);/m;
const newAnimateState = `// Only render the 3D tunnel, ignore golem state
            renderer.render(scene, camera);`;
html = html.replace(animateStateRegex, newAnimateState);

// 5. Re-map the WebGL triggers to trigger the CSS animations instead
const hitTriggerOld = `window.glHit = () => { golemState = 'hit'; stateTimer = 0; };`;
const hitTriggerNew = `window.glHit = () => { 
            const sprite = document.getElementById('monsterSprite');
            if(sprite) {
                sprite.classList.remove('hit', 'hit-light', 'dodge', 'defeated');
                void sprite.offsetWidth;
                sprite.classList.add('hit-light');
            }
        };`;
html = html.replace(hitTriggerOld, hitTriggerNew);

const blockTriggerOld = `window.glBlock = () => { golemState = 'block'; stateTimer = 0; };`;
const blockTriggerNew = `window.glBlock = () => { 
            const sprite = document.getElementById('monsterSprite');
            if(sprite) {
                sprite.classList.remove('hit', 'hit-light', 'dodge', 'defeated');
                void sprite.offsetWidth;
                sprite.classList.add('dodge');
            }
        };`;
html = html.replace(blockTriggerOld, blockTriggerNew);

const deathTriggerOld = `window.glDeath = () => { golemState = 'death'; stateTimer = 0; };`;
const deathTriggerNew = `window.glDeath = () => { 
            const sprite = document.getElementById('monsterSprite');
            if(sprite) {
                sprite.classList.remove('hit', 'hit-light', 'dodge', 'defeated');
                void sprite.offsetWidth;
                sprite.classList.add('defeated');
            }
        };`;
html = html.replace(deathTriggerOld, deathTriggerNew);

// 6. Update glWalk to fade out the old sprite and fade in the new one
const walkTriggerOld = `window.glWalk = () => { 
            targetCamZ -= 30; // walk deeper
            golemBaseZ -= 30; 
            // the old golem is already 'dead', leave it behind.
            // spawn the new golem slightly later for a longer walk
            setTimeout(() => {
                buildGolem();
                golemState = 'idle';
            }, 2500); 
        };`;
const walkTriggerNew = `window.glWalk = () => { 
            targetCamZ -= 30;
            const sprite = document.getElementById('monsterSprite');
            if(sprite) sprite.style.opacity = '0'; // hide dead monster while walking
            setTimeout(() => {
                if(sprite) {
                    sprite.classList.remove('hit', 'hit-light', 'dodge', 'defeated');
                    sprite.style.opacity = '1';
                }
            }, 2500); 
        };`;
html = html.replace(walkTriggerOld, walkTriggerNew);

// Also remove `scene.remove(golem)` safety check in glWalk just in case
fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Restored CSS Golem.");
