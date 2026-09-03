const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const inputDir = '/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9/';
const outputDir = '/config/vs-workspace/24-game/assets/';

async function processImage(prefix, outName) {
    try {
        const files = fs.readdirSync(inputDir);
        const latest = files.filter(f => f.startsWith(prefix)).sort().pop();
        if (!latest) return;
        
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
        
        const outPath = path.join(outputDir, outName);
        await image.writeAsync(outPath);
        console.log("Saved to", outPath);
    } catch(e) {
        console.error(e);
    }
}
processImage('void_stalker_', 'void_stalker.jpg');
