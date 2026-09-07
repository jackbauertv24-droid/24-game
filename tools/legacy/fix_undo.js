const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const selectNumOld = `        function selectNumber(idx) {
            if (!gameState.started || selectedNumbers.length !== selectedOperators.length) return;
            if (currentNumbers[idx].used && !selectedNumbers.includes(idx)) return;`;
const selectNumNew = `        function selectNumber(idx) {
            if (!gameState.started) return;
            // Allow undoing if it's already selected
            const isUndo = selectedNumbers.includes(idx);
            if (!isUndo && selectedNumbers.length !== selectedOperators.length) return;
            if (currentNumbers[idx].used && !isUndo) return;`;

html = html.replace(selectNumOld, selectNumNew);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Undo logic fixed.");
