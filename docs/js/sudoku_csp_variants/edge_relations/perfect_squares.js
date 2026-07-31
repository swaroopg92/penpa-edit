(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installPerfectSquares(family) {
        var squares = [16, 25, 36, 49, 64, 81];
        function isPerfectSquare(board, clue, helpers) {
            var first = helpers.cellValue(board, clue.cells[0]);
            var second = helpers.cellValue(board, clue.cells[1]);
            return !first || !second ? null : squares.indexOf(first * 10 + second) !== -1;
        }
        family.register("perfectsquares", function(board, clue, helpers) {
            var result = isPerfectSquare(board, clue, helpers);
            return result === null || result;
        });
        family.register("notPerfectSquare", function(board, clue, helpers) {
            var result = isPerfectSquare(board, clue, helpers);
            return result === null || !result;
        });
    };
});
