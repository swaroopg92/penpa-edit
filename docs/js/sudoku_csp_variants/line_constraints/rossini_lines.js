(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("rossiniLines", {
        validatePartial: function(board, clue, helpers) {
            var values = clue.cells.map(function(cell) { return helpers.cellValue(board, cell); });
            if (values.some(function(value) { return !value; })) return true;
            var ascending = values[0] < values[1] && values[1] < values[2];
            var descending = values[0] > values[1] && values[1] > values[2];
            if (clue.direction === "ascending") return ascending;
            if (clue.direction === "descending") return descending;
            return !ascending && !descending;
        }
    });
    };
});
