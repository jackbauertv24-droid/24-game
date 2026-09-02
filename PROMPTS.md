# AI Image Generation Prompts - 24 Game

This document contains the exact prompts and workflow used to generate the assets for the game. You can use these templates with other Image AI models (like Midjourney, DALL-E 3, or Stable Diffusion) to maintain a perfectly consistent art style.

## 1. Monster Sprite Sheets (4x4 Grid)
This is the "Golden Prompt" used to generate the 24 enemies in the Bestiary. It enforces a strict 4x4 grid and strictly forbids the AI from polluting the sprite sheet with text, fonts, or labels.

**Prompt Template:**
> A 2D game sprite sheet of a [INSERT MONSTER DESCRIPTION]. Solid black background. The image MUST be a perfect grid of characters. 4 columns and 4 rows. Row 1: standing idle. Row 2: getting hit and blocking. Row 3: attacking. Row 4: falling down and dying. Pixel art style, side scrolling game character. ABSOLUTELY NO TEXT, NO FONTS, NO WORDS, NO LABELS, NO CAPTIONS. Masterpiece.

**Examples:**
* *...terrifying Demon King final boss.*
* *...fierce Goblin Warlord enemy.*
* *...dark Necromancer cultist enemy.*

**⚠️ Important Post-Processing Note:** 
AI generators rarely output *pure* `#000000` black; they usually output a very dark grey (e.g., `#0A0A0A`). Because the game relies on CSS `mix-blend-mode: screen` to render the sprites transparently, you **must** run the generated images through an image editor (or a script) to flood-fill the dark background pixels to absolute pure black (`#000000`). If you skip this step, the monsters will have a milky, semi-transparent square box around them in-game.

## 2. Backgrounds & Arenas
Used to generate the side-scrolling combat arenas.

**Prompt Template:**
> A 2D side scrolling game background of a [INSERT LOCATION]. Pixel art style, dark fantasy, moody lighting, highly detailed, masterpiece. ABSOLUTELY NO TEXT, NO FONTS, NO UI ELEMENTS.

**Examples:**
* *...dark dungeon with stone walls and torches.*
* *...terrifying volcanic boss arena with lava.*

## 3. Player Class Portraits
Used for the Class Selection menu.

**Prompt Template:**
> A square RPG class portrait of a [INSERT CLASS]. Dark fantasy pixel art style, high quality, moody lighting. Solid dark background. ABSOLUTELY NO TEXT.

**Examples:**
* *...heavily armored Warrior.*
* *...hooded Rogue.*
