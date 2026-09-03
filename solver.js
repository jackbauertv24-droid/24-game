function evaluateExpression(nums, ops) {
    let result = nums[0];
    for (let i = 0; i < ops.length; i++) {
        const num = nums[i + 1];
        switch (ops[i]) {
            case '+': result += num; break;
            case '−': case '-': result -= num; break;
            case '×': case '*': result *= num; break;
            case '÷': case '/':
                if (num === 0 || result % num !== 0) return null;
                result = result / num;
                break;
        }
    }
    return result;
}

function getPermutations(arr) {
    if (arr.length <= 1) return [arr];
    const perms = [];
    for (let i = 0; i < arr.length; i++) {
        const current = arr[i];
        const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
        const remainingPerms = getPermutations(remaining);
        for (const perm of remainingPerms) {
            perms.push([current, ...perm]);
        }
    }
    return perms;
}

function getOperatorCombinations(operators, length) {
    if (length === 1) return operators.map(op => [op]);
    const combos = [];
    const smallerCombos = getOperatorCombinations(operators, length - 1);
    for (const op of operators) {
        for (const combo of smallerCombos) {
            combos.push([op, ...combo]);
        }
    }
    return combos;
}

const mediumPuzzles = [
    [3, 5, 7, 8], [4, 5, 6, 7], [5, 6, 7, 8], [3, 6, 7, 9]
];

const ops = ['+', '-', '*']; // Medium operators
for (let puzzle of mediumPuzzles) {
    let solved = false;
    let numPerms = getPermutations(puzzle);
    let opCombos = getOperatorCombinations(ops, 3);
    for (let nums of numPerms) {
        for (let op of opCombos) {
            if (evaluateExpression(nums, op) === 24) {
                console.log(`${puzzle} is solvable: ${nums[0]} ${op[0]} ${nums[1]} ${op[1]} ${nums[2]} ${op[2]} ${nums[3]} = 24`);
                solved = true;
                break;
            }
        }
        if (solved) break;
    }
    if (!solved) console.log(`${puzzle} is UNSOLVABLE with Medium operators (+, -, *)!`);
}
