const Jimp = require('jimp');

async function processImage(inputPath, outputPath) {
    try {
        const image = await Jimp.read(inputPath);
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            // If the pixel is very light (white background), make it pure black
            if (r > 200 && g > 200 && b > 200) {
                this.bitmap.data[idx + 0] = 0;
                this.bitmap.data[idx + 1] = 0;
                this.bitmap.data[idx + 2] = 0;
            }
        });
        await image.writeAsync(outputPath);
        console.log("Processed:", outputPath);
    } catch (e) {
        console.error("Error processing image:", e);
    }
}

processImage(
    '/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9/shadow_assassin_sprite_1788338337342.jpg',
    '/config/vs-workspace/24-game/assets/shadow_assassin.jpg'
);
processImage(
    '/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9/stone_gargoyle_sprite_1788338351388.jpg',
    '/config/vs-workspace/24-game/assets/stone_gargoyle.jpg'
);
processImage(
    '/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9/swamp_troll_sprite_1788338365493.jpg',
    '/config/vs-workspace/24-game/assets/swamp_troll.jpg'
);
