const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const assetsDir = path.join(__dirname, 'assets');
const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.jpg') && !f.includes('_thumb') && !f.includes('bg_'));

async function scan() {
    console.log("Scanning assets...");
    for (const file of files) {
        try {
            const img = await Jimp.read(path.join(assetsDir, file));
            const w = img.bitmap.width;
            const h = img.bitmap.height;
            // A standard AI 4x4 grid is usually 1024x1024
            if (w !== 1024 || h !== 1024) {
                console.log(`NON-STANDARD: ${file} is ${w}x${h}`);
            }
        } catch (e) {
            console.error(`Error reading ${file}: ${e.message}`);
        }
    }
    console.log("Done.");
}

scan();
