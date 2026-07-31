(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installPirateCells(csp) {
        if (!csp || typeof csp.registerConstraint !== "function") {
            throw new Error("pirateCells requires SudokuCSP.registerConstraint");
        }
        csp.registerConstraint("pirateCells", {
            validatePartial: function(board, pair, helpers) {
                var first = helpers.cellValue(board, pair[0]);
                var second = helpers.cellValue(board, pair[1]);
                if (!first || !second) return true;
                if (first === 5 && second >= 6 && second <= 9) return false;
                if (second === 5 && first >= 6 && first <= 9) return false;
                return true;
            }
        });
    };
});
