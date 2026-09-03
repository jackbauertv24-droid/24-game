const fs = require('fs');
let js = fs.readFileSync('/config/vs-workspace/24-game/game.js', 'utf-8');

const regex = /window\.startGameWithClass = function\(cls\) \{[\s\S]*?updateUI\(\); \/\/ ensure class info is rendered if needed\n\s*\};/;

const replacement = `window.startGameWithClass = function(cls) {
            document.getElementById('classModal').classList.remove('active');
            window.pendingClass = cls;
            gameState.playerClass = cls;
            
            const btn = document.getElementById('skillBtn');
            if (btn) {
                if (cls === 'warrior') btn.innerHTML = '🪓 Intimidate';
                if (cls === 'rogue') btn.innerHTML = '🗡️ Pickpocket';
                if (cls === 'wizard') btn.innerHTML = '🧙‍♂️ Clairvoyance';
                if (cls === 'paladin') btn.innerHTML = '🛡️ Smite';
            }
            
            gameState.started = true;
            gameState.timer = getTimerForLevel();
            gameState.maxTime = gameState.timer;
            
            document.getElementById('timer').textContent = gameState.timer;
            document.getElementById('progress').style.width = '100%';
            document.getElementById('timerContainer').style.display = gameState.isPractice ? 'none' : 'block';
            document.getElementById('progressContainer').style.display = gameState.isPractice ? 'none' : 'block';
            document.getElementById('practiceNotice').style.display = gameState.isPractice ? 'block' : 'none';
            
            spawnEnemy();
            loadPuzzle();
            startTimer();
        };`;

js = js.replace(regex, replacement);
fs.writeFileSync('/config/vs-workspace/24-game/game.js', js, 'utf-8');
console.log("Fixed startGameWithClass.");
