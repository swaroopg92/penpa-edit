(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPOutsideRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installOutsideRelation(family) {
        function validate(board, clue, helpers) {
            var values = clue.cells.map(function(cell) {
                return helpers.cellValue(board, cell);
            });

            if (clue.value < 1 || clue.value >= values.length) return false;
            var parityPrefix = values.slice(0, clue.value);
            var assignedParity = parityPrefix.filter(Boolean);
            if (assignedParity.length > 1 && assignedParity.some(function(value) {
                return value % 2 !== assignedParity[0] % 2;
            })) return false;
            return !values[clue.value] || !assignedParity.length ||
                values[clue.value] % 2 !== assignedParity[0] % 2;
        }

        family.register("outsideparity", validate);
    };
});
