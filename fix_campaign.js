const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const regex = /document\.getElementById\('campaignBtn'\)\.onclick = function\(\) \{[\s\S]*?document\.getElementById\('difficultySelect'\)\.style\.display = 'block';\n        \};/m;

const replacement = `document.getElementById('campaignBtn').onclick = function() {
            gameState.mode = 'campaign';
            gameState.isPractice = false;
            document.getElementById('modeModal').classList.remove('active');
            document.getElementById('difficultyModal').classList.add('active');
        };
        
        window.selectDifficulty = function(diff) {
            gameState.difficulty = diff;
            document.getElementById('difficultyModal').classList.remove('active');
            document.getElementById('classModal').classList.add('active');
        };`;

html = html.replace(regex, replacement);

const preloadInject = `
        // Preload assets to prevent blank flickering
        setTimeout(() => {
            const images = [];
            ENEMIES.forEach(e => {
                if (e.url) { const img = new Image(); img.src = e.url; images.push(img); }
            });
            ['class_warrior.jpg', 'class_rogue.jpg', 'class_wizard.jpg', 'class_paladin.jpg', 'bg_boss.jpg', 'bg_dungeon.jpg'].forEach(url => {
                const img = new Image(); img.src = 'assets/' + url; images.push(img);
            });
        }, 50);
`;

html = html.replace('// --- END 2D ANIMATION HOOKS ---', preloadInject + '\n        // --- END 2D ANIMATION HOOKS ---');

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Fixed campaign button and added preload.");
