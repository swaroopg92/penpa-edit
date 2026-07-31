(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPDirectionalMarks);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installQuadMax(family) {
        family.register("quadmax", function(board, clue, helpers) {
            var target = helpers.cellValue(board, clue.target);
            if (!target) return true;
            return clue.cells.every(function(cell) {
                var value = helpers.cellValue(board, cell);
                if (!value || cell.row === clue.target.row && cell.col === clue.target.col) {
                    return true;
                }
                return target > value;
            });
        });
    };
});
