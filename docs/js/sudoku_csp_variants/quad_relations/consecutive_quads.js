(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPQuadRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installConsecutiveQuads(family) {
        family.register("consecutivequads", function(board, clue, helpers) {
            var values = clue.cells.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            if (values.filter(Boolean).length < 4) return true;
            var pairs = 0;
            for (var left = 0; left < values.length; left++) {
                for (var right = left + 1; right < values.length; right++) {
                    if (Math.abs(values[left] - values[right]) === 1) pairs++;
                }
            }
            return clue.kind === "black" ? pairs >= 2 : pairs === 1;
        });
    };
});
