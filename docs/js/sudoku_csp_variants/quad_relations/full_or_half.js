(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPQuadRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installFullOrHalf(family) {
        family.register("fullorhalf", function(board, clue, helpers) {
            var values = clue.cells.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            var assigned = values.filter(Boolean);
            var oddCount = assigned.filter(function(value) {
                return value % 2 === 1;
            }).length;
            var openCount = values.length - assigned.length;
            if (clue.kind === "circle") {
                var allOddPossible = oddCount === assigned.length;
                var allEvenPossible = oddCount === 0;
                return allOddPossible || allEvenPossible ||
                    openCount > 0 && (allOddPossible || allEvenPossible);
            }
            return oddCount <= 2 && oddCount + openCount >= 2;
        });
    };
});
