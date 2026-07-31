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

            if (clue.relation === "little killer") {
                var littleSum = values.reduce(function(total, value) { return total + (board.isZeroEight ? value - 1 : value); }, 0);
                var littleBlanks = values.filter(function(value) { return !value; }).length;
                return littleSum <= clue.value && littleSum + littleBlanks * helpers.size >= clue.value &&
                    (littleBlanks > 0 || littleSum === clue.value);
            }
            var littleProduct = values.reduce(function(total, value) { return total * (value || 1); }, 1);
            var productBlanks = values.filter(function(value) { return !value; }).length;
            return littleProduct <= clue.value && clue.value % littleProduct === 0 &&
                (productBlanks > 0 || littleProduct === clue.value);
        }

        ["little killer","product little killer"].forEach(function(relation) {
            family.register(relation, validate);
        });
    };
});
