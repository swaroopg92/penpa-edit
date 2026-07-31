(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installArithmetic(family) {
        family.register("arithmetic", function(board, clue, helpers) {
            var first = helpers.cellValue(board, clue.cells[0]);
            var second = helpers.cellValue(board, clue.cells[1]);
            if (!first || !second) return true;
            var firstValue = board.isZeroEight ? first - 1 : first;
            var secondValue = board.isZeroEight ? second - 1 : second;
            var sum = firstValue + secondValue;
            var difference = Math.abs(first - second);
            var product = firstValue * secondValue;
            return sum === clue.target || difference === clue.target ||
                product === clue.target ||
                (first % second === 0 && firstValue / secondValue === clue.target) ||
                (second % first === 0 && secondValue / firstValue === clue.target);
        });
    };
});
