(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPQuadRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installEqualRatios(family) {
        family.register("equalratios", function(board, clue, helpers) {
            var values = clue.cells.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            if (values.filter(Boolean).length < 4) return true;
            return Math.max(values[0], values[3]) * Math.min(values[1], values[2]) ===
                Math.max(values[1], values[2]) * Math.min(values[0], values[3]);
        });
    };
});
