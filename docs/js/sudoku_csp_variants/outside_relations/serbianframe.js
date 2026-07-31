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

            var serbianIndexes = clue.axis === "row" ? [1, 2] : [2, 3];
            var serbianValues = serbianIndexes.map(function(index) { return values[index]; });
            return serbianValues.some(function(value) { return !value; }) ||
                serbianValues[0] + serbianValues[1] === clue.value;
        }

        family.register("serbianframe", validate);
    };
});
