(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCatalogLines);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installRenban(family) {
        family.register("renban", {
            validatePartial: function(board, clue, helpers) {
                var values = clue.path.map(function(cell) {
                    return helpers.cellValue(board, cell);
                });
                var assigned = values.filter(Boolean);
                if (new Set(assigned).size !== assigned.length) return false;
                return !assigned.length ||
                    Math.max.apply(null, assigned) - Math.min.apply(null, assigned) < values.length;
            },
            validateComplete: function(board, clue, helpers) {
                var values = clue.path.map(function(cell) {
                    return helpers.cellValue(board, cell);
                });
                return Math.max.apply(null, values) - Math.min.apply(null, values) ===
                    values.length - 1;
            }
        });
    };
});
