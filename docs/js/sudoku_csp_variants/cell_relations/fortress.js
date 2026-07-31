(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCellRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installFortress(family) {
        family.register("fortress", function(board, clue, helpers) {
            var shaded = helpers.cellValue(board, clue.shaded);
            var unshaded = helpers.cellValue(board, clue.unshaded);
            return !shaded || !unshaded || shaded > unshaded;
        });
    };
});
