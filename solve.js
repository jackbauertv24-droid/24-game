function findSolutions(nums) {
    const ops = ['+', '-', '*', '/'];
    const results = [];
    
    function permute(arr) {
        if (arr.length === 0) return [[]];
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            const rest = permute(arr.slice(0, i).concat(arr.slice(i + 1)));
            for (const r of rest) result.push([arr[i]].concat(r));
        }
        return result;
    }

    function generateOps(count) {
        if (count === 1) return ops.map(o => [o]);
        const result = [];
        for (const first of ops) {
            for (const rest of generateOps(count - 1)) result.push([first].concat(rest));
        }
        return result;
    }

    const nPerms = permute(nums);
    const oCombs = generateOps(3);

    for (let numPerm of nPerms) {
        for (let opCombo of oCombs) {
            let result = numPerm[0];
            let str = numPerm[0] + "";
            let isValid = true;
            
            for (let i = 0; i < 3; i++) {
                let a = result;
                let b = numPerm[i + 1];
                let op = opCombo[i];
                
                if (op === '+') result = a + b;
                else if (op === '-') result = a - b;
                else if (op === '*') result = a * b;
                else if (op === '/') {
                    if (b === 0 || a % b !== 0) {
                        isValid = false;
                        break;
                    }
                    result = a / b;
                }
                str += " " + op + " " + b;
            }
            
            if (isValid && result === 24) {
                results.push(str + " = 24");
            }
        }
    }
    return [...new Set(results)];
}

console.log(findSolutions([8, 9, 8, 4]));
