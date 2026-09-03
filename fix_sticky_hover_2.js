const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

html = html.replace('.operator-btn:hover, .operator-btn:focus-visible {', 
`.operator-btn:focus-visible {`);

html = html.replace('.operator-btn:focus-visible {\n            transform: translateZ(15px) translateY(-3px);\n            border-color: rgba(179,136,255,0.5);\n            box-shadow: 0 7px 0 #0f0b15, 0 15px 20px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.1);\n        }', 
`.operator-btn:focus-visible {
            transform: translateZ(15px) translateY(-3px);
            border-color: rgba(179,136,255,0.5);
            box-shadow: 0 7px 0 #0f0b15, 0 15px 20px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.1);
        }
        @media (hover: hover) {
            .operator-btn:hover {
                transform: translateZ(15px) translateY(-3px);
                border-color: rgba(179,136,255,0.5);
                box-shadow: 0 7px 0 #0f0b15, 0 15px 20px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.1);
            }
        }`);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Operator hover bug fixed.");
