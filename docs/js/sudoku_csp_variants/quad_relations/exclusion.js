(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPQuadRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installExclusion(family) {
        family.register("exclusion", function(board, clue, helpers) {
            var assigned = clue.cells.map(function(cell) {
                return helpers.cellValue(board, cell);
            }).filter(Boolean);
            return clue.digits.every(function(digit) {
                return assigned.indexOf(digit) === -1;
            });
        });
    };
});
