(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCatalogLines);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installAlternatingStripes(family) {
        family.register("alternatingstripes", function(board, clue, helpers) {
            var values = clue.path.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            var assigned = values.filter(Boolean);
            if (new Set(assigned).size !== assigned.length) return false;
            for (var index = 1; index < values.length - 1; index++) {
                if (!values[index - 1] || !values[index] || !values[index + 1]) continue;
                var firstStep = values[index] - values[index - 1];
                var secondStep = values[index + 1] - values[index];
                if (!firstStep || !secondStep || firstStep * secondStep >= 0) return false;
            }
            return true;
        });
    };
});
