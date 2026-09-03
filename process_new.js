const { Jimp } = require('jimp');
const fs = require('fs');

async function processSprite(inputPath, outputPath) {
    if (!fs.existsSync(inputPath)) {
        console.log("Missing " + inputPath);
        return;
    }
    const image = await Jimp.read(inputPath);
    
    // Check top left pixel
    const r0 = image.bitmap.data[0];
    const g0 = image.bitmap.data[1];
    const b0 = image.bitmap.data[2];
    
    if (r0 > 200 && g0 > 200 && b0 > 200) {
        console.log("Processing white background for " + outputPath);
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
    }
    
    await image.write(outputPath);
    console.log("Saved " + outputPath);
}

async function run() {
    const brainDir = '/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9';
    const files = fs.readdirSync(brainDir);
    
    const targets = ['crystal_golem', 'minotaur'];
    
    for (const target of targets) {
        const file = files.find(f => f.startsWith(target + '_sprite') && f.endsWith('.jpg'));
        if (file) {
            await processSprite(brainDir + '/' + file, '/config/vs-workspace/24-game/assets/' + target + '.jpg');
        }
    }
}
run();
