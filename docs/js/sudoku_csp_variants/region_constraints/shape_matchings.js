(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("shapeMatchings", {
        validatePartial: function(board, matchings, helpers) {
            if (!matchings || matchings.length === 0) return false;
            for (var m = 0; m < matchings.length; m++) {
                var matching = matchings[m];
                var possible = true;
                for (var i = 0; i < matching.length; i++) {
                    var req = matching[i];
                    var val = helpers.cellValue(board, { row: req.row, col: req.col });
                    if (val && val !== req.digit) {
                        possible = false;
                        break;
                    }
                }
                if (possible) return true;
            }
            return false;
        }
    });
    };
});
