(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installOneOrTwoDifferencePairs(family) {
        family.register("oneortwodifferencepairs", function(board, clue, helpers) {
            var first = helpers.cellValue(board, clue.cells[0]);
            var second = helpers.cellValue(board, clue.cells[1]);
            if (!first || !second) return true;
            var difference = Math.abs(first - second);
            return difference === 1 || difference === 2;
        });
    };
});
