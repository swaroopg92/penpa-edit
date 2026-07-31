(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPQuadRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installQuadro(family) {
        family.register("quadro", function(board, clue, helpers) {
            var assigned = clue.cells.map(function(cell) {
                return helpers.cellValue(board, cell);
            }).filter(Boolean);
            return assigned.length < 4 || !assigned.every(function(value) {
                return value % 2 === assigned[0] % 2;
            });
        });
    };
});
