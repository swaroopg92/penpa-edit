(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("almostPalindromes", {
        validatePartial: function(board, path, helpers) {
            var values = path.map(function(cell) { return helpers.cellValue(board, cell); });
            var N = values.length;
            var mismatches = 0;
            for (var i = 0; i < Math.floor(N / 2); i++) {
                var a = values[i];
                var b = values[N - 1 - i];
                if (a && b && a !== b) {
                    mismatches++;
                }
            }
            return mismatches <= 1;
        },
        validateComplete: function(board, path, helpers) {
            var values = path.map(function(cell) { return helpers.cellValue(board, cell); });
            var N = values.length;
            var mismatches = 0;
            for (var i = 0; i < Math.floor(N / 2); i++) {
                var a = values[i];
                var b = values[N - 1 - i];
                if (a !== b) {
                    mismatches++;
                }
            }
            return mismatches === 1;
        }
    });
    };
});
