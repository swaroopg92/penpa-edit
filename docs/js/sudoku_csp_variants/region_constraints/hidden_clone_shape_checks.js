(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("hiddenCloneShapeChecks", {
        validatePartial: function(helpers) { return true; },
        validateComplete: function(board, check, helpers) {
            var component = check.component;
            var assigned = [];
            for (var i = 0; i < component.length; i++) {
                assigned.push(helpers.cellValue(board, component[i]));
            }

            for (var dr = -helpers.size + 1; dr < helpers.size; dr++) {
                for (var dc = -helpers.size + 1; dc < helpers.size; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    var match = true;
                    for (var i = 0; i < component.length; i++) {
                        var cell = component[i];
                        var tr = cell.row + dr, tc = cell.col + dc;
                        if (tr < 0 || tr >= helpers.size || tc < 0 || tc >= helpers.size) {
                            match = false;
                            break;
                        }
                        var tval = helpers.cellValue(board, { row: tr, col: tc });
                        if (tval !== assigned[i]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) return true;
                }
            }
            return false;
        }
    });
    };
});
