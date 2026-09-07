# Regression suite

Loads the shipped `index.html` into jsdom and drives the real game functions —
no build step, no test framework, no copy of the logic to drift out of sync.

    npm test                       # checks ../../index.html
    node tools/test/regression.js <path-to-index.html>

Each assertion pins a defect that shipped at least once. `findSolutions()` is a
pure function with an exact contract, so the puzzle-generation checks are run as
Monte-Carlo sweeps: 400 generated boards are each re-verified against their own
tier's operator set.
