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

            var productValues = values.slice(0, 3);
            var product = productValues.reduce(function(total, value) { return total * (value || 1); }, 1);
            var productOpen = productValues.filter(function(value) { return !value; }).length;
            return product <= clue.value && clue.value % product === 0 && (productOpen > 0 || product === clue.value);
        }

        family.register("productframe", validate);
    };
});
