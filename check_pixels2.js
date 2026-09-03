const { Jimp } = require('jimp');

async function check(file) {
    const img = await Jimp.read('/config/vs-workspace/24-game/assets/' + file);
    const r = img.bitmap.data[0];
    const g = img.bitmap.data[1];
    const b = img.bitmap.data[2];
    console.log(file + ": RGB(" + r + "," + g + "," + b + ")");
}

async function run() {
    await check('fire_elemental.jpg');
    await check('spider.jpg');
    await check('lich.jpg');
}
run();
