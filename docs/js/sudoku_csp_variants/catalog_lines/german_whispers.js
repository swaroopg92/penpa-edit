(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCatalogLines);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installGermanWhispers(family) {
        family.register("germanwhispers", function(board, clue, helpers) {
            var values = clue.path.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            for (var index = 0; index < values.length - 1; index++) {
                if (values[index] && values[index + 1] &&
                    Math.abs(values[index] - values[index + 1]) < 5) {
                    return false;
                }
            }
            return true;
        });
    };
});
