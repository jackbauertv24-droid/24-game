const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

dom.window.onerror = function(msg, source, lineno, colno, error) {
    console.error("JSDOM Error:", msg, "at line:", lineno);
};

dom.window.console.log = console.log;
dom.window.console.error = console.error;

setTimeout(() => {
    console.log("JSDOM test complete.");
    process.exit(0);
}, 2000);
