(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installXyDifference(family) {
        function matchesReference(board, clue, helpers) {
            var first = helpers.cellValue(board, clue.cells[0]);
            var second = helpers.cellValue(board, clue.cells[1]);
            var reference = helpers.cellValue(board, clue.reference);
            if (!first || !second || !reference) return null;
            return Math.abs(first - second) === reference;
        }
        family.register("xydifference", function(board, clue, helpers) {
            var result = matchesReference(board, clue, helpers);
            return result === null || result;
        });
        family.register("notXydifference", function(board, clue, helpers) {
            var result = matchesReference(board, clue, helpers);
            return result === null || !result;
        });
    };
});
