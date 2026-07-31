(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("shadedParityGroups", {
        validatePartial: function(board, cells, helpers) {
            var parity = null;
            for (var index = 0; index < cells.length; index++) {
                var value = helpers.cellValue(board, cells[index]);
                if (!value) continue;
                if (parity === null) parity = value % 2;
                else if (value % 2 !== parity) return false;
            }
            return true;
        }
    });
    };
});
