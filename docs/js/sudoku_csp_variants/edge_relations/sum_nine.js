(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installSumNine(family) {
        function isSumNine(board, clue, helpers) {
            var first = helpers.cellValue(board, clue.cells[0]);
            var second = helpers.cellValue(board, clue.cells[1]);
            if (!first || !second) return null;
            return (board.isZeroEight ? first - 1 : first) +
                (board.isZeroEight ? second - 1 : second) === 9;
        }
        family.register("sumnine", function(board, clue, helpers) {
            var result = isSumNine(board, clue, helpers);
            return result === null || result;
        });
        family.register("notSumnine", function(board, clue, helpers) {
            var result = isSumNine(board, clue, helpers);
            return result === null || !result;
        });
    };
});
