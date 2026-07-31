(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCatalogLines);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installParityLines(family) {
        family.register("paritylines", function(board, clue, helpers) {
            var assigned = clue.path.map(function(cell) {
                return helpers.cellValue(board, cell);
            }).filter(Boolean);
            return assigned.length < 2 || assigned.every(function(value) {
                return value % 2 === assigned[0] % 2;
            });
        });
    };
});
