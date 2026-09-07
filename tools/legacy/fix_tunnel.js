const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// Move the tunnel when the camera moves
const animate3DOld = `            // animate particles`;
const animate3DNew = `            if (typeof tunnelMesh !== 'undefined') {
                // Keep the tunnel centered around the camera's Z position
                tunnelMesh.position.z = camera.position.z - 50;
            }
            // animate particles`;
html = html.replace(animate3DOld, animate3DNew);

// Make tunnelMesh accessible globally
html = html.replace(`const tunnelMesh = new THREE.Mesh`, `window.tunnelMesh = new THREE.Mesh`);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Fixed tunnel clipping.");
