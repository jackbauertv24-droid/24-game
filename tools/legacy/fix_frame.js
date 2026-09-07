const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const spriteOld = `        .monster-sprite {
            width: 250px;
            height: 250px;
            background-image: url('assets/golem_spritesheet.jpg');
            background-size: 400% 400%; /* 4 columns, 4 rows */
            background-position: 0% 0%;
            mix-blend-mode: screen;
            filter: drop-shadow(0 0 10px rgba(100,200,255,0.3));
            animation: animIdle 0.8s step-end infinite;
        }`;

const spriteNew = `        .monster-sprite {
            width: 250px;
            height: 250px;
            background-image: url('assets/golem_spritesheet.jpg');
            background-size: 400% 400%; /* 4 columns, 4 rows */
            background-position: 0% 0%;
            mix-blend-mode: screen;
            /* Fade edges to transparent to prevent any visible square boundary */
            -webkit-mask-image: radial-gradient(circle at center, black 50%, transparent 70%);
            mask-image: radial-gradient(circle at center, black 50%, transparent 70%);
            animation: animIdle 0.8s step-end infinite;
        }`;

html = html.replace(spriteOld, spriteNew);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Frame artifacts removed.");
