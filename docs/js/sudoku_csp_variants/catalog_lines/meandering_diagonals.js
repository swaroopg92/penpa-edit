(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCatalogLines);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installMeanderingDiagonals(family) {
        family.register("meandering diagonals", function(board, clue, helpers) {
            var assigned = clue.path.map(function(cell) {
                return helpers.cellValue(board, cell);
            }).filter(Boolean);
            return new Set(assigned).size === assigned.length;
        });
    };
});
