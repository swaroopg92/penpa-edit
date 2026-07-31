(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installEvenSumPairs(family) {
        family.register("evenSum", function(board, clue, helpers) {
            var first = helpers.cellValue(board, clue.cells[0]);
            var second = helpers.cellValue(board, clue.cells[1]);
            if (!first || !second) return true;
            var sum = (board.isZeroEight ? first - 1 : first) +
                (board.isZeroEight ? second - 1 : second);
            return sum % 2 === 0;
        });
    };
});
