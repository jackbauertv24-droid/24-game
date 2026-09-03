const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Fix CSS background
html = html.replace(/background: transparent;/g, 'background: #111115;');

// 2. Fix WebGL Renderer alpha and clear color
const rendererOld = `renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });`;
const rendererNew = `renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });\n            renderer.setClearColor(0x111115, 1);`;
html = html.replace(rendererOld, rendererNew);

// 3. Make sure init3D runs immediately at script end, avoiding DOMContentLoaded issues
const initEventOld = `window.addEventListener('DOMContentLoaded', init3D);`;
const initEventNew = `init3D();`;
html = html.replace(initEventOld, initEventNew);

// 4. Increase lighting dramatically just in case it was too dark
const lightOld = `const ambient = new THREE.AmbientLight(0x404050, 1.5);
            scene.add(ambient);
            const directional = new THREE.DirectionalLight(0x6c5ce7, 1);
            directional.position.set(5, 10, 5);
            scene.add(directional);
            const pointLight = new THREE.PointLight(0xff7675, 2, 20);`;
const lightNew = `const ambient = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambient);
            const directional = new THREE.DirectionalLight(0x6c5ce7, 1.5);
            directional.position.set(5, 10, 5);
            scene.add(directional);
            const pointLight = new THREE.PointLight(0xff7675, 4, 30);`;
html = html.replace(lightOld, lightNew);

// 5. Ensure the fog doesn't swallow everything
const fogOld = `scene.fog = new THREE.FogExp2(0x111115, 0.05);`;
const fogNew = `scene.fog = new THREE.FogExp2(0x111115, 0.02);`; // 0.02 is much lighter fog
html = html.replace(fogOld, fogNew);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Fixed renderer background, fog, and lighting.");
