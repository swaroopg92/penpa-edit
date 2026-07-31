(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("difference2Neighbours", {
        validatePartial: function(board, cells, helpers) {
            for (var index = 0; index < cells.length; index++) {
                var cell = cells[index];
                var value = helpers.cellValue(board, cell);
                if (!value) continue;
                var hasDiff2 = false;
                var hasBlank = false;
                var neighborOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                for (var i = 0; i < neighborOffsets.length; i++) {
                    var nr = cell.row + neighborOffsets[i][0];
                    var nc = cell.col + neighborOffsets[i][1];
                    if (nr >= 0 && nr < helpers.size && nc >= 0 && nc < helpers.size) {
                        var nVal = helpers.cellValue(board, { row: nr, col: nc });
                        if (!nVal) {
                            hasBlank = true;
                        } else if (Math.abs(value - nVal) === 2) {
                            hasDiff2 = true;
                            break;
                        }
                    }
                }
                if (!hasDiff2 && !hasBlank) return false;
            }
            return true;
        }
    });
    };
});
