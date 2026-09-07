const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const assetsDir = path.join(__dirname, 'assets');
let files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.jpg') && !f.includes('_thumb') && !f.includes('bg_'));

// Ignore disabled files
const disabled = ['skeleton.jpg', 'goblin.jpg', 'bat.jpg', 'beholder.jpg', 'dragon.jpg', 'lich.jpg', 'minotaur.jpg', 'shadow_assassin.jpg', 'swamp_troll.jpg'];
files = files.filter(f => !disabled.includes(f));

async function scan() {
    console.log("Analyzing grid structure for active assets...");
    for (const file of files) {
        try {
            const img = await Jimp.read(path.join(assetsDir, file));
            
            // Sample pixels along the expected vertical dividing line (x=256)
            let nonBlackPixels = 0;
            const threshold = 10;
            
            // Check vertical dividers (x=256, 512, 768)
            for (let x of [256, 512, 768]) {
                for (let y = 0; y < 1024; y += 10) {
                    const color = Jimp.intToRGBA(img.getPixelColor(x, y));
                    if (color.r > threshold || color.g > threshold || color.b > threshold) {
                        nonBlackPixels++;
                    }
                }
            }
            
            // A good 4x4 grid should have mostly black dividing lines. 
            // We sampled ~300 pixels. If too many are non-black, it's not a neat grid.
            if (nonBlackPixels > 100) {
                console.log(`POOR GRID STRUCTURE DETECTED: ${file} (Non-black divider pixels: ${nonBlackPixels})`);
            }
        } catch (e) {
            console.error(e.message);
        }
    }
    console.log("Done.");
}
scan();
