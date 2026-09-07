const fs = require('fs');
let content = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Rename Modes
content = content.replace(/📚 Curated/g, '🗺️ Campaign');
content = content.replace(/🎲 Generated/g, '♾️ Endless');
content = content.replace(/id="curatedBtn"/g, 'id="campaignBtn"');
content = content.replace(/id="generatedBtn"/g, 'id="endlessBtn"');
content = content.replace(/getElementById\('curatedBtn'\)/g, "getElementById('campaignBtn')");
content = content.replace(/getElementById\('generatedBtn'\)/g, "getElementById('endlessBtn')");
content = content.replace(/'curated'/g, "'campaign'");
content = content.replace(/'generated'/g, "'endless'");
content = content.replace(/CURATED_PUZZLES/g, 'CAMPAIGN_PUZZLES');

// 2. Dynamic Puzzle Generation (Replace CAMPAIGN_PUZZLES completely)
const regex = /const CAMPAIGN_PUZZLES = \{[\s\S]*?^\s*\};\n/m;
content = content.replace(regex, "const CAMPAIGN_PUZZLES = { easy: [], medium: [], hard: [] };\n");

const generator_code = `
        function initCampaignPuzzles() {
            const difficulties = [
                { name: 'easy', numRange: [1, 10], ops: ['+', '−'] },
                { name: 'medium', numRange: [1, 9], ops: ['+', '−', '×'] },
                { name: 'hard', numRange: [1, 13], ops: ['+', '−', '×', '÷'] }
            ];

            difficulties.forEach(diff => {
                let candidates = [];
                let attempts = 0;
                while(candidates.length < 30 && attempts < 5000) {
                    attempts++;
                    const nums = [];
                    for (let i = 0; i < 4; i++) {
                        nums.push(Math.floor(Math.random() * (diff.numRange[1] - diff.numRange[0] + 1)) + diff.numRange[0]);
                    }
                    const uniqueNums = [...new Set(nums)];
                    if (uniqueNums.length < 2) continue;
                    
                    const solutions = findSolutions(nums, diff.ops);
                    if (solutions.length > 0) {
                        const numString = [...nums].sort((a,b)=>a-b).join(',');
                        if (!candidates.some(c => c.key === numString)) {
                            candidates.push({ key: numString });
                            CAMPAIGN_PUZZLES[diff.name].push({ nums: [...nums] }); // RPG branch doesn't need hint here
                        }
                    }
                }
            });
        }
        initCampaignPuzzles();

        document.getElementById('modeModal').classList.add('active');`;
content = content.replace("document.getElementById('modeModal').classList.add('active');", generator_code);

// 3. Ghost Operator Fix
const oldSelectNumber = `if (selectedNumbers.includes(idx)) {
                selectedNumbers = selectedNumbers.filter(i => i !== idx);
                currentNumbers[idx].used = false;
            }`;
const newSelectNumber = `if (selectedNumbers.includes(idx)) {
                const removeIndex = selectedNumbers.indexOf(idx);
                selectedNumbers.splice(removeIndex, 1);
                currentNumbers[idx].used = false;
                
                if (selectedOperators.length >= selectedNumbers.length) {
                    selectedOperators = selectedOperators.slice(0, Math.max(0, selectedNumbers.length - 1));
                }
            }`;
content = content.replace(oldSelectNumber, newSelectNumber);

// 4. Multiplier Fix
const oldSubmit = `const points = Math.round((100 + (gameState.timer * 2)) * gameState.multiplier);
                gameState.score += points;
                gameState.streak++;
                updateMultiplier();`;
const newSubmit = `gameState.streak++;
                updateMultiplier();
                const points = Math.round((100 + (gameState.timer * 2)) * gameState.multiplier);
                gameState.score += points;`;
content = content.replace(oldSubmit, newSubmit);

// 5. UI Banner
const ui_banner = `
                <div style="font-size: 13px; color: #fff; background: rgba(0,0,0,0.4); padding: 4px 10px; border-radius: 12px; text-align: center; margin-bottom: 8px;">
                    ⚠️ Math is evaluated strictly Left-to-Right!
                </div>
                <div class="expression" id="expression">`;
content = content.replace('<div class="expression" id="expression">', ui_banner);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', content, 'utf-8');
console.log("RPG patched!");
