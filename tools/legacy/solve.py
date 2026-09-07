import itertools

nums = [8, 9, 8, 4]
ops = ['+', '-', '*', '/']

for n_perm in set(itertools.permutations(nums)):
    for o_comb in itertools.product(ops, repeat=3):
        res = n_perm[0]
        valid = True
        expr = str(n_perm[0])
        for i in range(3):
            b = n_perm[i+1]
            op = o_comb[i]
            if op == '+': res += b
            elif op == '-': res -= b
            elif op == '*': res *= b
            elif op == '/':
                if b == 0 or res % b != 0:
                    valid = False
                    break
                res = res // b
            expr += f" {op} {b}"
        
        if valid and res == 24:
            print(f"{expr} = 24")
