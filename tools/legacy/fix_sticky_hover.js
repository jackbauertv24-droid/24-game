const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// Fix number-card
html = html.replace('.number-card:hover, .number-card:focus-visible {', 
`.number-card:focus-visible {`);

html = html.replace('.number-card:focus-visible {\n            transform: translateZ(15px) translateY(-4px);\n            box-shadow: 0 8px 0 #151520, 0 20px 25px rgba(0,0,0,0.7), inset 0 2px 5px rgba(255,255,255,0.15);\n            color: #fff;\n            border-color: rgba(0, 240, 255, 0.5);\n        }', 
`.number-card:focus-visible {
            transform: translateZ(15px) translateY(-4px);
            box-shadow: 0 8px 0 #151520, 0 20px 25px rgba(0,0,0,0.7), inset 0 2px 5px rgba(255,255,255,0.15);
            color: #fff;
            border-color: rgba(0, 240, 255, 0.5);
        }
        @media (hover: hover) {
            .number-card:hover {
                transform: translateZ(15px) translateY(-4px);
                box-shadow: 0 8px 0 #151520, 0 20px 25px rgba(0,0,0,0.7), inset 0 2px 5px rgba(255,255,255,0.15);
                color: #fff;
                border-color: rgba(0, 240, 255, 0.5);
            }
        }`);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Hover bug fixed.");
