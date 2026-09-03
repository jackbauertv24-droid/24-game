const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const soundInjection = `
                case 'coin':
                    const coinOsc = audioCtx.createOscillator();
                    const coinGain = audioCtx.createGain();
                    coinOsc.type = 'sine';
                    coinOsc.frequency.setValueAtTime(1200, t);
                    coinOsc.frequency.exponentialRampToValueAtTime(2000, t + 0.1);
                    coinGain.gain.setValueAtTime(0, t);
                    coinGain.gain.linearRampToValueAtTime(0.5, t + 0.05);
                    coinGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
                    coinOsc.connect(coinGain); coinGain.connect(audioCtx.destination);
                    coinOsc.start(); coinOsc.stop(t + 0.3);
                    
                    const coinOsc2 = audioCtx.createOscillator();
                    const coinGain2 = audioCtx.createGain();
                    coinOsc2.type = 'sine';
                    coinOsc2.frequency.setValueAtTime(1600, t + 0.1);
                    coinOsc2.frequency.exponentialRampToValueAtTime(2400, t + 0.2);
                    coinGain2.gain.setValueAtTime(0, t + 0.1);
                    coinGain2.gain.linearRampToValueAtTime(0.5, t + 0.15);
                    coinGain2.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
                    coinOsc2.connect(coinGain2); coinGain2.connect(audioCtx.destination);
                    coinOsc2.start(t + 0.1); coinOsc2.stop(t + 0.4);
                    break;
                    
                case 'critical':
                    const critOsc = audioCtx.createOscillator();
                    const critGain = audioCtx.createGain();
                    critOsc.type = 'sawtooth';
                    critOsc.frequency.setValueAtTime(150, t);
                    critOsc.frequency.exponentialRampToValueAtTime(40, t + 0.3);
                    critGain.gain.setValueAtTime(1, t);
                    critGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
                    critOsc.connect(critGain); critGain.connect(audioCtx.destination);
                    critOsc.start(); critOsc.stop(t + 0.3);
                    break;
                    
                case 'magic':
                    const magOsc = audioCtx.createOscillator();
                    const magGain = audioCtx.createGain();
                    magOsc.type = 'sine';
                    magOsc.frequency.setValueAtTime(600, t);
                    magOsc.frequency.setValueAtTime(800, t + 0.1);
                    magOsc.frequency.setValueAtTime(1200, t + 0.2);
                    magGain.gain.setValueAtTime(0, t);
                    magGain.gain.linearRampToValueAtTime(0.3, t + 0.05);
                    magGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
                    magOsc.connect(magGain); magGain.connect(audioCtx.destination);
                    magOsc.start(); magOsc.stop(t + 0.4);
                    break;
                    
                case 'shield':
                    const shOsc = audioCtx.createOscillator();
                    const shGain = audioCtx.createGain();
                    shOsc.type = 'square';
                    shOsc.frequency.setValueAtTime(400, t);
                    shOsc.frequency.exponentialRampToValueAtTime(150, t + 0.1);
                    shGain.gain.setValueAtTime(0.6, t);
                    shGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                    shOsc.connect(shGain); shGain.connect(audioCtx.destination);
                    shOsc.start(); shOsc.stop(t + 0.1);
                    break;
`;

if (!html.includes("case 'coin':")) {
    html = html.replace("switch(type) {", "switch(type) {" + soundInjection);
}

fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
console.log("Sounds added.");
