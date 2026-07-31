(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installDifference(family) {
        family.register("difference", function(board, clue, helpers) {
            var first = helpers.cellValue(board, clue.cells[0]);
            var second = helpers.cellValue(board, clue.cells[1]);
            return !first || !second || Math.abs(first - second) === clue.target;
        });
    };
});
