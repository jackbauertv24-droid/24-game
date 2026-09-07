const Jimp = require('jimp');
const path = require('path');

const outputDir = '/config/vs-workspace/24-game/assets/';

async function makeThumb(filename, thumbname) {
    try {
        const inputPath = path.join(outputDir, filename);
        const image = await Jimp.read(inputPath);
        
        // The sprite sheet is a 4x4 grid. We want the first frame (top left).
        // Calculate frame width and height based on the image dimensions.
        const frameWidth = Math.floor(image.bitmap.width / 4);
        const frameHeight = Math.floor(image.bitmap.height / 4);
        
        // Crop the top-left frame
        image.crop(0, 0, frameWidth, frameHeight);
        
        const outPath = path.join(outputDir, thumbname);
        await image.writeAsync(outPath);
        console.log("Created thumbnail for", filename);
    } catch(e) {
        console.error("Error processing", filename, e);
    }
}

async function main() {
    await makeThumb('demon_king.jpg', 'demon_king_thumb.jpg');
    await makeThumb('lich_v2.jpg', 'lich_v2_thumb.jpg');
    await makeThumb('shadow_assassin_v2.jpg', 'shadow_assassin_v2_thumb.jpg');
    await makeThumb('swamp_troll_v2.jpg', 'swamp_troll_v2_thumb.jpg');
}

main();
