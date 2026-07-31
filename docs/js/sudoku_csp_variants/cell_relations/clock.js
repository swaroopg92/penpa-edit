(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCellRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installClock(family) {
        family.register("clock", function(board, clue, helpers) {
            var digits = clue.cells.map(function(cell) { return helpers.cellValue(board, cell); });
            if (digits.some(function(value) { return !value; })) return true;
            return digits[0] * 10 + digits[1] < 24 && digits[2] * 10 + digits[3] < 60;
        });
    };
});
