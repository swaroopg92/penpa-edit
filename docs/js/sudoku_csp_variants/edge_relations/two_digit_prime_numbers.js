(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installTwoDigitPrimeNumbers(family) {
        var primes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53,
            59, 61, 67, 71, 73, 79, 83, 89, 97];
        function isTwoDigitPrime(board, clue, helpers) {
            var first = helpers.cellValue(board, clue.cells[0]);
            var second = helpers.cellValue(board, clue.cells[1]);
            return !first || !second ? null : primes.indexOf(first * 10 + second) !== -1;
        }
        family.register("twodigitprimenumbers", function(board, clue, helpers) {
            var result = isTwoDigitPrime(board, clue, helpers);
            return result === null || result;
        });
        family.register("notTwodigitprimenumbers", function(board, clue, helpers) {
            var result = isTwoDigitPrime(board, clue, helpers);
            return result === null || !result;
        });
    };
});
