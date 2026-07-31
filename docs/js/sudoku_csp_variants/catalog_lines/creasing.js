(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCatalogLines);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installCreasing(family) {
        family.register("creasing", function(board, clue, helpers) {
            var values = clue.path.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            var increasing = true;
            var decreasing = true;
            for (var first = 0; first < values.length; first++) {
                if (!values[first]) continue;
                for (var second = first + 1; second < values.length; second++) {
                    if (!values[second]) continue;
                    if (values[first] >= values[second]) increasing = false;
                    if (values[first] <= values[second]) decreasing = false;
                }
            }
            return increasing || decreasing;
        });
    };
});
