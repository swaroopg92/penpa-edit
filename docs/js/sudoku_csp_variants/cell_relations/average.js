(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCellRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installAverage(family) {
        family.register("average", function(board, clue, helpers) {
            var center = helpers.cellValue(board, clue.center);
            var ends = clue.ends.map(function(cell) { return helpers.cellValue(board, cell); });
            if (!center || !ends[0] || !ends[1]) return true;
            var isAverage = center * 2 === ends[0] + ends[1];
            return clue.marked ? isAverage : !isAverage;
        });
    };
});
