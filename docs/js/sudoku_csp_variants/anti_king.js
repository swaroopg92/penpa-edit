(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installAntiKing(csp) {
        if (!csp || typeof csp.registerConstraint !== "function") {
            throw new Error("antiKing requires SudokuCSP.registerConstraint");
        }
        csp.registerConstraint("antiKing", {
            validatePartial: function(board, pair, helpers) {
                var first = helpers.cellValue(board, pair[0]);
                var second = helpers.cellValue(board, pair[1]);
                return !first || !second || first !== second;
            }
        });
    };
});
