(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installNoThreeInRow(csp) {
        if (!csp || typeof csp.registerConstraint !== "function") {
            throw new Error("noThreeInRow requires SudokuCSP.registerConstraint");
        }
        csp.registerConstraint("noThreeInRow", {
            validatePartial: function(board, cells, helpers) {
                var values = cells.map(function(cell) {
                    return helpers.cellValue(board, cell);
                });
                return values.some(function(value) { return !value; }) ||
                    !(values[0] % 2 === values[1] % 2 && values[1] % 2 === values[2] % 2);
            }
        });
    };
});
