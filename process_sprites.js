const { Jimp } = require('jimp');
const fs = require('fs');

async function processSprite(inputPath, outputPath) {
    if (!fs.existsSync(inputPath)) return;
    const image = await Jimp.read(inputPath);
    
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
    
    await image.write(outputPath);
    console.log("Processed " + outputPath);
}

async function run() {
    const brainDir = '/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9';
    const files = fs.readdirSync(brainDir);
    const targets = ['skeleton', 'goblin', 'bat', 'beholder', 'dragon'];
    
    for (const target of targets) {
        const file = files.find(f => f.startsWith(target + '_sprite') && f.endsWith('.jpg'));
        if (file) {
            await processSprite(brainDir + '/' + file, '/config/vs-workspace/24-game/assets/' + target + '.jpg');
        }
    }
}
run();
