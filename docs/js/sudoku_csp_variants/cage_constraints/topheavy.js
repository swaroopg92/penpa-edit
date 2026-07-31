(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("topheavy", {
        validatePartial: function(board, helpers) {
            for (var c = 0; c < helpers.size; c++) {
                for (var r = 0; r < helpers.size - 1; r++) {
                    var top = helpers.cellValue(board, { row: r, col: c });
                    var bottom = helpers.cellValue(board, { row: r + 1, col: c });
                    if (top && bottom && top >= 1 && top <= 7 && bottom >= 1 && bottom <= 7 && top <= bottom) {
                        return false;
                    }
                }
            }
            return true;
        }
    });
    };
});
