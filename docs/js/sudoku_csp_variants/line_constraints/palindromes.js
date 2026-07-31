(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("palindromes", {
        validatePartial: function(board, path, helpers) {
            for (var i = 0; i < Math.floor(path.length / 2); i++) {
                var first = helpers.cellValue(board, path[i]);
                var second = helpers.cellValue(board, path[path.length - 1 - i]);
                if (first && second && first !== second) {
                    return false;
                }
            }
            return true;
        }
    });
    };
});
