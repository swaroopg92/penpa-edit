(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCellRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installSlotMachine(family) {
        family.register("slotmachine", function(board, clue, helpers) {
            var columns = clue.columns || [];
            if (columns.length < 2) return true;
            var reference = columns[0].map(function(cell) { return helpers.cellValue(board, cell); });
            return columns.slice(1).every(function(column) {
                var values = column.map(function(cell) { return helpers.cellValue(board, cell); });
                for (var shift = 0; shift < helpers.size; shift++) {
                    var compatible = true;
                    for (var row = 0; row < helpers.size; row++) {
                        if (reference[row] && values[(row + shift) % helpers.size] &&
                            reference[row] !== values[(row + shift) % helpers.size]) compatible = false;
                    }
                    if (compatible) return true;
                }
                return false;
            });
        });
    };
});
