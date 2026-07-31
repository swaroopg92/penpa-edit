(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installFives(family) {
        function isFive(board, clue, helpers) {
            var first = helpers.cellValue(board, clue.cells[0]);
            var second = helpers.cellValue(board, clue.cells[1]);
            if (!first || !second) return null;
            var sum = (board.isZeroEight ? first - 1 : first) +
                (board.isZeroEight ? second - 1 : second);
            return sum === 5 || Math.abs(first - second) === 5;
        }
        family.register("fives", function(board, clue, helpers) {
            var result = isFive(board, clue, helpers);
            return result === null || result;
        });
        family.register("notFives", function(board, clue, helpers) {
            var result = isFive(board, clue, helpers);
            return result === null || !result;
        });
    };
});
