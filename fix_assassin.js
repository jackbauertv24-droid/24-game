const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const inputDir = '/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9/';
const outputDir = '/config/vs-workspace/24-game/assets/';

async function processAndAdd() {
    try {
        const files = fs.readdirSync(inputDir);
        const latest = files.filter(f => f.startsWith('shadow_assassin_v2')).sort().pop();
        const inputPath = path.join(inputDir, latest);
        
        const image = await Jimp.read(inputPath);
        const blackColor = Jimp.rgbaToInt(0, 0, 0, 255);
        
        // Ensure absolutely no gridlines
        const boundaries = [255, 256, 257, 511, 512, 513, 767, 768, 769];
        
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            if (boundaries.includes(x) || boundaries.includes(y)) {
                this.setPixelColor(blackColor, x, y);
            }
        });

        const outPath = path.join(outputDir, 'shadow_assassin_v2.jpg');
        await image.writeAsync(outPath);
        console.log("Copied and processed Shadow Assassin v2.");

        let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');
        const oldAssassinRegex = /{ name: "Shadow Assassin", url: "assets\/shadow_assassin.jpg", filter: "none" }/;
        const newAssassinReplacement = `{ name: "Shadow Assassin (Bugged)", url: "assets/shadow_assassin.jpg", filter: "none", hidden: true },
            { name: "Shadow Assassin", url: "assets/shadow_assassin_v2.jpg", filter: "none" }`;
        html = html.replace(oldAssassinRegex, newAssassinReplacement);
        fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
    } catch(e) {
        console.error(e);
    }
}
processAndAdd();
