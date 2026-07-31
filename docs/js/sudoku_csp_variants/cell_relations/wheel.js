(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCellRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installWheel(family) {
        family.register("wheel", function(board, clue, helpers) {
            var values = clue.cells.map(function(cell) { return helpers.cellValue(board, cell); });
            for (var rotation = 0; rotation < 4; rotation++) {
                var possible = true;
                for (var index = 0; index < 4; index++) {
                    if (values[index] && values[index] !== clue.digits[(index + rotation) % 4]) {
                        possible = false;
                    }
                }
                if (possible) return true;
            }
            return false;
        });
    };
});
