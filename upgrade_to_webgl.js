const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Add Three.js to <head>
const threeJsCdn = `\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>`;
html = html.replace('</title>', '</title>' + threeJsCdn);

// 2. Add Canvas to HTML
const canvasHtml = `\n    <canvas id="webgl-canvas" style="position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-1;"></canvas>`;
html = html.replace('<div class="game-container">', canvasHtml + '\n    <div class="game-container">');

// 3. Update CSS Background & Hide Old Sprite
html = html.replace(/background: url\('assets\/bg_dungeon.jpg'\) center\/cover no-repeat fixed, #111;/g, 'background: transparent;');
html = html.replace(/background-image: url\('assets\/golem_spritesheet.jpg'\);/g, '/* removed */');
html = html.replace(/<div class="monster-sprite" id="monsterSprite"><\/div>/g, '<div class="monster-sprite" id="monsterSprite" style="display:none;"></div>');

// 4. Add Floating Text CSS
const floatCss = `
        .floating-dmg {
            position: fixed;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ff3333;
            font-size: 32px;
            font-weight: bold;
            font-family: var(--font-ui);
            text-shadow: 0 0 10px #000, 2px 2px 0 #000;
            pointer-events: none;
            z-index: 100;
            animation: floatUp 1s ease-out forwards;
        }
        @keyframes floatUp {
            0% { opacity: 1; transform: translate(-50%, -50%) scale(1.5); }
            100% { opacity: 0; transform: translate(-50%, -150%) scale(1); }
        }
`;
html = html.replace('</style>', floatCss + '</style>');

// 5. Inject WebGL Engine Logic
const webglScript = `
    <script>
        // --- 3D ENGINE ---
        let scene, camera, renderer;
        let golem, leftArm, rightArm, head, torso;
        let tunnel = [];
        let targetCamZ = 0;
        let golemState = 'idle'; // idle, hit, block, death
        let stateTimer = 0;
        let golemBaseZ = -10;

        function init3D() {
            const canvas = document.getElementById('webgl-canvas');
            renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x111115, 0.05);

            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
            camera.position.set(0, 2, 0);

            // Lighting
            const ambient = new THREE.AmbientLight(0x404050, 1.5);
            scene.add(ambient);
            const directional = new THREE.DirectionalLight(0x6c5ce7, 1);
            directional.position.set(5, 10, 5);
            scene.add(directional);
            const pointLight = new THREE.PointLight(0xff7675, 2, 20);
            pointLight.position.set(0, 3, golemBaseZ + 2);
            scene.add(pointLight);

            // Build Dungeon Tunnel
            const wallGeo = new THREE.BoxGeometry(1, 10, 4);
            const wallMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, roughness: 0.9 });
            const floorGeo = new THREE.PlaneGeometry(12, 4);
            const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, roughness: 1 });
            
            for(let i=0; i<40; i++) {
                const z = -i * 4;
                // Left Wall
                const lw = new THREE.Mesh(wallGeo, wallMat);
                lw.position.set(-6, 0, z);
                scene.add(lw);
                // Right Wall
                const rw = new THREE.Mesh(wallGeo, wallMat);
                rw.position.set(6, 0, z);
                scene.add(rw);
                // Floor
                const floor = new THREE.Mesh(floorGeo, floorMat);
                floor.rotation.x = -Math.PI / 2;
                floor.position.set(0, -2, z);
                scene.add(floor);
            }

            // Build Golem
            buildGolem();

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });

            animate3D();
        }

        function buildGolem() {
            if(golem) scene.remove(golem);
            golem = new THREE.Group();
            golem.position.set(0, 0, golemBaseZ);

            const mat = new THREE.MeshStandardMaterial({ color: 0x636e72, roughness: 0.7, flatShading: true });
            const coreMat = new THREE.MeshStandardMaterial({ color: 0x0984e3, emissive: 0x0984e3, emissiveIntensity: 0.5 });

            torso = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3, 1.5), mat);
            torso.position.y = 1.5;
            golem.add(torso);

            const core = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1.6), coreMat);
            core.position.y = 1.5;
            golem.add(core);

            head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), mat);
            head.position.y = 3.6;
            golem.add(head);

            leftArm = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), mat);
            leftArm.position.set(-1.8, 1.5, 0);
            golem.add(leftArm);

            rightArm = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), mat);
            rightArm.position.set(1.8, 1.5, 0);
            golem.add(rightArm);

            scene.add(golem);
        }

        function animate3D() {
            requestAnimationFrame(animate3D);
            const time = Date.now() * 0.001;

            // Camera follow
            camera.position.z += (targetCamZ - camera.position.z) * 0.05;

            // Golem State Machine
            if (golem && golemState === 'idle') {
                golem.position.y = Math.sin(time * 2) * 0.1;
                leftArm.rotation.x = Math.sin(time * 2) * 0.1;
                rightArm.rotation.x = Math.sin(time * 2 + Math.PI) * 0.1;
                head.rotation.y = Math.sin(time) * 0.1;
                
                // reset hit rotations
                leftArm.rotation.z = 0;
                rightArm.rotation.z = 0;
                golem.rotation.x = 0;
            } 
            else if (golemState === 'hit') {
                stateTimer++;
                golem.position.z = golemBaseZ - Math.sin(stateTimer * 0.2) * 1.5;
                golem.rotation.x = -0.2;
                if (stateTimer > 15) { golemState = 'idle'; golem.position.z = golemBaseZ; }
            }
            else if (golemState === 'block') {
                stateTimer++;
                leftArm.rotation.x = -Math.PI / 2;
                leftArm.rotation.z = -0.5;
                rightArm.rotation.x = -Math.PI / 2;
                rightArm.rotation.z = 0.5;
                if (stateTimer > 20) golemState = 'idle';
            }
            else if (golemState === 'death') {
                stateTimer++;
                torso.position.y -= 0.1;
                leftArm.rotation.z -= 0.1;
                rightArm.rotation.z += 0.1;
                head.position.y -= 0.15;
                head.rotation.x += 0.1;
            }

            renderer.render(scene, camera);
        }

        window.glHit = () => { golemState = 'hit'; stateTimer = 0; };
        window.glBlock = () => { golemState = 'block'; stateTimer = 0; };
        window.glDeath = () => { golemState = 'death'; stateTimer = 0; };
        window.glWalk = () => { 
            targetCamZ -= 20; 
            golemBaseZ -= 20; 
            setTimeout(() => {
                buildGolem();
                golemState = 'idle';
            }, 1000);
        };
        
        window.showFloatingDamage = (amt) => {
            const div = document.createElement('div');
            div.className = 'floating-dmg';
            div.textContent = amt;
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 1000);
        };

        window.addEventListener('DOMContentLoaded', init3D);
        // --- END 3D ENGINE ---
    </script>
`;
html = html.replace('</body>', webglScript + '\n</body>');

// 6. Hook up 24 HP and Floating Text to Game Logic
const hpSetupRegex = /gameState\.enemyMaxHP = 100 \+ \(gameState\.level \* 20\);/;
html = html.replace(hpSetupRegex, 'gameState.enemyMaxHP = 24;');

const hpResetRegex = /gameState\.enemyCurrentHP = gameState\.enemyMaxHP;/;
// We actually want to hook into the existing damage logic!
// Let's find the current dealDamage logic and update it.
const dealDamageOld = `function dealDamage(amount) {
            gameState.enemyCurrentHP -= amount;
            if (gameState.enemyCurrentHP < 0) gameState.enemyCurrentHP = 0;
            const pct = (gameState.enemyCurrentHP / gameState.enemyMaxHP) * 100;
            document.getElementById('monsterHealth').style.width = pct + '%';
        }`;
const dealDamageNew = `function dealDamage(amount) {
            gameState.enemyCurrentHP -= amount;
            if (gameState.enemyCurrentHP < 0) gameState.enemyCurrentHP = 0;
            const pct = (gameState.enemyCurrentHP / gameState.enemyMaxHP) * 100;
            document.getElementById('monsterHealth').style.width = pct + '%';
            window.showFloatingDamage("-" + amount);
        }`;
html = html.replace(dealDamageOld, dealDamageNew);

// In selectNumber, it does hit-light. We want it to deal 8 damage.
const hitLightOld = `animateAction('hit-light', 'slash-light');
                        playSound('hit');`;
const hitLightNew = `window.glHit();
                        dealDamage(8);
                        playSound('hit');`;
html = html.replace(hitLightOld, hitLightNew);

const dodgeOld = `animateAction('dodge', 'block');
                        playSound('block');`;
const dodgeNew = `window.glBlock();
                        playSound('block');`;
html = html.replace(dodgeOld, dodgeNew);

const defeatOld = `animateAction('defeated', 'slash-heavy');
                playSound('defeat');`;
const defeatNew = `window.glDeath();
                playSound('defeat');`;
html = html.replace(defeatOld, defeatNew);

const nextLevelOld = `loadPuzzle();
            startTimer();`;
const nextLevelNew = `window.glWalk();
            setTimeout(() => {
                loadPuzzle();
                startTimer();
            }, 1000);`;
html = html.replace(nextLevelOld, nextLevelNew);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Upgraded to WebGL!");
