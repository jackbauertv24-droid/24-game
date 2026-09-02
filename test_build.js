const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

console.log("Running automated JSDOM verification...");

const dom = new JSDOM(html, { 
    runScripts: "dangerously",
    pretendToBeVisual: true 
});

let errors = 0;

dom.window.addEventListener('error', (event) => {
    console.error('❌ JSDOM Runtime Error:', event.error);
    errors++;
});

// Give it a brief moment to execute synchronous setup
setTimeout(() => {
    if (errors === 0) {
        console.log("✅ Build passed JSDOM verification with 0 errors.");
        process.exit(0);
    } else {
        console.error(`❌ Build failed with ${errors} errors.`);
        process.exit(1);
    }
}, 500);
