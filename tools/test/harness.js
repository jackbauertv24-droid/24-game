// Shared harness: loads the real index.html and can play verified solutions.
const { JSDOM } = require('jsdom');
const fs = require('fs');
function load(file){
  const dom = new JSDOM(fs.readFileSync(file,'utf8'), {
    runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.com/',
    beforeParse(w){ w.Image = class { set src(v){} }; }
  });
  return dom.window;
}
// Play the current board's known solution through the real UI functions.
function solveBoard(w){
  const sol = w.eval('currentSolution');
  if(!sol || !/=/.test(sol)) return false;
  const nums = JSON.parse(w.eval('JSON.stringify(currentNumbers.map(n=>n.value))'));
  const toks = sol.replace(' = 24','').split(' ');
  const pool = nums.map((v,ix)=>({v,ix,used:false}));
  let script='';
  for(let k=0;k<toks.length;k++){
    if(k%2===0){ const c=pool.find(p=>!p.used && p.v===Number(toks[k])); if(!c) return false; c.used=true; script+='selectNumber('+c.ix+');'; }
    else script+='selectOperator("'+toks[k]+'");';
  }
  w.eval('clearAll();'); w.eval(script); w.eval('cancelAutoSubmit();');
  return true;
}
module.exports = { load, solveBoard };
