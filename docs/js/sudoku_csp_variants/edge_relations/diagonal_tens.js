(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installDiagonalTens(family) {
        function isSumTen(board, clue, helpers) {
            var first = helpers.cellValue(board, clue.cells[0]);
            var second = helpers.cellValue(board, clue.cells[1]);
            if (!first || !second) return null;
            return (board.isZeroEight ? first - 1 : first) +
                (board.isZeroEight ? second - 1 : second) === 10;
        }
        family.register("diagonalTens", function(board, clue, helpers) {
            var result = isSumTen(board, clue, helpers);
            return result === null || result;
        });
        family.register("notDiagonalTens", function(board, clue, helpers) {
            var result = isSumTen(board, clue, helpers);
            return result === null || !result;
        });
    };
});
