const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const inputDir = '/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9/';
const outputDir = '/config/vs-workspace/24-game/assets/';

async function processAndAdd() {
    try {
        const files = fs.readdirSync(inputDir);
        const latest = files.filter(f => f.startsWith('nightmare_hound_')).sort().pop();
        
        const inputPath = path.join(inputDir, latest);
        const image = await Jimp.read(inputPath);
        
        // Scan for all dark/greyish background pixels and force to black
        const blackColor = Jimp.rgbaToInt(0, 0, 0, 255);
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            // If it's a dark desaturated color (the grey background)
            if (r < 70 && g < 70 && b < 70 && Math.abs(r-g) < 15 && Math.abs(g-b) < 15) {
                this.setPixelColor(blackColor, x, y);
            }
        });
        
        const outPath = path.join(outputDir, 'nightmare_hound.jpg');
        await image.writeAsync(outPath);
        console.log("Processed Nightmare Hound.");
        
        let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');
        const regex = /{ name: "Blood Fiend", url: "assets\/blood_fiend.jpg", filter: "none" }/;
        const replacement = `{ name: "Blood Fiend", url: "assets/blood_fiend.jpg", filter: "none" },
            { name: "Nightmare Hound", url: "assets/nightmare_hound.jpg", filter: "none" }`;
        html = html.replace(regex, replacement);
        fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
        
    } catch(e) {
        console.error(e);
    }
}
processAndAdd();
