const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');
const dom = new JSDOM(html, { runScripts: "dangerously" });

dom.window.addEventListener('error', (event) => {
  console.log('JSDOM Error:', event.error);
});

console.log("Mock started. Check for errors above.");
