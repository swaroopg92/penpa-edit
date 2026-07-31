(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCellRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installPinnochio(family) {
        family.register("pinnochio", function(board, clue, helpers) {
            var mismatches = 0;
            var open = 0;
            (clue.clues || []).forEach(function(item) {
                var value = helpers.cellValue(board, item.cell);
                if (!value) open++;
                else if (value !== item.value) mismatches++;
            });
            return mismatches <= 1 && (mismatches === 1 || open > 0);
        });
    };
});
