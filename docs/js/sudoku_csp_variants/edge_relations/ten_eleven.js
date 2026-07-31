(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installTenEleven(family) {
        function isTenOrEleven(board, clue, helpers) {
            var first = helpers.cellValue(board, clue.cells[0]);
            var second = helpers.cellValue(board, clue.cells[1]);
            if (!first || !second) return null;
            var sum = (board.isZeroEight ? first - 1 : first) +
                (board.isZeroEight ? second - 1 : second);
            return sum === 10 || sum === 11;
        }
        family.register("teneleven", function(board, clue, helpers) {
            var result = isTenOrEleven(board, clue, helpers);
            return result === null || result;
        });
        family.register("notTenEleven", function(board, clue, helpers) {
            var result = isTenOrEleven(board, clue, helpers);
            return result === null || !result;
        });
    };
});
