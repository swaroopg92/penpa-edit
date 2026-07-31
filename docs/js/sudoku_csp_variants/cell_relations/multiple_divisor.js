(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCellRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installMultipleDivisor(family) {
        family.register("multipledivisor", function(board, clue, helpers) {
            var values = clue.groups.map(function(group) {
                if (group.some(function(cell) { return !helpers.cellValue(board, cell); })) return 0;
                return Number(group.map(function(cell) {
                    return helpers.cellValue(board, cell);
                }).join(""));
            });
            if (values.some(function(value) { return !value; })) return true;
            return values.every(function(value, index) {
                return !index || value % values[0] === 0 || values[0] % value === 0;
            });
        });
    };
});
