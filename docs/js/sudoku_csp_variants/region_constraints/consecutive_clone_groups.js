(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    function consecutiveSetValid(board, cells, allowEqual, helpers) {
        var values = [];
        var seen = 0;
        for (var index = 0; index < cells.length; index++) {
            var value = helpers.cellValue(board, cells[index]);
            if (!value) continue;
            var bit = 1 << value;
            if (!allowEqual && (seen & bit)) return false;
            seen |= bit;
            values.push(value);
        }
        if (values.length < 2) return true;
        return Math.max.apply(null, values) - Math.min.apply(null, values) <= cells.length - 1;
    }

    return function installConstraint(csp) {
        csp.registerConstraint("consecutiveCloneGroups", {
        validatePartial: function(board, cells, helpers) {
            return consecutiveSetValid(board, cells, false, helpers);
        },
        validateComplete: function(board, cells, helpers) {
            var values = cells.map(function(cell) { return helpers.cellValue(board, cell); });
            return consecutiveSetValid(board, cells, false, helpers) &&
                Math.max.apply(null, values) - Math.min.apply(null, values) === cells.length - 1;
        }
    });
    };
});
