const Jimp = require('jimp');

async function processImage() {
    try {
        const files = require('fs').readdirSync('/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9/');
        const latest = files.filter(f => f.startsWith('minotaur_sprite_')).sort().pop();
        const inputPath = '/config/.gemini/antigravity-cli/brain/59938f4f-421b-48ad-9a3f-4ef8a96fbed9/' + latest;
        
        console.log("Loading", inputPath);
        const image = await Jimp.read(inputPath);
        
        // The background color is a flat grey. Let's find the exact color at (0,0) and replace it with black.
        const bgColor = image.getPixelColor(0, 0);
        const blackColor = Jimp.rgbaToInt(0, 0, 0, 255);
        
        // We'll replace any pixel that is very close to this grey with black, as well as the grid lines (which are solid black).
        // Wait, if we replace the grey with black, it will work perfectly with mix-blend-mode: screen.
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            // If it's roughly the grey background (e.g., r,g,b around 85-110)
            if (r > 60 && r < 120 && Math.abs(r-g) < 10 && Math.abs(r-b) < 10) {
                this.setPixelColor(blackColor, x, y);
            }
        });
        
        const outPath = '/config/vs-workspace/24-game/assets/minotaur.jpg';
        await image.writeAsync(outPath);
        console.log("Minotaur sprite fixed and saved to", outPath);
    } catch(e) {
        console.error(e);
    }
}
processImage();
