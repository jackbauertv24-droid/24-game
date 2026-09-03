const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Scale down the golem so it fits on mobile
const scaleOld = `scene.add(golem);
        }`;
const scaleNew = `golem.scale.set(0.4, 0.4, 0.4);
            golem.position.y = -2; // lower it slightly
            scene.add(golem);
        }`;
html = html.replace(scaleOld, scaleNew);

// 2. Make the camera walk slower and more dramatic
const walkOld = `window.glWalk = () => { 
            targetCamZ -= 20; 
            golemBaseZ -= 20; 
            setTimeout(() => {
                buildGolem();
                golemState = 'idle';
            }, 1000);
        };`;
const walkNew = `window.glWalk = () => { 
            targetCamZ -= 30; // walk deeper
            golemBaseZ -= 30; 
            // the old golem is already 'dead', leave it behind.
            // spawn the new golem slightly later for a longer walk
            setTimeout(() => {
                buildGolem();
                golemState = 'idle';
            }, 2500); 
        };`;
html = html.replace(walkOld, walkNew);

// 3. Make the camera lerp slightly slower for a more majestic feel
const lerpOld = `camera.position.z += (targetCamZ - camera.position.z) * 0.05;`;
const lerpNew = `camera.position.z += (targetCamZ - camera.position.z) * 0.02; // smoother, slower walk`;
html = html.replace(lerpOld, lerpNew);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Golem scaled and walk animation adjusted.");
