const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const assetsDir = path.join(__dirname, 'assets');
let files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.jpg') && !f.includes('_thumb') && !f.includes('bg_') && !f.includes('class_'));

const disabled = ['skeleton.jpg', 'goblin.jpg', 'bat.jpg', 'beholder.jpg', 'dragon.jpg', 'lich.jpg', 'minotaur.jpg', 'shadow_assassin.jpg', 'swamp_troll.jpg'];
files = files.filter(f => !disabled.includes(f));

async function scan() {
    let results = [];
    for (const file of files) {
        try {
            const img = await Jimp.read(path.join(assetsDir, file));
            let nonBlackPixels = 0;
            // sample everywhere along x=256, 512, 768 and y=256, 512, 768
            for (let x of [256, 512, 768]) {
                for (let y = 0; y < 1024; y += 4) {
                    const c = Jimp.intToRGBA(img.getPixelColor(x, y));
                    if (c.r > 15 || c.g > 15 || c.b > 15) nonBlackPixels++;
                }
            }
            for (let y of [256, 512, 768]) {
                for (let x = 0; x < 1024; x += 4) {
                    const c = Jimp.intToRGBA(img.getPixelColor(x, y));
                    if (c.r > 15 || c.g > 15 || c.b > 15) nonBlackPixels++;
                }
            }
            results.push({ file, score: nonBlackPixels });
        } catch (e) {}
    }
    results.sort((a, b) => b.score - a.score);
    console.log("Top 10 non-grid assets:");
    results.slice(0, 10).forEach(r => console.log(`${r.score} - ${r.file}`));
}
scan();
