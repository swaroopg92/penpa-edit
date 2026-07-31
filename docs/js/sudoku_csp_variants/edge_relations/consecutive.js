(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installConsecutive(family) {
        function isConsecutive(board, clue, helpers) {
            var first = helpers.cellValue(board, clue.cells[0]);
            var second = helpers.cellValue(board, clue.cells[1]);
            return !first || !second ? null : Math.abs(first - second) === 1;
        }
        family.register("consecutive", function(board, clue, helpers) {
            var result = isConsecutive(board, clue, helpers);
            return result === null || result;
        });
        family.register("notConsecutive", function(board, clue, helpers) {
            var result = isConsecutive(board, clue, helpers);
            return result === null || !result;
        });
    };
});
