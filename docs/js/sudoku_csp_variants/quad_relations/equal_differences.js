(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPQuadRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installEqualDifferences(family) {
        family.register("equaldifferences", function(board, clue, helpers) {
            var values = clue.cells.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            return values.filter(Boolean).length < 4 ||
                Math.abs(values[0] - values[3]) === Math.abs(values[1] - values[2]);
        });
    };
});
