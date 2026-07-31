(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCellRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installCodedPairs(family) {
        family.register("codedpairs", function(board, clue, helpers) {
            var pairValues = (clue.pairs || []).map(function(pair) {
                var values = pair.map(function(cell) { return helpers.cellValue(board, cell); });
                return values.some(function(value) { return !value; }) ? null :
                    values.slice().sort().join(":");
            });
            var completePairs = pairValues.filter(function(value) { return value !== null; });
            return completePairs.length < 2 ||
                completePairs.every(function(value) { return value === completePairs[0]; });
        });
    };
});
