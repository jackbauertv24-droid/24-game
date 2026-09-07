const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const inputDir = '/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9/';
const outputDir = '/config/vs-workspace/24-game/assets/';

async function processAndAdd() {
    try {
        const files = fs.readdirSync(inputDir);
        const latest = files.filter(f => f.startsWith('goblin_warlord_')).sort().pop();
        
        const inputPath = path.join(inputDir, latest);
        const image = await Jimp.read(inputPath);
        
        const blackColor = Jimp.rgbaToInt(0, 0, 0, 255);
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            // If it's a bright white background
            if (r > 200 && g > 200 && b > 200) {
                this.setPixelColor(blackColor, x, y);
            }
        });
        
        const outPath = path.join(outputDir, 'goblin_warlord.jpg');
        await image.writeAsync(outPath);
        console.log("Processed Goblin.");
        
        let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');
        const regex = /{ name: "Necromancer", url: "assets\/necromancer.jpg", filter: "none" }/;
        const replacement = `{ name: "Necromancer", url: "assets/necromancer.jpg", filter: "none" },
            { name: "Goblin Warlord", url: "assets/goblin_warlord.jpg", filter: "none" }`;
        html = html.replace(regex, replacement);
        fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
        
    } catch(e) {
        console.error(e);
    }
}
processAndAdd();
