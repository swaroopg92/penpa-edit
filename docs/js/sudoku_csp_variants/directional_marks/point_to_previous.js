(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPDirectionalMarks);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installPointToPrevious(family) {
        family.register("pointtoprevious", function(board, clue, helpers) {
            var origin = helpers.cellValue(board, clue.origin);
            if (!origin) return true;
            var wanted = origin - 1;
            if (wanted < 1) return false;
            return (clue.targets || []).some(function(cell) {
                var value = helpers.cellValue(board, cell);
                return !value || value === wanted;
            });
        });
    };
});
