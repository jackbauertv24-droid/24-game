const Jimp = require('jimp');

async function processImage() {
    const srcPath = '/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9/void_mage_1788417526872.jpg';
    const destPath = '/config/vs-workspace/24-game/assets/void_mage.jpg';
    const thumbPath = '/config/vs-workspace/24-game/assets/void_mage_thumb.jpg';

    try {
        const image = await Jimp.read(srcPath);
        
        // 1. Convert background to pure black for mix-blend-mode: screen
        // Get the color of the top-left pixel (should be the background grey)
        const bgColor = Jimp.intToRGBA(image.getPixelColor(0, 0));
        const threshold = 30; // Tolerance for background color
        
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            // Check if pixel is close to background color
            if (Math.abs(r - bgColor.r) < threshold && 
                Math.abs(g - bgColor.g) < threshold && 
                Math.abs(b - bgColor.b) < threshold) {
                
                // Turn to black
                this.bitmap.data[idx + 0] = 0;
                this.bitmap.data[idx + 1] = 0;
                this.bitmap.data[idx + 2] = 0;
            }
            
            // Fix any AI gridlines around 255, 256, 257, 511, 512, 513, 767, 768, 769
            const gridLines = [255, 256, 257, 511, 512, 513, 767, 768, 769];
            if (gridLines.includes(x) || gridLines.includes(y)) {
                // If it's too light, it's a gridline artifact. Darken it heavily.
                if (r > 50 || g > 50 || b > 50) {
                     this.bitmap.data[idx + 0] = 0;
                     this.bitmap.data[idx + 1] = 0;
                     this.bitmap.data[idx + 2] = 0;
                }
            }
        });

        // Save the full sprite sheet
        await image.writeAsync(destPath);
        console.log('Saved main sprite sheet.');

        // 2. Crop a 256x256 thumbnail (let's grab row 2, col 1 for a cool pose)
        const thumb = image.clone().crop(0, 256, 256, 256);
        await thumb.writeAsync(thumbPath);
        console.log('Saved thumbnail.');
        
    } catch (err) {
        console.error(err);
    }
}

processImage();
