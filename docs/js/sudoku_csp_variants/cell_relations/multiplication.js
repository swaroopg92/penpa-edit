(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCellRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installMultiplication(family) {
        family.register("multiplication", function(board, clue, helpers) {
            var factors = clue.top.map(function(cell) { return helpers.cellValue(board, cell); });
            var resultDigits = clue.bottom.map(function(cell) { return helpers.cellValue(board, cell); });
            if (factors.some(function(value) { return !value; }) ||
                resultDigits.some(function(value) { return !value; })) return true;
            var product = factors.reduce(function(total, value) { return total * value; }, 1);
            return Number(resultDigits.join("")) === product;
        });
    };
});
