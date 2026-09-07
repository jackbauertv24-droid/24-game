const { Jimp } = require('jimp');
const fs = require('fs');

async function processSprite(file) {
    const inputPath = '/config/vs-workspace/24-game/assets/' + file;
    if (!fs.existsSync(inputPath)) return;
    const image = await Jimp.read(inputPath);
    
    // Check top left pixel to see if it's white-ish
    const r0 = image.bitmap.data[0];
    const g0 = image.bitmap.data[1];
    const b0 = image.bitmap.data[2];
    
    // Only process if the background is light
    if (r0 > 200 && g0 > 200 && b0 > 200) {
        console.log(file + " has white background. Processing...");
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            if (r > 200 && g > 200 && b > 200) {
                this.bitmap.data[idx + 0] = 0;
                this.bitmap.data[idx + 1] = 0;
                this.bitmap.data[idx + 2] = 0;
            }
        });
        await image.write('/config/vs-workspace/24-game/assets/' + file);
        console.log("Fixed " + file);
    } else {
        console.log(file + " already has black background.");
    }
}

async function run() {
    const targets = ['orc.jpg', 'wraith.jpg', 'fire_elemental.jpg', 'spider.jpg', 'lich.jpg'];
    for (const target of targets) {
        await processSprite(target);
    }
}
run();
