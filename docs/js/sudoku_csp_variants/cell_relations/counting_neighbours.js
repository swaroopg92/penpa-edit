(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCellRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    function countDistinct(values) {
        return values.filter(function(value, index, all) {
            return all.indexOf(value) === index;
        }).length;
    }

    return function installCountingNeighbours(family) {
        family.register("countingneighbours", function(board, clue, helpers) {
            var value = helpers.cellValue(board, clue.cell);
            if (!value) return true;
            var diagonals = clue.diagonals.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            var orthogonals = clue.orthogonals.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            if (diagonals.indexOf(0) !== -1 || orthogonals.indexOf(0) !== -1) return true;

            var satisfiesCircle = value === countDistinct(diagonals.concat(orthogonals));
            var satisfiesCross = value === countDistinct(diagonals);
            if (clue.kind === "circle") return satisfiesCircle;
            if (clue.kind === "cross") return satisfiesCross && !satisfiesCircle;
            return !satisfiesCircle && !satisfiesCross;
        });
    };
});
