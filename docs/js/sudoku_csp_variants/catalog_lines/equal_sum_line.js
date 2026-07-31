(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCatalogLines);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installEqualSumLine(family) {
        family.register("equalsumline", function(board, clue, helpers) {
            var groups = {};
            clue.path.forEach(function(cell) {
                var box = helpers.boxIndex(cell.row, cell.col, board.length);
                (groups[box] || (groups[box] = [])).push(cell);
            });
            var minPossible = -Infinity;
            var maxPossible = Infinity;
            Object.keys(groups).forEach(function(box) {
                var sum = 0;
                var blanks = 0;
                groups[box].forEach(function(cell) {
                    var value = helpers.cellValue(board, cell);
                    if (value) sum += value;
                    else blanks++;
                });
                var minSum = sum + blanks;
                var maxSum = sum + blanks * board.length;
                if (!blanks) minSum = maxSum = sum;
                if (minSum > minPossible) minPossible = minSum;
                if (maxSum < maxPossible) maxPossible = maxSum;
            });
            return minPossible <= maxPossible;
        });
    };
});
