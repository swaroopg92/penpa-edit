(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) {
        module.exports = install;
    } else {
        install(root.SudokuCSP);
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installNoEvenNeighbours(csp) {
        if (!csp || typeof csp.registerConstraint !== "function") {
            throw new Error("noEvenNeighbours requires SudokuCSP.registerConstraint");
        }

        csp.registerConstraint("noEvenNeighbours", {
            validatePartial: function(board, pair, helpers) {
                var first = helpers.cellValue(board, pair[0]);
                var second = helpers.cellValue(board, pair[1]);
                return !first || !second || first % 2 || second % 2;
            }
        });
    };
});
