const fs = require('fs');

let content = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

// 1. Replace CURATED_PUZZLES definition
const regex = /const CURATED_PUZZLES = \{[\s\S]*?^\s*\};\n/m;
content = content.replace(regex, "const CURATED_PUZZLES = { easy: [], medium: [], hard: [] };\n");

// 2. Add generator logic before the bottom
const generator_code = `
        function initCuratedPuzzles() {
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
                            CURATED_PUZZLES[diff.name].push({ nums: [...nums], hint: solutions[0] });
                        }
                    }
                }
            });
        }
        initCuratedPuzzles();

        document.getElementById('modeModal').classList.add('active');`;
        
content = content.replace("document.getElementById('modeModal').classList.add('active');", generator_code);

// 3. Add UI Banner
const ui_banner = `
                <div style="font-size: 13px; color: #fff; background: rgba(0,0,0,0.2); padding: 4px 10px; border-radius: 12px; text-align: center; margin-bottom: 8px;">
                    ⚠️ Math is evaluated strictly Left-to-Right!
                </div>
                <div class="expression" id="expression">`;
content = content.replace('<div class="expression" id="expression">', ui_banner);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', content, 'utf-8');
console.log("Done patching with Node.");
