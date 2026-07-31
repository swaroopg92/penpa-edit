(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPEdgeRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installBlockSumRelations(family) {
        family.register("blocksumrelations", function(board, clue, helpers) {
            var groupValues = (clue.groups || []).map(function(group) {
                var values = group.map(function(cell) {
                    return helpers.cellValue(board, cell);
                });
                if (values.some(function(value) { return !value; })) return null;
                return values.reduce(function(total, value) {
                    return total + (board.isZeroEight ? value - 1 : value);
                }, 0);
            });
            return groupValues.indexOf(null) !== -1 ||
                (clue.sign === "<" ? groupValues[0] < groupValues[1] :
                    groupValues[0] > groupValues[1]);
        });
    };
});
