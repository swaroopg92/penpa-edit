(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("regionCoverage", {
        validatePartial: function(board, cells, helpers) {
            var seen = 0;
            var blanks = 0;
            for (var index = 0; index < cells.length; index++) {
                var value = helpers.cellValue(board, cells[index]);
                if (value) seen |= 1 << value;
                else blanks++;
            }
            var missing = helpers.countBits(helpers.allDigitsMask & ~seen);
            return missing <= blanks;
        },
        validateComplete: function(board, cells, helpers) {
            var seen = 0;
            for (var index = 0; index < cells.length; index++) seen |= 1 << helpers.cellValue(board, cells[index]);
            return (seen & helpers.allDigitsMask) === helpers.allDigitsMask;
        }
    });
    };
});
