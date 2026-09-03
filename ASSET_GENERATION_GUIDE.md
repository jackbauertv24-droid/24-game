# 24-Game: Official Asset Generation Guide

This document outlines the strict pipeline required to generate new enemies for the game. Because the game relies on CSS `mix-blend-mode: screen` and a strict `steps(4)` animation cycle, every sprite sheet must perfectly adhere to this format.

You can use any image generation tool (Midjourney, DALL-E 3, Stable Diffusion, or Google Imagen) as long as you follow these instructions.

---

## Step 1: The Golden Prompt

When prompting your AI image generator, copy and paste this exact prompt. Only change the `[CONCEPT]` bracket.

> "A 2D game sprite sheet of a [CONCEPT]. Solid black background. The image MUST be a perfect grid of characters. 4 columns and 4 rows. Row 1: standing idle. Row 2: getting hit and blocking. Row 3: attacking. Row 4: falling down and dying. Pixel art style, side scrolling game character. ABSOLUTELY NO TEXT, NO FONTS, NO WORDS, NO LABELS, NO CAPTIONS. Masterpiece."

**Example Concepts:**
- `Savage Manticore (lion body, scorpion tail)`
- `Skeleton Warrior (undead soldier with rusted sword and shield)`
- `Goblin Thief (sneaky green goblin with daggers)`

---

## Step 2: Post-Processing (Crucial)

AI generators rarely output a true `#000000` pure black background. They often output dark grey `#0c0c0c` or insert faint white gridlines. **If the background is not pure black, the CSS `mix-blend-mode: screen` will make the entire game screen look muddy.**

You must run the generated image through a processing script (like `jimp` in Node.js) to:
1. Flood-fill all near-black pixels to `RGB(0,0,0)`.
2. Darken any faint AI grid lines around `x=256, 512, 768` and `y=256, 512, 768`.
3. Crop the top-left corner `(0, 0, 256, 256)` to create the `_thumb.jpg` for the UI.

### The Node.js Processing Script
If you are generating these manually, you can use this exact Node script to clean them:

```javascript
const Jimp = require('jimp');

async function processImage(srcPath, destPath, thumbPath) {
    const image = await Jimp.read(srcPath);
    const bgColor = Jimp.intToRGBA(image.getPixelColor(0, 0));
    const threshold = 30; // Aggressive dark-grey removal
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        
        // 1. Convert near-black backgrounds to pure black
        if (Math.abs(r - bgColor.r) < threshold && 
            Math.abs(g - bgColor.g) < threshold && 
            Math.abs(b - bgColor.b) < threshold) {
            this.bitmap.data[idx + 0] = 0;
            this.bitmap.data[idx + 1] = 0;
            this.bitmap.data[idx + 2] = 0;
        }
        
        // 2. Erase faint white AI gridlines
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
    const thumb = image.clone().crop(0, 0, 256, 256);
    await thumb.writeAsync(thumbPath);
}

// Usage: node process.js input.jpg output.jpg output_thumb.jpg
```

---

## Step 3: Game Integration

Once the image is pure black and formatted, save both the main sprite and the thumbnail to the `/assets/` directory:
- `assets/my_new_enemy.jpg`
- `assets/my_new_enemy_thumb.jpg`

Finally, open `index.html` and add the enemy to the `const ENEMIES` array. 

```javascript
{ 
    name: "My New Enemy", 
    url: "assets/my_new_enemy.jpg", 
    filter: "none", 
    hidden: false  // Set to true if you are just banking it for later
}
```

*Note: The game engine automatically looks for `url.replace('.jpg', '_thumb.jpg')` to render the UI portraits, which is why the thumbnail naming convention is mandatory.*
