const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Fix the initCampaignPuzzles bug
// We will extract it and put it at the very bottom
const initRegex = /        function initCampaignPuzzles\(\) \{[\s\S]*?initCampaignPuzzles\(\);\n\n/m;
const extracted = html.match(initRegex);
if(extracted) {
    html = html.replace(extracted[0], ""); // remove from showModeSelect
    // insert right before the final modeModal active
    html = html.replace(/        document\.getElementById\('modeModal'\)\.classList\.add\('active'\);(?![\s\S]*modeModal)/, extracted[0] + "        document.getElementById('modeModal').classList.add('active');");
}

// 2. Enhance 3D Graphics
// Create procedural texture generator
const textureGenerator = `
        // Generate Procedural Textures
        function createNoiseTexture(type) {
            const canvas = document.createElement('canvas');
            canvas.width = 512; canvas.height = 512;
            const ctx = canvas.getContext('2d');
            const imgData = ctx.createImageData(512, 512);
            for (let i = 0; i < imgData.data.length; i += 4) {
                let val = Math.random() * 255;
                if(type === 'rock') {
                    // Cellular-ish noise approximation
                    let x = (i/4) % 512; let y = Math.floor((i/4) / 512);
                    val = (Math.sin(x*0.05)*Math.cos(y*0.05)*128 + 128) * 0.5 + Math.random()*128;
                }
                if(type === 'stone') {
                    val = Math.random() * 50 + 100;
                    // Brick lines
                    let x = (i/4) % 512; let y = Math.floor((i/4) / 512);
                    if(y % 64 < 4 || (x + (Math.floor(y/64)%2)*32) % 128 < 4) val *= 0.3;
                }
                imgData.data[i] = imgData.data[i+1] = imgData.data[i+2] = val;
                imgData.data[i+3] = 255;
            }
            ctx.putImageData(imgData, 0, 0);
            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            return tex;
        }
        
        const rockTex = createNoiseTexture('rock');
        const stoneTex = createNoiseTexture('stone');
        stoneTex.repeat.set(4, 20);
`;

const buildTunnelRegex = /            \/\/ Build Dungeon Tunnel[\s\S]*?\/\/ Build Golem/m;
const newBuildTunnel = `            // Build Dungeon Tunnel
            ${textureGenerator}
            
            // AD&D Style Infinite Cavern
            const tunnelGeo = new THREE.CylinderGeometry(15, 15, 200, 32, 32, true);
            const tunnelMat = new THREE.MeshStandardMaterial({ 
                color: 0x3a3a40, 
                roughness: 1.0, 
                bumpMap: stoneTex, 
                bumpScale: 0.5,
                side: THREE.BackSide 
            });
            const tunnelMesh = new THREE.Mesh(tunnelGeo, tunnelMat);
            tunnelMesh.rotation.x = Math.PI / 2;
            tunnelMesh.position.z = -50;
            scene.add(tunnelMesh);

            // Add floating dust particles
            const pGeo = new THREE.BufferGeometry();
            const pPos = [];
            for(let i=0; i<500; i++) {
                pPos.push((Math.random()-0.5)*20, (Math.random()-0.5)*20, -Math.random()*100);
            }
            pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
            const pMat = new THREE.PointsMaterial({color: 0xffffff, size: 0.1, transparent:true, opacity:0.3});
            const particles = new THREE.Points(pGeo, pMat);
            scene.add(particles);

            // Build Golem`;
html = html.replace(buildTunnelRegex, newBuildTunnel);

const buildGolemRegex = /        function buildGolem\(\) \{[\s\S]*?scene\.add\(golem\);\n        \}/m;
const newBuildGolem = `        function buildGolem() {
            if(golem) scene.remove(golem);
            golem = new THREE.Group();
            golem.position.set(0, -1, golemBaseZ);

            // High Poly Icosahedron for AD&D Stone Golem Look
            const geoHead = new THREE.IcosahedronGeometry(1.5, 3);
            const geoTorso = new THREE.IcosahedronGeometry(2.8, 3);
            const geoArm = new THREE.IcosahedronGeometry(1.2, 3);
            
            // Randomize vertices to make it look like jagged rock
            const deform = (geo, scale) => {
                const pos = geo.attributes.position;
                for(let i=0; i<pos.count; i++) {
                    pos.setX(i, pos.getX(i) + (Math.random()-0.5)*scale);
                    pos.setY(i, pos.getY(i) + (Math.random()-0.5)*scale);
                    pos.setZ(i, pos.getZ(i) + (Math.random()-0.5)*scale);
                }
                geo.computeVertexNormals();
            };
            deform(geoHead, 0.3); deform(geoTorso, 0.5); deform(geoArm, 0.4);

            const mat = new THREE.MeshStandardMaterial({ 
                color: 0x5a6066, 
                roughness: 0.9, 
                metalness: 0.1,
                bumpMap: rockTex,
                bumpScale: 0.8
            });
            const coreMat = new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff1111, emissiveIntensity: 2.0 });

            torso = new THREE.Mesh(geoTorso, mat);
            torso.position.y = 3;
            golem.add(torso);

            const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 2), coreMat);
            core.position.set(0, 3, 2);
            golem.add(core);

            head = new THREE.Mesh(geoHead, mat);
            head.position.y = 6.5;
            golem.add(head);

            leftArm = new THREE.Group();
            leftArm.position.set(-3.5, 4, 0);
            const lMesh = new THREE.Mesh(geoArm, mat);
            lMesh.position.y = -1.5;
            leftArm.add(lMesh);
            golem.add(leftArm);

            rightArm = new THREE.Group();
            rightArm.position.set(3.5, 4, 0);
            const rMesh = new THREE.Mesh(geoArm, mat);
            rMesh.position.y = -1.5;
            rightArm.add(rMesh);
            golem.add(rightArm);

            // Legs
            const geoLeg = new THREE.IcosahedronGeometry(1.4, 3);
            deform(geoLeg, 0.3);
            const lLeg = new THREE.Mesh(geoLeg, mat); lLeg.position.set(-1.5, 0.5, 0); golem.add(lLeg);
            const rLeg = new THREE.Mesh(geoLeg, mat); rLeg.position.set(1.5, 0.5, 0); golem.add(rLeg);

            // Add glowing runes floating around
            for(let i=0; i<3; i++) {
                const rune = new THREE.Mesh(new THREE.TetrahedronGeometry(0.3), coreMat);
                rune.position.set((Math.random()-0.5)*10, 4+(Math.random()-0.5)*5, (Math.random()-0.5)*5);
                golem.add(rune);
            }

            scene.add(golem);
        }`;
html = html.replace(buildGolemRegex, newBuildGolem);

// Fix the particle animation in animate3D
const animate3DRegex = /            camera\.position\.z \+= \(targetCamZ - camera\.position\.z\) \* 0\.05;/;
const newAnimate3D = `            camera.position.z += (targetCamZ - camera.position.z) * 0.05;
            // animate particles
            scene.children.forEach(c => {
                if(c.isPoints) {
                    const pos = c.geometry.attributes.position;
                    for(let i=0; i<pos.count; i++) {
                        let z = pos.getZ(i) + 0.1;
                        if(z > camera.position.z) z -= 100;
                        pos.setZ(i, z);
                    }
                    pos.needsUpdate = true;
                }
            });`;
html = html.replace(animate3DRegex, newAnimate3D);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Bug fixed and AD&D graphics applied.");
