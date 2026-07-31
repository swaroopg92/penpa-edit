(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCatalogLines);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installTinder(family) {
        family.register("tinder", function(board, clue, helpers) {
            var values = clue.path.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            var assigned = values.filter(Boolean);
            var counts = {};
            assigned.forEach(function(value) {
                counts[value] = (counts[value] || 0) + 1;
            });
            var pairs = 0;
            var digits = Object.keys(counts);
            for (var index = 0; index < digits.length; index++) {
                if (counts[digits[index]] > 2) return false;
                if (counts[digits[index]] === 2) pairs++;
            }
            return pairs <= 1 && (assigned.length < values.length || pairs === 1);
        });
    };
});
