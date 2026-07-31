(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCatalogLines);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installBetween(family) {
        family.register("between", function(board, clue, helpers) {
            var values = clue.path.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            if (values.length < 3 || !values[0] || !values[values.length - 1]) return true;
            var low = Math.min(values[0], values[values.length - 1]);
            var high = Math.max(values[0], values[values.length - 1]);
            return values.slice(1, -1).every(function(value) {
                return !value || value > low && value < high;
            });
        });
    };
});
