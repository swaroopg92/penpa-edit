(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCellRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installTrio(family) {
        family.register("trio", function(board, clue, helpers) {
            var value = helpers.cellValue(board, clue.cell);
            return !value || (value >= clue.minimum && value <= clue.maximum);
        });
    };
});
