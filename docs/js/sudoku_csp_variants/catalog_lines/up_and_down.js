(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCatalogLines);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installUpAndDown(family) {
        family.register("upanddown", function(board, clue, helpers) {
            var values = clue.path.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            var pattern0Valid = true;
            var pattern1Valid = true;
            for (var index = 0; index < values.length - 1; index++) {
                var first = values[index];
                var second = values[index + 1];
                if (!first || !second) continue;
                var difference = second - first;
                if (Math.abs(difference) < 4) return false;
                if (difference > 0) {
                    if (index % 2 !== 0) pattern0Valid = false;
                    if (index % 2 === 0) pattern1Valid = false;
                } else {
                    if (index % 2 === 0) pattern0Valid = false;
                    if (index % 2 !== 0) pattern1Valid = false;
                }
            }
            return pattern0Valid || pattern1Valid;
        });
    };
});
