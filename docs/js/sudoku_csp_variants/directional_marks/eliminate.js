(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPDirectionalMarks);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installEliminate(family) {
        family.register("eliminate", function(board, clue, helpers) {
            var origin = helpers.cellValue(board, clue.origin);
            return !origin || (clue.targets || []).every(function(cell) {
                var value = helpers.cellValue(board, cell);
                return !value || value !== origin;
            });
        });
    };
});
