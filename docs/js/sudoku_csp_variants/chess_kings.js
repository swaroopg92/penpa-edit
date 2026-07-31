(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installChessKings(csp) {
        if (!csp || typeof csp.registerConstraint !== "function") {
            throw new Error("chessKings requires SudokuCSP.registerConstraint");
        }
        csp.registerConstraint("chessKings", {
            validatePartial: function(board, item, helpers) {
                var invalidPairs = new Set();
                var invalidSingles = new Set();
                for (var index = 0; index < item.pairs.length; index++) {
                    var first = helpers.cellValue(board, item.pairs[index][0]);
                    var second = helpers.cellValue(board, item.pairs[index][1]);
                    if (!first || !second) continue;
                    if (first === second) {
                        invalidSingles.add(first);
                    } else {
                        invalidPairs.add(Math.min(first, second) + "-" + Math.max(first, second));
                    }
                }
                for (var firstDigit = 1; firstDigit <= helpers.size; firstDigit++) {
                    if (invalidSingles.has(firstDigit)) continue;
                    for (var secondDigit = firstDigit + 1; secondDigit <= helpers.size; secondDigit++) {
                        if (!invalidSingles.has(secondDigit) &&
                            !invalidPairs.has(firstDigit + "-" + secondDigit)) return true;
                    }
                }
                return false;
            }
        });
    };
});
