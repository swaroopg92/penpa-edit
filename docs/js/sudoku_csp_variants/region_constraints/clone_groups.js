(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("cloneGroups", {
        validatePartial: function(board, cells, helpers) {
            var value = 0;
            for (var index = 0; index < cells.length; index++) {
                var current = helpers.cellValue(board, cells[index]);
                if (!current) continue;
                if (value && current !== value) return false;
                value = current;
            }
            return true;
        }
    });
    };
});
