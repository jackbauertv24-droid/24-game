const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const oldEnemiesRegex = /const ENEMIES = \[\s*\{[\s\S]*?\];/;
const newEnemies = `const ENEMIES = [
            { name: "Stone Golem", url: "assets/golem_spritesheet.jpg", filter: "none" },
            { name: "Magma Golem", url: "assets/golem_spritesheet.jpg", filter: "hue-rotate(150deg) saturate(2) brightness(1.2)", hidden: true },
            { name: "Frost Golem", url: "assets/golem_spritesheet.jpg", filter: "hue-rotate(210deg) saturate(1.5) brightness(1.5)", hidden: true },
            { name: "Toxic Sludge Golem", url: "assets/golem_spritesheet.jpg", filter: "hue-rotate(80deg) saturate(2) brightness(1.1)", hidden: true },
            { name: "Void Golem", url: "assets/golem_spritesheet.jpg", filter: "hue-rotate(280deg) saturate(1.5) contrast(1.5)", hidden: true },
            { name: "Golden Golem", url: "assets/golem_spritesheet.jpg", filter: "sepia(1) saturate(3) hue-rotate(10deg) brightness(1.3)", hidden: true },
            { name: "Skeleton Warrior", url: "assets/skeleton.jpg", filter: "none", hidden: true },
            { name: "Goblin Thief", url: "assets/goblin.jpg", filter: "none", hidden: true },
            { name: "Vampire Bat", url: "assets/bat.jpg", filter: "none", hidden: true },
            { name: "Beholder", url: "assets/beholder.jpg", filter: "none", hidden: true },
            { name: "Red Dragon", url: "assets/dragon.jpg", filter: "none", hidden: true },
            { name: "Orc Warlord", url: "assets/orc.jpg", filter: "none" },
            { name: "Ghostly Wraith", url: "assets/wraith.jpg", filter: "none" },
            { name: "Fire Elemental", url: "assets/fire_elemental.jpg", filter: "none" },
            { name: "Armored Spider", url: "assets/spider.jpg", filter: "none" },
            { name: "Lich King", url: "assets/lich.jpg", filter: "none" },
            { name: "Crystal Golem", url: "assets/crystal_golem.jpg", filter: "none" },
            { name: "Minotaur Gladiator", url: "assets/minotaur.jpg", filter: "none" }
        ];`;

html = html.replace(oldEnemiesRegex, newEnemies);

// Replace spawnEnemy logic to filter hidden
const spawnEnemyRegex = /const enemyType = ENEMIES\[Math\.floor\(Math\.random\(\) \* ENEMIES\.length\)\];/;
const spawnEnemyNew = `const activeEnemies = ENEMIES.filter(e => !e.hidden);
                const enemyType = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];`;
html = html.replace(spawnEnemyRegex, spawnEnemyNew);

// Replace gallery update logic to filter hidden
const galUpdateOld = `const enemy = ENEMIES[galIndex];
            document.getElementById('galName').textContent = (galIndex + 1) + ". " + enemy.name;`;
const galUpdateNew = `const activeEnemies = ENEMIES.filter(e => !e.hidden);
            const enemy = activeEnemies[galIndex];
            document.getElementById('galName').textContent = (galIndex + 1) + ". " + enemy.name;`;
html = html.replace(galUpdateOld, galUpdateNew);

// Fix gallery Prev/Next buttons
const galPrevOld = `galIndex = (galIndex - 1 + ENEMIES.length) % ENEMIES.length;`;
const galPrevNew = `const len = ENEMIES.filter(e => !e.hidden).length;
            galIndex = (galIndex - 1 + len) % len;`;
html = html.replace(galPrevOld, galPrevNew);

const galNextOld = `galIndex = (galIndex + 1) % ENEMIES.length;`;
const galNextNew = `const len = ENEMIES.filter(e => !e.hidden).length;
            galIndex = (galIndex + 1) % len;`;
html = html.replace(galNextOld, galNextNew);

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Hidden enemies logic applied.");
