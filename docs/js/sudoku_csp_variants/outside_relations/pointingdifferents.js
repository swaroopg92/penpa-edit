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

            var uniqueVals = new Set(values.filter(Boolean));
            var blanks = values.filter(function(v) { return !v; }).length;
            return uniqueVals.size <= clue.value && uniqueVals.size + blanks >= clue.value;
        }

        family.register("pointingdifferents", validate);
    };
});
