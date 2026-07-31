(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCatalogLines);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installFactorLines(family) {
        family.register("factorlines", function(board, clue, helpers) {
            var values = clue.path.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            for (var index = 0; index < values.length - 1; index++) {
                if (values[index] && values[index + 1] &&
                    values[index] % values[index + 1] !== 0 &&
                    values[index + 1] % values[index] !== 0) {
                    return false;
                }
            }
            return true;
        });
    };
});
