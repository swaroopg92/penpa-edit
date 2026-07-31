(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPQuadRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installGroupSum(family) {
        family.register("groupsum", function(board, clue, helpers) {
            var values = clue.cells.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            var assigned = values.filter(Boolean);
            var sum = assigned.reduce(function(total, value) {
                return total + value;
            }, 0);
            var open = values.length - assigned.length;
            return sum <= clue.total && sum + open * board.length >= clue.total &&
                (open > 0 || sum === clue.total);
        });
    };
});
