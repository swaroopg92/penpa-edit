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

            var medianValues = values.slice(0, 3);
            return medianValues.some(function(value) { return !value; }) ||
                medianValues.slice().sort(function(a, b) { return a - b; })[1] === clue.value;
        }

        family.register("median", validate);
    };
});
