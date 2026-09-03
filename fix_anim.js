const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const oldAnimation = `        @keyframes magicSwap {
            0% { transform: scale(1); box-shadow: 0 0 0 transparent; background: var(--card-bg); color: var(--light); }
            15% { transform: scale(1.4) rotate(15deg); box-shadow: 0 0 40px #55ff55; background: #55ff55; color: #000; }
            35% { transform: scale(1.4) rotate(-15deg); box-shadow: 0 0 40px #55ff55; background: #55ff55; color: #000; }
            55% { transform: scale(1.4) rotate(15deg); box-shadow: 0 0 40px #55ff55; background: #55ff55; color: #000; }
            75% { transform: scale(1.4) rotate(-15deg); box-shadow: 0 0 40px #55ff55; background: #55ff55; color: #000; }
            100% { transform: scale(1); box-shadow: 0 0 0 transparent; background: var(--card-bg); color: var(--light); }
        }
        .flash-magic {
            animation: magicSwap 2.0s ease-out;`;

const newAnimation = `        @keyframes magicSwap {
            0% { transform: scale(1); box-shadow: 0 0 0 transparent; }
            15% { transform: scale(1.3) rotate(15deg); box-shadow: 0 0 30px #55ff55; background: #55ff55 !important; color: #000 !important; }
            35% { transform: scale(1.3) rotate(-15deg); box-shadow: 0 0 30px #55ff55; background: #55ff55 !important; color: #000 !important; }
            55% { transform: scale(1.3) rotate(15deg); box-shadow: 0 0 30px #55ff55; background: #55ff55 !important; color: #000 !important; }
            75% { transform: scale(1.3) rotate(-15deg); box-shadow: 0 0 30px #55ff55; background: #55ff55 !important; color: #000 !important; }
            100% { transform: scale(1); box-shadow: 0 0 0 transparent; }
        }
        .flash-magic {
            animation: magicSwap 2.0s ease-in-out forwards !important;`;

html = html.replace(oldAnimation, newAnimation);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Animation fixed.");
