(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installTermination(family) {
        function terminates(board, clue, helpers) {
            var first = helpers.cellValue(board, clue.cells[0]);
            var second = helpers.cellValue(board, clue.cells[1]);
            if (!first || !second) return null;
            var firstValue = board.isZeroEight ? first - 1 : first;
            var secondValue = board.isZeroEight ? second - 1 : second;
            return (firstValue + secondValue) % 10 === 0 ||
                (firstValue * secondValue) % 10 === 0;
        }
        family.register("termination", function(board, clue, helpers) {
            var result = terminates(board, clue, helpers);
            return result === null || result;
        });
        family.register("notTermination", function(board, clue, helpers) {
            var result = terminates(board, clue, helpers);
            return result === null || !result;
        });
    };
});
