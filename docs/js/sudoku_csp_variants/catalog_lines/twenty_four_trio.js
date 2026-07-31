(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCatalogLines);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installTwentyFourTrio(family) {
        var tuples = [
            [1, 2, 8], [1, 3, 6], [1, 3, 7], [1, 3, 8], [1, 3, 9], [1, 4, 5],
            [1, 4, 6], [1, 4, 7], [1, 4, 8], [1, 5, 5], [1, 5, 6],
            [2, 2, 6], [2, 3, 4], [2, 3, 6], [2, 3, 9], [2, 4, 4], [2, 4, 8],
            [2, 5, 7], [2, 5, 8], [2, 6, 6], [2, 6, 8], [2, 6, 9], [2, 8, 8],
            [3, 3, 4], [3, 3, 5], [3, 3, 7], [3, 3, 9], [3, 4, 4], [3, 4, 9],
            [3, 5, 9], [3, 6, 6], [3, 6, 7], [3, 6, 8], [3, 8, 9],
            [4, 4, 5], [4, 4, 7], [4, 4, 8], [4, 6, 8], [4, 7, 8], [4, 8, 8],
            [5, 6, 6], [5, 6, 9], [5, 8, 8],
            [6, 8, 9], [6, 9, 9], [7, 8, 9], [8, 8, 8]
        ];
        family.register("24trio", function(board, clue, helpers) {
            var values = clue.path.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            if (values.length !== 3) return false;
            var filled = values.filter(Boolean).sort(function(first, second) {
                return first - second;
            });
            if (!filled.length) return true;
            return tuples.some(function(tuple) {
                var remaining = tuple.slice();
                for (var index = 0; index < filled.length; index++) {
                    var match = remaining.indexOf(filled[index]);
                    if (match === -1) return false;
                    remaining.splice(match, 1);
                }
                return true;
            });
        });
    };
});
