(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCatalogLines);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installSequence(family) {
        family.register("sequence", {
            validateComplete: function(board, clue, helpers) {
                var values = clue.path.map(function(cell) {
                    return helpers.cellValue(board, cell);
                });
                if (values.length < 3) return true;
                var step = values[1] - values[0];
                return values.every(function(value, index) {
                    return index === 0 || value - values[index - 1] === step;
                });
            }
        });
    };
});
