const Jimp = require('jimp');
const fs = require('fs');

async function processImage(srcPath, destPath, thumbPath) {
    try {
        const image = await Jimp.read(srcPath);
        const bgColor = Jimp.intToRGBA(image.getPixelColor(0, 0));
        const threshold = 30;
        
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            if (Math.abs(r - bgColor.r) < threshold && 
                Math.abs(g - bgColor.g) < threshold && 
                Math.abs(b - bgColor.b) < threshold) {
                this.bitmap.data[idx + 0] = 0;
                this.bitmap.data[idx + 1] = 0;
                this.bitmap.data[idx + 2] = 0;
            }
            
            const gridLines = [255, 256, 257, 511, 512, 513, 767, 768, 769];
            if (gridLines.includes(x) || gridLines.includes(y)) {
                if (r > 30 || g > 30 || b > 30) {
                     this.bitmap.data[idx + 0] = 0;
                     this.bitmap.data[idx + 1] = 0;
                     this.bitmap.data[idx + 2] = 0;
                }
            }
        });

        await image.writeAsync(destPath);
        console.log(`Saved main sprite: ${destPath}`);

        const thumb = image.clone().crop(0, 0, 256, 256);
        await thumb.writeAsync(thumbPath);
        console.log(`Saved thumbnail: ${thumbPath}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

const args = process.argv.slice(2);
processImage(args[0], args[1], args[2]);
