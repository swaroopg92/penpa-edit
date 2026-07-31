(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("scatteredAllDifferent", {
        validatePartial: function(board, cells, helpers) {
            var seen = 0;
            for (var index = 0; index < cells.length; index++) {
                var value = helpers.cellValue(board, cells[index]);
                if (!value) continue;
                var bit = 1 << value;
                if (seen & bit) return false;
                seen |= bit;
            }
            return true;
        }
    });
    };
});
