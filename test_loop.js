const fs = require('fs');
const { JSDOM } = require('jsdom');

let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');
// Mock WebGLRenderer
html = html.replace('renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });', 'renderer = { setSize: ()=>{}, setPixelRatio: ()=>{}, setClearColor: ()=>{}, render: ()=>{} };');
// Mock Canvas context
html = html.replace("const ctx = canvas.getContext('2d');", "const ctx = { createImageData: ()=>({ data: new Uint8Array(512*512*4) }), putImageData: ()=>{} };");

const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

dom.window.onerror = function(msg, source, lineno, colno, error) {
    console.error("JSDOM Error:", msg, "at line:", lineno);
};
dom.window.console.log = console.log;
dom.window.console.error = console.error;

setTimeout(() => {
    console.log("If no errors above, animation loop didn't crash.");
    process.exit(0);
}, 2000);
