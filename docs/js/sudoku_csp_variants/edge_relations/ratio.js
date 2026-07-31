(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installRatio(family) {
        family.register("ratio", function(board, clue, helpers) {
            var first = helpers.cellValue(board, clue.cells[0]);
            var second = helpers.cellValue(board, clue.cells[1]);
            if (!first || !second) return true;
            var parts = clue.sign.split(":");
            var x = parseInt(parts[0], 10);
            var y = parseInt(parts[1], 10);
            var firstValue = board.isZeroEight ? first - 1 : first;
            var secondValue = board.isZeroEight ? second - 1 : second;
            return firstValue * y === secondValue * x ||
                firstValue * x === secondValue * y;
        });
    };
});
