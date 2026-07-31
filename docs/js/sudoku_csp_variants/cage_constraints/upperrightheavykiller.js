(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("upperrightheavykiller", {
        validatePartial: function(board, constraint, helpers) {
            var urCages = constraint;
            for (var r = 0; r < helpers.size; r++) {
                for (var c = 0; c < helpers.size; c++) {
                    var cellVal = helpers.cellValue(board, { row: r, col: c });
                    if (!cellVal) continue;

                    if (r > 0 && c < helpers.size - 1) {
                        var urVal = helpers.cellValue(board, { row: r - 1, col: c + 1 });
                        if (!urVal) continue;
                        var cageTotal = urCages[r + "," + c];

                        if (cellVal < urVal) {
                            if (cageTotal === undefined) return false;
                            if (cellVal + urVal !== cageTotal) return false;
                        } else {
                            if (cageTotal !== undefined) return false;
                        }
                    }
                }
            }
            return true;
        }
    });
    };
});
