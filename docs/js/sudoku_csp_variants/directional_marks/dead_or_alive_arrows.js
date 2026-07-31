(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPDirectionalMarks);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installDeadOrAliveArrows(family) {
        family.register("deadoralivearrows", function(board, clue, helpers) {
            var origin = helpers.cellValue(board, clue.origin);
            if (!origin) return true;
            var targetValues = (clue.targets || []).map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            if (clue.isWhite) {
                return targetValues.every(function(value) {
                    return !value || value !== origin;
                });
            }
            var isComplete = targetValues.every(function(value) { return !!value; });
            var hasMatch = targetValues.some(function(value) { return value === origin; });
            return !isComplete || hasMatch;
        });
    };
});
