const fs = require('fs');

let readme = fs.readFileSync('/config/vs-workspace/24-game/README.md', 'utf-8');

// Fix broken link
readme = readme.replace('assets/bg_arena.jpg', 'assets/bg_boss.jpg');

// Update gallery to use thumbnails
readme = readme.replace('assets/demon_king.jpg', 'assets/demon_king_thumb.jpg');
readme = readme.replace('assets/lich_v2.jpg', 'assets/lich_v2_thumb.jpg');
readme = readme.replace('assets/shadow_assassin_v2.jpg', 'assets/shadow_assassin_v2_thumb.jpg');
readme = readme.replace('assets/class_wizard.jpg', 'assets/swamp_troll_v2_thumb.jpg'); // Swap wizard class for troll thumb

fs.writeFileSync('/config/vs-workspace/24-game/README.md', readme, 'utf-8');
console.log("Updated README.md");
