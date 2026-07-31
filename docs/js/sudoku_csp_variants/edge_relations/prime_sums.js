(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installPrimeSums(family) {
        var primes = [2, 3, 5, 7, 11, 13, 17];
        function hasPrimeSum(board, clue, helpers) {
            var first = helpers.cellValue(board, clue.cells[0]);
            var second = helpers.cellValue(board, clue.cells[1]);
            if (!first || !second) return null;
            var sum = (board.isZeroEight ? first - 1 : first) +
                (board.isZeroEight ? second - 1 : second);
            return primes.indexOf(sum) !== -1;
        }
        family.register("primesums", function(board, clue, helpers) {
            var result = hasPrimeSum(board, clue, helpers);
            return result === null || result;
        });
        family.register("notPrimesums", function(board, clue, helpers) {
            var result = hasPrimeSum(board, clue, helpers);
            return result === null || !result;
        });
    };
});
