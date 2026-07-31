(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installTouchyCells(csp) {
        if (!csp || typeof csp.registerConstraint !== "function") {
            throw new Error("touchyCells requires SudokuCSP.registerConstraint");
        }
        csp.registerConstraint("touchyCells", {
            validatePartial: function(board, item, helpers) {
                var value = helpers.cellValue(board, item.cell);
                if (!value) return true;
                var open = false;
                for (var index = 0; index < item.neighbors.length; index++) {
                    var neighbor = helpers.cellValue(board, item.neighbors[index]);
                    if (!neighbor) open = true;
                    else if (Math.abs(value - neighbor) === 1) return true;
                }
                return open;
            }
        });
    };
});
