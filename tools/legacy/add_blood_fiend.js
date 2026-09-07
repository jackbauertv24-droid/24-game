const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const inputDir = '/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9/';
const outputDir = '/config/vs-workspace/24-game/assets/';

async function processAndAdd() {
    try {
        const files = fs.readdirSync(inputDir);
        const latest = files.filter(f => f.startsWith('blood_fiend_')).sort().pop();
        
        const inputPath = path.join(inputDir, latest);
        const image = await Jimp.read(inputPath);
        
        const bgColor = image.getPixelColor(0, 0);
        const rBg = (bgColor >> 24) & 255;
        const gBg = (bgColor >> 16) & 255;
        const bBg = (bgColor >> 8) & 255;
        const blackColor = Jimp.rgbaToInt(0, 0, 0, 255);
        
        if (rBg > 10 || gBg > 10 || bBg > 10) {
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
                const r = this.bitmap.data[idx + 0];
                const g = this.bitmap.data[idx + 1];
                const b = this.bitmap.data[idx + 2];
                if (Math.abs(r-rBg) < 15 && Math.abs(g-gBg) < 15 && Math.abs(b-bBg) < 15) {
                    this.setPixelColor(blackColor, x, y);
                }
            });
        }
        
        const outPath = path.join(outputDir, 'blood_fiend.jpg');
        await image.writeAsync(outPath);
        console.log("Processed Blood Fiend.");
        
        let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');
        const regex = /{ name: "Frost Giant", url: "assets\/frost_giant.jpg", filter: "none" }/;
        const replacement = `{ name: "Frost Giant", url: "assets/frost_giant.jpg", filter: "none" },
            { name: "Blood Fiend", url: "assets/blood_fiend.jpg", filter: "none" }`;
        html = html.replace(regex, replacement);
        fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
        
    } catch(e) {
        console.error(e);
    }
}
processAndAdd();
