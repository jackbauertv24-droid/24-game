const { Jimp } = require('jimp');

async function check(file) {
    const img = await Jimp.read('/config/vs-workspace/24-game/assets/' + file);
    const idx = 0; // top left pixel
    const r = img.bitmap.data[0];
    const g = img.bitmap.data[1];
    const b = img.bitmap.data[2];
    console.log(file + ": RGB(" + r + "," + g + "," + b + ")");
}

async function run() {
    await check('orc.jpg');
    await check('wraith.jpg');
    await check('skeleton.jpg');
}
run();
