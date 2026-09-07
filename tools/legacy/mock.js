global.window = {};
global.document = {
    getElementById: () => ({ classList: { remove: ()=>{}, add: ()=>{} }, style: {}, addEventListener: ()=>{}, onclick: null, querySelectorAll: ()=>[] }),
    querySelectorAll: () => [],
    querySelector: () => ({ classList: { remove: ()=>{}, add: ()=>{} } })
};
global.localStorage = { getItem: ()=>null, setItem: ()=>{} };
global.Audio = class { constructor(){} play(){} };
require('./test_syntax.js');
