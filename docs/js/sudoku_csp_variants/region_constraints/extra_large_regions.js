(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("extraLargeRegions", {
        validatePartial: function(board, cells, helpers) {
            var counts = {};
            for (var index = 0; index < cells.length; index++) {
                var value = helpers.cellValue(board, cells[index]);
                if (!value) continue;
                counts[value] = (counts[value] || 0) + 1;
                if (counts[value] > 2) return false;
            }
            return true;
        },
        validateComplete: function(board, cells, helpers) {
            var counts = {};
            for (var index = 0; index < cells.length; index++) {
                var value = helpers.cellValue(board, cells[index]);
                counts[value] = (counts[value] || 0) + 1;
            }
            for (var i = 1; i <= helpers.size; i++) {
                if (counts[i] !== 2) return false;
            }
            return true;
        }
    });
    };
});
