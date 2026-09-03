const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const inputDir = '/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9/';
const outputDir = '/config/vs-workspace/24-game/assets/';

async function processAndAdd() {
    try {
        const files = fs.readdirSync(inputDir);
        const latest = files.filter(f => f.startsWith('lich_v2')).sort().pop();
        const inputPath = path.join(inputDir, latest);
        
        const image = await Jimp.read(inputPath);
        const blackColor = Jimp.rgbaToInt(0, 0, 0, 255);
        
        // The AI added thin white grid lines. We must black them out.
        // Image is 1024x1024, 4x4 grid. Boundaries are at 256, 512, 768.
        const boundaries = [255, 256, 257, 511, 512, 513, 767, 768, 769];
        
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            if (boundaries.includes(x) || boundaries.includes(y)) {
                this.setPixelColor(blackColor, x, y);
            }
        });

        const outPath = path.join(outputDir, 'lich_v2.jpg');
        await image.writeAsync(outPath);
        console.log("Copied and processed Lich King v2.");

        let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');
        const oldLichRegex = /{ name: "Lich King", url: "assets\/lich.jpg", filter: "none" }/;
        const newLichReplacement = `{ name: "Lich King (Bugged)", url: "assets/lich.jpg", filter: "none", hidden: true },
            { name: "Lich King", url: "assets/lich_v2.jpg", filter: "none" }`;
        html = html.replace(oldLichRegex, newLichReplacement);
        fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
    } catch(e) {
        console.error(e);
    }
}
processAndAdd();
